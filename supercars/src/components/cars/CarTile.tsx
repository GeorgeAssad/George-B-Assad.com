import Link from "next/link";
import type { CarEntry } from "@/domain/catalog";
import { VehicleArt } from "@/components/poster/VehicleArt";
import { CutoutFit } from "./CutoutFit";

interface CarTileProps {
  readonly entry: CarEntry;
  /** Where the tile goes. Default: straight into the designer with this car selected. */
  readonly href?: string;
  /** Adds a years / power line and a taller image (used on the Cars page). */
  readonly detail?: boolean;
  readonly priority?: boolean;
}

/**
 * One car as a small showroom: the car on its stage, its name underneath. The whole tile is the link,
 * so there is no extra button, price or spec text to read unless `detail` is on.
 */
export function CarTile({ entry, href, detail = false, priority = false }: CarTileProps) {
  const { brand, car, generation } = entry;
  const photo = generation.photos[0];
  return (
    <Link
      href={href ?? `/create?car=${generation.slug}`}
      aria-label={href ? `${generation.displayName}, ${generation.specs.years}` : `${generation.displayName}. Create your poster for this car`}
      className="group on-dark studio-stage relative block overflow-hidden rounded-xl border border-line transition-[border-color,transform,box-shadow] duration-500 hover:border-red hover:shadow-[0_24px_50px_-24px_rgb(225_6_0/0.55)] focus-visible:border-red"
    >
      <div className={`relative ${detail ? "aspect-[16/10]" : "aspect-[16/9] xl:aspect-[16/8]"}`}>
        <div className="studio-floor absolute inset-x-0 bottom-0 h-[42%]" aria-hidden="true" />
        {photo?.mode === "cutout" ? (
          <CutoutFit slug={generation.slug} photo={photo} priority={priority} sizes={detail ? "(min-width:1024px) 30vw, (min-width:640px) 46vw, 92vw" : "(min-width:1280px) 14vw, (min-width:640px) 22vw, 30vw"} className="studio-lift absolute inset-x-[5%] bottom-[8%] top-[8%]" />
        ) : (
          <VehicleArt vehicle={generation.vehicle} shadow={false} className="studio-lift absolute inset-x-[8%] bottom-[10%] w-[84%]" />
        )}
      </div>
      <p className={`px-1 pb-2 pt-0.5 text-center leading-tight sm:px-2 ${detail ? "sm:pb-3" : ""}`}>
        <span className="spec block text-[0.5625rem] max-sm:hidden">{brand.name}</span>
        <span className={`h-display block whitespace-nowrap ${detail ? "text-[0.8rem] sm:text-xl" : "text-[0.8rem] sm:text-lg"}`}>{car.name} <span className="text-red-text">{generation.generation}</span></span>
        {detail && <span className="spec mt-1 block normal-case tracking-[0.06em] max-sm:hidden">{generation.specs.years} · {generation.specs.powerKw} kW</span>}
      </p>
    </Link>
  );
}
