import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getSession } from "@/lib/auth";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { fsGet } from "@/lib/firestoreRest";

const CONTENT_TYPE_BY_EXT: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
};

async function loadJob(
  id: string,
  req: Request,
): Promise<Record<string, unknown> | null> {
  const adminDb = getAdminDb();
  if (adminDb) {
    const snap = await adminDb.collection("jobs").doc(id).get();
    return snap.exists ? (snap.data() ?? {}) : null;
  }
  const session = await getSession(req);
  if (!session) return null;
  const doc = await fsGet("jobs", id, session.token);
  if (!doc.exists || doc.data.userId !== session.userId) return null;
  return doc.data;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const d = await loadJob(id, req);

  if (!d) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const outputUrl = (d.outputUrl as string | null) ?? null;
  if (d.status !== "succeeded" || (!d.outputImagePath && !outputUrl)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Public CDN URL — <img> / <video> cannot send the auth header.
  if (outputUrl) {
    return NextResponse.redirect(outputUrl, {
      headers: { "Cache-Control": "public, max-age=31536000, immutable" },
    });
  }

  const session = await getSession(req);
  if (!session || d.userId !== session.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const outputPath = d.outputImagePath as string;
  const bytes = await readFile(outputPath);
  const contentType =
    CONTENT_TYPE_BY_EXT[path.extname(outputPath).toLowerCase()] ??
    (d.outputKind === "video" ? "video/mp4" : "image/png");

  return new NextResponse(bytes, {
    headers: { "Content-Type": contentType, "Cache-Control": "no-store" },
  });
}
