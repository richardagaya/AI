"use client";

import { useEffect, useState } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
} from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase";
import { apiUrl } from "@/lib/site";
import {
  authResolvedAtom,
  busyAtom,
  errorAtom,
  jobsAtom,
  refreshJobsAtom,
  refreshMeAtom,
  userAtom,
} from "@/lib/store";
import { AuthDialog, type AuthMode } from "@/components/auth/auth-dialog";
import { StudioGate, StudioSplash } from "@/components/auth/studio-gate";
import { Dashboard } from "@/components/dashboard/dashboard";

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

function authErrorCode(e: unknown): string | null {
  if (typeof e === "object" && e !== null && "code" in e) {
    const code = (e as { code: unknown }).code;
    return typeof code === "string" ? code : null;
  }
  return null;
}

/** Firebase's default message is "Error" after the code is stripped. Map codes instead. */
function readableAuthError(e: unknown, fallback: string) {
  switch (authErrorCode(e)) {
    case "auth/email-already-in-use":
      return "That email already has an account. Sign in, or use Continue with Google if you signed up that way.";
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/missing-email":
      return "Enter an email address.";
    case "auth/missing-password":
      return "Enter a password.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/invalid-credential":
    case "auth/invalid-login-credentials":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Email or password is incorrect. If you created this account with Google, use Continue with Google.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/too-many-requests":
      return "Too many attempts. Wait a moment and try again.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    case "auth/operation-not-allowed":
      return "Email and password sign-up is turned off for this project.";
    case "auth/account-exists-with-different-credential":
      return "This email is already used with Google. Continue with Google instead.";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "";
    default:
      break;
  }
  const msg = e instanceof Error ? e.message : fallback;
  const cleaned = msg.replace("Firebase: ", "").replace(/ \(auth\/.*\)\.?$/, "");
  return cleaned && cleaned !== "Error" ? cleaned : fallback;
}

export default function AppClient({
  initialAuthMode = null,
  paymentReference = null,
}: {
  initialAuthMode?: AuthMode | null;
  paymentReference?: string | null;
}) {
  const user = useAtomValue(userAtom);
  const setUser = useSetAtom(userAtom);
  const setJobs = useSetAtom(jobsAtom);
  const [authResolved, setAuthResolved] = useAtom(authResolvedAtom);
  const [error, setError] = useAtom(errorAtom);
  const [busy, setBusy] = useAtom(busyAtom);
  const refreshMe = useSetAtom(refreshMeAtom);
  const refreshJobs = useSetAtom(refreshJobsAtom);

  // Auth dialog state stays local — nothing outside this component needs it.
  const [authOpen, setAuthOpen] = useState(initialAuthMode !== null);
  const [authMode, setAuthMode] = useState<AuthMode>(initialAuthMode ?? "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    return onAuthStateChanged(firebaseAuth, async (fbUser) => {
      if (fbUser) {
        try {
          await refreshMe();
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
  }, [refreshMe, setUser, setJobs, setError, setAuthResolved]);

  const userId = user?.id;

  useEffect(() => {
    if (!userId || !paymentReference) return;
    let cancelled = false;
    (async () => {
      try {
        const token = await firebaseAuth.currentUser?.getIdToken();
        await jsonFetch(apiUrl("/api/credits/verify"), {
          method: "POST",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
  }, [userId, paymentReference, refreshMe, setError]);

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

  async function onAuthSubmit(emailValue: string, passwordValue: string) {
    const trimmedEmail = emailValue.trim();
    setEmail(trimmedEmail);
    setPassword(passwordValue);
    setError(null);

    if (!trimmedEmail || !passwordValue) {
      setError("Enter an email and password.");
      return;
    }
    if (authMode === "signup" && passwordValue.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setBusy(true);
    try {
      if (authMode === "login") {
        await signInWithEmailAndPassword(firebaseAuth, trimmedEmail, passwordValue);
      } else {
        await createUserWithEmailAndPassword(
          firebaseAuth,
          trimmedEmail,
          passwordValue,
        );
      }
    } catch (e: unknown) {
      setError(
        readableAuthError(
          e,
          authMode === "login" ? "Sign in failed" : "Signup failed",
        ),
      );
      setBusy(false);
      return;
    }

    try {
      await refreshMe();
      setAuthOpen(false);
      setPassword("");
    } catch (e: unknown) {
      setError(
        readableAuthError(
          e,
          "Your account was created, but the studio could not load. Try signing in.",
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
      await signInWithPopup(firebaseAuth, new GoogleAuthProvider());
      await refreshMe();
      setAuthOpen(false);
    } catch (e: unknown) {
      const message = readableAuthError(e, "Google sign-in failed");
      if (message) setError(message);
    } finally {
      setBusy(false);
    }
  }

  if (!authResolved) return <StudioSplash />;

  if (user) {
    return <Dashboard />;
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
        onModeChange={(mode) => {
          setAuthMode(mode);
          setError(null);
        }}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSubmit={onAuthSubmit}
        onGoogle={onGoogleSignIn}
        onClose={() => setAuthOpen(false)}
      />
    </>
  );
}
