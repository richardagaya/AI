"use client";

import {
  Bitcoin,
  Gauge,
  Images,
  Layers2,
  ShieldOff,
  Sparkles,
} from "lucide-react";
import { Reveal, SectionLabel } from "@/components/ui/reveal";

const ITEMS = [
  {
    icon: Gauge,
    title: "Thirty second frames",
    body: "Jobs hit a dedicated GPU queue the moment you submit. Stack five prompts and results land while you are still typing the sixth.",
  },
  {
    icon: ShieldOff,
    title: "No filters, no strikes",
    body: "Mature themes, explicit scenes, any character you can describe. No keyword blocklist, no silent downranking, no policy roulette.",
  },
  {
    icon: Layers2,
    title: "Text and image input",
    body: "Start from a blank prompt or drop a reference frame and steer it. Same console, same credits, two ways in.",
  },
  {
    icon: Images,
    title: "Everything stays yours",
    body: "Full resolution downloads with no watermark and no licence games. Your gallery keeps every prompt for re-runs.",
  },
  {
    icon: Bitcoin,
    title: "Crypto checkout",
    body: "Top up through Coinbase Commerce in a couple of clicks. No card processor deciding what art you are allowed to make.",
  },
  {
    icon: Sparkles,
    title: "Prompt memory",
    body: "Negative prompts, models and settings persist per job, so a look you liked last week is one click from happening again.",
  },
];

export function Capabilities() {
  return (
    <section className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
      <Reveal className="max-w-2xl">
        <SectionLabel>Why minsuro</SectionLabel>
        <h2 className="text-[clamp(2.1rem,5vw,3.6rem)] leading-[0.95] font-semibold tracking-[-0.045em]">
          Built for people who got
          <span className="font-serif font-normal italic text-solar"> tired of asking.</span>
        </h2>
      </Reveal>

      <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ITEMS.map((item, i) => (
          <Reveal key={item.title} delay={(i % 3) * 0.08}>
            <div className="group relative h-full overflow-hidden rounded-3xl border border-line/70 bg-ink-card/60 p-7 transition-all duration-400 hover:-translate-y-1 hover:border-solar/35 hover:bg-ink-card">
              <div className="pointer-events-none absolute -top-24 -right-24 size-48 rounded-full bg-solar/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />
              <div className="grid size-11 place-items-center rounded-2xl border border-solar/20 bg-solar/8 text-solar">
                <item.icon className="size-5" />
              </div>
              <h3 className="mt-6 text-[1.05rem] font-semibold tracking-[-0.02em]">
                {item.title}
              </h3>
              <p className="mt-3 text-[0.88rem] leading-relaxed text-frost-dim">
                {item.body}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
