import type { CarPhoto } from "@/domain/catalog";
import { photoFallbackSrc, photoSrcSet } from "@/lib/car-photo";

interface CarPhotoImageProps {
  readonly slug: string;
  readonly photo: CarPhoto;
  /** Same meaning as the `sizes` attribute: how wide the image renders at each breakpoint. */
  readonly sizes: string;
  /** Above-the-fold image (LCP): loaded eagerly at high priority. Everything else is lazy. */
  readonly priority?: boolean;
  readonly className?: string;
  /** Overrides the photo's own alt text, e.g. to mark a purely decorative repeat with `""`. */
  readonly alt?: string;
}

/**
 * A self-hosted car image: AVIF → WebP, explicit dimensions (no layout shift).
 * `backdrop` photos fill their box and crop around the focal point; `cutout` cars (transparent background)
 * keep their own shape at full width and are composed on a stage by the caller.
 */
export function CarPhotoImage({ slug, photo, sizes, priority = false, className = "", alt }: CarPhotoImageProps) {
  const cutout = photo.mode === "cutout";
  return (
    <picture>
      <source type="image/avif" srcSet={photoSrcSet(slug, photo, "avif")} sizes={sizes} />
      <source type="image/webp" srcSet={photoSrcSet(slug, photo, "webp")} sizes={sizes} />
      <img
        src={photoFallbackSrc(slug, photo)}
        width={photo.width}
        height={photo.height}
        alt={alt ?? photo.alt}
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : "auto"}
        className={`${cutout ? "block h-auto w-full" : "h-full w-full object-cover"} ${className}`}
        style={cutout ? undefined : { objectPosition: `${photo.focal.x}% ${photo.focal.y}%`, backgroundColor: photo.color }}
      />
    </picture>
  );
}
