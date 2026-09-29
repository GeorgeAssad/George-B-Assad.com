import type { MediaItem } from "@/domain/content";

/* DEMO SOCIAL/MEDIA ITEMS — local placeholders for the "Seen on the feed"
 * section. Shaped so a CMS or object storage can supply real clips later
 * (set `videoUrl` and `posterUrl` from storage; no component changes). */

export const mediaItems: readonly MediaItem[] = [
  { id: "m1", posterName: "NOAH", kind: "reel", caption: "Unboxing the 50×70 — placeholder clip", carSlug: "bmw-m3-g80", templateId: "racing", isDemo: true },
  { id: "m2", posterName: "LENA", kind: "post", caption: "Blueprint style detail — placeholder post", carSlug: "nissan-gt-r-r35", templateId: "blueprint", isDemo: true },
  { id: "m3", posterName: "MAX", kind: "reel", caption: "From car to print in 60 seconds — placeholder clip", carSlug: "porsche-911-992", templateId: "heritage", isDemo: true },
  { id: "m4", posterName: "ZOE", kind: "post", caption: "Luxury foil accents — placeholder post", carSlug: "mercedes-amg-gt-c190", templateId: "luxury", isDemo: true },
];
