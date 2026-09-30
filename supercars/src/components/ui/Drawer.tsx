"use client";

import type { ReactNode } from "react";
import { Dialog } from "./Dialog";
import { IconClose } from "./icons";

interface DrawerProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly title: string;
  readonly side?: "right" | "bottom";
  readonly children: ReactNode;
  readonly footer?: ReactNode;
}

/** Side/bottom sheet with a sticky header and optional pinned footer. */
export function Drawer({ open, onClose, title, side = "right", children, footer }: DrawerProps) {
  return (
    <Dialog open={open} onClose={onClose} label={title} placement={side}>
      <div className="flex h-full max-h-[inherit] min-h-0 flex-col">
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
          <h2 className="h-display text-3xl">{title}</h2>
          <button type="button" onClick={onClose} className="-m-2 rounded-full p-2 text-muted hover:text-fg" aria-label={`Close ${title}`}>
            <IconClose />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="safe-bottom border-t border-line bg-surface px-5 pt-4">{footer}</div>}
      </div>
    </Dialog>
  );
}
