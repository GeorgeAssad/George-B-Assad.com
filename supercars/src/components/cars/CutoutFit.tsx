import type { CarPhoto } from "@/domain/catalog";
import { CarPhotoImage } from "./CarPhotoImage";

/**
 * A transparent car scaled to fit inside a box of any shape without cropping, standing on the box's bottom edge.
 * The caller positions and sizes the box. Decorative by default (the surrounding link or heading names the car).
 */
export function CutoutFit({ slug, photo, sizes, priority = false, className = "", alt = "" }: {
  readonly slug: string;
  readonly photo: CarPhoto;
  readonly sizes: string;
  readonly priority?: boolean;
  readonly className?: string;
  readonly alt?: string;
}) {
  return (
    <div className={`[&_picture]:flex [&_picture]:h-full [&_picture]:w-full [&_picture]:items-end [&_picture]:justify-center ${className}`}>
      <CarPhotoImage slug={slug} photo={photo} sizes={sizes} priority={priority} alt={alt} className="studio-car h-full! w-auto! max-w-full object-contain object-bottom" />
    </div>
  );
}
