// Re-export the Firestore REST helpers as the canonical DB layer.
// No Admin SDK or service-account credentials required.
export { fsGet, fsSet, fsUpdate, fsQuery, fsCreateJobTx } from "@/lib/firestoreRest";
