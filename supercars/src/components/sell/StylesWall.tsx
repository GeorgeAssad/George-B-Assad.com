import Link from "next/link";
import type { CarEntry, DesignTemplate } from "@/domain/catalog";
import { WallPoster } from "@/components/showroom/WallPoster";
import { Reveal } from "@/components/ui/Reveal";

export interface StyleShowcase {
  readonly template: DesignTemplate;
  readonly entry: CarEntry;
  /** Our recommendation (not a sales statistic). */
  readonly pick?: boolean;
}

/** The five styles, each on a different car, hung on one wall. A poster opens the designer with that car and style. */
export function StylesWall({ items }: { items: readonly StyleShowcase[] }) {
  return (
    <section aria-labelledby="styles-title" className="section-t">
      <div className="container-x">
        <Reveal>
          <h2 id="styles-title" className="h-display h-section">Five styles. Pick the one that fits your wall.</h2>
          <p className="lead mt-3 max-w-[48ch]">Every style works with every car. Tap one to start with it.</p>
        </Reveal>
      </div>
      <Reveal delay={80} className="mx-auto mt-7 w-full max-w-[1200px] sm:mt-9 sm:px-6 lg:px-8">
        <div className="wall overflow-hidden sm:rounded-[var(--lg-radius-xl)]">
          <ul data-qa-scroll className="no-scrollbar flex snap-x snap-mandatory scroll-px-6 items-end gap-5 overflow-x-auto px-6 pb-7 pt-9 sm:grid sm:grid-cols-5 sm:gap-6 sm:overflow-visible sm:px-10 sm:pb-9 sm:pt-12 lg:gap-8 lg:px-14">
            {items.map(({ template, entry, pick }) => (
              <li key={template.id} className="w-[38vw] max-w-[11rem] shrink-0 snap-start sm:w-auto sm:max-w-none">
                <Link
                  href={`/create?car=${entry.generation.slug}&style=${template.id}&size=40x60`}
                  prefetch={false}
                  aria-label={`${template.name} style, shown on a ${entry.generation.displayName}. Start with this style`}
                  className="group block text-fg no-underline"
                >
                  <div className="studio-lift transition-transform duration-500 group-hover:-translate-y-1.5">
                    <WallPoster entry={entry} template={template} name="YOUR NAME" kind={pick ? "framed-poster" : "poster"} />
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-[0.9375rem] font-semibold tracking-[-0.01em] sm:text-[1.0625rem]">{template.name}</span>
                    {pick && <span className="rounded-full bg-tint-soft px-2 py-0.5 text-[0.75rem] font-semibold text-tint-ink">Our pick</span>}
                  </div>
                  <span className="mt-0.5 block text-[0.8125rem] leading-snug text-muted max-sm:hidden">{template.tagline}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </section>
  );
}
