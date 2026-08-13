"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Media } from "@/lib/media";

/**
 * Autoplaying tiles are paused while offscreen so a wall of clips does not
 * saturate the decoder on lower-end devices.
 */
function useAutoplayWhenVisible(
  ref: React.RefObject<HTMLVideoElement | null>,
  enabled: boolean,
) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, enabled]);
}

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
  useAutoplayWhenVisible(videoRef, media.kind === "video" && play === "auto");

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
        <video
          ref={videoRef}
          src={media.src}
          poster={media.poster}
          muted
          loop
          playsInline
          preload={priority ? "auto" : "none"}
          className="size-full object-cover transition-transform duration-[1.2s] group-hover:scale-[1.06]"
        />
      ) : (
        <Image
          src={media.src}
          alt={media.prompt}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          priority={priority}
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
