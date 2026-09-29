import { describe, expect, it } from "vitest";
import { assetPlanFor, effectiveDpi, mmToPx, printPixelSize, printSpecFor } from "@/lib/print-spec";

describe("print spec math", () => {
  it("converts mm to px at 300 DPI", () => {
    expect(mmToPx(25.4, 300)).toBe(300);
  });
  it("50×70 cm @300 DPI with 3 mm bleed", () => {
    const spec = printSpecFor("50x70");
    expect(spec).toMatchObject({ widthMm: 500, heightMm: 700, dpi: 300, bleedMm: 3 });
    // (500+6)/25.4*300 = 5976.4 ; (700+6)/25.4*300 = 8338.6
    expect(printPixelSize(spec)).toEqual({ widthPx: 5976, heightPx: 8339 });
  });
  it("plans five distinct assets with different dimensions", () => {
    const plan = assetPlanFor("40x60");
    expect(plan.map((a) => a.kind)).toEqual(["web_preview", "social_image", "print_image", "print_pdf", "master_source"]);
    const dims = new Set(plan.map((a) => `${a.widthPx}x${a.heightPx}`));
    expect(dims.size).toBeGreaterThanOrEqual(4);
    expect(plan.find((a) => a.kind === "web_preview")!.widthPx).toBeLessThan(plan.find((a) => a.kind === "print_image")!.widthPx);
  });
  it("computes effective DPI (8K width is not automatically print-ready)", () => {
    // 7680 px across a 700 mm-wide print is only ~279 DPI.
    expect(Math.round(effectiveDpi(7680, 700))).toBe(279);
  });
});
