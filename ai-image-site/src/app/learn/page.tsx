import type { Metadata } from "next";
import { ArrowRight, Clock } from "lucide-react";
import { Reveal, SectionLabel } from "@/components/ui/reveal";
import { LESSONS, lessonsByTrack } from "@/lib/learn";
import { learnUrl, studioUrl } from "@/lib/site";
import { buttonStyles } from "@/components/ui/button-styles";

export const metadata: Metadata = {
  title: "Prompting lessons",
  description:
    "Six short lessons on getting what you want out of the minsuro studio — prompt structure, negative prompts, model choice, framing, image-to-image and credits.",
  alternates: { canonical: learnUrl() },
};

const totalMinutes = LESSONS.reduce((sum, l) => sum + l.minutes, 0);

export default function LearnIndexPage() {
  const groups = lessonsByTrack();

  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-line/60">
        <div className="pointer-events-none absolute -top-40 left-1/3 -z-10 size-[30rem] animate-aurora rounded-full bg-solar/[0.06] blur-[120px]" />

        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
          <Reveal immediate className="max-w-3xl">
            <SectionLabel>{LESSONS.length} lessons · {totalMinutes} minutes</SectionLabel>
            <h1 className="text-[clamp(2.4rem,6vw,4rem)] leading-[0.95] font-semibold tracking-[-0.05em]">
              Learn to get exactly
              <span className="font-serif font-normal italic text-solar"> what you pictured.</span>
            </h1>
            <p className="mt-6 max-w-xl text-[0.98rem] leading-relaxed text-frost-dim">
              Most disappointing renders are not a model problem. They are a
              prompt missing a part, a control that was never sent, or the wrong
              model for the job. These lessons are written against the models
              the studio actually runs, so the advice matches what happens when
              you press generate.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href={learnUrl(LESSONS[0].slug)}
                className={buttonStyles({ size: "lg", className: "group" })}
              >
                Start with the first lesson
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href={studioUrl()}
                className={buttonStyles({ variant: "outline", size: "lg" })}
              >
                Open the studio
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
        {groups.map((group, groupIndex) => (
          <section
            key={group.track}
            className={groupIndex === 0 ? "" : "mt-20"}
          >
            <Reveal>
              <h2 className="text-[1.6rem] font-semibold tracking-[-0.035em] sm:text-[1.9rem]">
                {group.track}
              </h2>
              <p className="mt-2 text-[0.9rem] text-frost-faint">
                {group.description}
              </p>
            </Reveal>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {group.lessons.map((lesson, i) => (
                <Reveal key={lesson.slug} delay={i * 0.06}>
                  <a
                    href={learnUrl(lesson.slug)}
                    className="group flex h-full flex-col rounded-3xl border border-line/70 bg-ink-card/60 p-7 transition-all duration-300 hover:-translate-y-0.5 hover:border-solar/35 hover:bg-ink-card"
                  >
                    <div className="flex items-center gap-3 text-[0.66rem] font-semibold tracking-[0.14em] uppercase text-frost-faint">
                      <span className="rounded-full border border-line px-2 py-0.5">
                        {lesson.level}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="size-3" />
                        {lesson.minutes} min
                      </span>
                    </div>

                    <h3 className="mt-5 text-[1.15rem] leading-snug font-semibold tracking-[-0.025em] transition-colors group-hover:text-solar">
                      {lesson.title}
                    </h3>
                    <p className="mt-3 flex-1 text-[0.88rem] leading-relaxed text-frost-dim">
                      {lesson.summary}
                    </p>

                    <span className="mt-6 inline-flex items-center gap-1.5 text-[0.8rem] font-medium text-solar">
                      Read lesson
                      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </a>
                </Reveal>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
