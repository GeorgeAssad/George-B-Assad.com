"use client";

import { useSyncExternalStore } from "react";

/* Tiny external stores for global UI state (cart drawer, support chat). */
function createFlag() {
  let value = false;
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((l) => l());
  return {
    subscribe: (l: () => void) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    get: () => value,
    set(next: boolean) {
      if (value !== next) {
        value = next;
        notify();
      }
    },
  };
}

const cartDrawer = createFlag();
const supportChat = createFlag();

export const openCartDrawer = () => cartDrawer.set(true);
export const closeCartDrawer = () => cartDrawer.set(false);
export const openSupportChat = () => supportChat.set(true);
export const closeSupportChat = () => supportChat.set(false);

export const useCartDrawerOpen = () => useSyncExternalStore(cartDrawer.subscribe, cartDrawer.get, () => false);
export const useSupportChatOpen = () => useSyncExternalStore(supportChat.subscribe, supportChat.get, () => false);
