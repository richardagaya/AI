"use client";

import { ImageIcon, Layers, Type, Wand2 } from "lucide-react";
import { MediaCard } from "@/components/ui/media-card";
import { Reveal, SectionLabel } from "@/components/ui/reveal";
import { Snowflake } from "@/components/brand/snowflake";
import { SHOWCASE } from "@/lib/media";

const SETTINGS = [
  { icon: Type, label: "Mode", value: "Text → Image" },
  { icon: Layers, label: "Model", value: "minsuro-core" },
  { icon: ImageIcon, label: "Aspect", value: "2:3 portrait" },
];

export function StudioPreview() {
  return (
    <section
      id="studio"
      className="relative scroll-mt-24 overflow-hidden py-24 sm:py-32"
    >
      <div className="absolute top-1/2 left-1/2 -z-10 size-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-solar/6 blur-[140px]" />

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="max-w-2xl">
          <SectionLabel>The console</SectionLabel>
          <h2 className="text-[clamp(2.1rem,5vw,3.6rem)] leading-[0.95] font-semibold tracking-[-0.045em]">
            One panel. Prompt in,
            <span className="font-serif font-normal italic text-solar"> frame out.</span>
          </h2>
          <p className="mt-5 text-[0.95rem] leading-relaxed text-frost-dim sm:text-base">
            No node graphs, no sampler jargon. Type what you want, pick a mode, and
            watch jobs stream back into your gallery while you keep writing.
          </p>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="mt-14 rounded-[2rem] border border-line/80 bg-gradient-to-b from-ink-card to-ink-soft p-2 shadow-[0_60px_140px_-60px_rgba(255,212,38,0.25)] sm:p-3">
            <div className="rounded-[1.6rem] border border-line/60 bg-ink/80 backdrop-blur-xl">
              <div className="flex items-center gap-3 border-b border-line/60 px-5 py-3.5">
                <Snowflake className="size-4 text-solar" strokeWidth={6} />
                <span className="text-[0.78rem] font-medium tracking-[-0.01em]">
                  minsuro studio
                </span>
                <span className="ml-auto flex items-center gap-1.5 rounded-full border border-solar/25 bg-solar/8 px-2.5 py-1 font-mono text-[0.62rem] text-solar">
                  <span className="size-1.5 rounded-full bg-solar" />
                  128 credits
                </span>
              </div>

              <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_1.15fr]">
                <div className="flex flex-col gap-4">
                  <div className="rounded-2xl border border-line/70 bg-ink-soft/70 p-4">
                    <span className="text-[0.62rem] font-semibold tracking-[0.16em] uppercase text-frost-faint">
                      Prompt
                    </span>
                    <p className="mt-2.5 font-mono text-[0.8rem] leading-relaxed text-frost/90">
                      frost sorceress, silver hair, falling snow, cinematic key
                      light, ultra detailed
                      <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse bg-solar align-middle" />
                    </p>
                  </div>

                  <div className="grid gap-2.5 sm:grid-cols-3">
                    {SETTINGS.map((s) => (
                      <div
                        key={s.label}
                        className="rounded-xl border border-line/70 bg-ink-soft/50 p-3"
                      >
                        <s.icon className="size-3.5 text-solar/80" />
                        <p className="mt-2 text-[0.58rem] tracking-[0.14em] uppercase text-frost-faint">
                          {s.label}
                        </p>
                        <p className="mt-0.5 truncate text-[0.74rem] text-frost">
                          {s.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="flex h-12 items-center justify-center gap-2 rounded-full bg-solar text-[0.82rem] font-semibold text-on-solar">
                    <Wand2 className="size-4" />
                    Generate · 1 credit
                  </div>

                  <div className="flex-1 rounded-2xl border border-line/70 bg-ink-soft/50 p-4">
                    <div className="flex items-center justify-between text-[0.62rem] tracking-[0.14em] uppercase">
                      <span className="text-frost-faint">Queue</span>
                      <span className="font-mono text-solar">running</span>
                    </div>
                    {[
                      { label: "frost sorceress", pct: 92 },
                      { label: "kitsune priestess", pct: 48 },
                      { label: "neon rain elf", pct: 12 },
                    ].map((j) => (
                      <div key={j.label} className="mt-3">
                        <div className="flex justify-between font-mono text-[0.64rem] text-frost-dim">
                          <span className="truncate">{j.label}</span>
                          <span>{j.pct}%</span>
                        </div>
                        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/8">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-solar-deep to-solar"
                            style={{ width: `${j.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[SHOWCASE[0], SHOWCASE[1], SHOWCASE[3], SHOWCASE[2]].map((m) => (
                    <MediaCard
                      key={m.id}
                      media={m}
                      play="hover"
                      showCaption={false}
                      className="aspect-4/5 rounded-2xl"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
