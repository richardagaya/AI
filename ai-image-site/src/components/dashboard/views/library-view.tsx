"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { GalleryGrid } from "../gallery-grid";
import { cn } from "@/lib/utils";
import type { StudioJob } from "../types";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "succeeded", label: "Completed" },
  { id: "running", label: "In progress" },
  { id: "failed", label: "Failed" },
] as const;

export function LibraryView({ jobs }: { jobs: StudioJob[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    return jobs.filter((j) => {
      if (filter === "succeeded" && j.status !== "succeeded") return false;
      if (filter === "failed" && j.status !== "failed") return false;
      if (
        filter === "running" &&
        j.status !== "running" &&
        j.status !== "queued" &&
        j.status !== "pending"
      )
        return false;
      if (query && !j.prompt.toLowerCase().includes(query.toLowerCase()))
        return false;
      return true;
    });
  }, [jobs, filter, query]);

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pt-10 pb-16 sm:px-8">
      <header>
        <p className="text-[0.66rem] font-bold tracking-[0.28em] uppercase text-solar">
          The vault
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
          My{" "}
          <span className="font-serif italic text-solar-gradient">
            creations
          </span>
        </h1>
      </header>

      <div className="mt-7 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 rounded-full border border-line/70 bg-ink-soft/60 p-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "cursor-pointer rounded-full px-3.5 py-1.5 text-[0.72rem] font-semibold transition-all",
                filter === f.id
                  ? "bg-white/[0.08] text-solar"
                  : "text-frost-faint hover:text-frost-dim",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative min-w-52 flex-1 sm:max-w-xs">
          <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-frost-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search prompts…"
            className="h-10 w-full rounded-full border border-line/70 bg-ink-soft/60 pr-4 pl-10 text-[0.8rem] text-frost outline-none transition-all placeholder:text-frost-faint focus:border-solar/60 focus:ring-3 focus:ring-solar/12"
          />
        </div>
        <span className="ml-auto font-mono text-[0.7rem] text-frost-faint">
          {visible.length} {visible.length === 1 ? "render" : "renders"}
        </span>
      </div>

      <div className="mt-6">
        <GalleryGrid
          jobs={visible}
          emptyTitle="No matches in the vault"
          emptyBody="Try a different filter or search term — or go render something new."
        />
      </div>
    </div>
  );
}
