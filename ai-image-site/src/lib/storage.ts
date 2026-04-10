import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import crypto from "node:crypto";

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

export async function saveUploadedFile(file: File) {
  await ensureStorageDirs();
  const arrayBuffer = await file.arrayBuffer();
  const buf = Buffer.from(arrayBuffer);
  const mime = file.type || "";
  const ext =
    mime === "image/png"
      ? "png"
      : mime === "image/webp"
        ? "webp"
        : mime === "image/jpeg"
          ? "jpg"
          : "bin";
  const name = randomFilename(ext);
  const fullPath = path.join(UPLOADS_DIR, name);
  await writeFile(fullPath, buf);
  return { fullPath, filename: name };
}

