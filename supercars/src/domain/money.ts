/** Currencies the storefront can price in. Extend when adding markets. */
export type CurrencyCode = "EUR";

/** Money is ALWAYS integer minor units (cents). Never floats. */
export interface Money {
  readonly amount: number;
  readonly currency: CurrencyCode;
}

export const DEFAULT_CURRENCY: CurrencyCode = "EUR";

export const money = (amount: number, currency: CurrencyCode = DEFAULT_CURRENCY): Money => {
  if (!Number.isSafeInteger(amount)) {
    throw new RangeError("Money amount must be an integer number of minor units");
  }
  return { amount, currency };
};

export const addMoney = (a: Money, b: Money): Money => {
  if (a.currency !== b.currency) throw new RangeError("Currency mismatch");
  return money(a.amount + b.amount, a.currency);
};

export const multiplyMoney = (a: Money, factor: number): Money => {
  if (!Number.isSafeInteger(factor)) throw new RangeError("Factor must be an integer");
  return money(a.amount * factor, a.currency);
};
