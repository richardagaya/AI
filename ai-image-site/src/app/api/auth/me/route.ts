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
    const message = e instanceof Error ? e.message : "Could not load account";
    console.error("[auth/me]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
