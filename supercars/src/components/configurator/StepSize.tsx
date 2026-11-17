import type { DesignTemplate, PosterSize, Product, SizeId } from "@/domain/catalog";
import { addMoney } from "@/domain/money";
import { OfferPrice } from "@/components/offers/OfferPrice";
import { RadioCard } from "./RadioCard";

interface StepSizeProps {
  readonly sizes: readonly PosterSize[];
  readonly products: readonly Product[];
  readonly template: DesignTemplate;
  readonly productId: string;
  readonly sizeId: SizeId;
  readonly onProduct: (id: string) => void;
  readonly onSize: (id: SizeId) => void;
}

/** Display prices come from the catalog; the authoritative price is re-quoted by the server. */
export function StepSize({ sizes, products, template, productId, sizeId, onProduct, onSize }: StepSizeProps) {
  const product = products.find((p) => p.id === productId) ?? products[0];
  const tallest = Math.max(...sizes.map((s) => s.heightCm));
  const px = 64 / tallest;
  return (
    <div className="space-y-10">
      <fieldset>
        <legend className="spec mb-3">Finish</legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {products.map((p) => (
            <RadioCard key={p.id} name="finish" value={p.id} checked={productId === p.id} onChange={() => onProduct(p.id)}>
              <div className="p-4 pr-11">
                <p className="font-semibold leading-snug">{p.kind === "framed-poster" ? "Framed, ready to hang" : "Print only"}</p>
                <p className="mt-0.5 text-sm text-muted">{p.tagline}</p>
              </div>
            </RadioCard>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="spec mb-3">Size</legend>
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          {sizes.map((s) => {
            const variant = product?.variants.find((v) => v.sizeId === s.id);
            return (
              <RadioCard key={s.id} name="size" value={s.id} checked={sizeId === s.id} onChange={() => onSize(s.id)}>
                <div className="flex flex-col items-center px-2 pb-3.5 pt-6 text-center">
                  {s.id === "40x60" && <span className="absolute left-2.5 top-2.5 rounded-full bg-tint-soft px-1.5 py-0.5 text-[0.6875rem] font-semibold leading-tight text-tint-ink">Recommended</span>}
                  <div className="flex h-16 items-end">
                    <div className="rounded-[2px] bg-elevated shadow-[inset_0_0_0_1px_var(--line-strong)]" style={{ width: s.widthCm * px, height: s.heightCm * px }} aria-hidden="true" />
                  </div>
                  <p className="mt-2.5 whitespace-nowrap text-[0.9375rem] font-semibold">{s.label}</p>
                  {variant && <OfferPrice value={addMoney(variant.price, template.surcharge)} className="mt-0.5 text-sm [&_.font-semibold]:font-normal" />}
                </div>
              </RadioCard>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
