"use client";

import { useEffect, useMemo, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useSetAtom } from "jotai";
import { firebaseAuth } from "@/lib/firebase";
import { apiUrl } from "@/lib/site";
import { selectedInfluencerIdAtom } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { PHOTO_SLOTS, type StudioInfluencer } from "@/lib/influencers";
import type { DashboardView } from "../types";
import { InfluencerExamples } from "../influencer-examples";

export function CreateInfluencerView({
  onNavigate,
}: {
  onNavigate: (v: DashboardView) => void;
}) {
  const setSelected = useSetAtom(selectedInfluencerIdAtom);
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const slot = PHOTO_SLOTS[0];

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Give them a name.");
      return;
    }
    if (!file) {
      setError("Upload a reference photo.");
      return;
    }
    setBusy(true);
    try {
      const token = await firebaseAuth.currentUser?.getIdToken();
      const form = new FormData();
      form.set("name", name.trim());
      form.append("photos", file);
      const res = await fetch(apiUrl("/api/influencers"), {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
      const data = (await res.json().catch(() => ({}))) as {
        influencer?: StudioInfluencer;
        error?: string;
      };
      if (!res.ok || !data.influencer) {
        throw new Error(data.error || "Could not create influencer");
      }
      setSelected(data.influencer.id);
      onNavigate("influencer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create influencer");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pt-10 pb-16 sm:px-8">
      <p className="text-[0.66rem] font-bold tracking-[0.28em] uppercase text-nova-soft">
        New talent
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
        Cast a{" "}
        <span className="font-serif italic text-solar-gradient">face</span>
      </h1>
      <p className="mt-2 text-[0.86rem] leading-relaxed text-frost-faint">
        One photo of the person. Then describe anything you want them in.
      </p>

      <form onSubmit={onSubmit} className="mt-8 grid max-w-md gap-6">
        <label className="grid gap-2">
          <Label>Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Nova"
            maxLength={48}
          />
        </label>

        <div>
          <Label>{slot.label}</Label>
          <p className="mt-1 mb-2 text-[0.75rem] text-frost-faint">{slot.hint}</p>
          {preview ? (
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-line/70">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="" className="size-full object-cover" />
              <button
                type="button"
                onClick={() => setFile(null)}
                className="absolute top-2 right-2 cursor-pointer rounded-full bg-ink/80 p-1 text-frost"
                aria-label="Remove photo"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ) : (
            <label className="grid aspect-[4/5] cursor-pointer place-items-center rounded-2xl border border-dashed border-line/80 bg-ink-card/40 text-frost-faint transition-colors hover:border-solar/40 hover:text-solar">
              <span className="grid place-items-center gap-1.5 px-3 text-center">
                <ImagePlus className="size-5" />
                <span className="text-[0.68rem] font-semibold">Upload</span>
              </span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const next = e.target.files?.[0];
                  if (
                    next &&
                    ["image/png", "image/jpeg", "image/webp"].includes(next.type)
                  ) {
                    setFile(next);
                  }
                  e.target.value = "";
                }}
              />
            </label>
          )}
        </div>

        {error && (
          <p className="rounded-xl border border-red-400/25 bg-red-400/10 px-3 py-2 text-[0.8rem] text-red-300">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={busy}>
            {busy && <Loader2 className="size-4 animate-spin" />}
            {busy ? "Saving…" : "Create influencer"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onNavigate("influencers")}
          >
            Cancel
          </Button>
        </div>
      </form>

      <InfluencerExamples />
    </div>
  );
}
