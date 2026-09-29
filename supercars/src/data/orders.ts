import { money } from "@/domain/money";
import type { Order } from "@/domain/order";

/* DEMO ORDERS — seeded so /track and the support demo have something to show.
 * Personal data below is obviously fictional. Timestamps are fixed. */

const customer = (id: string, name: string) => ({ id, name, email: "demo@example.com" });
const address = { line1: "1 Demo Street", city: "Berlin", postalCode: "10115", country: "DE" };

export const sampleOrders: readonly Order[] = [
  {
    id: "SC-100234",
    status: "shipped",
    customer: customer("cus_demo_1", "Demo Customer"),
    shippingAddress: address,
    items: [
      {
        id: "oi_100234_1", productId: "custom-car-poster", sku: "SC-POS-5070",
        productName: "Custom Car Poster", carSlug: "bmw-m3-g80", vehicleName: "BMW M3 G80",
        templateId: "racing", sizeId: "50x70", sizeLabel: "50 × 70 cm",
        customization: { name: "GEORGE", year: "2023", location: "Nürburgring" },
        quantity: 1, unitPrice: money(7900), lineTotal: money(7900),
      },
    ],
    subtotal: money(7900), shipping: money(0), total: money(7900),
    payment: { id: "pay_demo_100234", provider: "mock", status: "paid", amount: money(7900), sessionId: "cs_demo_seed_1", demo: true },
    shipment: {
      id: "shp_demo_1", carrier: "Demo Carrier", trackingNumber: "DEMO-TRK-100234", status: "in_transit",
      events: [
        { at: "2026-09-24T09:10:00.000Z", status: "label_created", description: "Label created (demo)" },
        { at: "2026-09-25T14:30:00.000Z", status: "in_transit", description: "Departed sorting facility (demo)" },
      ],
    },
    createdAt: "2026-09-20T10:00:00.000Z",
    estimatedDelivery: { from: "2026-09-29", to: "2026-10-02" },
    mode: "demo",
  },
  {
    id: "SC-100235",
    status: "print",
    customer: customer("cus_demo_2", "Demo Customer"),
    shippingAddress: { ...address, city: "Munich", postalCode: "80331" },
    items: [
      {
        id: "oi_100235_1", productId: "framed-car-poster", sku: "SC-FRM-4060",
        productName: "Framed Car Poster", carSlug: "porsche-911-992", vehicleName: "Porsche 911 Carrera 992",
        templateId: "heritage", sizeId: "40x60", sizeLabel: "40 × 60 cm",
        customization: { name: "ALEX", text: "First Drive", year: "2024" },
        quantity: 1, unitPrice: money(10900), lineTotal: money(10900),
      },
    ],
    subtotal: money(10900), shipping: money(0), total: money(10900),
    payment: { id: "pay_demo_100235", provider: "mock", status: "paid", amount: money(10900), sessionId: "cs_demo_seed_2", demo: true },
    createdAt: "2026-09-27T16:20:00.000Z",
    estimatedDelivery: { from: "2026-10-06", to: "2026-10-09" },
    mode: "demo",
  },
  {
    id: "SC-100236",
    status: "delivered",
    customer: customer("cus_demo_3", "Demo Customer"),
    shippingAddress: { ...address, city: "Vienna", postalCode: "1010", country: "AT" },
    items: [
      {
        id: "oi_100236_1", productId: "custom-car-poster", sku: "SC-POS-3040",
        productName: "Custom Car Poster", carSlug: "nissan-gt-r-r35", vehicleName: "Nissan GT-R R35",
        templateId: "blueprint", sizeId: "30x40", sizeLabel: "30 × 40 cm",
        customization: { name: "MIA" },
        quantity: 2, unitPrice: money(3900), lineTotal: money(7800),
      },
    ],
    subtotal: money(7800), shipping: money(790), total: money(8590),
    payment: { id: "pay_demo_100236", provider: "mock", status: "paid", amount: money(8590), sessionId: "cs_demo_seed_3", demo: true },
    shipment: {
      id: "shp_demo_3", carrier: "Demo Carrier", trackingNumber: "DEMO-TRK-100236", status: "delivered",
      events: [
        { at: "2026-09-10T08:00:00.000Z", status: "label_created", description: "Label created (demo)" },
        { at: "2026-09-12T12:00:00.000Z", status: "in_transit", description: "In transit (demo)" },
        { at: "2026-09-15T11:15:00.000Z", status: "delivered", description: "Delivered (demo)" },
      ],
    },
    createdAt: "2026-09-04T12:00:00.000Z",
    estimatedDelivery: { from: "2026-09-13", to: "2026-09-16" },
    mode: "demo",
  },
];
