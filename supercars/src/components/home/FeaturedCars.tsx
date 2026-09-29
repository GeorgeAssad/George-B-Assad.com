import type { CarEntry } from "@/domain/catalog";
import { CarCard } from "@/components/cars/CarCard";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function FeaturedCars({ entries }: { entries: readonly CarEntry[] }) {
  return (
    <section aria-labelledby="cars-title" className="container-x py-24 sm:py-32">
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <Reveal><SectionHeading id="cars-title" eyebrow="SC / 04 — Featured cars" title="Find your machine." /></Reveal>
        <Reveal delay={100}><Button href="/cars" variant="secondary">All cars</Button></Reveal>
      </div>
      <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map((entry, i) => (
          <li key={entry.generation.slug}>
            <Reveal delay={(i % 3) * 80} className="h-full"><CarCard entry={entry} index={i} /></Reveal>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-xs text-subtle">Catalog specifications are illustrative prototype data, not verified manufacturer figures.</p>
    </section>
  );
}
