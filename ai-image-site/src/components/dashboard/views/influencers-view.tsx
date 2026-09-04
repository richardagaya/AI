"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useAtom } from "jotai";
import { firebaseAuth } from "@/lib/firebase";
import { apiUrl } from "@/lib/site";
import { selectedInfluencerIdAtom } from "@/lib/store";
import type { StudioInfluencer } from "@/lib/influencers";
import type { DashboardView } from "../types";
import { FaceThumb } from "../face-thumb";

export function InfluencersView({
  onNavigate,
}: {
  onNavigate: (v: DashboardView) => void;
}) {
  const [selected, setSelected] = useAtom(selectedInfluencerIdAtom);
  const [list, setList] = useState<StudioInfluencer[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await firebaseAuth.currentUser?.getIdToken();
        const res = await fetch(apiUrl("/api/influencers"), {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = (await res.json().catch(() => ({}))) as {
          influencers?: StudioInfluencer[];
          error?: string;
        };
        if (!res.ok) throw new Error(data.error || "Could not load influencers");
        if (!cancelled) setList(data.influencers ?? []);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not load influencers");
          setList([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function open(id: string) {
    setSelected(id);
    onNavigate("influencer");
  }

  async function remove(person: StudioInfluencer) {
    if (deletingId) return;
    setDeletingId(person.id);
    setError(null);
    try {
      const token = await firebaseAuth.currentUser?.getIdToken();
      const res = await fetch(apiUrl(`/api/influencers/${person.id}`), {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Could not delete influencer");
      setList((prev) => (prev ?? []).filter((p) => p.id !== person.id));
      if (selected === person.id) setSelected(null);
      setConfirmId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete influencer");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pt-10 pb-16 sm:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.66rem] font-bold tracking-[0.28em] uppercase text-nova-soft">
            Synthetic talent
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
            Your{" "}
            <span className="font-serif italic text-solar-gradient">
              AI influencers
            </span>
          </h1>
          <p className="mt-2 max-w-md text-[0.86rem] text-frost-faint">
            Upload a photo, then prompt whatever scene you want.
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

      {error && (
        <p className="mt-8 rounded-2xl border border-red-400/25 bg-red-400/10 px-4 py-3 text-[0.82rem] text-red-300">
          {error}
        </p>
      )}

      {list === null && (
        <p className="mt-16 text-center text-[0.84rem] text-frost-faint">
          Loading roster…
        </p>
      )}

      {list && list.length === 0 && !error && (
        <div className="mt-16 grid place-items-center rounded-3xl border border-dashed border-line/80 bg-ink-card/30 px-6 py-20 text-center">
          <p className="text-[0.95rem] font-medium">No talent yet</p>
          <p className="mt-1.5 max-w-sm text-[0.84rem] text-frost-faint">
            Upload a photo of the person to add them to your roster.
          </p>
          <button
            onClick={() => onNavigate("create-influencer")}
            className="mt-6 cursor-pointer rounded-full border border-solar/40 bg-solar/10 px-5 py-2 text-[0.8rem] font-semibold text-solar"
          >
            Cast the first one
          </button>
        </div>
      )}

      {list && list.length > 0 && (
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((person) => (
            <li key={person.id} className="relative">
              <button
                onClick={() => open(person.id)}
                className="group w-full cursor-pointer overflow-hidden rounded-3xl border border-line/70 bg-ink-card/60 text-left transition-colors hover:border-solar/40"
              >
                <FaceThumb
                  influencerId={person.id}
                  index={0}
                  photo={person.photos[0] ?? { url: null, path: null }}
                  alt={person.name}
                  className="aspect-2/3 w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
                <div className="px-4 py-3.5">
                  <p className="text-[0.95rem] font-semibold tracking-[-0.02em]">
                    {person.name}
                  </p>
                  <p className="mt-0.5 text-[0.72rem] text-frost-faint">
                    {person.photos.length}{" "}
                    {person.photos.length === 1 ? "reference" : "references"}
                  </p>
                </div>
              </button>

              {confirmId === person.id ? (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-3xl bg-ink/88 p-4 text-center backdrop-blur-md">
                  <p className="text-[0.92rem] font-semibold">
                    Delete {person.name}?
                  </p>
                  <p className="mt-1 text-[0.74rem] text-frost-faint">
                    This cannot be undone.
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <button
                      type="button"
                      disabled={deletingId === person.id}
                      onClick={() => void remove(person)}
                      className="cursor-pointer rounded-full bg-red-500 px-4 py-1.5 text-[0.74rem] font-bold text-white disabled:opacity-50"
                    >
                      {deletingId === person.id ? "Deleting…" : "Delete"}
                    </button>
                    <button
                      type="button"
                      disabled={deletingId === person.id}
                      onClick={() => setConfirmId(null)}
                      className="cursor-pointer rounded-full border border-line/80 px-4 py-1.5 text-[0.74rem] font-semibold text-frost"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  aria-label={`Delete ${person.name}`}
                  onClick={() => setConfirmId(person.id)}
                  className="absolute top-2.5 right-2.5 z-10 cursor-pointer rounded-full border border-white/10 bg-ink/75 p-2 text-frost backdrop-blur-md transition-colors hover:border-red-400/40 hover:bg-red-500/20 hover:text-red-300"
                >
                  <Trash2 className="size-3.5" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
