"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { Logo } from "@/components/brand/snowflake";
import { LazyVideo } from "@/components/ui/lazy-video";
import { AUTH_BACKGROUND } from "@/lib/media";
import { studioResetHref } from "@/lib/site";
import { cn } from "@/lib/utils";

export type AuthMode = "login" | "signup";

export function AuthDialog({
  open,
  mode,
  email,
  password,
  name,
  busy,
  error,
  onModeChange,
  onEmailChange,
  onPasswordChange,
  onNameChange,
  onSubmit,
  onGoogle,
  onClose,
}: {
  open: boolean;
  mode: AuthMode;
  email: string;
  password: string;
  name: string;
  busy: boolean;
  error: string | null;
  onModeChange: (mode: AuthMode) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onSubmit: (email: string, password: string, name: string) => void;
  onGoogle: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink/80 backdrop-blur-md"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative grid w-full max-w-4xl overflow-hidden rounded-[1.75rem] border border-line/80 bg-ink-card shadow-[0_60px_140px_-50px_rgba(0,0,0,0.9)] lg:grid-cols-2"
          >
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
                  “Describe the impossible. Get it back in thirty seconds.”
                </p>
                <p className="mt-3 font-mono text-[0.66rem] tracking-[0.14em] uppercase text-frost-faint">
                  frost sorceress · minsuro-core
                </p>
              </div>
            </div>

            <div className="p-7 sm:p-10">
              <div className="flex items-start justify-between">
                <Logo />
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="grid size-9 place-items-center rounded-full border border-line text-frost-dim transition-colors hover:border-solar/40 hover:text-frost"
                >
                  <X className="size-4" />
                </button>
              </div>

              <h2 className="mt-8 text-3xl font-semibold tracking-[-0.04em]">
                {mode === "login" ? "Welcome back" : "Create your studio"}
              </h2>
              <p className="mt-2 text-[0.88rem] text-frost-dim">
                {mode === "login"
                  ? "Sign in to pick up where your queue left off."
                  : "A name, email and password. No ID, no KYC."}
              </p>

              <div className="mt-7 flex rounded-full border border-line/70 bg-ink-soft/60 p-1">
                {(["login", "signup"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => onModeChange(m)}
                    className={cn(
                      "flex-1 rounded-full py-2.5 text-[0.76rem] font-semibold transition-all duration-200",
                      mode === m
                        ? "bg-solar text-on-solar"
                        : "text-frost-dim hover:text-frost",
                    )}
                  >
                    {m === "login" ? "Sign in" : "Create account"}
                  </button>
                ))}
              </div>

              {error && (
                <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-red-500/25 bg-red-500/8 p-3.5 text-[0.82rem] text-red-300">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  {error}
                </div>
              )}

              <form
                className="mt-6 flex flex-col gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  // Read from the DOM so browser autofill is not missed by React state.
                  const data = new FormData(e.currentTarget);
                  const nextEmail = String(data.get("email") ?? "").trim();
                  const nextPassword = String(data.get("password") ?? "");
                  const nextName = String(data.get("name") ?? "").trim();
                  onEmailChange(nextEmail);
                  onPasswordChange(nextPassword);
                  onNameChange(nextName);
                  onSubmit(nextEmail, nextPassword, nextName);
                }}
              >
                {mode === "signup" && (
                  <label className="grid gap-2">
                    <Label>Name</Label>
                    <Input
                      name="name"
                      type="text"
                      value={name}
                      onChange={(e) => onNameChange(e.target.value)}
                      placeholder="Ada"
                      autoComplete="given-name"
                      maxLength={40}
                      required
                    />
                  </label>
                )}
                <label className="grid gap-2">
                  <Label>Email</Label>
                  <Input
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => onEmailChange(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </label>
                <label className="grid gap-2">
                  <div className="flex items-baseline justify-between gap-3">
                    <Label>Password</Label>
                    {mode === "login" && (
                      <a
                        href={studioResetHref()}
                        className="text-[0.68rem] font-medium text-frost-faint transition-colors hover:text-solar"
                      >
                        Forgot password?
                      </a>
                    )}
                  </div>
                  <Input
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => onPasswordChange(e.target.value)}
                    placeholder={mode === "signup" ? "At least 6 characters" : "••••••••"}
                    minLength={mode === "signup" ? 6 : undefined}
                    autoComplete={
                      mode === "login" ? "current-password" : "new-password"
                    }
                    required
                  />
                </label>

                <Button type="submit" size="lg" disabled={busy} className="mt-2 w-full">
                  {busy
                    ? "Working…"
                    : mode === "login"
                      ? "Enter the studio"
                      : "Create account"}
                </Button>
              </form>

              <div className="mt-5 flex items-center gap-3">
                <span className="h-px flex-1 bg-line/70" />
                <span className="text-[0.62rem] font-bold tracking-[0.18em] uppercase text-frost-faint">
                  or
                </span>
                <span className="h-px flex-1 bg-line/70" />
              </div>

              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={busy}
                onClick={onGoogle}
                className="mt-5 w-full"
              >
                <GoogleMark />
                Continue with Google
              </Button>

              <p className="mt-6 text-center text-[0.68rem] leading-relaxed text-frost-faint">
                All generated characters are fictional.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
