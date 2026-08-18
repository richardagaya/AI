import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "image.civitai.com" },
      { protocol: "https", hostname: "assets.mixkit.co" },
    ],
    // Serve modern formats and keep optimised variants around so repeat
    // visits skip the optimizer entirely.
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default nextConfig;
