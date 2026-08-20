"use client";

import { motion } from "motion/react";
import { ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
import { Logo, Snowflake } from "@/components/brand/snowflake";
import { Button } from "@/components/ui/button";
import { LazyVideo } from "@/components/ui/lazy-video";
import { AUTH_BACKGROUND } from "@/lib/media";
import { LEARN_URL, SITE_URL } from "@/lib/site";
import type { AuthMode } from "./auth-dialog";

const HIGHLIGHTS = [
  "Image and video models from twelve providers",
  "Credits deducted per render, never on a failure",
  "Full resolution downloads, no watermark",
];

/** Shown while Firebase replays a persisted session, to avoid flashing the gate. */
export function StudioSplash() {
  return (
    <div className="grid h-dvh place-items-center bg-ink">
      <Snowflake className="size-8 animate-spin-slow text-solar/70" strokeWidth={5} />
      <span className="sr-only">Loading your studio</span>
    </div>
  );
}

/**
 * Signed-out view of the studio host. The marketing site lives on its own
 * domain, so this stays a focused entry point rather than a second landing page.
 */
export function StudioGate({ onStart }: { onStart: (mode: AuthMode) => void }) {
  return (
    <div className="relative isolate flex min-h-dvh flex-col overflow-hidden bg-ink">
      <div className="grain" aria-hidden="true" />

      <LazyVideo
        src={AUTH_BACKGROUND.src}
        poster={AUTH_BACKGROUND.poster}
        eager
        className="absolute inset-0 -z-20 size-full object-cover opacity-25"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/70 via-ink/90 to-ink" />
      <div className="pointer-events-none absolute -top-40 left-1/4 -z-10 size-[32rem] animate-aurora rounded-full bg-solar/[0.07] blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 right-0 -z-10 size-[28rem] animate-aurora rounded-full bg-nova/[0.08] blur-[120px] [animation-delay:-9s]" />

      <header className="relative z-10 flex h-16 items-center justify-between px-5 sm:px-8 lg:h-18">
        <a href={SITE_URL} className="flex items-center gap-3">
          <Logo spin />
        </a>
        <div className="flex items-center gap-1">
          <a
            href={LEARN_URL}
            className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-[0.82rem] text-frost-dim transition-colors hover:text-frost"
          >
            Learn
            <ArrowUpRight className="size-3.5" />
          </a>
          <a
            href={SITE_URL}
            className="hidden rounded-full px-4 py-2 text-[0.82rem] text-frost-dim transition-colors hover:text-frost sm:inline-flex"
          >
            Main site
          </a>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-5 py-16 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-solar/25 px-3 py-1 text-[0.6rem] font-bold tracking-[0.16em] uppercase text-solar/80">
            <Sparkles className="size-3" />
            The studio
          </span>

          <h1 className="mt-7 text-[clamp(2.3rem,6vw,3.4rem)] leading-[0.95] font-semibold tracking-[-0.045em]">
            Sign in to
            <span className="font-serif font-normal italic text-solar"> start rendering.</span>
          </h1>

          <p className="mt-5 max-w-md text-[0.95rem] leading-relaxed text-frost-dim">
            Your queue, your credits and every frame you have made live here.
            Email and password is all it takes — no ID, no KYC.
          </p>

          <ul className="mt-8 flex flex-col gap-3 border-t border-line/60 pt-8">
            {HIGHLIGHTS.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 text-[0.86rem] text-frost-dim"
              >
                <Snowflake className="mt-0.5 size-3.5 shrink-0 text-solar" strokeWidth={7} />
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              onClick={() => onStart("signup")}
              className="group w-full sm:w-auto"
            >
              Create account
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => onStart("login")}
              className="w-full sm:w-auto"
            >
              Sign in
            </Button>
          </div>

          <p className="mt-8 text-[0.72rem] leading-relaxed text-frost-faint">
            New to prompting?{" "}
            <a href={LEARN_URL} className="text-frost-dim underline underline-offset-4 hover:text-solar">
              Start with the lessons
            </a>
            .
          </p>
        </motion.div>
      </main>
    </div>
  );
}
