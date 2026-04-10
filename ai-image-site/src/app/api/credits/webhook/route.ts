import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { verifyCoinbaseCommerceWebhook } from "@/lib/coinbaseCommerce";

export async function POST(req: Request) {
  if (!env.COINBASE_COMMERCE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 501 });
  }

  const signature = req.headers.get("X-CC-Webhook-Signature");
  const rawBody = await req.text();
  const ok = verifyCoinbaseCommerceWebhook({
    rawBody,
    signatureHeader: signature,
    webhookSecret: env.COINBASE_COMMERCE_WEBHOOK_SECRET,
  });
  if (!ok) return NextResponse.json({ error: "Invalid signature" }, { status: 400 });

  const event = JSON.parse(rawBody) as any;
  const eventType = event?.event?.type as string | undefined;
  const eventId = event?.event?.id as string | undefined;
  const charge = event?.event?.data;

  const providerChargeId = charge?.id as string | undefined;
  const status = charge?.timeline?.at?.(-1)?.status ?? charge?.status ?? "unknown";

  const userId = charge?.metadata?.userId as string | undefined;
  const credits = Number(charge?.metadata?.credits ?? 0);

  if (!providerChargeId || !userId || !Number.isFinite(credits) || credits <= 0) {
    return NextResponse.json({ error: "Missing required metadata" }, { status: 400 });
  }

  // We only mint credits once the charge is confirmed (not merely created/pending).
  const shouldGrant = eventType === "charge:confirmed";

  await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.upsert({
      where: { providerChargeId },
      create: {
        userId,
        provider: "coinbase_commerce",
        providerChargeId,
        status: String(status),
        rawEventType: eventType,
        rawEventId: eventId,
      },
      update: {
        status: String(status),
        rawEventType: eventType,
        rawEventId: eventId,
      },
      select: { id: true, creditsGranted: true },
    });

    if (!shouldGrant) return;
    if (payment.creditsGranted > 0) return; // already granted

    await tx.user.update({
      where: { id: userId },
      data: { creditBalance: { increment: credits } },
    });

    await tx.creditLedgerEntry.create({
      data: {
        userId,
        delta: credits,
        reason: "crypto_topup",
        paymentId: payment.id,
      },
    });

    await tx.payment.update({
      where: { id: payment.id },
      data: { creditsGranted: credits },
    });
  });

  return NextResponse.json({ ok: true });
}

