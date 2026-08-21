"use client";

import { useState } from "react";
import { useSetAtom } from "jotai";
import { Flame, Play } from "lucide-react";
import { MediaCard } from "@/components/ui/media-card";
import { SHOWCASE, type Media } from "@/lib/media";
import { usePromptAtom } from "@/lib/store";
import { cn } from "@/lib/utils";

function WallCard({ media }: { media: Media }) {
  const onUsePrompt = useSetAtom(usePromptAtom);
  return (
    <div className="group/card relative w-52 shrink-0 sm:w-60">
      <MediaCard
        media={media}
        showCaption={false}
        className="aspect-[3/4] rounded-2xl"
      />
      {media.kind === "video" && (
        <span className="pointer-events-none absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-ink/70 px-2 py-1 text-[0.56rem] font-bold tracking-[0.14em] uppercase text-frost backdrop-blur-md">
          <Play className="size-2.5 fill-solar text-solar" />
          Video
        </span>
      )}
      <button
        onClick={() => onUsePrompt(media.prompt)}
        className={cn(
          "absolute inset-x-3 bottom-3 cursor-pointer rounded-xl border border-line/60 bg-ink/80 p-3 text-left backdrop-blur-xl",
          "translate-y-2 opacity-0 transition-all duration-300 group-hover/card:translate-y-0 group-hover/card:opacity-100",
        )}
      >
        <p className="line-clamp-2 font-mono text-[0.64rem] leading-relaxed text-frost/80">
          {media.prompt}
        </p>
        <span className="mt-1.5 inline-flex items-center gap-1 text-[0.62rem] font-bold tracking-[0.12em] uppercase text-solar">
          <WandIcon /> Remix prompt
        </span>
      </button>
    </div>
  );
}

function WandIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-3" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72" />
      <path d="m14 7 3 3" />
      <path d="M5 6v4" /><path d="M19 14v4" /><path d="M10 2v2" />
      <path d="M7 8H3" /><path d="M21 16h-4" /><path d="M11 3H9" />
    </svg>
  );
}

export function MediaWall({
  title = "Live from the community",
  subtitle = "Trending renders from creators this hour",
  videosOnly = false,
  className,
}: {
  title?: string;
  subtitle?: string;
  videosOnly?: boolean;
  className?: string;
}) {
  const [paused, setPaused] = useState(false);
  const pool = videosOnly ? SHOWCASE.filter((m) => m.kind === "video") : SHOWCASE;
  const rowA = [...pool, ...pool];
  const rowB = [...[...pool].reverse(), ...[...pool].reverse()];

  return (
    <section
      className={cn("relative", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mb-5 flex items-end justify-between px-1">
        <div>
          <h3 className="flex items-center gap-2 text-[1.05rem] font-semibold tracking-[-0.02em]">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-solar opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-solar" />
            </span>
            {title}
          </h3>
          <p className="mt-1 text-[0.78rem] text-frost-faint">{subtitle}</p>
        </div>
        <span className="hidden items-center gap-1.5 rounded-full border border-line/70 bg-white/[0.02] px-3 py-1.5 text-[0.66rem] font-semibold text-frost-faint sm:inline-flex">
          <Flame className="size-3.5 text-solar" />
          Hover to pause · click to remix
        </span>
      </div>

      <div className="edge-fade space-y-4 overflow-hidden">
        {[rowA, rowB].map((row, i) => (
          <div
            key={i}
            className={cn(
              "flex w-max gap-4",
              i === 0 ? "animate-marquee" : "animate-marquee-slow [animation-direction:reverse]",
            )}
            style={paused ? { animationPlayState: "paused" } : undefined}
          >
            {row.map((media, j) => (
              <WallCard key={`${media.id}-${j}`} media={media} />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
