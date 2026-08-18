import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Instrument_Serif, Geist_Mono } from "next/font/google";
import "./globals.css";

const space = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  display: "swap",
});

const serif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const mono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "minsuro — uncensored AI image studio",
  description:
    "Minsuro renders anime, fantasy and mature AI art in about thirty seconds. No content filters, no moderation queue, crypto checkout.",
  openGraph: {
    title: "minsuro — uncensored AI image studio",
    description:
      "Imagine it, minsuro renders it. Anime, fantasy and mature AI art in about thirty seconds.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#07070a",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${space.variable} ${serif.variable} ${mono.variable}`}
    >
      <head>
        {/* Warm up the TLS handshake to the media CDNs before the first request */}
        <link rel="preconnect" href="https://assets.mixkit.co" crossOrigin="" />
        <link rel="preconnect" href="https://image.civitai.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://assets.mixkit.co" />
        <link rel="dns-prefetch" href="https://image.civitai.com" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
