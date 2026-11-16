import type { ReactNode } from "react";

type Tone = "neutral" | "red" | "outline" | "demo";

const TONES: Record<Tone, string> = {
  neutral: "bg-fill text-muted",
  red: "bg-red text-on-red",
  outline: "bg-transparent text-fg shadow-[inset_0_0_0_1px_var(--line-strong)]",
  demo: "bg-tint-soft text-tint-ink",
};

export function Badge({ children, tone = "neutral", className = "" }: { children: ReactNode; tone?: Tone; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold leading-[1.4] ${TONES[tone]} ${className}`}>
      {children}
    </span>
  );
}
