import type { Money } from "./money";
import type { CarSpecs, DesignTemplate, ProductKind, SizeId, TemplateId, VehicleAsset } from "./catalog";

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
  readonly specs: Pick<CarSpecs, "years" | "powerKw" | "torqueNm" | "seats" | "drivetrain">;
  readonly vehicle: VehicleAsset;
  readonly template: DesignTemplate;
  readonly sizeLabel: string;
  readonly unitPrice: Money;
  readonly lineTotal: Money;
  /** For a print: what the same poster costs framed (server-priced), so the cart can offer the upgrade. */
  readonly upgrade?: { readonly productId: string; readonly unitPrice: Money; readonly difference: Money };
}

/** The discount offer applied to a quote (see lib/promotions). */
export interface AppliedOffer {
  readonly id: string;
  readonly label: string;
  readonly percent: number;
  /** ISO time the offer ends (for the countdown). */
  readonly endsAt: string;
}

/** A free-shipping offer that is running, and how far the cart is from it. */
export interface FreeShippingStatus {
  readonly id: string;
  readonly label: string;
  readonly minSubtotal: Money;
  /** What is still missing to qualify (zero when it qualifies). */
  readonly remaining: Money;
  readonly endsAt: string;
}

export interface CartTotals {
  /** Sum of the lines, before any discount. */
  readonly subtotal: Money;
  /** Discount from a running offer (zero when none). */
  readonly discount: Money;
  readonly shipping: Money;
  readonly total: Money;
  readonly offer: AppliedOffer | null;
  readonly freeShipping: FreeShippingStatus | null;
  /** One line about shipping, e.g. "Free shipping on orders over €80 until 29 Nov". Empty when there is nothing to say. */
  readonly shippingNote: string;
}

/** Response of the server pricing endpoint. */
export interface CartQuote {
  readonly lines: readonly QuotedLine[];
  readonly totals: CartTotals;
  /** Items that could not be priced (unknown product/car); reported, not silently dropped. */
  readonly rejected: readonly { readonly itemId: string; readonly reason: string }[];
}
