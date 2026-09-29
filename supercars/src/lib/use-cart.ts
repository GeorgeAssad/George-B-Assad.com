"use client";

import { useSyncExternalStore } from "react";
import { cartActions, getServerSnapshot, getSnapshot, subscribe } from "./cart-store";

export function useCart() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const count = state.items.reduce((n, i) => n + i.quantity, 0);
  return { items: state.items, count, hydrated: state.hydrated, ...cartActions };
}
