"use client";

import { useSyncExternalStore } from "react";

/* The URL query string as an external store: the single source of truth for
 * filter state. Reading it never causes a hydration mismatch (server snapshot is
 * empty) and writing it uses replaceState so history isn't polluted. */

const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener("popstate", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("popstate", listener);
  };
}

export function replaceSearch(query: string): void {
  const url = query ? `?${query}` : window.location.pathname;
  if (url === `${window.location.search}` || (!query && !window.location.search)) return;
  window.history.replaceState(null, "", url);
  listeners.forEach((l) => l());
}

export function useUrlSearch(): string {
  return useSyncExternalStore(subscribe, () => window.location.search, () => "");
}
