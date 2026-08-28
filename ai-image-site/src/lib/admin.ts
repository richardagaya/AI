import { timingSafeEqual } from "node:crypto";
import { getSession } from "@/lib/auth";

function splitEmails(raw: string | undefined): string[] {
  return (raw ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function adminEmails(): string[] {
  return splitEmails(process.env.ADMIN_EMAILS);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return adminEmails().includes(email.trim().toLowerCase());
}

function secretFromReq(req: Request): string | null {
  const header = req.headers.get("authorization");
  if (header?.startsWith("Bearer ")) return header.slice(7).trim() || null;
  return (
    req.headers.get("x-admin-secret")?.trim() ||
    req.headers.get("x-cron-secret")?.trim() ||
    null
  );
}

function secretsMatch(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function hasAdminSecret(req: Request): boolean {
  const provided = secretFromReq(req);
  if (!provided) return false;
  const expected = [
    process.env.ADMIN_SECRET,
    process.env.CRON_SECRET,
  ].filter((s): s is string => Boolean(s?.trim()));
  return expected.some((secret) => secretsMatch(provided, secret.trim()));
}

export async function requireAdmin(req: Request): Promise<boolean> {
  if (hasAdminSecret(req)) return true;
  const session = await getSession(req);
  return isAdminEmail(session?.email);
}
