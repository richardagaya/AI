/**
 * Firestore access for App Router handlers.
 *
 * Reads use the caller's Firebase ID token so security rules still apply.
 * Job creation and other privileged writes prefer the Admin SDK (bypasses
 * rules) because clients must not be able to mint jobs or decrement credits.
 */
import { FieldValue, getAdminDb, getAdminInitError } from "@/lib/firebaseAdmin";

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!;
const FS_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

// ─── Value serialisation ──────────────────────────────────────────────────────

type FsValue =
  | { stringValue: string }
  | { integerValue: string }
  | { doubleValue: number }
  | { booleanValue: boolean }
  | { nullValue: null }
  | { timestampValue: string }
  | { mapValue: { fields: Record<string, FsValue> } }
  | { arrayValue: { values?: FsValue[] } };

function toFsValue(val: unknown): FsValue {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === "string") return { stringValue: val };
  if (typeof val === "number")
    return Number.isInteger(val)
      ? { integerValue: String(val) }
      : { doubleValue: val };
  if (typeof val === "boolean") return { booleanValue: val };
  if (val instanceof Date) return { timestampValue: val.toISOString() };
  if (Array.isArray(val)) return { arrayValue: { values: val.map(toFsValue) } };
  if (typeof val === "object") {
    return {
      mapValue: {
        fields: Object.fromEntries(
          Object.entries(val as Record<string, unknown>).map(([k, v]) => [k, toFsValue(v)]),
        ),
      },
    };
  }
  return { nullValue: null };
}

function fromFsValue(v: unknown): unknown {
  if (!v || typeof v !== "object") return null;
  const fv = v as Record<string, unknown>;
  if ("stringValue" in fv) return fv.stringValue;
  if ("integerValue" in fv) return Number(fv.integerValue);
  if ("doubleValue" in fv) return fv.doubleValue;
  if ("booleanValue" in fv) return fv.booleanValue;
  if ("nullValue" in fv) return null;
  if ("timestampValue" in fv) return fv.timestampValue as string;
  if ("mapValue" in fv) {
    const map = fv.mapValue as { fields?: Record<string, unknown> };
    return fieldsToObj(map.fields ?? {});
  }
  if ("arrayValue" in fv) {
    const arr = fv.arrayValue as { values?: unknown[] };
    return (arr.values ?? []).map(fromFsValue);
  }
  return null;
}

function fieldsToObj(fields: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, fromFsValue(v)]));
}

function objToFields(obj: Record<string, unknown>): Record<string, FsValue> {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, toFsValue(v)]));
}

// ─── HTTP helper ─────────────────────────────────────────────────────────────

async function fsReq(url: string, method: string, token: string, body?: unknown): Promise<unknown> {
  const res = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Firestore ${res.status}: ${txt.slice(0, 300)}`);
  }
  return res.json();
}

// ─── Public helpers ───────────────────────────────────────────────────────────

export type FsDoc = { exists: boolean; data: Record<string, unknown> };

export async function fsGet(collection: string, id: string, token: string): Promise<FsDoc> {
  const result = (await fsReq(
    `${FS_BASE}/${collection}/${id}`,
    "GET",
    token,
  )) as { fields?: Record<string, unknown> } | null;
  if (!result) return { exists: false, data: {} };
  return { exists: true, data: fieldsToObj(result.fields ?? {}) };
}

export async function fsSet(
  collection: string,
  id: string,
  data: Record<string, unknown>,
  token: string,
): Promise<void> {
  await fsReq(`${FS_BASE}/${collection}/${id}`, "PATCH", token, {
    fields: objToFields(data),
  });
}

export async function fsUpdate(
  collection: string,
  id: string,
  data: Record<string, unknown>,
  token: string,
): Promise<void> {
  const adminDb = getAdminDb();
  if (adminDb) {
    await adminDb.collection(collection).doc(id).set(data, { merge: true });
    return;
  }
  const mask = Object.keys(data)
    .map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`)
    .join("&");
  await fsReq(`${FS_BASE}/${collection}/${id}?${mask}`, "PATCH", token, {
    fields: objToFields(data),
  });
}

/** Query a collection, filter by a single field, sort in memory, return up to `limit` docs. */
export async function fsQuery(
  collection: string,
  filterField: string,
  filterValue: unknown,
  orderByField: string,
  orderDir: "asc" | "desc",
  limit: number,
  token: string,
): Promise<Array<{ id: string; data: Record<string, unknown> }>> {
  const body = {
    structuredQuery: {
      from: [{ collectionId: collection }],
      where: {
        fieldFilter: {
          field: { fieldPath: filterField },
          op: "EQUAL",
          value: toFsValue(filterValue),
        },
      },
      // Fetch more than needed so we can sort in memory without a composite index
      limit: limit * 10,
    },
  };

  const results = (await fsReq(`${FS_BASE}:runQuery`, "POST", token, body)) as Array<{
    document?: { name: string; fields?: Record<string, unknown> };
  }>;

  const docs = (results ?? [])
    .filter((r) => r.document)
    .map((r) => ({
      id: r.document!.name.split("/").pop()!,
      data: fieldsToObj(r.document!.fields ?? {}),
    }));

  // Sort in memory (avoids composite index requirement)
  docs.sort((a, b) => {
    const av = String(a.data[orderByField] ?? "");
    const bv = String(b.data[orderByField] ?? "");
    return orderDir === "desc" ? bv.localeCompare(av) : av.localeCompare(bv);
  });

  return docs.slice(0, limit);
}

/**
 * Atomic job creation:
 *   1. Read user's creditBalance inside a Firestore transaction
 *   2. Verify sufficient balance
 *   3. Write the new job document
 *   4. Decrement creditBalance
 */
export async function fsCreateJobsTx(
  userId: string,
  jobs: Array<{
    id: string;
    data: Record<string, unknown>;
    costCredits: number;
  }>,
  _token: string,
): Promise<void> {
  const adminDb = getAdminDb();
  if (!adminDb) {
    throw new Error(
      `Firebase Admin is not configured (${getAdminInitError() || "unknown"}). Set FIREBASE_SERVICE_ACCOUNT.`,
    );
  }
  const total = jobs.reduce((sum, job) => sum + job.costCredits, 0);

  await adminDb.runTransaction(async (tx) => {
    const userRef = adminDb.collection("users").doc(userId);
    const userSnap = await tx.get(userRef);
    if (!userSnap.exists) throw new Error("USER_NOT_FOUND");
    const balance = Number(userSnap.data()?.creditBalance ?? 0);
    if (balance < total) throw new Error("INSUFFICIENT_CREDITS");
    for (const job of jobs) {
      tx.set(adminDb.collection("jobs").doc(job.id), job.data);
    }
    tx.update(userRef, {
      creditBalance: FieldValue.increment(-total),
    });
  });
}

export async function fsCreateJobTx(
  userId: string,
  jobId: string,
  jobData: Record<string, unknown>,
  costCredits: number,
  token: string,
): Promise<void> {
  await fsCreateJobsTx(userId, [{ id: jobId, data: jobData, costCredits }], token);
}
