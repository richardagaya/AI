/**
 * Server-side fal.ai runner.
 *
 * Translates the app's unified generation settings into each model's
 * fal.ai input schema, runs the job, and normalises the output.
 */
import { fal } from "@fal-ai/client";
import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  resolveAspect,
  resolveDuration,
  type FalModelDef,
} from "./fal-models";

let configured = false;
function ensureConfigured() {
  if (configured) return;
  const key = process.env.FAL_KEY;
  if (!key) throw new Error("FAL_KEY is not set — add it to .env.local");
  fal.config({ credentials: key });
  configured = true;
}

export type RunSettings = {
  prompt: string;
  negativePrompt?: string | null;
  aspect: string;
  /** Seconds — video only */
  duration?: number;
  /** Camera move label — video only */
  camera?: string | null;
  /** 0–1 — image-to-image strength */
  strength?: number;
  /** Local path of the uploaded reference image, if any */
  inputImagePath?: string | null;
  /** Public URL of the reference image (R2 CDN) — preferred over inputImagePath */
  inputImageUrl?: string | null;
};

export type FalOutput = {
  kind: "image" | "video";
  url: string;
  contentType: string | null;
};

const MIME_BY_EXT: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

async function uploadInputImage(localPath: string): Promise<string> {
  const bytes = await readFile(localPath);
  const type = MIME_BY_EXT[path.extname(localPath).toLowerCase()] ?? "image/png";
  const url = await fal.storage.upload(new Blob([bytes], { type }));
  return url;
}

function buildImageInput(
  model: FalModelDef,
  s: RunSettings,
  imageUrl: string | null,
): Record<string, unknown> {
  const size =
    model.sizes?.[resolveAspect(model, s.aspect)] ??
    Object.values(model.sizes ?? {})[0];
  const withImage = Boolean(imageUrl && model.endpoints.image);
  const usesImageUrls =
    model.family === "gemini" || model.family === "seedream";

  const input: Record<string, unknown> = {
    prompt: s.prompt,
    num_images: 1,
  };

  if (size && model.sizeParam && !(withImage && usesImageUrls)) {
    input[model.sizeParam] = size;
  }

  if (withImage && imageUrl) {
    if (usesImageUrls) input.image_urls = [imageUrl];
    else {
      input.image_url = imageUrl;
      if (model.family === "flux") {
        input.strength = Math.min(1, Math.max(0.01, s.strength ?? 0.8));
      }
    }
  }

  if (
    model.family === "flux" ||
    model.family === "gemini" ||
    model.family === "openai" ||
    model.family === "grok" ||
    model.family === "qwen"
  ) {
    input.output_format = "png";
  }

  if (model.family === "flux" || model.family === "qwen" || model.family === "seedream") {
    input.enable_safety_checker = true;
  }

  if (s.negativePrompt && model.family === "qwen") {
    input.negative_prompt = s.negativePrompt;
  }

  if (model.family === "openai") {
    input.quality = "medium";
  }

  return input;
}

export type PreparedFalJob = {
  endpoint: string;
  input: Record<string, unknown>;
  kind: "image" | "video";
};

/** Resolve endpoint + fal input (uploads a local reference image if needed). */
export async function prepareFalJob(
  model: FalModelDef,
  settings: RunSettings,
): Promise<PreparedFalJob> {
  ensureConfigured();

  const hasInput = Boolean(settings.inputImageUrl ?? settings.inputImagePath);
  const withImage = Boolean(hasInput && model.endpoints.image);
  const endpoint = withImage ? model.endpoints.image! : model.endpoints.text;

  const imageUrl = settings.inputImageUrl
    ? settings.inputImageUrl
    : settings.inputImagePath
      ? await uploadInputImage(settings.inputImagePath)
      : null;

  const input =
    model.kind === "video"
      ? buildVideoInput(model, settings, imageUrl)
      : buildImageInput(model, settings, imageUrl);

  return { endpoint, input, kind: model.kind };
}

function buildVideoInput(
  model: FalModelDef,
  s: RunSettings,
  imageUrl: string | null,
): Record<string, unknown> {
  let prompt = s.prompt;
  if (s.camera && s.camera !== "Static") {
    prompt = `${prompt}\nCamera movement: ${s.camera.toLowerCase()}.`;
  }

  const seconds = resolveDuration(model, s.duration ?? model.durations?.[0] ?? 5);
  const input: Record<string, unknown> = { prompt };

  const skipAspect =
    model.family === "hailuo" ||
    Boolean(
      imageUrl &&
        (model.family === "horse" ||
          model.family === "wan" ||
          model.family === "seedance"),
    );
  if (!skipAspect) {
    input.aspect_ratio = resolveAspect(model, s.aspect);
  }

  if (model.family === "veo") {
    input.duration = `${seconds}s`;
    input.resolution = "720p";
    input.generate_audio = false;
    if (s.negativePrompt && model.negativePromptParam) {
      input[model.negativePromptParam] = s.negativePrompt;
    }
  } else if (model.family === "kling") {
    input.duration = String(seconds);
    input.generate_audio = false;
  } else if (model.family === "hailuo") {
    input.duration = String(seconds);
  } else if (model.family === "seedance") {
    input.duration = String(seconds);
    input.resolution = "720p";
    input.generate_audio = false;
  } else if (model.family === "flux") {
    input.duration = seconds;
    input.resolution = "720p";
    input.generate_audio = false;
  } else if (model.family === "omni") {
    input.duration = seconds;
  } else if (model.family === "grok") {
    input.duration = seconds;
    input.resolution = "720p";
  } else if (model.family === "horse" || model.family === "wan") {
    input.duration = seconds;
    input.resolution = "720p";
    if (s.negativePrompt && model.negativePromptParam) {
      input[model.negativePromptParam] = s.negativePrompt;
    }
  }

  if (imageUrl && model.endpoints.image) input.image_url = imageUrl;
  return input;
}

/** Turn fal.ai's terse API errors into something a user can act on. */
function readableFalError(e: unknown): Error {
  const raw = e instanceof Error ? e.message : String(e);
  const body = JSON.stringify(
    (e as { body?: unknown })?.body ?? {},
  ).toLowerCase();
  const haystack = `${raw} ${body}`.toLowerCase();

  if (haystack.includes("top_up") || haystack.includes("user is locked")) {
    return new Error(
      "The fal.ai account is out of funds — add balance at fal.ai/dashboard/billing.",
    );
  }
  if (haystack.includes("invalid key") || haystack.includes("unauthorized")) {
    return new Error("The fal.ai API key is invalid — check FAL_KEY in .env.local.");
  }
  if (haystack.includes("exhausted") || haystack.includes("rate limit")) {
    return new Error("fal.ai rate limit reached — try again in a moment.");
  }
  if (haystack.includes("content policy") || haystack.includes("safety")) {
    return new Error("The model rejected this prompt under its content policy.");
  }
  return new Error(raw);
}

/** Pull a CDN URL out of a fal image/video payload. */
export function parseFalPayload(
  kind: "image" | "video",
  data: Record<string, unknown> | null | undefined,
): FalOutput {
  if (!data) throw new Error("fal.ai returned an empty payload");

  if (kind === "video") {
    const video = data.video as { url?: string; content_type?: string } | undefined;
    if (!video?.url) throw new Error("fal.ai returned no video");
    return {
      kind: "video",
      url: video.url,
      contentType: video.content_type ?? "video/mp4",
    };
  }

  const images = data.images as
    | Array<{ url?: string; content_type?: string }>
    | undefined;
  const first = images?.[0];
  if (!first?.url) throw new Error("fal.ai returned no image");
  return {
    kind: "image",
    url: first.url,
    contentType: first.content_type ?? "image/png",
  };
}

/** Enqueue on fal and return immediately. Result arrives at webhookUrl. */
export async function submitFalJob(
  endpoint: string,
  input: Record<string, unknown>,
  webhookUrl: string,
): Promise<{ requestId: string }> {
  ensureConfigured();
  try {
    const { request_id } = await fal.queue.submit(endpoint, {
      input,
      webhookUrl,
    });
    if (!request_id) throw new Error("fal.ai did not return a request id");
    return { requestId: request_id };
  } catch (e) {
    throw readableFalError(e);
  }
}

/**
 * Wait in-process for the result. Used only when the webhook URL is not
 * publicly reachable (local `localhost`), because fal will not deliver there.
 */
export async function waitForFalJob(
  endpoint: string,
  input: Record<string, unknown>,
  kind: "image" | "video",
): Promise<FalOutput> {
  ensureConfigured();
  try {
    const result = await fal.subscribe(endpoint, { input, logs: false });
    return parseFalPayload(kind, result.data as Record<string, unknown>);
  } catch (e) {
    throw readableFalError(e);
  }
}
