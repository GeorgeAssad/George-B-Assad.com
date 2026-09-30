/** Routes that render their own sticky bottom action bar. */
const STICKY_PREFIXES = ["/create", "/checkout"];

export function hasStickyBar(pathname: string): boolean {
  return STICKY_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * The header carries the one and only generic "Create your poster" button. It steps aside where the page is
 * already the start (the designer), the payment step, or the confirmation, so it is never shown twice or in the way.
 */
export function showsHeaderCreate(pathname: string): boolean {
  return !(hasStickyBar(pathname) || pathname.startsWith("/order/"));
}
