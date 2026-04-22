import { NextResponse } from "next/server";

// Signup is handled entirely by Firebase Auth on the client.
// The user document is created lazily on the first call to /api/auth/me.
export async function POST() {
  return NextResponse.json(
    { error: "Use Firebase Auth client SDK for signup." },
    { status: 410 },
  );
}
