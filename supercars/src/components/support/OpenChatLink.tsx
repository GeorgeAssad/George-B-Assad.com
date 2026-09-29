"use client";

import { openSupportChat } from "@/lib/ui-store";

/** The single entry point to the support chat (in the footer). No floating button competes with page actions. */
export function OpenChatLink({ className = "" }: { className?: string }) {
  return <button type="button" onClick={openSupportChat} aria-haspopup="dialog" className={className}>Chat with us</button>;
}
