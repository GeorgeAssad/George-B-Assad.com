import type { CarEntry } from "@/domain/catalog";
import { VehicleArt } from "@/components/poster/VehicleArt";
import { CarPhotoImage } from "./CarPhotoImage";
import { PhotoCredit } from "./PhotoCredit";
import { StudioCar } from "./StudioCar";

/** Cinematic hero stage for a car: the real photograph when there is one, otherwise the drawn silhouette. */
export function CarStage({ entry }: { entry: CarEntry }) {
  const { car, generation } = entry;
  const photo = generation.photos[0];


  if (photo?.mode === "cutout") {
    return (
      <div className="on-dark studio-stage relative isolate overflow-hidden border-b border-line bg-bg text-fg">
        <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[5%] -z-10 select-none text-center font-display text-[clamp(7rem,30vw,26rem)] font-bold uppercase leading-none tracking-tight text-transparent [-webkit-text-stroke:1px_var(--line-strong)]">
          {car.name.replace(/\s.*/, "")}
        </span>
        <div className="studio-floor absolute inset-x-0 bottom-0 -z-10 h-[40%]" aria-hidden="true" />
        <div className="tech-grid absolute inset-0 -z-10 opacity-25 [mask-image:linear-gradient(180deg,transparent,#000_45%,transparent)]" aria-hidden="true" />
        <div className="container-x relative flex min-h-[19rem] items-end justify-center pb-16 pt-16 sm:min-h-[30rem] sm:pb-24 lg:min-h-[38rem] lg:pb-28">
          <span className="spec absolute left-4 top-6 rounded-full bg-black/55 px-2.5 py-1 text-white/85 backdrop-blur sm:left-10">SC / {generation.generation}</span>
          <span className="spec absolute right-4 top-6 rounded-full bg-black/55 px-2.5 py-1 text-white/85 backdrop-blur sm:right-10">{generation.specs.years}</span>
          <div className="drive-in w-full max-w-[62rem]" style={{ ["--d" as string]: "80ms" }}>
            <StudioCar slug={generation.slug} photo={photo} priority sizes="(min-width:1024px) 62rem, 100vw" />
          </div>
        </div>
        <div className="container-x pb-4">
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
    <div className="relative isolate overflow-hidden border-b border-line bg-[linear-gradient(180deg,var(--surface),var(--bg))]">
      <div className="tech-grid absolute inset-0 -z-10 opacity-60" aria-hidden="true" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_46%_at_50%_92%,color-mix(in_srgb,var(--red)_30%,transparent),transparent_70%)]" aria-hidden="true" />
      <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[6%] select-none text-center font-display text-[clamp(7rem,30vw,26rem)] font-bold uppercase leading-none tracking-tight text-transparent [-webkit-text-stroke:1px_var(--line-strong)]">
        {car.name.replace(/\s.*/, "")}
      </span>
      <div className="container-x relative flex min-h-[20rem] items-end justify-center pb-10 pt-16 sm:min-h-[30rem] sm:pb-14 lg:min-h-[36rem]">
        <span className="spec absolute left-4 top-6 sm:left-10">SC / {generation.generation}</span>
        <span className="spec absolute right-4 top-6 sm:right-10">{generation.specs.years}</span>
        <div className="hero-in w-full max-w-[64rem]" style={{ ["--d" as string]: "100ms" }}>
          <VehicleArt vehicle={generation.vehicle} shadowOpacity={0.9} />
          <div className="mx-auto mt-3 h-px w-[88%] bg-gradient-to-r from-transparent via-fg/30 to-transparent" aria-hidden="true" />
          <p className="spec mt-3 text-center">Prototype silhouette · not to scale</p>
        </div>
      </div>
    </div>
  );
}
