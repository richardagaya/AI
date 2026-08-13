"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { Reveal, SectionLabel } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

const QA = [
  {
    q: "What can I actually generate?",
    a: "Anime, fantasy, mature and explicit work, stylised characters, textures and abstract art. Prompts are not keyword filtered. Anything depicting real minors or non-consenting real people is refused and always will be.",
  },
  {
    q: "How long does a render take?",
    a: "Around thirty seconds for a text-to-image job on the standard queue. Image-to-image is similar but costs two credits because it runs a heavier pass.",
  },
  {
    q: "Do credits expire?",
    a: "No. They sit on your account until you spend them, and a failed job never consumes a credit.",
  },
  {
    q: "Why crypto only?",
    a: "Card processors routinely freeze accounts for adult art, which would mean your credits vanish overnight. Coinbase Commerce settles instantly and keeps the platform independent.",
  },
  {
    q: "Who owns the output?",
    a: "You do. Downloads are full resolution with no watermark, and there is no licence clause claiming a share of what you make.",
  },
  {
    q: "Is my gallery private?",
    a: "Yes. Generations are tied to your account and are never published to a public feed or used as promotional material without you sending them.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="relative mx-auto max-w-5xl scroll-mt-24 px-5 py-24 sm:px-8 sm:py-32"
    >
      <Reveal className="text-center">
        <SectionLabel className="justify-center">Questions</SectionLabel>
        <h2 className="text-[clamp(2.1rem,5vw,3.4rem)] leading-[0.95] font-semibold tracking-[-0.045em]">
          Everything else
          <span className="font-serif font-normal italic text-solar"> you were about to ask.</span>
        </h2>
      </Reveal>

      <div className="mt-14 divide-y divide-line/60 border-y border-line/60">
        {QA.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={item.q}>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center gap-5 py-6 text-left transition-colors hover:text-solar"
              >
                <span className="flex-1 text-[1.02rem] font-medium tracking-[-0.02em] sm:text-[1.12rem]">
                  {item.q}
                </span>
                <Plus
                  className={cn(
                    "size-4 shrink-0 text-solar transition-transform duration-300",
                    isOpen && "rotate-45",
                  )}
                />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="max-w-2xl pb-7 text-[0.92rem] leading-relaxed text-frost-dim">
                      {item.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
