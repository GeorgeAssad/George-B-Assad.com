"use client";

import { openSupportChat } from "@/lib/ui-store";
import { IconChat } from "@/components/ui/icons";

/** "Can't find your car?" A way forward instead of a dead end: it opens the support chat. */
export function AskForCar({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col gap-3 rounded-[var(--lg-radius-lg)] bg-fill px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${className}`}>
      <p className="text-[0.9375rem]"><strong className="font-semibold">Can&apos;t find your car?</strong> <span className="text-muted">Tell us the model and generation and we&apos;ll let you know when it&apos;s in the catalog.</span></p>
      <button type="button" onClick={openSupportChat} aria-haspopup="dialog" className="btn btn-sm flex-none self-start sm:self-auto"><IconChat size={16} /> Ask us</button>
    </div>
  );
}
