import { Info } from "lucide-react";
import { Snowflake } from "@/components/brand/snowflake";
import { Reveal } from "@/components/ui/reveal";
import type { LessonBlock, LessonSection } from "@/lib/learn";

function Block({ block }: { block: LessonBlock }) {
  switch (block.kind) {
    case "text":
      return (
        <p className="text-[0.98rem] leading-[1.75] text-frost-dim">
          {block.body}
        </p>
      );

    case "list":
      return (
        <ul className="flex flex-col gap-3">
          {block.items.map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 text-[0.94rem] leading-relaxed text-frost-dim"
            >
              <Snowflake
                className="mt-1.5 size-3 shrink-0 text-solar"
                strokeWidth={8}
              />
              {item}
            </li>
          ))}
        </ul>
      );

    case "prompt":
      return (
        <figure className="overflow-hidden rounded-2xl border border-line/70 bg-ink-soft/70">
          <figcaption className="border-b border-line/60 px-5 py-2.5 text-[0.6rem] font-bold tracking-[0.2em] uppercase text-frost-faint">
            Prompt
          </figcaption>
          <p className="px-5 py-4 font-mono text-[0.82rem] leading-relaxed text-frost">
            {block.prompt}
          </p>
          {block.negative && (
            <>
              <div className="border-t border-line/60 px-5 py-2.5 text-[0.6rem] font-bold tracking-[0.2em] uppercase text-frost-faint">
                Negative
              </div>
              <p className="px-5 pb-4 font-mono text-[0.82rem] leading-relaxed text-frost-dim">
                {block.negative}
              </p>
            </>
          )}
          {block.note && (
            <p className="border-t border-line/60 px-5 py-3 text-[0.8rem] text-frost-faint">
              {block.note}
            </p>
          )}
        </figure>
      );

    case "callout":
      return (
        <aside className="rounded-2xl border border-solar/25 bg-solar/[0.05] p-5">
          <p className="flex items-center gap-2 text-[0.82rem] font-semibold text-solar">
            <Info className="size-3.5" />
            {block.title}
          </p>
          <p className="mt-2.5 text-[0.9rem] leading-relaxed text-frost-dim">
            {block.body}
          </p>
        </aside>
      );
  }
}

export function LessonBody({ sections }: { sections: LessonSection[] }) {
  return (
    <div className="flex flex-col gap-14">
      {sections.map((section, i) => (
        <Reveal
          key={section.heading}
          as="section"
          immediate={i === 0}
          delay={i === 0 ? 0 : 0.04}
        >
          <h2
            id={section.heading.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
            className="scroll-mt-24 text-[1.4rem] font-semibold tracking-[-0.03em] sm:text-[1.6rem]"
          >
            {section.heading}
          </h2>
          <div className="mt-5 flex flex-col gap-5">
            {section.blocks.map((block, blockIndex) => (
              <Block key={blockIndex} block={block} />
            ))}
          </div>
        </Reveal>
      ))}
    </div>
  );
}
