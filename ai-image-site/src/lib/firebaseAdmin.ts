/**
 * Firebase Admin SDK — optional, only needed for the Coinbase webhook and
 * the background worker.  The main web-app routes use firestoreRest.ts instead.
 *
 * Initialisation is attempted lazily; callers receive null if credentials
 * are not configured rather than throwing at import time.
 */

import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let _initialized = false;
let _initError = "";

function tryInit(): boolean {
  if (_initialized) return true;
  if (getApps().length > 0) { _initialized = true; return true; }

  const sa = process.env.FIREBASE_SERVICE_ACCOUNT;
  try {
    if (sa) {
      initializeApp({ credential: cert(JSON.parse(sa)) });
    } else {
      // Falls back to Application Default Credentials (works on GCP, or when
      // GOOGLE_APPLICATION_CREDENTIALS is set to a service-account key file).
      initializeApp({ projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID });
    }
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

export function getAdminInitError(): string {
  return _initError;
}

// Convenience re-exports so callers can still use adminDb directly.
export { getFirestore as adminFirestore };
export { FieldValue, Timestamp } from "firebase-admin/firestore";
