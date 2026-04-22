import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
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

  const d = doc.data;
  if (d.userId !== session.userId || d.status !== "succeeded" || !d.outputImagePath) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const bytes = await readFile(d.outputImagePath as string);
  return new NextResponse(bytes, {
    headers: { "Content-Type": "image/png", "Cache-Control": "no-store" },
  });
}
