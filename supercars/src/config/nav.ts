export interface NavLink { readonly label: string; readonly href: string }

export const primaryNav: readonly NavLink[] = [
  { label: "Shop", href: "/shop" },
  { label: "Cars", href: "/cars" },
  { label: "How it works", href: "/how-it-works" },
  { label: "About", href: "/about" },
  { label: "Track order", href: "/track" },
];

export const footerNav = {
  shop: [
    { label: "Create your poster", href: "/create" },
    { label: "Shop posters", href: "/shop" },
    { label: "Explore cars", href: "/cars" },
  ],
  company: [
    { label: "How it works", href: "/how-it-works" },
    { label: "About", href: "/about" },
  ],
  service: [
    { label: "Track order", href: "/track" },
    { label: "Shipping", href: "/shipping" },
    { label: "Returns", href: "/returns" },
  ],
  legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Legal", href: "/legal" },
  ],
} as const satisfies Record<string, readonly NavLink[]>;
