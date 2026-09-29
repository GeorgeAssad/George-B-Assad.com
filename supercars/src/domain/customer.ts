/* CUSTOMER DOMAIN — personal data. Keep separate from catalog/order shapes and
 * never log these fields. */

export type CountryCode = string;

export interface Customer {
  /** Assigned by the server. Never accepted from the client. */
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly phone?: string;
}

/** What the checkout form is allowed to submit about the customer. */
export interface CustomerInput {
  readonly name: string;
  readonly email: string;
  readonly phone?: string;
}

export interface Address {
  readonly line1: string;
  readonly line2?: string;
  readonly city: string;
  readonly postalCode: string;
  readonly country: CountryCode;
}

export interface ShippingDestination {
  readonly code: CountryCode;
  readonly name: string;
}
