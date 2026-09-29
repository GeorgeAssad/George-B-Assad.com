import type { DemoReview } from "@/domain/content";

/* DEMO REVIEWS — clearly placeholder content, NOT real customer feedback.
 * Every entry carries `isDemo: true` and the UI must label the section as demo. */

export const demoReviews: readonly DemoReview[] = [
  {
    id: "r1",
    author: "Placeholder A.",
    car: "BMW M3 G80",
    style: "Racing",
    quote: "Sample copy: The stance is exactly how I picture the car. The name on the print is the detail that makes it mine.",
    isDemo: true,
  },
  {
    id: "r2",
    author: "Placeholder B.",
    car: "Porsche 911 992",
    style: "Heritage",
    quote: "Sample copy: Understated and precise. It looks like it belongs next to the real thing in the garage.",
    isDemo: true,
  },
  {
    id: "r3",
    author: "Placeholder C.",
    car: "Nissan GT-R R35",
    style: "Blueprint",
    quote: "Sample copy: The technical drawing style is a great fit for this car. Clean and geeky in the best way.",
    isDemo: true,
  },
];
