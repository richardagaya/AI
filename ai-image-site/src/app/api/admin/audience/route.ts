import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { audienceCsv, listSignupAudience } from "@/lib/audience";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const users = await listSignupAudience();
    const format = new URL(req.url).searchParams.get("format");
    if (format === "csv") {
      return new NextResponse(audienceCsv(users), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="minsuro-signups.csv"',
          "Cache-Control": "no-store",
        },
      });
    }
    return NextResponse.json(
      { count: users.length, users },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not load signups";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
