import "dotenv/config";
import path from "node:path";
import { writeFile } from "node:fs/promises";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { ensureStorageDirs, OUTPUTS_DIR, randomFilename } from "../src/lib/storage";
import {
  comfyDownloadOutputImage,
  comfyGetHistory,
  comfyQueuePrompt,
  comfyUploadImage,
  hydrateWorkflowTemplate,
  loadWorkflow,
} from "../src/lib/comfy";

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

function pickFirstImageFromHistory(history: Record<string, unknown>, promptId: string) {
  const root = history?.[promptId] as Record<string, unknown> | undefined;
  const outputs = root?.outputs as Record<string, unknown> | undefined;
  if (!outputs) return null;

  for (const nodeId of Object.keys(outputs)) {
    const out = outputs[nodeId] as Record<string, unknown> | undefined;
    const images = out?.images as Array<Record<string, unknown>> | undefined;
    if (Array.isArray(images) && images.length > 0) {
      const img = images[0];
      if (img?.filename) return img as { filename: string; subfolder?: string; type?: string };
    }
  }
  return null;
}

async function processOneJob(): Promise<boolean> {
  // Find the oldest queued job
  const snap = await db
    .collection("jobs")
    .where("status", "==", "queued")
    .orderBy("createdAt", "asc")
    .limit(1)
    .get();

  if (snap.empty) return false;

  const jobDoc = snap.docs[0];
  const job = { id: jobDoc.id, ...jobDoc.data() } as {
    id: string;
    status: string;
    mode: string;
    model: string;
    prompt: string;
    negativePrompt: string | null;
    inputImagePath: string | null;
    outputImagePath: string | null;
  };

  await jobDoc.ref.update({ status: "running", updatedAt: Timestamp.now() });

  try {
    await ensureStorageDirs();

    const workflowTemplate = await loadWorkflow(job.mode as "text2img" | "img2img");

    let comfyInputImageName: string | null = null;
    if (job.mode === "img2img") {
      if (!job.inputImagePath) throw new Error("Missing input image for img2img job");
      const bytes = await import("node:fs/promises").then((m) =>
        m.readFile(job.inputImagePath as string),
      );
      const uploaded = await comfyUploadImage({
        filename: path.basename(job.inputImagePath),
        bytes,
      });
      if (!uploaded) throw new Error("ComfyUI did not return uploaded image name");
      comfyInputImageName = uploaded;
    }

    const workflow = hydrateWorkflowTemplate({
      workflowTemplate,
      prompt: job.prompt,
      negativePrompt: job.negativePrompt ?? null,
      inputImageName: comfyInputImageName,
    });

    const promptId = await comfyQueuePrompt(workflow);

    const started = Date.now();
    const timeoutMs = 5 * 60 * 1000;
    let history: Record<string, unknown> = {};
    while (Date.now() - started < timeoutMs) {
      history = await comfyGetHistory(promptId);
      if (pickFirstImageFromHistory(history, promptId)) break;
      await sleep(1500);
    }

    const img = pickFirstImageFromHistory(history, promptId);
    if (!img) throw new Error("Timed out waiting for ComfyUI output");

    const imageBytes = await comfyDownloadOutputImage({
      filename: img.filename,
      subfolder: img.subfolder,
      type: img.type,
    });

    const outName = randomFilename("png");
    const outPath = path.join(OUTPUTS_DIR, outName);
    await writeFile(outPath, imageBytes);

    await jobDoc.ref.update({
      status: "succeeded",
      outputImagePath: outPath,
      error: null,
      updatedAt: Timestamp.now(),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    await jobDoc.ref.update({
      status: "failed",
      error: message.slice(0, 1000),
      updatedAt: Timestamp.now(),
    });
  }

  return true;
}

async function main() {
  // eslint-disable-next-line no-console
  console.log("Worker started. Polling for queued jobs...");
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const did = await processOneJob();
    if (!did) await sleep(1000);
  }
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
