import { NextResponse } from "next/server";
import { getAdminDb, getAdminInitError, Timestamp } from "@/lib/firebaseAdmin";
import { verifyFalWebhook } from "@/lib/falWebhook";
import { jobFailedFields, jobSucceededFields, outputFromWebhookPayload } from "@/lib/jobResult";

export const maxDuration = 60;

type FalWebhookBody = {
  request_id?: string;
  status?: string;
  error?: string;
  payload?: Record<string, unknown> | null;
  payload_error?: string;
};

export async function POST(req: Request) {
  const rawBody = Buffer.from(await req.arrayBuffer());

  let ok = false;
  try {
    ok = await verifyFalWebhook(req, rawBody);
  } catch (e) {
    console.error("[fal webhook] signature check failed", e);
    return NextResponse.json({ error: "Signature check failed" }, { status: 401 });
  }
  if (!ok) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const adminDb = getAdminDb();
  if (!adminDb) {
    return NextResponse.json(
      { error: `Firebase Admin not configured: ${getAdminInitError()}` },
      { status: 501 },
    );
  }

  let body: FalWebhookBody;
  try {
    body = JSON.parse(rawBody.toString("utf8")) as FalWebhookBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const requestId = body.request_id;
  const jobId = new URL(req.url).searchParams.get("jobId");

  const jobRef = jobId
    ? adminDb.collection("jobs").doc(jobId)
    : null;

  let snap = jobRef ? await jobRef.get() : null;
  if (!snap?.exists && requestId) {
    const q = await adminDb
      .collection("jobs")
      .where("falRequestId", "==", requestId)
      .limit(1)
      .get();
    snap = q.empty ? null : q.docs[0];
  }

  if (!snap?.exists) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const ref = snap.ref;
  const data = snap.data() ?? {};
  const storedRequestId = data.falRequestId as string | null | undefined;
  if (storedRequestId && requestId && storedRequestId !== requestId) {
    return NextResponse.json({ error: "Request id mismatch" }, { status: 400 });
  }

  if (data.status === "succeeded" || data.status === "failed") {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const kind: "image" | "video" =
    data.outputKind === "video" || data.kind === "video" ? "video" : "image";

  if (body.status !== "OK") {
    const message =
      body.error ||
      body.payload_error ||
      "Generation timed out. Try again in a moment.";
    await ref.update({
      ...jobFailedFields(message),
      updatedAt: Timestamp.now(),
    });
    return NextResponse.json({ ok: true });
  }

  try {
    const output = outputFromWebhookPayload(kind, body.payload ?? null);
    const fields = await jobSucceededFields(output);
    await ref.update({
      ...fields,
      falRequestId: requestId ?? storedRequestId ?? null,
      updatedAt: Timestamp.now(),
    });
  } catch (e) {
    // Don't mark the job failed — fal will retry the webhook.
    const message = e instanceof Error ? e.message : "Failed to store output";
    console.error("[fal webhook] persist failed", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
