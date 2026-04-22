import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { verifyCoinbaseCommerceWebhook } from "@/lib/coinbaseCommerce";
import { getAdminDb, getAdminInitError, FieldValue, Timestamp } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  if (!env.COINBASE_COMMERCE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 501 });
  }

  const adminDb = getAdminDb();
  if (!adminDb) {
    return NextResponse.json(
      { error: `Firebase Admin not configured: ${getAdminInitError()}` },
      { status: 501 },
    );
  }

  const signature = req.headers.get("X-CC-Webhook-Signature");
  const rawBody = await req.text();
  const ok = verifyCoinbaseCommerceWebhook({
    rawBody,
    signatureHeader: signature,
    webhookSecret: env.COINBASE_COMMERCE_WEBHOOK_SECRET,
  });
  if (!ok) return NextResponse.json({ error: "Invalid signature" }, { status: 400 });

  const event = JSON.parse(rawBody) as Record<string, unknown>;
  const eventData = event?.event as Record<string, unknown> | undefined;
  const eventType = eventData?.type as string | undefined;
  const charge = eventData?.data as Record<string, unknown> | undefined;

  const providerChargeId = charge?.id as string | undefined;
  const timelineArr = charge?.timeline as Array<Record<string, unknown>> | undefined;
  const status = timelineArr?.at(-1)?.status ?? (charge?.status as string) ?? "unknown";

  const meta = charge?.metadata as Record<string, unknown> | undefined;
  const userId = meta?.userId as string | undefined;
  const credits = Number(meta?.credits ?? 0);

  if (!providerChargeId || !userId || !Number.isFinite(credits) || credits <= 0) {
    return NextResponse.json({ error: "Missing required metadata" }, { status: 400 });
  }

  const shouldGrant = eventType === "charge:confirmed";

  const paymentRef = adminDb.collection("payments").doc(providerChargeId);

  await adminDb.runTransaction(async (tx) => {
    const paymentSnap = await tx.get(paymentRef);

    if (!paymentSnap.exists) {
      tx.set(paymentRef, {
        userId,
        provider: "coinbase_commerce",
        providerChargeId,
        status: String(status),
        eventType: eventType ?? null,
        creditsGranted: 0,
        createdAt: Timestamp.now(),
      });
    } else {
      tx.update(paymentRef, { status: String(status), eventType: eventType ?? null });
    }

    if (!shouldGrant) return;
    const existingCreditsGranted = (paymentSnap.data()?.creditsGranted as number) ?? 0;
    if (existingCreditsGranted > 0) return;

    const userRef = adminDb.collection("users").doc(userId);
    tx.update(userRef, { creditBalance: FieldValue.increment(credits) });
    tx.update(paymentRef, { creditsGranted: credits });
  });

  return NextResponse.json({ ok: true });
}
