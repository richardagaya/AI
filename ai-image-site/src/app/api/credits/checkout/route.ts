import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { STUDIO_URL } from "@/lib/site";
import {
  PAYSTACK_API,
  amountMinorUnits,
  paystackCurrency,
  paystackSecretKey,
} from "@/lib/paystack";

const BodySchema = z.object({
  credits: z.number().int().min(10).max(100000),
});

export async function POST(req: Request) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const secret = paystackSecretKey();
  if (!secret) {
    return NextResponse.json(
      { error: "Payments are not configured" },
      { status: 501 },
    );
  }

  if (!session.email) {
    return NextResponse.json(
      { error: "Your account needs an email to check out" },
      { status: 400 },
    );
  }

  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const credits = parsed.data.credits;
  const currency = paystackCurrency(process.env.PAYSTACK_CURRENCY);
  const amount = amountMinorUnits(credits, currency);
  const reference = `minsuro_${session.userId.slice(0, 12)}_${Date.now()}`;

  const res = await fetch(`${PAYSTACK_API}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: session.email,
      amount,
      currency,
      reference,
      callback_url: STUDIO_URL,
      metadata: { userId: session.userId, credits },
    }),
  });

  const data = (await res.json().catch(() => null)) as {
    status?: boolean;
    message?: string;
    data?: { authorization_url?: string; reference?: string };
  } | null;

  if (!res.ok || !data?.status || !data.data?.authorization_url) {
    const msg = data?.message?.trim();
    console.error("[paystack] initialize failed", res.status, msg);
    return NextResponse.json(
      { error: msg || "Failed to start checkout" },
      { status: 502 },
    );
  }

  return NextResponse.json({
    hostedUrl: data.data.authorization_url,
    reference: data.data.reference ?? reference,
  });
}
