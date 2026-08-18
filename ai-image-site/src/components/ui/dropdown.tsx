"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Popover dropdown used for the composer's model / aspect / duration pickers.
 * Closes on outside click, Escape, or when an option is chosen.
 */
export function Dropdown({
  trigger,
  children,
  align = "start",
  panelClassName,
  triggerClassName,
  label,
}: {
  trigger: React.ReactNode;
  children: (close: () => void) => React.ReactNode;
  align?: "start" | "end";
  panelClassName?: string;
  triggerClassName?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex cursor-pointer items-center gap-1.5 rounded-xl border border-line/70 bg-ink-soft/60 px-3 py-2 text-[0.74rem] font-semibold text-frost-dim transition-all",
          "hover:border-line hover:text-frost",
          open && "border-solar/50 text-frost",
          triggerClassName,
        )}
      >
        {trigger}
        <ChevronDown
          className={cn(
            "size-3.5 shrink-0 text-frost-faint transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className={cn(
            "absolute bottom-full z-50 mb-2 min-w-52 overflow-hidden rounded-2xl border border-line/80 bg-ink-card/98 shadow-[0_30px_80px_-24px_rgba(0,0,0,0.9)] backdrop-blur-xl",
            align === "end" ? "right-0" : "left-0",
            panelClassName,
          )}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

/** A single selectable row inside a dropdown panel. */
export function DropdownOption({
  selected,
  onSelect,
  children,
  className,
}: {
  selected?: boolean;
  onSelect: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={onSelect}
      className={cn(
        "flex w-full cursor-pointer items-center gap-2.5 px-3 py-2 text-left text-[0.8rem] transition-colors",
        selected
          ? "bg-solar/10 text-solar"
          : "text-frost-dim hover:bg-white/[0.04] hover:text-frost",
        className,
      )}
    >
      {children}
    </button>
  );
}
