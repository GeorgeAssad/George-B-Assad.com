"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { IconMenu } from "@/components/ui/icons";
import { CartButton } from "@/components/cart/CartButton";
import { primaryNav } from "@/config/nav";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

const isActive = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  // The menu is tied to the path it was opened on, so navigating closes it without an effect.
  const menuOpen = menuFor === pathname;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-40 transition-[background,border-color,backdrop-filter] duration-300 ${scrolled ? "glass border-x-0 border-t-0" : "border-b border-transparent bg-transparent"}`}>
      <div className="container-x flex h-16 items-center justify-between gap-4 lg:h-[4.5rem]">
        <Logo />

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {primaryNav.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <li key={link.href}>
                  <Link href={link.href} aria-current={active ? "page" : undefined} className={`relative rounded-full px-4 py-2 text-[0.8125rem] font-semibold uppercase tracking-[0.14em] transition-colors ${active ? "text-fg" : "text-muted hover:text-fg"}`}>
                    {link.label}
                    <span className={`absolute inset-x-4 -bottom-0.5 h-0.5 origin-left bg-red transition-transform duration-300 ${active ? "scale-x-100" : "scale-x-0"}`} aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <CartButton className="hidden lg:flex" />
          <Button href="/create" size="sm" className="hidden lg:inline-flex">Create your poster</Button>
          <button type="button" onClick={() => setMenuFor(pathname)} className="flex size-10 items-center justify-center rounded-full text-fg hover:bg-elevated lg:hidden" aria-label="Open menu" aria-haspopup="dialog">
            <IconMenu />
          </button>
        </div>
      </div>

      <Drawer open={menuOpen} onClose={() => setMenuFor(null)} title="Menu">
        <nav aria-label="Mobile">
          <ul className="divide-y divide-line">
            {primaryNav.map((link) => (
              <li key={link.href}>
                <Link href={link.href} onClick={() => setMenuFor(null)} aria-current={isActive(pathname, link.href) ? "page" : undefined} className="flex items-center justify-between py-4 text-lg font-semibold uppercase tracking-[0.12em] text-muted hover:text-fg aria-[current=page]:text-fg">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <Button href="/create" size="lg" className="mt-6 w-full" onClick={() => setMenuFor(null)}>Create your poster</Button>
        </nav>
      </Drawer>
    </header>
  );
}
