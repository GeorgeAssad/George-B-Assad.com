import type { Money } from "./money";
import type { DesignTemplate, ProductKind, SizeId, TemplateId, VehicleAsset } from "./catalog";

/* CART DOMAIN — the browser's view. It holds REFERENCES ONLY (ids + the
 * customer's personalization). Prices are never stored or trusted client-side;
 * the server resolves them from the catalog. */

/** What the customer types onto the poster. All optional except `name`. */
export interface Customization {
  readonly name: string;
  readonly text?: string;
  readonly year?: string;
  readonly location?: string;
}

export interface CartItem {
  /** Client-generated line id (opaque, only used for edit/remove). */
  readonly id: string;
  readonly productId: string;
  readonly sizeId: SizeId;
  readonly carSlug: string;
  readonly templateId: TemplateId;
  readonly customization: Customization;
  readonly quantity: number;
}

export interface Cart {
  readonly items: readonly CartItem[];
  readonly updatedAt: number;
}

/** Server-priced display data for one cart line. */
export interface QuotedLine {
  readonly item: CartItem;
  readonly productName: string;
  readonly productKind: ProductKind;
  readonly sku: string;
  readonly vehicleName: string;
  readonly generationLabel: string;
  readonly vehicle: VehicleAsset;
  readonly template: DesignTemplate;
  readonly sizeLabel: string;
  readonly unitPrice: Money;
  readonly lineTotal: Money;
}

export interface CartTotals {
  readonly subtotal: Money;
  readonly shipping: Money;
  readonly total: Money;
  /** Placeholder rule text, e.g. "Free shipping over €100". */
  readonly shippingNote: string;
}

/** Response of the server pricing endpoint. */
export interface CartQuote {
  readonly lines: readonly QuotedLine[];
  readonly totals: CartTotals;
  /** Items that could not be priced (unknown product/car); reported, not silently dropped. */
  readonly rejected: readonly { readonly itemId: string; readonly reason: string }[];
}
