/* Answers written once and shown on Home, car pages, the Shop and How it works.
 * Keep them short and true for the prototype. */

export interface FaqItem {
  readonly q: string;
  readonly a: string;
}

export const FAQ = {
  howLong: { q: "How long does delivery take?", a: "Every poster is made to order: we prepare the artwork, check it, print it and ship it with tracking. Plan on 7–10 business days in total (placeholder estimate for the prototype)." },
  preview: { q: "Will I see my poster before I pay?", a: "Yes. The designer shows the poster with your car, style, size and name live as you type, and the review step composes the final preview before anything goes in the cart." },
  sizes: { q: "Which size should I choose?", a: "40 × 60 cm is our recommendation for most walls: it reads well from across a room. 30 × 40 cm suits a desk or a hallway, 50 × 70 cm a living room or an office wall. The Shop shows all three to scale." },
  framed: { q: "Print or framed?", a: "The print arrives rolled and safely packed, ready for your own frame. The framed poster comes in a slim black frame with glazing and hanging hardware, ready to hang." },
  gift: { q: "Can I send it as a gift?", a: "Yes. Tick “This order is a gift” at checkout: we leave the prices off the packing slip and you can add a short note." },
  track: { q: "Can I track my order without an account?", a: "Yes. Enter your order number on the Track order page. No account is needed." },
  realStore: { q: "Is this a real store?", a: "Not yet. This is a prototype: checkout is a demonstration, no payment is taken and nothing is shipped." },
  ai: { q: "Is the artwork AI-generated?", a: "In the prototype the artwork is composed from drawn silhouettes and templates. The production design engine will replace that step." },
  quality: { q: "What will the print quality be?", a: "Print files are prepared at exact physical dimensions with bleed and a fixed resolution, not just a large image. Final paper and printer specifications will be published before launch." },
} as const satisfies Record<string, FaqItem>;

/** The five most useful questions before buying. */
export const HOME_FAQ: readonly FaqItem[] = [FAQ.preview, FAQ.howLong, FAQ.sizes, FAQ.gift, FAQ.realStore];
export const CAR_FAQ: readonly FaqItem[] = [FAQ.preview, FAQ.framed, FAQ.howLong, FAQ.gift];
export const SHOP_FAQ: readonly FaqItem[] = [FAQ.sizes, FAQ.framed, FAQ.gift, FAQ.howLong];
export const HOW_FAQ: readonly FaqItem[] = [FAQ.realStore, FAQ.ai, FAQ.quality, FAQ.track, FAQ.gift];
