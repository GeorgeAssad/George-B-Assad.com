"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Placement = "center" | "right" | "bottom";

interface DialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
  /** Accessible name (required: dialogs must be labelled). */
  readonly label: string;
  readonly placement?: Placement;
  readonly className?: string;
  readonly children: ReactNode;
}

/**
 * Built on the native <dialog> element: focus is trapped, Esc closes, the page
 * behind is inert, and focus returns to the trigger. Children mount only while
 * open so closed dialogs cost nothing.
 */
export function Dialog({ open, onClose, label, placement = "center", className = "", children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = previous;
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={label}
      className={`dialog dialog-${placement} ${className}`}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {open ? children : null}
    </dialog>
  );
}
