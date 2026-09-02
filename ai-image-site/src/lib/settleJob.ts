/**
 * If a job is still "running" after fal finished (webhook missed), pull the
 * result from the queue and persist it. Safe to call from the jobs list poll.
 */
import { getAdminDb } from "@/lib/firebaseAdmin";
import { getFalQueueResult, getFalQueueStatus } from "@/lib/fal";
import { getModel } from "@/lib/fal-models";
import { jobFailedFields, jobSucceededFields } from "@/lib/jobResult";

export async function settleRunningJob(
  jobId: string,
  data: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const status = String(data.status ?? "");
  const requestId = typeof data.falRequestId === "string" ? data.falRequestId : "";
  if ((status !== "running" && status !== "pending") || !requestId) return data;

  const adminDb = getAdminDb();
  if (!adminDb) return data;

  const model = getModel(String(data.model ?? ""));
  if (!model) return data;

  const withImage = Boolean(data.inputImageUrl || data.inputImagePath);
  const endpoint =
    withImage && model.endpoints.image ? model.endpoints.image : model.endpoints.text;
  const kind: "image" | "video" = data.kind === "video" ? "video" : "image";

  try {
    const queueStatus = await getFalQueueStatus(endpoint, requestId);
    if (queueStatus === "IN_QUEUE" || queueStatus === "IN_PROGRESS") return data;

    const fields =
      queueStatus === "COMPLETED"
        ? await jobSucceededFields(await getFalQueueResult(endpoint, requestId, kind))
        : jobFailedFields("Generation timed out. Try again in a moment.");

    await adminDb.collection("jobs").doc(jobId).set(fields, { merge: true });
    return { ...data, ...fields };
  } catch (e) {
    console.error("[settle] failed", jobId, e instanceof Error ? e.message : e);
    return data;
  }
}
