import Link from "next/link";
import type { CarEntry, DesignTemplate, PosterSize } from "@/domain/catalog";
import { WallPoster } from "@/components/showroom/WallPoster";

/**
 * This car in each of the five styles, on a gallery wall. Every print is a link that opens the designer
 * on the personalize step with car and style already chosen, so the strip is a shortcut, not another menu.
 */
export function StyleStrip({ entry, templates, sizes }: { entry: CarEntry; templates: readonly DesignTemplate[]; sizes: readonly PosterSize[] }) {
  const { generation } = entry;
  return (
    <section aria-labelledby="styles-title" className="container-x section-t">
      <h2 id="styles-title" className="h-display h-section">Five styles for this car.</h2>
      <p className="lead mt-3">Pick one to start. Sizes: {sizes.map((s) => s.label.replace(/ cm$/, "")).join(", ")} cm.</p>
      <ul data-qa-scroll className="no-scrollbar -mx-4 mt-7 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:mt-9 sm:grid sm:grid-cols-5 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0">
        {templates.map((t) => (
          <li key={t.id} className="w-[42vw] max-w-[12rem] shrink-0 snap-start sm:w-auto sm:max-w-none">
            <Link
              href={`/create?car=${generation.slug}&style=${t.id}&size=40x60`}
              prefetch={false}
              aria-label={`${t.name} style. Design this poster`}
              className="group card card-lift block h-full overflow-hidden text-fg no-underline"
            >
              <div className="wall px-[14%] py-6 sm:py-8"><WallPoster entry={entry} template={t} name="YOUR NAME" kind="poster" /></div>
              <div className="px-3.5 pb-3.5 pt-3 sm:px-4 sm:pb-4">
                <p className="text-[0.9375rem] font-semibold leading-snug tracking-[-0.02em] sm:text-[1.0625rem]">{t.name}</p>
                <p className="mt-0.5 text-[0.8125rem] leading-snug text-muted max-sm:hidden">{t.tagline}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
