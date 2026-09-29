"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { ToastProvider } from "@/components/ui/Toast";
import { PageViewTracker } from "@/lib/analytics/PageViewTracker";

// Dialog-based UI is code-split: it ships nothing until first opened.
const CartDrawer = dynamic(() => import("@/components/cart/CartDrawer").then((m) => m.CartDrawer));
const SupportChat = dynamic(() => import("@/components/support/SupportChat").then((m) => m.SupportChat));

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <PageViewTracker />
      {children}
      <CartDrawer />
      <SupportChat />
    </ToastProvider>
  );
}
