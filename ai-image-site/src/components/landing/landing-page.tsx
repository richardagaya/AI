import { Capabilities } from "@/components/landing/capabilities";
import { Faq } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";
import { Hero } from "@/components/landing/hero";
import { MarqueeStrip } from "@/components/landing/marquee-strip";
import { Showcase } from "@/components/landing/showcase";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteNav } from "@/components/landing/site-nav";
import { StudioPreview } from "@/components/landing/studio-preview";
import { TrustedBy } from "@/components/landing/trusted-by";
import { Workflow } from "@/components/landing/workflow";
import { learnUrl, studioUrl } from "@/lib/site";

export function LandingPage() {
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
        <Hero startHref={startHref} />
        <TrustedBy />
        <MarqueeStrip />
        <Showcase />
        <StudioPreview />
        <Capabilities />
        <Workflow />
        <Faq />
        <FinalCta startHref={startHref} />
      </main>
      <SiteFooter />
    </div>
  );
}
