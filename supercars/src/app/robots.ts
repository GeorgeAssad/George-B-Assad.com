import type { MetadataRoute } from "next";
import { allowIndexing, siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  if (!allowIndexing) {
    // Prototype: keep the whole site out of search results.
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/checkout", "/order/", "/track"] }],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
