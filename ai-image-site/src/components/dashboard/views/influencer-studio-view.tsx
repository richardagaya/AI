"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAtomValue, useSetAtom } from "jotai";
import { firebaseAuth } from "@/lib/firebase";
import { apiUrl } from "@/lib/site";
import {
  jobsAtom,
  refreshJobsAtom,
  refreshMeAtom,
  selectedInfluencerIdAtom,
} from "@/lib/store";
import { LOOK_COST, type StudioInfluencer } from "@/lib/influencers";
import { Button } from "@/components/ui/button";
import { Label, Textarea } from "@/components/ui/field";
import { GalleryGrid } from "../gallery-grid";
import { FaceThumb } from "../face-thumb";
import type { DashboardView } from "../types";

export function InfluencerStudioView({
  onNavigate,
}: {
  onNavigate: (v: DashboardView) => void;
}) {
  const id = useAtomValue(selectedInfluencerIdAtom);
  const jobs = useAtomValue(jobsAtom);
  const refreshJobs = useSetAtom(refreshJobsAtom);
  const refreshMe = useSetAtom(refreshMeAtom);

  const [person, setPerson] = useState<StudioInfluencer | null>(null);
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const token = await firebaseAuth.currentUser?.getIdToken();
        const res = await fetch(apiUrl(`/api/influencers/${id}`), {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = (await res.json().catch(() => ({}))) as {
          influencer?: StudioInfluencer;
          error?: string;
        };
        if (!res.ok || !data.influencer) {
          throw new Error(data.error || "Could not load influencer");
        }
        if (!cancelled) setPerson(data.influencer);
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : "Could not load influencer");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const shots = jobs.filter((j) => j.influencerId === id);

  async function generate() {
    if (!id || busy) return;
    if (!prompt.trim()) {
      setError("Describe what you want to generate.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const token = await firebaseAuth.currentUser?.getIdToken();
      const res = await fetch(apiUrl(`/api/influencers/${id}/generate`), {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
        signal: AbortSignal.timeout(180_000),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Generation failed");
      await refreshJobs();
      await refreshMe();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setBusy(false);
    }
  }

  if (!id) {
    return (
      <div className="mx-auto max-w-lg px-5 pt-16 text-center">
        <p className="text-frost-faint">Pick an influencer from your roster.</p>
        <Button className="mt-6" onClick={() => onNavigate("influencers")}>
          Back to roster
        </Button>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-lg px-5 pt-16 text-center">
        <p className="text-red-300">{loadError}</p>
        <Button className="mt-6" onClick={() => onNavigate("influencers")}>
          Back to roster
        </Button>
      </div>
    );
  }

  if (!person) {
    return (
      <p className="px-5 pt-16 text-center text-[0.84rem] text-frost-faint">
        Loading…
      </p>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pt-8 pb-16 sm:px-8">
      <button
        onClick={() => onNavigate("influencers")}
        className="mb-6 inline-flex cursor-pointer items-center gap-1.5 text-[0.76rem] font-semibold text-frost-faint hover:text-frost"
      >
        <ArrowLeft className="size-3.5" />
        Roster
      </button>

      <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside>
          <div className="overflow-hidden rounded-3xl border border-line/70">
            <FaceThumb
              influencerId={person.id}
              index={0}
              photo={person.photos[0] ?? { url: null, path: null }}
              alt={person.name}
              className="aspect-2/3 w-full object-cover"
            />
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-[-0.03em]">
            {person.name}
          </h1>
          <p className="mt-1 text-[0.78rem] text-frost-faint">
            Same person. Your prompt, your scene.
          </p>
        </aside>

        <div>
          <div className="rounded-[26px] border border-line/70 bg-ink-card/70 p-5 sm:p-6">
            <label className="grid gap-2">
              <Label>Prompt</Label>
              <Textarea
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="standing next to a street light at night…"
              />
            </label>

            {error && (
              <p className="mt-4 rounded-xl border border-red-400/25 bg-red-400/10 px-3 py-2 text-[0.8rem] text-red-300">
                {error}
              </p>
            )}

            <Button
              className="mt-5"
              onClick={() => void generate()}
              disabled={busy || !prompt.trim()}
            >
              {busy && <Loader2 className="size-4 animate-spin" />}
              {busy ? "Generating…" : `Generate · ${LOOK_COST} credits`}
            </Button>
          </div>

          <div className="mt-10">
            <h2 className="mb-4 text-[1.05rem] font-semibold tracking-[-0.02em]">
              Looks
            </h2>
            <GalleryGrid
              jobs={shots}
              emptyTitle="No looks yet"
              emptyBody="Write a prompt, then generate one image."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
