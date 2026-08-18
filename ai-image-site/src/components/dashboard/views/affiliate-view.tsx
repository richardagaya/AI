"use client";

import type { StudioUser } from "../types";

export function AffiliateView({ user }: { user: StudioUser }) {
  void user;
  return (
    <div className="mx-auto w-full max-w-6xl px-5 pt-10 pb-16 sm:px-8" />
  );
}
