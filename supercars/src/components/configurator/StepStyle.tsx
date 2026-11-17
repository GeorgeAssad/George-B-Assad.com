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

/** Five poster thumbnails. On wide screens they sit in one row and the chosen style is described once underneath. */
export function StepStyle({ templates, entry, customization, selected, onSelect }: StepStyleProps) {
  const current = templates.find((t) => t.id === selected);
  return (
    <fieldset>
      <legend className="sr-only">Choose a design style</legend>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 xl:grid-cols-5">
        {templates.map((t) => (
          <RadioCard key={t.id} name="style" value={t.id} checked={selected === t.id} onChange={() => onSelect(t.id)} mark="checked" markClassName="right-4 top-4 shadow-[0_0_0_2px_var(--surface)]">
            <div className="p-2.5">
              <div className="overflow-hidden rounded-[var(--lg-radius-xs)] shadow-[var(--lg-edge)]">
                <PosterPreview template={t} vehicle={entry.generation.vehicle} customization={{ name: customization.name || "YOUR NAME" }} vehicleName={entry.generation.displayName} specs={entry.generation.specs} sizeId="40x60" />
              </div>
              <div className="px-1 pb-0.5 pt-2.5">
                <p className="text-[0.9375rem] font-semibold leading-snug">{t.name}</p>
                <p className="mt-0.5 text-[0.8125rem] leading-snug text-muted xl:hidden">{t.tagline}</p>
                {t.surcharge.amount > 0 && <p className="mt-0.5 text-[0.8125rem] tabular-nums text-muted">+{formatPrice(t.surcharge)}</p>}
              </div>
            </div>
          </RadioCard>
        ))}
      </div>
      {current && <p className="mt-3 hidden text-[0.9375rem] text-muted xl:block" aria-hidden="true"><span className="font-semibold text-fg">{current.name}.</span> {current.tagline}</p>}
    </fieldset>
  );
}
