import type { CarEntry, DesignTemplate, TemplateId } from "@/domain/catalog";
import { EXAMPLE_REVIEWS, type ExampleReview } from "@/content/example-reviews";

/* Which car shows off which style on the selling pages. Pure helpers over catalog data
 * the pages already loaded through the repositories. */

const STYLE_CARS: Record<TemplateId, string> = {
  minimal: "porsche-911-992",
  blueprint: "nissan-gt-r-r35",
  racing: "porsche-911-gt3-rs-992",
  heritage: "ford-mustang-gt-s550",
  luxury: "mercedes-amg-gt-c190",
};

/** Our two recommended styles (an editorial pick, not a sales statistic). */
export const OUR_PICKS: readonly TemplateId[] = ["racing", "heritage"];

const bySlug = (cars: readonly CarEntry[], slug: string) => cars.find((c) => c.generation.slug === slug) ?? cars[0]!;

export function styleShowcase(cars: readonly CarEntry[], templates: readonly DesignTemplate[]) {
  return templates.map((template) => ({ template, entry: bySlug(cars, STYLE_CARS[template.id]), pick: OUR_PICKS.includes(template.id) }));
}

/** Example reviews with their car and style resolved; `count` limits how many. A car page shows its own brand first. */
export function resolveReviews(cars: readonly CarEntry[], templates: readonly DesignTemplate[], count: number, prefer?: CarEntry) {
  const ordered: ExampleReview[] = prefer
    ? [...EXAMPLE_REVIEWS].sort((a, b) => Number(bySlug(cars, b.carSlug).brand.id === prefer.brand.id) - Number(bySlug(cars, a.carSlug).brand.id === prefer.brand.id))
    : [...EXAMPLE_REVIEWS];
  return ordered.slice(0, count).map((review) => ({ review, entry: bySlug(cars, review.carSlug), template: templates.find((t) => t.id === review.styleId) ?? templates[0]! }));
}

/** Up to `count` other cars: same brand first, then same body type, then the rest. */
export function relatedCars(cars: readonly CarEntry[], current: CarEntry, count = 3): CarEntry[] {
  const others = cars.filter((c) => c.generation.slug !== current.generation.slug);
  const score = (c: CarEntry) => (c.brand.id === current.brand.id ? 2 : 0) + (c.generation.bodyType === current.generation.bodyType ? 1 : 0) + (c.generation.photos.length ? 0.5 : 0);
  return [...others].sort((a, b) => score(b) - score(a)).slice(0, count);
}
