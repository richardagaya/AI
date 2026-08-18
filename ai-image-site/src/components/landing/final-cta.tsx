"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { LazyVideo } from "@/components/ui/lazy-video";
import { Snowflake } from "@/components/brand/snowflake";
import { FINAL_CTA_BACKGROUND } from "@/lib/media";

export function FinalCta({ onStart }: { onStart: () => void }) {
  return (
    <section className="relative mx-auto max-w-7xl px-5 pb-24 sm:px-8 sm:pb-32">
      <Reveal>
        <div className="relative isolate overflow-hidden rounded-[2.5rem] border border-solar/20 px-6 py-20 text-center sm:px-16 sm:py-28">
          <LazyVideo
            src={FINAL_CTA_BACKGROUND.src}
            poster={FINAL_CTA_BACKGROUND.poster}
            className="absolute inset-0 -z-20 size-full object-cover opacity-20"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/70 via-ink/85 to-ink" />
          <div className="absolute -bottom-40 left-1/2 -z-10 size-[36rem] -translate-x-1/2 rounded-full bg-solar/12 blur-[130px]" />

          <Snowflake className="mx-auto size-9 animate-spin-slow text-solar" strokeWidth={5} />

          <h2 className="mx-auto mt-8 max-w-3xl text-[clamp(2.2rem,6vw,4.2rem)] leading-[0.92] font-semibold tracking-[-0.05em]">
            Your next frame is
            <span className="font-serif font-normal italic text-solar"> thirty seconds away.</span>
          </h2>

          <p className="mx-auto mt-6 max-w-md text-[0.95rem] leading-relaxed text-frost-dim">
            Create an account, load a starter pack, and render whatever you have
            been putting off asking another platform for.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" onClick={onStart} className="group w-full sm:w-auto">
              Start creating
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <span className="text-[0.78rem] text-frost-faint">
              18+ only · crypto checkout · no KYC
            </span>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
