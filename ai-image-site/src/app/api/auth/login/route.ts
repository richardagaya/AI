import { NextResponse } from "next/server";

// Login is handled entirely by Firebase Auth on the client.
export async function POST() {
  return NextResponse.json(
    { error: "Use Firebase Auth client SDK for login." },
    { status: 410 },
  );
}
