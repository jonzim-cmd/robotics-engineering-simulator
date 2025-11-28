import type { NextConfig } from "next";

const repoName = "robotics-engineering-simulator";
const isProd = process.env.NODE_ENV === "production";
const isVercel = process.env.VERCEL === "1";
const basePath = isProd && !isVercel ? `/${repoName}` : "";

// We only use static export for GitHub Pages (production build outside Vercel).
// Vercel needs the default output to support server actions + edge runtimes.
const nextConfig: NextConfig = {
  ...(isVercel ? {} : { output: "export" }),
  basePath,
  assetPrefix: basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
