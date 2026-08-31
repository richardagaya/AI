/**
 * Public surfaces of the product.
 *
 * Each surface gets its own hostname in production but is served by this same
 * Next.js app: middleware maps an incoming Host header onto the internal path
 * prefix declared in `SURFACE_ROOT`.
 *
 * When the `NEXT_PUBLIC_*_URL` vars are unset every surface resolves to the
 * same localhost origin. Host routing then has nothing to disambiguate, so it
 * switches itself off and the internal paths (`/`, `/studio`, `/learn`) are
 * browsable directly. Attaching real domains later needs no code change.
 *
 * Safe to import from the edge runtime and the browser — string handling only.
 */

export type Surface = "site" | "studio" | "learn" | "api";

/** Surfaces that render pages, as opposed to the JSON API. */
export type PageSurface = Exclude<Surface, "api">;

const DEV_ORIGIN = "http://localhost:3000";

/** Internal path each page surface is mounted at. The marketing site owns the root. */
export const SURFACE_ROOT: Record<PageSurface, string> = {
  site: "",
  studio: "/studio",
  learn: "/learn",
};

function clean(url: string | undefined): string {
  return url?.trim().replace(/\/+$/, "") ?? "";
}

export const SITE_URL = clean(process.env.NEXT_PUBLIC_SITE_URL) || DEV_ORIGIN;

export const STUDIO_URL =
  clean(process.env.NEXT_PUBLIC_STUDIO_URL) || `${DEV_ORIGIN}${SURFACE_ROOT.studio}`;

export const LEARN_URL =
  clean(process.env.NEXT_PUBLIC_LEARN_URL) || `${DEV_ORIGIN}${SURFACE_ROOT.learn}`;

/** Blank means "same origin as the page" — the API is not split out yet. */
export const API_URL = clean(process.env.NEXT_PUBLIC_API_URL);

export const PAGE_SURFACE_URL: Record<PageSurface, string> = {
  site: SITE_URL,
  studio: STUDIO_URL,
  learn: LEARN_URL,
};

/**
 * In-app links stay on localhost during `next dev`, even if `.env.local` has
 * production NEXT_PUBLIC_*_URL values (needed for mail, Paystack, etc.).
 */
function inAppSurfaceUrl(surface: PageSurface): string {
  if (process.env.NODE_ENV !== "production") {
    const root = SURFACE_ROOT[surface];
    return root ? `${DEV_ORIGIN}${root}` : DEV_ORIGIN;
  }
  return PAGE_SURFACE_URL[surface];
}

function hostOf(url: string): string {
  try {
    return hostnameOf(new URL(url).host);
  } catch {
    return "";
  }
}

/** Lowercase hostname with port stripped, so env URLs match incoming Host headers. */
function hostnameOf(host: string): string {
  const lowered = host.toLowerCase().trim();
  if (lowered.startsWith("[")) return lowered;
  return lowered.replace(/:\d+$/, "");
}

/**
 * Hosts that unambiguously belong to one surface. A host claimed by more than
 * one surface — the default, where everything falls back to localhost — is
 * left out so that requests to it are passed through untouched.
 */
const SURFACE_BY_HOST: ReadonlyMap<string, Surface> = (() => {
  const claims = new Map<string, Set<Surface>>();

  for (const [surface, url] of [
    ["site", SITE_URL],
    ["studio", STUDIO_URL],
    ["learn", LEARN_URL],
    ["api", API_URL],
  ] as const) {
    const host = hostOf(url);
    if (!host) continue;
    const existing = claims.get(host);
    if (existing) existing.add(surface);
    else claims.set(host, new Set([surface]));
  }

  const resolved = new Map<string, Surface>();
  for (const [host, surfaces] of claims) {
    if (surfaces.size === 1) resolved.set(host, [...surfaces][0]);
  }
  return resolved;
})();

/**
 * `null` means the host is unknown or shared, and routing should not intervene.
 *
 * Env URLs are the source of truth when they uniquely claim a host. If they
 * were missing at build time (NEXT_PUBLIC_ vars are inlined then), fall back
 * to the subdomain convention: studio.*, learn.*, api.*.
 */
export function surfaceForHost(host: string | null | undefined): Surface | null {
  if (!host) return null;
  const normalised = hostnameOf(host);
  const fromEnv =
    SURFACE_BY_HOST.get(normalised) ??
    SURFACE_BY_HOST.get(normalised.replace(/^www\./, ""));
  if (fromEnv) return fromEnv;

  const bare = normalised.replace(/^www\./, "");
  if (bare.startsWith("studio.")) return "studio";
  if (bare.startsWith("learn.")) return "learn";
  if (bare.startsWith("api.")) return "api";
  return null;
}

/** Absolute URL of the studio, optionally opening straight into an auth mode. */
export function studioUrl(mode?: "login" | "signup"): string {
  const base = inAppSurfaceUrl("studio");
  return mode ? `${base}?mode=${mode}` : base;
}

/**
 * Same-origin href for the studio host vs the /studio prefix used in local dev.
 * Auth UI lives on the studio surface, so this stays inside the current origin.
 */
function studioSurfaceHref(path: string): string {
  const trimmed = path.startsWith("/") ? path : `/${path}`;
  const suffix = trimmed === "/" ? "" : trimmed;
  return `${inAppSurfaceUrl("studio")}${suffix}`;
}

/** Dedicated password-reset page on the studio host. */
export function studioResetHref(): string {
  return studioSurfaceHref("/reset-password");
}

export function studioAuthHref(mode?: "login" | "signup"): string {
  const path = studioSurfaceHref("/");
  return mode ? `${path}?mode=${mode}` : path;
}

/** Absolute URL of the learn index, or of one lesson. */
export function learnUrl(slug?: string): string {
  const base = inAppSurfaceUrl("learn");
  return slug ? `${base}/${slug}` : base;
}

/** Absolute URL of the credits / pricing page. */
export function pricingUrl(): string {
  return `${inAppSurfaceUrl("site")}/pricing`;
}

/**
 * Resolve an API path against the configured API origin. Returns the path
 * unchanged while the API is same-origin, so callers never need to change
 * again once it moves to its own host.
 */
export function apiUrl(path: string): string {
  return `${API_URL}${path}`;
}
