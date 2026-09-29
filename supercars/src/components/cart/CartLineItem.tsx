"use client";

import Link from "next/link";
import type { QuotedLine } from "@/domain/cart";
import { PosterPreview } from "@/components/poster/PosterPreview";
import { Price } from "@/components/ui/Price";
import { IconEdit, IconTrash } from "@/components/ui/icons";
import { personalizationSummary } from "@/lib/format";
import { QuantityStepper } from "./QuantityStepper";

interface CartLineItemProps {
  readonly line: QuotedLine;
  readonly compact?: boolean;
  readonly onQuantity: (id: string, quantity: number) => void;
  readonly onRemove: (id: string) => void;
  readonly onNavigate?: () => void;
}

export function CartLineItem({ line, compact = false, onQuantity, onRemove, onNavigate }: CartLineItemProps) {
  const { item } = line;
  const label = `${line.vehicleName} ${line.productName.toLowerCase()}`;
  return (
    <li className="flex gap-4 border-b border-line py-5 last:border-b-0">
      <div className={`flex-none overflow-hidden rounded-lg border border-line shadow-[var(--shadow-lift)] ${compact ? "w-20" : "w-24 sm:w-32"}`}>
        <PosterPreview template={line.template} vehicle={line.vehicle} customization={item.customization} vehicleName={line.vehicleName} specs={line.specs} sizeId={item.sizeId} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-subtle">{line.productName}</p>
            <h3 className="h-display mt-1 truncate text-2xl">{line.vehicleName}</h3>
          </div>
          <Price value={line.lineTotal} precise className="flex-none text-base" />
        </div>
        <dl className="mt-2 space-y-0.5 text-sm text-muted">
          <div className="flex gap-2"><dt className="sr-only">Style</dt><dd>{line.template.name} style · {line.sizeLabel}</dd></div>
          <div className="flex gap-2"><dt className="sr-only">Personalization</dt><dd className="truncate">{personalizationSummary(item.customization)}</dd></div>
        </dl>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <QuantityStepper value={item.quantity} onChange={(q) => onQuantity(item.id, q)} label={label} />
          <div className="flex items-center gap-1">
            <Link href={`/create?edit=${encodeURIComponent(item.id)}`} onClick={onNavigate} className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted hover:text-fg" aria-label={`Edit customization for ${label}`}>
              <IconEdit size={15} /> Edit
            </Link>
            <button type="button" onClick={() => onRemove(item.id)} className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted hover:text-red-text" aria-label={`Remove ${label} from cart`}>
              <IconTrash size={15} /> Remove
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}
