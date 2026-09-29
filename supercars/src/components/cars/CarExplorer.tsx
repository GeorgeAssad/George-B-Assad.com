"use client";

import { useEffect, useMemo, useState } from "react";
import type { BodyType, Brand, CarEntry, PerformanceCategory } from "@/domain/catalog";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconClose, IconSearch } from "@/components/ui/icons";
import { track } from "@/lib/analytics";
import { EMPTY_FILTERS, computeFacets, filterCars, filtersFromParams, filtersToParams, hasActiveFilters, type CarFilters } from "@/lib/car-search";
import { replaceSearch, useUrlSearch } from "@/lib/url-search-store";
import { CarTile } from "./CarTile";
import { FilterChip } from "./FilterChip";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div role="group" aria-label={label}>
      <p className="spec mb-2.5">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export function CarExplorer({ entries, brands }: { entries: readonly CarEntry[]; brands: readonly Brand[] }) {
  // The URL query string is the single source of truth for filters (shareable, back-button friendly).
  const search = useUrlSearch();
  const filters = useMemo(() => filtersFromParams(new URLSearchParams(search)), [search]);
  const [refineOpen, setRefineOpen] = useState(false);
  const setFilters = (next: CarFilters) => replaceSearch(filtersToParams(next).toString());

  const results = useMemo(() => filterCars(entries, filters), [entries, filters]);
  const facets = useMemo(() => computeFacets(entries, brands, filters), [entries, brands, filters]);

  // Debounced, PII-free analytics: only the query length and result count are reported.
  useEffect(() => {
    if (!filters.q) return;
    const t = window.setTimeout(() => track("car_search", { queryLength: filters.q.length, results: results.length }), 700);
    return () => window.clearTimeout(t);
  }, [filters.q, results.length]);

  const set = (patch: Partial<CarFilters>) => setFilters({ ...filters, ...patch });
  const toggle = <T,>(list: readonly T[], v: T): T[] => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const active = hasActiveFilters(filters);
  const refineCount = filters.body.length + filters.performance.length;

  return (
    <div>
      <form role="search" onSubmit={(e) => e.preventDefault()} className="relative">
        <label htmlFor="car-search" className="sr-only">Search cars by brand, model or generation</label>
        <IconSearch className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-muted" size={22} />
        <input
          id="car-search"
          type="search"
          inputMode="search"
          autoComplete="off"
          spellCheck={false}
          maxLength={60}
          value={filters.q}
          onChange={(e) => set({ q: e.target.value })}
          placeholder="Search “M3”, “992”, “GT-R”"
          className="field h-14 rounded-full pl-14 pr-14 text-base sm:text-lg"
        />
        {filters.q && (
          <button type="button" onClick={() => set({ q: "" })} className="absolute right-4 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:text-fg" aria-label="Clear search">
            <IconClose size={18} />
          </button>
        )}
      </form>

      <div className="mt-6 space-y-5">
        <Group label="Popular manufacturers">
          <FilterChip pressed={!filters.brand} onClick={() => set({ brand: null, model: null, generation: null })}>All</FilterChip>
          {facets.brands.map(({ brand, count }) => (
            <FilterChip key={brand.id} pressed={filters.brand === brand.id} count={count} disabled={count === 0 && filters.brand !== brand.id} onClick={() => set({ brand: filters.brand === brand.id ? null : brand.id, model: null, generation: null })}>
              {brand.name}
            </FilterChip>
          ))}
        </Group>

        {filters.brand && facets.models.length > 0 && (
          <Group label="Model">
            <FilterChip pressed={!filters.model} onClick={() => set({ model: null, generation: null })}>All models</FilterChip>
            {facets.models.map((m) => (
              <FilterChip key={m.id} pressed={filters.model === m.id} onClick={() => set({ model: filters.model === m.id ? null : m.id, generation: null })}>{m.name}</FilterChip>
            ))}
          </Group>
        )}

        {filters.model && facets.generations.length > 0 && (
          <Group label="Generation">
            <FilterChip pressed={!filters.generation} onClick={() => set({ generation: null })}>All</FilterChip>
            {facets.generations.map((g) => (
              <FilterChip key={g.id} pressed={filters.generation === g.id} onClick={() => set({ generation: filters.generation === g.id ? null : g.id })}>{g.label}</FilterChip>
            ))}
          </Group>
        )}

        <div>
          <button type="button" onClick={() => setRefineOpen((o) => !o)} aria-expanded={refineOpen} aria-controls="refine-panel" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted hover:text-fg">
            {refineOpen ? "Hide" : "Refine by"} body type &amp; performance
            {refineCount > 0 && <span className="rounded-full bg-red px-2 py-0.5 text-[0.625rem] text-on-red">{refineCount}</span>}
          </button>
          <div id="refine-panel" hidden={!refineOpen} className="mt-4 space-y-5">
            <Group label="Body type">
              {facets.bodies.map((b) => (
                <FilterChip key={b.value} pressed={filters.body.includes(b.value)} count={b.count} onClick={() => set({ body: toggle<BodyType>(filters.body, b.value) })}>{cap(b.value)}</FilterChip>
              ))}
            </Group>
            <Group label="Performance category">
              {facets.performances.map((p) => (
                <FilterChip key={p.value} pressed={filters.performance.includes(p.value)} count={p.count} onClick={() => set({ performance: toggle<PerformanceCategory>(filters.performance, p.value) })}>{p.value}</FilterChip>
              ))}
            </Group>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
        <p className="text-sm text-muted" role="status" aria-live="polite">
          <span className="font-semibold text-fg tabular-nums">{results.length}</span> {results.length === 1 ? "car" : "cars"}{active ? " match" : " in the catalog"}
        </p>
        {active && (
          <button type="button" onClick={() => setFilters(EMPTY_FILTERS)} className="text-xs font-semibold uppercase tracking-[0.14em] text-muted underline underline-offset-4 hover:text-fg">Reset filters</button>
        )}
      </div>

      <div className="mt-4">
        {results.length > 0 ? (
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 xl:grid-cols-6">
            {results.map((entry, i) => (
              <li key={entry.generation.slug}><CarTile entry={entry} href={`/cars/${entry.generation.slug}`} detail priority={i < 4} /></li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={<IconSearch size={24} />}
            title="No machine matched your search."
            message={filters.q ? `We couldn't find “${filters.q}”. Try a brand, a model like M3, or a generation code like 992. More cars are added regularly.` : "Try removing a filter or two to see more of the catalog."}
            onReset={() => setFilters(EMPTY_FILTERS)}
            resetLabel="Reset search"
          />
        )}
      </div>
    </div>
  );
}
