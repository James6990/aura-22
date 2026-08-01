import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true, // Prevents Next.js from requiring native 'sharp' binary
  },
};

export default nextConfig;

