"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { MediaCard } from "@/components/ui/media-card";
import { Reveal, SectionLabel } from "@/components/ui/reveal";
import { SHOWCASE } from "@/lib/media";
import { cn } from "@/lib/utils";

const FILTERS = ["All", "Anime", "Cinematic", "Abstract", "Texture"] as const;

// Deliberately uneven spans so the wall reads like an editorial grid instead of
// a uniform CMS dump. Repeats every six tiles across a 6-column track.
const SPANS = [
  "lg:col-span-3 lg:row-span-2",
  "lg:col-span-3 lg:row-span-1",
  "lg:col-span-3 lg:row-span-1",
  "lg:col-span-2 lg:row-span-2",
  "lg:col-span-2 lg:row-span-2",
  "lg:col-span-2 lg:row-span-2",
];

export function Showcase() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  const visible = SHOWCASE.filter(
    (m) => filter === "All" || m.tag === filter,
  );

  return (
    <section
      id="showcase"
      className="relative mx-auto max-w-7xl scroll-mt-24 px-5 py-24 sm:px-8 sm:py-32"
    >
      <Reveal>
        <SectionLabel>Made with minsuro</SectionLabel>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="max-w-xl text-[clamp(2.1rem,5vw,3.6rem)] leading-[0.95] font-semibold tracking-[-0.045em]">
            A wall of frames that
            <span className="font-serif italic font-normal text-solar"> nobody approved</span>
          </h2>
          <p className="max-w-sm text-[0.95rem] leading-relaxed text-frost-dim">
            Every tile below started as one line of text. Hover any frame to read
            the exact prompt that produced it.
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mt-10 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-full border px-4 py-2 text-[0.76rem] font-medium transition-all duration-200",
                filter === f
                  ? "border-solar bg-solar text-on-solar"
                  : "border-line text-frost-dim hover:border-solar/40 hover:text-frost",
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </Reveal>

      <motion.div
        layout
        className="mt-8 grid grid-flow-dense auto-rows-[8.5rem] grid-cols-2 gap-3 sm:auto-rows-[10rem] sm:grid-cols-4 lg:auto-rows-[11rem] lg:grid-cols-6"
      >
        {visible.map((m, i) => (
          <motion.div
            key={m.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: (i % 6) * 0.05 }}
            className={cn(
              "row-span-2 sm:col-span-2",
              filter === "All"
                ? SPANS[i % SPANS.length]
                : "lg:col-span-2 lg:row-span-2",
            )}
          >
            <MediaCard media={m} play="hover" className="size-full" />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
