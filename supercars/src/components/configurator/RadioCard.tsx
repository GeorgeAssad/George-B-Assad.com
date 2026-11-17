import type { ReactNode } from "react";
import { IconCheck } from "@/components/ui/icons";

interface RadioCardProps {
  readonly name: string;
  readonly value: string;
  readonly checked: boolean;
  readonly onChange: () => void;
  readonly children: ReactNode;
  readonly className?: string;
  /** Where the selection mark sits. Defaults to the top-right corner. */
  readonly markClassName?: string;
  /** "always" shows an empty ring until selected; "checked" shows the mark only on the selected card (for cards that are pictures). */
  readonly mark?: "always" | "checked";
}

/**
 * Selectable card built on a real (invisible, card-sized) radio input, so arrow-key
 * navigation, form semantics and screen-reader announcements come for free.
 * Selected = an accent ring and a filled check; unselected = a hairline edge and an empty ring.
 */
export function RadioCard({ name, value, checked, onChange, children, className = "", markClassName = "right-3 top-3", mark = "always" }: RadioCardProps) {
  return (
    <label
      className={`group relative block cursor-pointer rounded-[var(--lg-radius-lg)] bg-surface transition-[box-shadow,transform] duration-300 active:scale-[0.985] has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[color-mix(in_srgb,var(--lg-tint)_60%,transparent)] ${checked ? "shadow-[0_0_0_2px_var(--lg-tint-fill)]" : "shadow-[var(--lg-edge)] hover:shadow-[var(--lg-edge),var(--lg-lift-1)]"} ${className}`}
    >
      {/* The real radio covers the whole card (invisible), so a tap anywhere, a screen reader's activation and the focus rectangle all land on it. */}
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="absolute inset-0 size-full cursor-pointer appearance-none rounded-[inherit] opacity-0" />
      {children}
      <span
        aria-hidden="true"
        className={`absolute flex size-[1.375rem] items-center justify-center rounded-full transition-[background-color,box-shadow,transform,opacity] duration-300 ${markClassName} ${checked ? "scale-100 bg-red text-on-red" : mark === "checked" ? "scale-75 opacity-0" : "scale-95 bg-surface text-transparent shadow-[inset_0_0_0_1.5px_var(--line-strong)]"}`}
      >
        <IconCheck size={13} />
      </span>
    </label>
  );
}
