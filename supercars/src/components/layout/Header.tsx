"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { IconMenu } from "@/components/ui/icons";
import { CartButton } from "@/components/cart/CartButton";
import { primaryNav } from "@/config/nav";
import { headerCreateMode } from "@/lib/layout-rules";
import { useScrolledPast } from "@/lib/use-scrolled-past";
import { Logo } from "./Logo";

const isActive = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

/**
 * The site's single navigation: a floating glass bar with five links, the cart and ONE "Create your poster" button.
 * On phones the same five links live in a menu, so nothing is offered twice on screen.
 */
export function Header() {
  const pathname = usePathname();
  const [menuFor, setMenuFor] = useState<string | null>(null);
  // The menu is tied to the path it was opened on, so navigating closes it without an effect.
  const menuOpen = menuFor === pathname;
  const mode = headerCreateMode(pathname);
  // On Home the hero has the button; the header's one fades in once the hero's has scrolled away.
  const heroGone = useScrolledPast(mode === "after-hero" ? "[data-hero-cta]" : null);
  const showCreate = mode === "always" || (mode === "after-hero" && heroGone);

  return (
    <header className="lg-nav lg-nav--floating site-nav">
      <div className="flex h-14 items-center gap-1 pl-4 pr-2 sm:pl-5">
        <Logo />

        <nav aria-label="Primary" className="ml-5 hidden lg:block">
          <ul className="flex items-center gap-0.5">
            {primaryNav.map((link) => (
              <li key={link.href}>
                <Link href={link.href} prefetch={false} aria-current={isActive(pathname, link.href) ? "page" : undefined} className="nav-link">{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <span className="flex-1" />

        <CartButton />
        {showCreate && (
          <Button href="/create" size="sm" aria-label="Create your poster" className={`ml-1 ${mode === "after-hero" ? "page-enter" : ""}`}>
            <span className="sm:hidden">Create</span>
            <span className="max-sm:hidden">Create your poster</span>
          </Button>
        )}
        <button type="button" onClick={() => setMenuFor(pathname)} className="lg-icon-button lg:hidden" aria-label="Open menu" aria-haspopup="dialog">
          <IconMenu />
        </button>
      </div>

      <Drawer open={menuOpen} onClose={() => setMenuFor(null)} title="Menu">
        <nav aria-label="Mobile">
          <ul className="lg-list">
            {primaryNav.map((link) => (
              <li key={link.href} className="!p-0">
                <Link href={link.href} prefetch={false} onClick={() => setMenuFor(null)} aria-current={isActive(pathname, link.href) ? "page" : undefined} className="flex min-h-12 w-full items-center px-4 text-[1.0625rem] text-fg no-underline aria-[current=page]:font-semibold aria-[current=page]:text-red-text">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Drawer>
    </header>
  );
}
