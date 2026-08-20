"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { ArrowRight, Play } from "lucide-react";
import { buttonStyles } from "@/components/ui/button-styles";
import { MediaCard } from "@/components/ui/media-card";
import { LazyVideo } from "@/components/ui/lazy-video";
import { Snowfall } from "@/components/landing/snowfall";
import { HERO_BACKGROUND, SHOWCASE } from "@/lib/media";

export function Hero({ startHref }: { startHref: string }) {
  const frame = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 90, damping: 18 });
  const sy = useSpring(py, { stiffness: 90, damping: 18 });

  const rotateY = useTransform(sx, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateX = useTransform(sy, [-0.5, 0.5], ["-6deg", "6deg"]);
  const shiftA = useTransform(sx, [-0.5, 0.5], [26, -26]);
  const shiftB = useTransform(sx, [-0.5, 0.5], [-18, 18]);

  function onPointerMove(e: React.PointerEvent) {
    const rect = frame.current?.getBoundingClientRect();
    if (!rect) return;
    px.set((e.clientX - rect.left) / rect.width - 0.5);
    py.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  return (
    <section
      id="top"
      className="relative isolate overflow-hidden pt-28 pb-16 sm:pt-32 lg:min-h-dvh lg:pt-40 lg:pb-24"
    >
      <LazyVideo
        src={HERO_BACKGROUND.src}
        poster={HERO_BACKGROUND.poster}
        eager
        className="absolute inset-0 -z-20 size-full object-cover opacity-45"
      />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(255,212,38,0.14),transparent_65%)]" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/60 via-ink/85 to-ink" />
      <div className="absolute -top-32 -left-24 -z-10 size-[28rem] animate-drift rounded-full bg-solar/8 blur-[120px]" />
      <div className="absolute top-1/3 -right-32 -z-10 size-[24rem] animate-drift rounded-full bg-solar-deep/8 blur-[120px] [animation-delay:-7s]" />
      <Snowfall />

      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        <div className="relative z-10 max-w-2xl">
          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
            className="mt-7 text-[clamp(2.7rem,7vw,4.6rem)] leading-[0.94] font-semibold tracking-[-0.045em]"
          >
            Imagine it.
            <br />
            <span className="whitespace-nowrap">
              <span className="text-solar-gradient">Minsuro</span>{" "}
              <span className="font-serif text-[0.88em] font-normal italic tracking-[-0.01em] text-frost/90">
                renders it.
              </span>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 max-w-lg text-base leading-relaxed text-frost-dim sm:text-lg"
          >
            A studio-grade image engine for anime, fantasy and mature art. Write a
            prompt or drop a reference, and get a finished frame in about thirty
            seconds — no filters, no moderation queue, no explaining yourself.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <a
              href={startHref}
              className={buttonStyles({ size: "lg", className: "group" })}
            >
              Start creating
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="#showcase"
              className={buttonStyles({ variant: "outline", size: "lg" })}
            >
              <Play className="size-3.5 fill-current" />
              See the showcase
            </a>
          </motion.div>

        </div>

        <motion.div
          ref={frame}
          onPointerMove={onPointerMove}
          onPointerLeave={() => {
            px.set(0);
            py.set(0);
          }}
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          style={{ rotateX, rotateY, transformPerspective: 1200 }}
          className="relative z-10 hidden h-[34rem] lg:block xl:h-[38rem]"
        >
          <motion.div
            style={{ x: shiftA }}
            className="absolute top-6 left-0 h-[74%] w-[54%]"
          >
            <MediaCard
              media={SHOWCASE[0]}
              priority
              className="size-full shadow-[0_50px_100px_-40px_rgba(0,0,0,0.9)]"
            />
          </motion.div>

          <motion.div
            style={{ x: shiftB }}
            className="absolute top-0 right-0 h-[44%] w-[42%]"
          >
            <MediaCard media={SHOWCASE[2]} priority className="size-full" />
          </motion.div>

          <motion.div
            style={{ x: shiftA }}
            className="absolute right-2 bottom-2 h-[46%] w-[46%]"
          >
            <MediaCard media={SHOWCASE[1]} className="size-full" />
          </motion.div>

          <motion.div
            style={{ x: shiftB }}
            className="absolute bottom-16 -left-6 w-56 rounded-2xl border border-line/80 bg-ink-card/90 p-4 backdrop-blur-xl"
          >
            <div className="flex items-center gap-2">
              <span className="size-1.5 animate-pulse-ring rounded-full bg-solar" />
              <span className="text-[0.62rem] font-semibold tracking-[0.16em] uppercase text-frost-faint">
                Rendering
              </span>
              <span className="ml-auto font-mono text-[0.62rem] text-solar">
                92%
              </span>
            </div>
            <div className="relative mt-3 h-1 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-solar-deep to-solar" />
              <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            </div>
            <p className="mt-3 truncate font-mono text-[0.62rem] text-frost-faint">
              frost sorceress, silver hair…
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
