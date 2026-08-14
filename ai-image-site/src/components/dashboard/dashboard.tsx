"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, Snowflake as SnowIcon, X } from "lucide-react";
import { Logo, Snowflake } from "@/components/brand/snowflake";
import { cn } from "@/lib/utils";
import { Sidebar } from "./sidebar";
import { AffiliateView } from "./views/affiliate-view";
import { CreateInfluencerView } from "./views/create-influencer-view";
import { EnhanceView } from "./views/enhance-view";
import { ImageView } from "./views/image-view";
import { InfluencersView } from "./views/influencers-view";
import { LibraryView } from "./views/library-view";
import { VideoView } from "./views/video-view";
import { ExploreView } from "./views/explore-view";
import type {
  DashboardView,
  GenerateHandlers,
  StudioJob,
  StudioUser,
} from "./types";

export type { StudioJob, StudioUser } from "./types";

export function Dashboard({
  user,
  jobs,
  busy,
  onTopUp,
  onLogout,
  ...handlers
}: {
  user: StudioUser;
  jobs: StudioJob[];
  busy: boolean;
  onTopUp: () => void;
  onLogout: () => void;
} & GenerateHandlers) {
  const [view, setView] = useState<DashboardView>("image");
  const [navOpen, setNavOpen] = useState(false);
  const [videoNotice, setVideoNotice] = useState(false);

  const navigate = useCallback((v: DashboardView) => {
    setView(v);
    setNavOpen(false);
    setVideoNotice(false);
  }, []);

  const usePrompt = useCallback(
    (prompt: string) => {
      handlers.onPromptChange(prompt);
      navigate("image");
    },
    [handlers, navigate],
  );

  const imageHandlers: GenerateHandlers = { ...handlers, busy };

  const videoHandlers: GenerateHandlers = {
    ...handlers,
    busy,
    canGenerate: handlers.prompt.trim().length > 0,
    onGenerate: () => setVideoNotice(true),
  };

  return (
    <div className="flex h-dvh overflow-hidden bg-ink">
      {/* Ambient aurora backdrop */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-[34rem] w-[34rem] animate-aurora rounded-full bg-solar/[0.05] blur-[110px]" />
        <div
          className="absolute right-0 -bottom-40 h-[30rem] w-[30rem] animate-aurora rounded-full bg-nova/[0.07] blur-[110px]"
          style={{ animationDelay: "-9s" }}
        />
      </div>
      <div className="grain" />

      {/* Desktop sidebar */}
      <aside className="relative z-20 hidden w-[268px] shrink-0 border-r border-line/50 lg:block">
        <Sidebar
          user={user}
          activeView={view}
          busy={busy}
          onNavigate={navigate}
          onTopUp={onTopUp}
          onLogout={onLogout}
        />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {navOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setNavOpen(false)}
              className="fixed inset-0 z-40 bg-ink/70 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-[280px] border-r border-line/60 bg-ink-soft lg:hidden"
            >
              <Sidebar
                user={user}
                activeView={view}
                busy={busy}
                onNavigate={navigate}
                onTopUp={onTopUp}
                onLogout={onLogout}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main column */}
      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-line/50 bg-ink/85 px-4 backdrop-blur-xl lg:hidden">
          <button
            onClick={() => setNavOpen(true)}
            aria-label="Open menu"
            className="cursor-pointer rounded-xl border border-line/70 bg-white/[0.02] p-2.5 text-frost-dim transition-colors hover:text-frost"
          >
            <Menu className="size-4.5" />
          </button>
          <Logo />
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-solar/25 bg-solar/8 px-3 py-1 font-mono text-[0.68rem] text-solar">
            <Snowflake className="size-3" strokeWidth={7} />
            {user.creditBalance}
          </span>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              {view === "image" && (
                <ImageView
                  user={user}
                  jobs={jobs}
                  handlers={imageHandlers}
                  onNavigate={navigate}
                  onUsePrompt={usePrompt}
                />
              )}
              {view === "video" && <VideoView handlers={videoHandlers} />}
              {view === "enhance" && <EnhanceView />}
              {view === "influencers" && (
                <InfluencersView onNavigate={navigate} />
              )}
              {view === "create-influencer" && (
                <CreateInfluencerView onNavigate={navigate} />
              )}
              {view === "affiliate" && <AffiliateView user={user} />}
              {view === "library" && <LibraryView jobs={jobs} />}
              {view === "explore" && <ExploreView onUsePrompt={usePrompt} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Video early-access toast */}
      <AnimatePresence>
        {videoNotice && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            className={cn(
              "fixed bottom-6 left-1/2 z-50 w-[calc(100%-2.5rem)] max-w-md -translate-x-1/2",
            )}
          >
            <div className="glass-panel relative overflow-hidden rounded-2xl p-4 pr-11 shadow-[0_24px_70px_-20px_rgba(0,0,0,0.8)]">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-nova to-transparent" />
              <p className="flex items-center gap-2 text-[0.84rem] font-semibold">
                <SnowIcon className="size-4 text-nova-soft" />
                You&apos;re on the video waitlist
              </p>
              <p className="mt-1 text-[0.76rem] leading-relaxed text-frost-faint">
                Motion One rolls out to Pro accounts first — your prompt is
                saved and will be rendered the moment your seat opens.
              </p>
              <button
                onClick={() => setVideoNotice(false)}
                aria-label="Dismiss"
                className="absolute top-3 right-3 cursor-pointer rounded-lg p-1.5 text-frost-faint transition-colors hover:bg-white/5 hover:text-frost"
              >
                <X className="size-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
