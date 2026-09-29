import type { ReactNode } from "react";

interface FormFieldProps {
  readonly id: string;
  readonly label: string;
  readonly error?: string | undefined;
  readonly hint?: string;
  readonly required?: boolean;
  readonly className?: string;
  /** Render prop so the input receives the aria wiring. */
  readonly children: (aria: { id: string; "aria-invalid"?: true; "aria-describedby"?: string }) => ReactNode;
}

/** Label + control + hint + error, with the aria attributes wired consistently. */
export function FormField({ id, label, error, hint, required, className = "", children }: FormFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errId = error ? `${id}-err` : undefined;
  const describedBy = [hintId, errId].filter(Boolean).join(" ") || undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="text-sm font-semibold">
        {label}{required && <span className="text-red-text" aria-hidden="true"> *</span>}
      </label>
      <div className="mt-2">
        {children({ id, ...(error ? { "aria-invalid": true as const } : {}), ...(describedBy ? { "aria-describedby": describedBy } : {}) })}
      </div>
      {hint && !error && <p id={hintId} className="mt-1.5 text-xs text-subtle">{hint}</p>}
      {error && <p id={errId} className="mt-1.5 text-sm font-medium text-red-text">{error}</p>}
    </div>
  );
}
