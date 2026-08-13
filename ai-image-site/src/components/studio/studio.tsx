"use client";

import { AlertCircle, LogOut, Plus, Upload, Wand2 } from "lucide-react";
import { Logo, Snowflake } from "@/components/brand/snowflake";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import { cn } from "@/lib/utils";

export type StudioUser = { id: string; email: string; creditBalance: number };
export type StudioJob = {
  id: string;
  status: string;
  mode: string;
  model: string;
  prompt: string;
  costCredits: number;
  error: string | null;
  createdAt: string;
  outputImagePath: string | null;
};

const STATUS_STYLES: Record<string, string> = {
  succeeded: "text-emerald-400 bg-emerald-400/10 border-emerald-400/25",
  failed: "text-red-400 bg-red-400/10 border-red-400/25",
  running: "text-solar bg-solar/10 border-solar/25",
  queued: "text-frost-dim bg-white/5 border-line",
  pending: "text-frost-dim bg-white/5 border-line",
};

export function Studio({
  user,
  jobs,
  prompt,
  negativePrompt,
  mode,
  model,
  image,
  busy,
  error,
  canGenerate,
  onPromptChange,
  onNegativePromptChange,
  onModeChange,
  onModelChange,
  onImageChange,
  onGenerate,
  onTopUp,
  onLogout,
}: {
  user: StudioUser;
  jobs: StudioJob[];
  prompt: string;
  negativePrompt: string;
  mode: "text2img" | "img2img";
  model: string;
  image: File | null;
  busy: boolean;
  error: string | null;
  canGenerate: boolean;
  onPromptChange: (v: string) => void;
  onNegativePromptChange: (v: string) => void;
  onModeChange: (v: "text2img" | "img2img") => void;
  onModelChange: (v: string) => void;
  onImageChange: (f: File | null) => void;
  onGenerate: () => void;
  onTopUp: () => void;
  onLogout: () => void;
}) {
  return (
    <div className="min-h-dvh bg-ink">
      <header className="sticky top-0 z-50 border-b border-line/60 bg-ink/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-5 sm:px-8">
          <Logo />
          <span className="ml-1 hidden items-center gap-1.5 rounded-full border border-solar/25 bg-solar/8 px-3 py-1 font-mono text-[0.68rem] text-solar sm:inline-flex">
            <Snowflake className="size-3" strokeWidth={7} />
            {user.creditBalance} credits
          </span>

          <div className="ml-auto flex items-center gap-2">
            <span className="hidden max-w-40 truncate text-[0.78rem] text-frost-faint md:inline">
              {user.email}
            </span>
            <Button size="sm" disabled={busy} onClick={onTopUp}>
              <Plus className="size-3.5" />
              Buy credits
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={onLogout}
              aria-label="Log out"
            >
              <LogOut className="size-3.5" />
              <span className="hidden sm:inline">Log out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-5 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,26rem)_1fr]">
        <section className="h-fit rounded-3xl border border-line/70 bg-ink-card/60 p-6 sm:p-7 lg:sticky lg:top-24">
          <h1 className="text-xl font-semibold tracking-[-0.03em]">Compose</h1>
          <p className="mt-1.5 text-[0.82rem] text-frost-faint">
            {mode === "img2img" ? "2 credits per render" : "1 credit per render"}
          </p>

          {error && (
            <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-red-500/25 bg-red-500/8 p-3.5 text-[0.82rem] text-red-300">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="mt-6 flex flex-col gap-4">
            <label className="grid gap-2">
              <Label>Prompt</Label>
              <Textarea
                value={prompt}
                onChange={(e) => onPromptChange(e.target.value)}
                placeholder="frost sorceress, silver hair, falling snow, cinematic key light…"
              />
            </label>

            <label className="grid gap-2">
              <Label>Negative prompt</Label>
              <Input
                value={negativePrompt}
                onChange={(e) => onNegativePromptChange(e.target.value)}
                placeholder="blurry, deformed, low quality"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2">
                <Label>Mode</Label>
                <Select
                  value={mode}
                  onChange={(e) =>
                    onModeChange(e.target.value as "text2img" | "img2img")
                  }
                >
                  <option value="text2img">Text → Image · 1 cr</option>
                  <option value="img2img">Image → Image · 2 cr</option>
                </Select>
              </label>
              <label className="grid gap-2">
                <Label>Model</Label>
                <Input
                  value={model}
                  onChange={(e) => onModelChange(e.target.value)}
                  placeholder="default"
                />
              </label>
            </div>

            {mode === "img2img" && (
              <div className="grid gap-2">
                <Label>Reference image</Label>
                <div className="flex items-center gap-3 rounded-xl border border-dashed border-line bg-ink-soft/60 p-4 transition-colors hover:border-solar/40">
                  <Upload className="size-4 shrink-0 text-solar" />
                  <span className="min-w-0 flex-1 truncate text-[0.8rem] text-frost-dim">
                    {image?.name ?? "PNG, JPEG or WebP · up to 8 MB"}
                  </span>
                  <input
                    id="reference-upload"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => onImageChange(e.target.files?.[0] ?? null)}
                    className="sr-only"
                  />
                  <label
                    htmlFor="reference-upload"
                    className="cursor-pointer rounded-full border border-line px-3 py-1.5 text-[0.72rem] font-medium transition-colors hover:border-solar/50 hover:text-solar"
                  >
                    Choose
                  </label>
                </div>
              </div>
            )}

            <Button
              size="lg"
              disabled={busy || !canGenerate}
              onClick={onGenerate}
              className="mt-1 w-full"
            >
              <Wand2 className="size-4" />
              {busy ? "Generating…" : "Generate"}
            </Button>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-[-0.03em]">Your gallery</h2>
            <span className="font-mono text-[0.72rem] text-frost-faint">
              {jobs.length} {jobs.length === 1 ? "job" : "jobs"}
            </span>
          </div>

          {jobs.length === 0 ? (
            <div className="mt-5 grid place-items-center rounded-3xl border border-dashed border-line/80 bg-ink-card/30 px-6 py-24 text-center">
              <Snowflake className="size-9 animate-spin-slow text-solar/40" />
              <p className="mt-5 text-[0.95rem] font-medium">Nothing rendered yet</p>
              <p className="mt-1.5 max-w-xs text-[0.84rem] text-frost-faint">
                Write your first prompt on the left and it will appear here in about
                thirty seconds.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {jobs.map((job) => (
                <article
                  key={job.id}
                  className="group overflow-hidden rounded-3xl border border-line/70 bg-ink-card/60 transition-colors hover:border-solar/30"
                >
                  {job.status === "succeeded" ? (
                    // Served straight from the authenticated job route, so it skips
                    // the image optimizer.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/api/jobs/${job.id}/image`}
                      alt={job.prompt}
                      loading="lazy"
                      className="aspect-2/3 w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="relative grid aspect-2/3 w-full place-items-center overflow-hidden bg-ink-soft/70">
                      <Snowflake
                        className={cn(
                          "size-10 text-solar/30",
                          job.status !== "failed" && "animate-spin-slow",
                        )}
                      />
                      {job.status !== "failed" && (
                        <div className="absolute inset-x-0 bottom-0 h-px overflow-hidden">
                          <div className="h-full w-full animate-shimmer bg-gradient-to-r from-transparent via-solar to-transparent" />
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full border px-2 py-0.5 text-[0.58rem] font-semibold tracking-[0.12em] uppercase",
                          STATUS_STYLES[job.status] ?? STATUS_STYLES.pending,
                        )}
                      >
                        {job.status}
                      </span>
                      <span className="font-mono text-[0.62rem] text-frost-faint">
                        {job.mode} · {job.costCredits} cr
                      </span>
                      <span className="ml-auto font-mono text-[0.62rem] text-frost-faint">
                        {new Date(job.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <p className="mt-2.5 line-clamp-2 font-mono text-[0.72rem] leading-relaxed text-frost-dim">
                      {job.prompt}
                    </p>

                    {job.status === "failed" && job.error && (
                      <p className="mt-3 rounded-lg bg-red-500/8 p-2.5 text-[0.7rem] text-red-300">
                        {job.error}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
