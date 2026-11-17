/* EXAMPLE REVIEWS — placeholder text for the prototype, NOT real customers.
 * They are always shown under the heading "Example reviews" with a note saying so,
 * never as an average rating, never with review markup for search engines.
 * Replace this file with real, verified reviews before launch. */

export interface ExampleReview {
  readonly id: string;
  readonly quote: string;
  /** Initial only: these are not real people. */
  readonly who: string;
  readonly carSlug: string;
  readonly styleId: "minimal" | "blueprint" | "racing" | "heritage" | "luxury";
  readonly context: string;
}

export const EXAMPLE_REVIEWS: readonly ExampleReview[] = [
  { id: "r1", who: "M.", carSlug: "bmw-m3-g80", styleId: "racing", context: "Racing · 50 × 70 cm, framed", quote: "I found my exact model and generation, and my name appeared on the poster the moment I typed it. That sold me." },
  { id: "r2", who: "S.", carSlug: "porsche-911-992", styleId: "minimal", context: "Minimal · 40 × 60 cm, print", quote: "Ordered it as a birthday gift with a note inside. No prices on the slip, which mattered." },
  { id: "r3", who: "K.", carSlug: "nissan-gt-r-r35", styleId: "blueprint", context: "Blueprint · 30 × 40 cm, print", quote: "The blueprint style looks great above my desk. Choosing the size was easy with the to-scale guide." },
  { id: "r4", who: "J.", carSlug: "ford-mustang-gt-s550", styleId: "heritage", context: "Heritage · 50 × 70 cm, framed", quote: "Framed and ready to hang. It is the first thing people notice in the hallway." },
  { id: "r5", who: "L.", carSlug: "porsche-911-gt3-rs-992", styleId: "luxury", context: "Luxury · 40 × 60 cm, framed", quote: "Black and gold, very understated. I could change everything before paying." },
  { id: "r6", who: "A.", carSlug: "audi-rs6-c8", styleId: "racing", context: "Racing · 40 × 60 cm, print", quote: "A poster of the car I sold, with the year I bought it. Exactly what I wanted." },
];
