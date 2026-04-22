import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { fsQuery } from "@/lib/firestoreRest";

export async function GET(req: Request) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const docs = await fsQuery(
    "jobs",
    "userId",
    session.userId,
    "createdAt",
    "desc",
    50,
    session.token,
  );

  const jobs = docs.map(({ id, data: d }) => ({
    id,
    status: d.status,
    mode: d.mode,
    model: d.model,
    prompt: d.prompt,
    outputImagePath: d.outputImagePath ?? null,
    costCredits: d.costCredits,
    error: d.error ?? null,
    createdAt: d.createdAt ?? new Date().toISOString(),
  }));

  return NextResponse.json({ jobs });
}
