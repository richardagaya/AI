"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  Check,
  ChevronDown,
  Clock,
  Dices,
  ImagePlus,
  Loader2,
  Video,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import {
  costFor,
  defaultModelFor,
  getModel,
  modelSupportsImageInput,
  modelsFor,
  UI_ASPECTS,
} from "@/lib/fal-models";
import { Dropdown, DropdownOption } from "@/components/ui/dropdown";
import { cn } from "@/lib/utils";
import { ModelPicker } from "./model-picker";
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

const CAMERA_MOVES = ["Static", "Orbit", "Dolly in", "Crane up", "Handheld"];

const QUALITY_TAGS =
  "ultra detailed, cinematic lighting, sharp focus, 8k, masterpiece";

/** Little proportional rectangle that previews an aspect ratio. */
function AspectGlyph({ id, active }: { id: string; active?: boolean }) {
  const spec = UI_ASPECTS.find((a) => a.id === id);
  if (!spec) return null;
  return (
    <span
      className={cn(
        "shrink-0 rounded-[3px] border",
        active ? "border-solar" : "border-current",
      )}
      style={{ width: spec.w, height: spec.h }}
    />
  );
}

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
    image,
    busy,
    error,
    onPromptChange,
    onNegativePromptChange,
    onModeChange,
    onImageChange,
    onGenerate,
  } = handlers;

  const isVideo = variant === "video";
  const kind = isVideo ? "video" : "image";
  const models = modelsFor(kind);

  const [modelId, setModelId] = useState(defaultModelFor(kind).id);
  const model = getModel(modelId) ?? defaultModelFor(kind);

  const [aspect, setAspect] = useState(isVideo ? "16:9" : "2:3");
  const [duration, setDuration] = useState(model.durations?.[1] ?? 8);
  const [camera, setCamera] = useState("Orbit");
  const [strength, setStrength] = useState(0.8);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [suggestionIdx, setSuggestionIdx] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const enhanced = prompt.includes(QUALITY_TAGS);

  const acceptsImage = modelSupportsImageInput(model);
  const usesImage = Boolean(image && acceptsImage);
  const needsImage = !isVideo && mode === "img2img";
  const canGenerate = prompt.trim().length > 0 && (!needsImage || usesImage);
  const cost = costFor(model, usesImage);

  const aspects = UI_ASPECTS.filter((a) => model.aspects.includes(a.id));

  // Preview URL for the attached reference image
  const previewUrl = useMemo(
    () => (image ? URL.createObjectURL(image) : null),
    [image],
  );
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    const t = setInterval(
      () => setSuggestionIdx((i) => (i + 1) % SUGGESTIONS.length),
      4200,
    );
    return () => clearInterval(t);
  }, []);

  function selectModel(id: string) {
    const m = getModel(id);
    if (!m) return;
    setModelId(id);
    if (!m.aspects.includes(aspect)) setAspect(m.aspects[0]);
    if (m.durations && !m.durations.includes(duration)) {
      setDuration(m.durations[0]);
    }
    if (!modelSupportsImageInput(m)) clearImage();
  }

  function pickImage(f: File | null) {
    if (!f) return;
    onImageChange(f);
    if (!isVideo) onModeChange("img2img");
  }

  function clearImage() {
    onImageChange(null);
    if (fileRef.current) fileRef.current.value = "";
    if (!isVideo) onModeChange("text2img");
  }

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

  function generate() {
    if (!canGenerate || busy) return;
    onGenerate({
      kind,
      model: model.id,
      aspect,
      duration: isVideo ? String(duration) : undefined,
      camera: isVideo ? camera : undefined,
      strength: !isVideo && usesImage ? strength : undefined,
    });
  }

  return (
    <div className="w-full">
      {/* Model picker — searchable, grouped by provider */}
      <div className="mb-3 flex flex-wrap items-center gap-2 px-1">
        <span className="mr-1 shrink-0 text-[0.62rem] font-bold tracking-[0.2em] uppercase text-frost-faint">
          Model
        </span>
        <ModelPicker
          models={models}
          value={model}
          onChange={selectModel}
          withImage={usesImage}
        />
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
                generate();
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

          {/* Attached reference image preview */}
          {image && previewUrl && (
            <div className="mx-4 mb-1 flex items-center gap-3 rounded-2xl border border-line/70 bg-ink-soft/60 p-2.5 sm:mx-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Reference upload"
                className="size-11 shrink-0 rounded-xl border border-line/60 object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[0.78rem] font-semibold text-frost">
                  {image.name}
                </p>
                <p className="text-[0.66rem] tracking-[0.08em] uppercase text-frost-faint">
                  {isVideo ? "Start frame · image to video" : "Reference · image to image"}
                </p>
              </div>
              <button
                onClick={clearImage}
                aria-label="Remove image"
                className="cursor-pointer rounded-lg p-1.5 text-frost-faint transition-colors hover:bg-white/5 hover:text-red-400"
              >
                <X className="size-4" />
              </button>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 border-t border-line/50 px-4 py-3 sm:px-5">
            {/* Aspect ratio — options limited to what the model supports */}
            <Dropdown
              label="Aspect ratio"
              trigger={
                <span className="flex items-center gap-1.5">
                  <AspectGlyph id={aspect} active />
                  {aspect}
                </span>
              }
            >
              {(close) => (
                <div className="py-1.5">
                  {aspects.map((a) => (
                    <DropdownOption
                      key={a.id}
                      selected={aspect === a.id}
                      onSelect={() => {
                        setAspect(a.id);
                        close();
                      }}
                    >
                      <AspectGlyph id={a.id} active={aspect === a.id} />
                      <span className="flex-1 font-semibold">{a.label}</span>
                      {aspect === a.id && <Check className="size-3.5" />}
                    </DropdownOption>
                  ))}
                </div>
              )}
            </Dropdown>

            {isVideo && (
              <>
                <Dropdown label="Duration" trigger={<span>{duration}s</span>}>
                  {(close) => (
                    <div className="py-1.5">
                      {(model.durations ?? []).map((d) => (
                        <DropdownOption
                          key={d}
                          selected={duration === d}
                          onSelect={() => {
                            setDuration(d);
                            close();
                          }}
                        >
                          <Clock className="size-3.5 shrink-0" />
                          <span className="flex-1 font-semibold">{d} seconds</span>
                          {duration === d && <Check className="size-3.5" />}
                        </DropdownOption>
                      ))}
                    </div>
                  )}
                </Dropdown>

                <Dropdown label="Camera move" trigger={<span>{camera}</span>}>
                  {(close) => (
                    <div className="py-1.5">
                      {CAMERA_MOVES.map((c) => (
                        <DropdownOption
                          key={c}
                          selected={camera === c}
                          onSelect={() => {
                            setCamera(c);
                            close();
                          }}
                        >
                          <Video className="size-3.5 shrink-0" />
                          <span className="flex-1 font-semibold">{c}</span>
                          {camera === c && <Check className="size-3.5" />}
                        </DropdownOption>
                      ))}
                    </div>
                  )}
                </Dropdown>
              </>
            )}

            <div className="mx-1 hidden h-5 w-px bg-line/70 sm:block" />

            {/* Reference image upload — both tabs (img2img / image2video) */}
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => pickImage(e.target.files?.[0] ?? null)}
              className="sr-only"
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={!acceptsImage}
              title={
                acceptsImage
                  ? isVideo
                    ? "Upload a start frame (image to video)"
                    : "Upload a reference image (image to image)"
                  : `${model.label} doesn't take image input`
              }
              className={cn(
                "cursor-pointer rounded-full border p-2.5 transition-all disabled:cursor-not-allowed disabled:opacity-35",
                image
                  ? "border-solar/60 bg-solar/10 text-solar"
                  : "border-line/70 bg-ink-soft/60 text-frost-faint hover:border-solar/50 hover:text-solar",
              )}
            >
              <ImagePlus className="size-4" />
            </button>
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
                onClick={generate}
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
                  <option value="text2img">Text → Image · {model.cost.text} cr</option>
                  <option value="img2img" disabled={!acceptsImage}>
                    Image → Image · {model.cost.image} cr
                    {acceptsImage ? "" : " (unsupported on this model)"}
                  </option>
                </select>
              </label>
              {mode === "img2img" && (
                <>
                  <div className="grid gap-2 sm:col-span-2">
                    <span className="text-[0.62rem] font-bold tracking-[0.18em] uppercase text-frost-faint">
                      Reference image
                    </span>
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-line bg-ink-soft/60 p-4 text-left transition-colors hover:border-solar/40"
                    >
                      <ImagePlus className="size-4 shrink-0 text-solar" />
                      <span className="min-w-0 flex-1 truncate text-[0.8rem] text-frost-dim">
                        {image?.name ?? "PNG, JPEG or WebP · up to 8 MB"}
                      </span>
                      <span className="rounded-full border border-line px-3 py-1.5 text-[0.72rem] font-medium transition-colors hover:border-solar/50 hover:text-solar">
                        {image ? "Replace" : "Choose"}
                      </span>
                    </button>
                  </div>
                  <label className="grid gap-2 sm:col-span-2">
                    <span className="flex items-center justify-between text-[0.62rem] font-bold tracking-[0.18em] uppercase text-frost-faint">
                      Denoise strength
                      <span className="font-mono text-solar">{strength.toFixed(2)}</span>
                    </span>
                    <input
                      type="range"
                      min={0.1}
                      max={1}
                      step={0.05}
                      value={strength}
                      onChange={(e) => setStrength(Number(e.target.value))}
                      className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/[0.08] accent-solar"
                    />
                    <span className="text-[0.68rem] text-frost-faint">
                      Lower keeps more of your image, higher reimagines it.
                    </span>
                  </label>
                </>
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
