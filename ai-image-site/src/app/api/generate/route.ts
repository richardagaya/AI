import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { fsCreateJobTx } from "@/lib/firestoreRest";
import { isPromptDisallowed } from "@/lib/moderation";
import { saveUploadedFile } from "@/lib/storage";

const COST_TEXT2IMG = 1;
const COST_IMG2IMG = 2;

export async function POST(req: Request) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const prompt = String(form.get("prompt") ?? "").trim();
  const negativePrompt = String(form.get("negativePrompt") ?? "").trim() || null;
  const mode = String(form.get("mode") ?? "text2img");
  const model = String(form.get("model") ?? "default");

  const file = form.get("image");
  const imageFile = file instanceof File ? file : null;

  if (!prompt) return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  if (prompt.length > 2000) return NextResponse.json({ error: "Prompt too long" }, { status: 400 });
  if (isPromptDisallowed(prompt)) return NextResponse.json({ error: "Prompt not allowed" }, { status: 400 });
  if (mode !== "text2img" && mode !== "img2img") {
    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  }
  if (mode === "img2img" && !imageFile) {
    return NextResponse.json({ error: "Image is required for img2img" }, { status: 400 });
  }
  if (imageFile && imageFile.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "Image too large (max 8MB)" }, { status: 400 });
  }
  if (imageFile && !["image/png", "image/jpeg", "image/webp"].includes(imageFile.type)) {
    return NextResponse.json({ error: "Unsupported image type" }, { status: 400 });
  }

  const costCredits = mode === "img2img" ? COST_IMG2IMG : COST_TEXT2IMG;

  // Save upload before the transaction (async I/O not allowed inside Firestore tx)
  const upload = imageFile && mode === "img2img" ? await saveUploadedFile(imageFile) : null;

  const jobId = crypto.randomUUID();
  const now = new Date().toISOString();

  try {
    await fsCreateJobTx(
      session.userId,
      jobId,
      {
        userId: session.userId,
        status: "pending",
        mode,
        model,
        prompt,
        negativePrompt,
        inputImagePath: upload?.fullPath ?? null,
        outputImagePath: null,
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
