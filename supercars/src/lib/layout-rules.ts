/** Routes that render their own sticky bottom action bar. */
const STICKY_PREFIXES = ["/create", "/checkout"];

export function hasStickyBar(pathname: string): boolean {
  return STICKY_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * Pages that already carry their own "start your poster" action (car tiles, the car page button, the designer,
 * the confirmation page). Everywhere else the header offers exactly one "Create" button, so no page ever shows
 * the same call to action twice.
 */
const CAR_DETAIL = /^\/cars\/[^/]+$/;
export function hasOwnCreateCta(pathname: string): boolean {
  return pathname === "/" || CAR_DETAIL.test(pathname) || hasStickyBar(pathname) || pathname.startsWith("/order/");
}
