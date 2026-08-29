"use client";

import { motion } from "motion/react";
import { Reveal, SectionLabel } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

const COMPANIES = [
  { name: "Adobe", href: "https://www.adobe.com", Logo: AdobeMark },
  { name: "Canva", href: "https://www.canva.com", Logo: CanvaMark },
  { name: "Perplexity", href: "https://www.perplexity.ai", Logo: PerplexityMark },
  { name: "Shopify", href: "https://www.shopify.com", Logo: ShopifyMark },
  { name: "Quora", href: "https://www.quora.com", Logo: QuoraMark },
] as const;

export function TrustedBy() {
  const ticker = [...COMPANIES, ...COMPANIES, ...COMPANIES];

  return (
    <section className="relative overflow-hidden border-y border-line/60 bg-ink-soft/35 py-16 sm:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_50%_0%,rgba(255,212,38,0.07),transparent_60%)]" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <SectionLabel className="justify-center">
            Companies that trust this stack
          </SectionLabel>
          <h2 className="text-[clamp(1.7rem,4vw,2.6rem)] leading-[1.05] font-semibold tracking-[-0.04em]">
            The same models that run at
            <span className="font-serif font-normal italic text-solar"> the big rooms.</span>
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[0.88rem] leading-relaxed text-frost-faint">
            Minsuro renders on fal — the generative layer teams at Adobe, Canva,
            Perplexity, Shopify and Quora already ship with.
          </p>
        </Reveal>

        <div className="relative mt-10">
          <div className="pointer-events-none absolute inset-y-0 left-1/2 z-10 w-24 -translate-x-1/2 bg-gradient-to-r from-transparent via-solar/20 to-transparent blur-md animate-trusted-scan" />

          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {COMPANIES.map((c, i) => (
              <motion.li
                key={c.name}
                initial={{ opacity: 0, y: 22, filter: "blur(8px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.7,
                  delay: i * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <a
                  href={c.href}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    "group relative flex h-28 flex-col items-center justify-center gap-3 overflow-hidden rounded-3xl",
                    "border border-line/70 bg-ink-card/50",
                    "transition-all duration-500 hover:-translate-y-1.5 hover:border-solar/45 hover:bg-ink-card",
                    "hover:shadow-[0_24px_60px_-36px_rgba(255,212,38,0.55)]",
                  )}
                >
                  <span className="pointer-events-none absolute inset-0 overflow-hidden opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    <span className="absolute inset-y-0 w-1/3 animate-shine bg-gradient-to-r from-transparent via-white/18 to-transparent" />
                  </span>
                  <span
                    className="animate-float-y text-frost-dim transition-colors duration-500 group-hover:text-frost"
                    style={{ animationDelay: `${i * 0.55}s` }}
                  >
                    <c.Logo />
                  </span>
                  <span className="text-[0.72rem] font-semibold tracking-[0.18em] uppercase text-frost-faint transition-colors duration-500 group-hover:text-solar">
                    {c.name}
                  </span>
                </a>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>

      <div className="edge-fade group/ticker relative mt-10 overflow-hidden">
        <div className="flex w-max animate-marquee-logos items-center gap-12 py-2 group-hover/ticker:[animation-play-state:paused]">
          {ticker.map((c, i) => (
            <span
              key={`${c.name}-${i}`}
              className="flex items-center gap-3 text-frost-faint/70"
            >
              <c.Logo className="size-5" />
              <span className="text-[0.78rem] font-semibold tracking-[0.2em] uppercase">
                {c.name}
              </span>
              <span className="size-1 rounded-full bg-solar/50" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function AdobeMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-8", className)} aria-hidden>
      <path
        fill="currentColor"
        d="M13.966 22.624 12.276 18.343H8.122l3.892-9.144 5.662 13.425zM8.884 1.376H0v21.248zm15.116 0h-8.884L24 22.624z"
      />
    </svg>
  );
}

function CanvaMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-8", className)} aria-hidden>
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M12 1.8A10.2 10.2 0 1 0 18.7 19a1.55 1.55 0 1 0-2.05-2.32 7.1 7.1 0 1 1 0-9.36A1.55 1.55 0 1 0 18.7 5 10.2 10.2 0 0 0 12 1.8z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function PerplexityMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-8", className)} aria-hidden>
      <path
        fill="currentColor"
        d="M12 1.4 13.7 9 22.6 12 13.7 15 12 22.6 10.3 15 1.4 12 10.3 9z"
      />
    </svg>
  );
}

function ShopifyMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-8", className)} aria-hidden>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        d="M8.2 8.4c0-2.7 1.6-4.6 3.8-4.6s3.8 1.9 3.8 4.6"
      />
      <path
        fill="currentColor"
        d="M6.6 8.1h10.8l-1.05 11.6a1.7 1.7 0 0 1-1.7 1.55H9.35A1.7 1.7 0 0 1 7.66 19.7L6.6 8.1z"
      />
      <path
        fill="currentColor"
        opacity=".45"
        d="M13.15 12.1 11.7 18.2h1.55l1.15-6.1z"
      />
    </svg>
  );
}

function QuoraMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-8", className)} aria-hidden>
      <path
        fill="currentColor"
        d="M12.2 3.2c-4.7 0-8.5 3.5-8.5 8.3 0 4.6 3.6 8.3 8.5 8.3 1.3 0 2.5-.3 3.5-.8l2.6 2.5c.3.3.8.3 1.1 0l.9-.9c.3-.3.3-.8 0-1.1l-2.2-2.1c1.5-1.5 2.4-3.6 2.4-5.9 0-4.8-3.8-8.3-8.3-8.3zm0 3.3c2.8 0 5 2.2 5 5.1s-2.2 5.1-5 5.1-5-2.2-5-5.1 2.2-5.1 5-5.1z"
      />
    </svg>
  );
}
