"use client";

import { Reveal, SectionLabel } from "@/components/ui/reveal";

const STEPS = [
  {
    n: "01",
    title: "Create an account",
    body: "Email and password. No ID check, no KYC, no waitlist. Ten seconds and you are inside the studio.",
  },
  {
    n: "02",
    title: "Load credits",
    body: "Credits never expire, and a starter pack is enough for a full session.",
  },
  {
    n: "03",
    title: "Generate on repeat",
    body: "Write, submit, refine. Jobs queue in the background and stream into your gallery at full resolution.",
  },
];

export function Workflow() {
  return (
    <section className="relative border-y border-line/60 bg-ink-soft/30 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="max-w-2xl">
          <SectionLabel>How it works</SectionLabel>
          <h2 className="text-[clamp(2.1rem,5vw,3.6rem)] leading-[0.95] font-semibold tracking-[-0.045em]">
            Three steps to your
            <span className="font-serif font-normal italic text-solar"> first frame.</span>
          </h2>
        </Reveal>

        <ol className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-line/70 bg-line/40 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal as="li" key={s.n} delay={i * 0.1} className="bg-ink">
              <div className="group h-full p-8 transition-colors duration-400 hover:bg-ink-card/70 sm:p-10">
                <span className="font-mono text-[0.72rem] tracking-[0.2em] text-solar/70">
                  {s.n}
                </span>
                <h3 className="mt-6 text-xl font-semibold tracking-[-0.03em] sm:text-2xl">
                  {s.title}
                </h3>
                <p className="mt-3.5 text-[0.9rem] leading-relaxed text-frost-dim">
                  {s.body}
                </p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
