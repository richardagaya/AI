import { NextResponse } from "next/server";

// Firebase sign-out is handled entirely on the client.
// This endpoint is kept as a no-op for backwards compatibility.
export async function POST() {
  return NextResponse.json({ ok: true });
}
