"use client";

import { MediaCard } from "@/components/ui/media-card";
import { SHOWCASE } from "@/lib/media";

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
    </div>
  );
}
