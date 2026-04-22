import { z } from "zod";

const EnvSchema = z.object({
  BASE_URL: z.string().url(),
  COMFYUI_URL: z.string().url().default("http://127.0.0.1:8188"),

  // Firebase (public — safe to expose in browser bundles)
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1),

  // Firebase Admin — provide ONE of these for server-side access:
  //   FIREBASE_SERVICE_ACCOUNT  – JSON string of the service account key file
  // If neither is present the Admin SDK uses Application Default Credentials.
  FIREBASE_SERVICE_ACCOUNT: z.string().optional(),

  // Optional Coinbase Commerce
  COINBASE_COMMERCE_API_KEY: z.string().min(1).optional(),
  COINBASE_COMMERCE_WEBHOOK_SECRET: z.string().min(1).optional(),
});

export type Env = z.infer<typeof EnvSchema>;

export const env: Env = (() => {
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const fields = Object.keys(parsed.error.flatten().fieldErrors);
    throw new Error(
      `Invalid environment variables: ${fields.length ? fields.join(", ") : "unknown error"}`,
    );
  }
  return parsed.data;
})();
