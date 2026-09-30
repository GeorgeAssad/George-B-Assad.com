import type { CarEntry, DesignTemplate } from "@/domain/catalog";
import { PosterPreview } from "@/components/poster/PosterPreview";
import { ProductFrame } from "@/components/poster/ProductFrame";

interface WallPosterProps {
  readonly entry: CarEntry;
  readonly template: DesignTemplate;
  readonly name: string;
  readonly kind?: "poster" | "framed-poster";
  readonly sizeId?: "30x40" | "40x60" | "50x70";
  readonly className?: string;
}

/** A poster on the wall: printed sheet or black frame with a mat, drawn at true proportions. */
export function WallPoster({ entry, template, name, kind = "framed-poster", sizeId = "40x60", className = "" }: WallPosterProps) {
  return (
    <div className={className}>
      <ProductFrame variant={kind}>
        <PosterPreview template={template} vehicle={entry.generation.vehicle} customization={{ name }} vehicleName={entry.generation.displayName} specs={entry.generation.specs} sizeId={sizeId} />
      </ProductFrame>
    </div>
  );
}
