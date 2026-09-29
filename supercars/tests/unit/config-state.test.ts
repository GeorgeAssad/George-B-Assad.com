import { describe, expect, it } from "vitest";
import { canContinue, configReducer, initialFromParams, INITIAL_STATE, stateFromCartItem, validateCustomization, type Catalog } from "@/components/configurator/config-state";
import { getRepositories } from "@/server/repositories";
import type { CartItem } from "@/domain/cart";

const catalog = async (): Promise<Catalog> => {
  const r = getRepositories();
  const [cars, templates, products, sizes] = await Promise.all([r.cars.listEntries(), r.templates.list(), r.products.listProducts(), r.products.listSizes()]);
  return { cars, templates, products, sizes };
};

describe("configurator state", () => {
  it("starts at step 1 with no car", async () => {
    const s = initialFromParams(new URLSearchParams(), await catalog());
    expect(s.step).toBe(1);
    expect(s.carSlug).toBeNull();
  });

  it("deep links skip completed steps", async () => {
    const c = await catalog();
    expect(initialFromParams(new URLSearchParams("car=bmw-m3-g80"), c)).toMatchObject({ step: 2, carSlug: "bmw-m3-g80" });
    // Style and size are chosen on the same Design step, so a link with only a style still opens Design.
    expect(initialFromParams(new URLSearchParams("car=bmw-m3-g80&style=luxury"), c)).toMatchObject({ step: 2, templateId: "luxury" });
    expect(initialFromParams(new URLSearchParams("car=bmw-m3-g80&style=luxury&size=30x40"), c)).toMatchObject({ step: 3, sizeId: "30x40" });
  });

  it("ignores unknown or malicious params", async () => {
    const c = await catalog();
    const s = initialFromParams(new URLSearchParams("car=<script>&style=nope&size=99x99&product=%00"), c);
    expect(s).toMatchObject({ step: 1, carSlug: null, templateId: "racing", sizeId: "50x70" });
  });

  it("accepts product by slug", async () => {
    const s = initialFromParams(new URLSearchParams("product=framed-car-poster"), await catalog());
    expect(s.productId).toBe("framed-car-poster");
  });

  it("gates steps: car required, valid name required", () => {
    expect(canContinue({ ...INITIAL_STATE, step: 1 })).toBe(false);
    expect(canContinue({ ...INITIAL_STATE, step: 1, carSlug: "x" })).toBe(true);
    expect(canContinue({ ...INITIAL_STATE, step: 3, name: "" })).toBe(false);
    expect(canContinue({ ...INITIAL_STATE, step: 3, name: "GEORGE" })).toBe(true);
    expect(canContinue({ ...INITIAL_STATE, step: 3, name: "GEORGE", year: "99" })).toBe(false);
    expect(canContinue({ ...INITIAL_STATE, step: 2 })).toBe(true); // Design has defaults for style, finish and size
  });

  it("reports field-level errors", () => {
    const r = validateCustomization({ name: "", text: "", year: "12", location: "<b>" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(["location", "name", "year"]);
  });

  it("goto tracks the furthest step and clamps", () => {
    let s = configReducer(INITIAL_STATE, { type: "goto", step: 3 });
    s = configReducer(s, { type: "goto", step: 2 });
    expect(s).toMatchObject({ step: 2, maxStep: 3 });
    expect(configReducer(s, { type: "goto", step: 99 as never }).step).toBe(4);
    expect(configReducer(s, { type: "goto", step: 0 as never }).step).toBe(1);
  });

  it("clamps quantity", () => {
    expect(configReducer(INITIAL_STATE, { type: "setQuantity", quantity: 99 }).quantity).toBe(10);
    expect(configReducer(INITIAL_STATE, { type: "setQuantity", quantity: 0 }).quantity).toBe(1);
  });

  it("prefills from a cart line for editing", () => {
    const item: CartItem = { id: "line_1", productId: "framed-car-poster", sizeId: "40x60", carSlug: "porsche-911-992", templateId: "heritage", customization: { name: "ALEX", year: "2024" }, quantity: 2 };
    expect(stateFromCartItem(item)).toMatchObject({ step: 3, maxStep: 4, editingId: "line_1", name: "ALEX", year: "2024", quantity: 2, templateId: "heritage" });
  });
});
