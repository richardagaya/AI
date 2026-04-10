import crypto from "node:crypto";

export function verifyCoinbaseCommerceWebhook({
  rawBody,
  signatureHeader,
  webhookSecret,
}: {
  rawBody: string;
  signatureHeader: string | null;
  webhookSecret: string;
}) {
  if (!signatureHeader) return false;
  const computed = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody, "utf8")
    .digest("hex");

  // Coinbase Commerce uses a hex signature header.
  // Use timingSafeEqual to avoid leaking comparison timing.
  try {
    return crypto.timingSafeEqual(
      Buffer.from(computed, "utf8"),
      Buffer.from(signatureHeader, "utf8"),
    );
  } catch {
    return false;
  }
}

