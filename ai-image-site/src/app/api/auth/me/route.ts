import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { fsGet, fsSet } from "@/lib/firestoreRest";

export async function GET(req: Request) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ user: null });

  const { userId, email, token } = session;
  const doc = await fsGet("users", userId, token);

  if (!doc.exists) {
    const newUser = { email, creditBalance: 0, createdAt: new Date().toISOString() };
    await fsSet("users", userId, newUser, token);
    return NextResponse.json({ user: { id: userId, email, creditBalance: 0 } });
  }

  return NextResponse.json({
    user: {
      id: userId,
      email: doc.data.email as string,
      creditBalance: doc.data.creditBalance as number,
    },
  });
}
