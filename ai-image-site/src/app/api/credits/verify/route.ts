import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import { getSession } from "@/lib/auth";
import { getAdminDb, getAdminInitError } from "@/lib/firebaseAdmin";
import {
  PAYSTACK_API,
  grantCreditsForReference,
  readPaystackMetadata,
} from "@/lib/paystack";

const BodySchema = z.object({
  reference: z.string().min(4).max(200),
});

export async function POST(req: Request) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!env.PAYSTACK_SECRET_KEY) {
    return NextResponse.json({ error: "Payments are not configured" }, { status: 501 });
  }

  const adminDb = getAdminDb();
  if (!adminDb) {
    return NextResponse.json(
      { error: `Firebase Admin not configured: ${getAdminInitError()}` },
      { status: 501 },
    );
  }

  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const reference = parsed.data.reference;
  const res = await fetch(
    `${PAYSTACK_API}/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}` } },
  );

  const payload = (await res.json().catch(() => null)) as {
    status?: boolean;
    message?: string;
    data?: {
      status?: string;
      reference?: string;
      metadata?: unknown;
    };
  } | null;

  if (!res.ok || !payload?.status || payload.data?.status !== "success") {
    return NextResponse.json(
      { error: payload?.message || "Payment could not be verified" },
      { status: 402 },
    );
  }

  const meta = readPaystackMetadata(payload.data.metadata);
  if (!meta || meta.userId !== session.userId) {
    return NextResponse.json({ error: "Payment does not match this account" }, { status: 403 });
  }

  const { granted } = await grantCreditsForReference({
    reference: payload.data.reference ?? reference,
    userId: meta.userId,
    credits: meta.credits,
    status: "success",
  });

  return NextResponse.json({ ok: true, granted });
}
