"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { Logo } from "@/components/brand/snowflake";
import { CINEMATIC } from "@/lib/media";
import { cn } from "@/lib/utils";

export type AuthMode = "login" | "signup";

export function AuthDialog({
  open,
  mode,
  email,
  password,
  busy,
  error,
  onModeChange,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onClose,
}: {
  open: boolean;
  mode: AuthMode;
  email: string;
  password: string;
  busy: boolean;
  error: string | null;
  onModeChange: (mode: AuthMode) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
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
              <video
                src={CINEMATIC.frostWoman.src}
                poster={CINEMATIC.frostWoman.poster}
                autoPlay
                muted
                loop
                playsInline
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
                  : "Email and password is all it takes. No ID, no KYC."}
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
                  onSubmit();
                }}
              >
                <label className="grid gap-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => onEmailChange(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </label>
                <label className="grid gap-2">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => onPasswordChange(e.target.value)}
                    placeholder="••••••••"
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

              <p className="mt-6 text-center text-[0.68rem] leading-relaxed text-frost-faint">
                18+ only. By continuing you confirm you are of legal age.
                <br />
                All generated characters are fictional.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
