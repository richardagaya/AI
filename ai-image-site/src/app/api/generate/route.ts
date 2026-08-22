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

/**
 * fal will not deliver webhooks to loopback. When BASE_URL is public we
 * enqueue and return; locally we wait in this request instead.
 */
function publicWebhookUrl(jobId: string): string | null {
  let url: URL;
  try {
    url = new URL("/api/fal/webhook", env.BASE_URL);
  } catch {
    return null;
  }
  const host = url.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local")
  ) {
    return null;
  }
  url.searchParams.set("jobId", jobId);
  return url.href;
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

  const resolvedPrompt = prompt || (model.imageOnly ? "remove background" : "");
  if (!resolvedPrompt) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }
  if (model.imageOnly && !imageFile) {
    return NextResponse.json({ error: "Upload an image to run this tool" }, { status: 400 });
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
    if (msg === "INSUFFICIENT_CREDITS") {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
    }
    if (msg === "USER_NOT_FOUND") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
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

  const webhookUrl = publicWebhookUrl(jobId);

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
