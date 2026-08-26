import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { fsGet, fsSet } from "@/lib/firestoreRest";

export async function GET(req: Request) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ user: null });

  const { userId, email, displayName, token } = session;
  const doc = await fsGet("users", userId, token);

  if (!doc.exists) {
    const newUser = {
      email,
      displayName,
      creditBalance: 0,
      createdAt: new Date().toISOString(),
    };
    await fsSet("users", userId, newUser, token);
    return NextResponse.json({
      user: { id: userId, email, displayName, creditBalance: 0 },
    });
  }

  const storedRaw =
    typeof doc.data.displayName === "string" ? doc.data.displayName.trim() : "";
  const storedName = storedRaw.split(/\s+/)[0] || null;
  const resolvedName = storedName || displayName;

  if (resolvedName && storedRaw !== resolvedName) {
    await fsSet(
      "users",
      userId,
      { ...doc.data, displayName: resolvedName },
      token,
    );
  }

  return NextResponse.json({
    user: {
      id: userId,
      email: (doc.data.email as string) || email,
      displayName: resolvedName,
      creditBalance: doc.data.creditBalance as number,
    },
  });
}
