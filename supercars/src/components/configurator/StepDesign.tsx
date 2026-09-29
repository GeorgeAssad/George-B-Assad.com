import type { Customization } from "@/domain/cart";
import type { CarEntry, DesignTemplate, PosterSize, Product, SizeId, TemplateId } from "@/domain/catalog";
import { StepSize } from "./StepSize";
import { StepStyle } from "./StepStyle";

interface StepDesignProps {
  readonly entry: CarEntry;
  readonly templates: readonly DesignTemplate[];
  readonly sizes: readonly PosterSize[];
  readonly products: readonly Product[];
  readonly template: DesignTemplate;
  readonly customization: Customization;
  readonly productId: string;
  readonly sizeId: SizeId;
  readonly onTemplate: (id: TemplateId) => void;
  readonly onProduct: (id: string) => void;
  readonly onSize: (id: SizeId) => void;
}

/** Style, finish and size on one screen: they are one decision ("what does my poster look like"), not three. */
export function StepDesign({ entry, templates, sizes, products, template, customization, productId, sizeId, onTemplate, onProduct, onSize }: StepDesignProps) {
  return (
    <div className="space-y-10">
      <div>
        <p className="spec mb-3" aria-hidden="true">Style</p>
        <StepStyle templates={templates} entry={entry} customization={customization} selected={template.id} onSelect={onTemplate} />
      </div>
      <StepSize sizes={sizes} products={products} template={template} productId={productId} sizeId={sizeId} onProduct={onProduct} onSize={onSize} />
    </div>
  );
}
