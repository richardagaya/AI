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
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "li" | "span";
}) {
  const Comp = motion[as];
  return (
    <Comp
      className={cn(className)}
      variants={variants}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "-80px" }}
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
