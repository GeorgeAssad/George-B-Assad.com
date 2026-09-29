"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { IconCart, IconGauge, IconPackage, IconPlus, IconTruck } from "@/components/ui/icons";
import { useCart } from "@/lib/use-cart";
import { openCartDrawer } from "@/lib/ui-store";

/** Routes that provide their own sticky action bar, so the tab bar steps aside. */
const HIDDEN_ON = ["/create", "/checkout"];
/** Car detail pages show a sticky "Create this car" bar instead. */
const CAR_DETAIL = /^\/cars\/[^/]+$/;

interface TabProps { readonly href: string; readonly label: string; readonly icon: ReactNode; readonly active: boolean }

function Tab({ href, label, icon, active }: TabProps) {
  return (
    <li>
      <Link href={href} aria-current={active ? "page" : undefined} className={`flex flex-col items-center gap-1 px-2 py-2 text-[0.625rem] font-semibold uppercase tracking-[0.12em] transition-colors ${active ? "text-fg" : "text-muted"}`}>
        <span className={active ? "text-red-text" : ""}>{icon}</span>
        {label}
      </Link>
    </li>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const { count, hydrated } = useCart();
  if (CAR_DETAIL.test(pathname) || HIDDEN_ON.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return null;
  const on = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav aria-label="Quick navigation" className="glass safe-bottom fixed inset-x-0 bottom-0 z-40 border-x-0 border-b-0 lg:hidden">
      <ul className="mx-auto grid max-w-md grid-cols-5 items-end px-2 pt-1">
        <Tab href="/shop" label="Shop" icon={<IconPackage size={21} />} active={on("/shop")} />
        <Tab href="/cars" label="Cars" icon={<IconGauge size={21} />} active={on("/cars")} />
        <li className="flex justify-center">
          <Link href="/create" className="-mt-5 flex flex-col items-center gap-1 text-[0.625rem] font-semibold uppercase tracking-[0.12em]" aria-label="Create your poster">
            <span className="flex size-12 items-center justify-center rounded-full bg-red text-on-red shadow-[0_10px_26px_-8px_var(--red)] transition-transform active:scale-95"><IconPlus size={24} /></span>
            <span className="text-fg">Create</span>
          </Link>
        </li>
        <Tab href="/track" label="Track" icon={<IconTruck size={21} />} active={on("/track")} />
        <li>
          <button type="button" onClick={openCartDrawer} className="relative flex w-full flex-col items-center gap-1 px-2 py-2 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-muted" aria-label={hydrated && count > 0 ? `Open cart, ${count} items` : "Open cart"} aria-haspopup="dialog">
            <span className="relative">
              <IconCart size={21} />
              {hydrated && count > 0 && <span className="absolute -right-2 -top-1.5 min-w-4 rounded-full bg-red px-1 text-center text-[0.5625rem] font-bold leading-4 text-on-red tabular-nums">{count}</span>}
            </span>
            Cart
          </button>
        </li>
      </ul>
    </nav>
  );
}
