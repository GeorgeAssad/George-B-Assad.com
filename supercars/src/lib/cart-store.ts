import { z } from "zod";
import type { CartItem } from "@/domain/cart";
import { LIMITS, cartItemInputSchema } from "./validation";
import { newId } from "./ids";

/* CLIENT CART STORE. References only — never prices. localStorage is treated as
 * untrusted input and re-validated on every load; corrupt data is discarded. */

const STORAGE_KEY = "sc.cart.v1";
const cartSchema = z.array(cartItemInputSchema).max(LIMITS.cartLines);

export interface CartState {
  readonly items: readonly CartItem[];
  readonly hydrated: boolean;
}

const SERVER_STATE: CartState = { items: [], hydrated: false };

let state: CartState = SERVER_STATE;
let loaded = false;
const listeners = new Set<() => void>();

function readStorage(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = cartSchema.safeParse(JSON.parse(raw));
    return parsed.success ? (parsed.data as CartItem[]) : [];
  } catch {
    return [];
  }
}

function writeStorage(items: readonly CartItem[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage may be blocked (private mode); the in-memory cart still works for this session.
  }
}

function emit(): void {
  for (const l of listeners) l();
}

function set(items: readonly CartItem[], persist = true): void {
  state = { items, hydrated: true };
  if (persist) writeStorage(items);
  emit();
}

export function getSnapshot(): CartState {
  if (!loaded && typeof window !== "undefined") {
    loaded = true;
    state = { items: readStorage(), hydrated: true };
    window.addEventListener("storage", (e) => {
      if (e.key === STORAGE_KEY || e.key === null) set(readStorage(), false);
    });
  }
  return state;
}

export const getServerSnapshot = (): CartState => SERVER_STATE;

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const sameLine = (a: CartItem, b: Omit<CartItem, "id" | "quantity">): boolean =>
  a.productId === b.productId && a.sizeId === b.sizeId && a.carSlug === b.carSlug && a.templateId === b.templateId &&
  a.customization.name === b.customization.name && a.customization.text === b.customization.text &&
  a.customization.year === b.customization.year && a.customization.location === b.customization.location;

const clampQty = (n: number): number => Math.min(LIMITS.quantity, Math.max(1, Math.floor(n)));

export type NewCartItem = Omit<CartItem, "id">;

export const cartActions = {
  /** Adds a line (merging identical ones). Returns the line id. */
  add(input: NewCartItem): string {
    const current = getSnapshot().items;
    const existing = current.find((i) => sameLine(i, input));
    if (existing) {
      const merged = { ...existing, quantity: clampQty(existing.quantity + input.quantity) };
      set(current.map((i) => (i.id === existing.id ? merged : i)));
      return existing.id;
    }
    if (current.length >= LIMITS.cartLines) return current[current.length - 1]!.id;
    const item: CartItem = { ...input, id: newId("line"), quantity: clampQty(input.quantity) };
    set([...current, item]);
    return item.id;
  },
  setQuantity(id: string, quantity: number): void {
    set(getSnapshot().items.map((i) => (i.id === id ? { ...i, quantity: clampQty(quantity) } : i)));
  },
  remove(id: string): void {
    set(getSnapshot().items.filter((i) => i.id !== id));
  },
  /** Replaces a line's configuration in place (used by "edit customization"). */
  replace(id: string, input: NewCartItem): void {
    set(getSnapshot().items.map((i) => (i.id === id ? { ...input, id, quantity: clampQty(input.quantity) } : i)));
  },
  clear(): void {
    set([]);
  },
};

/** Test hook: reset module state between tests. */
export function __resetCartStoreForTests(): void {
  state = SERVER_STATE;
  loaded = false;
  listeners.clear();
}
