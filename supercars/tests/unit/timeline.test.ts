import { describe, expect, it } from "vitest";
import { buildTimeline } from "@/lib/order-timeline";
import { addBusinessDays, estimateDelivery } from "@/lib/delivery";

describe("buildTimeline", () => {
  it("marks earlier stages done, current active, later pending", () => {
    const t = buildTimeline("print", "2026-09-01T10:00:00.000Z");
    expect(t.map((e) => e.state)).toEqual(["done", "done", "active", "pending", "pending"]);
    expect(t[0]?.at).toBeDefined();
    expect(t[4]?.at).toBeUndefined();
  });
  it("delivered is fully done", () => {
    expect(buildTimeline("delivered", "2026-09-01T10:00:00.000Z").every((e) => e.state === "done")).toBe(true);
  });
  it("new demo orders start in design with confirmed done", () => {
    expect(buildTimeline("design", "2026-09-01T10:00:00.000Z").map((e) => e.state).slice(0, 3)).toEqual(["done", "active", "pending"]);
  });
});

describe("delivery estimates", () => {
  it("skips weekends", () => {
    // Fri 2026-10-02 + 1 business day = Mon 2026-10-05
    expect(addBusinessDays(new Date("2026-10-02T12:00:00Z"), 1).toISOString().slice(0, 10)).toBe("2026-10-05");
  });
  it("returns an ISO range", () => {
    const r = estimateDelivery(new Date("2026-10-01T00:00:00Z"), 7, 10);
    expect(r.from < r.to).toBe(true);
  });
});
