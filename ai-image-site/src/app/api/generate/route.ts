import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { getSession } from "@/lib/auth";
import { fsCreateJobTx, fsUpdate } from "@/lib/firestoreRest";
import {
  prepareFalJob,
  submitFalJob,
  waitForFalJob,
} from "@/lib/fal";
import { jobFailedFields, jobSucceededFields } from "@/lib/jobResult";
import { isPromptDisallowed } from "@/lib/moderation";
import { saveUploadedFile } from "@/lib/storage";
import {
  costFor,
  getModel,
  modelSupportsImageInput,
  resolveAspect,
  resolveDuration,
} from "@/lib/fal-models";

export const maxDuration = 60;

function isLoopbackHost(host: string): boolean {
  const h = host.toLowerCase();
  return (
    h === "localhost" ||
    h === "127.0.0.1" ||
    h.endsWith(".localhost") ||
    h.endsWith(".local")
  );
}

/**
 * fal will not follow apex→www redirects, and will not deliver to loopback.
 * Prefer the host that actually handled this request (studio.*) over BASE_URL,
 * which is often the marketing apex and 308s away.
 */
function publicWebhookUrl(req: Request, jobId: string): string | null {
  const forwarded = req.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwarded || req.headers.get("host") || "";
  const hostname = host.replace(/:\d+$/, "");
  if (hostname && isLoopbackHost(hostname)) return null;

  const proto =
    req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || "https";
  const bases = [
    host ? `${proto}://${host}` : "",
    env.NEXT_PUBLIC_STUDIO_URL,
    env.BASE_URL,
  ].filter(Boolean);

  for (const base of bases) {
    let url: URL;
    try {
      url = new URL("/api/fal/webhook", base);
    } catch {
      continue;
    }
    if (isLoopbackHost(url.hostname)) continue;
    // Vercel 308s example.com → www.example.com; fal drops the POST.
    if (url.hostname.split(".").length === 2 && !/^\d/.test(url.hostname)) {
      url.hostname = `www.${url.hostname}`;
    }
    url.searchParams.set("jobId", jobId);
    return url.href;
  }
  return null;
}

export async function POST(req: Request) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!env.FAL_KEY) {
    return NextResponse.json(
      { error: "Generation is not configured (missing FAL_KEY)" },
      { status: 501 },
    );
  }

  const form = await req.formData();
  const prompt = String(form.get("prompt") ?? "").trim();
  const negativePrompt = String(form.get("negativePrompt") ?? "").trim() || null;
  const kind = String(form.get("kind") ?? "image");
  const modelId = String(form.get("model") ?? "");
  const aspectRaw = String(form.get("aspect") ?? "");
  const durationRaw = String(form.get("duration") ?? "");
  const camera = String(form.get("camera") ?? "").trim() || null;
  const strengthRaw = Number(form.get("strength") ?? NaN);

  const file = form.get("image");
  const imageFile = file instanceof File ? file : null;

  if (kind !== "image" && kind !== "video") {
    return NextResponse.json({ error: "Invalid generation kind" }, { status: 400 });
  }

  const model = getModel(modelId);
  if (!model || model.kind !== kind) {
    return NextResponse.json({ error: "Unknown model" }, { status: 400 });
  }

  const resolvedPrompt = prompt;
  if (!resolvedPrompt) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }
  if (resolvedPrompt.length > 2000) {
    return NextResponse.json({ error: "Prompt too long" }, { status: 400 });
  }
  if (isPromptDisallowed(resolvedPrompt)) {
    return NextResponse.json({ error: "Prompt not allowed" }, { status: 400 });
  }
  if (imageFile && !modelSupportsImageInput(model)) {
    return NextResponse.json(
      { error: `${model.label} doesn't accept image input` },
      { status: 400 },
    );
  }
  if (imageFile && imageFile.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "Image too large (max 8MB)" }, { status: 400 });
  }
  if (imageFile && !["image/png", "image/jpeg", "image/webp"].includes(imageFile.type)) {
    return NextResponse.json({ error: "Unsupported image type" }, { status: 400 });
  }

  const withImage = Boolean(imageFile);
  const mode =
    kind === "video"
      ? withImage
        ? "img2video"
        : "text2video"
      : withImage
        ? "img2img"
        : "text2img";

  const aspect = resolveAspect(model, aspectRaw);
  const durationSeconds =
    kind === "video" ? resolveDuration(model, Number(durationRaw) || model.durations?.[0] || 5) : null;
  const strength = Number.isFinite(strengthRaw)
    ? Math.min(1, Math.max(0.1, strengthRaw))
    : null;
  const costCredits = costFor(model, withImage);

  const upload = imageFile ? await saveUploadedFile(imageFile) : null;

  const jobId = crypto.randomUUID();
  const now = new Date().toISOString();

  try {
    await fsCreateJobTx(
      session.userId,
      jobId,
      {
        userId: session.userId,
        status: "pending",
        kind,
        mode,
        model: model.id,
        prompt: resolvedPrompt,
        negativePrompt,
        aspect,
        duration: durationSeconds ? String(durationSeconds) : null,
        camera: kind === "video" ? camera : null,
        strength,
        inputImagePath: upload?.fullPath ?? null,
        inputImageUrl: upload?.url ?? null,
        outputImagePath: null,
        outputUrl: null,
        outputKind: null,
        falRequestId: null,
        costCredits,
        error: null,
        createdAt: now,
        updatedAt: now,
      },
      costCredits,
      session.token,
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "UNKNOWN";
    console.error("[generate] create job failed", msg);
    if (msg === "INSUFFICIENT_CREDITS") {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
    }
    if (msg === "USER_NOT_FOUND") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const hint = msg.replace(/\s+/g, " ").slice(0, 220);
    return NextResponse.json(
      { error: hint ? `Failed to create job: ${hint}` : "Failed to create job" },
      { status: 500 },
    );
  }

  const prepared = await prepareFalJob(model, {
    prompt: resolvedPrompt,
    negativePrompt,
    aspect,
    duration: durationSeconds ?? undefined,
    camera,
    strength: strength ?? undefined,
    inputImagePath: upload?.fullPath,
    inputImageUrl: upload?.url,
  }).catch(async (e) => {
    await fsUpdate(
      "jobs",
      jobId,
      jobFailedFields(e instanceof Error ? e.message : "Failed to start generation"),
      session.token,
    ).catch(() => {});
    return null;
  });

  if (!prepared) {
    return NextResponse.json({ error: "Failed to start generation" }, { status: 502 });
  }

  const webhookUrl = publicWebhookUrl(req, jobId);

  try {
    if (webhookUrl) {
      const { requestId } = await submitFalJob(
        prepared.endpoint,
        prepared.input,
        webhookUrl,
      );
      await fsUpdate(
        "jobs",
        jobId,
        {
          status: "running",
          falRequestId: requestId,
          updatedAt: new Date().toISOString(),
        },
        session.token,
      );
    } else {
      const output = await waitForFalJob(
        prepared.endpoint,
        prepared.input,
        prepared.kind,
      );
      await fsUpdate("jobs", jobId, await jobSucceededFields(output), session.token);
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Generation failed";
    await fsUpdate("jobs", jobId, jobFailedFields(message), session.token).catch(
      () => {},
    );
    return NextResponse.json({ error: message }, { status: 502 });
  }

  return NextResponse.json({
    job: { id: jobId, status: webhookUrl ? "running" : "succeeded", costCredits, createdAt: now },
  });
}
