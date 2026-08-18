"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, Sparkles } from "lucide-react";
import { groupByProvider, type FalModelDef } from "@/lib/fal-models";
import { cn } from "@/lib/utils";
import { ModelLogo } from "./model-logo";

export function ModelPicker({
  models,
  value,
  onChange,
  withImage,
}: {
  models: FalModelDef[];
  value: FalModelDef;
  onChange: (id: string) => void;
  /** Show the image-input price when a reference image is attached */
  withImage: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const dismiss = () => {
      setOpen(false);
      setQuery("");
    };
    const onDown = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) dismiss();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matched = q
      ? models.filter(
          (m) =>
            m.label.toLowerCase().includes(q) ||
            m.provider.toLowerCase().includes(q) ||
            m.tagline.toLowerCase().includes(q),
        )
      : models;
    return groupByProvider(matched);
  }, [models, query]);

  function pick(id: string) {
    onChange(id);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex w-full cursor-pointer items-center gap-2.5 rounded-2xl border px-3 py-2.5 text-left transition-all sm:w-72",
          open
            ? "border-solar/50 bg-ink-soft/80"
            : "border-line/70 bg-ink-soft/60 hover:border-line",
        )}
      >
        <ModelLogo model={value} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[0.82rem] font-semibold text-frost">
            {value.label}
          </span>
          <span className="block truncate text-[0.66rem] text-frost-faint">
            {value.provider} · {withImage ? value.cost.image : value.cost.text} cr
          </span>
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-frost-faint transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute top-full left-0 z-50 mt-2 w-full min-w-72 overflow-hidden rounded-2xl border border-line/80 bg-ink-card/98 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.95)] backdrop-blur-xl sm:w-80"
        >
          <div className="flex items-center gap-2 border-b border-line/60 px-3.5 py-3">
            <Search className="size-4 shrink-0 text-frost-faint" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search models…"
              className="w-full bg-transparent text-[0.84rem] text-frost outline-none placeholder:text-frost-faint"
            />
          </div>

          <div className="no-scrollbar max-h-80 overflow-y-auto py-1.5">
            {groups.length === 0 && (
              <p className="px-3.5 py-6 text-center text-[0.78rem] text-frost-faint">
                No models match “{query}”
              </p>
            )}

            {groups.map((group) => (
              <div key={group.provider} className="mb-1">
                <p className="flex items-center gap-2 px-3.5 pt-2 pb-1 text-[0.58rem] font-bold tracking-[0.18em] uppercase text-frost-faint/70">
                  <ModelLogo provider={group.provider} className="size-4 rounded p-0.5 [&>img]:size-3" />
                  {group.provider}
                </p>
                {group.models.map((m) => {
                  const active = m.id === value.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => pick(m.id)}
                      className={cn(
                        "flex w-full cursor-pointer items-center gap-2.5 px-3 py-2 text-left transition-colors",
                        active ? "bg-solar/10" : "hover:bg-white/4",
                      )}
                    >
                      <ModelLogo model={m} />
                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            "block truncate text-[0.82rem] font-semibold",
                            active ? "text-solar" : "text-frost",
                          )}
                        >
                          {m.label}
                        </span>
                        <span className="block truncate text-[0.66rem] text-frost-faint">
                          {m.tagline}
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-1 font-mono text-[0.64rem] font-bold text-frost-faint">
                        <Sparkles className="size-3 text-solar/70" />
                        {withImage ? m.cost.image : m.cost.text}
                      </span>
                      {active && <Check className="size-4 shrink-0 text-solar" />}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}