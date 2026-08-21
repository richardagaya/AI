import { NextResponse } from "next/server";
import { getAdminDb, getAdminInitError } from "@/lib/firebaseAdmin";
import {
  grantCreditsForReference,
  paystackSecretKey,
  readPaystackMetadata,
  verifyPaystackSignature,
} from "@/lib/paystack";

export async function POST(req: Request) {
  const secret = paystackSecretKey();
  if (!secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 501 });
  }

  const adminDb = getAdminDb();
  if (!adminDb) {
    return NextResponse.json(
      { error: `Firebase Admin not configured: ${getAdminInitError()}` },
      { status: 501 },
    );
  }

  const rawBody = await req.text();
  const ok = verifyPaystackSignature(
    rawBody,
    req.headers.get("x-paystack-signature"),
    secret,
  );
  if (!ok) return NextResponse.json({ error: "Invalid signature" }, { status: 400 });

  const event = JSON.parse(rawBody) as {
    event?: string;
    data?: {
      status?: string;
      reference?: string;
      metadata?: unknown;
    };
  };

  if (event.event !== "charge.success") {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const reference = event.data?.reference;
  const status = event.data?.status ?? "success";
  const meta = readPaystackMetadata(event.data?.metadata);

  if (!reference || !meta || status !== "success") {
    return NextResponse.json({ error: "Missing required metadata" }, { status: 400 });
  }

  await grantCreditsForReference({
    reference,
    userId: meta.userId,
    credits: meta.credits,
    status,
  });

  return NextResponse.json({ ok: true });
}
