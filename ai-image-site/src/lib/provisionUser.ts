import { type Session } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";
import { SIGNUP_CREDITS } from "@/lib/credits";
import { getAdminDb, getAdminInitError } from "@/lib/firebaseAdmin";
import { fsGet, fsSet } from "@/lib/firestoreRest";
import { mailConfigured, sendEmail, welcomeEmail } from "@/lib/mail";

export type StudioAccount = {
  id: string;
  email: string;
  displayName: string | null;
  creditBalance: number;
  isAdmin: boolean;
};

function firstName(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return value.trim().split(/\s+/)[0] || null;
}

function welcomeFields() {
  return {
    welcomeEmailSent: false,
    welcomeEmailDueAt: new Date().toISOString(),
  };
}

async function sendWelcomeNow(
  email: string | null | undefined,
  displayName: string | null,
  mark: (fields: Record<string, unknown>) => Promise<unknown>,
) {
  const to = email?.trim() ?? "";
  if (!to || !mailConfigured()) return;
  try {
    await sendEmail({ to, ...welcomeEmail(displayName, to) });
    await mark({
      welcomeEmailSent: true,
      welcomeEmailSentAt: new Date().toISOString(),
      welcomeEmailError: null,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    await mark({ welcomeEmailError: message.slice(0, 300) }).catch(() => {});
  }
}

export async function loadOrCreateStudioAccount(
  session: Session,
): Promise<StudioAccount> {
  const isAdmin = isAdminEmail(session.email);
  const adminDb = getAdminDb();
  if (adminDb) return provisionWithAdmin(session, isAdmin);

  // Local/dev fallback when the Admin SDK is not configured.
  return provisionWithUserToken(session, isAdmin);
}

async function provisionWithAdmin(
  session: Session,
  isAdmin: boolean,
): Promise<StudioAccount> {
  const ref = getAdminDb()!.collection("users").doc(session.userId);
  const snap = await ref.get();
  const tokenName = firstName(session.displayName);

  if (!snap.exists) {
    const data = {
      email: session.email,
      displayName: tokenName,
      creditBalance: SIGNUP_CREDITS,
      signupCreditsGranted: true,
      createdAt: new Date().toISOString(),
      ...welcomeFields(),
    };
    await ref.set(data);
    await sendWelcomeNow(session.email, tokenName, (fields) => ref.update(fields));
    return {
      id: session.userId,
      email: session.email,
      displayName: tokenName,
      creditBalance: SIGNUP_CREDITS,
      isAdmin,
    };
  }

  const data = snap.data() ?? {};
  const storedName = firstName(data.displayName);
  const resolvedName = storedName || tokenName;
  const alreadyGranted = data.signupCreditsGranted === true;
  const currentBalance = Number(data.creditBalance ?? 0);
  const grantSignup = !alreadyGranted && currentBalance <= 0;
  const creditBalance = grantSignup ? SIGNUP_CREDITS : currentBalance;

  const updates: Record<string, unknown> = {};
  if (resolvedName && data.displayName !== resolvedName) {
    updates.displayName = resolvedName;
  }
  if (grantSignup) {
    updates.creditBalance = SIGNUP_CREDITS;
    updates.signupCreditsGranted = true;
  }
  if (!data.email && session.email) updates.email = session.email;
  if (Object.keys(updates).length > 0) await ref.update(updates);

  return {
    id: session.userId,
    email: (typeof data.email === "string" && data.email) || session.email,
    displayName: resolvedName,
    creditBalance,
    isAdmin,
  };
}

async function provisionWithUserToken(
  session: Session,
  isAdmin: boolean,
): Promise<StudioAccount> {
  if (!getAdminDb()) {
    // Keep the error visible in logs so missing Admin config is obvious.
    console.warn(
      "[auth/me] Firebase Admin unavailable:",
      getAdminInitError() || "unknown",
    );
  }
  const { userId, email, displayName, token } = session;
  const doc = await fsGet("users", userId, token);
  const tokenName = firstName(displayName);

  if (!doc.exists) {
    const newUser = {
      email,
      displayName: tokenName,
      creditBalance: SIGNUP_CREDITS,
      signupCreditsGranted: true,
      createdAt: new Date().toISOString(),
      ...welcomeFields(),
    };
    await fsSet("users", userId, newUser, token);
    await sendWelcomeNow(email, tokenName, (fields) =>
      fsSet("users", userId, { ...newUser, ...fields }, token),
    );
    return {
      id: userId,
      email,
      displayName: tokenName,
      creditBalance: SIGNUP_CREDITS,
      isAdmin,
    };
  }

  const storedName = firstName(doc.data.displayName);
  const resolvedName = storedName || tokenName;
  const alreadyGranted = doc.data.signupCreditsGranted === true;
  const currentBalance = Number(doc.data.creditBalance ?? 0);
  const grantSignup = !alreadyGranted && currentBalance <= 0;
  const creditBalance = grantSignup ? SIGNUP_CREDITS : currentBalance;

  if (
    (resolvedName && doc.data.displayName !== resolvedName) ||
    grantSignup
  ) {
    await fsSet(
      "users",
      userId,
      {
        ...doc.data,
        displayName: resolvedName,
        ...(grantSignup
          ? { creditBalance: SIGNUP_CREDITS, signupCreditsGranted: true }
          : {}),
      },
      token,
    );
  }

  return {
    id: userId,
    email: (doc.data.email as string) || email,
    displayName: resolvedName,
    creditBalance,
    isAdmin,
  };
}
