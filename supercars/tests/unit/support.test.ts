import { describe, expect, it } from "vitest";
import { mockSupportAgent } from "@/server/services/mock/support";
import { toPublicOrderView } from "@/server/checkout/public-order";
import { sampleOrders } from "@/data/orders";

describe("mock support agent", () => {
  const ask = (message: string) => mockSupportAgent.answerCustomer({ message });

  it("answers prices from catalog data and marks itself demo", async () => {
    const a = await ask("How much does a poster cost?");
    expect(a.demo).toBe(true);
    expect(a.text).toContain("€79");
    expect(a.text).toContain("€39");
  });
  it("answers sizes, delivery and personalisation", async () => {
    expect((await ask("what sizes do you have")).text).toContain("50 × 70 cm");
    expect((await ask("how long is delivery?")).text).toMatch(/business days/);
    expect((await ask("can I add my name?")).text).toMatch(/24 characters/);
  });
  it("looks up order status by number", async () => {
    const a = await ask("Where is order sc-100234?");
    expect(a.text).toContain("SC-100234");
    expect(a.text).toContain("DEMO-TRK-100234");
    expect((await ask("status of SC-999999")).text).toMatch(/couldn't find/);
  });
  it("escalates to a human and never claims to send a real ticket", async () => {
    const a = await ask("I want to talk to a human");
    expect(a.escalate).toBe(true);
    expect(a.text).toMatch(/demo/i);
  });
  it("falls back with suggestions", async () => {
    const a = await ask("qwertyuiop");
    expect(a.suggestions.length).toBeGreaterThan(0);
  });
  it("does not disclose card handling or policy it does not have", async () => {
    expect((await ask("can I pay by card?")).text).toMatch(/never collects card/);
    expect((await ask("what is your refund policy")).text).toMatch(/still being finalised/);
  });
});

describe("public order view privacy", () => {
  it("never exposes name, email, phone or street address", () => {
    for (const order of sampleOrders) {
      const json = JSON.stringify(toPublicOrderView(order));
      expect(json).not.toContain("demo@example.com");
      expect(json).not.toContain("Demo Customer");
      expect(json).not.toContain("1 Demo Street");
      expect(json).not.toContain("cus_demo");
    }
  });
});
