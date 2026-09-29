import type { CarEntry } from "@/domain/catalog";
import { CarTile } from "@/components/cars/CarTile";
import { CutoutFit } from "@/components/cars/CutoutFit";
import { ShowroomStage } from "@/components/showroom/ShowroomStage";
import { HeroParallax } from "./HeroParallax";

/**
 * Scene one of the home page, exactly one screen: the promise, a big car under the spotlight,
 * and the only thing a visitor has to do — pick their car. Every tile links into the designer with that car selected.
 */
export function HomeStage({ hero, cars }: { hero: CarEntry; cars: readonly CarEntry[] }) {
  const photo = hero.generation.photos[0];
  const word = hero.car.name.replace(/\s.*/, "");
  return (
    <ShowroomStage as="section" labelledBy="hero-title" word={word} wordClassName="top-[1%] text-[clamp(8rem,24vw,22rem)] max-md:hidden" className="flex min-h-[calc(100svh-4rem)] flex-col justify-center lg:min-h-[calc(100svh-4.5rem)]">
      <div className="container-x relative z-10 flex flex-col gap-3 py-4 sm:gap-4 sm:py-5">
        <div className="grid items-center gap-1 md:grid-cols-[0.9fr_1.1fr] md:gap-6">
          <div>
            <p className="eyebrow stagger">Personalized car posters</p>
            <h1 id="hero-title" className="h-display stagger mt-2 text-[clamp(2.3rem,min(7.4vw,10.5svh),5.5rem)] leading-[0.92]" style={{ ["--d" as string]: "60ms" }}>
              Turn your car into <span className="text-red-text">art.</span>
            </h1>
            <p className="stagger mt-2 max-w-md text-muted sm:mt-3 sm:text-lg" style={{ ["--d" as string]: "140ms" }}>Made for your exact car, with your name on it.</p>
          </div>
          {photo?.mode === "cutout" && (
            <HeroParallax className="pointer-events-none relative h-[clamp(5.5rem,17svh,9rem)] md:h-[clamp(7rem,33svh,27rem)]">
              <div className="hero-layer absolute inset-0" style={{ ["--depth" as string]: "1" }}>
                <div className="drive-in absolute inset-0">
                  <CutoutFit slug={hero.generation.slug} photo={photo} priority reflection sizes="(min-width:768px) 56vw, 100vw" className="absolute inset-0" />
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
      </div>
    </ShowroomStage>
  );
}
