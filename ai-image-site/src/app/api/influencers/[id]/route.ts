import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAdminDb, getAdminInitError } from "@/lib/firebaseAdmin";
import type { InfluencerPhoto, StudioInfluencer } from "@/lib/influencers";

type Ctx = { params: Promise<{ id: string }> };

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

  const { id } = await ctx.params;
  const snap = await db.collection("influencers").doc(id).get();
  if (!snap.exists) {
    return NextResponse.json({ error: "Influencer not found." }, { status: 404 });
  }
  const data = (snap.data() ?? {}) as Record<string, unknown>;
  if (data.userId !== session.userId) {
    return NextResponse.json({ error: "Influencer not found." }, { status: 404 });
  }

  return NextResponse.json({ influencer: mapInfluencer(id, data) });
}
