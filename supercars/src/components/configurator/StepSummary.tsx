import type { CarEntry, DesignTemplate, PosterSize, Product } from "@/domain/catalog";
import type { CartQuote } from "@/domain/cart";
import type { Customization } from "@/domain/cart";
import { QuantityStepper } from "@/components/cart/QuantityStepper";
import { Price } from "@/components/ui/Price";
import { Skeleton } from "@/components/ui/Skeleton";
import { IconFrame, IconLock, IconPackage, IconShield } from "@/components/ui/icons";
import { DeliveryEstimate } from "@/components/offers/DeliveryEstimate";
import { formatMoney, formatPrice, personalizationSummary } from "@/lib/format";
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
  /** Switch to the framed poster (offered for prints). */
  readonly onUpgrade: (productId: string) => void;
  readonly delivery: { readonly minDays: number; readonly maxDays: number };
}

export function StepSummary({ entry, template, product, size, customization, quantity, onQuantity, onEdit, quote, quoteFailed, onUpgrade, delivery }: StepSummaryProps) {
  const rows: { label: string; value: string; step: Step }[] = [
    { label: "Product", value: product.name, step: 2 },
    { label: "Vehicle", value: `${entry.generation.displayName} · ${entry.generation.specs.years}`, step: 1 },
    { label: "Style", value: template.name, step: 2 },
    { label: "Size", value: size.label, step: 2 },
    { label: "Personalization", value: personalizationSummary(customization), step: 3 },
  ];
  const line = quote?.lines[0];
  const totals = quote?.totals;
  const discounted = totals && totals.discount.amount > 0 ? { ...totals.subtotal, amount: totals.subtotal.amount - totals.discount.amount } : null;

  return (
    <div>
      {line?.upgrade && (
        <button type="button" onClick={() => onUpgrade(line.upgrade!.productId)} className="mb-4 flex w-full items-center gap-3 rounded-[var(--lg-radius-lg)] bg-tint-soft px-4 py-3.5 text-left transition-colors hover:bg-[color-mix(in_srgb,var(--lg-tint)_14%,transparent)]">
          <span className="icon-tile icon-tile-soft !size-10 !bg-surface"><IconFrame size={20} /></span>
          <span className="min-w-0 flex-1">
            <strong className="block font-semibold">Make it framed, ready to hang</strong>
            <span className="block text-[0.875rem] text-muted">Slim black frame and glazing, same artwork. Hanging hardware included.</span>
          </span>
          <span className="flex-none font-semibold tabular-nums text-tint-ink">+{formatPrice(line.upgrade.difference)}</span>
        </button>
      )}
      <dl className="card divide-y divide-line">
        {rows.map((r) => (
          <div key={r.label} className="flex items-start justify-between gap-4 px-5 py-4">
            <div className="min-w-0">
              <dt className="spec">{r.label}</dt>
              <dd className="mt-1 break-words font-medium">{r.value}</dd>
            </div>
            <button type="button" onClick={() => onEdit(r.step)} className="flex-none rounded-full text-sm font-medium text-red-text hover:underline" aria-label={`Change ${r.label.toLowerCase()}`}>Change</button>
          </div>
        ))}
        <div className="flex items-center justify-between gap-4 px-5 py-4">
          <div><dt className="spec">Quantity</dt><dd className="mt-1.5"><QuantityStepper value={quantity} onChange={onQuantity} label={`${entry.generation.displayName} poster`} /></dd></div>
          <div className="text-right"><dt className="spec">Price</dt><dd className="mt-1 text-2xl tracking-[-0.02em]">{line && discounted ? <><span className="sr-only">Was {formatMoney(totals!.subtotal)}, now </span><Price value={discounted} precise className="[&>span]:text-red-text" /><s aria-hidden="true" className="ml-2 text-base text-subtle">{formatMoney(totals!.subtotal)}</s></> : line ? <Price value={line.lineTotal} precise /> : quoteFailed ? <span className="text-sm text-muted">Unavailable</span> : <Skeleton className="ml-auto h-7 w-24" />}</dd></div>
        </div>
      </dl>
      <p className="mt-3 text-[0.8125rem] text-subtle">You can change anything before paying. Price is calculated by our server{totals?.offer ? `, ${totals.offer.label} included` : ""}; shipping is added at checkout.</p>
      <p className="mt-2 flex items-center gap-2 text-[0.9375rem] font-medium"><IconPackage size={17} className="flex-none text-subtle" /><DeliveryEstimate minDays={delivery.minDays} maxDays={delivery.maxDays} /></p>
      <ul className="mt-6 grid grid-cols-1 gap-3 text-sm text-muted sm:grid-cols-3">
        <li className="flex items-center gap-2"><IconLock size={16} className="flex-none text-subtle" /> Demo checkout, no card needed</li>
        <li className="flex items-center gap-2"><IconPackage size={16} className="flex-none text-subtle" /> Printed &amp; shipped to you</li>
        <li className="flex items-center gap-2"><IconShield size={16} className="flex-none text-subtle" /> Checked before it prints</li>
      </ul>
    </div>
  );
}
