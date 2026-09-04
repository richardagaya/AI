"use client";

import { useMemo, useRef, useState } from "react";
import { Image as ImageIcon, Layers, Play, Video } from "lucide-react";
import { INFLUENCER_EXAMPLES } from "@/lib/media";
import { cn } from "@/lib/utils";
import { LazyVideo } from "@/components/ui/lazy-video";

const FILTERS = [
  { id: "all", label: "All", icon: Layers },
  { id: "image", label: "Images", icon: ImageIcon },
  { id: "video", label: "Videos", icon: Video },
] as const;

type FilterId = (typeof FILTERS)[number]["id"];

function ExampleCard({
  src,
  poster,
  kind,
  prompt,
  eager,
}: {
  src: string;
  poster?: string;
  kind: "image" | "video";
  prompt: string;
  eager?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <figure
      className="group relative mb-1.5 break-inside-avoid overflow-hidden rounded-xl bg-ink-soft"
      onMouseEnter={() => {
        if (kind === "video") void videoRef.current?.play().catch(() => {});
      }}
      onMouseLeave={() => {
        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
        }
      }}
    >
      {kind === "video" ? (
        <LazyVideo
          videoRef={videoRef}
          src={src}
          poster={poster}
          play="hover"
          eager={eager}
          className="aspect-[3/4] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={prompt}
          loading={eager ? "eager" : "lazy"}
          className="aspect-[3/4] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
      )}
      {kind === "video" && (
        <span className="pointer-events-none absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-full border border-white/10 bg-ink/70 px-2 py-1 text-[0.56rem] font-bold tracking-[0.14em] uppercase text-frost backdrop-blur-md">
          <Play className="size-2.5 fill-solar text-solar" />
          Video
        </span>
      )}
    </figure>
  );
}

export function InfluencerExamples() {
  const [filter, setFilter] = useState<FilterId>("all");

  const items = useMemo(() => {
    if (filter === "all") return INFLUENCER_EXAMPLES;
    return INFLUENCER_EXAMPLES.filter((m) => m.kind === filter);
  }, [filter]);

  return (
    <section className="mt-16">
      <div className="sticky top-0 z-10 -mx-5 mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-line/40 bg-ink/90 px-5 py-3 backdrop-blur-xl sm:-mx-8 sm:px-8">
        <h2 className="flex items-center gap-2.5 text-[0.82rem] font-bold tracking-[0.22em] uppercase text-solar">
          <span className="flex h-3.5 items-end gap-[3px]" aria-hidden>
            <span className="h-1.5 w-[3px] rounded-full bg-solar" />
            <span className="h-2.5 w-[3px] rounded-full bg-solar" />
            <span className="h-3.5 w-[3px] rounded-full bg-solar" />
          </span>
          Examples
        </h2>
        <div className="flex items-center rounded-full border border-line/70 bg-ink-soft/80 p-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={cn(
                "inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.64rem] font-bold tracking-[0.14em] uppercase transition-colors",
                filter === f.id
                  ? "bg-white/[0.1] text-frost"
                  : "text-frost-faint hover:text-frost-dim",
              )}
            >
              <f.icon className="size-3.5" />
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="columns-3 gap-1.5 sm:columns-4 lg:columns-5 xl:columns-6">
        {items.map((media, i) => (
          <ExampleCard
            key={media.id}
            src={media.src}
            poster={media.poster}
            kind={media.kind}
            prompt={media.prompt}
            eager={i < 6}
          />
        ))}
      </div>
    </section>
  );
}
