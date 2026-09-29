import { money } from "@/domain/money";
import type { PosterSize, Product } from "@/domain/catalog";

/* DEMO PRODUCT DATA — placeholder prices (EUR, VAT-inclusive assumed).
 * The ONLY place a price is defined. The server resolves prices from here (or
 * the future database); the browser never supplies one. */

export const posterSizes: readonly PosterSize[] = [
  { id: "30x40", label: "30 × 40 cm", widthCm: 30, heightCm: 40 },
  { id: "40x60", label: "40 × 60 cm", widthCm: 40, heightCm: 60 },
  { id: "50x70", label: "50 × 70 cm", widthCm: 50, heightCm: 70 },
];

export const products: readonly Product[] = [
  {
    id: "custom-car-poster",
    slug: "custom-car-poster",
    kind: "poster",
    name: "Custom Car Poster",
    tagline: "Your car, composed as a gallery print.",
    description:
      "A personalised poster of your exact car, in the design style you choose, with your name and details. Printed on heavyweight matte art paper.",
    highlights: [
      "Made for your exact car and generation",
      "Five design styles",
      "Your name, year and location on the print",
      "Heavyweight matte art paper (prototype spec)",
    ],
    variants: [
      { id: "ccp-30x40", sku: "SC-POS-3040", productId: "custom-car-poster", sizeId: "30x40", price: money(3900) },
      { id: "ccp-40x60", sku: "SC-POS-4060", productId: "custom-car-poster", sizeId: "40x60", price: money(5900) },
      { id: "ccp-50x70", sku: "SC-POS-5070", productId: "custom-car-poster", sizeId: "50x70", price: money(7900) },
    ],
  },
  {
    id: "framed-car-poster",
    slug: "framed-car-poster",
    kind: "framed-poster",
    name: "Framed Car Poster",
    tagline: "Ready to hang. Wall-ready from day one.",
    description:
      "The same personalised artwork, delivered in a slim black frame with a protective front. Unbox, hang, done.",
    highlights: [
      "Slim black frame (prototype spec)",
      "Protective glazing",
      "Hanging hardware included",
      "Same personalised artwork as the poster",
    ],
    variants: [
      { id: "fcp-30x40", sku: "SC-FRM-3040", productId: "framed-car-poster", sizeId: "30x40", price: money(7900) },
      { id: "fcp-40x60", sku: "SC-FRM-4060", productId: "framed-car-poster", sizeId: "40x60", price: money(10900) },
      { id: "fcp-50x70", sku: "SC-FRM-5070", productId: "framed-car-poster", sizeId: "50x70", price: money(13900) },
    ],
  },
];
