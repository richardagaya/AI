/**
 * Builds a one-off generation prompt from live public APIs so the dice
 * button does not recycle a hardcoded list.
 *
 *   D&D 5e     — character / creature
 *   Art Institute of Chicago — place, medium, art-historical style
 *   Datamuse   — adjectives that actually modify a visual noun
 *
 * Any source can fail; missing pieces are filled from a local combinatorial
 * bank so the button still works offline.
 */

export type SurpriseKind = "image" | "video";

const FETCH_MS = 2800;
const UA = "minsuro-studio/1.0 (https://minsuroai.com)";

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

function titleCaseWord(word: string) {
  return word.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
}

function clean(value: string | null | undefined): string | null {
  if (!value) return null;
  const text = titleCaseWord(value)
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return text.length >= 3 ? text : null;
}

async function fetchJson<T>(url: string, extra?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...extra,
    headers: { Accept: "application/json", "User-Agent": UA, ...extra?.headers },
    signal: AbortSignal.timeout(FETCH_MS),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return (await res.json()) as T;
}

/* ── Local banks (fallback + cinematic glue) ──────────────────────────── */

const LIGHTING = [
  "volumetric moonlight",
  "cinematic key light",
  "golden hour rim light",
  "candlelight haze",
  "neon rain reflections",
  "warm forge glow",
  "cold bioluminescent wash",
  "storm-backlit silhouette",
  "god rays through dust",
  "soft overcast skylight",
] as const;

const LENSES = [
  "85mm portrait",
  "epic wide shot",
  "macro detail",
  "low-angle hero shot",
  "anamorphic widescreen",
  "intimate close-up",
  "dutch angle",
  "establishing wide",
] as const;

const MOTIONS = [
  "slow orbit around the subject",
  "gentle camera dolly in",
  "fabric and hair catching the wind",
  "embers drifting through frame",
  "falling snow, subtle parallax",
  "handheld drift, breathing motion",
  "crane rising over the scene",
  "particles swirling in slow motion",
] as const;

const LOCAL_SUBJECTS = [
  "frost sorceress with an ice crystal crown",
  "cyberpunk elf mercenary",
  "celestial kitsune priestess",
  "ember dragon hatchling",
  "bioluminescent mermaid queen",
  "gothic vampire in ruined lace",
  "mecha samurai",
  "astral witch",
  "desert oracle in gold leaf veils",
  "clockwork paladin",
] as const;

const LOCAL_SETTINGS = [
  "gold leaf shrine at midnight",
  "neon rain and reflective puddles",
  "blacksmith's anvil in a roaring forge",
  "deep ocean trench of glowing coral",
  "ruined cathedral, candlelit",
  "cherry blossom avenue",
  "nebula library of floating grimoires",
  "frozen cliff temple above the clouds",
  "sunken marble palace",
  "obsidian throne room",
] as const;

const LOCAL_ADJECTIVES = [
  "celestial",
  "iridescent",
  "gilded",
  "storm-wrought",
  "obsidian",
  "luminous",
  "baroque",
  "ethereal",
  "chrome-edged",
  "moonlit",
] as const;

const BORING_ADJECTIVES = new Set([
  "full",
  "whole",
  "complete",
  "new",
  "old",
  "good",
  "bad",
  "great",
  "other",
  "same",
  "such",
  "many",
  "more",
  "most",
  "own",
  "first",
  "last",
  "long",
  "little",
  "big",
  "small",
  "large",
  "free",
  "light",
  "heavy",
  "hard",
  "open",
  "public",
  "private",
  "general",
  "special",
  "original",
  "local",
  "national",
  "social",
  "simple",
  "common",
  "normal",
  "human",
  "natural",
  "single",
  "entire",
  "total",
  "present",
  "famous",
  "fine",
  "clear",
  "bright",
  "beautiful",
  "busy",
  "visual",
  "colored",
  "changeable",
  "various",
  "different",
  "german",
  "french",
  "english",
  "american",
  "british",
  "real",
  "true",
  "main",
  "only",
  "next",
  "few",
  "several",
]);

/** AIC `place_of_origin` is often just a country — too bland as a setting. */
const GENERIC_PLACES = new Set([
  "united states",
  "usa",
  "america",
  "england",
  "united kingdom",
  "uk",
  "france",
  "italy",
  "germany",
  "spain",
  "china",
  "japan",
  "india",
  "egypt",
  "greece",
  "mexico",
  "russia",
  "canada",
  "australia",
  "netherlands",
  "belgium",
  "switzerland",
  "austria",
  "portugal",
  "korea",
  "south korea",
  "turkey",
  "iran",
  "brazil",
  "argentina",
  "poland",
  "sweden",
  "norway",
  "denmark",
  "finland",
  "ireland",
  "scotland",
  "unknown",
]);

/* ── D&D 5e (cached index) ────────────────────────────────────────────── */

type DndList = { results?: Array<{ index: string; name: string }> };

type DndIndexes = {
  monsters: string[];
  races: string[];
  classes: string[];
  items: string[];
};

let dndCache: { at: number; data: DndIndexes } | null = null;
const DND_TTL_MS = 24 * 60 * 60 * 1000;

async function dndList(path: string): Promise<string[]> {
  const data = await fetchJson<DndList>(`https://www.dnd5eapi.co/api/2014/${path}`);
  return (data.results ?? []).map((r) => r.name).filter(Boolean);
}

async function dndIndexes(): Promise<DndIndexes> {
  if (dndCache && Date.now() - dndCache.at < DND_TTL_MS) return dndCache.data;
  const [monsters, races, classes, items] = await Promise.all([
    dndList("monsters"),
    dndList("races"),
    dndList("classes"),
    dndList("magic-items"),
  ]);
  const data = { monsters, races, classes, items };
  dndCache = { at: Date.now(), data };
  return data;
}

async function fetchDndSubject(): Promise<{ subject: string; prop: string | null }> {
  const { monsters, races, classes, items } = await dndIndexes();
  const mundane = /^(thug|commoner|guard|bandit|cultist|acolyte|noble|spy|scout|veteran)$/i;
  const creatures = monsters.filter((name) => !mundane.test(name));
  const useMonster = Math.random() < 0.55 && creatures.length > 0;
  const subject = useMonster
    ? pick(creatures)
    : [races.length ? pick(races) : null, classes.length ? pick(classes) : null]
        .filter(Boolean)
        .join(" ") || pick(LOCAL_SUBJECTS);
  const visualItems = items.filter(
    (name) =>
      (name.length >= 10 || /\s/.test(name)) &&
      !/[\(+]|scroll|potion|ammunition|spell/i.test(name),
  );
  const prop =
    visualItems.length && Math.random() < 0.4
      ? `holding ${pick(visualItems)}`
      : null;
  return { subject, prop };
}

/* ── Art Institute of Chicago ─────────────────────────────────────────── */

type ArticResponse = {
  data?: Array<{
    style_title?: string | null;
    medium_display?: string | null;
    place_of_origin?: string | null;
  }>;
};

function visualMedium(medium: string | null | undefined): string | null {
  if (!medium) return null;
  const m = medium.toLowerCase();
  if (m.includes("oil")) return "oil painting";
  if (m.includes("watercolor") || m.includes("watercolour")) return "watercolor wash";
  if (m.includes("woodblock") || m.includes("ukiyo")) return "ukiyo-e woodblock";
  if (m.includes("marble") || m.includes("bronze") || m.includes("sculpt"))
    return "sculptural volume";
  if (m.includes("ink")) return "ink wash";
  if (m.includes("pastel")) return "soft pastel";
  if (m.includes("tempera")) return "egg tempera";
  if (m.includes("photograph") || m.includes("gelatin") || m.includes("silver print"))
    return "cinematic photography";
  if (m.includes("acrylic")) return "acrylic painting";
  if (m.includes("charcoal")) return "charcoal drawing";
  if (m.includes("tapestry") || m.includes("textile")) return "woven tapestry";
  if (m.includes("stained")) return "stained glass glow";
  if (m.includes("fresco")) return "fresco";
  return null;
}

async function fetchArtwork(): Promise<{
  setting: string | null;
  finish: string | null;
}> {
  const page = 1 + Math.floor(Math.random() * 40_000);
  const json = await fetchJson<ArticResponse>(
    `https://api.artic.edu/api/v1/artworks?page=${page}&limit=1&fields=style_title,medium_display,place_of_origin`,
  );
  const art = json.data?.[0];
  if (!art) return { setting: null, finish: null };

  const place = clean(art.place_of_origin);
  const placeKey = place?.toLowerCase() ?? "";
  const setting =
    place && !GENERIC_PLACES.has(placeKey) ? `in ${place}` : null;
  const styleRaw = clean(art.style_title)?.replace(/\s*\([^)]*\)/g, "").trim();
  const style =
    styleRaw &&
    styleRaw.length <= 28 &&
    !/period|dynasty|century|millennium|era|\bbc\b/i.test(styleRaw)
      ? styleRaw
      : null;
  const medium = visualMedium(art.medium_display);
  const finish =
    [style ? `${style} style` : null, medium].filter(Boolean).join(", ") || null;
  return { setting, finish };
}

/* ── Datamuse adjectives ──────────────────────────────────────────────── */

type DatamuseWord = { word?: string; tags?: string[] };

async function fetchAdjectives(): Promise<string | null> {
  const seed = pick(LOCAL_ADJECTIVES);
  const rows = await fetchJson<DatamuseWord[]>(
    `https://api.datamuse.com/words?ml=${encodeURIComponent(seed)}&md=p&max=25`,
  );
  const words = rows
    .filter((r) => {
      const w = r.word?.toLowerCase().trim() ?? "";
      if (!/^[a-z]+$/.test(w) || w.length < 5 || w.length > 12) return false;
      if (BORING_ADJECTIVES.has(w)) return false;
      if (rTagsAreNounOnly(r.tags)) return false;
      if (/^(un|in|non|proto|meta|aeri)/.test(w)) return false;
      return true;
    })
    .map((r) => r.word!.toLowerCase().trim())
    .slice(0, 10);
  return words.length ? pick(words) : null;
}

function rTagsAreNounOnly(tags: string[] | undefined) {
  if (!tags?.length) return false;
  const parts = tags.filter((t) => t === "n" || t === "adj" || t === "v" || t === "adv");
  return parts.length > 0 && !parts.includes("adj") && parts.includes("n");
}

/* ── Compose ──────────────────────────────────────────────────────────── */

function localCombo(kind: SurpriseKind): string {
  const parts = [
    `${pick(LOCAL_ADJECTIVES)} ${pick(LOCAL_SUBJECTS)}`,
    pick(LOCAL_SETTINGS),
    kind === "video" ? pick(MOTIONS) : null,
    pick(LIGHTING),
    pick(LENSES),
  ];
  return parts.filter(Boolean).join(", ");
}

export async function buildSurprisePrompt(kind: SurpriseKind): Promise<string> {
  const [dnd, art, adjective] = await Promise.allSettled([
    fetchDndSubject(),
    fetchArtwork(),
    fetchAdjectives(),
  ]);

  const subject =
    dnd.status === "fulfilled" ? dnd.value.subject : pick(LOCAL_SUBJECTS);
  const prop = dnd.status === "fulfilled" ? dnd.value.prop : null;
  const setting =
    art.status === "fulfilled" && art.value.setting
      ? art.value.setting
      : pick(LOCAL_SETTINGS);
  const finish =
    art.status === "fulfilled" ? art.value.finish : null;
  const adj =
    adjective.status === "fulfilled" && adjective.value
      ? adjective.value
      : pick(LOCAL_ADJECTIVES);

  const head = [adj, subject, prop].filter(Boolean).join(" ");
  const parts = [
    head,
    setting,
    kind === "video" ? pick(MOTIONS) : null,
    pick(LIGHTING),
    finish,
    pick(LENSES),
  ]
    .filter(Boolean)
    .map((p) => String(p).toLowerCase());

  const prompt = parts.join(", ");
  return prompt.length >= 24 ? prompt : localCombo(kind);
}
