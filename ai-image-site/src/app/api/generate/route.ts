import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { isPromptDisallowed } from "@/lib/moderation";
import { saveUploadedFile } from "@/lib/storage";

const COST_TEXT2IMG = 1;
const COST_IMG2IMG = 2;

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const prompt = String(form.get("prompt") ?? "").trim();
  const negativePrompt = String(form.get("negativePrompt") ?? "").trim() || null;
  const mode = String(form.get("mode") ?? "text2img");
  const model = String(form.get("model") ?? "default");

  const file = form.get("image");
  const imageFile = file instanceof File ? file : null;

  if (!prompt) return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  if (prompt.length > 2000) {
    return NextResponse.json({ error: "Prompt too long" }, { status: 400 });
  }
  if (isPromptDisallowed(prompt)) {
    return NextResponse.json({ error: "Prompt not allowed" }, { status: 400 });
  }

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

  try {
    const created = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: session.userId },
        select: { id: true, creditBalance: true },
      });
      if (!user) throw new Error("USER_NOT_FOUND");
      if (user.creditBalance < costCredits) throw new Error("INSUFFICIENT_CREDITS");

      const upload =
        imageFile && mode === "img2img" ? await saveUploadedFile(imageFile) : null;

      const job = await tx.generationJob.create({
        data: {
          userId: user.id,
          mode,
          model,
          prompt,
          negativePrompt,
          inputImagePath: upload?.fullPath ?? null,
          costCredits,
        },
        select: { id: true, status: true, costCredits: true, createdAt: true },
      });

      await tx.user.update({
        where: { id: user.id },
        data: { creditBalance: { decrement: costCredits } },
      });

      await tx.creditLedgerEntry.create({
        data: {
          userId: user.id,
          delta: -costCredits,
          reason: "generation",
          jobId: job.id,
        },
      });

      return job;
    });

    return NextResponse.json({ job: created });
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

