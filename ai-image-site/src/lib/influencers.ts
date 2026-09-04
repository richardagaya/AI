export type InfluencerPhoto = {
  url: string | null;
  path: string | null;
};

export type StudioInfluencer = {
  id: string;
  name: string;
  photos: InfluencerPhoto[];
  createdAt: string;
};

export const PHOTO_SLOTS = [
  {
    id: "ref",
    label: "Reference photo",
    hint: "One clear photo of the person. What happens in the shot is up to your prompt.",
  },
] as const;

/** Quality-only suffix. Never describes the scene. */
const QUALITY_SUFFIX =
  "photorealistic photograph, natural skin texture, real photography, sharp, clear, precise";

export function buildInfluencerPrompt(userPrompt: string): string {
  const prompt = userPrompt.trim();
  return prompt ? `${prompt}, ${QUALITY_SUFFIX}` : "";
}

/** Pushes InstantID off its default illustrated look. */
export const LOOK_NEGATIVE_PROMPT =
  "cartoon, anime, illustration, drawing, painting, comic, cgi, 3d render, pixar, disney, cel shading, stylized, plastic skin, airbrushed, lowres, bad anatomy, extra fingers, watermark, blurry, deformed face, cropped";
