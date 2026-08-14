"use client";

import { useState } from "react";
import {
  Eraser,
  Expand,
  Paintbrush,
  SunMedium,
  Upload,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tool = {
  id: string;
  icon: LucideIcon;
  title: string;
  body: string;
  cost: number;
  tone: string;
};

const TOOLS: Tool[] = [
  {
    id: "upscale",
    icon: Expand,
    title: "Upscale to 4K",
    body: "Crystal-sharp detail reconstruction for print and thumbnails.",
    cost: 1,
    tone: "text-solar border-solar/25 bg-solar/8",
  },
  {
    id: "inpaint",
    icon: Paintbrush,
    title: "Magic Inpaint",
    body: "Brush over anything — hands, text, artifacts — and re-render it.",
    cost: 1,
    tone: "text-nova-soft border-nova/25 bg-nova/8",
  },
  {
    id: "relight",
    icon: SunMedium,
    title: "Relight",
    body: "Re-sculpt the lighting of any render: golden hour, noir, neon.",
    cost: 2,
    tone: "text-mint border-mint/25 bg-mint/8",
  },
  {
    id: "remove-bg",
    icon: Eraser,
    title: "Remove Background",
    body: "Clean alpha cutouts for stickers, merch and composites.",
    cost: 1,
    tone: "text-frost border-line bg-white/5",
  },
];

export function EnhanceView() {
  const [tool, setTool] = useState("upscale");
  const [fileName, setFileName] = useState<string | null>(null);
  const active = TOOLS.find((t) => t.id === tool)!;

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pt-10 pb-16 sm:px-8">
      <header className="mb-8">
        <p className="text-[0.66rem] font-bold tracking-[0.28em] uppercase text-nova-soft">
          Post-production suite
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
          Enhance &{" "}
          <span className="font-serif italic text-solar-gradient">perfect</span>
        </h1>
        <p className="mt-2 max-w-lg text-[0.86rem] leading-relaxed text-frost-faint">
          Take any render the last mile — upscale, relight, inpaint or cut out.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,22rem)_1fr]">
        <div>
          <label
            htmlFor="enhance-upload"
            className="group flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-line/90 bg-ink-card/40 px-6 py-14 text-center transition-all hover:border-solar/50 hover:bg-ink-card/70"
          >
            <span className="grid size-12 place-items-center rounded-2xl border border-line bg-ink-soft transition-transform duration-300 group-hover:-translate-y-1">
              <Upload className="size-5 text-solar" />
            </span>
            <p className="mt-4 text-[0.88rem] font-medium">
              {fileName ?? "Drop an image here"}
            </p>
            <p className="mt-1 text-[0.74rem] text-frost-faint">
              PNG, JPEG or WebP · up to 8 MB
            </p>
            <input
              id="enhance-upload"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
            />
          </label>

          <button
            disabled={!fileName}
            className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-solar py-3 text-[0.84rem] font-bold text-on-solar transition-all hover:not-disabled:shadow-[0_10px_36px_-8px_rgba(255,212,38,0.65)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <active.icon className="size-4" />
            Run {active.title} · {active.cost} cr
          </button>
        </div>

        <div className="grid content-start gap-3 sm:grid-cols-2">
          {TOOLS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTool(t.id)}
              className={cn(
                "group cursor-pointer rounded-2xl border p-5 text-left transition-all duration-200",
                tool === t.id
                  ? "border-solar/50 bg-ink-card shadow-[0_0_40px_-16px_rgba(255,212,38,0.4)]"
                  : "border-line/70 bg-ink-card/50 hover:border-line hover:bg-ink-card/80",
              )}
            >
              <span
                className={cn(
                  "inline-grid size-10 place-items-center rounded-xl border",
                  t.tone,
                )}
              >
                <t.icon className="size-4.5" />
              </span>
              <h3 className="mt-3.5 text-[0.92rem] font-semibold">{t.title}</h3>
              <p className="mt-1 text-[0.76rem] leading-relaxed text-frost-faint">
                {t.body}
              </p>
              <p className="mt-3 font-mono text-[0.66rem] text-frost-faint">
                {t.cost} credit{t.cost > 1 ? "s" : ""} / run
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
