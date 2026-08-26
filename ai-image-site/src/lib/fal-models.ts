/**
 * Shared registry of the fal.ai models exposed in the studio.
 *
 * Safe to import from both client and server code — it contains only
 * endpoint IDs and UI metadata, no credentials.
 */

export type GenKind = "image" | "video";
export type ModelFamily =
  | "flux"
  | "gemini"
  | "imagen"
  | "ideogram"
  | "kling"
  | "veo"
  | "seedance"
  | "seedream"
  | "openai"
  | "grok"
  | "qwen"
  | "hailuo"
  | "wan"
  | "horse"
  | "omni"
  | "zimage";

export type FalModelDef = {
  /** Registry id used across the app + stored on jobs */
  id: string;
  kind: GenKind;
  label: string;
  tagline: string;
  /** Group heading shown in the model picker */
  provider: string;
  family: ModelFamily;
  endpoints: {
    /** text → image / text → video */
    text: string;
    /** image → image / image → video (omit = model takes no image input) */
    image?: string;
  };
  /** Credits charged per generation, keyed by whether an input image is used */
  cost: { text: number; image: number };
  /** UI aspect ids the model supports */
  aspects: string[];
  /** Video only: selectable durations in seconds */
  durations?: number[];
  /** Image only: which fal parameter carries the size */
  sizeParam?: "image_size" | "aspect_ratio";
  /** Image only: UI aspect id → fal size value */
  sizes?: Record<string, string>;
  /** Video only: accepts a negative prompt */
  negativePromptParam?: string;
};

export const UI_ASPECTS = [
  { id: "2:3", label: "2:3", w: 10, h: 15 },
  { id: "1:1", label: "1:1", w: 13, h: 13 },
  { id: "3:2", label: "3:2", w: 15, h: 10 },
  { id: "16:9", label: "16:9", w: 17, h: 10 },
  { id: "9:16", label: "9:16", w: 9, h: 16 },
  { id: "21:9", label: "21:9", w: 20, h: 9 },
] as const;

const FLUX_SIZES: Record<string, string> = {
  "2:3": "portrait_4_3",
  "1:1": "square_hd",
  "3:2": "landscape_4_3",
  "16:9": "landscape_16_9",
  "9:16": "portrait_16_9",
};

const RATIO_SIZES: Record<string, string> = {
  "2:3": "2:3",
  "1:1": "1:1",
  "3:2": "3:2",
  "16:9": "16:9",
  "9:16": "9:16",
};

const IMAGEN_SIZES: Record<string, string> = {
  "2:3": "3:4",
  "1:1": "1:1",
  "3:2": "4:3",
  "16:9": "16:9",
  "9:16": "9:16",
};

/** GPT Image 1.5 only accepts these three pixel sizes. */
const GPT_SIZES: Record<string, string> = {
  "1:1": "1024x1024",
  "3:2": "1536x1024",
  "16:9": "1536x1024",
  "2:3": "1024x1536",
  "9:16": "1024x1536",
};

export const IMAGE_MODELS: FalModelDef[] = [
  {
    id: "z-image-turbo",
    kind: "image",
    label: "Z-Image Turbo",
    tagline: "Free-tier fast 6B",
    provider: "Tongyi-MAI",
    family: "zimage",
    endpoints: { text: "fal-ai/z-image/turbo" },
    cost: { text: 1, image: 1 },
    aspects: Object.keys(FLUX_SIZES),
    sizeParam: "image_size",
    sizes: FLUX_SIZES,
  },
  {
    id: "flux-2-klein-9b",
    kind: "image",
    label: "FLUX.2 Klein 9B",
    tagline: "Free-tier realism + edits",
    provider: "Black Forest Labs",
    family: "flux",
    endpoints: {
      text: "fal-ai/flux-2/klein/9b",
      image: "fal-ai/flux-2/klein/9b/edit",
    },
    cost: { text: 1, image: 1 },
    aspects: Object.keys(FLUX_SIZES),
    sizeParam: "image_size",
    sizes: FLUX_SIZES,
  },
  {
    id: "flux-schnell",
    kind: "image",
    label: "FLUX Schnell",
    tagline: "Fastest drafts",
    provider: "Black Forest Labs",
    family: "flux",
    endpoints: { text: "fal-ai/flux/schnell" },
    cost: { text: 1, image: 1 },
    aspects: Object.keys(FLUX_SIZES),
    sizeParam: "image_size",
    sizes: FLUX_SIZES,
  },
  {
    id: "flux-dev",
    kind: "image",
    label: "FLUX Dev",
    tagline: "Quality + img2img",
    provider: "Black Forest Labs",
    family: "flux",
    endpoints: {
      text: "fal-ai/flux/dev",
      image: "fal-ai/flux/dev/image-to-image",
    },
    cost: { text: 2, image: 3 },
    aspects: Object.keys(FLUX_SIZES),
    sizeParam: "image_size",
    sizes: FLUX_SIZES,
  },
  {
    id: "nano-banana",
    kind: "image",
    label: "Nano Banana",
    tagline: "Best at edits",
    provider: "Google",
    family: "gemini",
    endpoints: {
      text: "fal-ai/nano-banana",
      image: "fal-ai/nano-banana/edit",
    },
    cost: { text: 3, image: 4 },
    aspects: Object.keys(RATIO_SIZES),
    sizeParam: "aspect_ratio",
    sizes: RATIO_SIZES,
  },
  {
    id: "imagen-4",
    kind: "image",
    label: "Imagen 4",
    tagline: "Photoreal",
    provider: "Google",
    family: "imagen",
    endpoints: { text: "fal-ai/imagen4/preview" },
    cost: { text: 3, image: 3 },
    aspects: Object.keys(IMAGEN_SIZES),
    sizeParam: "aspect_ratio",
    sizes: IMAGEN_SIZES,
  },
  {
    id: "flux-2-pro",
    kind: "image",
    label: "FLUX 2 Pro",
    tagline: "Frontier quality",
    provider: "Black Forest Labs",
    family: "flux",
    endpoints: { text: "fal-ai/flux-2-pro" },
    cost: { text: 4, image: 4 },
    aspects: Object.keys(FLUX_SIZES),
    sizeParam: "image_size",
    sizes: FLUX_SIZES,
  },
  {
    id: "seedream-4.5",
    kind: "image",
    label: "Seedream 4.5",
    tagline: "Text + edits",
    provider: "ByteDance Seedream",
    family: "seedream",
    endpoints: {
      text: "fal-ai/bytedance/seedream/v4.5/text-to-image",
      image: "fal-ai/bytedance/seedream/v4.5/edit",
    },
    cost: { text: 3, image: 4 },
    aspects: Object.keys(FLUX_SIZES),
    sizeParam: "image_size",
    sizes: FLUX_SIZES,
  },
  {
    id: "seedream-5-lite",
    kind: "image",
    label: "Seedream 5.0 Lite",
    tagline: "Fast Seedream",
    provider: "ByteDance Seedream",
    family: "seedream",
    endpoints: {
      text: "fal-ai/bytedance/seedream/v5/lite/text-to-image",
      image: "fal-ai/bytedance/seedream/v5/lite/edit",
    },
    cost: { text: 3, image: 4 },
    aspects: Object.keys(FLUX_SIZES),
    sizeParam: "image_size",
    sizes: FLUX_SIZES,
  },
  {
    id: "seedream-5-pro",
    kind: "image",
    label: "Seedream 5.0",
    tagline: "Flagship ByteDance",
    provider: "ByteDance Seedream",
    family: "seedream",
    endpoints: {
      text: "bytedance/seedream/v5/pro/text-to-image",
      image: "bytedance/seedream/v5/pro/edit",
    },
    cost: { text: 5, image: 6 },
    aspects: Object.keys(FLUX_SIZES),
    sizeParam: "image_size",
    sizes: FLUX_SIZES,
  },
  {
    id: "nano-banana-2",
    kind: "image",
    label: "Nano Banana 2",
    tagline: "Fast Gemini image",
    provider: "Google",
    family: "gemini",
    endpoints: {
      text: "fal-ai/nano-banana-2",
      image: "fal-ai/nano-banana-2/edit",
    },
    cost: { text: 3, image: 4 },
    aspects: Object.keys(RATIO_SIZES),
    sizeParam: "aspect_ratio",
    sizes: RATIO_SIZES,
  },
  {
    id: "nano-banana-pro",
    kind: "image",
    label: "Nano Banana Pro",
    tagline: "Highest Gemini quality",
    provider: "Google",
    family: "gemini",
    endpoints: {
      text: "fal-ai/nano-banana-pro",
      image: "fal-ai/nano-banana-pro/edit",
    },
    cost: { text: 6, image: 7 },
    aspects: Object.keys(RATIO_SIZES),
    sizeParam: "aspect_ratio",
    sizes: RATIO_SIZES,
  },
  {
    id: "gpt-image",
    kind: "image",
    label: "GPT Image",
    tagline: "OpenAI GPT Image 1.5",
    provider: "OpenAI",
    family: "openai",
    endpoints: { text: "fal-ai/gpt-image-1.5" },
    cost: { text: 5, image: 5 },
    aspects: Object.keys(GPT_SIZES),
    sizeParam: "image_size",
    sizes: GPT_SIZES,
  },
  {
    id: "grok-imagine",
    kind: "image",
    label: "Grok Imagine",
    tagline: "xAI Grok image",
    provider: "xAI",
    family: "grok",
    endpoints: { text: "xai/grok-imagine-image" },
    cost: { text: 2, image: 2 },
    aspects: Object.keys(RATIO_SIZES),
    sizeParam: "aspect_ratio",
    sizes: RATIO_SIZES,
  },
  {
    id: "qwen-image",
    kind: "image",
    label: "Qwen Image",
    tagline: "Strong text rendering",
    provider: "Alibaba Qwen",
    family: "qwen",
    endpoints: { text: "fal-ai/qwen-image" },
    cost: { text: 2, image: 2 },
    aspects: Object.keys(FLUX_SIZES),
    sizeParam: "image_size",
    sizes: FLUX_SIZES,
  },
];

export const VIDEO_MODELS: FalModelDef[] = [
  {
    id: "flux-3-video-draft",
    kind: "video",
    label: "FLUX 3 Draft",
    tagline: "Free-tier cheap preview",
    provider: "Black Forest Labs",
    family: "flux",
    endpoints: {
      text: "blackforestlabs/flux-3/text-to-video/draft",
      image: "blackforestlabs/flux-3/image-to-video/draft",
    },
    cost: { text: 1, image: 1 },
    aspects: ["16:9", "9:16", "1:1", "21:9"],
    durations: [5, 8, 10],
  },
  {
    id: "grok-imagine-video-1.5",
    kind: "video",
    label: "Grok Imagine 1.5",
    tagline: "Free-tier xAI video",
    provider: "xAI",
    family: "grok",
    endpoints: {
      text: "xai/grok-imagine-video/v1.5/text-to-video",
      image: "xai/grok-imagine-video/v1.5/image-to-video",
    },
    cost: { text: 1, image: 1 },
    aspects: ["16:9", "9:16", "1:1"],
    durations: [6, 8, 10],
  },
  {
    id: "kling-o3",
    kind: "video",
    label: "Kling O3",
    tagline: "Realistic motion",
    provider: "Kuaishou Kling",
    family: "kling",
    endpoints: {
      text: "fal-ai/kling-video/o3/standard/text-to-video",
      image: "fal-ai/kling-video/o3/standard/image-to-video",
    },
    cost: { text: 8, image: 8 },
    aspects: ["16:9", "9:16", "1:1"],
    durations: [5, 8, 10],
  },
  {
    id: "kling-o3-pro",
    kind: "video",
    label: "Kling O3 Pro",
    tagline: "Kling flagship",
    provider: "Kuaishou Kling",
    family: "kling",
    endpoints: {
      text: "fal-ai/kling-video/o3/pro/text-to-video",
      image: "fal-ai/kling-video/o3/pro/image-to-video",
    },
    cost: { text: 12, image: 12 },
    aspects: ["16:9", "9:16", "1:1"],
    durations: [5, 8, 10],
  },
  {
    id: "veo-3.1-fast",
    kind: "video",
    label: "Veo 3.1 Fast",
    tagline: "Faster Veo",
    provider: "Google",
    family: "veo",
    endpoints: {
      text: "fal-ai/veo3.1/fast",
      image: "fal-ai/veo3.1/fast/image-to-video",
    },
    cost: { text: 12, image: 12 },
    aspects: ["16:9", "9:16"],
    durations: [4, 6, 8],
    negativePromptParam: "negative_prompt",
  },
  {
    id: "veo-3.1",
    kind: "video",
    label: "Veo 3.1",
    tagline: "Google cinematic",
    provider: "Google",
    family: "veo",
    endpoints: {
      text: "fal-ai/veo3.1",
      image: "fal-ai/veo3.1/image-to-video",
    },
    cost: { text: 16, image: 16 },
    aspects: ["16:9", "9:16"],
    durations: [4, 6, 8],
    negativePromptParam: "negative_prompt",
  },
  {
    id: "gemini-omni-flash",
    kind: "video",
    label: "Gemini Omni Flash",
    tagline: "Physics + audio",
    provider: "Google",
    family: "omni",
    endpoints: {
      text: "google/gemini-omni-flash",
      image: "google/gemini-omni-flash/image-to-video",
    },
    cost: { text: 10, image: 10 },
    aspects: ["16:9", "9:16"],
    durations: [5, 8, 10],
  },
  {
    id: "seedance-2",
    kind: "video",
    label: "Seedance 2.0",
    tagline: "Director control",
    provider: "ByteDance Seedance",
    family: "seedance",
    endpoints: {
      text: "bytedance/seedance-2.0/text-to-video",
      image: "bytedance/seedance-2.0/image-to-video",
    },
    cost: { text: 10, image: 10 },
    aspects: ["16:9", "9:16", "1:1", "21:9"],
    durations: [5, 8, 10],
  },
  {
    id: "seedance-2.5",
    kind: "video",
    label: "Seedance 2.5",
    tagline: "Longer coherent shots",
    provider: "ByteDance Seedance",
    family: "seedance",
    endpoints: {
      text: "bytedance/seedance-2.5/text-to-video",
      image: "bytedance/seedance-2.5/image-to-video",
    },
    cost: { text: 14, image: 14 },
    aspects: ["16:9", "9:16", "1:1", "21:9"],
    durations: [5, 8, 10],
  },
  {
    id: "hailuo-2.3",
    kind: "video",
    label: "Hailuo 2.3",
    tagline: "MiniMax video",
    provider: "MiniMax",
    family: "hailuo",
    endpoints: {
      text: "fal-ai/minimax/hailuo-2.3/standard/text-to-video",
      image: "fal-ai/minimax/hailuo-2.3/standard/image-to-video",
    },
    cost: { text: 8, image: 8 },
    aspects: ["16:9", "9:16", "1:1"],
    durations: [6, 10],
  },
  {
    id: "grok-imagine-video",
    kind: "video",
    label: "Grok Imagine",
    tagline: "xAI video + audio",
    provider: "xAI",
    family: "grok",
    endpoints: {
      text: "xai/grok-imagine-video/text-to-video",
      image: "xai/grok-imagine-video/image-to-video",
    },
    cost: { text: 8, image: 8 },
    aspects: ["16:9", "9:16", "1:1"],
    durations: [5, 6, 10],
  },
  {
    id: "flux-3-video",
    kind: "video",
    label: "FLUX 3",
    tagline: "BFL frontier video",
    provider: "Black Forest Labs",
    family: "flux",
    endpoints: {
      text: "blackforestlabs/flux-3/text-to-video",
      image: "blackforestlabs/flux-3/image-to-video",
    },
    cost: { text: 14, image: 14 },
    aspects: ["16:9", "9:16", "1:1", "21:9"],
    durations: [5, 8, 10],
  },
  {
    id: "happy-horse",
    kind: "video",
    label: "Happy Horse 1.1",
    tagline: "Lip-sync + audio",
    provider: "Alibaba",
    family: "horse",
    endpoints: {
      text: "alibaba/happy-horse/v1.1/text-to-video",
      image: "alibaba/happy-horse/v1.1/image-to-video",
    },
    cost: { text: 10, image: 10 },
    aspects: ["16:9", "9:16", "1:1", "21:9"],
    durations: [5, 8, 10],
  },
  {
    id: "wan-2.7",
    kind: "video",
    label: "Wan 2.7",
    tagline: "Smooth Alibaba motion",
    provider: "Alibaba",
    family: "wan",
    endpoints: {
      text: "fal-ai/wan/v2.7/text-to-video",
      image: "fal-ai/wan/v2.7/image-to-video",
    },
    cost: { text: 8, image: 8 },
    aspects: ["16:9", "9:16", "1:1"],
    durations: [5, 8, 10],
    negativePromptParam: "negative_prompt",
  },
];

const ALL_MODELS = [...IMAGE_MODELS, ...VIDEO_MODELS];

export function getModel(id: string): FalModelDef | undefined {
  return ALL_MODELS.find((m) => m.id === id);
}

export function modelsFor(kind: GenKind): FalModelDef[] {
  return kind === "image" ? IMAGE_MODELS : VIDEO_MODELS;
}

export function defaultModelFor(kind: GenKind): FalModelDef {
  return modelsFor(kind)[0];
}

/** Group models by provider, preserving registry order, for the picker UI. */
export function groupByProvider(
  models: FalModelDef[],
): Array<{ provider: string; models: FalModelDef[] }> {
  const groups: Array<{ provider: string; models: FalModelDef[] }> = [];
  for (const m of models) {
    const existing = groups.find((g) => g.provider === m.provider);
    if (existing) existing.models.push(m);
    else groups.push({ provider: m.provider, models: [m] });
  }
  return groups;
}

export function modelSupportsImageInput(m: FalModelDef): boolean {
  return Boolean(m.endpoints.image);
}

export function costFor(m: FalModelDef, withImage: boolean): number {
  return withImage ? m.cost.image : m.cost.text;
}

/** Clamp a UI aspect to something the model supports. */
export function resolveAspect(m: FalModelDef, aspect: string): string {
  return m.aspects.includes(aspect) ? aspect : m.aspects[0];
}

/** Clamp a UI duration (seconds) to something the model supports. */
export function resolveDuration(m: FalModelDef, seconds: number): number {
  if (!m.durations || m.durations.length === 0) return seconds;
  if (m.durations.includes(seconds)) return seconds;
  return m.durations.reduce((best, d) =>
    Math.abs(d - seconds) < Math.abs(best - seconds) ? d : best,
  );
}
