import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { LessonBody } from "@/components/learn/lesson-body";
import { Reveal } from "@/components/ui/reveal";
import { buttonStyles } from "@/components/ui/button-styles";
import { Snowflake } from "@/components/brand/snowflake";
import { getLesson, LESSONS, lessonNeighbours } from "@/lib/learn";
import { learnUrl, studioUrl } from "@/lib/site";

export function generateStaticParams() {
  return LESSONS.map((lesson) => ({ slug: lesson.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) return { title: "Lesson not found" };

  return {
    title: lesson.title,
    description: lesson.summary,
    alternates: { canonical: learnUrl(lesson.slug) },
    openGraph: {
      title: `${lesson.title} — minsuro learn`,
      description: lesson.summary,
      type: "article",
      url: learnUrl(lesson.slug),
    },
  };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) notFound();

  const { previous, next } = lessonNeighbours(lesson.slug);

  return (
    <article className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-20">
      <a
        href={learnUrl()}
        className="inline-flex items-center gap-1.5 text-[0.8rem] text-frost-faint transition-colors hover:text-solar"
      >
        <ArrowLeft className="size-3.5" />
        All lessons
      </a>

      <header className="mt-8 border-b border-line/60 pb-10">
        <div className="flex items-center gap-3 text-[0.66rem] font-semibold tracking-[0.14em] uppercase text-frost-faint">
          <span className="text-solar">{lesson.track}</span>
          <span className="rounded-full border border-line px-2 py-0.5">
            {lesson.level}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-3" />
            {lesson.minutes} min
          </span>
        </div>

        <h1 className="mt-5 text-[clamp(2rem,5vw,3rem)] leading-[1] font-semibold tracking-[-0.045em]">
          {lesson.title}
        </h1>
        <p className="mt-5 text-[1.02rem] leading-relaxed text-frost-dim">
          {lesson.summary}
        </p>
      </header>

      <div className="mt-14">
        <LessonBody sections={lesson.sections} />
      </div>

      <Reveal className="mt-16 rounded-3xl border border-line/70 bg-ink-card/60 p-7">
        <h2 className="text-[0.66rem] font-bold tracking-[0.2em] uppercase text-frost-faint">
          Worth remembering
        </h2>
        <ul className="mt-5 flex flex-col gap-3">
          {lesson.takeaways.map((takeaway) => (
            <li
              key={takeaway}
              className="flex items-start gap-3 text-[0.92rem] leading-relaxed text-frost"
            >
              <Snowflake className="mt-1 size-3.5 shrink-0 text-solar" strokeWidth={7} />
              {takeaway}
            </li>
          ))}
        </ul>

        <a
          href={studioUrl()}
          className={buttonStyles({ className: "group mt-7 w-full sm:w-auto" })}
        >
          Try it in the studio
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </a>
      </Reveal>

      <nav className="mt-14 grid gap-4 border-t border-line/60 pt-10 sm:grid-cols-2">
        {previous ? (
          <a
            href={learnUrl(previous.slug)}
            className="group rounded-2xl border border-line/70 p-5 transition-colors hover:border-solar/35"
          >
            <span className="text-[0.66rem] font-semibold tracking-[0.16em] uppercase text-frost-faint">
              Previous
            </span>
            <p className="mt-2 text-[0.95rem] font-medium transition-colors group-hover:text-solar">
              {previous.title}
            </p>
          </a>
        ) : (
          <span />
        )}

        {next && (
          <a
            href={learnUrl(next.slug)}
            className="group rounded-2xl border border-line/70 p-5 text-right transition-colors hover:border-solar/35 sm:col-start-2"
          >
            <span className="text-[0.66rem] font-semibold tracking-[0.16em] uppercase text-frost-faint">
              Next
            </span>
            <p className="mt-2 text-[0.95rem] font-medium transition-colors group-hover:text-solar">
              {next.title}
            </p>
          </a>
        )}
      </nav>
    </article>
  );
}
