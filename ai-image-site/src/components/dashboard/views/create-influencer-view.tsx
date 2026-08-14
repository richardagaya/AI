"use client";

import { useState } from "react";
import { Bot, Check, Dices, Mic, Palette, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DashboardView } from "../types";

const ARCHETYPES = [
  { id: "anime", label: "Anime Idol", desc: "Big eyes, bigger fandom" },
  { id: "fitness", label: "Fitness Coach", desc: "Gym content & programs" },
  { id: "goth", label: "Goth Muse", desc: "Dark fantasy aesthetic" },
  { id: "travel", label: "Travel Vlogger", desc: "Impossible destinations" },
  { id: "gamer", label: "Gamer", desc: "Streams, clips & memes" },
  { id: "fashion", label: "Fashion Icon", desc: "Runway & streetwear" },
];

const VIBES = ["Ethereal", "Edgy", "Cozy", "Luxurious", "Chaotic", "Mysterious"];
const VOICES = ["Soft & airy", "Deep & calm", "Energetic", "Sultry", "Robotic chic"];

const NAME_POOL = ["Aria Voss", "Nyra Kade", "Elian Frost", "Mika Sol", "Rin Takahara", "Vera Lunox"];

export function CreateInfluencerView({
  onNavigate,
}: {
  onNavigate: (v: DashboardView) => void;
}) {
  const [name, setName] = useState("");
  const [archetype, setArchetype] = useState("anime");
  const [vibes, setVibes] = useState<string[]>(["Ethereal"]);
  const [voice, setVoice] = useState(VOICES[0]);

  function toggleVibe(v: string) {
    setVibes((cur) =>
      cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v].slice(-3),
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-5 pt-10 pb-16 sm:px-8">
      <header className="text-center">
        <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-nova/30 bg-nova/10 px-3.5 py-1.5 text-[0.64rem] font-bold tracking-[0.22em] uppercase text-nova-soft">
          <Bot className="size-3.5" />
          Persona forge
        </p>
        <h1 className="mx-auto mt-4 max-w-xl text-4xl font-semibold tracking-[-0.035em] text-balance sm:text-5xl">
          Birth a{" "}
          <span className="font-serif italic text-solar-gradient">
            digital star
          </span>
        </h1>
        <p className="mx-auto mt-3 max-w-md text-[0.86rem] leading-relaxed text-frost-faint">
          Three decisions and we forge a consistent identity — face, voice and
          vibe — ready to post.
        </p>
      </header>

      <div className="mt-10 space-y-8">
        {/* Name */}
        <section className="rounded-3xl border border-line/70 bg-ink-card/60 p-6">
          <h2 className="flex items-center gap-2.5 text-[0.95rem] font-semibold">
            <span className="grid size-7 place-items-center rounded-lg bg-solar/10 font-mono text-[0.7rem] font-bold text-solar">1</span>
            Name your star
          </h2>
          <div className="mt-4 flex gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aria Voss"
              className="h-12 flex-1 rounded-xl border border-line bg-ink-soft/80 px-4 text-sm text-frost outline-none transition-all placeholder:text-frost-faint focus:border-solar/70 focus:ring-3 focus:ring-solar/12"
            />
            <button
              onClick={() =>
                setName(NAME_POOL[Math.floor(Math.random() * NAME_POOL.length)])
              }
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-ink-soft/60 px-4 text-[0.78rem] font-semibold text-frost-dim transition-all hover:border-nova/50 hover:text-nova-soft"
            >
              <Dices className="size-4" />
              Roll
            </button>
          </div>
        </section>

        {/* Archetype */}
        <section className="rounded-3xl border border-line/70 bg-ink-card/60 p-6">
          <h2 className="flex items-center gap-2.5 text-[0.95rem] font-semibold">
            <span className="grid size-7 place-items-center rounded-lg bg-solar/10 font-mono text-[0.7rem] font-bold text-solar">2</span>
            Pick an archetype
          </h2>
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {ARCHETYPES.map((a) => (
              <button
                key={a.id}
                onClick={() => setArchetype(a.id)}
                className={cn(
                  "flex cursor-pointer items-start justify-between rounded-2xl border p-4 text-left transition-all",
                  archetype === a.id
                    ? "border-solar/50 bg-solar/[0.07] shadow-[0_0_30px_-14px_rgba(255,212,38,0.5)]"
                    : "border-line/70 bg-ink-soft/40 hover:border-line hover:bg-ink-soft/70",
                )}
              >
                <span>
                  <span className="block text-[0.84rem] font-semibold">{a.label}</span>
                  <span className="mt-0.5 block text-[0.7rem] text-frost-faint">{a.desc}</span>
                </span>
                {archetype === a.id && (
                  <Check className="size-4 shrink-0 text-solar" />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Vibe + voice */}
        <section className="grid gap-5 rounded-3xl border border-line/70 bg-ink-card/60 p-6 sm:grid-cols-2">
          <div>
            <h2 className="flex items-center gap-2.5 text-[0.95rem] font-semibold">
              <span className="grid size-7 place-items-center rounded-lg bg-solar/10 font-mono text-[0.7rem] font-bold text-solar">3</span>
              <Palette className="size-4 text-frost-faint" />
              Vibe · up to 3
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {VIBES.map((v) => (
                <button
                  key={v}
                  onClick={() => toggleVibe(v)}
                  className={cn(
                    "cursor-pointer rounded-full border px-3.5 py-1.5 text-[0.74rem] font-semibold transition-all",
                    vibes.includes(v)
                      ? "border-nova/60 bg-nova/15 text-nova-soft"
                      : "border-line/80 bg-white/[0.02] text-frost-faint hover:text-frost-dim",
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h2 className="flex items-center gap-2.5 text-[0.95rem] font-semibold">
              <span className="grid size-7 place-items-center rounded-lg bg-solar/10 font-mono text-[0.7rem] font-bold text-solar">
                <Mic className="size-3.5" />
              </span>
              Voice
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {VOICES.map((v) => (
                <button
                  key={v}
                  onClick={() => setVoice(v)}
                  className={cn(
                    "cursor-pointer rounded-full border px-3.5 py-1.5 text-[0.74rem] font-semibold transition-all",
                    voice === v
                      ? "border-solar/60 bg-solar/10 text-solar"
                      : "border-line/80 bg-white/[0.02] text-frost-faint hover:text-frost-dim",
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Summary + launch */}
        <section className="relative overflow-hidden rounded-3xl border border-solar/25 bg-gradient-to-br from-solar/[0.08] via-ink-card to-nova/[0.08] p-6 sm:p-7">
          <div className="pointer-events-none absolute -top-14 -right-14 size-44 animate-aurora rounded-full bg-nova/20 blur-3xl" />
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <p className="text-[0.64rem] font-bold tracking-[0.22em] uppercase text-solar">
                Ready to forge
              </p>
              <p className="mt-2 text-lg font-semibold">
                {name || "Unnamed"} ·{" "}
                {ARCHETYPES.find((a) => a.id === archetype)?.label}
              </p>
              <p className="mt-1 text-[0.78rem] text-frost-faint">
                {vibes.join(" · ") || "No vibe selected"} · {voice}
              </p>
            </div>
            <button
              onClick={() => onNavigate("influencers")}
              className="flex cursor-pointer items-center gap-2 rounded-full bg-solar px-6 py-3 text-[0.84rem] font-bold text-on-solar transition-all hover:shadow-[0_10px_36px_-8px_rgba(255,212,38,0.65)]"
            >
              <Rocket className="size-4" />
              Forge persona · 25 cr
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
