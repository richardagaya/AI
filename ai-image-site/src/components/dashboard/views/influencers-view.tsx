"use client";

import Image from "next/image";
import {
  BadgeCheck,
  Camera,
  CircleDollarSign,
  Heart,
  MonitorPlay,
  Music2,
  Plus,
  TrendingUp,
  Users,
} from "lucide-react";
import { ART_STILLS } from "@/lib/media";
import { cn } from "@/lib/utils";
import type { DashboardView } from "../types";

type Influencer = {
  name: string;
  handle: string;
  niche: string;
  avatar: string;
  followers: string;
  engagement: string;
  revenue: string;
  status: "Live" | "Training";
  platforms: ("ig" | "tt" | "yt")[];
};

const INFLUENCERS: Influencer[] = [
  {
    name: "Yuki Amaranthe",
    handle: "@yuki.renders",
    niche: "Anime · Cosplay",
    avatar: ART_STILLS[0],
    followers: "412K",
    engagement: "8.4%",
    revenue: "$3,240/mo",
    status: "Live",
    platforms: ["ig", "tt"],
  },
  {
    name: "Seraphina Noir",
    handle: "@sera.noir",
    niche: "Dark fantasy · Goth",
    avatar: ART_STILLS[1],
    followers: "188K",
    engagement: "11.2%",
    revenue: "$1,870/mo",
    status: "Live",
    platforms: ["ig", "yt"],
  },
  {
    name: "Kai Draven",
    handle: "@kai.draven",
    niche: "Fitness · Cyberpunk",
    avatar: ART_STILLS[4],
    followers: "96K",
    engagement: "6.1%",
    revenue: "$940/mo",
    status: "Training",
    platforms: ["tt"],
  },
  {
    name: "Marina Solace",
    handle: "@marina.solace",
    niche: "Ocean · Fantasy",
    avatar: ART_STILLS[3],
    followers: "254K",
    engagement: "9.7%",
    revenue: "$2,410/mo",
    status: "Live",
    platforms: ["ig", "tt", "yt"],
  },
];

const PLATFORM_ICON = { ig: Camera, tt: Music2, yt: MonitorPlay } as const;

const STEPS = [
  { title: "Design persona", body: "Face, style, voice, lore — locked into a consistent character sheet." },
  { title: "Train identity", body: "A private identity model keeps every post perfectly on-face." },
  { title: "Generate content", body: "Batch a month of posts, stories and reels in one sitting." },
  { title: "Monetize", body: "Sponsorships, fan subscriptions and affiliate drops on autopilot." },
];

export function InfluencersView({
  onNavigate,
}: {
  onNavigate: (v: DashboardView) => void;
}) {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 pt-10 pb-16 sm:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.66rem] font-bold tracking-[0.28em] uppercase text-nova-soft">
            Synthetic talent agency
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
            Your{" "}
            <span className="font-serif italic text-solar-gradient">
              AI influencers
            </span>
          </h1>
          <p className="mt-2 max-w-lg text-[0.86rem] leading-relaxed text-frost-faint">
            Consistent virtual personas that post, grow and earn while you
            sleep.
          </p>
        </div>
        <button
          onClick={() => onNavigate("create-influencer")}
          className="flex cursor-pointer items-center gap-2 rounded-full bg-solar px-5 py-2.5 text-[0.8rem] font-bold text-on-solar transition-all hover:shadow-[0_10px_36px_-8px_rgba(255,212,38,0.65)]"
        >
          <Plus className="size-4" />
          New influencer
        </button>
      </header>

      {/* Pipeline */}
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => (
          <div
            key={s.title}
            className="relative overflow-hidden rounded-2xl border border-line/70 bg-ink-card/50 p-4"
          >
            <span className="font-mono text-[0.62rem] font-bold text-solar">
              0{i + 1}
            </span>
            <h3 className="mt-1.5 text-[0.86rem] font-semibold">{s.title}</h3>
            <p className="mt-1 text-[0.72rem] leading-relaxed text-frost-faint">
              {s.body}
            </p>
          </div>
        ))}
      </div>

      {/* Roster */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {INFLUENCERS.map((inf) => (
          <article
            key={inf.handle}
            className="group relative overflow-hidden rounded-3xl border border-line/70 bg-ink-card/60 transition-all duration-300 hover:border-nova/40 hover:shadow-[0_24px_60px_-32px_rgba(139,92,246,0.45)]"
          >
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image
                src={inf.avatar}
                alt={inf.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
              <span
                className={cn(
                  "absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.58rem] font-bold tracking-[0.14em] uppercase backdrop-blur-md",
                  inf.status === "Live"
                    ? "border-mint/30 bg-ink/70 text-mint"
                    : "border-solar/30 bg-ink/70 text-solar",
                )}
              >
                {inf.status === "Live" ? (
                  <span className="size-1.5 animate-pulse rounded-full bg-mint" />
                ) : (
                  <span className="size-1.5 animate-pulse rounded-full bg-solar" />
                )}
                {inf.status}
              </span>
              <div className="absolute top-3 right-3 flex gap-1.5">
                {inf.platforms.map((p) => {
                  const P = PLATFORM_ICON[p];
                  return (
                    <span
                      key={p}
                      className="grid size-7 place-items-center rounded-full border border-white/10 bg-ink/70 text-frost-dim backdrop-blur-md"
                    >
                      <P className="size-3.5" />
                    </span>
                  );
                })}
              </div>
              <div className="absolute inset-x-0 bottom-0 p-4">
                <h3 className="flex items-center gap-1.5 text-[1rem] font-semibold">
                  {inf.name}
                  <BadgeCheck className="size-4 fill-nova text-ink" />
                </h3>
                <p className="font-mono text-[0.66rem] text-frost-faint">
                  {inf.handle} · {inf.niche}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 divide-x divide-line/60 border-t border-line/60">
              {[
                { icon: Users, value: inf.followers, label: "Fans" },
                { icon: Heart, value: inf.engagement, label: "Eng." },
                { icon: CircleDollarSign, value: inf.revenue, label: "Est." },
              ].map((s) => (
                <div key={s.label} className="px-3 py-3 text-center">
                  <p className="flex items-center justify-center gap-1 text-[0.78rem] font-bold">
                    <s.icon className="size-3 text-solar" />
                    {s.value}
                  </p>
                  <p className="mt-0.5 text-[0.58rem] tracking-[0.14em] uppercase text-frost-faint">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>

      {/* Earnings banner */}
      <div className="relative mt-8 overflow-hidden rounded-3xl border border-solar/20 bg-gradient-to-r from-solar/10 via-ink-card to-nova/10 p-6 sm:p-8">
        <div className="pointer-events-none absolute -top-16 right-10 size-48 animate-aurora rounded-full bg-solar/15 blur-3xl" />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-[0.66rem] font-bold tracking-[0.24em] uppercase text-solar">
              <TrendingUp className="size-3.5" />
              Combined roster revenue
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-[-0.03em]">
              $8,460<span className="text-lg text-frost-faint">/mo</span>
            </p>
            <p className="mt-1 text-[0.78rem] text-frost-faint">
              Across 4 personas · up 23% from last month
            </p>
          </div>
          <button
            onClick={() => onNavigate("create-influencer")}
            className="cursor-pointer rounded-full border border-solar/40 bg-solar/10 px-5 py-2.5 text-[0.8rem] font-bold text-solar transition-all hover:bg-solar/20"
          >
            Scale the roster
          </button>
        </div>
      </div>
    </div>
  );
}
