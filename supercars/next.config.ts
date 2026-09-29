import type { NextConfig } from "next";
import { securityHeaders } from "./src/config/security-headers";

const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // `next dev` would otherwise generate AGENTS.md/CLAUDE.md into the repo.
  agentRules: false,
  /**
   * Pages folded into the order flow. Old links (ads, bookmarks, search results) still land somewhere useful:
   * shopping, browsing cars and picking a finish all happen inside the designer.
   */
  async redirects() {
    return [
      { source: "/shop", destination: "/create", permanent: true },
      { source: "/cars", destination: "/create", permanent: true },
      { source: "/products/:slug/customize", destination: "/create?product=:slug", permanent: true },
      { source: "/products/:slug", destination: "/create?product=:slug", permanent: true },
      { source: "/how-it-works", destination: "/", permanent: true },
      { source: "/about", destination: "/", permanent: true },
      { source: "/returns", destination: "/shipping", permanent: true },
      { source: "/cart", destination: "/checkout", permanent: true },
    ];
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders(isDev) }];
  },
};

export default nextConfig;
