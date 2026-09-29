"use client";

import { useState } from "react";
import type { CarEntry } from "@/domain/catalog";
import { VehicleArt } from "@/components/poster/VehicleArt";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconClose, IconSearch } from "@/components/ui/icons";
import { matchesQuery } from "@/lib/car-search";
import { RadioCard } from "./RadioCard";

interface StepCarProps {
  readonly cars: readonly CarEntry[];
  readonly selected: string | null;
  readonly onSelect: (slug: string) => void;
}

export function StepCar({ cars, selected, onSelect }: StepCarProps) {
  const [q, setQ] = useState("");
  const results = cars.filter((c) => matchesQuery(c, q));
  return (
    <div>
      <div className="relative">
        <label htmlFor="cfg-car-search" className="sr-only">Search cars</label>
        <IconSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
        <input id="cfg-car-search" type="search" autoComplete="off" spellCheck={false} maxLength={60} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search — try “BMW M3” or “992”" className="field h-14 rounded-full pl-12 pr-12" />
        {q && (
          <button type="button" onClick={() => setQ("")} className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:text-fg" aria-label="Clear search"><IconClose size={17} /></button>
        )}
      </div>
      <p className="mt-3 text-sm text-muted" role="status" aria-live="polite">{results.length} {results.length === 1 ? "car" : "cars"}{q ? " found" : ""}</p>

      {results.length > 0 ? (
        <fieldset className="mt-4">
          <legend className="sr-only">Choose your car</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {results.map((c) => (
              <RadioCard key={c.generation.slug} name="car" value={c.generation.slug} checked={selected === c.generation.slug} onChange={() => onSelect(c.generation.slug)}>
                <div className="flex items-center gap-3 p-3">
                  <div className="w-28 flex-none overflow-hidden rounded-lg bg-[radial-gradient(ellipse_at_50%_105%,color-mix(in_srgb,var(--red)_16%,transparent),transparent_65%),var(--elevated)] p-1.5">
                    <VehicleArt vehicle={c.generation.vehicle} shadow={false} />
                  </div>
                  <div className="min-w-0 pr-7">
                    <p className="spec">{c.brand.name}</p>
                    <p className="h-display truncate text-[1.6rem]">{c.car.name} <span className="text-red-text">{c.generation.generation}</span></p>
                    <p className="truncate text-xs text-muted">{c.generation.specs.years}</p>
                  </div>
                </div>
              </RadioCard>
            ))}
          </div>
        </fieldset>
      ) : (
        <div className="mt-4">
          <EmptyState icon={<IconSearch size={24} />} title="No machine matched your search." message="Try a brand, a model like M3, or a generation code like 992." onReset={() => setQ("")} resetLabel="Clear search" secondary={{ label: "Browse the catalog", href: "/cars" }} />
        </div>
      )}
    </div>
  );
}
