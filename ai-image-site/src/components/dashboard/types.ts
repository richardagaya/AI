export type StudioUser = {
  id: string;
  email: string;
  creditBalance: number;
  displayName?: string | null;
};

export type StudioJob = {
  id: string;
  status: string;
  mode: string;
  model: string;
  prompt: string;
  costCredits: number;
  error: string | null;
  createdAt: string;
  outputImagePath: string | null;
  /** Public CDN URL of the finished output (R2), when storage is R2-backed. */
  outputUrl?: string | null;
  kind?: "image" | "video";
  aspect?: string;
  duration?: string;
  outputKind?: "image" | "video";
};

export type DashboardView =
  | "image"
  | "video"
  | "enhance"
  | "influencers"
  | "create-influencer"
  | "affiliate"
  | "library"
  | "explore";

/** Resolved generation settings passed up by the composer at submit time. */
export type GenerateSettings = {
  kind: "image" | "video";
  model: string;
  aspect: string;
  duration?: string;
  camera?: string;
  strength?: number;
};
