import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { env } from "@/lib/env";
import { getAdminDb, getAdminInitError } from "@/lib/firebaseAdmin";
import { saveUploadedFile } from "@/lib/storage";
import type { InfluencerPhoto, StudioInfluencer } from "@/lib/influencers";

const REQUIRED_PHOTOS = 1;
const ALLOWED = ["image/png", "image/jpeg", "image/webp"];

function mapInfluencer(
  id: string,
  data: Record<string, unknown>,
): StudioInfluencer {
  const photos = Array.isArray(data.photos)
    ? (data.photos as InfluencerPhoto[])
    : [];
  return {
    id,
    name: String(data.name ?? "Untitled"),
    photos,
    createdAt: String(data.createdAt ?? ""),
  };
}

export async function GET(req: Request) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getAdminDb();
  if (!db) {
    return NextResponse.json(
      { error: `Firebase Admin is not configured (${getAdminInitError() || "unknown"}).` },
      { status: 501 },
    );
  }

  const snap = await db
    .collection("influencers")
    .where("userId", "==", session.userId)
    .limit(80)
    .get();

  const influencers = snap.docs
    .map((doc) => mapInfluencer(doc.id, doc.data() as Record<string, unknown>))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return NextResponse.json({ influencers });
}

export async function POST(req: Request) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!env.FAL_KEY) {
    return NextResponse.json(
      { error: "Generation is not configured yet." },
      { status: 501 },
    );
  }

  const db = getAdminDb();
  if (!db) {
    return NextResponse.json(
      { error: `Firebase Admin is not configured (${getAdminInitError() || "unknown"}).` },
      { status: 501 },
    );
  }

  const form = await req.formData();
  const name = String(form.get("name") ?? "").trim();
  if (!name) {
    return NextResponse.json({ error: "Give them a name." }, { status: 400 });
  }
  if (name.length > 48) {
    return NextResponse.json({ error: "Name is too long." }, { status: 400 });
  }

  const files = form
    .getAll("photos")
    .filter((f): f is File => f instanceof File && f.size > 0);

  if (files.length !== REQUIRED_PHOTOS) {
    return NextResponse.json(
      { error: "Upload one reference photo." },
      { status: 400 },
    );
  }

  for (const file of files) {
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: "Each photo must be under 8MB." }, { status: 400 });
    }
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ error: "Use JPG, PNG or WebP." }, { status: 400 });
    }
  }

  const photos: InfluencerPhoto[] = [];
  for (const file of files) {
    const saved = await saveUploadedFile(file);
    photos.push({ url: saved.url, path: saved.fullPath });
  }

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  await db.collection("influencers").doc(id).set({
    userId: session.userId,
    name,
    photos,
    createdAt,
    updatedAt: createdAt,
  });

  return NextResponse.json({
    influencer: mapInfluencer(id, { name, photos, createdAt }),
  });
}
