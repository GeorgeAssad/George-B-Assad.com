import type { ReactNode } from "react";

type Tone = "neutral" | "red" | "outline" | "demo";

const TONES: Record<Tone, string> = {
  neutral: "bg-elevated text-muted border-line",
  red: "bg-red text-on-red border-transparent",
  outline: "bg-transparent text-fg border-line-strong",
  demo: "bg-transparent text-red-text border-red-text/50",
};

export function Badge({ children, tone = "neutral", className = "" }: { children: ReactNode; tone?: Tone; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] ${TONES[tone]} ${className}`}>
      {children}
    </span>
  );
}
