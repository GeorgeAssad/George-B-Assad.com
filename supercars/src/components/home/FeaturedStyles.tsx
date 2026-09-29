import type { CarEntry, DesignTemplate } from "@/domain/catalog";
import { StyleCard } from "@/components/create/StyleCard";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function FeaturedStyles({ templates, entry }: { templates: readonly DesignTemplate[]; entry: CarEntry }) {
  return (
    <section aria-labelledby="styles-title" className="cv-auto border-y border-line bg-surface py-24 sm:py-32">
      <div className="container-x">
        <Reveal>
          <SectionHeading id="styles-title" eyebrow="SC / 05 — Design styles" title="Five ways to see one car." lead="Same car, same name, five completely different posters. Every style is a design template, so the artwork can change while the layout stays true." />
        </Reveal>
      </div>
      <ul className="no-scrollbar container-x mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 lg:grid lg:grid-cols-5 lg:overflow-visible" aria-label="Design styles">
        {templates.map((t, i) => (
          <li key={t.id} className="w-[68vw] max-w-[19rem] flex-none snap-start lg:w-auto lg:max-w-none">
            <Reveal delay={i * 70}>
              <StyleCard template={t} vehicle={entry.generation.vehicle} vehicleName={entry.generation.displayName} specs={entry.generation.specs} index={i} image={t.previewImage} />
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
