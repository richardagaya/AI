"use client";

import { useEffect, useMemo, useState } from "react";

type User = { id: string; email: string; creditBalance: number };
type Job = {
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

async function jsonFetch<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as any)?.error || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as T;
}

export default function AppClient() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [mode, setMode] = useState<"text2img" | "img2img">("text2img");
  const [model, setModel] = useState("default");
  const [image, setImage] = useState<File | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const canGenerate = useMemo(() => {
    if (!user) return false;
    if (!prompt.trim()) return false;
    if (mode === "img2img" && !image) return false;
    return true;
  }, [user, prompt, mode, image]);

  async function refreshMe() {
    const res = await jsonFetch<{ user: User | null }>("/api/auth/me");
    setUser(res.user);
  }

  async function refreshJobs() {
    if (!user) return;
    const res = await jsonFetch<{ jobs: Job[] }>("/api/jobs");
    setJobs(res.jobs);
  }

  useEffect(() => {
    refreshMe().catch(() => {});
  }, []);

  useEffect(() => {
    refreshJobs().catch(() => {});
    const t = setInterval(() => {
      refreshJobs().catch(() => {});
      refreshMe().catch(() => {});
    }, 2500);
    return () => clearInterval(t);
  }, [user?.id]);

  async function onSignup() {
    setError(null);
    setBusy(true);
    try {
      const res = await jsonFetch<{ user: User }>("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      setUser(res.user);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Signup failed");
    } finally {
      setBusy(false);
    }
  }

  async function onLogin() {
    setError(null);
    setBusy(true);
    try {
      const res = await jsonFetch<{ user: User }>("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      setUser(res.user);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  async function onLogout() {
    setError(null);
    setBusy(true);
    try {
      await jsonFetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setJobs([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Logout failed");
    } finally {
      setBusy(false);
    }
  }

  async function onTopUp() {
    setError(null);
    setBusy(true);
    try {
      const res = await jsonFetch<{ hostedUrl: string }>("/api/credits/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credits: 100 }),
      });
      window.location.href = res.hostedUrl;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Top-up failed");
    } finally {
      setBusy(false);
    }
  }

  async function onGenerate() {
    if (!canGenerate) return;
    setError(null);
    setBusy(true);
    try {
      const fd = new FormData();
      fd.set("prompt", prompt);
      fd.set("negativePrompt", negativePrompt);
      fd.set("mode", mode);
      fd.set("model", model);
      if (image) fd.set("image", image);

      await jsonFetch("/api/generate", { method: "POST", body: fd });
      setPrompt("");
      setNegativePrompt("");
      setImage(null);
      await refreshJobs();
      await refreshMe();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">AI Image Generator</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Text-to-image and image-to-image (photo stylization). Prompts requesting explicit
            content are blocked.
          </p>
        </header>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </div>
        ) : null}

        {!user ? (
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-lg font-medium">Sign in</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">Email</span>
                <input
                  className="h-10 rounded-lg border border-zinc-200 bg-white px-3 outline-none focus:ring-2 focus:ring-zinc-300 dark:border-zinc-800 dark:bg-black dark:focus:ring-zinc-700"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">Password</span>
                <input
                  className="h-10 rounded-lg border border-zinc-200 bg-white px-3 outline-none focus:ring-2 focus:ring-zinc-300 dark:border-zinc-800 dark:bg-black dark:focus:ring-zinc-700"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  autoComplete="current-password"
                />
              </label>
            </div>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button
                disabled={busy}
                onClick={onLogin}
                className="h-10 rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200"
              >
                Login
              </button>
              <button
                disabled={busy}
                onClick={onSignup}
                className="h-10 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-black dark:hover:bg-zinc-900"
              >
                Create account
              </button>
            </div>
          </section>
        ) : (
          <>
            <section className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm">
                <div className="font-medium">{user.email}</div>
                <div className="text-zinc-600 dark:text-zinc-400">
                  Credits: <span className="font-semibold">{user.creditBalance}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  disabled={busy}
                  onClick={onTopUp}
                  className="h-10 rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200"
                >
                  Buy 100 credits (crypto)
                </button>
                <button
                  disabled={busy}
                  onClick={onLogout}
                  className="h-10 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-black dark:hover:bg-zinc-900"
                >
                  Logout
                </button>
              </div>
            </section>

            <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <h2 className="text-lg font-medium">Generate</h2>
              <div className="mt-4 grid gap-3">
                <label className="grid gap-1 text-sm">
                  <span className="text-zinc-600 dark:text-zinc-400">Prompt</span>
                  <textarea
                    className="min-h-24 rounded-lg border border-zinc-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-300 dark:border-zinc-800 dark:bg-black dark:focus:ring-zinc-700"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="A cute cartoon character, pastel colors, soft lighting..."
                  />
                </label>

                <label className="grid gap-1 text-sm">
                  <span className="text-zinc-600 dark:text-zinc-400">Negative prompt</span>
                  <input
                    className="h-10 rounded-lg border border-zinc-200 bg-white px-3 outline-none focus:ring-2 focus:ring-zinc-300 dark:border-zinc-800 dark:bg-black dark:focus:ring-zinc-700"
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    placeholder="blurry, low quality..."
                  />
                </label>

                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="grid gap-1 text-sm">
                    <span className="text-zinc-600 dark:text-zinc-400">Mode</span>
                    <select
                      className="h-10 rounded-lg border border-zinc-200 bg-white px-3 outline-none focus:ring-2 focus:ring-zinc-300 dark:border-zinc-800 dark:bg-black dark:focus:ring-zinc-700"
                      value={mode}
                      onChange={(e) => setMode(e.target.value as any)}
                    >
                      <option value="text2img">Text to image (1 credit)</option>
                      <option value="img2img">Image to image (2 credits)</option>
                    </select>
                  </label>
                  <label className="grid gap-1 text-sm sm:col-span-2">
                    <span className="text-zinc-600 dark:text-zinc-400">Model (label)</span>
                    <input
                      className="h-10 rounded-lg border border-zinc-200 bg-white px-3 outline-none focus:ring-2 focus:ring-zinc-300 dark:border-zinc-800 dark:bg-black dark:focus:ring-zinc-700"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder="default"
                    />
                  </label>
                </div>

                {mode === "img2img" ? (
                  <label className="grid gap-1 text-sm">
                    <span className="text-zinc-600 dark:text-zinc-400">Input image</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(e) => setImage(e.target.files?.[0] ?? null)}
                    />
                  </label>
                ) : null}

                <div className="flex items-center gap-3">
                  <button
                    disabled={busy || !canGenerate}
                    onClick={onGenerate}
                    className="h-10 rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200"
                  >
                    Generate
                  </button>
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">
                    Run the worker with <code className="font-mono">npm run worker</code>
                  </span>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <h2 className="text-lg font-medium">Recent jobs</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {jobs.length === 0 ? (
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    No jobs yet.
                  </div>
                ) : null}
                {jobs.map((j) => (
                  <div
                    key={j.id}
                    className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-black"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium">
                          {j.status} • {j.mode} • {j.costCredits} credits
                        </div>
                        <div className="mt-1 line-clamp-2 text-xs text-zinc-600 dark:text-zinc-400">
                          {j.prompt}
                        </div>
                      </div>
                      <div className="text-xs text-zinc-500">
                        {new Date(j.createdAt).toLocaleString()}
                      </div>
                    </div>
                    {j.status === "failed" && j.error ? (
                      <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-800 dark:bg-red-950/40 dark:text-red-200">
                        {j.error}
                      </div>
                    ) : null}
                    {j.status === "succeeded" ? (
                      <div className="mt-3">
                        <img
                          src={`/api/jobs/${j.id}/image`}
                          alt="Generated"
                          className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800"
                        />
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

