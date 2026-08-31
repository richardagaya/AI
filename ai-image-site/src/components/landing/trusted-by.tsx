"use client";

import { cn } from "@/lib/utils";

const COMPANIES = [
  { name: "ChatGPT", Logo: ChatGptMark },
  { name: "Seedance", Logo: SeedanceMark },
  { name: "Veo", Logo: VeoMark },
  { name: "fal.ai", Logo: FalMark },
  { name: "Gemini", Logo: GeminiMark },
  { name: "Anthropic", Logo: AnthropicMark },
  { name: "Perplexity", Logo: PerplexityMark },
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

function ChatGptMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-8", className)} aria-hidden>
      <path
        fill="currentColor"
        d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.182a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.91 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zm-9.022 12.608a4.476 4.476 0 0 1-2.876-1.04l.142-.08 4.778-2.758a.795.795 0 0 0 .393-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.495 4.494zM3.68 18.353a4.436 4.436 0 0 1-.535-3.014l.142.085 4.783 2.758a.771.771 0 0 0 .781 0l5.843-3.368v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.06-1.597zM2.341 7.896a4.485 4.485 0 0 1 2.365-1.972V11.6a.766.766 0 0 0 .388.676l5.814 3.355-2.02 1.168a.076.076 0 0 1-.071 0L4.0 13.99A4.504 4.504 0 0 1 2.34 7.872zm16.596 3.855-5.833-3.387L15.12 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.104v-5.677a.79.79 0 0 0-.407-.667zm2.01-3.023-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zM8.307 12.863l-2.02-1.164a.08.08 0 0 1-.038-.057V6.074a4.499 4.499 0 0 1 7.376-3.454l-.142.081L8.704 5.459a.795.795 0 0 0-.393.681zm1.097-2.365 2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"
      />
    </svg>
  );
}

function SeedanceMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-8", className)} aria-hidden>
      <path
        fill="currentColor"
        d="M12 2.4c.4 2.4 1.6 4.1 4.4 5.1-2.8 1-4 2.7-4.4 5.1-.4-2.4-1.6-4.1-4.4-5.1 2.8-1 4-2.7 4.4-5.1z"
      />
      <path
        fill="currentColor"
        d="M7.2 14.2c1.6 1.1 2.5 2.6 2.8 4.6-1.9-.7-3.4-1.9-4.6-3.5 0-.4.8-.9 1.8-1.1zm9.6 0c1 .2 1.8.7 1.8 1.1-1.2 1.6-2.7 2.8-4.6 3.5.3-2 1.2-3.5 2.8-4.6zM12 20.2c.7 0 1.3.3 1.6.8H10.4c.3-.5.9-.8 1.6-.8z"
      />
    </svg>
  );
}

function VeoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-8", className)} aria-hidden>
      <path
        fill="currentColor"
        d="M4.2 5.4h5.1L12 12.1l2.7-6.7h5.1L14.2 18.6h-4.4z"
      />
    </svg>
  );
}

function FalMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-8", className)} aria-hidden>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 6.5 13.5 12 7 17.5M13 6.5 19.5 12 13 17.5"
      />
    </svg>
  );
}

function GeminiMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-8", className)} aria-hidden>
      <path
        fill="currentColor"
        d="M12 1.6C10.1 7.2 7.2 10.1 1.6 12 7.2 13.9 10.1 16.8 12 22.4 13.9 16.8 16.8 13.9 22.4 12 16.8 10.1 13.9 7.2 12 1.6z"
      />
    </svg>
  );
}

function AnthropicMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-8", className)} aria-hidden>
      <path
        fill="currentColor"
        d="m13.83 3.52 6.57 16.96h-3.6l-1.5-4.05H8.7l-1.5 4.05H3.6L10.17 3.52h3.66Zm-1.8 4.7L9.7 13.7h4.6l-2.27-5.48Z"
      />
    </svg>
  );
}

function PerplexityMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-8", className)} aria-hidden>
      <path
        fill="currentColor"
        d="M12 2.1 13.15 8.4 19.2 5.4 16.2 11.1 22 12 16.2 12.9 19.2 18.6 13.15 15.6 12 21.9 10.85 15.6 4.8 18.6 7.8 12.9 2 12 7.8 11.1 4.8 5.4 10.85 8.4z"
      />
    </svg>
  );
}
