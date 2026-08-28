import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";
import { SIGNUP_CREDITS } from "@/lib/credits";
import { fsGet, fsSet } from "@/lib/firestoreRest";

const WELCOME_DELAY_MS = 5 * 60 * 1000;

export async function GET(req: Request) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ user: null });

  const { userId, email, displayName, token } = session;
  const doc = await fsGet("users", userId, token);
  const isAdmin = isAdminEmail(email);

  if (!doc.exists) {
    const newUser = {
      email,
      displayName,
      creditBalance: SIGNUP_CREDITS,
      signupCreditsGranted: true,
      createdAt: new Date().toISOString(),
      welcomeEmailSent: false,
      welcomeEmailDueAt: new Date(Date.now() + WELCOME_DELAY_MS).toISOString(),
    };
    await fsSet("users", userId, newUser, token);
    return NextResponse.json({
      user: {
        id: userId,
        email,
        displayName,
        creditBalance: SIGNUP_CREDITS,
        isAdmin,
      },
    });
  }

  const storedRaw =
    typeof doc.data.displayName === "string" ? doc.data.displayName.trim() : "";
  const storedName = storedRaw.split(/\s+/)[0] || null;
  const resolvedName = storedName || displayName;

  const alreadyGranted = doc.data.signupCreditsGranted === true;
  const currentBalance = Number(doc.data.creditBalance ?? 0);
  const grantSignupCredits = !alreadyGranted && currentBalance <= 0;
  const creditBalance = grantSignupCredits ? SIGNUP_CREDITS : currentBalance;

  const needsName = Boolean(resolvedName && storedRaw !== resolvedName);
  const nextData = {
    ...doc.data,
    ...(needsName ? { displayName: resolvedName } : {}),
    ...(grantSignupCredits
      ? { creditBalance: SIGNUP_CREDITS, signupCreditsGranted: true }
      : {}),
  };

  if (needsName || grantSignupCredits) {
    await fsSet("users", userId, nextData, token);
  }

  return NextResponse.json({
    user: {
      id: userId,
      email: (doc.data.email as string) || email,
      displayName: resolvedName,
      creditBalance,
      isAdmin,
    },
  });
}
