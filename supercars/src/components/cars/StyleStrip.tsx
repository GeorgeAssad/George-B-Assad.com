import Link from "next/link";
import type { CarEntry, DesignTemplate, PosterSize } from "@/domain/catalog";
import { WallPoster } from "@/components/showroom/WallPoster";

/**
 * This car in each of the five styles, hanging on the gallery wall. Every print is a link that opens the designer
 * on the personalize step with car and style already chosen, so the strip is a shortcut, not another menu.
 */
export function StyleStrip({ entry, templates, sizes }: { entry: CarEntry; templates: readonly DesignTemplate[]; sizes: readonly PosterSize[] }) {
  const { generation } = entry;
  return (
    <section aria-labelledby="styles-title" className="on-dark wall-dark relative border-t border-line text-fg">
      <div className="picture-light" aria-hidden="true" />
      <div className="container-x py-8 sm:py-10">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
          <h2 id="styles-title" className="h-display text-3xl sm:text-4xl">{generation.displayName} in five styles</h2>
          <p className="spec normal-case tracking-[0.06em]">Sizes {sizes.map((s) => s.label.replace(/ cm$/, "").replace(/ /g, "")).join(" · ")} cm</p>
        </div>
        <ul className="-mx-4 mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-5 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0">
          {templates.map((t) => (
            <li key={t.id} className="w-[38vw] shrink-0 snap-start sm:w-auto">
              <Link
                href={`/create?car=${generation.slug}&style=${t.id}&size=40x60`}
                aria-label={`${t.name} style. Design this poster`}
                className="group block rounded-lg outline-offset-4 focus-visible:outline-2 focus-visible:outline-red"
              >
                <WallPoster entry={entry} template={t} name="YOUR NAME" kind="poster" className="transition-transform duration-500 ease-out group-hover:-translate-y-1.5 group-focus-visible:-translate-y-1.5" />
                <span className="mt-3 block text-center">
                  <span className="h-display block text-lg leading-none">{t.name}</span>
                  <span className="spec mt-1 block text-[0.625rem] normal-case tracking-[0.04em] max-sm:hidden">{t.tagline}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
