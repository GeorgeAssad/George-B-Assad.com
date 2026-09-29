import { z } from "zod";
import { ORDER_ID_PATTERN } from "./ids";
import { shippingDestinations } from "@/data/shipping";

/* SHARED VALIDATION. The browser uses these for UX only; the server re-runs
 * them and is authoritative. Every object schema is STRICT: unknown keys such
 * as `price`, `status` or `userId` are rejected, not ignored. */

/** Strip control, format (zero-width, bidi override) chars; NFC; collapse spaces. */
export function normalizeText(input: string): string {
  return input
    .normalize("NFC")
    .replace(/[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

const text = (max: number) => z.string().max(max * 4).transform(normalizeText);

export const LIMITS = {
  posterName: 24,
  posterText: 60,
  posterLocation: 40,
  customerName: 80,
  addressLine: 100,
  city: 60,
  quantity: 10,
  cartLines: 20,
  supportMessage: 500,
} as const;

const POSTER_CHARS = /^[\p{L}\p{M}\p{N} .,'’&/#!:+\-–·]*$/u;
const PERSON_CHARS = /^[\p{L}\p{M} .'’-]+$/u;
const ADDRESS_CHARS = /^[\p{L}\p{M}\p{N} .,'’#/\-–]+$/u;

const posterField = (label: string, max: number) =>
  text(max).pipe(
    z
      .string()
      .max(max, `${label} must be at most ${max} characters`)
      .regex(POSTER_CHARS, `${label} contains characters we can't print`),
  );

export const customizationSchema = z.strictObject({
  name: posterField("Name", LIMITS.posterName).pipe(z.string().min(1, "Enter the name for your poster")),
  text: posterField("Text", LIMITS.posterText).optional().transform((v) => v || undefined),
  year: text(4)
    .pipe(z.string().regex(/^(?:|(?:18|19|20)\d{2})$/, "Enter a four-digit year"))
    .optional()
    .transform((v) => v || undefined),
  location: posterField("Location", LIMITS.posterLocation).optional().transform((v) => v || undefined),
});

export const sizeIdSchema = z.enum(["30x40", "40x60", "50x70"]);
export const templateIdSchema = z.enum(["minimal", "blueprint", "racing", "heritage", "luxury"]);
export const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9.]+)*$/, "Invalid identifier").max(80);
export const idSchema = z.string().regex(/^[A-Za-z0-9_-]{1,64}$/, "Invalid identifier");

export const cartItemInputSchema = z.strictObject({
  id: idSchema,
  productId: idSchema,
  sizeId: sizeIdSchema,
  carSlug: slugSchema,
  templateId: templateIdSchema,
  customization: customizationSchema,
  quantity: z.number().int().min(1).max(LIMITS.quantity),
});

export const cartItemsSchema = z.array(cartItemInputSchema).min(1).max(LIMITS.cartLines);

export const quoteRequestSchema = z.strictObject({
  items: z.array(cartItemInputSchema).max(LIMITS.cartLines),
  country: z.string().length(2).optional(),
});

export const orderIdSchema = z
  .string()
  .transform((v) => v.trim().toUpperCase())
  .pipe(z.string().regex(ORDER_ID_PATTERN, "Enter an order number like SC-100234"));

const countryCodes = shippingDestinations.map((d) => d.code) as [string, ...string[]];

export const customerInputSchema = z.strictObject({
  name: text(LIMITS.customerName).pipe(
    z.string().min(2, "Enter your full name").max(LIMITS.customerName).regex(PERSON_CHARS, "Name contains unsupported characters"),
  ),
  email: z
    .string()
    .trim()
    .max(254)
    .pipe(z.email("Enter a valid email address"))
    .transform((v) => v.toLowerCase()),
  phone: z
    .string()
    .trim()
    .max(24)
    .regex(/^(?:|\+?[0-9 ()\-.]{6,20})$/, "Enter a valid phone number")
    .optional()
    .transform((v) => v || undefined),
});

export const addressSchema = z.strictObject({
  line1: text(LIMITS.addressLine).pipe(
    z.string().min(3, "Enter your street address").max(LIMITS.addressLine).regex(ADDRESS_CHARS, "Address contains unsupported characters"),
  ),
  line2: text(LIMITS.addressLine)
    .pipe(z.string().max(LIMITS.addressLine).regex(/^(?:|[\p{L}\p{M}\p{N} .,'’#/\-–]+)$/u, "Address contains unsupported characters"))
    .optional()
    .transform((v) => v || undefined),
  city: text(LIMITS.city).pipe(
    z.string().min(2, "Enter your city").max(LIMITS.city).regex(ADDRESS_CHARS, "City contains unsupported characters"),
  ),
  postalCode: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9][A-Za-z0-9 -]{1,10}[A-Za-z0-9]$/, "Enter a valid postal code"),
  country: z.enum(countryCodes, { error: "Choose a shipping country" }),
});

export const checkoutRequestSchema = z.strictObject({
  items: cartItemsSchema,
  customer: customerInputSchema,
  shipping: addressSchema,
});

export const confirmRequestSchema = z.strictObject({
  sessionId: z.string().min(10).max(600),
  checkout: checkoutRequestSchema,
});

export const lookupRequestSchema = z.strictObject({ orderId: orderIdSchema });

export const supportRequestSchema = z.strictObject({
  message: text(LIMITS.supportMessage).pipe(z.string().min(1, "Type a question").max(LIMITS.supportMessage)),
});

export const designRequestSchema = z.strictObject({
  carSlug: slugSchema,
  templateId: templateIdSchema,
  sizeId: sizeIdSchema,
  customization: customizationSchema,
});

export const assetKindSchema = z.enum(["web_preview", "social_image", "print_image", "print_pdf", "master_source"]);

export const validateArtworkRequestSchema = z.strictObject({
  sizeId: sizeIdSchema,
  widthPx: z.number().int().min(1).max(20000),
  heightPx: z.number().int().min(1).max(20000),
});

export type CartItemInput = z.infer<typeof cartItemInputSchema>;
export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;
export type CustomizationInput = z.infer<typeof customizationSchema>;
