/** Routes that render their own sticky bottom action bar, so floating chrome (tab bar, chat button) steps aside. */
const STICKY_PREFIXES = ["/create", "/checkout"];
const CAR_DETAIL = /^\/cars\/[^/]+$/;

export function hasStickyBar(pathname: string): boolean {
  return CAR_DETAIL.test(pathname) || STICKY_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
