import { NextResponse } from "next/server";
import { buildSurprisePrompt, type SurpriseKind } from "@/lib/surprisePrompt";

export const dynamic = "force-dynamic";
export const maxDuration = 10;

export async function GET(req: Request) {
  const kind: SurpriseKind =
    new URL(req.url).searchParams.get("kind") === "video" ? "video" : "image";

  try {
    const prompt = await buildSurprisePrompt(kind);
    return NextResponse.json(
      { prompt },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Could not build a surprise prompt" },
      { status: 502 },
    );
  }
}
