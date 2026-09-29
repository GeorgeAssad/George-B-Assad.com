import type { ReactNode } from "react";
import { Button } from "./Button";

interface EmptyStateProps {
  readonly title: string;
  readonly message: string;
  readonly action?: { readonly label: string; readonly href: string };
  readonly secondary?: { readonly label: string; readonly href: string };
  readonly icon?: ReactNode;
  readonly onReset?: () => void;
  readonly resetLabel?: string;
}

/** Premium empty/error state: engineering-grid backdrop, one clear next action. */
export function EmptyState({ title, message, action, secondary, icon, onReset, resetLabel }: EmptyStateProps) {
  return (
    <div className="relative isolate overflow-hidden rounded-3xl border border-line bg-surface px-6 py-16 text-center sm:py-24">
      <div className="tech-grid absolute inset-0 -z-10 opacity-60" aria-hidden="true" />
      {icon && <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-full border border-line-strong text-muted">{icon}</div>}
      <h2 className="h-display text-4xl sm:text-5xl">{title}</h2>
      <p className="mx-auto mt-4 max-w-md text-muted">{message}</p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        {action && <Button href={action.href} size="lg">{action.label}</Button>}
        {onReset && <Button variant="secondary" size="lg" onClick={onReset}>{resetLabel ?? "Reset"}</Button>}
        {secondary && <Button href={secondary.href} variant="secondary" size="lg">{secondary.label}</Button>}
      </div>
    </div>
  );
}
