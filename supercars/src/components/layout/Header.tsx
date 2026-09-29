"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CartButton } from "@/components/cart/CartButton";
import { IconPlus, IconTruck } from "@/components/ui/icons";
import { trackLink } from "@/config/nav";
import { hasOwnCreateCta } from "@/lib/layout-rules";
import { Logo } from "./Logo";

/**
 * Logo, "Track order", cart. That is all a customer needs while ordering.
 * The "Create" button appears only on pages that do not already have their own start button.
 */
export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const showCreate = !hasOwnCreateCta(pathname);
  const tracking = pathname === trackLink.href;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-40 transition-[background,border-color,backdrop-filter] duration-300 ${scrolled ? "glass border-x-0 border-t-0" : "border-b border-transparent bg-transparent"}`}>
      <div className="container-x flex h-16 items-center justify-between gap-3 lg:h-[4.5rem]">
        <Logo />
        <nav aria-label="Primary" className="flex items-center gap-1 sm:gap-2">
          {!tracking && (
            <Link href={trackLink.href} className="flex h-10 items-center gap-2 rounded-full px-3 text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-muted transition-colors hover:bg-elevated hover:text-fg sm:px-4">
              <IconTruck size={18} className="sm:hidden" />
              <span className="max-sm:sr-only">{trackLink.label}</span>
            </Link>
          )}
          <CartButton />
          {showCreate && (
            <Button href="/create" size="sm" className="max-sm:size-10 max-sm:!min-h-0 max-sm:!px-0">
              <IconPlus size={20} className="sm:hidden" />
              <span className="max-sm:sr-only">Create your poster</span>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
