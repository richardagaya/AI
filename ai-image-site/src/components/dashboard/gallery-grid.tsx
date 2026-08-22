"use client";

import { Download } from "lucide-react";
import { Snowflake } from "@/components/brand/snowflake";
import { ModelLogo } from "@/components/dashboard/model-logo";
import { getModel } from "@/lib/fal-models";
import { cn } from "@/lib/utils";
import type { StudioJob } from "./types";

const STATUS_STYLES: Record<string, string> = {
  succeeded: "text-mint bg-mint/10 border-mint/25",
  failed: "text-red-400 bg-red-400/10 border-red-400/25",
  running: "text-solar bg-solar/10 border-solar/25",
  queued: "text-frost-dim bg-white/5 border-line",
  pending: "text-frost-dim bg-white/5 border-line",
};

function jobMediaSrc(job: StudioJob): string {
  return job.outputUrl || `/api/jobs/${job.id}/image`;
}

export function GalleryGrid({
  jobs,
  emptyTitle = "Nothing rendered yet",
  emptyBody = "Your generations will appear here about thirty seconds after you hit Generate.",
}: {
  jobs: StudioJob[];
  emptyTitle?: string;
  emptyBody?: string;
}) {
  if (jobs.length === 0) {
    return (
      <div className="relative grid place-items-center overflow-hidden rounded-3xl border border-dashed border-line/80 bg-ink-card/30 px-6 py-20 text-center">
        <div className="pointer-events-none absolute -top-20 left-1/2 h-40 w-72 -translate-x-1/2 rounded-full bg-solar/10 blur-3xl" />
        <Snowflake className="size-9 animate-spin-slow text-solar/40" />
        <p className="mt-5 text-[0.95rem] font-medium">{emptyTitle}</p>
        <p className="mt-1.5 max-w-xs text-[0.84rem] text-frost-faint">{emptyBody}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {jobs.map((job) => {
        const isVideo =
          job.outputKind === "video" || job.mode.includes("video");
        const model = getModel(job.model);
        const modelLabel = model?.label ?? job.model;
        return (
          <article
            key={job.id}
            className="group relative overflow-hidden rounded-2xl border border-line/70 bg-ink-card/60 transition-all duration-300 hover:border-solar/30 hover:shadow-[0_24px_60px_-32px_rgba(255,212,38,0.3)]"
          >
            {job.status === "succeeded" ? (
              isVideo ? (
                <video
                  src={jobMediaSrc(job)}
                  controls
                  preload="metadata"
                  className="aspect-video w-full bg-black object-cover"
                />
              ) : (
                // R2 CDN URL when present; otherwise the job image route.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={jobMediaSrc(job)}
                  alt={job.prompt}
                  loading="lazy"
                  className="aspect-2/3 w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              )
            ) : (
              <div
                className={cn(
                  "relative grid w-full place-items-center overflow-hidden bg-ink-soft/70",
                  isVideo ? "aspect-video" : "aspect-2/3",
                )}
              >
                <Snowflake
                  className={cn(
                    "size-10 text-solar/30",
                    job.status !== "failed" && "animate-spin-slow",
                  )}
                />
                {job.status !== "failed" && (
                  <div className="absolute inset-x-0 bottom-0 h-px overflow-hidden">
                    <div className="h-full w-full animate-shimmer bg-gradient-to-r from-transparent via-solar to-transparent" />
                  </div>
                )}
              </div>
            )}

            {job.status === "succeeded" && (
              <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <a
                  href={jobMediaSrc(job)}
                  download
                  title="Download"
                  className="cursor-pointer rounded-full border border-white/10 bg-ink/80 p-2 text-frost backdrop-blur-md transition-colors hover:text-solar"
                >
                  <Download className="size-3.5" />
                </a>
              </div>
            )}

            <div className="p-4">
              <div className="flex items-center gap-2">
                {model && (
                  <ModelLogo model={model} className="size-5 rounded-md p-0.5 [&>img]:size-3.5" />
                )}
                <span
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-[0.56rem] font-bold tracking-[0.12em] uppercase",
                    STATUS_STYLES[job.status] ?? STATUS_STYLES.pending,
                  )}
                >
                  {job.status}
                </span>
                <span className="min-w-0 truncate font-mono text-[0.62rem] text-frost-faint">
                  {modelLabel} · {job.mode} · {job.costCredits} cr
                </span>
                <span className="ml-auto shrink-0 font-mono text-[0.62rem] text-frost-faint">
                  {new Date(job.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="mt-2.5 line-clamp-2 font-mono text-[0.72rem] leading-relaxed text-frost-dim">
                {job.prompt}
              </p>
              {job.status === "failed" && job.error && (
                <p className="mt-3 rounded-lg bg-red-500/8 p-2.5 text-[0.7rem] text-red-300">
                  {job.error}
                </p>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
