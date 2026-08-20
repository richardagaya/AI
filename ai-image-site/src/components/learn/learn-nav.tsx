import { ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/brand/snowflake";
import { buttonStyles } from "@/components/ui/button-styles";
import { learnUrl, SITE_URL, studioUrl } from "@/lib/site";

export function LearnNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-line/60 bg-ink/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <a href={learnUrl()} className="flex items-center gap-2.5">
          <Logo />
          <span className="rounded-full border border-line px-2 py-0.5 text-[0.55rem] font-bold tracking-[0.16em] uppercase text-frost-faint">
            Learn
          </span>
        </a>

        <div className="flex items-center gap-1">
          <a
            href={SITE_URL}
            className="hidden items-center gap-1 rounded-full px-4 py-2 text-[0.82rem] text-frost-dim transition-colors hover:text-frost sm:inline-flex"
          >
            Main site
            <ArrowUpRight className="size-3.5" />
          </a>
          <a
            href={studioUrl()}
            className={buttonStyles({ size: "sm", className: "ml-1" })}
          >
            Open studio
          </a>
        </div>
      </nav>
    </header>
  );
}
