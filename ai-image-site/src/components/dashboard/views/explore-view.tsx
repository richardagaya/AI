"use client";

import { Compass } from "lucide-react";
import { useSetAtom } from "jotai";
import { MediaCard } from "@/components/ui/media-card";
import { SHOWCASE } from "@/lib/media";
import { usePromptAtom } from "@/lib/store";
import { MediaWall } from "../media-wall";

export function ExploreView() {
  const onUsePrompt = useSetAtom(usePromptAtom);
  return (
    <div className="mx-auto w-full max-w-6xl px-5 pt-10 pb-16 sm:px-8">
      <header>
        <p className="flex items-center gap-2 text-[0.66rem] font-bold tracking-[0.28em] uppercase text-solar">
          <Compass className="size-3.5" />
          Community feed
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
          Explore the{" "}
          <span className="font-serif italic text-solar-gradient">
            rendered wilds
          </span>
        </h1>
        <p className="mt-2 max-w-lg text-[0.86rem] leading-relaxed text-frost-faint">
          What the community is dreaming up right now. See something you love —
          steal the prompt and make it yours.
        </p>
      </header>

      <MediaWall
        className="mt-10"
        title="Trending now"
        subtitle="Auto-refreshing feed of community renders"
      />

      <div className="mt-12 columns-2 gap-4 space-y-4 md:columns-3 xl:columns-4">
        {SHOWCASE.map((media, i) => (
          <div
            key={media.id}
            className="group relative break-inside-avoid"
          >
            <MediaCard
              media={media}
              priority={i < 4}
              className={i % 3 === 0 ? "aspect-[3/4]" : i % 3 === 1 ? "aspect-square" : "aspect-[4/5]"}
            />
            <button
              onClick={() => onUsePrompt(media.prompt)}
              className="absolute inset-x-3 bottom-3 cursor-pointer rounded-xl border border-line/60 bg-ink/85 px-3 py-2.5 text-left backdrop-blur-xl transition-all duration-300 hover:border-solar/50"
            >
              <p className="line-clamp-1 font-mono text-[0.64rem] text-frost/80">
                {media.prompt}
              </p>
              <span className="mt-1 block text-[0.6rem] font-bold tracking-[0.14em] uppercase text-solar">
                Use this prompt →
              </span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
