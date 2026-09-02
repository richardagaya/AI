import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAdminDb, getAdminInitError } from "@/lib/firebaseAdmin";
import type { InfluencerPhoto } from "@/lib/influencers";

type Ctx = { params: Promise<{ id: string; index: string }> };

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export async function GET(req: Request, ctx: Ctx) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getAdminDb();
  if (!db) {
    return NextResponse.json(
      { error: `Firebase Admin is not configured (${getAdminInitError() || "unknown"}).` },
      { status: 501 },
    );
  }

  const { id, index } = await ctx.params;
  const i = Number(index);
  if (!Number.isInteger(i) || i < 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const snap = await db.collection("influencers").doc(id).get();
  if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const data = snap.data() ?? {};
  if (data.userId !== session.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const photos = (Array.isArray(data.photos) ? data.photos : []) as InfluencerPhoto[];
  const photo = photos[i];
  if (!photo) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (photo.url) return NextResponse.redirect(photo.url);
  if (!photo.path) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const bytes = await readFile(photo.path);
  const ext = path.extname(photo.path).toLowerCase();
  return new NextResponse(bytes, {
    headers: {
      "Content-Type": MIME[ext] ?? "application/octet-stream",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
