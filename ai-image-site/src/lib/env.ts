import { z } from "zod";

const EnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  AUTH_SECRET: z.string().min(32),
  BASE_URL: z.string().url(),
  COMFYUI_URL: z.string().url().default("http://127.0.0.1:8188"),

  // Optional until you enable crypto top-ups
  COINBASE_COMMERCE_API_KEY: z.string().min(1).optional(),
  COINBASE_COMMERCE_WEBHOOK_SECRET: z.string().min(1).optional(),
});

export type Env = z.infer<typeof EnvSchema>;

export const env: Env = (() => {
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    // Avoid logging secrets; show which keys are wrong/missing.
    const flattened = parsed.error.flatten();
    const fields = Object.keys(flattened.fieldErrors);
    throw new Error(
      `Invalid environment variables: ${fields.length ? fields.join(", ") : "unknown error"}`,
    );
  }
  return parsed.data;
})();

