import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
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
    where: { id, userId: session.userId, status: "succeeded" },
    select: { outputImagePath: true },
  });
  if (!job?.outputImagePath) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const bytes = await readFile(job.outputImagePath);
  return new NextResponse(bytes, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store",
    },
  });
}

