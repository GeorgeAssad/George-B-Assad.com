import Link from "next/link";
import type { CarEntry } from "@/domain/catalog";
import { VehicleArt } from "@/components/poster/VehicleArt";
import { IconArrow } from "@/components/ui/icons";

interface CarCardProps {
  readonly entry: CarEntry;
  readonly index?: number;
  readonly priority?: boolean;
}

export function CarCard({ entry, index = 0 }: CarCardProps) {
  const { brand, car, generation } = entry;
  const code = String(index + 1).padStart(2, "0");
  return (
    <Link href={`/cars/${generation.slug}`} className="group card card-lift block overflow-hidden" aria-label={`${generation.displayName}, ${generation.specs.years}. Create this car`}>
      <div className="relative aspect-[16/10] overflow-hidden bg-[radial-gradient(ellipse_at_50%_105%,color-mix(in_srgb,var(--red)_18%,transparent),transparent_62%),linear-gradient(180deg,var(--elevated),var(--surface))]">
        <div className="tech-grid absolute inset-0 opacity-50" aria-hidden="true" />
        <span className="spec absolute left-3 top-3">SC / {code}</span>
        <span className="spec absolute right-3 top-3">{generation.bodyType}</span>
        <VehicleArt vehicle={generation.vehicle} className="zoom-img absolute inset-x-[4%] bottom-[6%] w-[92%]" />
      </div>
      <div className="p-4 sm:p-5">
        <p className="spec">{brand.name}</p>
        <h3 className="h-display mt-1.5 text-[1.9rem]">
          {car.name} <span className="text-red-text">{generation.generation}</span>
        </h3>
        <p className="mt-1.5 text-sm text-muted">
          {generation.specs.years} · {generation.specs.powerKw} kW · {generation.performance}
        </p>
        <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-fg">
          Create this car
          <IconArrow size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
