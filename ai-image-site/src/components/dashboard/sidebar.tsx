"use client";

import {
  Bot,
  Clapperboard,
  Coins,
  Compass,
  Gift,
  ImagePlus,
  Layers,
  LogOut,
  Megaphone,
  Mail,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useAtomValue, useSetAtom } from "jotai";
import { Logo, Snowflake } from "@/components/brand/snowflake";
import { busyAtom, logoutAtom, topUpAtom, userAtom } from "@/lib/store";
import { cn, firstNameOf } from "@/lib/utils";
import type { DashboardView } from "./types";

type NavItem = {
  view: DashboardView;
  label: string;
  icon: LucideIcon;
  badge?: string;
  badgeTone?: "solar" | "nova" | "mint";
};

type NavGroup = { title: string; items: NavItem[] };

const NAV: NavGroup[] = [
  {
    title: "Create",
    items: [
      { view: "image", label: "Generate Image", icon: ImagePlus },
      { view: "video", label: "Generate Video", icon: Clapperboard },
      { view: "ugc-ads", label: "UGC Ads", icon: Megaphone },
    ],
  },
  {
    title: "AI Influencers",
    items: [
      { view: "influencers", label: "My Influencers", icon: Users },
      { view: "create-influencer", label: "Create Influencer", icon: Bot },
    ],
  },
  {
    title: "Earn",
    items: [
      { view: "affiliate", label: "Affiliate Program", icon: Gift },
    ],
  },
  {
    title: "Library",
    items: [
      { view: "library", label: "My Creations", icon: Layers },
      { view: "explore", label: "Explore", icon: Compass },
    ],
  },
];

const BADGE_TONES: Record<NonNullable<NavItem["badgeTone"]>, string> = {
  solar: "border-solar/30 bg-solar/10 text-solar",
  nova: "border-nova/30 bg-nova/10 text-nova-soft",
  mint: "border-mint/30 bg-mint/10 text-mint",
};

function NavButton({
  item,
  active,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[0.84rem] font-medium transition-all duration-200",
        active
          ? "bg-solar/[0.09] text-frost"
          : "text-frost-faint hover:bg-white/[0.04] hover:text-frost",
      )}
    >
      <span
        className={cn(
          "absolute top-1/2 left-0 h-5 w-[3px] -translate-y-1/2 rounded-full bg-solar transition-all duration-300",
          active ? "opacity-100 shadow-[0_0_12px_rgba(255,212,38,0.8)]" : "opacity-0 group-hover:opacity-40",
        )}
      />
      <Icon
        className={cn(
          "size-[1.05rem] shrink-0 transition-colors",
          active ? "text-solar" : "text-frost-faint group-hover:text-frost-dim",
        )}
      />
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {item.badge && (
        <span
          className={cn(
            "rounded-full border px-1.5 py-px text-[0.56rem] font-bold tracking-[0.08em] uppercase",
            BADGE_TONES[item.badgeTone ?? "solar"],
          )}
        >
          {item.badge}
        </span>
      )}
    </button>
  );
}

export function Sidebar({
  activeView,
  onNavigate,
}: {
  activeView: DashboardView;
  onNavigate: (v: DashboardView) => void;
}) {
  const user = useAtomValue(userAtom);
  const busy = useAtomValue(busyAtom);
  const topUp = useSetAtom(topUpAtom);
  const logout = useSetAtom(logoutAtom);

  if (!user) return null;
  const creditPct = Math.min(100, (user.creditBalance / 200) * 100);
  const nav = user.isAdmin
    ? [
        ...NAV,
        {
          title: "Admin",
          items: [{ view: "audience" as const, label: "Audience", icon: Mail }],
        },
      ]
    : NAV;

  return (
    <div className="flex h-full w-full flex-col bg-ink-soft/60">
      <div className="flex h-16 shrink-0 items-center border-b border-line/50 px-5">
        <Logo />
      </div>

      <nav className="no-scrollbar flex-1 overflow-y-auto px-3 py-5">
        {nav.map((group) => (
          <div key={group.title} className="mb-6">
            <p className="mb-2 px-3 text-[0.6rem] font-bold tracking-[0.22em] uppercase text-frost-faint/70">
              {group.title}
            </p>
            <div className="grid gap-0.5">
              {group.items.map((item) => (
                <NavButton
                  key={item.view}
                  item={item}
                  active={activeView === item.view}
                  onClick={() => onNavigate(item.view)}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="shrink-0 space-y-3 border-t border-line/50 p-4">
        <div className="relative overflow-hidden rounded-2xl border border-line/70 bg-ink-card/80 p-4">
          <div className="pointer-events-none absolute -top-10 -right-10 size-28 rounded-full bg-solar/15 blur-2xl" />
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-[0.68rem] font-semibold tracking-[0.14em] uppercase text-frost-faint">
              <Coins className="size-3.5 text-solar" />
              Credits
            </span>
            <span className="font-mono text-[0.8rem] font-semibold text-solar">
              {user.creditBalance}
            </span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-solar-deep via-solar to-solar-soft transition-all duration-700"
              style={{ width: `${Math.max(4, creditPct)}%` }}
            />
          </div>
          <button
            onClick={() => topUp()}
            disabled={busy}
            className="mt-3.5 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-solar py-2 text-[0.76rem] font-bold text-on-solar transition-all hover:shadow-[0_8px_28px_-8px_rgba(255,212,38,0.6)] disabled:opacity-50"
          >
            <Snowflake className="size-3.5" strokeWidth={7} />
            Top up balance
          </button>
        </div>

        <div className="flex items-center gap-2.5 rounded-xl px-2 py-1.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-nova to-solar-deep text-[0.72rem] font-bold text-white">
            {firstNameOf(user).slice(0, 1).toUpperCase()}
          </span>
          <span className="min-w-0 flex-1 truncate text-[0.76rem] text-frost-dim">
            {firstNameOf(user)}
          </span>
          <button
            onClick={() => logout()}
            disabled={busy}
            aria-label="Log out"
            className="cursor-pointer rounded-lg p-1.5 text-frost-faint transition-colors hover:bg-white/5 hover:text-red-400 disabled:opacity-50"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
