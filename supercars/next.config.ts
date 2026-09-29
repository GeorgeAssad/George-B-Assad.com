import type { NextConfig } from "next";
import { securityHeaders } from "./src/config/security-headers";

const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // `next dev` would otherwise generate AGENTS.md/CLAUDE.md into the repo.
  agentRules: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders(isDev) }];
  },
};

export default nextConfig;
