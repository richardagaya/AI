import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordPage } from "@/components/auth/reset-password-page";
import { StudioSplash } from "@/components/auth/studio-gate";

export const metadata: Metadata = {
  title: "Reset password — minsuro",
  description: "Choose a new password for your minsuro studio account.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <Suspense fallback={<StudioSplash />}>
      <ResetPasswordPage />
    </Suspense>
  );
}
