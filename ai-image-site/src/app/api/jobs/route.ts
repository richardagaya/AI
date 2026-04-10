import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const jobs = await prisma.generationJob.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      status: true,
      mode: true,
      model: true,
      prompt: true,
      outputImagePath: true,
      costCredits: true,
      error: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ jobs });
}

