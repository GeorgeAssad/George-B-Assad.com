import type { CarEntry } from "@/domain/catalog";
import { VehicleArt } from "@/components/poster/VehicleArt";
import { CarPhotoImage } from "./CarPhotoImage";
import { PhotoCredit } from "./PhotoCredit";
import { CutoutFit } from "./CutoutFit";

/**
 * The car in the studio: the page's one dark surface. A cut-out photograph stands on the floor; a full photograph
 * fills the stage; a car without a photograph shows a light line drawing and says so.
 */
export function CarStage({ entry }: { entry: CarEntry }) {
  const { generation } = entry;
  const photo = generation.photos[0];

  return (
    <div className="stage scope-dark aspect-[4/3] w-full sm:aspect-[16/10] lg:aspect-[5/4]">
      <div className="stage-floor" aria-hidden="true" />
      {photo?.mode === "cutout" ? (
        <div className="drive-in absolute inset-x-[5%] bottom-[14%] top-[14%]" style={{ ["--d" as string]: "80ms" }}>
          <CutoutFit slug={generation.slug} photo={photo} priority sizes="(min-width:1024px) 640px, 96vw" alt={photo.alt} className="absolute inset-0" />
        </div>
      ) : photo ? (
        <div className="absolute inset-0 -z-[2]"><CarPhotoImage slug={generation.slug} photo={photo} priority sizes="(min-width:1024px) 640px, 100vw" /></div>
      ) : (
        <div className="hero-in absolute inset-x-[9%] bottom-[22%] text-white/70">
          <VehicleArt vehicle={generation.vehicle} treatment="outline" ink="currentColor" shadow={false} className="block w-full" />
        </div>
      )}
      <div className="absolute inset-x-4 bottom-3 sm:inset-x-5 sm:bottom-4">
        {photo ? <PhotoCredit photo={photo} /> : <p className="spec">Prototype silhouette · not to scale · studio photo coming</p>}
      </div>
    </div>
  );
}
