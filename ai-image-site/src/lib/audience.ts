import { getAdminAuth, getAdminInitError } from "@/lib/firebaseAdmin";

export type AudienceRow = {
  id: string;
  email: string;
  name: string | null;
  createdAt: string | null;
  providers: string[];
};

export async function listSignupAudience(): Promise<AudienceRow[]> {
  const auth = getAdminAuth();
  if (!auth) {
    throw new Error(
      `Firebase Admin is not configured (${getAdminInitError() || "unknown"}).`,
    );
  }

  const rows: AudienceRow[] = [];
  let pageToken: string | undefined;
  do {
    const page = await auth.listUsers(1000, pageToken);
    for (const user of page.users) {
      const email = user.email?.trim();
      if (!email) continue;
      rows.push({
        id: user.uid,
        email,
        name: user.displayName?.trim().split(/\s+/)[0] || null,
        createdAt: user.metadata.creationTime
          ? new Date(user.metadata.creationTime).toISOString()
          : null,
        providers: user.providerData.map((p) => p.providerId).filter(Boolean),
      });
    }
    pageToken = page.pageToken;
  } while (pageToken);

  rows.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  return rows;
}

export function audienceCsv(rows: AudienceRow[]): string {
  const header = "email,name,createdAt,providers";
  const body = rows.map((row) =>
    [
      csvCell(row.email),
      csvCell(row.name ?? ""),
      csvCell(row.createdAt ?? ""),
      csvCell(row.providers.join("|")),
    ].join(","),
  );
  return [header, ...body].join("\n");
}

function csvCell(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replaceAll('"', '""')}"`;
  return value;
}
