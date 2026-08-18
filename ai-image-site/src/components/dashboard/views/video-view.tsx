"use client";

import { Clapperboard, Film, ImagePlus, MonitorPlay } from "lucide-react";
import { Composer } from "../composer";
import { MediaWall } from "../media-wall";
import type { GenerateHandlers } from "../types";

const FEATURES = [
  {
    icon: Film,
    title: "Cinema-grade motion",
    body: "Kling O3, Veo 3.1 and Seedance 2.0 with director-level camera control.",
  },
  {
    icon: ImagePlus,
    title: "Image to video",
    body: "Upload a start frame and bring any still image to life.",
  },
  {
    icon: MonitorPlay,
    title: "Up to 10 seconds",
    body: "Landscape, vertical or square — clips ready for any platform.",
  },
];

export function VideoView({ handlers }: { handlers: GenerateHandlers }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 pt-10 pb-16 sm:px-8">
      <header className="mb-8 text-center">
        <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-nova/30 bg-nova/10 px-3.5 py-1.5 text-[0.64rem] font-bold tracking-[0.22em] uppercase text-nova-soft">
          <Clapperboard className="size-3.5" />
          Video Studio
        </p>
        <h1 className="mx-auto mt-4 max-w-2xl text-4xl font-semibold tracking-[-0.035em] text-balance sm:text-5xl">
          Direct your own{" "}
          <span className="font-serif italic text-solar-gradient">
            impossible film
          </span>
        </h1>
        <p className="mx-auto mt-3 max-w-md text-[0.86rem] leading-relaxed text-frost-faint">
          Text-to-video with director-level camera control. Describe the shot —
          we roll the cameras.
        </p>
      </header>

      <Composer variant="video" handlers={handlers} />

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="group relative overflow-hidden rounded-2xl border border-line/70 bg-ink-card/60 p-5 transition-colors hover:border-nova/40"
          >
            <div className="pointer-events-none absolute -top-12 -right-12 size-28 rounded-full bg-nova/10 blur-2xl transition-opacity group-hover:bg-nova/20" />
            <f.icon className="size-5 text-nova-soft" />
            <h3 className="mt-3 text-[0.92rem] font-semibold">{f.title}</h3>
            <p className="mt-1.5 text-[0.78rem] leading-relaxed text-frost-faint">
              {f.body}
            </p>
          </div>
        ))}
      </div>

      <MediaWall
        className="mt-16"
        title="Community clips"
        subtitle="Videos rendered this week"
        videosOnly
      />
    </div>
  );
}
