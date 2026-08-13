"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/snowflake";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "#showcase", label: "Showcase" },
  { href: "#studio", label: "Studio" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export function SiteNav({ onSignIn }: { onSignIn: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

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
            {LINKS.map((l) => (
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
            <Button
              variant="ghost"
              size="sm"
              onClick={onSignIn}
              className="hidden sm:inline-flex"
            >
              Sign in
            </Button>
            <Button size="sm" onClick={onSignIn} className="hidden sm:inline-flex">
              Start creating
            </Button>
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
              {LINKS.map((l, i) => (
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
              <Button
                size="lg"
                onClick={() => {
                  setOpen(false);
                  onSignIn();
                }}
              >
                Start creating
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  setOpen(false);
                  onSignIn();
                }}
              >
                Sign in
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
