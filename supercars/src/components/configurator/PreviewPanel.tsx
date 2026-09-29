import type { Customization } from "@/domain/cart";
import type { CarEntry, DesignTemplate, ProductKind, SizeId } from "@/domain/catalog";
import { PosterPreview } from "@/components/poster/PosterPreview";
import { ProductFrame } from "@/components/poster/ProductFrame";

interface PreviewPanelProps {
  readonly entry: CarEntry | null;
  readonly template: DesignTemplate;
  readonly customization: Customization;
  readonly sizeId: SizeId;
  readonly kind: ProductKind;
  /** While the pipeline runs the poster is dimmed and a scan line sweeps it. */
  readonly generating?: boolean;
  readonly className?: string;
}

export function PreviewPanel({ entry, template, customization, sizeId, kind, generating = false, className = "" }: PreviewPanelProps) {
  if (!entry) {
    return (
      <div className={`flex aspect-[5/7] items-center justify-center rounded-lg border border-dashed border-line-strong bg-surface p-8 text-center ${className}`}>
        <div>
          <p className="h-display text-3xl">Your poster</p>
          <p className="mt-2 text-sm text-muted">Choose a car and it appears here, updating live as you design.</p>
        </div>
      </div>
    );
  }
  return (
    <div className={`relative ${className}`}>
      <ProductFrame variant={kind}>
        <div className="relative overflow-hidden">
          <div className={`transition-[filter,opacity] duration-700 ${generating ? "opacity-40 blur-[3px] saturate-50" : ""}`}>
            <PosterPreview template={template} vehicle={entry.generation.vehicle} customization={customization} vehicleName={entry.generation.displayName} specs={entry.generation.specs} sizeId={sizeId} />
          </div>
          {generating && (
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-transparent via-red/40 to-transparent [animation:scan_1.6s_ease-in-out_infinite]" />
          )}
        </div>
      </ProductFrame>
      <p className="spec mt-3 text-center">Live preview · prototype artwork</p>
    </div>
  );
}
