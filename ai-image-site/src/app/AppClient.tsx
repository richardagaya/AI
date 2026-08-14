"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase";
import { AuthDialog, type AuthMode } from "@/components/auth/auth-dialog";
import { LandingPage } from "@/components/landing/landing-page";
import {
  Dashboard,
  type StudioJob,
  type StudioUser,
} from "@/components/dashboard/dashboard";

async function jsonFetch<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      (data as { error?: string })?.error || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as T;
}

function readableAuthError(e: unknown, fallback: string) {
  const msg = e instanceof Error ? e.message : fallback;
  return msg.replace("Firebase: ", "").replace(/ \(auth\/.*\)\.?$/, "");
}

export default function AppClient() {
  const [user, setUser] = useState<StudioUser | null>(null);
  const [jobs, setJobs] = useState<StudioJob[]>([]);

  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [mode, setMode] = useState<"text2img" | "img2img">("text2img");
  const [model, setModel] = useState("default");
  const [image, setImage] = useState<File | null>(null);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const firebaseUserRef = useRef<FirebaseUser | null>(null);

  const canGenerate = useMemo(() => {
    if (!user || !prompt.trim()) return false;
    if (mode === "img2img" && !image) return false;
    return true;
  }, [user, prompt, mode, image]);

  const authHeaders = useCallback(async (): Promise<HeadersInit> => {
    const token = await firebaseUserRef.current?.getIdToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const refreshMe = useCallback(async (fbUser?: FirebaseUser) => {
    const target = fbUser ?? firebaseUserRef.current;
    if (!target) {
      setUser(null);
      return;
    }
    const token = await target.getIdToken();
    const res = await jsonFetch<{ user: StudioUser | null }>("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUser(res.user);
  }, []);

  const refreshJobs = useCallback(async () => {
    if (!firebaseUserRef.current) return;
    const res = await jsonFetch<{ jobs: StudioJob[] }>("/api/jobs", {
      headers: await authHeaders(),
    });
    setJobs(res.jobs);
  }, [authHeaders]);

  useEffect(() => {
    return onAuthStateChanged(firebaseAuth, async (fbUser) => {
      firebaseUserRef.current = fbUser;
      if (fbUser) {
        setAuthOpen(false);
        await refreshMe(fbUser).catch(() => {});
      } else {
        setUser(null);
        setJobs([]);
      }
    });
  }, [refreshMe]);

  const userId = user?.id;
  useEffect(() => {
    if (!userId) return;
    refreshJobs().catch(() => {});
    const timer = setInterval(() => {
      refreshJobs().catch(() => {});
      refreshMe().catch(() => {});
    }, 2500);
    return () => clearInterval(timer);
  }, [userId, refreshJobs, refreshMe]);

  function openAuth(mode: AuthMode = "signup") {
    setError(null);
    setAuthMode(mode);
    setAuthOpen(true);
  }

  async function onAuthSubmit() {
    setError(null);
    setBusy(true);
    try {
      const cred =
        authMode === "login"
          ? await signInWithEmailAndPassword(firebaseAuth, email, password)
          : await createUserWithEmailAndPassword(firebaseAuth, email, password);
      firebaseUserRef.current = cred.user;
      await refreshMe(cred.user);
      setAuthOpen(false);
      setPassword("");
    } catch (e: unknown) {
      setError(
        readableAuthError(
          e,
          authMode === "login" ? "Sign in failed" : "Signup failed",
        ),
      );
    } finally {
      setBusy(false);
    }
  }

  async function onLogout() {
    setError(null);
    setBusy(true);
    try {
      await signOut(firebaseAuth);
      setUser(null);
      setJobs([]);
    } catch (e: unknown) {
      setError(readableAuthError(e, "Logout failed"));
    } finally {
      setBusy(false);
    }
  }

  async function onTopUp() {
    setError(null);
    setBusy(true);
    try {
      const headers = await authHeaders();
      const res = await jsonFetch<{ hostedUrl: string }>(
        "/api/credits/checkout",
        {
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify({ credits: 100 }),
        },
      );
      window.location.href = res.hostedUrl;
    } catch (e: unknown) {
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
      const form = new FormData();
      form.set("prompt", prompt);
      form.set("negativePrompt", negativePrompt);
      form.set("mode", mode);
      form.set("model", model);
      if (image) form.set("image", image);

      await jsonFetch("/api/generate", {
        method: "POST",
        headers: await authHeaders(),
        body: form,
      });

      setPrompt("");
      setNegativePrompt("");
      setImage(null);
      await refreshJobs();
      await refreshMe();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setBusy(false);
    }
  }

  if (user) {
    return (
      <Dashboard
        user={user}
        jobs={jobs}
        prompt={prompt}
        negativePrompt={negativePrompt}
        mode={mode}
        model={model}
        image={image}
        busy={busy}
        error={error}
        canGenerate={canGenerate}
        onPromptChange={setPrompt}
        onNegativePromptChange={setNegativePrompt}
        onModeChange={setMode}
        onModelChange={setModel}
        onImageChange={setImage}
        onGenerate={onGenerate}
        onTopUp={onTopUp}
        onLogout={onLogout}
      />
    );
  }

  return (
    <>
      <LandingPage onStart={() => openAuth("signup")} />
      <AuthDialog
        open={authOpen}
        mode={authMode}
        email={email}
        password={password}
        busy={busy}
        error={error}
        onModeChange={setAuthMode}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSubmit={onAuthSubmit}
        onClose={() => setAuthOpen(false)}
      />
    </>
  );
}
