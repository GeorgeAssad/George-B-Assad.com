"use client";

import { useState } from "react";
import type { CarEntry } from "@/domain/catalog";
import { CarPhotoImage } from "@/components/cars/CarPhotoImage";
import { CutoutFit } from "@/components/cars/CutoutFit";
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
        <input id="cfg-car-search" type="search" autoComplete="off" spellCheck={false} maxLength={60} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Brand, model or generation" className="field h-13 rounded-full pl-12 pr-12" />
        {q && (
          <button type="button" onClick={() => setQ("")} className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:text-fg" aria-label="Clear search"><IconClose size={17} /></button>
        )}
      </div>
      <p className="spec mt-3" role="status" aria-live="polite">{results.length} {results.length === 1 ? "car" : "cars"}{q ? " found" : ""}</p>

      {results.length > 0 ? (
        <fieldset className="mt-4">
          <legend className="sr-only">Choose your car</legend>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {results.map((c) => (
              <RadioCard key={c.generation.slug} name="car" value={c.generation.slug} checked={selected === c.generation.slug} onChange={() => onSelect(c.generation.slug)}>
                <div className="flex items-center gap-3.5 p-3">
                  {c.generation.photos[0]?.mode === "cutout" ? (
                    <div className="stage-soft aspect-[16/10] w-24 flex-none rounded-[var(--lg-radius-sm)] sm:w-28">
                      <CutoutFit slug={c.generation.slug} photo={c.generation.photos[0]} sizes="112px" className="absolute inset-x-[6%] bottom-[12%] top-[12%]" />
                    </div>
                  ) : c.generation.photos[0] ? (
                    <div className="aspect-[16/10] w-24 flex-none overflow-hidden rounded-[var(--lg-radius-sm)] bg-elevated sm:w-28">
                      <CarPhotoImage slug={c.generation.slug} photo={c.generation.photos[0]} sizes="112px" alt="" />
                    </div>
                  ) : (
                    <div className="stage-soft flex aspect-[16/10] w-24 flex-none items-center rounded-[var(--lg-radius-sm)] p-2 text-subtle sm:w-28">
                      <VehicleArt vehicle={c.generation.vehicle} shadow={false} treatment="outline" ink="currentColor" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="spec pr-8">{c.brand.name}</p>
                    <p className="pr-8 font-semibold leading-snug">{c.car.name}</p>
                    <p className="mt-0.5 text-[0.8125rem] text-muted">{c.generation.generation} · {c.generation.specs.years}</p>
                  </div>
                </div>
              </RadioCard>
            ))}
          </div>
        </fieldset>
      ) : (
        <div className="mt-4">
          <EmptyState icon={<IconSearch size={24} />} title="No car matched your search." message="Try a brand, a model like M3, or a generation code like 992." onReset={() => setQ("")} resetLabel="Clear search" />
        </div>
      )}
    </div>
  );
}
