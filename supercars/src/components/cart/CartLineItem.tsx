"use client";

import Link from "next/link";
import type { QuotedLine } from "@/domain/cart";
import { PosterPreview } from "@/components/poster/PosterPreview";
import { Price } from "@/components/ui/Price";
import { IconEdit, IconFrame, IconTrash } from "@/components/ui/icons";
import { formatPrice, personalizationSummary } from "@/lib/format";
import { QuantityStepper } from "./QuantityStepper";

interface CartLineItemProps {
  readonly line: QuotedLine;
  readonly compact?: boolean;
  readonly onQuantity: (id: string, quantity: number) => void;
  readonly onRemove: (id: string) => void;
  readonly onNavigate?: () => void;
  /** Switch a print to the framed poster of the same size (offered when the server priced an upgrade). */
  readonly onUpgrade?: (line: QuotedLine) => void;
}

export function CartLineItem({ line, compact = false, onQuantity, onRemove, onNavigate, onUpgrade }: CartLineItemProps) {
  const { item } = line;
  const label = `${line.vehicleName} ${line.productName.toLowerCase()}`;
  return (
    <li className="flex gap-4 border-b border-line py-5 last:border-b-0">
      <div className={`flex-none self-start overflow-hidden rounded-[4px] shadow-[var(--lg-edge),var(--lg-lift-1)] ${compact ? "w-20" : "w-24 sm:w-32"}`}>
        <PosterPreview template={line.template} vehicle={line.vehicle} customization={item.customization} vehicleName={line.vehicleName} specs={line.specs} sizeId={item.sizeId} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="spec">{line.productName}</p>
            <h3 className="font-semibold leading-snug">{line.vehicleName}</h3>
          </div>
          <Price value={line.lineTotal} precise className="flex-none text-base" />
        </div>
        <dl className="mt-1.5 space-y-0.5 text-sm text-muted">
          <div className="flex gap-2"><dt className="sr-only">Style</dt><dd>{line.template.name} style · {line.sizeLabel}</dd></div>
          <div className="flex gap-2"><dt className="sr-only">Personalization</dt><dd className="truncate">{personalizationSummary(item.customization)}</dd></div>
        </dl>
        {line.upgrade && onUpgrade && (
          <button type="button" onClick={() => onUpgrade(line)} className="mt-3 flex w-full items-center gap-2.5 rounded-[var(--lg-radius-sm)] bg-tint-soft px-3 py-2.5 text-left text-[0.875rem] text-fg transition-colors hover:bg-[color-mix(in_srgb,var(--lg-tint)_14%,transparent)]" aria-label={`Make the ${line.vehicleName} poster framed for ${formatPrice(line.upgrade.difference)} more`}>
            <IconFrame size={18} className="flex-none text-tint-ink" />
            <span className="min-w-0 flex-1"><strong className="font-semibold">Make it framed</strong><span className="block text-[0.8125rem] text-muted">Ready to hang, same artwork</span></span>
            <span className="flex-none font-semibold tabular-nums text-tint-ink">+{formatPrice(line.upgrade.difference)}</span>
          </button>
        )}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <QuantityStepper value={item.quantity} onChange={(q) => onQuantity(item.id, q)} label={label} />
          <div className="flex items-center gap-1">
            <Link href={`/create?edit=${encodeURIComponent(item.id)}`} onClick={onNavigate} className="inline-flex min-h-9 items-center gap-1.5 rounded-full px-2.5 text-[0.8125rem] font-medium text-muted hover:text-fg" aria-label={`Edit customization for ${label}`}>
              <IconEdit size={15} /> Edit
            </Link>
            <button type="button" onClick={() => onRemove(item.id)} className="inline-flex min-h-9 items-center gap-1.5 rounded-full px-2.5 text-[0.8125rem] font-medium text-muted hover:text-red-text" aria-label={`Remove ${label} from cart`}>
              <IconTrash size={15} /> Remove
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}
