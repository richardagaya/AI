"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ChevronDown,
  Dices,
  Loader2,
  Upload,
  Wand2,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { GenerateHandlers } from "./types";

const SUGGESTIONS = [
  "frost sorceress, silver hair, falling snow, cinematic key light…",
  "cyberpunk elf in neon rain, reflective puddles, 85mm portrait…",
  "kitsune priestess, gold leaf shrine, volumetric moonlight…",
  "ember dragon hatchling on a blacksmith's anvil, sparks flying…",
  "mermaid bioluminescent art, deep ocean glow, painterly…",
  "gothic waifu, dark fantasy cathedral, candlelight haze…",
];

const SURPRISE_PROMPTS = [
  "celestial kitsune priestess, nine glowing tails, gold leaf shrine, midnight volumetric light, ultra detailed",
  "cyberpunk elf mercenary, neon rain, chrome katana, reflective puddles, cinematic 85mm portrait",
  "frost sorceress weaving a blizzard, silver hair, ice crystal crown, falling snow, cinematic key light",
  "ember dragon hatchling curled on a blacksmith's anvil, sparks flying, warm forge glow, macro detail",
  "bioluminescent mermaid queen, deep ocean trench, glowing coral crown, painterly fantasy art",
  "gothic vampire waifu, ruined cathedral, candlelight haze, dark fantasy, intricate lace detail",
  "mecha samurai under cherry blossoms, solar gold armor, drifting petals, epic wide shot",
  "astral witch floating in a nebula library, floating grimoires, purple starlight, dreamy glow",
];

const IMAGE_MODELS = [
  { id: "default", label: "Minsuro Ultra" },
  { id: "anime-xl", label: "Anime XL" },
  { id: "photoreal", label: "Photoreal" },
  { id: "fantasy", label: "Fantasy" },
];

const VIDEO_MODELS = [
  { id: "motion-1", label: "Motion One" },
  { id: "cinema-xl", label: "Cinema XL" },
  { id: "anime-motion", label: "Anime Motion" },
];

const ASPECTS = [
  { id: "2:3", label: "2:3", w: 10, h: 15 },
  { id: "1:1", label: "1:1", w: 13, h: 13 },
  { id: "3:2", label: "3:2", w: 15, h: 10 },
  { id: "16:9", label: "16:9", w: 17, h: 10 },
  { id: "9:16", label: "9:16", w: 9, h: 16 },
];

const DURATIONS = ["4s", "8s", "16s"];
const CAMERA_MOVES = ["Static", "Orbit", "Dolly in", "Crane up", "Handheld"];

const QUALITY_TAGS =
  "ultra detailed, cinematic lighting, sharp focus, 8k, masterpiece";

export function Composer({
  variant,
  handlers,
}: {
  variant: "image" | "video";
  handlers: GenerateHandlers;
}) {
  const {
    prompt,
    negativePrompt,
    mode,
    model,
    image,
    busy,
    error,
    canGenerate,
    onPromptChange,
    onNegativePromptChange,
    onModeChange,
    onModelChange,
    onImageChange,
    onGenerate,
  } = handlers;

  const isVideo = variant === "video";
  const models = isVideo ? VIDEO_MODELS : IMAGE_MODELS;
  const activeModel = models.some((m) => m.id === model) ? model : models[0].id;

  const [aspect, setAspect] = useState(isVideo ? "16:9" : "2:3");
  const [duration, setDuration] = useState("8s");
  const [camera, setCamera] = useState("Orbit");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [suggestionIdx, setSuggestionIdx] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const enhanced = prompt.includes(QUALITY_TAGS);

  useEffect(() => {
    const t = setInterval(
      () => setSuggestionIdx((i) => (i + 1) % SUGGESTIONS.length),
      4200,
    );
    return () => clearInterval(t);
  }, []);

  function surprise() {
    const next =
      SURPRISE_PROMPTS[Math.floor(Math.random() * SURPRISE_PROMPTS.length)];
    onPromptChange(next);
    textareaRef.current?.focus();
  }

  function enhance() {
    if (!prompt.trim()) return surprise();
    if (enhanced) return;
    onPromptChange(`${prompt.replace(/[,.\s]+$/, "")}, ${QUALITY_TAGS}`);
  }

  const cost = isVideo ? 8 : mode === "img2img" ? 2 : 1;

  return (
    <div className="w-full">
      {/* Model chips */}
      <div className="no-scrollbar mb-3 flex items-center gap-2 overflow-x-auto px-1">
        <span className="mr-1 shrink-0 text-[0.62rem] font-bold tracking-[0.2em] uppercase text-frost-faint">
          Model
        </span>
        {models.map((m) => (
          <button
            key={m.id}
            onClick={() => onModelChange(m.id)}
            className={cn(
              "shrink-0 cursor-pointer rounded-full border px-3.5 py-1.5 text-[0.74rem] font-semibold transition-all duration-200",
              activeModel === m.id
                ? "border-solar/60 bg-solar/10 text-solar shadow-[0_0_20px_-6px_rgba(255,212,38,0.5)]"
                : "border-line/80 bg-white/[0.02] text-frost-faint hover:border-line hover:text-frost-dim",
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Composer card with flowing gradient border */}
      <div
        className={cn(
          "relative rounded-[26px] p-px transition-shadow duration-500",
          "bg-[linear-gradient(110deg,var(--color-line),var(--color-line))]",
          "focus-within:bg-[linear-gradient(110deg,var(--color-solar),var(--color-nova),var(--color-solar))] focus-within:bg-[size:300%_100%] focus-within:animate-border-flow",
          "focus-within:shadow-[0_0_60px_-18px_rgba(255,212,38,0.45)]",
        )}
      >
        <div className="rounded-[25px] bg-ink-card/95 backdrop-blur-xl">
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && canGenerate && !busy) {
                e.preventDefault();
                onGenerate();
              }
            }}
            rows={3}
            placeholder={
              isVideo
                ? "Describe the scene, the motion, the camera…"
                : SUGGESTIONS[suggestionIdx]
            }
            className="w-full resize-none rounded-t-[25px] bg-transparent p-5 text-[0.95rem] leading-relaxed text-frost outline-none placeholder:text-frost-faint/70 sm:p-6"
          />

          <div className="flex flex-wrap items-center gap-2 border-t border-line/50 px-4 py-3 sm:px-5">
            {/* Aspect ratios */}
            <div className="flex items-center gap-1 rounded-full border border-line/70 bg-ink-soft/60 p-1">
              {ASPECTS.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setAspect(a.id)}
                  title={a.label}
                  className={cn(
                    "flex cursor-pointer items-center gap-1.5 rounded-full px-2 py-1.5 transition-all",
                    aspect === a.id
                      ? "bg-white/[0.08] text-solar"
                      : "text-frost-faint hover:text-frost-dim",
                  )}
                >
                  <span
                    className={cn(
                      "rounded-[3px] border",
                      aspect === a.id ? "border-solar" : "border-current",
                    )}
                    style={{ width: a.w, height: a.h }}
                  />
                  <span className="hidden text-[0.62rem] font-semibold xl:inline">
                    {a.label}
                  </span>
                </button>
              ))}
            </div>

            {isVideo && (
              <>
                <div className="flex items-center gap-1 rounded-full border border-line/70 bg-ink-soft/60 p-1">
                  {DURATIONS.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={cn(
                        "cursor-pointer rounded-full px-2.5 py-1.5 text-[0.66rem] font-semibold transition-all",
                        duration === d
                          ? "bg-white/[0.08] text-solar"
                          : "text-frost-faint hover:text-frost-dim",
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
                <div className="no-scrollbar flex items-center gap-1 overflow-x-auto rounded-full border border-line/70 bg-ink-soft/60 p-1">
                  {CAMERA_MOVES.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCamera(c)}
                      className={cn(
                        "shrink-0 cursor-pointer rounded-full px-2.5 py-1.5 text-[0.66rem] font-semibold whitespace-nowrap transition-all",
                        camera === c
                          ? "bg-white/[0.08] text-solar"
                          : "text-frost-faint hover:text-frost-dim",
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </>
            )}

            <div className="mx-1 hidden h-5 w-px bg-line/70 sm:block" />

            <button
              onClick={surprise}
              title="Surprise me"
              className="cursor-pointer rounded-full border border-line/70 bg-ink-soft/60 p-2.5 text-frost-faint transition-all hover:border-nova/50 hover:text-nova-soft"
            >
              <Dices className="size-4" />
            </button>
            <button
              onClick={enhance}
              title="Enhance prompt"
              className={cn(
                "cursor-pointer rounded-full border p-2.5 transition-all",
                enhanced
                  ? "border-solar/60 bg-solar/10 text-solar"
                  : "border-line/70 bg-ink-soft/60 text-frost-faint hover:border-solar/50 hover:text-solar",
              )}
            >
              <Wand2 className="size-4" />
            </button>

            <div className="ml-auto flex items-center gap-2">
              {!isVideo && (
                <button
                  onClick={() => setAdvancedOpen((o) => !o)}
                  className={cn(
                    "flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-2 text-[0.7rem] font-semibold text-frost-faint transition-colors hover:text-frost",
                    advancedOpen && "text-solar",
                  )}
                >
                  Advanced
                  <ChevronDown
                    className={cn(
                      "size-3.5 transition-transform duration-300",
                      advancedOpen && "rotate-180",
                    )}
                  />
                </button>
              )}
              <button
                onClick={onGenerate}
                disabled={busy || !canGenerate}
                className={cn(
                  "group relative flex cursor-pointer items-center gap-2 overflow-hidden rounded-full bg-solar px-5 py-2.5 text-[0.8rem] font-bold text-on-solar transition-all duration-200",
                  "hover:not-disabled:shadow-[0_10px_36px_-8px_rgba(255,212,38,0.65)] hover:not-disabled:-translate-y-px",
                  "disabled:cursor-not-allowed disabled:opacity-40",
                )}
              >
                <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
                  <span className="absolute inset-y-0 w-1/3 animate-shine bg-white/30" />
                </span>
                {busy ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Zap className="size-4 fill-on-solar" />
                )}
                {busy ? "Rendering…" : "Generate"}
                <span className="rounded-full bg-on-solar/15 px-1.5 py-px font-mono text-[0.62rem] font-bold">
                  {cost} cr
                </span>
                <span className="hidden font-mono text-[0.6rem] opacity-60 lg:inline">
                  ⌘⏎
                </span>
              </button>
            </div>
          </div>

          {/* Advanced panel */}
          {!isVideo && advancedOpen && (
            <div className="grid gap-4 border-t border-line/50 p-5 sm:grid-cols-2 sm:p-6">
              <label className="grid gap-2">
                <span className="text-[0.62rem] font-bold tracking-[0.18em] uppercase text-frost-faint">
                  Negative prompt
                </span>
                <input
                  value={negativePrompt}
                  onChange={(e) => onNegativePromptChange(e.target.value)}
                  placeholder="blurry, deformed, low quality"
                  className="h-11 w-full rounded-xl border border-line bg-ink-soft/80 px-4 text-sm text-frost outline-none transition-all placeholder:text-frost-faint focus:border-solar/70 focus:ring-3 focus:ring-solar/12"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-[0.62rem] font-bold tracking-[0.18em] uppercase text-frost-faint">
                  Mode
                </span>
                <select
                  value={mode}
                  onChange={(e) =>
                    onModeChange(e.target.value as "text2img" | "img2img")
                  }
                  className="h-11 w-full rounded-xl border border-line bg-ink-soft/80 px-3 text-sm text-frost outline-none transition-all focus:border-solar/70 focus:ring-3 focus:ring-solar/12"
                >
                  <option value="text2img">Text → Image · 1 credit</option>
                  <option value="img2img">Image → Image · 2 credits</option>
                </select>
              </label>
              {mode === "img2img" && (
                <div className="grid gap-2 sm:col-span-2">
                  <span className="text-[0.62rem] font-bold tracking-[0.18em] uppercase text-frost-faint">
                    Reference image
                  </span>
                  <div className="flex items-center gap-3 rounded-xl border border-dashed border-line bg-ink-soft/60 p-4 transition-colors hover:border-solar/40">
                    <Upload className="size-4 shrink-0 text-solar" />
                    <span className="min-w-0 flex-1 truncate text-[0.8rem] text-frost-dim">
                      {image?.name ?? "PNG, JPEG or WebP · up to 8 MB"}
                    </span>
                    <input
                      id="composer-reference-upload"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(e) => onImageChange(e.target.files?.[0] ?? null)}
                      className="sr-only"
                    />
                    <label
                      htmlFor="composer-reference-upload"
                      className="cursor-pointer rounded-full border border-line px-3 py-1.5 text-[0.72rem] font-medium transition-colors hover:border-solar/50 hover:text-solar"
                    >
                      Choose
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-red-500/25 bg-red-500/8 p-3.5 text-[0.82rem] text-red-300">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
