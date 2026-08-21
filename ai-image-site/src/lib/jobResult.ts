import { persistRemoteFile } from "@/lib/storage";
import { parseFalPayload, type FalOutput } from "@/lib/fal";

export type JobResultFields = {
  status: "succeeded" | "failed";
  outputImagePath: string | null;
  outputUrl: string | null;
  outputKind: "image" | "video" | null;
  error: string | null;
  updatedAt: string;
};

export function jobFailedFields(message: string): JobResultFields {
  return {
    status: "failed",
    outputImagePath: null,
    outputUrl: null,
    outputKind: null,
    error: message.slice(0, 1000),
    updatedAt: new Date().toISOString(),
  };
}

export async function jobSucceededFields(output: FalOutput): Promise<JobResultFields> {
  const saved = await persistRemoteFile(output.url, output.kind, output.contentType);
  return {
    status: "succeeded",
    outputImagePath: saved.outputImagePath,
    outputUrl: saved.outputUrl,
    outputKind: output.kind,
    error: null,
    updatedAt: new Date().toISOString(),
  };
}

export function outputFromWebhookPayload(
  kind: "image" | "video",
  payload: Record<string, unknown> | null,
): FalOutput {
  return parseFalPayload(kind, payload);
}
