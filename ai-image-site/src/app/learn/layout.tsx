import type { Metadata } from "next";
import { LearnFooter } from "@/components/learn/learn-footer";
import { LearnNav } from "@/components/learn/learn-nav";
import { LEARN_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(LEARN_URL),
  title: {
    default: "minsuro learn — prompting lessons",
    template: "%s — minsuro learn",
  },
  description:
    "Short, practical lessons on prompting the minsuro studio: prompt structure, negative prompts, model choice, framing and image-to-image.",
};

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-clip">
      <div className="grain" aria-hidden="true" />
      <LearnNav />
      <main className="flex-1">{children}</main>
      <LearnFooter />
    </div>
  );
}
