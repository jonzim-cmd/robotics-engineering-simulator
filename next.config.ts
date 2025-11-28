import type { NextConfig } from "next";

const repoName = "robotics-engineering-simulator";
const isProd = process.env.NODE_ENV === "production";
const isVercel = process.env.VERCEL === "1";
const basePath = isProd && !isVercel ? `/${repoName}` : "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
