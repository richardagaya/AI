/**
 * Cloudflare R2 object storage (S3-compatible).
 *
 * R2 doubles as the CDN: once a public custom domain (e.g. cdn.yoursite.com)
 * is attached to the bucket, Cloudflare caches objects at the edge, so files
 * are served from the edge instead of through the Next.js server.
 *
 * Required env vars (see .env.local):
 *   R2_ACCOUNT_ID        – Cloudflare account ID
 *   R2_ACCESS_KEY_ID     – R2 API token access key
 *   R2_SECRET_ACCESS_KEY – R2 API token secret
 *   R2_BUCKET            – bucket name
 *   R2_PUBLIC_BASE_URL   – public origin of the bucket, e.g. https://cdn.example.com
 *
 * When any of these is missing the app silently falls back to local disk
 * storage (see src/lib/storage.ts), so local dev keeps working without R2.
 */
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import crypto from "node:crypto";

let client: S3Client | null = null;

export function isR2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET &&
      process.env.R2_PUBLIC_BASE_URL,
  );
}

function getClient(): S3Client {
  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }
  return client;
}

/**
 * Upload bytes under a random, unguessable key and return the public CDN URL.
 * Keys are content-addressed by randomness, so objects are cached forever.
 */
export async function uploadToR2(
  bytes: Buffer,
  prefix: "outputs" | "uploads",
  ext: string,
  contentType: string,
): Promise<string> {
  const key = `${prefix}/${crypto.randomBytes(16).toString("hex")}.${ext.replace(/^\./, "")}`;
  await getClient().send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: key,
      Body: bytes,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
  const base = process.env.R2_PUBLIC_BASE_URL!.replace(/\/$/, "");
  return `${base}/${key}`;
}

/** Best-effort delete of a public R2 object. Ignores URLs that are not ours. */
export async function deleteFromR2(url: string): Promise<void> {
  if (!isR2Configured()) return;
  const base = process.env.R2_PUBLIC_BASE_URL!.replace(/\/$/, "");
  if (!url.startsWith(`${base}/`)) return;
  const key = url.slice(base.length + 1);
  if (!key) return;
  await getClient().send(
    new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: key,
    }),
  );
}
