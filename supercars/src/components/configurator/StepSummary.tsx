import type { CarEntry, DesignTemplate, PosterSize, Product } from "@/domain/catalog";
import type { CartQuote } from "@/domain/cart";
import type { Customization } from "@/domain/cart";
import { QuantityStepper } from "@/components/cart/QuantityStepper";
import { Price } from "@/components/ui/Price";
import { Skeleton } from "@/components/ui/Skeleton";
import { IconLock, IconPackage, IconShield } from "@/components/ui/icons";
import { personalizationSummary } from "@/lib/format";
import type { Step } from "./config-state";

interface StepSummaryProps {
  readonly entry: CarEntry;
  readonly template: DesignTemplate;
  readonly product: Product;
  readonly size: PosterSize;
  readonly customization: Customization;
  readonly quantity: number;
  readonly onQuantity: (q: number) => void;
  readonly onEdit: (step: Step) => void;
  readonly quote: CartQuote | null;
  readonly quoteFailed: boolean;
}

export function StepSummary({ entry, template, product, size, customization, quantity, onQuantity, onEdit, quote, quoteFailed }: StepSummaryProps) {
  const rows: { label: string; value: string; step: Step }[] = [
    { label: "Product", value: product.name, step: 2 },
    { label: "Vehicle", value: `${entry.generation.displayName} · ${entry.generation.specs.years}`, step: 1 },
    { label: "Style", value: template.name, step: 2 },
    { label: "Size", value: size.label, step: 2 },
    { label: "Personalization", value: personalizationSummary(customization), step: 3 },
  ];
  const line = quote?.lines[0];

  return (
    <div>
      <dl className="divide-y divide-line rounded-2xl border border-line bg-surface">
        {rows.map((r) => (
          <div key={r.label} className="flex items-start justify-between gap-4 px-5 py-4">
            <div className="min-w-0">
              <dt className="spec">{r.label}</dt>
              <dd className="mt-1 break-words font-medium">{r.value}</dd>
            </div>
            <button type="button" onClick={() => onEdit(r.step)} className="flex-none text-xs font-semibold uppercase tracking-[0.12em] text-muted underline underline-offset-4 hover:text-fg" aria-label={`Change ${r.label.toLowerCase()}`}>Change</button>
          </div>
        ))}
        <div className="flex items-center justify-between gap-4 px-5 py-4">
          <div><dt className="spec">Quantity</dt><dd className="mt-1.5"><QuantityStepper value={quantity} onChange={onQuantity} label={`${entry.generation.displayName} poster`} /></dd></div>
          <div className="text-right"><dt className="spec">Price</dt><dd className="mt-1 text-2xl">{line ? <Price value={line.lineTotal} precise /> : quoteFailed ? <span className="text-sm text-muted">Unavailable</span> : <Skeleton className="ml-auto h-7 w-24" />}</dd></div>
        </div>
      </dl>
      <p className="mt-3 text-xs text-subtle">Price is calculated by our server from the catalog. Shipping is added at checkout.</p>
      <ul className="mt-6 grid grid-cols-1 gap-3 text-sm text-muted sm:grid-cols-3">
        <li className="flex items-center gap-2"><IconLock size={16} className="text-red-text" /> Demo checkout, no card needed</li>
        <li className="flex items-center gap-2"><IconPackage size={16} className="text-red-text" /> Printed &amp; shipped to you</li>
        <li className="flex items-center gap-2"><IconShield size={16} className="text-red-text" /> Checked before it prints</li>
      </ul>
    </div>
  );
}
