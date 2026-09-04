import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { loadOrCreateStudioAccount } from "@/lib/provisionUser";

export async function GET(req: Request) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ user: null });

  try {
    const account = await loadOrCreateStudioAccount(session);
    return NextResponse.json({ user: account });
  } catch (e) {
    const raw = e instanceof Error ? e.message : "Could not load account";
    const quota =
      /RESOURCE_EXHAUSTED|Quota exceeded/i.test(raw)
        ? "Firebase quota exceeded. The free Firestore plan ran out of reads — wait for the daily reset, or upgrade the Firebase project."
        : raw;
    console.error("[auth/me]", raw);
    return NextResponse.json({ error: quota }, { status: 500 });
  }
}
