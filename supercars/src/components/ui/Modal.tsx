"use client";

import type { ReactNode } from "react";
import { Dialog } from "./Dialog";
import { IconClose } from "./icons";

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  return (
    <Dialog open={open} onClose={onClose} label={title} placement="center">
      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <h2 className="h-display text-3xl">{title}</h2>
          <button type="button" onClick={onClose} className="-m-2 rounded-full p-2 text-muted hover:text-fg" aria-label="Close dialog">
            <IconClose />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </Dialog>
  );
}
