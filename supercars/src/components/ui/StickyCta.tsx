import type { ReactNode } from "react";
import { Button } from "./Button";

interface StickyCtaProps {
  readonly href: string;
  readonly label: string;
  readonly caption?: ReactNode;
}

/** Mobile-only bottom action bar for pages whose single next step is a CTA. */
export function StickyCta({ href, label, caption }: StickyCtaProps) {
  return (
    <div className="glass safe-bottom fixed inset-x-0 bottom-0 z-40 border-x-0 border-b-0 px-4 pt-3 lg:hidden">
      <div className="mx-auto flex max-w-xl items-center gap-4">
        {caption && <div className="min-w-0 flex-1 text-sm leading-tight">{caption}</div>}
        <Button href={href} size="lg" className={caption ? "flex-none" : "w-full"}>{label}</Button>
      </div>
    </div>
  );
}
