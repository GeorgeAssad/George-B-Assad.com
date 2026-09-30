import type { NextConfig } from "next";
import { securityHeaders } from "./src/config/security-headers";

const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // `next dev` would otherwise generate AGENTS.md/CLAUDE.md into the repo.
  agentRules: false,
  /** Old links (ads, bookmarks, search results) still land somewhere useful. */
  async redirects() {
    return [
      { source: "/products/:slug/customize", destination: "/create?product=:slug", permanent: true },
      { source: "/products/:slug", destination: "/shop", permanent: true },
      { source: "/returns", destination: "/shipping", permanent: true },
      { source: "/cart", destination: "/checkout", permanent: true },
    ];
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders(isDev) }];
  },
};

export default nextConfig;
