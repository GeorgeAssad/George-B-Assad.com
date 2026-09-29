import type { CarPhoto } from "@/domain/catalog";
import { CarPhotoImage } from "./CarPhotoImage";

interface StudioCarProps {
  readonly slug: string;
  readonly photo: CarPhoto;
  readonly sizes: string;
  readonly priority?: boolean;
  /** Mirrored, fading copy under the car (a glossy showroom floor). Costs no extra download (same file). */
  readonly reflection?: boolean;
  readonly className?: string;
}

/**
 * A transparent car standing on the site's stage: rim glow, contact shadow and an optional floor reflection.
 * Only meaningful for `cutout` photos; the caller sizes the wrapper.
 */
export function StudioCar({ slug, photo, sizes, priority = false, reflection = true, className = "" }: StudioCarProps) {
  return (
    <div className={`relative ${className}`}>
      <CarPhotoImage slug={slug} photo={photo} sizes={sizes} priority={priority} className="studio-car" />
      <div className="studio-shadow" aria-hidden="true" />
      {reflection && (
        <div className="studio-reflection" aria-hidden="true">
          <CarPhotoImage slug={slug} photo={photo} sizes={sizes} alt="" />
        </div>
      )}
    </div>
  );
}
