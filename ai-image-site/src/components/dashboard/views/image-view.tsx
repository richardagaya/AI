"use client";

import { ArrowRight } from "lucide-react";
import { useAtomValue } from "jotai";
import { Composer } from "../composer";
import { GalleryGrid } from "../gallery-grid";
import { MediaWall } from "../media-wall";
import { jobsAtom, userAtom } from "@/lib/store";
import { firstNameOf } from "@/lib/utils";
import type { DashboardView } from "../types";

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Burning the midnight oil";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export function ImageView({
  onNavigate,
}: {
  onNavigate: (v: DashboardView) => void;
}) {
  const user = useAtomValue(userAtom);
  const jobs = useAtomValue(jobsAtom);
  const firstName = user ? firstNameOf(user) : "creator";

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pt-10 pb-16 sm:px-8">
      {/* Hero header */}
      <header className="mb-8 text-center">
        <p className="text-[0.66rem] font-bold tracking-[0.28em] uppercase text-solar">
          {greeting()}, {firstName}
        </p>
        <h1 className="mx-auto mt-3 max-w-2xl text-4xl font-semibold tracking-[-0.035em] text-balance sm:text-5xl">
          Imagine it.{" "}
          <span className="font-serif italic text-solar-gradient">
            Minsuro renders it.
          </span>
        </h1>
        <p className="mx-auto mt-3 max-w-md text-[0.86rem] leading-relaxed text-frost-faint">
          Type a thought, pick a model, hit generate. Gallery-grade art in
          about thirty seconds.
        </p>
      </header>

      <Composer variant="image" />

      {/* Recent creations */}
      <section className="mt-14">
        <div className="mb-5 flex items-end justify-between px-1">
          <div>
            <h2 className="text-[1.05rem] font-semibold tracking-[-0.02em]">
              Your latest creations
            </h2>
            <p className="mt-1 text-[0.78rem] text-frost-faint">
              {jobs.length === 0
                ? "Your renders will live here"
                : `${jobs.length} ${jobs.length === 1 ? "render" : "renders"} in your vault`}
            </p>
          </div>
          {jobs.length > 6 && (
            <button
              onClick={() => onNavigate("library")}
              className="flex cursor-pointer items-center gap-1.5 text-[0.76rem] font-semibold text-solar transition-colors hover:text-solar-soft"
            >
              View all
              <ArrowRight className="size-3.5" />
            </button>
          )}
        </div>
        <GalleryGrid jobs={jobs.slice(0, 6)} />
      </section>

      {/* Community media wall */}
      <MediaWall className="mt-16" />
    </div>
  );
}
