import { NextResponse } from "next/server";
import { hasAdminSecret } from "@/lib/admin";
import { getAdminDb, getAdminInitError } from "@/lib/firebaseAdmin";
import { mailConfigured, sendEmail, welcomeEmail } from "@/lib/mail";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const BATCH = 25;

export async function GET(req: Request) {
  if (!hasAdminSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!mailConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Set RESEND_API_KEY and MAIL_FROM to send welcome mail." },
      { status: 501 },
    );
  }

  const db = getAdminDb();
  if (!db) {
    return NextResponse.json(
      { error: `Firebase Admin is not configured (${getAdminInitError() || "unknown"}).` },
      { status: 501 },
    );
  }

  const snap = await db
    .collection("users")
    .where("welcomeEmailSent", "==", false)
    .limit(BATCH)
    .get();

  const now = Date.now();
  let sent = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const doc of snap.docs) {
    const data = doc.data();
    const due = Date.parse(String(data.welcomeEmailDueAt ?? ""));
    if (Number.isFinite(due) && due > now) {
      skipped += 1;
      continue;
    }

    const email = typeof data.email === "string" ? data.email.trim() : "";
    if (!email) {
      await doc.ref.update({
        welcomeEmailSent: true,
        welcomeEmailError: "missing-email",
      });
      skipped += 1;
      continue;
    }

    const name = typeof data.displayName === "string" ? data.displayName : null;
    const mail = welcomeEmail(name, email);

    try {
      await sendEmail({ to: email, ...mail });
      await doc.ref.update({
        welcomeEmailSent: true,
        welcomeEmailSentAt: new Date().toISOString(),
        welcomeEmailError: null,
      });
      sent += 1;
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      errors.push(`${email}: ${message}`);
      await doc.ref.update({ welcomeEmailError: message.slice(0, 300) });
    }
  }

  return NextResponse.json({
    ok: errors.length === 0,
    scanned: snap.size,
    sent,
    skipped,
    errors,
  });
}

export const POST = GET;
