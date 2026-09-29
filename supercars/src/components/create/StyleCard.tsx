import Link from "next/link";
import type { DesignTemplate, VehicleAsset, CarSpecs } from "@/domain/catalog";
import { PosterPreview } from "@/components/poster/PosterPreview";

interface StyleCardProps {
  readonly template: DesignTemplate;
  readonly vehicle: VehicleAsset;
  readonly vehicleName: string;
  readonly specs: Pick<CarSpecs, "years" | "powerKw" | "torqueNm" | "seats" | "drivetrain">;
  readonly name?: string;
  readonly href?: string;
  readonly index?: number;
  /** Pre-rendered preview (lazy JPEG) used instead of an inline SVG where the car/name are fixed. */
  readonly image?: string;
}

/** Marketing style tile (link). The interactive selectable version lives in the configurator. */
export function StyleCard({ template, vehicle, vehicleName, specs, name = "George", href, index = 0, image }: StyleCardProps) {
  return (
    <Link href={href ?? `/create?style=${template.id}`} className="group card card-lift block overflow-hidden p-3" aria-label={`${template.name} style: ${template.tagline}`}>
      <div className="overflow-hidden rounded-lg">
        <div className="zoom-img">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element -- static pre-rendered JPEG; no runtime image optimizer on the edge
            <img src={image} alt={`${template.name} style poster preview`} width={600} height={840} loading="lazy" decoding="async" className="block h-auto w-full" />
          ) : (
            <PosterPreview template={template} vehicle={vehicle} customization={{ name: name.toUpperCase() }} vehicleName={vehicleName} specs={specs} sizeId="40x60" />
          )}
        </div>
      </div>
      <div className="px-1 pb-1 pt-4">
        <p className="spec">Style {String(index + 1).padStart(2, "0")}</p>
        <h3 className="h-display mt-1 text-3xl">{template.name}</h3>
        <p className="mt-1 text-sm text-muted">{template.tagline}</p>
      </div>
    </Link>
  );
}
