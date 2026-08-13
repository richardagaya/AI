export type Media = {
  id: string;
  kind: "video" | "image";
  src: string;
  poster?: string;
  prompt: string;
  tag: string;
};

const mixkit = (id: number) => ({
  src: `https://assets.mixkit.co/videos/${id}/${id}-720.mp4`,
  poster: `https://assets.mixkit.co/videos/${id}/${id}-thumb-720-0.jpg`,
});

export const CINEMATIC = {
  embers: mixkit(47356),
  goldDust: mixkit(46392),
  goldBokeh: mixkit(31497),
  goldenField: mixkit(46656),
  iceMacro: mixkit(48402),
  snowDusk: mixkit(28844),
  frostWoman: mixkit(39880),
  smoke: mixkit(12496),
};

export const ART_STILLS = [
  "https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/45b297f2-034e-488e-a00b-c9868d392a8d/anim=false,width=450,optimized=true/Z-Image_02287_.jpeg",
  "https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/3d5763a0-7193-4c3f-9b13-6828f4449067/anim=false,width=450,optimized=true/00001-2913226030.jpeg",
  "https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/881073c6-4fb1-4ce3-a4d9-c209f5c494ac/original=true,quality=90/aid7ce19926fce.jpeg",
  "https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/aad6f21f-f891-48dd-b811-b0ec7433426d/anim=false,width=450,optimized=true/ABFA5FB3CE9318D2CFE3ADA30ECCBB65AE15F48BE2477F941F4FD6975BF403E7.jpeg",
  "https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/2e30afa8-8dca-4d9d-aac6-ea184c04804e/anim=false,width=450,optimized=true/02186.jpeg",
];

export const SHOWCASE: Media[] = [
  {
    id: "frost-portrait",
    kind: "video",
    ...CINEMATIC.frostWoman,
    prompt: "frost sorceress, silver hair, falling snow, cinematic key light",
    tag: "Cinematic",
  },
  {
    id: "still-1",
    kind: "image",
    src: ART_STILLS[0],
    prompt: "anime heroine, golden hour rim light, ultra detailed",
    tag: "Anime",
  },
  {
    id: "golden-field",
    kind: "video",
    ...CINEMATIC.goldenField,
    prompt: "summoner in a wheat field, backlit dusk haze, 85mm",
    tag: "Cinematic",
  },
  {
    id: "still-2",
    kind: "image",
    src: ART_STILLS[1],
    prompt: "gothic waifu, dark fantasy, volumetric candlelight",
    tag: "Anime",
  },
  {
    id: "gold-bokeh",
    kind: "video",
    ...CINEMATIC.goldBokeh,
    prompt: "shattered gold prisms, macro bokeh, black backdrop",
    tag: "Abstract",
  },
  {
    id: "still-3",
    kind: "image",
    src: ART_STILLS[2],
    prompt: "legendary pokemon fusion, painterly, epic scale",
    tag: "Anime",
  },
  {
    id: "ice",
    kind: "video",
    ...CINEMATIC.iceMacro,
    prompt: "glacier shards at first light, subsurface scattering",
    tag: "Texture",
  },
  {
    id: "still-4",
    kind: "image",
    src: ART_STILLS[3],
    prompt: "mermaid bioluminescent art, deep ocean glow",
    tag: "Anime",
  },
  {
    id: "gold-dust",
    kind: "video",
    ...CINEMATIC.goldDust,
    prompt: "suspended gold dust, shallow depth of field, warm rim",
    tag: "Abstract",
  },
  {
    id: "still-5",
    kind: "image",
    src: ART_STILLS[4],
    prompt: "fire-type gym leader, dynamic pose, ember sparks",
    tag: "Anime",
  },
  {
    id: "embers",
    kind: "video",
    ...CINEMATIC.embers,
    prompt: "ember storm rising, pure black background, sparks",
    tag: "Texture",
  },
  {
    id: "smoke",
    kind: "video",
    ...CINEMATIC.smoke,
    prompt: "ink smoke curling in void, high contrast monochrome",
    tag: "Abstract",
  },
];

export const PROMPT_TICKER = [
  "pikachu trainer · anime style",
  "gothic waifu · dark fantasy",
  "legendary pokemon fusion",
  "cyberpunk elf · neon rain",
  "mature scene · soft lighting",
  "dragonball-style warrior",
  "mermaid bioluminescent art",
  "fire-type gym leader",
  "eevee girl · pastel dream",
  "psychic-type aura · detailed",
  "frost sorceress · silver hair",
  "kitsune priestess · gold leaf",
];
