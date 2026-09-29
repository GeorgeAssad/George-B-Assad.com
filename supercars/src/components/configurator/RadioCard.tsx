import type { ReactNode } from "react";

interface RadioCardProps {
  readonly name: string;
  readonly value: string;
  readonly checked: boolean;
  readonly onChange: () => void;
  readonly children: ReactNode;
  readonly className?: string;
}

/**
 * Selectable card built on a real (visually hidden) radio input, so arrow-key
 * navigation, form semantics and screen-reader announcements come for free.
 */
export function RadioCard({ name, value, checked, onChange, children, className = "" }: RadioCardProps) {
  return (
    <label className={`group relative block cursor-pointer rounded-2xl border bg-surface transition-[border-color,box-shadow,transform] duration-300 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-fg ${checked ? "border-red shadow-[0_0_0_1px_var(--red)]" : "border-line hover:border-line-strong"} ${className}`}>
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="sr-only" />
      {children}
      <span aria-hidden="true" className={`absolute right-3 top-3 flex size-6 items-center justify-center rounded-full border text-[0.7rem] transition-all duration-300 ${checked ? "scale-100 border-red bg-red text-on-red" : "scale-90 border-white/50 bg-black/25 text-transparent"}`}>✓</span>
    </label>
  );
}
