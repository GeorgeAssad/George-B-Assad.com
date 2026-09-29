/* DEMO SOCIAL/MEDIA ITEMS — local placeholders for the "Seen on the feed"
 * section. Shaped so a CMS or object storage can supply real clips later
 * (set `videoUrl` and `posterUrl` from storage; no component changes). */

export interface MediaItem {
  readonly id: string;
  readonly kind: "reel" | "post";
  readonly caption: string;
  /** Slug of a car whose local artwork stands in for the thumbnail. */
  readonly carSlug: string;
  readonly templateId: "minimal" | "blueprint" | "racing" | "heritage" | "luxury";
  readonly videoUrl?: string;
  readonly posterUrl?: string;
  readonly isDemo: true;
}

export const mediaItems: readonly MediaItem[] = [
  { id: "m1", kind: "reel", caption: "Unboxing the 50×70 — placeholder clip", carSlug: "bmw-m3-g80", templateId: "racing", isDemo: true },
  { id: "m2", kind: "post", caption: "Blueprint style detail — placeholder post", carSlug: "nissan-gt-r-r35", templateId: "blueprint", isDemo: true },
  { id: "m3", kind: "reel", caption: "From car to print in 60 seconds — placeholder clip", carSlug: "porsche-911-992", templateId: "heritage", isDemo: true },
  { id: "m4", kind: "post", caption: "Luxury foil accents — placeholder post", carSlug: "mercedes-amg-gt-c190", templateId: "luxury", isDemo: true },
];
