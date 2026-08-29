"use client";

import { Layers, Palette, PenTool, SwatchBook } from "lucide-react";

const FEATURES = [
  {
    icon: SwatchBook,
    title: "Brand-locked looks",
    body: "Keep characters, palettes and type consistent across every still and clip.",
  },
  {
    icon: Layers,
    title: "Campaign sets",
    body: "Generate a whole pack — hero, crop and story sizes — from one brief.",
  },
  {
    icon: PenTool,
    title: "Iterate in place",
    body: "Tweak a frame without starting over. Same scene, new direction.",
  },
];

export function CreativeStudioView() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 pt-10 pb-16 sm:px-8">
      <header className="mb-8 text-center">
        <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-solar/30 bg-solar/10 px-3.5 py-1.5 text-[0.64rem] font-bold tracking-[0.22em] uppercase text-solar">
          <Palette className="size-3.5" />
          Creative Studio
        </p>
        <h1 className="mx-auto mt-4 max-w-2xl text-4xl font-semibold tracking-[-0.035em] text-balance sm:text-5xl">
          One brief.{" "}
          <span className="font-serif italic text-solar-gradient">
            A full creative pack
          </span>
        </h1>
        <p className="mx-auto mt-3 max-w-md text-[0.86rem] leading-relaxed text-frost-faint">
          Build on-brand stills and motion from a single prompt — then lock the
          look and ship the set.
        </p>
      </header>

      <div className="relative rounded-[26px] p-px bg-[linear-gradient(110deg,var(--color-line),var(--color-line))]">
        <div className="rounded-[25px] bg-ink-card/95 px-5 py-8 text-center sm:px-8">
          <p className="text-[0.95rem] leading-relaxed text-frost-dim">
            Generation is coming next. This page is the studio home for Creative
            Studio.
          </p>
        </div>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="group relative overflow-hidden rounded-2xl border border-line/70 bg-ink-card/60 p-5 transition-colors hover:border-solar/40"
          >
            <div className="pointer-events-none absolute -top-12 -right-12 size-28 rounded-full bg-solar/10 blur-2xl transition-opacity group-hover:bg-solar/20" />
            <f.icon className="size-5 text-solar" />
            <h3 className="mt-3 text-[0.92rem] font-semibold">{f.title}</h3>
            <p className="mt-1.5 text-[0.78rem] leading-relaxed text-frost-faint">
              {f.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
