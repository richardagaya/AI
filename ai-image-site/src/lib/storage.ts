import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import crypto from "node:crypto";
import { isR2Configured, uploadToR2 } from "./r2";

export const STORAGE_ROOT = path.join(process.cwd(), "storage");
export const UPLOADS_DIR = path.join(STORAGE_ROOT, "uploads");
export const OUTPUTS_DIR = path.join(STORAGE_ROOT, "outputs");

export async function ensureStorageDirs() {
  await mkdir(UPLOADS_DIR, { recursive: true });
  await mkdir(OUTPUTS_DIR, { recursive: true });
}

export function randomFilename(ext: string) {
  const id = crypto.randomBytes(16).toString("hex");
  return `${id}.${ext.replace(/^\./, "")}`;
}

export type SavedUpload = {
  /** Set when the file landed on local disk (R2 not configured). */
  fullPath: string | null;
  /** Set when the file was uploaded to R2 — public CDN URL. */
  url: string | null;
};

const EXT_BY_MIME: Record<string, string> = {
  "image/png": "png",
  "image/webp": "webp",
  "image/jpeg": "jpg",
};

export async function saveUploadedFile(file: File): Promise<SavedUpload> {
  const arrayBuffer = await file.arrayBuffer();
  const buf = Buffer.from(arrayBuffer);
  const ext = EXT_BY_MIME[file.type] ?? "bin";

  if (isR2Configured()) {
    const url = await uploadToR2(buf, "uploads", ext, file.type || "application/octet-stream");
    return { fullPath: null, url };
  }

  await ensureStorageDirs();
  const name = randomFilename(ext);
  const fullPath = path.join(UPLOADS_DIR, name);
  await writeFile(fullPath, buf);
  return { fullPath, url: null };
}

export type PersistedOutput = {
  outputUrl: string | null;
  outputImagePath: string | null;
};

function extForOutput(kind: "image" | "video", contentType: string | null): string {
  if (kind === "video") return "mp4";
  switch (contentType) {
    case "image/jpeg":
      return "jpg";
    case "image/webp":
      return "webp";
    default:
      return "png";
  }
}

/** Download a fal result and store it on R2 (or local disk as a fallback). */
export async function persistRemoteFile(
  url: string,
  kind: "image" | "video",
  contentType: string | null,
): Promise<PersistedOutput> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download fal output (${res.status})`);
  const bytes = Buffer.from(await res.arrayBuffer());
  const ext = extForOutput(kind, contentType);

  if (isR2Configured()) {
    const outputUrl = await uploadToR2(
      bytes,
      "outputs",
      ext,
      contentType ?? (kind === "video" ? "video/mp4" : "image/png"),
    );
    return { outputUrl, outputImagePath: null };
  }

  await ensureStorageDirs();
  const outPath = path.join(OUTPUTS_DIR, randomFilename(ext));
  await writeFile(outPath, bytes);
  return { outputUrl: null, outputImagePath: outPath };
}
