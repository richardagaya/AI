"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase";
import { apiUrl } from "@/lib/site";
import { AuthDialog, type AuthMode } from "@/components/auth/auth-dialog";
import { StudioGate, StudioSplash } from "@/components/auth/studio-gate";
import {
  Dashboard,
  type StudioJob,
  type StudioUser,
} from "@/components/dashboard/dashboard";
import type { GenerateSettings } from "@/components/dashboard/types";

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

export default function AppClient({
  initialAuthMode = null,
  paymentReference = null,
}: {
  initialAuthMode?: AuthMode | null;
  paymentReference?: string | null;
}) {
  const [user, setUser] = useState<StudioUser | null>(null);
  const [jobs, setJobs] = useState<StudioJob[]>([]);

  /** False until Firebase has replayed any persisted session for this origin. */
  const [authResolved, setAuthResolved] = useState(false);

  const [authOpen, setAuthOpen] = useState(initialAuthMode !== null);
  const [authMode, setAuthMode] = useState<AuthMode>(initialAuthMode ?? "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [mode, setMode] = useState<"text2img" | "img2img">("text2img");
  const [image, setImage] = useState<File | null>(null);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const firebaseUserRef = useRef<FirebaseUser | null>(null);

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
    const res = await jsonFetch<{ user: StudioUser | null }>(
      apiUrl("/api/auth/me"),
      { headers: { Authorization: `Bearer ${token}` } },
    );
    setUser(
      res.user
        ? {
            ...res.user,
            displayName: res.user.displayName || target.displayName,
          }
        : null,
    );
  }, []);

  const refreshJobs = useCallback(async () => {
    if (!firebaseUserRef.current) return;
    const res = await jsonFetch<{ jobs: StudioJob[] }>(apiUrl("/api/jobs"), {
      headers: await authHeaders(),
    });
    setJobs(res.jobs);
  }, [authHeaders]);

  useEffect(() => {
    return onAuthStateChanged(firebaseAuth, async (fbUser) => {
      firebaseUserRef.current = fbUser;
      if (fbUser) {
        try {
          await refreshMe(fbUser);
          setAuthOpen(false);
        } catch (e: unknown) {
          setError(
            readableAuthError(
              e,
              "Signed in, but the studio could not load your account.",
            ),
          );
        }
      } else {
        setUser(null);
        setJobs([]);
      }
      setAuthResolved(true);
    });
  }, [refreshMe]);

  const userId = user?.id;

  useEffect(() => {
    if (!userId || !paymentReference) return;
    let cancelled = false;
    (async () => {
      try {
        await jsonFetch(apiUrl("/api/credits/verify"), {
          method: "POST",
          headers: {
            ...(await authHeaders()),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reference: paymentReference }),
        });
        if (!cancelled) await refreshMe();
      } catch (e: unknown) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not confirm payment");
        }
      } finally {
        if (!cancelled && typeof window !== "undefined") {
          const url = new URL(window.location.href);
          url.searchParams.delete("reference");
          url.searchParams.delete("trxref");
          window.history.replaceState({}, "", url.pathname + url.search);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, paymentReference, authHeaders, refreshMe]);

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

  async function onGoogleSignIn() {
    setError(null);
    setBusy(true);
    try {
      const cred = await signInWithPopup(
        firebaseAuth,
        new GoogleAuthProvider(),
      );
      firebaseUserRef.current = cred.user;
      await refreshMe(cred.user);
      setAuthOpen(false);
    } catch (e: unknown) {
      setError(readableAuthError(e, "Google sign-in failed"));
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
        apiUrl("/api/credits/checkout"),
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

  async function onGenerate(settings: GenerateSettings) {
    setError(null);
    setBusy(true);
    try {
      const form = new FormData();
      form.set("prompt", prompt);
      form.set("negativePrompt", negativePrompt);
      form.set("mode", mode);
      form.set("kind", settings.kind);
      form.set("model", settings.model);
      form.set("aspect", settings.aspect);
      if (settings.duration) form.set("duration", settings.duration);
      if (settings.camera) form.set("camera", settings.camera);
      if (settings.strength != null) form.set("strength", String(settings.strength));
      if (image) form.set("image", image);

      await jsonFetch(apiUrl("/api/generate"), {
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

  if (!authResolved) return <StudioSplash />;

  if (user) {
    return (
      <Dashboard
        user={user}
        jobs={jobs}
        prompt={prompt}
        negativePrompt={negativePrompt}
        mode={mode}
        image={image}
        busy={busy}
        error={error}
        onPromptChange={setPrompt}
        onNegativePromptChange={setNegativePrompt}
        onModeChange={setMode}
        onImageChange={setImage}
        onGenerate={onGenerate}
        onTopUp={onTopUp}
        onLogout={onLogout}
      />
    );
  }

  return (
    <>
      <StudioGate onStart={openAuth} />
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
        onGoogle={onGoogleSignIn}
        onClose={() => setAuthOpen(false)}
      />
    </>
  );
}
