"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/snowflake";
import { buttonStyles } from "@/components/ui/button-styles";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { href: "#showcase", label: "Showcase" },
  { href: "#studio", label: "Studio" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export function SiteNav({
  startHref,
  signInHref,
  learnHref,
}: {
  startHref: string;
  signInHref: string;
  learnHref: string;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const links = [...SECTIONS, { href: learnHref, label: "Learn" }];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-60 transition-all duration-300",
          scrolled
            ? "border-b border-line/60 bg-ink/80 backdrop-blur-xl"
            : "border-b border-transparent",
        )}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:h-18">
          <a href="#top" className="flex items-center gap-3">
            <Logo spin />
            <span className="hidden rounded-full border border-solar/25 px-2 py-0.5 text-[0.55rem] font-bold tracking-[0.16em] text-solar/80 sm:inline">
              18+
            </span>
          </a>

          <div className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-full px-4 py-2 text-[0.82rem] text-frost-dim transition-colors hover:text-frost"
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <a
              href={signInHref}
              className={buttonStyles({
                variant: "ghost",
                size: "sm",
                className: "hidden sm:inline-flex",
              })}
            >
              Sign in
            </a>
            <a
              href={startHref}
              className={buttonStyles({
                size: "sm",
                className: "hidden sm:inline-flex",
              })}
            >
              Start creating
            </a>
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
              className="grid size-10 place-items-center rounded-full border border-line text-frost md:hidden"
            >
              {open ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-ink/95 px-6 pt-24 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-1">
              {links.map((l, i) => (
                <motion.a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.06 * i, duration: 0.3 }}
                  className="border-b border-line/60 py-5 text-2xl font-semibold tracking-[-0.03em]"
                >
                  {l.label}
                </motion.a>
              ))}
            </div>
            <div className="mt-8 flex flex-col gap-3">
              <a href={startHref} className={buttonStyles({ size: "lg" })}>
                Start creating
              </a>
              <a
                href={signInHref}
                className={buttonStyles({ variant: "outline", size: "lg" })}
              >
                Sign in
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
