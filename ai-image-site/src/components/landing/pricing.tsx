"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal, SectionLabel } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

const PACKS = [
  {
    name: "Starter",
    credits: 50,
    price: "$9",
    per: "$0.18 / image",
    features: ["50 text-to-image renders", "25 image-to-image renders", "Full resolution downloads"],
  },
  {
    name: "Studio",
    credits: 200,
    price: "$29",
    per: "$0.14 / image",
    featured: true,
    features: [
      "200 text-to-image renders",
      "100 image-to-image renders",
      "Priority queue placement",
      "Prompt history and re-runs",
    ],
  },
  {
    name: "Atelier",
    credits: 750,
    price: "$89",
    per: "$0.12 / image",
    features: [
      "750 text-to-image renders",
      "375 image-to-image renders",
      "Priority queue placement",
      "Bulk prompt submission",
    ],
  },
];

export function Pricing({ onStart }: { onStart: () => void }) {
  return (
    <section
      id="pricing"
      className="relative mx-auto max-w-7xl scroll-mt-24 px-5 py-24 sm:px-8 sm:py-32"
    >
      <Reveal className="max-w-2xl">
        <SectionLabel>Credits</SectionLabel>
        <h2 className="text-[clamp(2.1rem,5vw,3.6rem)] leading-[0.95] font-semibold tracking-[-0.045em]">
          Pay for frames,
          <span className="font-serif font-normal italic text-solar"> not for waiting.</span>
        </h2>
        <p className="mt-5 text-[0.95rem] leading-relaxed text-frost-dim">
          One credit renders one image. Image-to-image costs two. No subscription,
          no monthly minimum, and credits never expire.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-4 lg:grid-cols-3">
        {PACKS.map((p, i) => (
          <Reveal key={p.name} delay={i * 0.08}>
            <div
              className={cn(
                "relative flex h-full flex-col overflow-hidden rounded-3xl border p-8 transition-all duration-400",
                p.featured
                  ? "border-solar/45 bg-gradient-to-b from-solar/[0.09] to-ink-card"
                  : "border-line/70 bg-ink-card/60 hover:border-solar/30",
              )}
            >
              {p.featured && (
                <>
                  <div className="pointer-events-none absolute -top-28 left-1/2 size-56 -translate-x-1/2 rounded-full bg-solar/18 blur-[90px]" />
                  <span className="absolute top-7 right-7 rounded-full bg-solar px-3 py-1 text-[0.6rem] font-bold tracking-[0.14em] uppercase text-on-solar">
                    Popular
                  </span>
                </>
              )}

              <h3 className="text-[0.72rem] font-semibold tracking-[0.18em] uppercase text-frost-faint">
                {p.name}
              </h3>
              <div className="mt-5 flex items-baseline gap-2">
                <span className="text-5xl font-semibold tracking-[-0.05em]">{p.price}</span>
                <span className="text-[0.8rem] text-frost-faint">one-time</span>
              </div>
              <p className="mt-2 text-[0.82rem] text-solar">
                {p.credits} credits · {p.per}
              </p>

              <ul className="mt-7 flex flex-1 flex-col gap-3 border-t border-line/60 pt-7">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[0.86rem] text-frost-dim">
                    <Check className="mt-0.5 size-4 shrink-0 text-solar" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                variant={p.featured ? "solar" : "outline"}
                size="lg"
                onClick={onStart}
                className="mt-8 w-full"
              >
                Get {p.credits} credits
              </Button>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
