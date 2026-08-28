"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, Download, Loader2, Mail, Search } from "lucide-react";
import { firebaseAuth } from "@/lib/firebase";
import { apiUrl } from "@/lib/site";
import { buttonStyles } from "@/components/ui/button-styles";

type AudienceRow = {
  id: string;
  email: string;
  name: string | null;
  createdAt: string | null;
  providers: string[];
};

export function AudienceView() {
  const [rows, setRows] = useState<AudienceRow[]>([]);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await firebaseAuth.currentUser?.getIdToken();
        const res = await fetch(apiUrl("/api/admin/audience"), {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          cache: "no-store",
        });
        const data = (await res.json().catch(() => ({}))) as {
          users?: AudienceRow[];
          error?: string;
        };
        if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
        if (!cancelled) setRows(data.users ?? []);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not load signups");
        }
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (row) =>
        row.email.toLowerCase().includes(q) ||
        (row.name ?? "").toLowerCase().includes(q),
    );
  }, [rows, query]);

  async function copyEmails() {
    const text = filtered.map((r) => r.email).join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  async function downloadCsv() {
    const token = await firebaseAuth.currentUser?.getIdToken();
    const res = await fetch(apiUrl("/api/admin/audience?format=csv"), {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store",
    });
    if (!res.ok) {
      setError("Could not download CSV");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "minsuro-signups.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pt-10 pb-16 sm:px-8">
      <header className="mb-8">
        <p className="text-[0.66rem] font-bold tracking-[0.28em] uppercase text-solar">
          Admin
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.035em]">
          Audience
        </h1>
        <p className="mt-3 max-w-xl text-[0.88rem] leading-relaxed text-frost-dim">
          Everyone who has created a studio account. Use this list for product
          updates — keep it off public pages and shared drives.
        </p>
      </header>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <label className="relative min-w-[16rem] flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-frost-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by email or name"
            className="h-11 w-full rounded-full border border-line bg-ink-soft/80 pr-4 pl-10 text-sm text-frost outline-none placeholder:text-frost-faint focus:border-solar/70 focus:ring-3 focus:ring-solar/12"
          />
        </label>
        <button
          type="button"
          onClick={() => void copyEmails()}
          disabled={busy || filtered.length === 0}
          className={buttonStyles({ variant: "outline", size: "sm" })}
        >
          <Copy className="size-3.5" />
          {copied ? "Copied" : "Copy emails"}
        </button>
        <button
          type="button"
          onClick={() => void downloadCsv()}
          disabled={busy}
          className={buttonStyles({ size: "sm" })}
        >
          <Download className="size-3.5" />
          Download CSV
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-xl border border-red-500/25 bg-red-500/8 p-3.5 text-[0.82rem] text-red-300">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-line/70 bg-ink-card/80">
        <div className="flex items-center justify-between border-b border-line/50 px-4 py-3">
          <span className="inline-flex items-center gap-2 text-[0.72rem] font-semibold tracking-[0.14em] uppercase text-frost-faint">
            <Mail className="size-3.5 text-solar" />
            Signups
          </span>
          <span className="font-mono text-[0.78rem] text-solar">
            {busy ? "…" : `${filtered.length} / ${rows.length}`}
          </span>
        </div>

        {busy ? (
          <div className="grid place-items-center py-16 text-frost-faint">
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="px-4 py-12 text-center text-[0.88rem] text-frost-faint">
            No signups match that filter.
          </p>
        ) : (
          <div className="max-h-[28rem] overflow-auto">
            <table className="w-full text-left text-[0.82rem]">
              <thead className="sticky top-0 bg-ink-card text-[0.62rem] font-bold tracking-[0.14em] text-frost-faint uppercase">
                <tr>
                  <th className="px-4 py-2.5 font-bold">Email</th>
                  <th className="px-4 py-2.5 font-bold">Name</th>
                  <th className="px-4 py-2.5 font-bold">Joined</th>
                  <th className="px-4 py-2.5 font-bold">Sign-in</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className="border-t border-line/40">
                    <td className="px-4 py-2.5 font-medium text-frost">{row.email}</td>
                    <td className="px-4 py-2.5 text-frost-dim">{row.name ?? "—"}</td>
                    <td className="px-4 py-2.5 font-mono text-[0.72rem] text-frost-faint">
                      {row.createdAt ? row.createdAt.slice(0, 10) : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-frost-faint">
                      {row.providers
                        .map((p) => p.replace(".com", ""))
                        .join(", ") || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
