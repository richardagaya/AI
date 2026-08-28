"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import {
  confirmPasswordReset,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
} from "firebase/auth";
import { Button } from "@/components/ui/button";
import { buttonStyles } from "@/components/ui/button-styles";
import { Input, Label } from "@/components/ui/field";
import { Logo } from "@/components/brand/snowflake";
import { LazyVideo } from "@/components/ui/lazy-video";
import { AUTH_BACKGROUND } from "@/lib/media";
import { firebaseAuth } from "@/lib/firebase";
import { readableAuthError } from "@/lib/authErrors";
import { SITE_URL, studioAuthHref, studioUrl } from "@/lib/site";

type Step = "request" | "sent" | "confirm" | "done";

export function ResetPasswordPage({
  oobCode,
  mode,
}: {
  oobCode: string | null;
  mode: string | null;
}) {

  const [step, setStep] = useState<Step>(() =>
    oobCode && (!mode || mode === "resetPassword") ? "confirm" : "request",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(Boolean(oobCode));

  useEffect(() => {
    if (!oobCode || (mode && mode !== "resetPassword")) {
      setVerifying(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const recovered = await verifyPasswordResetCode(firebaseAuth, oobCode);
        if (cancelled) return;
        setEmail(recovered);
        setStep("confirm");
      } catch (e: unknown) {
        if (cancelled) return;
        setError(
          readableAuthError(
            e,
            "This reset link is invalid or has expired. Request a new one.",
          ),
        );
        setStep("request");
      } finally {
        if (!cancelled) setVerifying(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [oobCode, mode]);

  async function onRequest(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const nextEmail = String(data.get("email") ?? "").trim();
    setEmail(nextEmail);
    setError(null);
    if (!nextEmail) {
      setError("Enter the email for your account.");
      return;
    }
    setBusy(true);
    try {
      await sendPasswordResetEmail(firebaseAuth, nextEmail, {
        url: studioUrl("login"),
      });
      setStep("sent");
    } catch (err: unknown) {
      setError(readableAuthError(err, "Could not send a reset email."));
    } finally {
      setBusy(false);
    }
  }

  async function onConfirm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!oobCode) return;
    const data = new FormData(e.currentTarget);
    const nextPassword = String(data.get("password") ?? "");
    setPassword(nextPassword);
    setError(null);
    if (nextPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setBusy(true);
    try {
      await confirmPasswordReset(firebaseAuth, oobCode, nextPassword);
      setStep("done");
    } catch (err: unknown) {
      setError(readableAuthError(err, "Could not update your password."));
    } finally {
      setBusy(false);
    }
  }

  const title =
    step === "confirm"
      ? "Choose a new password"
      : step === "sent"
        ? "Check your inbox"
        : step === "done"
          ? "Password updated"
          : "Reset your password";

  const subtitle =
    step === "confirm"
      ? email
        ? `New password for ${email}.`
        : "Pick a password at least 6 characters long."
      : step === "sent"
        ? `If an account exists for ${email}, a reset link is on its way.`
        : step === "done"
          ? "You can sign in with your new password."
          : "Enter the email you use to sign in. We'll send a reset link.";

  return (
    <div className="relative isolate flex min-h-dvh flex-col overflow-hidden bg-ink">
      <div className="grain" aria-hidden="true" />
      <header className="relative z-10 flex h-16 items-center justify-between px-5 sm:px-8 lg:h-18">
        <a href={SITE_URL} className="flex items-center gap-3">
          <Logo spin />
        </a>
        <a
          href={studioAuthHref("login")}
          className="rounded-full px-4 py-2 text-[0.82rem] text-frost-dim transition-colors hover:text-frost"
        >
          Sign in
        </a>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center p-4 sm:p-6">
        <div className="grid w-full max-w-4xl overflow-hidden rounded-[1.75rem] border border-line/80 bg-ink-card shadow-[0_60px_140px_-50px_rgba(0,0,0,0.9)] lg:grid-cols-2">
          <div className="relative hidden lg:block">
            <LazyVideo
              src={AUTH_BACKGROUND.src}
              poster={AUTH_BACKGROUND.poster}
              eager
              className="absolute inset-0 size-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-8">
              <p className="font-serif text-2xl leading-snug italic text-frost">
                “A new key. Same studio.”
              </p>
            </div>
          </div>

          <div className="p-7 sm:p-10">
            <h1 className="text-3xl font-semibold tracking-[-0.04em]">{title}</h1>
            <p className="mt-2 text-[0.88rem] text-frost-dim">{subtitle}</p>

            {error && (
              <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-red-500/25 bg-red-500/8 p-3.5 text-[0.82rem] text-red-300">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                {error}
              </div>
            )}

            {verifying && (
              <p className="mt-8 text-[0.88rem] text-frost-dim">Checking your reset link…</p>
            )}

            {!verifying && step === "request" && (
              <form className="mt-6 flex flex-col gap-4" onSubmit={onRequest}>
                <label className="grid gap-2">
                  <Label>Email</Label>
                  <Input
                    name="email"
                    type="email"
                    defaultValue={email}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </label>
                <Button type="submit" size="lg" disabled={busy} className="mt-2 w-full">
                  {busy ? "Sending…" : "Send reset link"}
                </Button>
              </form>
            )}

            {!verifying && step === "confirm" && (
              <form className="mt-6 flex flex-col gap-4" onSubmit={onConfirm}>
                <label className="grid gap-2">
                  <Label>New password</Label>
                  <Input
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    minLength={6}
                    autoComplete="new-password"
                    required
                  />
                </label>
                <Button type="submit" size="lg" disabled={busy} className="mt-2 w-full">
                  {busy ? "Saving…" : "Update password"}
                </Button>
              </form>
            )}

            {!verifying && step === "sent" && (
              <div className="mt-8 flex items-start gap-3 rounded-xl border border-solar/20 bg-solar/8 p-4 text-[0.88rem] text-frost">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-solar" />
                Follow the link in that email to choose a new password. It may take a
                minute to arrive.
              </div>
            )}

            {!verifying && step === "done" && (
              <a
                href={studioAuthHref("login")}
                className={buttonStyles({ size: "lg", className: "mt-8 w-full" })}
              >
                Sign in
              </a>
            )}

            {step !== "done" && (
              <p className="mt-6 text-center text-[0.78rem] text-frost-faint">
                Remembered it?{" "}
                <a
                  href={studioAuthHref("login")}
                  className="text-frost-dim underline underline-offset-4 hover:text-solar"
                >
                  Sign in
                </a>
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
