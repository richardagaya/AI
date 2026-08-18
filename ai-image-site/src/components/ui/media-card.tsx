"use client";

import { useRef } from "react";
import Image from "next/image";
import { LazyVideo } from "@/components/ui/lazy-video";
import { cn } from "@/lib/utils";
import type { Media } from "@/lib/media";

export function MediaCard({
  media,
  play = "auto",
  className,
  showCaption = true,
  priority = false,
}: {
  media: Media;
  play?: "auto" | "hover";
  className?: string;
  showCaption?: boolean;
  priority?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const onEnter = () => {
    if (play === "hover") void videoRef.current?.play().catch(() => {});
  };
  const onLeave = () => {
    if (play === "hover" && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <figure
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className={cn(
        "group relative isolate overflow-hidden rounded-3xl border border-line/80 bg-ink-soft",
        "transition-all duration-500 hover:border-solar/40",
        "hover:shadow-[0_30px_80px_-40px_rgba(255,212,38,0.35)]",
        className,
      )}
    >
      {media.kind === "video" ? (
        // Clips always start from their poster and stream in once observed —
        // `priority` only fast-tracks still images for LCP.
        <LazyVideo
          videoRef={videoRef}
          src={media.src}
          poster={media.poster}
          play={play}
          className="size-full object-cover transition-transform duration-[1.2s] group-hover:scale-[1.06]"
        />
      ) : (
        <Image
          src={media.src}
          alt={media.prompt}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          priority={priority}
          loading={priority ? undefined : "lazy"}
          className="object-cover transition-transform duration-[1.2s] group-hover:scale-[1.06]"
        />
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-transparent opacity-80" />
      <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/5" />

      {showCaption && (
        <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 p-4 sm:p-5">
          <span className="mb-2 inline-flex rounded-full border border-solar/25 bg-ink/70 px-2.5 py-1 text-[0.6rem] font-semibold tracking-[0.16em] uppercase text-solar backdrop-blur-md">
            {media.tag}
          </span>
          <p className="translate-y-1 font-mono text-[0.7rem] leading-relaxed text-frost/70 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 sm:text-[0.74rem]">
            {media.prompt}
          </p>
        </figcaption>
      )}
    </figure>
  );
}
