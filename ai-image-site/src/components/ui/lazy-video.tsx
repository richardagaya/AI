"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Video that shows its poster immediately and only downloads the clip once it
 * scrolls near the viewport. Without this, a page full of <video src> tags
 * fetches every clip up front and stalls the initial load.
 */
export function LazyVideo({
  src,
  poster,
  className,
  play = "auto",
  eager = false,
  videoRef,
}: {
  src: string;
  poster?: string;
  className?: string;
  /** "auto" plays while visible, "hover" only on pointer enter */
  play?: "auto" | "hover";
  /** Skip lazy-loading for above-the-fold media */
  eager?: boolean;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
}) {
  const localRef = useRef<HTMLVideoElement>(null);
  const ref = videoRef ?? localRef;
  const [load, setLoad] = useState(eager);
  const [visible, setVisible] = useState(false);

  // Attach the source only when the element approaches the viewport.
  useEffect(() => {
    if (load) return;
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoad(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [load, ref]);

  // Pause offscreen clips so a wall of videos doesn't saturate the decoder.
  useEffect(() => {
    const el = ref.current;
    if (!el || !load) return;

    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [load, ref]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !load || play !== "auto") return;
    if (visible) void el.play().catch(() => {});
    else el.pause();
  }, [visible, load, play, ref]);

  return (
    <video
      ref={ref}
      src={load ? src : undefined}
      poster={poster}
      muted
      loop
      playsInline
      preload={eager ? "metadata" : "none"}
      className={cn(className)}
    />
  );
}
