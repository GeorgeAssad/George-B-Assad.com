import type { Customization } from "@/domain/cart";
import type { CarEntry, DesignTemplate, TemplateId } from "@/domain/catalog";
import { PosterPreview } from "@/components/poster/PosterPreview";
import { formatPrice } from "@/lib/format";
import { RadioCard } from "./RadioCard";

interface StepStyleProps {
  readonly templates: readonly DesignTemplate[];
  readonly entry: CarEntry;
  readonly customization: Customization;
  readonly selected: TemplateId;
  readonly onSelect: (id: TemplateId) => void;
}

export function StepStyle({ templates, entry, customization, selected, onSelect }: StepStyleProps) {
  return (
    <fieldset>
      <legend className="sr-only">Choose a design style</legend>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {templates.map((t) => (
          <RadioCard key={t.id} name="style" value={t.id} checked={selected === t.id} onChange={() => onSelect(t.id)}>
            <div className="p-2.5">
              <div className="overflow-hidden rounded-md">
                <PosterPreview template={t} vehicle={entry.generation.vehicle} customization={{ name: customization.name || "YOUR NAME" }} vehicleName={entry.generation.displayName} specs={entry.generation.specs} sizeId="40x60" />
              </div>
              <div className="px-1 pb-1 pt-3">
                <p className="h-display text-2xl">{t.name}</p>
                <p className="mt-0.5 text-xs text-muted">{t.tagline}</p>
                {t.surcharge.amount > 0 && <p className="mt-1 text-xs font-semibold text-red-text">+{formatPrice(t.surcharge)}</p>}
              </div>
            </div>
          </RadioCard>
        ))}
      </div>
    </fieldset>
  );
}
