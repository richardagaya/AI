import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { fsQuery } from "@/lib/firestoreRest";
import { settleRunningJob } from "@/lib/settleJob";

function mapJob(id: string, d: Record<string, unknown>) {
  return {
    id,
    status: d.status,
    mode: d.mode,
    model: d.model,
    prompt: d.prompt,
    outputImagePath: d.outputImagePath ?? null,
    outputUrl: d.outputUrl ?? null,
    outputKind: d.outputKind ?? null,
    kind: d.kind ?? null,
    aspect: d.aspect ?? null,
    duration: d.duration ?? null,
    influencerId: d.influencerId ?? null,
    lookId: d.lookId ?? null,
    costCredits: d.costCredits,
    error: d.error ?? null,
    createdAt: d.createdAt ?? new Date().toISOString(),
  };
}

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

  const jobs = await Promise.all(
    docs.map(async ({ id, data }) => {
      const settled = await settleRunningJob(id, data);
      return mapJob(id, settled);
    }),
  );

  return NextResponse.json({ jobs });
}
