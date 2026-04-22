import { createRemoteJWKSet, jwtVerify } from "jose";

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!;

// Firebase ID tokens are RS256 JWTs signed by Google.
// Public keys are fetched once and cached automatically by jose.
const FIREBASE_JWKS = createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com",
  ),
);

export type Session = {
  userId: string;
  email: string;
  /** Raw Firebase ID token — used to call Firestore REST API on behalf of this user. */
  token: string;
};

export async function getSession(req: Request): Promise<Session | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  try {
    const { payload } = await jwtVerify(token, FIREBASE_JWKS, {
      issuer: `https://securetoken.google.com/${PROJECT_ID}`,
      audience: PROJECT_ID,
    });
    const userId = payload.sub;
    if (!userId) return null;
    return { userId, email: (payload["email"] as string) ?? "", token };
  } catch {
    return null;
  }
}
