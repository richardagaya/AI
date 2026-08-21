import crypto from "node:crypto";
import { getAdminDb, FieldValue, Timestamp } from "@/lib/firebaseAdmin";

export const PAYSTACK_API = "https://api.paystack.co";

/** Secret from .env.local — read live so a stale env snapshot cannot hide it. */
export function paystackSecretKey(): string | undefined {
  const key = process.env.PAYSTACK_SECRET_KEY?.trim();
  return key || undefined;
}

/** USD price used when PAYSTACK_CURRENCY=USD. */
export const USD_PER_CREDIT = 0.05;

/** Naira price used when PAYSTACK_CURRENCY=NGN (Paystack default). */
export const NGN_PER_CREDIT = 75;

/** Kenyan shilling price used when PAYSTACK_CURRENCY=KES. ~$0.05/credit. */
export const KES_PER_CREDIT = 7;

export function paystackCurrency(raw?: string): string {
  return (raw?.trim() || "NGN").toUpperCase();
}

/** Amount in the currency's smallest unit (kobo, cents, …). */
export function amountMinorUnits(credits: number, currency: string): number {
  const code = paystackCurrency(currency);
  if (code === "USD") {
    return Math.round(credits * USD_PER_CREDIT * 100);
  }
  if (code === "KES") {
    return Math.round(credits * KES_PER_CREDIT * 100);
  }
  return Math.round(credits * NGN_PER_CREDIT * 100);
}

export function verifyPaystackSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
) {
  if (!signatureHeader) return false;
  const computed = crypto
    .createHmac("sha512", secret)
    .update(rawBody)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(computed, "utf8"),
      Buffer.from(signatureHeader, "utf8"),
    );
  } catch {
    return false;
  }
}

export type PaystackMetadata = {
  userId: string;
  credits: number;
};

export function readPaystackMetadata(
  meta: unknown,
): PaystackMetadata | null {
  if (!meta || typeof meta !== "object") return null;
  const rec = meta as Record<string, unknown>;
  const userId = typeof rec.userId === "string" ? rec.userId : "";
  const credits = Number(rec.credits);
  if (!userId || !Number.isFinite(credits) || credits <= 0) return null;
  return { userId, credits };
}

/**
 * Credits the user once per Paystack reference. Safe to call from both the
 * webhook and the post-checkout verify route.
 */
export async function grantCreditsForReference({
  reference,
  userId,
  credits,
  status,
}: {
  reference: string;
  userId: string;
  credits: number;
  status: string;
}): Promise<{ granted: boolean }> {
  const adminDb = getAdminDb();
  if (!adminDb) return { granted: false };

  const paymentRef = adminDb.collection("payments").doc(reference);
  let granted = false;

  await adminDb.runTransaction(async (tx) => {
    const paymentSnap = await tx.get(paymentRef);
    const userRef = adminDb.collection("users").doc(userId);
    const userSnap = await tx.get(userRef);
    const alreadyGranted = (paymentSnap.data()?.creditsGranted as number) ?? 0;

    const paymentFields = {
      userId,
      provider: "paystack",
      providerChargeId: reference,
      status,
    };

    if (alreadyGranted > 0) {
      tx.update(paymentRef, { status });
      return;
    }

    if (!paymentSnap.exists) {
      tx.set(paymentRef, {
        ...paymentFields,
        creditsGranted: credits,
        createdAt: Timestamp.now(),
      });
    } else {
      tx.update(paymentRef, { ...paymentFields, creditsGranted: credits });
    }

    if (!userSnap.exists) {
      tx.set(userRef, {
        creditBalance: credits,
        createdAt: Timestamp.now(),
      });
    } else {
      tx.update(userRef, { creditBalance: FieldValue.increment(credits) });
    }
    granted = true;
  });

  return { granted };
}
