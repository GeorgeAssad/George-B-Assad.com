"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { IconCheck, IconClose } from "./icons";

type Tone = "default" | "success" | "error";
interface ToastItem { readonly id: number; readonly title: string; readonly description?: string; readonly tone: Tone }
interface ToastInput { readonly title: string; readonly description?: string; readonly tone?: Tone }

const ToastContext = createContext<((t: ToastInput) => void) | null>(null);

export function useToast(): (t: ToastInput) => void {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => setItems((cur) => cur.filter((t) => t.id !== id)), []);

  const push = useCallback(
    (input: ToastInput) => {
      const id = nextId.current++;
      setItems((cur) => [...cur.slice(-2), { id, title: input.title, tone: input.tone ?? "default", ...(input.description ? { description: input.description } : {}) }]);
      window.setTimeout(() => dismiss(id), 4500);
    },
    [dismiss],
  );

  const value = useMemo(() => push, [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[90] flex flex-col items-center gap-2 px-4 lg:bottom-6 lg:items-end lg:px-8" role="status" aria-live="polite" aria-atomic="false">
        {items.map((t) => (
          <div key={t.id} className="glass pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl px-4 py-3 shadow-[var(--shadow-lift)] [animation:page-in_0.35s_var(--ease)_both]">
            {t.tone === "success" && <span className="mt-0.5 flex size-5 flex-none items-center justify-center rounded-full bg-red text-on-red"><IconCheck size={13} /></span>}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{t.title}</p>
              {t.description && <p className="mt-0.5 text-sm text-muted">{t.description}</p>}
            </div>
            <button type="button" onClick={() => dismiss(t.id)} className="-m-1 rounded-full p-1 text-muted hover:text-fg" aria-label="Dismiss notification">
              <IconClose size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
