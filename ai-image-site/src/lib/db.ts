// Re-export Firestore helpers. Privileged writes use Admin when configured.
export { fsGet, fsSet, fsUpdate, fsQuery, fsCreateJobTx } from "@/lib/firestoreRest";
