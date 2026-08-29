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

  // fal.ai API key (server-side only) — used by /api/generate and the fal webhook
  FAL_KEY: optionalSecret,

  // Cloudflare R2 object storage / CDN (server-side only).
  // When unset, generated files fall back to local disk storage.
  R2_ACCOUNT_ID: optionalSecret,
  R2_ACCESS_KEY_ID: optionalSecret,
  R2_SECRET_ACCESS_KEY: optionalSecret,
  R2_BUCKET: optionalSecret,
  // Public origin attached to the bucket, e.g. https://cdn.example.com
  R2_PUBLIC_BASE_URL: optionalUrl,

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

  // Paystack (card, bank, USSD). Secret key signs webhooks too.
  PAYSTACK_SECRET_KEY: optionalSecret,
  PAYSTACK_CURRENCY: z.preprocess(
    (v) =>
      typeof v === "string" && v.trim() !== ""
        ? v.trim().toUpperCase()
        : undefined,
    z.enum(["NGN", "USD", "GHS", "ZAR", "KES"]).optional(),
  ),

  // Transactional email (welcome mail on signup)
  RESEND_API_KEY: optionalSecret,
  MAIL_FROM: optionalSecret,
  // Protects /api/cron/welcome. Vercel Cron sends this as Bearer automatically
  // when the env var is named CRON_SECRET.
  CRON_SECRET: optionalSecret,
  // Protects /api/admin/audience. Falls back to CRON_SECRET if unset.
  ADMIN_SECRET: optionalSecret,
  // Comma-separated emails that can open Audience in the studio.
  ADMIN_EMAILS: optionalSecret,
});

export type Env = z.infer<typeof EnvSchema>;

/**
 * Next/Turbopack only inlines env vars that are referenced as
 * `process.env.SOME_NAME`. Passing the whole `process.env` object into Zod
 * leaves secrets like PAYSTACK_SECRET_KEY undefined at runtime.
 */
function rawEnv() {
  return {
    BASE_URL: process.env.BASE_URL,
    COMFYUI_URL: process.env.COMFYUI_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_STUDIO_URL: process.env.NEXT_PUBLIC_STUDIO_URL,
    NEXT_PUBLIC_LEARN_URL: process.env.NEXT_PUBLIC_LEARN_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    FAL_KEY: process.env.FAL_KEY,
    R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
    R2_BUCKET: process.env.R2_BUCKET,
    R2_PUBLIC_BASE_URL: process.env.R2_PUBLIC_BASE_URL,
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    FIREBASE_SERVICE_ACCOUNT: process.env.FIREBASE_SERVICE_ACCOUNT,
    PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY,
    PAYSTACK_CURRENCY: process.env.PAYSTACK_CURRENCY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    MAIL_FROM: process.env.MAIL_FROM,
    CRON_SECRET: process.env.CRON_SECRET,
    ADMIN_SECRET: process.env.ADMIN_SECRET,
    ADMIN_EMAILS: process.env.ADMIN_EMAILS,
  };
}

export function getEnv(): Env {
  const parsed = EnvSchema.safeParse(rawEnv());
  if (!parsed.success) {
    const fields = Object.keys(parsed.error.flatten().fieldErrors);
    throw new Error(
      `Invalid environment variables: ${fields.length ? fields.join(", ") : "unknown error"}`,
    );
  }
  return parsed.data;
}

/** Reads env on every property access so .env.local edits are not frozen at boot. */
export const env: Env = new Proxy({} as Env, {
  get(_target, prop: string) {
    return getEnv()[prop as keyof Env];
  },
});
