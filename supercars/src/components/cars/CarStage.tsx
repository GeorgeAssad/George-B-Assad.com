import type { CarEntry } from "@/domain/catalog";
import { VehicleArt } from "@/components/poster/VehicleArt";
import { CarPhotoImage } from "./CarPhotoImage";
import { PhotoCredit } from "./PhotoCredit";
import { CutoutFit } from "./CutoutFit";

/** Cinematic hero stage for a car: the real photograph when there is one, otherwise the drawn silhouette. */
export function CarStage({ entry }: { entry: CarEntry }) {
  const { car, generation } = entry;
  const photo = generation.photos[0];

  if (photo?.mode === "cutout") {
    // The stage fills whatever height the page leaves (flex-1); the car scales to fit it.
    return (
      <div className="on-dark studio-stage relative isolate flex min-h-[15rem] flex-1 flex-col overflow-hidden border-b border-line bg-bg text-fg">
        <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[3%] -z-10 select-none text-center font-display text-[clamp(7rem,26vw,24rem)] font-bold uppercase leading-none tracking-tight text-transparent [-webkit-text-stroke:1px_var(--line-strong)]">
          {car.name.replace(/\s.*/, "")}
        </span>
        <div className="studio-floor absolute inset-x-0 bottom-0 -z-10 h-[36%]" aria-hidden="true" />
        <div className="relative flex-1">
          <div className="drive-in absolute inset-x-[3%] bottom-[7%] top-[13%]" style={{ ["--d" as string]: "80ms" }}>
            <CutoutFit slug={generation.slug} photo={photo} priority sizes="(min-width:1280px) 60vw, 96vw" alt={photo.alt} className="h-full" />
          </div>
          <span className="spec absolute left-4 top-4 rounded-full bg-black/55 px-2.5 py-1 text-white/85 backdrop-blur sm:left-8">SC / {generation.generation}</span>
          <span className="spec absolute right-4 top-4 rounded-full bg-black/55 px-2.5 py-1 text-white/85 backdrop-blur sm:right-8">{generation.specs.years}</span>
        </div>
        <div className="container-x relative pb-2">
          <PhotoCredit photo={photo} />
        </div>
      </div>
    );
  }

  if (photo) {
    return (
      <div className="on-dark relative isolate overflow-hidden border-b border-line bg-bg text-fg">
        <div className="relative h-[17rem] overflow-hidden sm:h-[28rem] lg:h-[min(46rem,56vw)]">
          <div className="kenburns absolute inset-0 -z-20">
            <CarPhotoImage slug={generation.slug} photo={photo} priority sizes="100vw" className="photo-cinema" />
          </div>
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(0_0_0/0.5)_0,transparent_28%,transparent_52%,var(--bg)_100%)]" aria-hidden="true" />
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_40%_at_50%_100%,color-mix(in_srgb,var(--red)_26%,transparent),transparent_72%)]" aria-hidden="true" />
          <span className="spec absolute left-4 top-6 rounded-full bg-black/55 px-2.5 py-1 text-white/85 backdrop-blur sm:left-10">SC / {generation.generation}</span>
          <span className="spec absolute right-4 top-6 rounded-full bg-black/55 px-2.5 py-1 text-white/85 backdrop-blur sm:right-10">{generation.specs.years}</span>
        </div>
        <div className="container-x pb-4 pt-3">
          <PhotoCredit photo={photo} />
        </div>
      </div>
    );
  }

  return (
    <div className="on-dark studio-stage grain relative isolate flex min-h-[15rem] flex-1 flex-col overflow-hidden border-b border-line text-fg">
      <div className="spotlight-cone" aria-hidden="true" />
      <span aria-hidden="true" className="outlined-word top-[3%] text-[clamp(7rem,26vw,24rem)]">
        {car.name.replace(/\s.*/, "")}
      </span>
      <div className="studio-floor absolute inset-x-0 bottom-0 -z-[3] h-[36%]" aria-hidden="true" />
      <div className="container-x relative flex flex-1 items-end justify-center pb-6 pt-14 sm:pb-8">
        <span className="spec absolute left-4 top-4 sm:left-8">SC / {generation.generation}</span>
        <span className="spec absolute right-4 top-4 sm:right-8">{generation.specs.years}</span>
        <div className="hero-in w-full max-w-[64rem]" style={{ ["--d" as string]: "100ms" }}>
          <VehicleArt vehicle={generation.vehicle} treatment="outline" ink="rgb(255 255 255 / 0.6)" shadow={false} className="mx-auto h-[clamp(9rem,34svh,24rem)] w-auto max-w-full" />
          <p className="spec mt-2 text-center">Prototype silhouette · not to scale · studio photo coming</p>
        </div>
      </div>
    </div>
  );
}
