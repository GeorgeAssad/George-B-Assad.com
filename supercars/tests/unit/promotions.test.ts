import { describe, expect, it } from "vitest";
import { activeOffers, discountAmount, nextOfferChange, OFFERS, offerPrice, parseSchedule } from "@/lib/promotions";
import { PROMOTION_SCHEDULE } from "@/config/promotions";
import { money } from "@/domain/money";

const flash = { id: "flash-15", kind: "percent-off", percent: 15, startsAt: "2026-11-28T18:00:00+01:00", endsAt: "2026-11-28T21:00:00+01:00", label: "Flash sale" } as const;
const bigger = { id: "flash-25", kind: "percent-off", percent: 25, startsAt: "2026-11-28T19:00:00+01:00", endsAt: "2026-11-28T20:00:00+01:00" } as const;
const ship80 = { id: "free-ship-80", kind: "free-shipping", minSubtotal: 80, startsAt: "2026-11-28T00:00:00+01:00", endsAt: "2026-11-30T00:00:00+01:00" } as const;
const ship50 = { id: "free-ship-50", kind: "free-shipping", minSubtotal: 50, startsAt: "2026-11-29T00:00:00+01:00", endsAt: "2026-11-29T12:00:00+01:00" } as const;
const at = (iso: string) => Date.parse(iso);

describe("offer schedule (src/config/promotions.ts)", () => {
  it("the shipped schedule is valid and the store starts with no offer running", () => {
    expect(() => parseSchedule(PROMOTION_SCHEDULE)).not.toThrow();
    expect(OFFERS.length).toBe(PROMOTION_SCHEDULE.length);
  });

  it("accepts the examples written in the schedule file", () => {
    const offers = parseSchedule([flash, ship80]);
    expect(offers[0]).toMatchObject({ kind: "percent-off", percent: 15, label: "Flash sale" });
    expect(offers[1]).toMatchObject({ kind: "free-shipping", minSubtotal: money(8000), label: "Free shipping" });
  });

  it("rejects a broken edit with a message that names the offer", () => {
    expect(() => parseSchedule([{ ...flash, startsAt: "28/11/2026 18:00" }])).toThrow(/Offer #1.*startsAt/);
    expect(() => parseSchedule([{ ...flash, startsAt: "2026-11-28T18:00:00" }])).toThrow(/UTC offset/);
    expect(() => parseSchedule([{ ...flash, endsAt: flash.startsAt }])).toThrow(/endsAt must be after startsAt/);
    expect(() => parseSchedule([{ ...flash, percent: 0 }])).toThrow(/percent/);
    expect(() => parseSchedule([{ ...flash, percent: 95 }])).toThrow(/percent/);
    expect(() => parseSchedule([flash, { ...ship80, id: "flash-15" }])).toThrow(/used twice/);
    expect(() => parseSchedule([{ ...flash, price: 1 }])).toThrow();
  });
});

describe("which offer is running", () => {
  const offers = parseSchedule([flash, bigger, ship80, ship50]);

  it("switches on at startsAt and off at endsAt (end exclusive)", () => {
    expect(activeOffers(at("2026-11-28T16:59:59Z"), offers).discount).toBeNull();
    expect(activeOffers(at("2026-11-28T17:00:00Z"), offers).discount?.id).toBe("flash-15");
    expect(activeOffers(at("2026-11-28T19:59:59Z"), offers).discount?.id).toBe("flash-15");
    expect(activeOffers(at("2026-11-28T20:00:00Z"), offers).discount).toBeNull();
  });

  it("the bigger discount wins while two overlap; the lower free-shipping threshold wins", () => {
    expect(activeOffers(at("2026-11-28T18:30:00Z"), offers).discount?.percent).toBe(25);
    expect(activeOffers(at("2026-11-29T05:00:00Z"), offers).freeShipping?.minSubtotal).toEqual(money(5000));
    expect(activeOffers(at("2026-11-29T15:00:00Z"), offers).freeShipping?.minSubtotal).toEqual(money(8000));
  });

  it("knows when the next change happens, so pages can switch without a reload", () => {
    expect(nextOfferChange(at("2026-11-28T17:30:00Z"), offers)).toBe(at("2026-11-28T18:00:00Z"));
    expect(nextOfferChange(at("2026-12-01T00:00:00Z"), offers)).toBeNull();
  });

  it("rounds the discount to the cent", () => {
    const [f] = parseSchedule([flash]);
    const pct = f && f.kind === "percent-off" ? f : null;
    expect(discountAmount(money(7900), pct)).toEqual(money(1185));
    expect(offerPrice(money(3900), pct)).toEqual(money(3315));
    expect(discountAmount(money(3333), pct)).toEqual(money(500));
    expect(discountAmount(money(7900), null)).toEqual(money(0));
  });
});
