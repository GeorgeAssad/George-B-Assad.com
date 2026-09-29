import Link from "next/link";
import type { CarEntry } from "@/domain/catalog";
import { VehicleArt } from "@/components/poster/VehicleArt";
import { CutoutFit } from "./CutoutFit";

/**
 * One car in the picker: a small showroom tile. The whole tile is the call to action
 * ("start a poster for this car"), so there is no extra button, price or spec text to read.
 */
export function CarTile({ entry }: { entry: CarEntry }) {
  const { brand, car, generation } = entry;
  const photo = generation.photos[0];
  return (
    <Link
      href={`/create?car=${generation.slug}`}
      aria-label={`${generation.displayName}. Create your poster for this car`}
      className="group on-dark studio-stage relative block overflow-hidden rounded-xl border border-line transition-colors hover:border-red focus-visible:border-red"
    >
      <div className="relative aspect-[16/9] xl:aspect-[16/8]">
        <div className="studio-floor absolute inset-x-0 bottom-0 h-[42%]" aria-hidden="true" />
        {photo?.mode === "cutout" ? (
          <CutoutFit slug={generation.slug} photo={photo} sizes="(min-width:1280px) 14vw, (min-width:640px) 22vw, 30vw" className="studio-lift absolute inset-x-[5%] bottom-[8%] top-[8%]" />
        ) : (
          <VehicleArt vehicle={generation.vehicle} shadow={false} className="studio-lift absolute inset-x-[8%] bottom-[10%] w-[84%]" />
        )}
      </div>
      <p className="px-1.5 pb-1.5 pt-0.5 text-center leading-tight">
        <span className="spec block text-[0.5625rem] max-sm:hidden">{brand.name}</span>
        <span className="h-display block whitespace-nowrap text-[0.95rem] sm:text-lg">{car.name} <span className="text-red-text">{generation.generation}</span></span>
      </p>
    </Link>
  );
}
