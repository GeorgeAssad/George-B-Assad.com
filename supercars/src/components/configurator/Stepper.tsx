"use client";

import { IconCheck } from "@/components/ui/icons";
import { STEPS, type Step } from "./config-state";

interface StepperProps {
  readonly current: Step;
  readonly maxStep: Step;
  readonly onGo: (step: Step) => void;
}

/** Progress indicator: numbered steps joined by a line on desktop, a counter and a bar on a phone. */
export function Stepper({ current, maxStep, onGo }: StepperProps) {
  const label = STEPS.find((s) => s.id === current)?.label ?? "";
  return (
    <nav aria-label="Configurator progress">
      <p className="spec mb-2.5 lg:hidden">Step {current} of {STEPS.length} · <span className="font-semibold text-fg">{label}</span></p>
      <div className="relative h-1 overflow-hidden rounded-full bg-fill lg:hidden" aria-hidden="true">
        <div className="absolute inset-y-0 left-0 rounded-full bg-red transition-[width] duration-500 ease-out" style={{ width: `${(current / STEPS.length) * 100}%` }} />
      </div>

      <ol className="hidden items-center gap-3 lg:flex">
        {STEPS.map((s, i) => {
          const done = s.id < current;
          const active = s.id === current;
          const reachable = s.id <= maxStep && !active;
          const body = (
            <>
              <span className={`flex size-7 flex-none items-center justify-center rounded-full text-[0.8125rem] font-semibold tabular-nums transition-colors duration-300 ${active ? "bg-red text-on-red" : done ? "bg-tint-soft text-tint-ink" : "bg-fill text-muted"}`}>{done ? <IconCheck size={14} /> : s.id}</span>
              <span data-step-label className={`text-[0.9375rem] transition-colors ${active ? "font-semibold text-fg" : "font-medium text-muted"}`}>{s.label}</span>
            </>
          );
          return (
            <li key={s.id} className={`flex items-center gap-3 ${i < STEPS.length - 1 ? "flex-1" : ""}`}>
              {reachable ? (
                <button type="button" onClick={() => onGo(s.id)} className="flex items-center gap-2.5 rounded-full text-left hover:[&_[data-step-label]]:text-fg" aria-label={`Go to step ${s.id}: ${s.label}`}>{body}</button>
              ) : (
                <div className="flex items-center gap-2.5" aria-current={active ? "step" : undefined}>{body}</div>
              )}
              {i < STEPS.length - 1 && <span aria-hidden="true" className={`h-px min-w-6 flex-1 transition-colors duration-500 ${done ? "bg-red" : "bg-line"}`} />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
