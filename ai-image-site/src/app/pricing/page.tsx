import type { Metadata } from "next";
import { FinalCta } from "@/components/landing/final-cta";
import { Pricing } from "@/components/landing/pricing";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteNav } from "@/components/landing/site-nav";
import { learnUrl, pricingUrl, studioUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pricing — minsuro",
  description:
    "Buy credits for the minsuro studio. Pay once, render whenever — no subscription, and credits never expire.",
  alternates: { canonical: pricingUrl() },
};

export default function PricingPage() {
  const startHref = studioUrl("signup");

  return (
    <div className="relative overflow-x-clip">
      <div className="grain" aria-hidden="true" />
      <SiteNav
        startHref={startHref}
        signInHref={studioUrl("login")}
        learnHref={learnUrl()}
      />
      <main>
        <Pricing startHref={startHref} />
        <FinalCta startHref={startHref} />
      </main>
      <SiteFooter />
    </div>
  );
}
