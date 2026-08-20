import { cn } from "@/lib/utils";

/**
 * Kept out of `button.tsx` so that server components can style anchors with
 * the button look — a client module's exports cannot be called on the server.
 */

export type ButtonVariant = "solar" | "outline" | "ghost" | "frost";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "relative inline-flex items-center justify-center gap-2 rounded-full font-semibold " +
  "whitespace-nowrap transition-all duration-200 outline-none cursor-pointer " +
  "focus-visible:ring-2 focus-visible:ring-solar/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink " +
  "disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none";

const variants: Record<ButtonVariant, string> = {
  solar:
    "bg-solar text-on-solar hover:not-disabled:shadow-[0_10px_40px_-8px_rgba(255,212,38,0.55)] " +
    "hover:not-disabled:-translate-y-0.5 active:not-disabled:translate-y-0",
  frost:
    "bg-frost text-ink hover:not-disabled:bg-white hover:not-disabled:-translate-y-0.5",
  outline:
    "border border-line bg-white/[0.02] text-frost backdrop-blur-sm " +
    "hover:not-disabled:border-solar/50 hover:not-disabled:bg-solar/[0.06]",
  ghost: "text-frost-dim hover:not-disabled:bg-white/5 hover:not-disabled:text-frost",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-[0.78rem]",
  md: "h-11 px-6 text-[0.85rem]",
  lg: "h-14 px-8 text-[0.95rem]",
};

export function buttonStyles({
  variant = "solar",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(base, variants[variant], sizes[size], className);
}
