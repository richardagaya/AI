import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const job = await prisma.generationJob.findFirst({
    where: { id, userId: session.userId },
    select: {
      id: true,
      status: true,
      mode: true,
      model: true,
      prompt: true,
      negativePrompt: true,
      inputImagePath: true,
      outputImagePath: true,
      costCredits: true,
      error: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ job });
}

