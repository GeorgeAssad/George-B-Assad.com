/** Routes that render their own sticky bottom action bar. */
const STICKY_PREFIXES = ["/create", "/checkout"];

export function hasStickyBar(pathname: string): boolean {
  return STICKY_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * Every page offers exactly one visible generic "Create your poster" button. On the home page it is the hero's
 * primary action, and the header's button only appears once that one has scrolled out of view ("after-hero");
 * on every other page it sits in the navigation bar ("always"). It steps aside where the page already is the start
 * (the designer), the payment step, or the confirmation ("never").
 */
export type HeaderCreateMode = "always" | "after-hero" | "never";

export function headerCreateMode(pathname: string): HeaderCreateMode {
  if (pathname === "/") return "after-hero";
  return hasStickyBar(pathname) || pathname.startsWith("/order/") ? "never" : "always";
}

/** True where the header shows its Create button from the start. */
export function showsHeaderCreate(pathname: string): boolean {
  return headerCreateMode(pathname) === "always";
}
