import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** First given name from a Google display name, falling back to the email local-part. */
export function firstNameOf(user: {
  email: string;
  displayName?: string | null;
}): string {
  const fromProfile = user.displayName?.trim().split(/\s+/)[0];
  if (fromProfile) return fromProfile;

  const local = user.email.split("@")[0] ?? "";
  const beforeSep = local.split(/[._+\-]/)[0] ?? local;
  const letters = beforeSep.replace(/\d+$/, "");
  return letters || beforeSep || "there";
}
