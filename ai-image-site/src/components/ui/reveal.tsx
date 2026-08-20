"use client";

import { motion, type Variants } from "motion/react";
import { cn } from "@/lib/utils";

const variants: Variants = {
  hidden: { opacity: 0, y: 26, filter: "blur(6px)" },
  shown: { opacity: 1, y: 0, filter: "blur(0px)" },
};

export function Reveal({
  children,
  className,
  delay = 0,
  as = "div",
  immediate = false,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "li" | "span";
  /**
   * Play on mount instead of on scroll. Use for above-the-fold content, which
   * would otherwise be served at opacity 0 and stay blank until the viewport
   * observer fires.
   */
  immediate?: boolean;
}) {
  const Comp = motion[as];
  const trigger = immediate
    ? { animate: "shown" as const }
    : {
        whileInView: "shown" as const,
        viewport: { once: true, margin: "-80px" },
      };

  return (
    <Comp
      className={cn(className)}
      variants={variants}
      initial="hidden"
      {...trigger}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </Comp>
  );
}

export function SectionLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-5 inline-flex items-center gap-2.5 text-[0.7rem] font-semibold",
        "tracking-[0.22em] uppercase text-frost-faint",
        className,
      )}
    >
      <span className="h-px w-7 bg-gradient-to-r from-transparent to-solar/70" />
      {children}
    </div>
  );
}
