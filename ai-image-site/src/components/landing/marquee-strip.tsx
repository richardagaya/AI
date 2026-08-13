"use client";

import { MediaCard } from "@/components/ui/media-card";
import { Snowflake } from "@/components/brand/snowflake";
import { PROMPT_TICKER, SHOWCASE } from "@/lib/media";

export function MarqueeStrip() {
  const row = [...SHOWCASE, ...SHOWCASE];

  return (
    <div className="relative border-y border-line/60 bg-ink-soft/40 py-6">
      <div className="edge-fade overflow-hidden">
        <div className="flex w-max animate-marquee gap-3 px-1.5">
          {row.map((m, i) => (
            <MediaCard
              key={`row-${i}`}
              media={m}
              play="hover"
              showCaption={false}
              className="h-40 w-30 shrink-0 rounded-2xl sm:h-52 sm:w-40"
            />
          ))}
        </div>
      </div>

      <div className="edge-fade mt-6 overflow-hidden">
        <div className="flex w-max animate-marquee-slow items-center gap-10 [animation-direction:reverse]">
          {[...PROMPT_TICKER, ...PROMPT_TICKER].map((p, i) => (
            <span
              key={i}
              className="flex items-center gap-3 font-mono text-[0.7rem] tracking-[0.1em] whitespace-nowrap text-frost-faint uppercase"
            >
              <Snowflake className="size-3 text-solar/60" strokeWidth={7} />
              {p}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
