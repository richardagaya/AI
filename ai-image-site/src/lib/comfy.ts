import { readFile } from "node:fs/promises";
import path from "node:path";
import { env } from "@/lib/env";

export type ComfyMode = "text2img" | "img2img";

export async function loadWorkflow(mode: ComfyMode) {
  const filename = mode === "img2img" ? "img2img.json" : "text2img.json";
  const fullPath = path.join(process.cwd(), "workflows", filename);
  const raw = await readFile(fullPath, "utf8");
  return raw;
}

export function hydrateWorkflowTemplate({
  workflowTemplate,
  prompt,
  negativePrompt,
  inputImageName,
}: {
  workflowTemplate: string;
  prompt: string;
  negativePrompt: string | null;
  inputImageName: string | null;
}) {
  const replaced = workflowTemplate
    .replaceAll("__PROMPT__", JSON.stringify(prompt).slice(1, -1))
    .replaceAll(
      "__NEGATIVE_PROMPT__",
      JSON.stringify(negativePrompt ?? "").slice(1, -1),
    )
    .replaceAll("__INPUT_IMAGE__", JSON.stringify(inputImageName ?? "").slice(1, -1));

  return JSON.parse(replaced) as unknown;
}

export async function comfyQueuePrompt(workflow: unknown) {
  let res: Response;
  try {
    res = await fetch(`${env.COMFYUI_URL}/prompt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: workflow }),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`Fetch to ComfyUI failed (${env.COMFYUI_URL}/prompt): ${msg}`);
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`ComfyUI /prompt failed: ${res.status} ${text.slice(0, 300)}`);
  }
  const json = (await res.json()) as any;
  const promptId = json?.prompt_id as string | undefined;
  if (!promptId) throw new Error("ComfyUI response missing prompt_id");
  return promptId;
}

export async function comfyGetHistory(promptId: string) {
  let res: Response;
  try {
    res = await fetch(`${env.COMFYUI_URL}/history/${encodeURIComponent(promptId)}`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(
      `Fetch to ComfyUI failed (${env.COMFYUI_URL}/history/${promptId}): ${msg}`,
    );
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`ComfyUI /history failed: ${res.status} ${text.slice(0, 300)}`);
  }
  return (await res.json()) as any;
}

export async function comfyDownloadOutputImage({
  filename,
  subfolder,
  type,
}: {
  filename: string;
  subfolder?: string;
  type?: string;
}) {
  const url = new URL(`${env.COMFYUI_URL}/view`);
  url.searchParams.set("filename", filename);
  if (subfolder) url.searchParams.set("subfolder", subfolder);
  if (type) url.searchParams.set("type", type);

  let res: Response;
  try {
    res = await fetch(url.toString(), { method: "GET" });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`Fetch to ComfyUI failed (${url.toString()}): ${msg}`);
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`ComfyUI /view failed: ${res.status} ${text.slice(0, 300)}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function comfyUploadImage({
  filename,
  bytes,
}: {
  filename: string;
  bytes: Buffer;
}) {
  const form = new FormData();
  form.set("image", new Blob([bytes]), filename);
  form.set("overwrite", "true");

  let res: Response;
  try {
    res = await fetch(`${env.COMFYUI_URL}/upload/image`, {
      method: "POST",
      body: form,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`Fetch to ComfyUI failed (${env.COMFYUI_URL}/upload/image): ${msg}`);
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`ComfyUI /upload/image failed: ${res.status} ${text.slice(0, 300)}`);
  }
  const json = (await res.json()) as any;
  // Expected: { name: "file.png", subfolder: "", type: "input" }
  return json?.name as string | undefined;
}

