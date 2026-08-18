"use client";

import type { DashboardView } from "../types";

export function CreateInfluencerView({
  onNavigate,
}: {
  onNavigate: (v: DashboardView) => void;
}) {
  void onNavigate;
  return (
    <div className="mx-auto w-full max-w-4xl px-5 pt-10 pb-16 sm:px-8" />
  );
}
