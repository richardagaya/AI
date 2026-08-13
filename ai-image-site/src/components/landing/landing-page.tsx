"use client";

import { Capabilities } from "@/components/landing/capabilities";
import { Faq } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";
import { Hero } from "@/components/landing/hero";
import { MarqueeStrip } from "@/components/landing/marquee-strip";
import { Pricing } from "@/components/landing/pricing";
import { Showcase } from "@/components/landing/showcase";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteNav } from "@/components/landing/site-nav";
import { StudioPreview } from "@/components/landing/studio-preview";
import { Workflow } from "@/components/landing/workflow";

export function LandingPage({ onStart }: { onStart: () => void }) {
  return (
    <div className="relative overflow-x-clip">
      <div className="grain" aria-hidden="true" />
      <SiteNav onSignIn={onStart} />
      <main>
        <Hero onStart={onStart} />
        <MarqueeStrip />
        <Showcase />
        <StudioPreview />
        <Capabilities />
        <Workflow />
        <Pricing onStart={onStart} />
        <Faq />
        <FinalCta onStart={onStart} />
      </main>
      <SiteFooter />
    </div>
  );
}
