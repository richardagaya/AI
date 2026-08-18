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

export type GenerateHandlers = {
  prompt: string;
  negativePrompt: string;
  mode: "text2img" | "img2img";
  image: File | null;
  busy: boolean;
  error: string | null;
  onPromptChange: (v: string) => void;
  onNegativePromptChange: (v: string) => void;
  onModeChange: (v: "text2img" | "img2img") => void;
  onImageChange: (f: File | null) => void;
  onGenerate: (settings: GenerateSettings) => void;
};
