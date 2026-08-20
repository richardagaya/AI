import { Logo } from "@/components/brand/snowflake";
import { LESSONS } from "@/lib/learn";
import { learnUrl, SITE_URL, studioUrl } from "@/lib/site";

export function LearnFooter() {
  return (
    <footer className="border-t border-line/60">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-[0.86rem] leading-relaxed text-frost-faint">
              Prompting lessons for the minsuro studio. Written against the
              models the studio actually runs.
            </p>
          </div>

          <div>
            <h2 className="text-[0.66rem] font-semibold tracking-[0.18em] uppercase text-frost-faint">
              Lessons
            </h2>
            <ul className="mt-5 flex flex-col gap-3">
              {LESSONS.map((lesson) => (
                <li key={lesson.slug}>
                  <a
                    href={learnUrl(lesson.slug)}
                    className="text-[0.86rem] text-frost-dim transition-colors hover:text-solar"
                  >
                    {lesson.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-[0.66rem] font-semibold tracking-[0.18em] uppercase text-frost-faint">
              minsuro
            </h2>
            <ul className="mt-5 flex flex-col gap-3">
              <li>
                <a
                  href={SITE_URL}
                  className="text-[0.86rem] text-frost-dim transition-colors hover:text-solar"
                >
                  Main site
                </a>
              </li>
              <li>
                <a
                  href={studioUrl()}
                  className="text-[0.86rem] text-frost-dim transition-colors hover:text-solar"
                >
                  Open studio
                </a>
              </li>
              <li>
                <a
                  href={`${SITE_URL}/#pricing`}
                  className="text-[0.86rem] text-frost-dim transition-colors hover:text-solar"
                >
                  Pricing
                </a>
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-12 border-t border-line/60 pt-7 text-[0.74rem] text-frost-faint">
          © {new Date().getFullYear()} minsuro. Model behaviour changes — if a
          lesson disagrees with the studio, trust the studio.
        </p>
      </div>
    </footer>
  );
}
