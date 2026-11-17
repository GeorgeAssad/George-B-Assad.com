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

/** Empty / error state: one calm card, one clear next action. */
export function EmptyState({ title, message, action, secondary, icon, onReset, resetLabel }: EmptyStateProps) {
  return (
    <div className="card px-6 py-14 text-center sm:py-20">
      {icon && <div className="icon-tile icon-tile-soft mx-auto mb-5">{icon}</div>}
      <h2 className="h-display h-section">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-muted">{message}</p>
      <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
        {action && <Button href={action.href} size="lg">{action.label}</Button>}
        {onReset && <Button variant="secondary" size="lg" onClick={onReset}>{resetLabel ?? "Reset"}</Button>}
        {secondary && <Button href={secondary.href} variant="secondary" size="lg">{secondary.label}</Button>}
      </div>
    </div>
  );
}
