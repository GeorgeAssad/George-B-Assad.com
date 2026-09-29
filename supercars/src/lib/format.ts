import type { Money } from "@/domain/money";

const moneyFormatters = new Map<string, Intl.NumberFormat>();

export function formatMoney({ amount, currency }: Money, locale = "en-IE"): string {
  const key = `${locale}:${currency}`;
  let fmt = moneyFormatters.get(key);
  if (!fmt) {
    fmt = new Intl.NumberFormat(locale, { style: "currency", currency, minimumFractionDigits: 2 });
    moneyFormatters.set(key, fmt);
  }
  return fmt.format(amount / 100);
}

/** Whole-euro display for catalog prices ("€79"), falling back to cents when needed. */
export function formatPrice(m: Money, locale = "en-IE"): string {
  return m.amount % 100 === 0
    ? new Intl.NumberFormat(locale, { style: "currency", currency: m.currency, maximumFractionDigits: 0 }).format(m.amount / 100)
    : formatMoney(m, locale);
}

export function formatDate(iso: string, locale = "en-GB"): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(d);
}

export function formatDateRange(from: string, to: string): string {
  return `${formatDate(from)} – ${formatDate(to)}`;
}
