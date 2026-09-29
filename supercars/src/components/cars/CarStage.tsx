import type { CarEntry } from "@/domain/catalog";
import { VehicleArt } from "@/components/poster/VehicleArt";

/** Cinematic hero stage for a car: engineering grid, oversized outlined model name, dramatic floor glow. */
export function CarStage({ entry }: { entry: CarEntry }) {
  const { car, generation } = entry;
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
