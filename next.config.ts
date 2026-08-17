import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Pin the trace root to this project; otherwise Next.js infers the root
  // from the nearest lockfile (a stray one exists in the user's home dir),
  // causing it to trace the entire home directory and OOM the build worker.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
