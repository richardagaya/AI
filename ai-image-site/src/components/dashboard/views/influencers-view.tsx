"use client";

import { Plus } from "lucide-react";
import type { DashboardView } from "../types";

export function InfluencersView({
  onNavigate,
}: {
  onNavigate: (v: DashboardView) => void;
}) {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 pt-10 pb-16 sm:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.66rem] font-bold tracking-[0.28em] uppercase text-nova-soft">
            Synthetic talent agency
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
            Your{" "}
            <span className="font-serif italic text-solar-gradient">
              AI influencers
            </span>
          </h1>
        </div>
        <button
          onClick={() => onNavigate("create-influencer")}
          className="flex cursor-pointer items-center gap-2 rounded-full bg-solar px-5 py-2.5 text-[0.8rem] font-bold text-on-solar transition-all hover:shadow-[0_10px_36px_-8px_rgba(255,212,38,0.65)]"
        >
          <Plus className="size-4" />
          New influencer
        </button>
      </header>
    </div>
  );
}
