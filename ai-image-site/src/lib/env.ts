import { z } from "zod";

/** Treats a blank value (e.g. `FAL_KEY=` placeholder) the same as unset. */
const optionalSecret = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
  z.string().min(1).optional(),
);

/** Blank or unset both mean "not configured". */
const optionalUrl = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
  z.string().url().optional(),
);

const EnvSchema = z.object({
  BASE_URL: z.string().url(),
  COMFYUI_URL: z.string().url().default("http://127.0.0.1:8188"),

  // Public origin of each surface. Leave unset for single-origin local dev,
  // where /, /studio and /learn are served from one host. See src/lib/site.ts.
  NEXT_PUBLIC_SITE_URL: optionalUrl,
  NEXT_PUBLIC_STUDIO_URL: optionalUrl,
  NEXT_PUBLIC_LEARN_URL: optionalUrl,
  NEXT_PUBLIC_API_URL: optionalUrl,

  // fal.ai API key (server-side only) — used by the generation worker
  FAL_KEY: optionalSecret,

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
  FIREBASE_SERVICE_ACCOUNT: optionalSecret,

  // Optional Coinbase Commerce
  COINBASE_COMMERCE_API_KEY: optionalSecret,
  COINBASE_COMMERCE_WEBHOOK_SECRET: optionalSecret,
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
