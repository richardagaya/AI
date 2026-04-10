import "dotenv/config";
import path from "node:path";
import { writeFile } from "node:fs/promises";
import { prisma } from "../src/lib/db";
import { ensureStorageDirs, OUTPUTS_DIR, randomFilename } from "../src/lib/storage";
import {
  comfyDownloadOutputImage,
  comfyGetHistory,
  comfyQueuePrompt,
  comfyUploadImage,
  hydrateWorkflowTemplate,
  loadWorkflow,
} from "../src/lib/comfy";

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

function pickFirstImageFromHistory(history: any, promptId: string) {
  const root = history?.[promptId];
  const outputs = root?.outputs;
  if (!outputs || typeof outputs !== "object") return null;

  for (const nodeId of Object.keys(outputs)) {
    const out = outputs[nodeId];
    const images = out?.images;
    if (Array.isArray(images) && images.length > 0) {
      const img = images[0];
      if (img?.filename) return img as { filename: string; subfolder?: string; type?: string };
    }
  }
  return null;
}

async function processOneJob() {
  const job = await prisma.generationJob.findFirst({
    where: { status: "queued" },
    orderBy: { createdAt: "asc" },
  });
  if (!job) return false;

  await prisma.generationJob.update({
    where: { id: job.id },
    data: { status: "running" },
  });

  try {
    await ensureStorageDirs();

    const workflowTemplate = await loadWorkflow(job.mode as "text2img" | "img2img");

    let comfyInputImageName: string | null = null;
    if (job.mode === "img2img") {
      if (!job.inputImagePath) throw new Error("Missing input image for img2img job");
      const bytes = await import("node:fs/promises").then((m) => m.readFile(job.inputImagePath));
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
      negativePrompt: job.negativePrompt,
      inputImageName: comfyInputImageName,
    });

    const promptId = await comfyQueuePrompt(workflow);

    const started = Date.now();
    const timeoutMs = 5 * 60 * 1000;
    let history: any = null;
    while (Date.now() - started < timeoutMs) {
      history = await comfyGetHistory(promptId);
      const img = pickFirstImageFromHistory(history, promptId);
      if (img) break;
      await sleep(1500);
    }

    const img = pickFirstImageFromHistory(history, promptId);
    if (!img) throw new Error("Timed out waiting for ComfyUI output");

    const bytes = await comfyDownloadOutputImage({
      filename: img.filename,
      subfolder: img.subfolder,
      type: img.type,
    });

    const outName = randomFilename("png");
    const outPath = path.join(OUTPUTS_DIR, outName);
    await writeFile(outPath, bytes);

    await prisma.generationJob.update({
      where: { id: job.id },
      data: {
        status: "succeeded",
        outputImagePath: outPath,
        error: null,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    await prisma.generationJob.update({
      where: { id: job.id },
      data: { status: "failed", error: message.slice(0, 1000) },
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

