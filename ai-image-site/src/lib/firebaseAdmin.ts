/**
 * Firebase Admin SDK — optional, only needed for the Paystack webhook and
 * the fal.ai result webhook. The main web-app routes use firestoreRest.ts instead.
 *
 * Initialisation is attempted lazily; callers receive null if credentials
 * are not configured rather than throwing at import time.
 */

import { cert, getApps, initializeApp, type ServiceAccount } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let _initialized = false;
let _initError = "";

function parseServiceAccount(raw: string): ServiceAccount {
  const stripped =
    (raw.startsWith("'") && raw.endsWith("'")) ||
    (raw.startsWith('"') && raw.endsWith('"'))
      ? raw.slice(1, -1)
      : raw;
  return JSON.parse(stripped) as ServiceAccount;
}

function tryInit(): boolean {
  if (_initialized) return true;
  if (getApps().length > 0) {
    _initialized = true;
    return true;
  }

  const sa = process.env.FIREBASE_SERVICE_ACCOUNT?.trim();
  if (!sa) {
    _initError = "FIREBASE_SERVICE_ACCOUNT is not set";
    return false;
  }

  try {
    initializeApp({
      credential: cert(parseServiceAccount(sa)),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
    _initialized = true;
    return true;
  } catch (e) {
    _initError = e instanceof Error ? e.message : String(e);
    return false;
  }
}

export function getAdminDb(): Firestore | null {
  return tryInit() ? getFirestore() : null;
}

export function getAdminAuth(): Auth | null {
  return tryInit() ? getAuth() : null;
}

export function getAdminInitError(): string {
  return _initError;
}

// Convenience re-exports so callers can still use adminDb directly.
export { getFirestore as adminFirestore };
export { FieldValue, Timestamp } from "firebase-admin/firestore";
