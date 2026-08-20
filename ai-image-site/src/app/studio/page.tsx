import type { Metadata } from "next";
import AppClient from "./AppClient";
import type { AuthMode } from "@/components/auth/auth-dialog";

export const metadata: Metadata = {
  title: "Studio — minsuro",
  description: "Generate, enhance and manage your renders.",
  robots: { index: false, follow: false },
};

export default async function StudioPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; reference?: string; trxref?: string }>;
}) {
  const { mode, reference, trxref } = await searchParams;
  const initialAuthMode: AuthMode | null =
    mode === "login" || mode === "signup" ? mode : null;

  return (
    <AppClient
      initialAuthMode={initialAuthMode}
      paymentReference={reference || trxref || null}
    />
  );
}
