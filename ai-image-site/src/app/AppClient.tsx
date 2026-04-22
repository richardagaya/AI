"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase";

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
    const msg = (data as { error?: string })?.error || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as T;
}

const TICKER = [
  "pikachu trainer · anime style",
  "gothic waifu · dark fantasy",
  "legendary pokemon fusion",
  "cyberpunk elf · neon rain",
  "mature scene · soft lighting",
  "dragonball-style warrior",
  "mermaid bioluminescent art",
  "fire-type gym leader",
  "eevee girl · pastel dream",
  "psychic-type aura · detailed",
];

/* Unsplash photos — replace with actual AI art once you have outputs */
const HERO_IMGS = [
  "https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/45b297f2-034e-488e-a00b-c9868d392a8d/anim=false,width=450,optimized=true/Z-Image_02287_.jpeg",
  "https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/3d5763a0-7193-4c3f-9b13-6828f4449067/anim=false,width=450,optimized=true/00001-2913226030.jpeg",
  "https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/881073c6-4fb1-4ce3-a4d9-c209f5c494ac/original=true,quality=90/aid7ce19926fce.jpeg",
];

const GALLERY_IMGS = [
  "https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/45b297f2-034e-488e-a00b-c9868d392a8d/anim=false,width=450,optimized=true/Z-Image_02287_.jpeg",
  "https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/3d5763a0-7193-4c3f-9b13-6828f4449067/anim=false,width=450,optimized=true/00001-2913226030.jpeg",
  "https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/881073c6-4fb1-4ce3-a4d9-c209f5c494ac/original=true,quality=90/aid7ce19926fce.jpeg",
  "https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/aad6f21f-f891-48dd-b811-b0ec7433426d/anim=false,width=450,optimized=true/ABFA5FB3CE9318D2CFE3ADA30ECCBB65AE15F48BE2477F941F4FD6975BF403E7.jpeg",
  "https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/2e30afa8-8dca-4d9d-aac6-ea184c04804e/anim=false,width=450,optimized=true/02186.jpeg",
];

const F = "var(--font-bebas), 'Bebas Neue', Impact, condensed, sans-serif";

const CYAN = "#00e5ff";
const DIM  = "rgba(232,232,232,0.4)";
const DIMMER = "rgba(232,232,232,0.22)";

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
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");

  const firebaseUserRef = useRef<FirebaseUser | null>(null);
  const authRef = useRef<HTMLDivElement>(null);

  const canGenerate = useMemo(() => {
    if (!user) return false;
    if (!prompt.trim()) return false;
    if (mode === "img2img" && !image) return false;
    return true;
  }, [user, prompt, mode, image]);

  async function getToken(): Promise<string | null> {
    return firebaseUserRef.current?.getIdToken() ?? null;
  }

  async function authHeaders(): Promise<HeadersInit> {
    const token = await getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async function refreshMe(fbUser?: FirebaseUser) {
    const target = fbUser ?? firebaseUserRef.current;
    if (!target) { setUser(null); return; }
    const token = await target.getIdToken();
    const res = await jsonFetch<{ user: User | null }>("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUser(res.user);
  }

  async function refreshJobs() {
    if (!firebaseUserRef.current) return;
    const headers = await authHeaders();
    const res = await jsonFetch<{ jobs: Job[] }>("/api/jobs", { headers });
    setJobs(res.jobs);
  }

  // Mirror Firebase auth state into local React state
  useEffect(() => {
    const unsub = onAuthStateChanged(firebaseAuth, async (fbUser) => {
      firebaseUserRef.current = fbUser;
      if (fbUser) {
        await refreshMe(fbUser).catch(() => {});
      } else {
        setUser(null);
        setJobs([]);
      }
    });
    return unsub;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!user) return;
    refreshJobs().catch(() => {});
    const t = setInterval(() => {
      refreshJobs().catch(() => {});
      refreshMe().catch(() => {});
    }, 2500);
    return () => clearInterval(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  async function onSignup() {
    setError(null); setBusy(true);
    try {
      const cred = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      firebaseUserRef.current = cred.user;
      await refreshMe(cred.user);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Signup failed";
      setError(msg.replace("Firebase: ", "").replace(/ \(auth\/.*\)\.?$/, ""));
    } finally { setBusy(false); }
  }

  async function onLogin() {
    setError(null); setBusy(true);
    try {
      const cred = await signInWithEmailAndPassword(firebaseAuth, email, password);
      firebaseUserRef.current = cred.user;
      await refreshMe(cred.user);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Login failed";
      setError(msg.replace("Firebase: ", "").replace(/ \(auth\/.*\)\.?$/, ""));
    } finally { setBusy(false); }
  }

  async function onLogout() {
    setError(null); setBusy(true);
    try {
      await signOut(firebaseAuth);
      setUser(null); setJobs([]);
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Logout failed"); }
    finally { setBusy(false); }
  }

  async function onTopUp() {
    setError(null); setBusy(true);
    try {
      const headers = await authHeaders();
      const res = await jsonFetch<{ hostedUrl: string }>("/api/credits/checkout", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ credits: 100 }),
      });
      window.location.href = res.hostedUrl;
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Top-up failed"); }
    finally { setBusy(false); }
  }

  async function onGenerate() {
    if (!canGenerate) return;
    setError(null); setBusy(true);
    try {
      const headers = await authHeaders();
      const fd = new FormData();
      fd.set("prompt", prompt);
      fd.set("negativePrompt", negativePrompt);
      fd.set("mode", mode);
      fd.set("model", model);
      if (image) fd.set("image", image);
      await jsonFetch("/api/generate", { method: "POST", headers, body: fd });
      setPrompt(""); setNegativePrompt(""); setImage(null);
      await refreshJobs();
      await refreshMe();
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Generation failed"); }
    finally { setBusy(false); }
  }

  const jobStatusColor = (s: string) =>
    s === "succeeded" ? "#00e87a" : s === "failed" ? "#ff3300" : "#ffb700";

  /* ─────────────────────── DASHBOARD ─────────────────────── */
  if (user) {
    return (
      <div style={{ minHeight: "100vh", background: "#020202", color: "#e8e8e8" }}>
        <header style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 28px", borderBottom: "1px solid rgba(0,229,255,0.1)",
          position: "sticky", top: 0, zIndex: 40,
          background: "rgba(2,2,2,0.94)", backdropFilter: "blur(14px)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <span style={{ fontFamily: F, fontSize: "2rem", lineHeight: 1, color: CYAN }}>
              VOID.GEN
            </span>
            <div style={{
              padding: "5px 12px",
              background: "rgba(0,229,255,0.07)",
              border: "1px solid rgba(0,229,255,0.18)",
              borderRadius: "4px", fontSize: "0.78rem",
            }}>
              <span style={{ color: DIMMER }}>credits </span>
              <span style={{ color: CYAN, fontWeight: 700 }}>{user.creditBalance}</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <span style={{ fontSize: "0.78rem", color: DIMMER }}>{user.email}</span>
            <button
              disabled={busy}
              onClick={onTopUp}
              style={{
                padding: "8px 18px", border: "none", borderRadius: "5px",
                background: CYAN, color: "#000",
                fontWeight: 700, fontSize: "0.72rem",
                letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer",
              }}
            >
              + BUY CREDITS
            </button>
            <button className="btn-ghost" disabled={busy} onClick={onLogout}
              style={{ padding: "8px 16px", fontSize: "0.72rem", letterSpacing: "0.06em" }}>
              Logout
            </button>
          </div>
        </header>

        {error && (
          <div style={{
            margin: "20px 28px 0", padding: "12px 16px",
            background: "rgba(255,51,0,0.07)",
            border: "1px solid rgba(255,51,0,0.25)",
            borderRadius: "6px", color: "#ff6644", fontSize: "0.85rem",
          }}>
            {error}
          </div>
        )}

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: "20px", padding: "24px 28px",
          maxWidth: "1200px", margin: "0 auto",
        }}>
          <section style={{
            background: "#0a0a0a",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "10px", padding: "28px",
          }}>
            <h2 style={{
              fontFamily: F, fontSize: "1.9rem", margin: "0 0 24px",
              letterSpacing: "0.04em", color: CYAN,
            }}>
              GENERATE
            </h2>

            <div style={{ display: "grid", gap: "14px" }}>
              <label style={{ display: "grid", gap: "5px" }}>
                <FieldLabel>Prompt</FieldLabel>
                <textarea
                  className="vfield"
                  style={{ minHeight: "96px", padding: "10px 14px", resize: "vertical", lineHeight: 1.6 }}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="pikachu trainer girl, anime style, soft lighting, ultra detailed..."
                />
              </label>

              <label style={{ display: "grid", gap: "5px" }}>
                <FieldLabel>Negative prompt</FieldLabel>
                <input
                  className="vfield"
                  style={{ height: "42px", padding: "0 14px" }}
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  placeholder="blurry, deformed, low quality..."
                />
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <label style={{ display: "grid", gap: "5px" }}>
                  <FieldLabel>Mode</FieldLabel>
                  <select
                    className="vfield"
                    style={{ height: "42px", padding: "0 12px" }}
                    value={mode}
                    onChange={(e) => setMode(e.target.value as "text2img" | "img2img")}
                  >
                    <option value="text2img">Text → Image (1 cr)</option>
                    <option value="img2img">Image → Image (2 cr)</option>
                  </select>
                </label>
                <label style={{ display: "grid", gap: "5px" }}>
                  <FieldLabel>Model</FieldLabel>
                  <input
                    className="vfield"
                    style={{ height: "42px", padding: "0 14px" }}
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="default"
                  />
                </label>
              </div>

              {mode === "img2img" && (
                <label style={{ display: "grid", gap: "5px" }}>
                  <FieldLabel>Input image</FieldLabel>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => setImage(e.target.files?.[0] ?? null)}
                    style={{ color: DIM, fontSize: "0.83rem" }}
                  />
                </label>
              )}

              <button
                className="btn-primary"
                disabled={busy || !canGenerate}
                onClick={onGenerate}
                style={{ height: "50px", fontSize: "0.9rem", marginTop: "4px" }}
              >
                {busy ? "GENERATING…" : "GENERATE →"}
              </button>
            </div>
          </section>

          <section style={{
            background: "#0a0a0a",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "10px", padding: "28px",
            overflowY: "auto", maxHeight: "720px",
          }}>
            <h2 style={{
              fontFamily: F, fontSize: "1.9rem", margin: "0 0 24px",
              letterSpacing: "0.04em", color: "#e8e8e8",
            }}>
              RECENT JOBS
            </h2>

            {jobs.length === 0 ? (
              <p style={{ color: DIMMER, fontSize: "0.85rem", textAlign: "center", paddingTop: "40px" }}>
                nothing here yet — start generating
              </p>
            ) : (
              <div style={{ display: "grid", gap: "14px" }}>
                {jobs.map((j) => (
                  <div key={j.id} style={{
                    background: "#070707",
                    border: "1px solid rgba(255,255,255,0.05)",
                    borderRadius: "8px", padding: "14px 16px", overflow: "hidden",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "5px" }}>
                          <span style={{
                            fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em",
                            textTransform: "uppercase", color: jobStatusColor(j.status),
                          }}>
                            {j.status}
                          </span>
                          <span style={{ color: DIMMER, fontSize: "0.68rem" }}>·</span>
                          <span style={{ fontSize: "0.68rem", color: DIM }}>
                            {j.mode} · {j.costCredits} cr
                          </span>
                        </div>
                        <p style={{
                          margin: 0, fontSize: "0.78rem", color: DIM,
                          overflow: "hidden", display: "-webkit-box",
                          WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                        }}>
                          {j.prompt}
                        </p>
                      </div>
                      <span style={{ fontSize: "0.62rem", color: DIMMER, whiteSpace: "nowrap", flexShrink: 0 }}>
                        {new Date(j.createdAt).toLocaleTimeString()}
                      </span>
                    </div>

                    {j.status === "failed" && j.error && (
                      <div style={{
                        marginTop: "10px", padding: "8px 12px",
                        background: "rgba(255,51,0,0.06)",
                        borderRadius: "5px", fontSize: "0.75rem", color: "#ff6644",
                      }}>
                        {j.error}
                      </div>
                    )}

                    {j.status === "succeeded" && (
                      <div style={{ marginTop: "12px" }}>
                        <img
                          src={`/api/jobs/${j.id}/image`}
                          alt="Generated"
                          style={{
                            width: "100%", borderRadius: "6px",
                            border: "1px solid rgba(255,255,255,0.06)", display: "block",
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    );
  }

  /* ─────────────────────── LANDING PAGE ─────────────────────── */
  return (
    <div style={{ minHeight: "100vh", background: "#020202", color: "#e8e8e8" }}>

      {/* ── NAV ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 36px", height: "60px",
        background: "rgba(2,2,2,0.9)", backdropFilter: "blur(18px)",
        borderBottom: "1px solid rgba(0,229,255,0.08)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontFamily: F, fontSize: "1.8rem", lineHeight: 1, color: CYAN, letterSpacing: "0.04em" }}>
            VOID.GEN
          </span>
          <span style={{
            fontSize: "0.58rem", fontWeight: 800, letterSpacing: "0.14em",
            padding: "2px 6px", border: "1px solid rgba(0,229,255,0.35)",
            color: "rgba(0,229,255,0.65)", borderRadius: "2px", lineHeight: 1.6,
          }}>
            18+
          </span>
        </div>
        <button
          className="nav-btn"
          onClick={() => authRef.current?.scrollIntoView({ behavior: "smooth" })}
        >
          SIGN IN
        </button>
      </nav>

      {/* ── HERO ── */}
      <section style={{ paddingTop: "60px", position: "relative", overflow: "hidden" }}>
        <div className="dot-grid" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
        <div className="scanlines" />

        {/* horizontal rule lines — HUD feel */}
        <div style={{
          position: "absolute", top: "60px", left: 0, right: 0,
          height: "1px", background: "rgba(0,229,255,0.06)", pointerEvents: "none",
        }} />

        <div className="hero-grid" style={{ position: "relative", zIndex: 2 }}>

          {/* LEFT — copy */}
          <div style={{ padding: "80px 40px 80px 48px", display: "flex", flexDirection: "column", justifyContent: "center" }}>

            {/* eyebrow */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "10px",
              marginBottom: "36px",
              fontSize: "0.63rem", letterSpacing: "0.22em", fontWeight: 700,
              color: "rgba(0,229,255,0.65)",
            }}>
              <span style={{ display: "block", width: "28px", height: "1px", background: "rgba(0,229,255,0.45)" }} />
              ADULT AI ART GENERATOR
              <span style={{ display: "block", width: "28px", height: "1px", background: "rgba(0,229,255,0.45)" }} />
            </div>

            <h1 style={{ margin: "0 0 28px", lineHeight: 0.88 }}>
              <span style={{
                display: "block", fontFamily: F,
                fontSize: "clamp(4.5rem, 9vw, 8.5rem)",
                color: "#e8e8e8", letterSpacing: "-0.01em",
              }}>
                MAKE ART
              </span>
              <span style={{
                display: "block", fontFamily: F,
                fontSize: "clamp(4.5rem, 9vw, 8.5rem)",
                color: CYAN, letterSpacing: "-0.01em",
              }}>
                WITHOUT
              </span>
              <span style={{
                display: "block", fontFamily: F,
                fontSize: "clamp(4.5rem, 9vw, 8.5rem)",
                color: "#e8e8e8", letterSpacing: "-0.01em",
              }}>
                LIMITS
              </span>
            </h1>

            <p style={{
              margin: "0 0 44px", fontSize: "1rem", lineHeight: 1.7,
              color: DIM, maxWidth: "420px",
            }}>
              Anime, fantasy, hentai, NSFW — describe it, generate it.
              Results in ~30 seconds. No content filters. No moderation queue.
            </p>

            <div style={{ display: "flex", gap: "18px", alignItems: "center", flexWrap: "wrap" }}>
              <button
                className="btn-primary"
                onClick={() => authRef.current?.scrollIntoView({ behavior: "smooth" })}
                style={{ padding: "15px 38px", fontSize: "0.88rem" }}
              >
                START GENERATING →
              </button>
              <span style={{ fontSize: "0.72rem", color: DIMMER, letterSpacing: "0.04em" }}>
                1 credit = 1 image&nbsp;·&nbsp;crypto only
              </span>
            </div>

            {/* stat pills */}
            <div style={{ display: "flex", gap: "24px", marginTop: "52px" }}>
              {[
                { value: "~30s", label: "per image" },
                { value: "100%", label: "uncensored" },
                { value: "TEXT TO IMG", label: "input modes" },
              ].map((s) => (
                <div key={s.label}>
                  <div style={{ fontFamily: F, fontSize: "1.6rem", color: CYAN, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: "0.65rem", letterSpacing: "0.12em", color: DIMMER, textTransform: "uppercase", marginTop: "3px" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — image mosaic */}
          <div className="hero-img-col" style={{ padding: "80px 48px 80px 20px" }}>
            <div className="hero-mosaic">
              {/* main tall image — spans both rows */}
              <div className="img-card" style={{ gridRow: "1 / 3", borderRadius: "6px" }}>
                <img src={HERO_IMGS[0]} alt="AI generated art" style={{ borderRadius: "6px" }} />
              </div>
              {/* two stacked images */}
              <div className="img-card" style={{ borderRadius: "6px" }}>
                <img src={HERO_IMGS[1]} alt="AI generated art" style={{ borderRadius: "6px" }} />
              </div>
              <div className="img-card" style={{ borderRadius: "6px" }}>
                <img src={HERO_IMGS[2]} alt="AI generated art" style={{ borderRadius: "6px" }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <div style={{
        borderTop: "1px solid rgba(0,229,255,0.1)",
        borderBottom: "1px solid rgba(0,229,255,0.1)",
        padding: "12px 0", overflow: "hidden",
        background: "rgba(0,229,255,0.02)",
      }}>
        <div className="marquee-track">
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i} style={{
              fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.12em",
              color: "rgba(232,232,232,0.3)", whiteSpace: "nowrap",
              textTransform: "uppercase", marginRight: "52px",
            }}>
              <span style={{ color: CYAN, marginRight: "10px", opacity: 0.6 }}>◆</span>
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* ── GALLERY ── */}
      <section style={{ padding: "80px 0" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto 28px", padding: "0 36px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{ fontSize: "0.62rem", letterSpacing: "0.2em", fontWeight: 700, color: "rgba(0,229,255,0.55)", textTransform: "uppercase" }}>
              Sample outputs
            </span>
            <div style={{ flex: 1, height: "1px", background: "rgba(0,229,255,0.1)" }} />
          </div>
        </div>

        <div className="gallery-strip" style={{ padding: "0 36px" }}>
          {GALLERY_IMGS.map((src, i) => (
            <div key={i} className="img-card" style={{ height: "380px", borderRadius: "4px" }}>
              <img src={src} alt={`Sample output ${i + 1}`} />
            </div>
          ))}
        </div>

      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: "72px 36px", maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "52px" }}>
          <div style={{ height: "1px", background: "rgba(0,229,255,0.1)", width: "32px" }} />
          <h2 style={{
            fontFamily: F,
            fontSize: "clamp(2.2rem, 4.5vw, 4rem)",
            margin: 0, color: "#e8e8e8", letterSpacing: "0.02em",
          }}>
            WHAT YOU GET
          </h2>
          <div style={{ flex: 1, height: "1px", background: "rgba(0,229,255,0.1)" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
          {[
            {
              num: "01",
              title: "FAST",
              body: "~30 seconds per image. Jobs queue and run in parallel — submit five prompts, start getting results immediately.",
            },
            {
              num: "02",
              title: "NO FILTERS",
              body: "Explicit content, mature themes, any character. No keyword blocking, no shadow moderation, no vague policy strikes.",
            },
            {
              num: "03",
              title: "TWO MODES",
              body: "Text to image or image to image. Write a prompt from scratch or drop in a reference and transform it.",
            },
          ].map((f) => (
            <div key={f.title} className="fcard">
              <div style={{
                fontFamily: F, fontSize: "3.5rem", color: CYAN, lineHeight: 1,
                opacity: 0.25, marginBottom: "20px", letterSpacing: "-0.02em",
              }}>
                {f.num}
              </div>
              <h3 style={{
                fontFamily: F, fontSize: "2rem", margin: "0 0 14px",
                color: "#e8e8e8", letterSpacing: "0.04em",
              }}>
                {f.title}
              </h3>
              <p style={{ color: DIM, fontSize: "0.9rem", lineHeight: 1.72, margin: 0 }}>
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{
        padding: "72px 36px",
        borderTop: "1px solid rgba(255,255,255,0.04)",
        background: "rgba(0,229,255,0.012)",
      }}>
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "52px" }}>
            <div style={{ height: "1px", background: "rgba(0,229,255,0.1)", width: "32px" }} />
            <h2 style={{
              fontFamily: F,
              fontSize: "clamp(2rem, 4.5vw, 3.8rem)",
              margin: 0, color: "#e8e8e8", letterSpacing: "0.02em",
            }}>
              THREE STEPS
            </h2>
            <div style={{ flex: 1, height: "1px", background: "rgba(0,229,255,0.1)" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "2px" }}>
            {[
              { n: "01", label: "SIGN UP",     desc: "Email and password. No KYC, no ID check. Takes 10 seconds." },
              { n: "02", label: "GET CREDITS", desc: "Buy via Coinbase Commerce. Crypto only. 100 credits to get started." },
              { n: "03", label: "GENERATE",    desc: "Write your prompt, hit generate, watch it appear in ~30 seconds." },
            ].map((s) => (
              <div key={s.n} style={{
                padding: "28px 24px",
                borderLeft: "1px solid rgba(0,229,255,0.1)",
              }}>
                <div style={{
                  fontFamily: F, fontSize: "clamp(3rem, 6vw, 5rem)",
                  color: CYAN, lineHeight: 1, opacity: 0.2,
                  letterSpacing: "-0.02em", marginBottom: "12px",
                }}>
                  {s.n}
                </div>
                <h3 style={{
                  fontFamily: F, fontSize: "1.5rem",
                  margin: "0 0 10px", color: "#e8e8e8", letterSpacing: "0.05em",
                }}>
                  {s.label}
                </h3>
                <p style={{ color: DIM, fontSize: "0.85rem", lineHeight: 1.7, margin: 0 }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AUTH ── */}
      <section
        ref={authRef}
        id="signin"
        style={{ padding: "88px 28px", maxWidth: "440px", margin: "0 auto" }}
      >
        <h2 style={{
          fontFamily: F, fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
          textAlign: "center", margin: "0 0 8px", lineHeight: 1, color: "#e8e8e8",
        }}>
          {authTab === "login" ? "WELCOME BACK" : "JOIN THE VOID"}
        </h2>
        <p style={{ textAlign: "center", color: DIM, fontSize: "0.82rem", marginBottom: "36px" }}>
          {authTab === "login" ? "Sign in to start generating." : "Create an account — it takes 10 seconds."}
        </p>

        {error && (
          <div style={{
            marginBottom: "18px", padding: "12px 16px",
            background: "rgba(255,51,0,0.06)",
            border: "1px solid rgba(255,51,0,0.22)",
            borderRadius: "6px", color: "#ff6644", fontSize: "0.84rem",
          }}>
            {error}
          </div>
        )}

        <div style={{
          display: "flex", marginBottom: "26px",
          background: "#0a0a0a", borderRadius: "6px", padding: "3px",
          border: "1px solid rgba(255,255,255,0.06)",
        }}>
          {(["login", "signup"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setAuthTab(t)}
              className={authTab === t ? "tab-active" : "tab-inactive"}
              style={{
                flex: 1, padding: "10px", border: "none", borderRadius: "4px",
                cursor: "pointer", fontSize: "0.75rem", fontWeight: 700,
                letterSpacing: "0.1em", textTransform: "uppercase", transition: "all 0.18s",
                fontFamily: "inherit",
              }}
            >
              {t === "login" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gap: "13px" }}>
          <label style={{ display: "grid", gap: "5px" }}>
            <FieldLabel>Email</FieldLabel>
            <input
              className="vfield"
              style={{ height: "48px", padding: "0 16px" }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </label>

          <label style={{ display: "grid", gap: "5px" }}>
            <FieldLabel>Password</FieldLabel>
            <input
              className="vfield"
              style={{ height: "48px", padding: "0 16px" }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
            />
          </label>

          <button
            className="btn-primary"
            disabled={busy}
            onClick={authTab === "login" ? onLogin : onSignup}
            style={{ height: "52px", marginTop: "6px", fontSize: "0.9rem" }}
          >
            {busy ? "…" : authTab === "login" ? "ENTER →" : "CREATE ACCOUNT →"}
          </button>
        </div>

        <p style={{
          textAlign: "center", marginTop: "22px",
          fontSize: "0.68rem", color: DIMMER, lineHeight: 1.7,
        }}>
          18+ only. By continuing you confirm you are of legal age.<br />
          All generated characters are fictional.
        </p>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: "1px solid rgba(0,229,255,0.07)",
        padding: "32px 36px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: "12px",
      }}>
        <span style={{ fontFamily: F, fontSize: "1.4rem", color: CYAN, letterSpacing: "0.04em" }}>
          VOID.GEN
        </span>
        <p style={{ fontSize: "0.68rem", color: DIMMER, margin: 0 }}>
          Adult AI art platform · 18+ only · All characters are fictional · Crypto payments only
        </p>
      </footer>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      fontSize: "0.67rem", fontWeight: 700,
      letterSpacing: "0.14em", textTransform: "uppercase",
      color: "rgba(232,232,232,0.32)",
    }}>
      {children}
    </span>
  );
}
