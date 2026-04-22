import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import { getSession } from "@/lib/auth";

const BodySchema = z.object({
  credits: z.number().int().min(10).max(100000),
});

const USD_PER_CREDIT = 0.05;

export async function POST(req: Request) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!env.COINBASE_COMMERCE_API_KEY) {
    return NextResponse.json(
      { error: "Crypto payments not configured" },
      { status: 501 },
    );
  }

  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const credits = parsed.data.credits;
  const amountUSD = Math.round(credits * USD_PER_CREDIT * 100) / 100;

  const res = await fetch("https://api.commerce.coinbase.com/charges", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-CC-Api-Key": env.COINBASE_COMMERCE_API_KEY,
      "X-CC-Version": "2018-03-22",
    },
    body: JSON.stringify({
      name: `${credits} credits`,
      description: "AI image generation credits",
      pricing_type: "fixed_price",
      local_price: { amount: amountUSD.toFixed(2), currency: "USD" },
      metadata: { userId: session.userId, credits },
      redirect_url: `${env.BASE_URL}/`,
      cancel_url: `${env.BASE_URL}/`,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return NextResponse.json(
      { error: "Failed to create charge", details: text.slice(0, 500) },
      { status: 502 },
    );
  }

  const data = (await res.json()) as Record<string, unknown>;
  const chargeData = (data?.data as Record<string, unknown>) ?? {};
  const hostedUrl = chargeData?.hosted_url;
  const chargeId = chargeData?.id;
  if (!hostedUrl || !chargeId) {
    return NextResponse.json({ error: "Unexpected response from provider" }, { status: 502 });
  }

  return NextResponse.json({ hostedUrl, chargeId });
}
