"use client";

import { useEffect, useRef } from "react";
import { IconCart } from "@/components/ui/icons";
import { useCart } from "@/lib/use-cart";
import { openCartDrawer } from "@/lib/ui-store";

/** Header cart trigger. The badge animates briefly when the count increases. */
export function CartButton({ className = "" }: { className?: string }) {
  const { count, hydrated } = useCart();
  const badgeRef = useRef<HTMLSpanElement>(null);
  const prev = useRef(0);

  useEffect(() => {
    if (hydrated && count > prev.current) {
      badgeRef.current?.animate([{ transform: "scale(1)" }, { transform: "scale(1.35)" }, { transform: "scale(1)" }], { duration: 420, easing: "cubic-bezier(0.22,1,0.36,1)" });
    }
    prev.current = count;
  }, [count, hydrated]);

  return (
    <button type="button" onClick={openCartDrawer} className={`relative flex size-10 items-center justify-center rounded-full text-fg transition-colors hover:bg-elevated ${className}`} aria-label={hydrated && count > 0 ? `Open cart, ${count} item${count === 1 ? "" : "s"}` : "Open cart"} aria-haspopup="dialog">
      <IconCart size={21} />
      {hydrated && count > 0 && (
        <span ref={badgeRef} className="absolute -right-0.5 -top-0.5 flex min-w-[1.15rem] items-center justify-center rounded-full bg-red px-1 text-[0.625rem] font-bold leading-[1.15rem] text-on-red tabular-nums">
          {count}
        </span>
      )}
    </button>
  );
}
