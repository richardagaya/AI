"use client";

import { useState } from "react";
import {
  Check,
  Copy,
  Crown,
  Gift,
  Link2,
  MousePointerClick,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { StudioUser } from "../types";

const STATS = [
  { icon: Wallet, label: "Lifetime earnings", value: "$1,284.50", delta: "+$212 this month" },
  { icon: Users, label: "Referred creators", value: "47", delta: "+6 this week" },
  { icon: MousePointerClick, label: "Link clicks", value: "8,932", delta: "12.4% CTR" },
  { icon: TrendingUp, label: "Conversion", value: "5.8%", delta: "Top 10% of affiliates" },
];

const TIERS = [
  { name: "Creator", rate: "30%", need: "0 referrals", icon: Gift, active: true },
  { name: "Ambassador", rate: "40%", need: "25 referrals", icon: Crown, active: true },
  { name: "Partner", rate: "50%", need: "100 referrals", icon: Crown, active: false },
];

const PAYOUTS = [
  { date: "Aug 1, 2026", amount: "$212.00", status: "Paid", method: "USDC" },
  { date: "Jul 1, 2026", amount: "$186.40", status: "Paid", method: "USDC" },
  { date: "Jun 1, 2026", amount: "$154.90", status: "Paid", method: "BTC" },
  { date: "May 1, 2026", amount: "$121.20", status: "Paid", method: "USDC" },
];

export function AffiliateView({ user }: { user: StudioUser }) {
  const [copied, setCopied] = useState(false);
  const link = `https://minsuro.app/r/${user.id.slice(0, 8)}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pt-10 pb-16 sm:px-8">
      <header>
        <p className="text-[0.66rem] font-bold tracking-[0.28em] uppercase text-mint">
          Earn with minsuro
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
          Affiliate{" "}
          <span className="font-serif italic text-solar-gradient">program</span>
        </h1>
        <p className="mt-2 max-w-lg text-[0.86rem] leading-relaxed text-frost-faint">
          Earn 30% recurring commission on every creator you bring in — paid
          out in crypto, every month, forever.
        </p>
      </header>

      {/* Stats */}
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="relative overflow-hidden rounded-2xl border border-line/70 bg-ink-card/60 p-5"
          >
            <div className="pointer-events-none absolute -top-10 -right-10 size-24 rounded-full bg-mint/10 blur-2xl" />
            <s.icon className="size-4.5 text-mint" />
            <p className="mt-3 text-2xl font-semibold tracking-[-0.02em]">
              {s.value}
            </p>
            <p className="mt-0.5 text-[0.7rem] tracking-[0.1em] uppercase text-frost-faint">
              {s.label}
            </p>
            <p className="mt-1.5 text-[0.72rem] font-medium text-mint">
              {s.delta}
            </p>
          </div>
        ))}
      </div>

      {/* Referral link */}
      <div className="relative mt-6 overflow-hidden rounded-3xl border border-mint/25 bg-gradient-to-r from-mint/[0.08] via-ink-card to-ink-card p-6 sm:p-7">
        <div className="pointer-events-none absolute -top-16 -left-10 size-44 animate-aurora rounded-full bg-mint/15 blur-3xl" />
        <p className="flex items-center gap-2 text-[0.66rem] font-bold tracking-[0.22em] uppercase text-mint">
          <Link2 className="size-3.5" />
          Your referral link
        </p>
        <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
          <code className="flex h-12 flex-1 items-center truncate rounded-xl border border-line bg-ink-soft/80 px-4 font-mono text-[0.82rem] text-frost-dim">
            {link}
          </code>
          <button
            onClick={copy}
            className={cn(
              "flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl px-6 text-[0.82rem] font-bold transition-all",
              copied
                ? "bg-mint text-ink"
                : "bg-solar text-on-solar hover:shadow-[0_10px_36px_-8px_rgba(255,212,38,0.65)]",
            )}
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? "Copied" : "Copy link"}
          </button>
        </div>
        <p className="mt-3 text-[0.74rem] text-frost-faint">
          Share it anywhere — YouTube descriptions, TikTok bios, Discord
          servers. Signups are locked to you for life.
        </p>
      </div>

      {/* Tiers */}
      <h2 className="mt-10 mb-4 text-[1.05rem] font-semibold tracking-[-0.02em]">
        Commission tiers
      </h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {TIERS.map((t) => (
          <div
            key={t.name}
            className={cn(
              "relative overflow-hidden rounded-2xl border p-5",
              t.active
                ? "border-solar/30 bg-ink-card"
                : "border-line/70 bg-ink-card/40 opacity-70",
            )}
          >
            {t.name === "Ambassador" && (
              <span className="absolute top-4 right-4 rounded-full border border-solar/30 bg-solar/10 px-2 py-0.5 text-[0.56rem] font-bold tracking-[0.12em] uppercase text-solar">
                Current
              </span>
            )}
            <t.icon className={cn("size-5", t.active ? "text-solar" : "text-frost-faint")} />
            <p className="mt-3 text-[0.95rem] font-semibold">{t.name}</p>
            <p className="mt-1 text-3xl font-semibold tracking-[-0.03em] text-solar-gradient inline-block">
              {t.rate}
            </p>
            <p className="mt-1 text-[0.72rem] text-frost-faint">
              recurring · unlocks at {t.need}
            </p>
          </div>
        ))}
      </div>

      {/* Progress to next tier */}
      <div className="mt-4 rounded-2xl border border-line/70 bg-ink-card/60 p-5">
        <div className="flex items-center justify-between text-[0.78rem]">
          <span className="font-semibold">Progress to Partner</span>
          <span className="font-mono text-frost-faint">47 / 100 referrals</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.06]">
          <div className="h-full w-[47%] rounded-full bg-gradient-to-r from-mint via-solar to-solar-soft" />
        </div>
      </div>

      {/* Payout history */}
      <h2 className="mt-10 mb-4 text-[1.05rem] font-semibold tracking-[-0.02em]">
        Payout history
      </h2>
      <div className="overflow-hidden rounded-2xl border border-line/70">
        {PAYOUTS.map((p, i) => (
          <div
            key={p.date}
            className={cn(
              "flex items-center gap-4 px-5 py-4 text-[0.82rem]",
              i !== PAYOUTS.length - 1 && "border-b border-line/50",
              "bg-ink-card/50",
            )}
          >
            <span className="grid size-9 place-items-center rounded-xl border border-mint/25 bg-mint/8">
              <Wallet className="size-4 text-mint" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{p.amount}</p>
              <p className="text-[0.7rem] text-frost-faint">{p.date}</p>
            </div>
            <span className="font-mono text-[0.7rem] text-frost-faint">
              {p.method}
            </span>
            <span className="rounded-full border border-mint/25 bg-mint/10 px-2.5 py-1 text-[0.6rem] font-bold tracking-[0.12em] uppercase text-mint">
              {p.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
