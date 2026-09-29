import type { CarPhoto } from "@/domain/catalog";
import { CarPhotoImage } from "./CarPhotoImage";

/**
 * A transparent car scaled to fit inside a box of any shape without cropping, standing on the box's bottom edge.
 * The caller positions and sizes the box. Decorative by default (the surrounding link or heading names the car).
 * `reflection` adds a fading mirror image below the box (needs free space under it, e.g. the stage floor).
 */
export function CutoutFit({ slug, photo, sizes, priority = false, className = "", alt = "", reflection = false }: {
  readonly slug: string;
  readonly photo: CarPhoto;
  readonly sizes: string;
  readonly priority?: boolean;
  readonly className?: string;
  readonly alt?: string;
  readonly reflection?: boolean;
}) {
  const fit = "[&_picture]:flex [&_picture]:h-full [&_picture]:w-full [&_picture]:items-end [&_picture]:justify-center";
  return (
    <div className={`${fit} ${className}`}>
      <CarPhotoImage slug={slug} photo={photo} sizes={sizes} priority={priority} alt={alt} className="studio-car h-full! w-auto! max-w-full object-contain object-bottom" />
      {reflection && (
        <div aria-hidden="true" className={`${fit} pointer-events-none absolute inset-x-0 top-full h-1/2 -scale-y-100 opacity-30 [mask-image:linear-gradient(to_top,rgb(0_0_0/0.7),transparent_80%)]`}>
          <CarPhotoImage slug={slug} photo={photo} sizes={sizes} alt="" className="h-full! w-auto! max-w-full object-contain object-bottom" />
        </div>
      )}
    </div>
  );
}
