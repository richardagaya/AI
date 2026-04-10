import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createSessionCookie, hashPassword } from "@/lib/auth";

const BodySchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(8).max(200),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const passwordHash = await hashPassword(parsed.data.password);

  try {
    const user = await prisma.user.create({
      data: { email, passwordHash },
      select: { id: true, email: true, creditBalance: true },
    });
    await createSessionCookie({ sub: user.id, email: user.email });
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }
}

