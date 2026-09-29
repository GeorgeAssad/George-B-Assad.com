"use client";

import { useId, useState } from "react";
import type { Customization } from "@/domain/cart";
import { LIMITS } from "@/lib/validation";
import type { ConfigState } from "./config-state";
import { validateCustomization } from "./config-state";

type Field = "name" | "text" | "year" | "location";

interface StepPersonalizeProps {
  readonly state: Pick<ConfigState, Field>;
  readonly onChange: (field: Field, value: string) => void;
  /** Called with the first invalid field so the parent can focus it. */
  readonly showErrors: boolean;
}

interface FieldDef { readonly id: Field; readonly label: string; readonly hint: string; readonly max: number; readonly required?: boolean; readonly inputMode?: "numeric" | "text"; readonly placeholder: string }

const FIELDS: readonly FieldDef[] = [
  { id: "name", label: "Name", hint: "Printed large on your poster.", max: LIMITS.posterName, required: true, placeholder: "GEORGE" },
  { id: "text", label: "Text (optional)", hint: "A short line, e.g. “Sunday Drive”.", max: LIMITS.posterText, placeholder: "Sunday Drive" },
  { id: "year", label: "Year (optional)", hint: "Four digits, e.g. 2024.", max: 4, inputMode: "numeric", placeholder: "2024" },
  { id: "location", label: "Location (optional)", hint: "A place that matters to you.", max: LIMITS.posterLocation, placeholder: "Nürburgring" },
];

export function StepPersonalize({ state, onChange, showErrors }: StepPersonalizeProps) {
  const uid = useId();
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const check = validateCustomization(state);
  const errors: Partial<Record<keyof Customization, string>> = check.ok ? {} : check.errors;

  return (
    <div className="space-y-6">
      {FIELDS.map((f) => {
        const inputId = `${uid}-${f.id}`;
        const hintId = `${inputId}-hint`;
        const errId = `${inputId}-err`;
        const error = (touched[f.id] || showErrors) ? errors[f.id] : undefined;
        const value = state[f.id];
        return (
          <div key={f.id}>
            <div className="flex items-baseline justify-between gap-3">
              <label htmlFor={inputId} className="text-sm font-semibold">{f.label}{f.required && <span className="text-red-text" aria-hidden="true"> *</span>}</label>
              <span className="text-xs tabular-nums text-subtle" aria-hidden="true">{value.length}/{f.max}</span>
            </div>
            <input
              id={inputId}
              type="text"
              inputMode={f.inputMode ?? "text"}
              autoComplete="off"
              autoCapitalize={f.id === "name" ? "characters" : "sentences"}
              spellCheck={false}
              maxLength={f.max}
              required={f.required}
              value={value}
              placeholder={f.placeholder}
              onChange={(e) => onChange(f.id, e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, [f.id]: true }))}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${hintId} ${errId}` : hintId}
              className="field mt-2"
            />
            <p id={hintId} className="mt-1.5 text-xs text-subtle">{f.hint}</p>
            {error && <p id={errId} className="mt-1 text-sm font-medium text-red-text" role="alert">{error}</p>}
          </div>
        );
      })}
      <p className="rounded-xl border border-line bg-surface p-4 text-sm text-muted">Everything is printed exactly as typed. Letters, numbers and simple punctuation only — we check every poster before it prints.</p>
    </div>
  );
}
