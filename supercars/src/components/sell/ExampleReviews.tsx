import type { DesignTemplate, CarEntry } from "@/domain/catalog";
import type { ExampleReview } from "@/content/example-reviews";
import { WallPoster } from "@/components/showroom/WallPoster";
import { Reveal } from "@/components/ui/Reveal";

export interface ResolvedReview {
  readonly review: ExampleReview;
  readonly entry: CarEntry;
  readonly template: DesignTemplate;
}

/**
 * Example reviews, labelled as such everywhere: the store has no customers yet.
 * No average rating, no counts and no review markup, so nothing pretends to be real.
 */
export function ExampleReviews({ items, title = "What a happy customer sounds like." }: { items: readonly ResolvedReview[]; title?: string }) {
  return (
    <section aria-labelledby="reviews-title" className="container-x section-t">
      <Reveal>
        <p className="inline-flex rounded-full bg-fill px-2.5 py-1 text-[0.75rem] font-semibold text-muted">Example reviews</p>
        <h2 id="reviews-title" className="h-display h-section mt-3">{title}</h2>
        <p className="mt-2 max-w-[60ch] text-[0.875rem] text-subtle">Placeholder text for the prototype, not real customers. Real reviews will replace these before launch.</p>
      </Reveal>
      <ul className={`mt-7 grid gap-3 sm:mt-9 sm:gap-4 ${items.length > 2 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
        {items.map(({ review, entry, template }, i) => (
          <li key={review.id}>
            <Reveal delay={i * 60} className="card flex h-full gap-4 p-5 sm:p-6">
              <div className="w-16 flex-none sm:w-20" aria-hidden="true"><WallPoster entry={entry} template={template} name="" kind="poster" /></div>
              <figure className="flex min-w-0 flex-col">
                <blockquote className="text-[0.9375rem] leading-relaxed sm:text-[1rem]">“{review.quote}”</blockquote>
                <figcaption className="mt-auto pt-3 text-[0.8125rem] text-muted">
                  <span className="font-semibold text-fg">Example · {review.who}</span> · {entry.generation.displayName}<span className="block text-subtle">{review.context}</span>
                </figcaption>
              </figure>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
