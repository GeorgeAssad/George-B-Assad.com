import type { CartItem, Customization } from "@/domain/cart";
import type { CarEntry, DesignTemplate, PosterSize, Product, SizeId, TemplateId } from "@/domain/catalog";
import { DEFAULT_PRODUCT_ID } from "@/data/products";
import { customizationSchema } from "@/lib/validation";

/* Pure configurator state. No React, no I/O — so URL parsing, edit-mode
 * prefill and step gating are unit-tested. */

export type Step = 1 | 2 | 3 | 4 | 5 | 6;
export const STEPS: readonly { readonly id: Step; readonly label: string }[] = [
  { id: 1, label: "Your car" },
  { id: 2, label: "Style" },
  { id: 3, label: "Size" },
  { id: 4, label: "Personalize" },
  { id: 5, label: "Preview" },
  { id: 6, label: "Add to cart" },
];

export interface ConfigState {
  readonly step: Step;
  readonly maxStep: Step;
  readonly carSlug: string | null;
  readonly templateId: TemplateId;
  readonly productId: string;
  readonly sizeId: SizeId;
  readonly name: string;
  readonly text: string;
  readonly year: string;
  readonly location: string;
  readonly quantity: number;
  /** Cart line being edited, if any. */
  readonly editingId: string | null;
}

export const INITIAL_STATE: ConfigState = {
  step: 1,
  maxStep: 1,
  carSlug: null,
  templateId: "racing",
  productId: DEFAULT_PRODUCT_ID,
  sizeId: "50x70",
  name: "",
  text: "",
  year: "",
  location: "",
  quantity: 1,
  editingId: null,
};

export type ConfigAction =
  | { type: "selectCar"; slug: string }
  | { type: "selectTemplate"; id: TemplateId }
  | { type: "selectProduct"; id: string }
  | { type: "selectSize"; id: SizeId }
  | { type: "setField"; field: "name" | "text" | "year" | "location"; value: string }
  | { type: "setQuantity"; quantity: number }
  | { type: "goto"; step: Step }
  | { type: "replace"; state: ConfigState };

const clampStep = (n: number): Step => Math.min(6, Math.max(1, Math.round(n))) as Step;

export function configReducer(state: ConfigState, action: ConfigAction): ConfigState {
  switch (action.type) {
    case "selectCar":
      return { ...state, carSlug: action.slug };
    case "selectTemplate":
      return { ...state, templateId: action.id };
    case "selectProduct":
      return { ...state, productId: action.id };
    case "selectSize":
      return { ...state, sizeId: action.id };
    case "setField":
      return { ...state, [action.field]: action.value };
    case "setQuantity":
      return { ...state, quantity: Math.min(10, Math.max(1, Math.floor(action.quantity))) };
    case "goto": {
      const step = clampStep(action.step);
      return { ...state, step, maxStep: clampStep(Math.max(state.maxStep, step)) };
    }
    case "replace":
      return action.state;
  }
}

/** Validates the personalization fields with the same schema the server uses. */
export function validateCustomization(state: Pick<ConfigState, "name" | "text" | "year" | "location">) {
  const result = customizationSchema.safeParse({ name: state.name, text: state.text, year: state.year, location: state.location });
  if (result.success) return { ok: true as const, value: result.data as Customization, errors: {} as Partial<Record<keyof Customization, string>> };
  const errors: Partial<Record<keyof Customization, string>> = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] as keyof Customization | undefined;
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return { ok: false as const, errors };
}

/** Whether the user may move on from `step`. */
export function canContinue(state: ConfigState): boolean {
  switch (state.step) {
    case 1: return state.carSlug !== null;
    case 4: return validateCustomization(state).ok;
    default: return true;
  }
}

export interface Catalog {
  readonly cars: readonly CarEntry[];
  readonly templates: readonly DesignTemplate[];
  readonly products: readonly Product[];
  readonly sizes: readonly PosterSize[];
}

const SIZE_IDS: readonly SizeId[] = ["30x40", "40x60", "50x70"];

/** Builds the starting state from URL params, ignoring anything that isn't in the catalog. */
export function initialFromParams(params: URLSearchParams, catalog: Catalog): ConfigState {
  let state = INITIAL_STATE;
  const car = params.get("car");
  const style = params.get("style");
  const size = params.get("size");
  const product = params.get("product");

  if (car && catalog.cars.some((c) => c.generation.slug === car)) state = { ...state, carSlug: car };
  if (style && catalog.templates.some((t) => t.id === style)) state = { ...state, templateId: style as TemplateId };
  if (size && (SIZE_IDS as readonly string[]).includes(size)) state = { ...state, sizeId: size as SizeId };
  if (product && catalog.products.some((p) => p.id === product || p.slug === product)) {
    state = { ...state, productId: catalog.products.find((p) => p.id === product || p.slug === product)!.id };
  }

  const step: Step = !state.carSlug ? 1 : style ? (size ? 4 : 3) : 2;
  return { ...state, step, maxStep: step };
}

/** Prefills the configurator from an existing cart line ("edit customization"). */
export function stateFromCartItem(item: CartItem): ConfigState {
  return {
    ...INITIAL_STATE,
    step: 4,
    maxStep: 6,
    carSlug: item.carSlug,
    templateId: item.templateId,
    productId: item.productId,
    sizeId: item.sizeId,
    name: item.customization.name,
    text: item.customization.text ?? "",
    year: item.customization.year ?? "",
    location: item.customization.location ?? "",
    quantity: item.quantity,
    editingId: item.id,
  };
}

/** Customization as it will appear on the poster / in the cart (empty strings dropped). */
export function toCustomization(state: Pick<ConfigState, "name" | "text" | "year" | "location">): Customization {
  const check = validateCustomization(state);
  if (check.ok) return check.value;
  return { name: state.name.trim() };
}
