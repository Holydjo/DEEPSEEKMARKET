import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  devIndicators: false,
  experimental: {
    serverActions: {
      // Provider photos are uploaded through a server action.
      bodySizeLimit: "12mb",
    },
  },
};

export default nextConfig;
