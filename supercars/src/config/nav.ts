export interface NavLink { readonly label: string; readonly href: string }

/** The header has no menu: the only destinations a customer needs while ordering are "Track order" and the cart. */
export const trackLink: NavLink = { label: "Track order", href: "/track" };

/** One-line footer. Everything here is either legally required or answers "where is my order / what will it cost". */
export const footerLinks: readonly NavLink[] = [
  { label: "Shipping & returns", href: "/shipping" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Legal", href: "/legal" },
  { label: "Photo credits", href: "/credits" },
];
