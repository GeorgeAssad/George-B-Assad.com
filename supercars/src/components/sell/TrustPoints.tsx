import type { ReactNode } from "react";
import { IconCheck } from "@/components/ui/icons";

/** A short row of true reassurances (no invented guarantees). */
export function TrustPoints({ items, className = "" }: { items: readonly ReactNode[]; className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-x-4 gap-y-1.5 text-[0.875rem] text-muted ${className}`}>
      {items.map((item, i) => (
        <li key={i} className="flex items-center gap-1.5"><IconCheck size={15} className="flex-none text-positive" />{item}</li>
      ))}
    </ul>
  );
}
