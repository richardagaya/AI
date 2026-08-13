import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "image.civitai.com" },
      { protocol: "https", hostname: "assets.mixkit.co" },
    ],
  },
};

export default nextConfig;
