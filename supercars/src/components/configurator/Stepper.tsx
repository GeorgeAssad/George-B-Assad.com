"use client";

import { STEPS, type Step } from "./config-state";

interface StepperProps {
  readonly current: Step;
  readonly maxStep: Step;
  readonly onGo: (step: Step) => void;
}

/** Progress indicator: labelled steps on desktop, compact counter + bar on mobile. */
export function Stepper({ current, maxStep, onGo }: StepperProps) {
  const pct = ((current - 1) / (STEPS.length - 1)) * 100;
  const label = STEPS.find((s) => s.id === current)?.label ?? "";
  return (
    <nav aria-label="Configurator progress">
      <p className="spec mb-3 lg:hidden">Step {current} of {STEPS.length} — <span className="text-fg">{label}</span></p>
      <div className="relative h-0.5 overflow-hidden rounded-full bg-line lg:hidden" aria-hidden="true">
        <div className="absolute inset-y-0 left-0 bg-red transition-[width] duration-500 ease-out" style={{ width: `${((current) / STEPS.length) * 100}%` }} />
      </div>

      <ol className="relative hidden grid-cols-4 gap-2 lg:grid">
        <span aria-hidden="true" className="absolute left-0 right-0 top-[0.95rem] h-px bg-line" />
        <span aria-hidden="true" className="absolute left-0 top-[0.95rem] h-px bg-red transition-[width] duration-500 ease-out" style={{ width: `${pct}%` }} />
        {STEPS.map((s) => {
          const done = s.id < current;
          const active = s.id === current;
          const reachable = s.id <= maxStep && !active;
          const body = (
            <>
              <span className={`relative z-10 flex size-8 items-center justify-center rounded-full border text-xs font-bold tabular-nums transition-colors duration-300 ${active ? "border-red bg-red text-on-red" : done ? "border-red bg-bg text-red-text" : "border-line-strong bg-bg text-subtle"}`}>{done ? "✓" : s.id}</span>
              <span className={`mt-2 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] ${active ? "text-fg" : "text-muted"}`}>{s.label}</span>
            </>
          );
          return (
            <li key={s.id} className="flex">
              {reachable ? (
                <button type="button" onClick={() => onGo(s.id)} className="flex flex-col items-start text-left hover:[&_span:last-child]:text-fg" aria-label={`Go to step ${s.id}: ${s.label}`}>{body}</button>
              ) : (
                <div className="flex flex-col items-start" aria-current={active ? "step" : undefined}>{body}</div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
