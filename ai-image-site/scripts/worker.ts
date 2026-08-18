import { config as loadEnv } from "dotenv";
import path from "node:path";
import { writeFile } from "node:fs/promises";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { ensureStorageDirs, OUTPUTS_DIR, randomFilename } from "../src/lib/storage";
import { getModel } from "../src/lib/fal-models";
import { runFalGeneration } from "../src/lib/fal";

// The worker runs outside Next.js, so load .env.local manually
loadEnv({ path: ".env.local" });
loadEnv();

// Initialise Firebase Admin for the worker process
if (getApps().length === 0) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (serviceAccount) {
    initializeApp({ credential: cert(JSON.parse(serviceAccount)) });
  } else {
    initializeApp({ projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID });
  }
}

const db = getFirestore();

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

type JobDoc = {
  id: string;
  status: string;
  kind?: string;
  mode: string;
  model: string;
  prompt: string;
  negativePrompt: string | null;
  aspect?: string | null;
  duration?: string | null;
  camera?: string | null;
  strength?: number | null;
  inputImagePath: string | null;
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

async function downloadToOutputs(url: string, ext: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download fal output (${res.status})`);
  const bytes = Buffer.from(await res.arrayBuffer());
  const outPath = path.join(OUTPUTS_DIR, randomFilename(ext));
  await writeFile(outPath, bytes);
  return outPath;
}

async function processOneJob(): Promise<boolean> {
  // Find the oldest pending job
  const snap = await db
    .collection("jobs")
    .where("status", "==", "pending")
    .orderBy("createdAt", "asc")
    .limit(1)
    .get();

  if (snap.empty) return false;

  const jobDoc = snap.docs[0];
  const job = { id: jobDoc.id, ...jobDoc.data() } as JobDoc;

  await jobDoc.ref.update({ status: "running", updatedAt: Timestamp.now() });

  try {
    await ensureStorageDirs();

    const model = getModel(job.model);
    if (!model) throw new Error(`Unknown model "${job.model}"`);

    const output = await runFalGeneration(model, {
      prompt: job.prompt,
      negativePrompt: job.negativePrompt,
      aspect: job.aspect ?? model.aspects[0],
      duration: job.duration ? Number(job.duration) : undefined,
      camera: job.camera,
      strength: job.strength ?? undefined,
      inputImagePath: job.inputImagePath,
    });

    const outPath = await downloadToOutputs(
      output.url,
      extForOutput(output.kind, output.contentType),
    );

    await jobDoc.ref.update({
      status: "succeeded",
      outputImagePath: outPath,
      outputKind: output.kind,
      error: null,
      updatedAt: Timestamp.now(),
    });
    console.log(`[worker] job ${job.id} succeeded (${model.label})`);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error(`[worker] job ${job.id} failed: ${message}`);
    await jobDoc.ref.update({
      status: "failed",
      error: message.slice(0, 1000),
      updatedAt: Timestamp.now(),
    });
  }

  return true;
}

async function main() {
  if (!process.env.FAL_KEY) {
    console.error("FAL_KEY is not set. Add it to .env.local and restart the worker.");
    process.exit(1);
  }
  console.log("Worker started (fal.ai engine). Polling for pending jobs...");
  for (;;) {
    const did = await processOneJob();
    if (!did) await sleep(1000);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
