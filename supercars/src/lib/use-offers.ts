"use client";

import { useSyncExternalStore } from "react";
import { activeOffers, nextOfferChange, NO_OFFERS, OFFERS, offersKey, type ActiveOffers } from "./promotions";

/* Offers in the browser. Pages are pre-rendered, so the server render always shows
 * normal prices; after hydration the browser looks at its own clock and the schedule,
 * and switches offers on and off at the exact start and end times (a timer is set for
 * the next change, no polling). The server still decides every real price. */

const listeners = new Set<() => void>();
let timer: ReturnType<typeof setTimeout> | null = null;
let cached: ActiveOffers = NO_OFFERS;
let cachedKey = "|";

function arm() {
  if (timer) clearTimeout(timer);
  timer = null;
  const next = nextOfferChange(Date.now());
  if (next === null || listeners.size === 0) return;
  // Browsers cap timeouts at ~24.8 days; re-arm in steps for offers further out.
  timer = setTimeout(() => {
    listeners.forEach((l) => l());
    arm();
  }, Math.min(next - Date.now() + 50, 2 ** 31 - 1));
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) arm();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer) {
      clearTimeout(timer);
      timer = null;
    }
  };
}

function getSnapshot(): ActiveOffers {
  if (OFFERS.length === 0) return NO_OFFERS;
  const now = activeOffers(Date.now());
  const key = offersKey(now);
  if (key !== cachedKey) {
    cached = now;
    cachedKey = key;
  }
  return cached;
}

const getServerSnapshot = () => NO_OFFERS;

/** The offers running right now in this browser (none during the server render). */
export function useOffers(): ActiveOffers {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/* A one-second clock, only for countdowns that are on screen. */
const tickListeners = new Set<() => void>();
let tickTimer: ReturnType<typeof setInterval> | null = null;
function subscribeTick(listener: () => void) {
  tickListeners.add(listener);
  if (!tickTimer) tickTimer = setInterval(() => tickListeners.forEach((l) => l()), 1000);
  return () => {
    tickListeners.delete(listener);
    if (tickListeners.size === 0 && tickTimer) {
      clearInterval(tickTimer);
      tickTimer = null;
    }
  };
}
const nowSecond = () => Math.floor(Date.now() / 1000) * 1000;

/** Current time to the second (null during the server render). */
export function useSecondClock(enabled: boolean): number | null {
  return useSyncExternalStore(enabled ? subscribeTick : () => () => {}, enabled ? nowSecond : () => null, () => null);
}

/** "2:41:05" or "41:05" (or "3 days" when far away). */
export function formatCountdown(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(s / 86400);
  if (days >= 2) return `${days} days`;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
}
