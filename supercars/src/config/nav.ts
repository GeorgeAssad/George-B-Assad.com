export interface NavLink { readonly label: string; readonly href: string }

/**
 * The only site navigation. It lives in the header (and the phone menu, which is the same list) and nowhere else,
 * so no destination is ever offered twice on one screen.
 */
export const primaryNav: readonly NavLink[] = [
  { label: "Cars", href: "/cars" },
  { label: "Shop", href: "/shop" },
  { label: "How it works", href: "/how-it-works" },
  { label: "About", href: "/about" },
  { label: "Track order", href: "/track" },
];

/** One-line footer: legal and policy pages only. */
export const footerLinks: readonly NavLink[] = [
  { label: "Shipping & returns", href: "/shipping" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Legal", href: "/legal" },
  { label: "Photo credits", href: "/credits" },
];
