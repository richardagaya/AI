export type StudioUser = { id: string; email: string; creditBalance: number };

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

export type GenerateHandlers = {
  prompt: string;
  negativePrompt: string;
  mode: "text2img" | "img2img";
  model: string;
  image: File | null;
  busy: boolean;
  error: string | null;
  canGenerate: boolean;
  onPromptChange: (v: string) => void;
  onNegativePromptChange: (v: string) => void;
  onModeChange: (v: "text2img" | "img2img") => void;
  onModelChange: (v: string) => void;
  onImageChange: (f: File | null) => void;
  onGenerate: () => void;
};
