"use client";

import { cn } from "@/lib/utils";

const COMPANIES = [
  { name: "Adobe", Logo: AdobeMark },
  { name: "Canva", Logo: CanvaMark },
  { name: "Perplexity", Logo: PerplexityMark },
  { name: "Shopify", Logo: ShopifyMark },
  { name: "Quora", Logo: QuoraMark },
] as const;

export function TrustedBy() {
  const row = [...COMPANIES, ...COMPANIES];
  const ticker = [...row, ...row];

  return (
    <section className="relative overflow-hidden py-10 sm:py-12">
      <p className="text-center text-[0.64rem] font-semibold tracking-[0.22em] uppercase text-frost-faint">
        Companies that trust us
      </p>

      <div className="edge-fade mt-6 overflow-hidden">
        <div className="flex w-max animate-marquee-slow items-center gap-10 [animation-direction:reverse] sm:gap-14">
          {ticker.map((c, i) => (
            <span
              key={`${c.name}-${i}`}
              className="flex items-center gap-2 text-frost-faint/35"
            >
              <c.Logo className="size-4" />
              <span className="text-[0.62rem] font-medium tracking-[0.16em] uppercase">
                {c.name}
              </span>
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
