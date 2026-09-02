/* ═══════════════════════════════════════════════════════════════════════
 *
 *   SITE MEDIA MANIFEST
 *
 *   Every image and video on the site is controlled from THIS one file.
 *   You never need to open any component to swap media.
 *
 *   TO USE YOUR OWN FILES:
 *     1. Drop them into the  public/media/  folder
 *     2. Replace a path below with  "/media/your-file.jpg"  (or .mp4)
 *     3. Save — done.
 *
 *   Remote URLs (https://…) also work — just paste them in.
 *
 *   WHAT EACH SECTION CONTROLS:
 *     1. BACKGROUND VIDEOS — big looping videos behind page sections
 *     2. SHOWCASE WALL ..... the landing grid + scrolling marquee +
 *                            dashboard Explore page. Items 1–3 are also
 *                            the floating cards in the hero.
 *     3. INFLUENCER EXAMPLES the masonry wall on Create Influencer.
 *
 * ═══════════════════════════════════════════════════════════════════════ */

export type Media = {
  id: string;
  kind: "video" | "image";
  src: string; // "/media/file.jpg"  or  "https://…"
  poster?: string; // videos only: still frame shown while loading
  prompt: string; // caption shown on hover
  tag: string; // filter label on the showcase wall
};

export type BackgroundVideo = { src: string; poster: string };

/* ── 1. BACKGROUND VIDEOS ────────────────────────────────────────────── */

/** Landing hero — behind the headline */
export const HERO_BACKGROUND: BackgroundVideo = {
  src: "https://assets.mixkit.co/videos/47356/47356-720.mp4",
  poster: "https://assets.mixkit.co/videos/47356/47356-thumb-720-0.jpg",
};

/** Login / signup popup */
export const AUTH_BACKGROUND: BackgroundVideo = {
  src: "/media_pool/landingpage.mp4",
  poster: "/media_pool/image1.webp",
};

/** Bottom "Start creating" call-to-action */
export const FINAL_CTA_BACKGROUND: BackgroundVideo = {
  src: "https://assets.mixkit.co/videos/28844/28844-720.mp4",
  poster: "https://assets.mixkit.co/videos/28844/28844-thumb-720-0.jpg",
};

/* ── 2. SHOWCASE WALL ──────────────────────────────────────────────────
 * kind: "image" for stills, "video" for clips.
 * Items 1–3 double as the floating hero cards. */

export const SHOWCASE: Media[] = [
  // ── 1 · also a hero card ──
  {
    id: "frost-portrait",
    kind: "video",
    src: "https://assets.mixkit.co/videos/39880/39880-720.mp4",
    poster: "https://assets.mixkit.co/videos/39880/39880-thumb-720-0.jpg",
    prompt: "frost sorceress, silver hair, falling snow, cinematic key light",
    tag: "Cinematic",
  },
  // ── 2 · also a hero card ──
  {
    id: "still-1",
    kind: "image",
    src: "https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/45b297f2-034e-488e-a00b-c9868d392a8d/anim=false,width=450,optimized=true/Z-Image_02287_.jpeg",
    prompt: "anime heroine, golden hour rim light, ultra detailed",
    tag: "Anime",
  },
  // ── 3 · also a hero card ──
  {
    id: "golden-field",
    kind: "video",
    src: "https://assets.mixkit.co/videos/46656/46656-720.mp4",
    poster: "https://assets.mixkit.co/videos/46656/46656-thumb-720-0.jpg",
    prompt: "summoner in a wheat field, backlit dusk haze, 85mm",
    tag: "Cinematic",
  },
  // ── 4 ──
  {
    id: "still-2",
    kind: "image",
    src: "https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/3d5763a0-7193-4c3f-9b13-6828f4449067/anim=false,width=450,optimized=true/00001-2913226030.jpeg",
    prompt: "gothic waifu, dark fantasy, volumetric candlelight",
    tag: "Anime",
  },
  // ── 5 ──
  {
    id: "gold-bokeh",
    kind: "video",
    src: "https://assets.mixkit.co/videos/31497/31497-720.mp4",
    poster: "https://assets.mixkit.co/videos/31497/31497-thumb-720-0.jpg",
    prompt: "shattered gold prisms, macro bokeh, black backdrop",
    tag: "Abstract",
  },
  // ── 6 ──
  {
    id: "still-3",
    kind: "image",
    src: "https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/881073c6-4fb1-4ce3-a4d9-c209f5c494ac/original=true,quality=90/aid7ce19926fce.jpeg",
    prompt: "legendary pokemon fusion, painterly, epic scale",
    tag: "Anime",
  },
  // ── 7 ──
  {
    id: "ice",
    kind: "video",
    src: "https://assets.mixkit.co/videos/48402/48402-720.mp4",
    poster: "https://assets.mixkit.co/videos/48402/48402-thumb-720-0.jpg",
    prompt: "glacier shards at first light, subsurface scattering",
    tag: "Texture",
  },
  // ── 8 ──
  {
    id: "still-4",
    kind: "image",
    src: "https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/aad6f21f-f891-48dd-b811-b0ec7433426d/anim=false,width=450,optimized=true/ABFA5FB3CE9318D2CFE3ADA30ECCBB65AE15F48BE2477F941F4FD6975BF403E7.jpeg",
    prompt: "mermaid bioluminescent art, deep ocean glow",
    tag: "Anime",
  },
  // ── 9 ──
  {
    id: "gold-dust",
    kind: "video",
    src: "https://assets.mixkit.co/videos/46392/46392-720.mp4",
    poster: "https://assets.mixkit.co/videos/46392/46392-thumb-720-0.jpg",
    prompt: "suspended gold dust, shallow depth of field, warm rim",
    tag: "Abstract",
  },
  // ── 10 ──
  {
    id: "still-5",
    kind: "image",
    src: "https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/2e30afa8-8dca-4d9d-aac6-ea184c04804e/anim=false,width=450,optimized=true/02186.jpeg",
    prompt: "fire-type gym leader, dynamic pose, ember sparks",
    tag: "Anime",
  },
  // ── 11 ──
  {
    id: "embers",
    kind: "video",
    src: "https://assets.mixkit.co/videos/47356/47356-720.mp4",
    poster: "https://assets.mixkit.co/videos/47356/47356-thumb-720-0.jpg",
    prompt: "ember storm rising, pure black background, sparks",
    tag: "Texture",
  },
  // ── 12 ──
  {
    id: "smoke",
    kind: "video",
    src: "https://assets.mixkit.co/videos/12496/12496-720.mp4",
    poster: "https://assets.mixkit.co/videos/12496/12496-thumb-720-0.jpg",
    prompt: "ink smoke curling in void, high contrast monochrome",
    tag: "Abstract",
  },
];

/* ── 3. INFLUENCER EXAMPLES ────────────────────────────────────────────
 * Masonry wall on Create Influencer — photoreal portraits + clips. */

export const INFLUENCER_EXAMPLES: Media[] = [
  {
    id: "ex-portrait-1",
    kind: "image",
    src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&h=1000&q=80",
    prompt: "close portrait, natural light",
    tag: "Portrait",
  },
  {
    id: "ex-fashion-1",
    kind: "image",
    src: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&h=1100&q=80",
    prompt: "full-body fashion, outdoor",
    tag: "Fashion",
  },
  {
    id: "ex-vlog-local",
    kind: "image",
    src: "/media_pool/image3.webp",
    prompt: "talking to camera",
    tag: "Vlog",
  },
  {
    id: "ex-cafe",
    kind: "image",
    src: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&h=800&q=80",
    prompt: "cafe portrait, glasses",
    tag: "Lifestyle",
  },
  {
    id: "ex-cinematic-man",
    kind: "image",
    src: "/media_pool/image1.webp",
    prompt: "cinematic night portrait",
    tag: "Editorial",
  },
  {
    id: "ex-video-1",
    kind: "video",
    src: "https://assets.mixkit.co/videos/39880/39880-720.mp4",
    poster: "https://assets.mixkit.co/videos/39880/39880-thumb-720-0.jpg",
    prompt: "cinematic portrait clip",
    tag: "Video",
  },
  {
    id: "ex-gym",
    kind: "image",
    src: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&h=1000&q=80",
    prompt: "gym, athletic editorial",
    tag: "Fitness",
  },
  {
    id: "ex-suit",
    kind: "image",
    src: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&h=1000&q=80",
    prompt: "studio portrait, tailored",
    tag: "Editorial",
  },
  {
    id: "ex-street",
    kind: "image",
    src: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=800&h=900&q=80",
    prompt: "street style, city",
    tag: "Street",
  },
  {
    id: "ex-video-2",
    kind: "video",
    src: "/media_pool/video.mp4",
    poster: "/media_pool/image1.webp",
    prompt: "motion look",
    tag: "Video",
  },
  {
    id: "ex-car",
    kind: "image",
    src: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=800&h=1000&q=80",
    prompt: "golden hour, in the car",
    tag: "Lifestyle",
  },
  {
    id: "ex-garden",
    kind: "image",
    src: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&h=1100&q=80",
    prompt: "outdoor lookbook",
    tag: "Fashion",
  },
  {
    id: "ex-night",
    kind: "image",
    src: "https://images.unsplash.com/photo-1524502397800-2eeaad7c3fe5?auto=format&fit=crop&w=800&h=900&q=80",
    prompt: "city night, bokeh",
    tag: "City",
  },
  {
    id: "ex-video-3",
    kind: "video",
    src: "https://assets.mixkit.co/videos/46656/46656-720.mp4",
    poster: "https://assets.mixkit.co/videos/46656/46656-thumb-720-0.jpg",
    prompt: "golden hour motion",
    tag: "Video",
  },
  {
    id: "ex-man-casual",
    kind: "image",
    src: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&h=1000&q=80",
    prompt: "off duty, city street",
    tag: "Lifestyle",
  },
  {
    id: "ex-beauty",
    kind: "image",
    src: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&h=900&q=80",
    prompt: "beauty close-up",
    tag: "Portrait",
  },
  {
    id: "ex-video-4",
    kind: "video",
    src: "/media_pool/video2.mp4",
    poster: "/media_pool/image3.webp",
    prompt: "creator clip",
    tag: "Video",
  },
  {
    id: "ex-studio-man",
    kind: "image",
    src: "https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=800&h=1100&q=80",
    prompt: "full-body studio",
    tag: "Editorial",
  },
  {
    id: "ex-indoor",
    kind: "image",
    src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&h=1000&q=80",
    prompt: "indoor portrait, window light",
    tag: "Lifestyle",
  },
  {
    id: "ex-video-5",
    kind: "video",
    src: "/media_pool/landingpage.mp4",
    poster: "/media_pool/image4.webp",
    prompt: "cinematic motion",
    tag: "Video",
  },
  {
    id: "ex-fitness-2",
    kind: "image",
    src: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=800&h=900&q=80",
    prompt: "training, gym floor",
    tag: "Fitness",
  },
  {
    id: "ex-cardigan",
    kind: "image",
    src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&h=900&q=80",
    prompt: "studio headshot",
    tag: "Portrait",
  },
];
