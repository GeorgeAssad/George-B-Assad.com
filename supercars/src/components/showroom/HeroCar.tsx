import type { CarEntry } from "@/domain/catalog";
import { CutoutFit } from "@/components/cars/CutoutFit";

/** A cut-out car standing on the stage floor, filling its (positioned) parent. Renders nothing for cars without a cut-out. */
export function HeroCar({ entry, priority = false, sizes = "(min-width:768px) 48vw, 100vw" }: { entry: CarEntry; priority?: boolean; sizes?: string }) {
  const photo = entry.generation.photos[0];
  if (photo?.mode !== "cutout") return null;
  return (
    <div className="drive-in absolute inset-0">
      <CutoutFit slug={entry.generation.slug} photo={photo} priority={priority} reflection sizes={sizes} className="absolute inset-0" />
    </div>
  );
}
