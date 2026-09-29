/** Adds business days (Mon–Fri) to a date. Pure and timezone-stable (UTC). */
export function addBusinessDays(from: Date, days: number): Date {
  const d = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()));
  let remaining = days;
  while (remaining > 0) {
    d.setUTCDate(d.getUTCDate() + 1);
    const dow = d.getUTCDay();
    if (dow !== 0 && dow !== 6) remaining -= 1;
  }
  return d;
}

const isoDay = (d: Date) => d.toISOString().slice(0, 10);

export function estimateDelivery(from: Date, minDays: number, maxDays: number): { from: string; to: string } {
  return { from: isoDay(addBusinessDays(from, minDays)), to: isoDay(addBusinessDays(from, maxDays)) };
}
