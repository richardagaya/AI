import { NextResponse, type NextRequest } from "next/server";
import {
  PAGE_SURFACE_URL,
  SITE_URL,
  SURFACE_ROOT,
  surfaceForHost,
  type PageSurface,
} from "@/lib/site";

/**
 * Maps the incoming hostname onto the internal route that serves it, so one
 * deployment can back minsuroai.com, studio.minsuroai.com, learn.minsuroai.com
 * and api.minsuroai.com.
 *
 * When the surfaces share a host — the default in local development — this
 * does nothing and the internal paths are served exactly as requested.
 */

/** Page surfaces mounted under a path prefix, i.e. everything but the site root. */
const PREFIXED_SURFACES: PageSurface[] = ["studio", "learn"];

function surfaceOwning(pathname: string): PageSurface | null {
  for (const surface of PREFIXED_SURFACES) {
    const prefix = SURFACE_ROOT[surface];
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return surface;
  }
  return null;
}

function withoutPrefix(pathname: string, prefix: string): string {
  return pathname.slice(prefix.length) || "/";
}

export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // The API is still same-origin for every surface, so it is never remapped.
  if (pathname.startsWith("/api")) return NextResponse.next();

  const surface = surfaceForHost(req.headers.get("host"));

  // Unknown or shared host: single-origin development. Serve paths as written.
  if (!surface) return NextResponse.next();

  // The API host exposes nothing else; send stray browsers to the marketing site.
  if (surface === "api") return NextResponse.redirect(SITE_URL);

  const owner = surfaceOwning(pathname);

  // A path owned by another surface belongs on that surface's host.
  if (owner && owner !== surface) {
    const rest = withoutPrefix(pathname, SURFACE_ROOT[owner]);
    const suffix = rest === "/" ? "" : rest;
    return NextResponse.redirect(`${PAGE_SURFACE_URL[owner]}${suffix}${search}`);
  }

  const root = SURFACE_ROOT[surface];
  if (!root) return NextResponse.next();

  // On its own host the prefix is redundant: /learn/x canonicalises to /x.
  if (owner === surface) {
    const url = req.nextUrl.clone();
    url.pathname = withoutPrefix(pathname, root);
    return NextResponse.redirect(url);
  }

  const url = req.nextUrl.clone();
  url.pathname = pathname === "/" ? root : `${root}${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Everything except Next internals and files with an extension (icons, media…).
  matcher: ["/((?!_next/static|_next/image|.*\\.[^/]+$).*)"],
};
