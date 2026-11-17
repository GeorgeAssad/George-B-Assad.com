/** Routes that render their own sticky bottom action bar. */
const STICKY_PREFIXES = ["/create", "/checkout"];

export function hasStickyBar(pathname: string): boolean {
  return STICKY_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * Every page offers exactly one generic "Create your poster" button. On the home page it is the hero's primary
 * action; on every other page it sits in the navigation bar. It steps aside where the page already is the start
 * (the designer), the payment step, or the confirmation, so it is never shown twice or in the way.
 */
export function showsHeaderCreate(pathname: string): boolean {
  return !(pathname === "/" || hasStickyBar(pathname) || pathname.startsWith("/order/"));
}
