import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getRepositories } from "@/server/repositories";

/** Structure is production-shaped; car and product pages are generated from the repositories. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const repos = getRepositories();
  const [cars, products] = await Promise.all([repos.cars.listEntries(), repos.products.listProducts()]);
  const abs = (path: string) => `${siteConfig.url}${path}`;
  const staticPaths = ["/", "/cars", "/shop", "/create", "/how-it-works", "/about", "/shipping", "/returns", "/privacy", "/terms", "/legal"];
  return [
    ...staticPaths.map((p) => ({ url: abs(p), changeFrequency: "monthly" as const, priority: p === "/" ? 1 : 0.6 })),
    ...cars.map((e) => ({ url: abs(`/cars/${e.generation.slug}`), changeFrequency: "monthly" as const, priority: 0.8 })),
    ...products.map((p) => ({ url: abs(`/products/${p.slug}`), changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
