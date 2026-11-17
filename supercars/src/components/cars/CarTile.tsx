import Link from "next/link";
import type { CarEntry } from "@/domain/catalog";
import { VehicleArt } from "@/components/poster/VehicleArt";
import { CutoutFit } from "./CutoutFit";

interface CarTileProps {
  readonly entry: CarEntry;
  /** Where the tile goes. Default: straight into the designer with this car selected. */
  readonly href?: string;
  /** Adds a years / power line (used on the Cars page). */
  readonly detail?: boolean;
  readonly priority?: boolean;
}

/**
 * One car as a product card: the car on a soft studio backdrop, its name underneath.
 * The whole card is the link, so there is no extra button to read.
 */
export function CarTile({ entry, href, detail = false, priority = false }: CarTileProps) {
  const { brand, car, generation } = entry;
  const photo = generation.photos[0];
  return (
    <Link
      href={href ?? `/create?car=${generation.slug}`}
      prefetch={false}
      aria-label={href ? `${generation.displayName}, ${generation.specs.years}` : `${generation.displayName}. Create your poster for this car`}
      className="group card card-lift block h-full overflow-hidden text-fg no-underline"
    >
      <div className="stage-soft aspect-[16/10]">
        {photo?.mode === "cutout" ? (
          <CutoutFit slug={generation.slug} photo={photo} priority={priority} sizes="(min-width:1280px) 190px, (min-width:640px) 24vw, 46vw" className="studio-lift absolute inset-x-[7%] bottom-[11%] top-[12%]" />
        ) : (
          <>
            {/* No photograph yet: a quiet line drawing, so it reads as "photo coming" and not as a cartoon among photos. */}
            <div className="studio-lift absolute inset-x-[11%] bottom-[16%] text-subtle"><VehicleArt vehicle={generation.vehicle} treatment="outline" ink="currentColor" shadow={false} className="block w-full" /></div>
            <span className="absolute left-2.5 top-2.5 rounded-full bg-fill px-2 py-0.5 text-[0.6875rem] font-medium text-muted">Photo soon</span>
          </>
        )}
      </div>
      <div className="px-3.5 pb-3.5 pt-3 sm:px-4 sm:pb-4">
        <p className="spec">{brand.name}</p>
        <p className="mt-0.5 text-[0.9375rem] font-semibold leading-snug tracking-[-0.02em] sm:text-[1.0625rem]">{car.name} <span className="font-normal text-muted">{generation.generation}</span></p>
        {detail && <p className="spec mt-1 max-sm:text-[0.75rem] max-sm:tracking-tight">{generation.specs.years} · {generation.specs.powerKw} kW</p>}
      </div>
    </Link>
  );
}
