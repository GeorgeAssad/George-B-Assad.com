import type { CarEntry } from "@/domain/catalog";
import { CarTile } from "@/components/cars/CarTile";
import { CutoutFit } from "@/components/cars/CutoutFit";
import { HeroParallax } from "./HeroParallax";

/**
 * The whole home page, on one screen: what we sell, then the only thing a visitor has to do — pick their car.
 * Every tile links straight into the designer with that car selected.
 */
export function HomeStage({ hero, cars }: { hero: CarEntry; cars: readonly CarEntry[] }) {
  const photo = hero.generation.photos[0];
  const word = hero.car.name.replace(/\s.*/, "");
  return (
    <section aria-labelledby="hero-title" className="on-dark studio-stage relative isolate flex flex-1 flex-col justify-center overflow-hidden text-fg">
      <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[2%] -z-10 hidden select-none text-center font-display text-[clamp(8rem,24vw,22rem)] font-bold uppercase leading-none tracking-tight text-transparent [-webkit-text-stroke:1px_var(--line-strong)] md:block">{word}</span>

      <div className="container-x relative z-10 flex flex-col gap-4 py-4 sm:gap-4 sm:py-5">
        <div className="grid items-center gap-2 md:grid-cols-[1fr_1.1fr] md:gap-6">
          <div>
            <h1 id="hero-title" className="h-display stagger text-[clamp(2.3rem,min(7.4vw,11svh),5.5rem)] leading-[0.92]">
              Turn your car into <span className="text-red-text">art.</span>
            </h1>
            <p className="stagger mt-2 max-w-md text-muted sm:mt-3 sm:text-lg" style={{ ["--d" as string]: "120ms" }}>Personalized posters, made for your exact car.</p>
          </div>
          {photo?.mode === "cutout" && (
            <HeroParallax className="pointer-events-none relative hidden h-[clamp(7rem,23svh,22rem)] md:block">
              <div className="hero-layer absolute inset-0" style={{ ["--depth" as string]: "1" }}>
                <div className="drive-in absolute inset-0">
                  <CutoutFit slug={hero.generation.slug} photo={photo} priority sizes="(min-width:768px) 52vw, 100vw" className="absolute inset-0" />
                </div>
              </div>
            </HeroParallax>
          )}
        </div>

        <div>
          <h2 className="spec mb-2 text-fg">Pick your car to start</h2>
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:gap-3 xl:grid-cols-6">
            {cars.map((entry) => (
              <li key={entry.generation.slug}><CarTile entry={entry} /></li>
            ))}
          </ul>
        </div>

        <p className="spec text-center normal-case tracking-[0.06em] max-sm:hidden">Pick your car · choose a style · add your name · we print &amp; ship · from €39 · demo checkout, no payment</p>
      </div>
    </section>
  );
}
