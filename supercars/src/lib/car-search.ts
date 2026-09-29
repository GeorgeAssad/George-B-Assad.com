import type { BodyType, Brand, CarEntry, PerformanceCategory } from "@/domain/catalog";

/* Pure search/filter logic for the car explorer — no React, easy to test, and
 * replaceable by a server/database query later without touching the UI. */

export interface CarFilters {
  readonly q: string;
  readonly brand: string | null;
  readonly model: string | null;
  readonly generation: string | null;
  readonly body: readonly BodyType[];
  readonly performance: readonly PerformanceCategory[];
}

export const EMPTY_FILTERS: CarFilters = { q: "", brand: null, model: null, generation: null, body: [], performance: [] };

const norm = (s: string): string =>
  s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/** Every token in the query must appear somewhere in the car's searchable text ("bmw m3" → BMW M3 G80). */
export function matchesQuery(entry: CarEntry, query: string): boolean {
  const tokens = norm(query).split(" ").filter(Boolean);
  if (tokens.length === 0) return true;
  const haystack = norm(
    [entry.brand.name, entry.car.name, entry.generation.generation, entry.generation.displayName, entry.generation.bodyType, entry.generation.performance, entry.generation.specs.years].join(" "),
  );
  const compact = haystack.replace(/ /g, "");
  return tokens.every((t) => haystack.includes(t) || compact.includes(t));
}

export function filterCars(entries: readonly CarEntry[], f: CarFilters): CarEntry[] {
  return entries.filter(
    (e) =>
      matchesQuery(e, f.q) &&
      (!f.brand || e.brand.id === f.brand) &&
      (!f.model || e.car.id === f.model) &&
      (!f.generation || e.generation.id === f.generation) &&
      (f.body.length === 0 || f.body.includes(e.generation.bodyType)) &&
      (f.performance.length === 0 || f.performance.includes(e.generation.performance)),
  );
}

export interface Facets {
  readonly brands: readonly { brand: Brand; count: number }[];
  readonly models: readonly { id: string; name: string; count: number }[];
  readonly generations: readonly { id: string; label: string }[];
  readonly bodies: readonly { value: BodyType; count: number }[];
  readonly performances: readonly { value: PerformanceCategory; count: number }[];
}

const countBy = <T, K>(items: readonly T[], key: (t: T) => K): Map<K, number> => {
  const m = new Map<K, number>();
  for (const i of items) m.set(key(i), (m.get(key(i)) ?? 0) + 1);
  return m;
};

/** Facet options. Brand/body/performance counts reflect the OTHER active filters so users never hit dead ends. */
export function computeFacets(entries: readonly CarEntry[], brands: readonly Brand[], f: CarFilters): Facets {
  const base = (omit: "brand" | "body" | "performance") =>
    filterCars(entries, { ...f, model: null, generation: null, brand: omit === "brand" ? null : f.brand, body: omit === "body" ? [] : f.body, performance: omit === "performance" ? [] : f.performance });

  const brandCounts = countBy(base("brand"), (e) => e.brand.id);
  const bodyCounts = countBy(base("body"), (e) => e.generation.bodyType);
  const perfCounts = countBy(base("performance"), (e) => e.generation.performance);

  const inBrand = f.brand ? entries.filter((e) => e.brand.id === f.brand) : [];
  const modelMap = new Map<string, { id: string; name: string; count: number }>();
  for (const e of inBrand) {
    const cur = modelMap.get(e.car.id);
    modelMap.set(e.car.id, { id: e.car.id, name: e.car.name, count: (cur?.count ?? 0) + 1 });
  }
  const generations = f.model ? entries.filter((e) => e.car.id === f.model).map((e) => ({ id: e.generation.id, label: e.generation.generation })) : [];

  return {
    brands: brands.map((brand) => ({ brand, count: brandCounts.get(brand.id) ?? 0 })),
    models: [...modelMap.values()],
    generations,
    bodies: [...bodyCounts].map(([value, count]) => ({ value, count })).sort((a, b) => b.count - a.count),
    performances: [...perfCounts].map(([value, count]) => ({ value, count })).sort((a, b) => b.count - a.count),
  };
}

/* -------- URL <-> filters (kept small and defensive: the URL is untrusted input) -------- */

const BODY: readonly BodyType[] = ["sedan", "coupe", "wagon", "gt", "supercar", "fastback"];
const PERF: readonly PerformanceCategory[] = ["Track weapon", "Grand tourer", "Daily performance", "Icon", "Supercar"];
const slug = (v: string | null): string | null => (v && /^[a-z0-9-]{1,60}$/.test(v) ? v : null);

export function filtersFromParams(params: URLSearchParams): CarFilters {
  return {
    q: (params.get("q") ?? "").slice(0, 60),
    brand: slug(params.get("brand")),
    model: slug(params.get("model")),
    generation: slug(params.get("gen")),
    body: (params.get("body") ?? "").split(",").filter((b): b is BodyType => (BODY as readonly string[]).includes(b)),
    performance: (params.get("perf") ?? "").split(",").filter((p): p is PerformanceCategory => (PERF as readonly string[]).includes(p)),
  };
}

export function filtersToParams(f: CarFilters): URLSearchParams {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (f.brand) p.set("brand", f.brand);
  if (f.model) p.set("model", f.model);
  if (f.generation) p.set("gen", f.generation);
  if (f.body.length) p.set("body", f.body.join(","));
  if (f.performance.length) p.set("perf", f.performance.join(","));
  return p;
}

export const hasActiveFilters = (f: CarFilters): boolean =>
  Boolean(f.q || f.brand || f.model || f.generation || f.body.length || f.performance.length);
