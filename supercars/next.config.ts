import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // `next dev` would otherwise generate AGENTS.md/CLAUDE.md into the repo.
  agentRules: false,
};

export default nextConfig;
