import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getSession } from "@/lib/auth";
import { fsGet } from "@/lib/firestoreRest";

const CONTENT_TYPE_BY_EXT: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
};

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
  const outputUrl = (d.outputUrl as string | null) ?? null;
  if (
    d.userId !== session.userId ||
    d.status !== "succeeded" ||
    (!d.outputImagePath && !outputUrl)
  ) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // R2-backed outputs: the browser fetches the file straight from the CDN edge.
  if (outputUrl) {
    return NextResponse.redirect(outputUrl, {
      headers: { "Cache-Control": "private, no-store" },
    });
  }

  // Legacy local-disk outputs
  const outputPath = d.outputImagePath as string;
  const bytes = await readFile(outputPath);
  const contentType =
    CONTENT_TYPE_BY_EXT[path.extname(outputPath).toLowerCase()] ??
    (d.outputKind === "video" ? "video/mp4" : "image/png");

  return new NextResponse(bytes, {
    headers: { "Content-Type": contentType, "Cache-Control": "no-store" },
  });
}
