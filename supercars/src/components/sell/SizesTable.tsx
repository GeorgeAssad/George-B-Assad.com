import type { PosterSize, Product } from "@/domain/catalog";
import { OfferPrice } from "@/components/offers/OfferPrice";

const RECOMMENDED = "40x60";

/** Every size as a print and framed, with the running offer shown on each price. */
export function SizesTable({ sizes, products, className = "" }: { sizes: readonly PosterSize[]; products: readonly Product[]; className?: string }) {
  const ordered = [...products].sort((a) => (a.kind === "poster" ? -1 : 1));
  const tallest = Math.max(...sizes.map((s) => s.heightCm));
  return (
    <div className={`card overflow-hidden ${className}`}>
      <table className="w-full text-left text-[0.9375rem]">
        <caption className="sr-only">Sizes and prices</caption>
        <thead>
          <tr className="border-b-[0.5px] border-line text-[0.8125rem] text-subtle">
            <th scope="col" className="px-4 py-3 font-medium sm:px-6">Size</th>
            {ordered.map((p) => <th key={p.id} scope="col" className="px-4 py-3 text-right font-medium sm:px-6">{p.kind === "framed-poster" ? "Framed" : "Print"}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y-[0.5px] divide-line">
          {sizes.map((s) => (
            <tr key={s.id}>
              <th scope="row" className="px-4 py-3.5 font-normal sm:px-6">
                <span className="flex items-center gap-3">
                  <span aria-hidden="true" className="flex h-9 w-7 flex-none items-end justify-center"><span className="block rounded-[1px] bg-elevated shadow-[inset_0_0_0_1px_var(--line-strong)]" style={{ width: (s.widthCm / tallest) * 26, height: (s.heightCm / tallest) * 34 }} /></span>
                  <span className="whitespace-nowrap font-semibold">{s.label}</span>
                  {s.id === RECOMMENDED && <span className="rounded-full bg-tint-soft px-2 py-0.5 text-[0.75rem] font-semibold text-tint-ink max-sm:hidden">Recommended</span>}
                </span>
              </th>
              {ordered.map((p) => {
                const v = p.variants.find((x) => x.sizeId === s.id);
                return <td key={p.id} className="px-4 py-3.5 text-right sm:px-6">{v ? <OfferPrice value={v.price} /> : "—"}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="border-t-[0.5px] border-line px-4 py-3 text-[0.8125rem] text-subtle sm:px-6">The Luxury style adds a small surcharge. You choose the size and finish in the designer.</p>
    </div>
  );
}
