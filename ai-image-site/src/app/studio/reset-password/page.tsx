import type { Metadata } from "next";
import { ResetPasswordPage } from "@/components/auth/reset-password-page";

export const metadata: Metadata = {
  title: "Reset password — minsuro",
  description: "Choose a new password for your minsuro studio account.",
  robots: { index: false, follow: false },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ oobCode?: string; mode?: string }>;
}) {
  const { oobCode, mode } = await searchParams;
  return (
    <ResetPasswordPage
      oobCode={oobCode ?? null}
      mode={mode ?? null}
    />
  );
}
