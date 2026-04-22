import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { fsGet } from "@/lib/firestoreRest";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const doc = await fsGet("jobs", id, session.token);

  if (!doc.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (doc.data.userId !== session.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const d = doc.data;
  return NextResponse.json({
    job: {
      id,
      status: d.status,
      mode: d.mode,
      model: d.model,
      prompt: d.prompt,
      negativePrompt: d.negativePrompt ?? null,
      inputImagePath: d.inputImagePath ?? null,
      outputImagePath: d.outputImagePath ?? null,
      costCredits: d.costCredits,
      error: d.error ?? null,
      createdAt: d.createdAt ?? new Date().toISOString(),
      updatedAt: d.updatedAt ?? new Date().toISOString(),
    },
  });
}
