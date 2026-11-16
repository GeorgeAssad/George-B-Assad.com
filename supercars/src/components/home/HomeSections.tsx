import type { CarEntry } from "@/domain/catalog";
import { CarTile } from "@/components/cars/CarTile";
import { Reveal } from "@/components/ui/Reveal";
import { IconGauge, IconPackage, IconPalette } from "@/components/ui/icons";

/** Real numbers, rendered final, directly under the hero. */
export function ProofRow({ items }: { items: readonly (readonly [string, string])[] }) {
  return (
    <div className="container-x mt-10 sm:mt-14">
      <dl className="proof" aria-label="SuperCars in numbers">
        {items.map(([value, label]) => (
          <div key={label} className="flex flex-col-reverse justify-end">
            <dt><span>{label}</span></dt>
            <dd><strong>{value}</strong></dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** The catalogue as product cards. A card starts a poster for that car. Phones get a swipeable row, so the page stays short. */
export function CarPicker({ cars }: { cars: readonly CarEntry[] }) {
  return (
    <section aria-labelledby="cars-title" className="section-t">
      <div className="container-x">
        <Reveal>
          <h2 id="cars-title" className="h-display h-section">Start with your car.</h2>
          <p className="lead mt-3 max-w-[44ch]">Every poster is drawn around one exact model and generation. Pick yours.</p>
        </Reveal>
      </div>
      <Reveal delay={80} className="mx-auto w-full max-w-[1200px] sm:px-6 lg:px-8">
        <ul data-qa-scroll className="no-scrollbar mt-7 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 sm:mt-9 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 md:grid-cols-4 xl:grid-cols-6">
          {cars.map((entry) => (
            <li key={entry.generation.slug} className="w-[44vw] max-w-[13rem] shrink-0 snap-start sm:w-auto sm:max-w-none"><CarTile entry={entry} /></li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}

const STEPS = [
  { title: "Pick your car", body: "Your exact model and generation.", icon: <IconGauge size={22} /> },
  { title: "Choose a style", body: "Five looks, three sizes, print or framed.", icon: <IconPalette size={22} /> },
  { title: "Add your name", body: "Watch the poster update as you type.", icon: <span className="text-[1.0625rem] font-bold leading-none" aria-hidden="true">Aa</span> },
  { title: "We print and ship", body: "Made to order and tracked to your door.", icon: <IconPackage size={22} /> },
] as const;

/** What happens after the click: four steps, four cards. */
export function Steps() {
  return (
    <section aria-labelledby="steps-title" className="container-x section-t">
      <Reveal>
        <h2 id="steps-title" className="h-display h-section">Four steps. One poster.</h2>
      </Reveal>
      <ol className="mt-7 grid grid-cols-2 gap-3 sm:mt-9 sm:gap-4 lg:grid-cols-4">
        {STEPS.map((s, i) => (
          <li key={s.title}>
            <Reveal delay={i * 60} className="card h-full p-4 sm:p-6">
              <div className="icon-tile">{s.icon}</div>
              <p className="spec mt-4">Step {i + 1}</p>
              <h3 className="mt-0.5 text-[1.0625rem] font-semibold leading-snug tracking-[-0.02em] sm:text-[1.3125rem]">{s.title}</h3>
              <p className="mt-1.5 text-[0.9375rem] leading-snug text-muted">{s.body}</p>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  );
}
