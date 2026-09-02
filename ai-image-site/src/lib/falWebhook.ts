/**
 * Verify that a POST came from fal.ai (ED25519 over JWKS).
 * @see https://fal.ai/docs/documentation/model-apis/inference/webhooks
 */
import { createHash, createPublicKey, verify } from "node:crypto";
import { env } from "@/lib/env";

const JWKS_URL = "https://rest.fal.ai/.well-known/jwks.json";
const JWKS_TTL_MS = 24 * 60 * 60 * 1000;
const TIMESTAMP_LEEWAY_SEC = 300;
/** SPKI DER prefix for a raw 32-byte Ed25519 public key. */
const ED25519_SPKI_PREFIX = Buffer.from("302a300506032b6570032100", "hex");

let jwksCache: { keys: Array<{ x?: string }>; fetchedAt: number } | null = null;

async function fetchJwks(): Promise<Array<{ x?: string }>> {
  if (jwksCache && Date.now() - jwksCache.fetchedAt < JWKS_TTL_MS) {
    return jwksCache.keys;
  }
  const res = await fetch(JWKS_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`JWKS fetch failed (${res.status})`);
  const json = (await res.json()) as { keys?: Array<{ x?: string }> };
  const keys = json.keys ?? [];
  jwksCache = { keys, fetchedAt: Date.now() };
  return keys;
}

export async function verifyFalWebhook(req: Request, rawBody: Buffer): Promise<boolean> {
  const requestId = req.headers.get("x-fal-webhook-request-id");
  const userId = req.headers.get("x-fal-webhook-user-id");
  const timestamp = req.headers.get("x-fal-webhook-timestamp");
  const signatureHex = req.headers.get("x-fal-webhook-signature");
  if (!requestId || !userId || !timestamp || !signatureHex) return false;

  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return false;
  if (Math.abs(Math.floor(Date.now() / 1000) - ts) > TIMESTAMP_LEEWAY_SEC) return false;

  let signature: Buffer;
  try {
    signature = Buffer.from(signatureHex, "hex");
  } catch {
    return false;
  }

  const bodyHash = createHash("sha256").update(rawBody).digest("hex");
  const message = Buffer.from(
    [requestId, userId, timestamp, bodyHash].join("\n"),
    "utf8",
  );

  const keys = await fetchJwks();
  for (const key of keys) {
    if (typeof key.x !== "string") continue;
    try {
      const raw = Buffer.from(key.x, "base64url");
      const publicKey = createPublicKey({
        key: Buffer.concat([ED25519_SPKI_PREFIX, raw]),
        format: "der",
        type: "spki",
      });
      if (verify(null, message, publicKey, signature)) return true;
    } catch {
      continue;
    }
  }
  return false;
}

function isLoopbackHost(host: string): boolean {
  const h = host.toLowerCase();
  return (
    h === "localhost" ||
    h === "127.0.0.1" ||
    h.endsWith(".localhost") ||
    h.endsWith(".local")
  );
}

/**
 * fal will not follow apex→www redirects, and will not deliver to loopback.
 * Prefer the host that actually handled this request (studio.*) over BASE_URL,
 * which is often the marketing apex and 308s away.
 */
export function publicWebhookUrl(req: Request, jobId: string): string | null {
  const forwarded = req.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwarded || req.headers.get("host") || "";
  const hostname = host.replace(/:\d+$/, "");
  if (hostname && isLoopbackHost(hostname)) return null;

  const proto =
    req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || "https";
  const bases = [
    host ? `${proto}://${host}` : "",
    env.NEXT_PUBLIC_STUDIO_URL,
    env.BASE_URL,
  ].filter(Boolean);

  for (const base of bases) {
    let url: URL;
    try {
      url = new URL("/api/fal/webhook", base);
    } catch {
      continue;
    }
    if (isLoopbackHost(url.hostname)) continue;
    if (url.hostname.split(".").length === 2 && !/^\d/.test(url.hostname)) {
      url.hostname = `www.${url.hostname}`;
    }
    url.searchParams.set("jobId", jobId);
    return url.href;
  }
  return null;
}
