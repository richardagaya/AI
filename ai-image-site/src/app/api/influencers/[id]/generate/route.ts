import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { getSession } from "@/lib/auth";
import { getAdminDb, getAdminInitError } from "@/lib/firebaseAdmin";
import { fsCreateJobTx, fsUpdate } from "@/lib/firestoreRest";
import { LOOK_MODEL, costFor } from "@/lib/fal-models";
import { prepareFalJob, submitFalJob, waitForFalJob } from "@/lib/fal";
import { publicWebhookUrl } from "@/lib/falWebhook";
import { jobFailedFields, jobSucceededFields } from "@/lib/jobResult";
import { isPromptDisallowed } from "@/lib/moderation";
import {
  LOOK_NEGATIVE_PROMPT,
  buildInfluencerPrompt,
  type InfluencerPhoto,
} from "@/lib/influencers";

export const maxDuration = 60;

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: Ctx) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!env.FAL_KEY) {
    return NextResponse.json(
      { error: "Generation is not configured yet." },
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

  const { id } = await ctx.params;
  const snap = await db.collection("influencers").doc(id).get();
  if (!snap.exists) {
    return NextResponse.json({ error: "Influencer not found." }, { status: 404 });
  }
  const data = snap.data() ?? {};
  if (data.userId !== session.userId) {
    return NextResponse.json({ error: "Influencer not found." }, { status: 404 });
  }

  const photos = (Array.isArray(data.photos) ? data.photos : []) as InfluencerPhoto[];
  const face = photos[0];
  if (!face?.url && !face?.path) {
    return NextResponse.json(
      { error: "This influencer needs a reference photo." },
      { status: 400 },
    );
  }

  const body = (await req.json().catch(() => ({}))) as {
    prompt?: string;
    extra?: string;
  };
  const userPrompt = String(body.prompt ?? body.extra ?? "").trim();
  if (!userPrompt) {
    return NextResponse.json(
      { error: "Describe what you want to generate." },
      { status: 400 },
    );
  }

  const prompt = buildInfluencerPrompt(userPrompt);
  if (prompt.length > 2000) {
    return NextResponse.json({ error: "Prompt is too long." }, { status: 400 });
  }
  if (isPromptDisallowed(prompt) || isPromptDisallowed(userPrompt)) {
    return NextResponse.json({ error: "Prompt not allowed" }, { status: 400 });
  }

  const aspect = "2:3";
  const costCredits = costFor(LOOK_MODEL, { withImage: true, aspect });

  const jobId = crypto.randomUUID();
  const now = new Date().toISOString();

  try {
    await fsCreateJobTx(
      session.userId,
      jobId,
      {
        userId: session.userId,
        influencerId: id,
        status: "pending",
        kind: "image",
        mode: "img2img",
        model: LOOK_MODEL.id,
        prompt: userPrompt,
        negativePrompt: null,
        aspect,
        duration: null,
        camera: null,
        strength: null,
        inputImagePath: face.path ?? null,
        inputImageUrl: face.url ?? null,
        outputImagePath: null,
        outputUrl: null,
        outputKind: null,
        falRequestId: null,
        costCredits,
        error: null,
        createdAt: now,
        updatedAt: now,
      },
      costCredits,
      session.token,
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "UNKNOWN";
    if (msg === "INSUFFICIENT_CREDITS") {
      return NextResponse.json(
        { error: "You're out of credits. Top up in the studio to keep generating." },
        { status: 402 },
      );
    }
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
  }

  const webhookUrl = publicWebhookUrl(req, jobId);

  try {
    const prepared = await prepareFalJob(LOOK_MODEL, {
      prompt,
      negativePrompt: LOOK_NEGATIVE_PROMPT,
      aspect,
      inputImagePath: face.path,
      inputImageUrl: face.url,
    });

    if (webhookUrl) {
      const { requestId } = await submitFalJob(
        prepared.endpoint,
        prepared.input,
        webhookUrl,
      );
      await fsUpdate(
        "jobs",
        jobId,
        {
          status: "running",
          falRequestId: requestId,
          updatedAt: new Date().toISOString(),
        },
        session.token,
      );
    } else {
      const output = await waitForFalJob(
        prepared.endpoint,
        prepared.input,
        prepared.kind,
      );
      await fsUpdate("jobs", jobId, await jobSucceededFields(output), session.token);
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Generation failed";
    await fsUpdate("jobs", jobId, jobFailedFields(message), session.token).catch(() => {});
    return NextResponse.json({ error: message }, { status: 502 });
  }

  return NextResponse.json({
    job: { id: jobId, status: webhookUrl ? "running" : "succeeded" },
    costCredits,
  });
}
