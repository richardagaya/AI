"use client";

import { cn } from "@/lib/utils";
import type { FalModelDef } from "@/lib/fal-models";

/**
 * Brand marks shown in the model picker.
 *
 * SVGs are from Lobe Icons (MIT). The marks themselves are trademarks of
 * their owners — used here only to identify the models this studio runs.
 */
const MODEL_LOGOS: Record<string, string> = {
  "flux-schnell": "/logos/flux.svg",
  "flux-dev": "/logos/flux.svg",
  "flux-2-pro": "/logos/flux.svg",
  "flux-3-video": "/logos/flux.svg",
  "nano-banana": "/logos/nanobanana-color.svg",
  "nano-banana-2": "/logos/nanobanana-color.svg",
  "nano-banana-pro": "/logos/nanobanana-color.svg",
  "imagen-4": "/logos/deepmind-color.svg",
  "seedream-4.5": "/logos/jimeng-color.svg",
  "seedream-5-lite": "/logos/jimeng-color.svg",
  "seedream-5-pro": "/logos/jimeng-color.svg",
  "seedance-2": "/logos/jimeng-color.svg",
  "seedance-2.5": "/logos/jimeng-color.svg",
  "gpt-image": "/logos/openai.svg",
  "grok-imagine": "/logos/grok.svg",
  "grok-imagine-video": "/logos/grok.svg",
  "qwen-image": "/logos/qwen-color.svg",
  "kling-o3": "/logos/kling-color.svg",
  "kling-o3-pro": "/logos/kling-color.svg",
  "veo-3.1-fast": "/logos/vertexai-color.svg",
  "veo-3.1": "/logos/vertexai-color.svg",
  "gemini-omni-flash": "/logos/gemini-color.svg",
  "hailuo-2.3": "/logos/hailuo-color.svg",
  "happy-horse": "/logos/alibaba-color.svg",
  "wan-2.7": "/logos/qwen-color.svg",
};

const PROVIDER_LOGOS: Record<string, string> = {
  Google: "/logos/google-color.svg",
  "Black Forest Labs": "/logos/flux.svg",
  "ByteDance Seedance": "/logos/jimeng-color.svg",
  "ByteDance Seedream": "/logos/jimeng-color.svg",
  "Kuaishou Kling": "/logos/kling-color.svg",
  OpenAI: "/logos/openai.svg",
  xAI: "/logos/grok.svg",
  "Alibaba Qwen": "/logos/qwen-color.svg",
  Alibaba: "/logos/alibaba-color.svg",
  MiniMax: "/logos/minimax-color.svg",
};

function logoSrc(model?: FalModelDef, provider?: string): string | undefined {
  if (model && MODEL_LOGOS[model.id]) return MODEL_LOGOS[model.id];
  const name = provider ?? model?.provider;
  return name ? PROVIDER_LOGOS[name] : undefined;
}

/** Monochrome SVGs use currentColor (renders black in <img>) — invert on dark UI. */
function invertLogo(src: string): boolean {
  return !src.includes("-color");
}

export function ModelLogo({
  model,
  provider,
  className,
}: {
  model?: FalModelDef;
  provider?: string;
  className?: string;
}) {
  const src = logoSrc(model, provider);
  const label = model?.label ?? provider ?? "Model";

  if (!src) {
    const letter = label.slice(0, 1);
    return (
      <span
        className={cn(
          "grid size-7 shrink-0 place-items-center rounded-lg bg-white/10 text-[0.65rem] font-bold text-frost",
          className,
        )}
      >
        {letter}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "grid size-7 shrink-0 place-items-center rounded-lg bg-white/[0.07] p-1",
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        width={20}
        height={20}
        className={cn("size-5 object-contain", invertLogo(src) && "invert")}
      />
    </span>
  );
}
