import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { fsCreateJobTx } from "@/lib/firestoreRest";
import { isPromptDisallowed } from "@/lib/moderation";
import { saveUploadedFile } from "@/lib/storage";
import {
  costFor,
  getModel,
  modelSupportsImageInput,
  resolveAspect,
  resolveDuration,
} from "@/lib/fal-models";

export async function POST(req: Request) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
  if (!prompt) return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  if (prompt.length > 2000) return NextResponse.json({ error: "Prompt too long" }, { status: 400 });
  if (isPromptDisallowed(prompt)) return NextResponse.json({ error: "Prompt not allowed" }, { status: 400 });

  const model = getModel(modelId);
  if (!model || model.kind !== kind) {
    return NextResponse.json({ error: "Unknown model" }, { status: 400 });
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

  // Save upload before the transaction (async I/O not allowed inside Firestore tx)
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
        prompt,
        negativePrompt,
        aspect,
        duration: durationSeconds ? String(durationSeconds) : null,
        camera: kind === "video" ? camera : null,
        strength,
        inputImagePath: upload?.fullPath ?? null,
        outputImagePath: null,
        outputKind: null,
        costCredits,
        error: null,
        createdAt: now,
        updatedAt: now,
      },
      costCredits,
      session.token,
    );

    return NextResponse.json({ job: { id: jobId, status: "pending", costCredits, createdAt: now } });
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
}
