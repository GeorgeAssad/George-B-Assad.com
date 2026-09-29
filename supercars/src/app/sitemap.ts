import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getRepositories } from "@/server/repositories";

/** Every public page: the storefront pages, the designer, one landing page per car, and the legal pages. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cars = await getRepositories().cars.listEntries();
  const abs = (path: string) => `${siteConfig.url}${path}`;
  const staticPaths = ["/", "/cars", "/shop", "/how-it-works", "/about", "/create", "/shipping", "/privacy", "/terms", "/legal", "/credits"];
  return [
    ...staticPaths.map((p) => ({ url: abs(p), changeFrequency: "monthly" as const, priority: p === "/" ? 1 : 0.6 })),
    ...cars.map((e) => ({ url: abs(`/cars/${e.generation.slug}`), changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
