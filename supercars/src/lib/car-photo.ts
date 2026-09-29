import type { CarPhoto } from "@/domain/catalog";

/** Widths and formats the photo pipeline (`scripts/process-photos.mjs`) writes for every photo. */
export const PHOTO_WIDTHS = [320, 640, 1280, 1920] as const;
export const PHOTO_FORMATS = ["avif", "webp"] as const;
export type PhotoFormat = (typeof PHOTO_FORMATS)[number];

export function photoPath(slug: string, photoId: string, width: number, format: PhotoFormat): string {
  return `/cars/${slug}/${photoId}-${width}.${format}`;
}

export function photoSrcSet(slug: string, photo: CarPhoto, format: PhotoFormat): string {
  return photo.widths.map((w) => `${photoPath(slug, photo.id, w, format)} ${w}w`).join(", ");
}

/** The `src` used by browsers that ignore both `<source>` types. WebP at 1280 is the safe middle. */
export function photoFallbackSrc(slug: string, photo: CarPhoto): string {
  const w = photo.widths.includes(1280) ? 1280 : (photo.widths[photo.widths.length - 1] ?? 640);
  return photoPath(slug, photo.id, w, "webp");
}

/** Plain-text credit line, e.g. `Photo: Jane Doe · CC BY 4.0 · Wikimedia Commons` or `Image: SuperCars · AI-generated image`. */
export function creditLine(photo: CarPhoto): string {
  const c = photo.credit;
  if (c.kind === "own") return `Image: ${c.author}${c.note ? ` · ${c.note}` : ""}`;
  return `Photo: ${c.author} · ${c.licenseName} · ${c.sourceName ?? "source"}`;
}
