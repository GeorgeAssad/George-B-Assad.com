"use client";

import { usePathname } from "next/navigation";
import { IconChat } from "@/components/ui/icons";
import { hasStickyBar } from "@/lib/layout-rules";
import { openSupportChat } from "@/lib/ui-store";

/** Floating help button. Steps aside on pages that have their own sticky bottom bar. */
export function SupportLauncher() {
  const pathname = usePathname();
  if (hasStickyBar(pathname)) return null;
  return (
    <button type="button" onClick={openSupportChat} aria-haspopup="dialog" className="glass fixed bottom-[5.75rem] right-3 z-30 flex size-11 items-center justify-center rounded-full text-fg shadow-[var(--shadow-lift)] transition-transform hover:scale-105 active:scale-95 lg:bottom-6 lg:right-6 lg:size-14" aria-label="Open support chat">
      <IconChat size={22} />
    </button>
  );
}

export function OpenChatLink({ className = "" }: { className?: string }) {
  return <button type="button" onClick={openSupportChat} className={className}>Chat with us</button>;
}
