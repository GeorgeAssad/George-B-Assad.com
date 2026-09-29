import type { Money } from "./money";

/* ----------------------------------------------------------------------------
 * CATALOG DOMAIN — what we sell and what it is made from.
 * Pure types. No demo data, no behaviour. Swap the data source, not these types.
 * -------------------------------------------------------------------------- */

export type BodyType = "sedan" | "coupe" | "wagon" | "gt" | "supercar" | "fastback";

export type PerformanceCategory =
  | "Track weapon"
  | "Grand tourer"
  | "Daily performance"
  | "Icon"
  | "Supercar";

export interface Brand {
  readonly id: string;
  readonly name: string;
  readonly country: string;
  /** Sort weight for "popular manufacturers". Higher first. */
  readonly popularity: number;
}

/** A model line, e.g. "M3". Generations hang off it. */
export interface Car {
  readonly id: string;
  readonly slug: string;
  readonly brandId: string;
  readonly name: string;
}

export interface CarSpecs {
  readonly years: string;
  readonly powerKw: number;
  readonly torqueNm: number;
  readonly seats: number;
  readonly drivetrain: "RWD" | "AWD" | "FWD";
  readonly engine: string;
  /** Marks numbers as illustrative catalog data, not live-researched. */
  readonly source: "catalog-prototype";
}

/**
 * Silhouette families the local SVG renderer understands.
 * The future AI pipeline replaces this with a generated image asset.
 */
export type VehicleArchetype =
  | "sport-sedan"
  | "coupe"
  | "boxy-coupe"
  | "sports-coupe"
  | "muscle"
  | "fastback"
  | "wagon"
  | "gt"
  | "supercar";

export interface VehiclePalette {
  /** Body highlight colour used by the artwork (not brand paint). */
  readonly body: string;
  readonly accent: string;
}

/** Vehicle artwork. A discriminated union so generated assets slot in later. */
export type VehicleAsset =
  | {
      readonly kind: "svg-archetype";
      readonly archetype: VehicleArchetype;
      readonly palette: VehiclePalette;
      /** Small per-model tweaks (wing, stance, roofline) handled by the renderer. */
      readonly traits: readonly VehicleTrait[];
    }
  | {
      readonly kind: "image-url";
      readonly url: string;
      readonly width: number;
      readonly height: number;
    };

export type VehicleTrait = "wing" | "wide-body";

/* ------------------------------ Car photography ---------------------------- */

/** Attribution that the photo's licence requires us to show. */
export interface PhotoCredit {
  readonly title: string;
  readonly author: string;
  /** Short licence name, e.g. "CC BY 4.0" or "CC0". */
  readonly licenseName: string;
  readonly licenseUrl: string;
  /** Page the original was published on (Wikimedia Commons file page). */
  readonly sourceUrl: string;
}

/**
 * A processed, self-hosted photograph of the car. File names are derived, not stored:
 * `/cars/<generationSlug>/<id>-<width>.<avif|webp>` for every width in `widths`.
 */
export interface CarPhoto {
  readonly id: string;
  readonly alt: string;
  /** Pixel size of the largest processed file. All widths share this aspect ratio. */
  readonly width: number;
  readonly height: number;
  readonly widths: readonly number[];
  /** Focus point in percent (0–100). Drives `object-position` when the photo is cropped. */
  readonly focal: { readonly x: number; readonly y: number };
  /** Dominant colour shown while the image loads. */
  readonly color: string;
  readonly credit: PhotoCredit;
}

/** A specific generation of a model. This is the unit customers pick. */
export interface CarGeneration {
  readonly id: string;
  readonly slug: string;
  readonly carId: string;
  /** Generation code, e.g. "G80", "992". */
  readonly generation: string;
  readonly displayName: string;
  readonly tagline: string;
  readonly description: string;
  readonly bodyType: BodyType;
  readonly performance: PerformanceCategory;
  readonly specs: CarSpecs;
  readonly vehicle: VehicleAsset;
  /** Real photographs, best first. Empty when no suitably licensed photo exists yet. */
  readonly photos: readonly CarPhoto[];
  readonly popularity: number;
  readonly featured: boolean;
}

/** Denormalised read model used by lists and detail pages. */
export interface CarEntry {
  readonly brand: Brand;
  readonly car: Car;
  readonly generation: CarGeneration;
}

/* ---------------------------- Design templates ---------------------------- */

export type TemplateId = "minimal" | "blueprint" | "racing" | "heritage" | "luxury";

export type DecorationId =
  | "speed-lines"
  | "tech-grid"
  | "measure-ticks"
  | "crosshair"
  | "blueprint-dims"
  | "double-frame"
  | "checker-strip"
  | "laurel"
  | "corner-marks"
  | "red-rule"
  | "micro-labels"
  | "gold-rule";

export interface GradientStop {
  readonly offset: number;
  readonly color: string;
}

/** Rect in fractions of poster width/height (0–1). */
export interface FractionRect {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

export interface TextStyleSpec {
  readonly font: "display" | "sans" | "serif" | "mono";
  readonly weight: number;
  /** Font size as a fraction of poster width. */
  readonly size: number;
  /** Letter spacing in em. */
  readonly tracking: number;
  readonly uppercase: boolean;
  readonly color: string;
  readonly align: "start" | "middle" | "end";
}

export interface TemplateLayout {
  readonly background: {
    readonly base: string;
    readonly gradient?: {
      readonly angle: number;
      readonly stops: readonly GradientStop[];
    };
    readonly glow?: { readonly cx: number; readonly cy: number; readonly r: number; readonly color: string };
  };
  /** Side margin as a fraction of poster width; anchors start/end aligned text. */
  readonly margin: number;
  readonly artFrame: FractionRect;
  /** How the vehicle sits in the frame. */
  readonly artTreatment: "float" | "outline" | "blueprint" | "duotone";
  /** Optional paint override so a template can keep the car on-palette (e.g. graphite for Luxury). */
  readonly artPaint?: string;
  readonly title: { readonly y: number; readonly style: TextStyleSpec };
  readonly subtitle: { readonly y: number; readonly style: TextStyleSpec };
  readonly personalization: {
    readonly y: number;
    readonly nameStyle: TextStyleSpec;
    readonly metaStyle: TextStyleSpec;
  };
  readonly technical: {
    readonly y: number;
    readonly layout: "row" | "columns";
    readonly labelStyle: TextStyleSpec;
    readonly valueStyle: TextStyleSpec;
  };
  readonly branding: { readonly y: number; readonly text: string; readonly style: TextStyleSpec };
  readonly decorations: readonly DecorationId[];
  readonly accent: string;
  readonly ink: string;
}

export interface DesignTemplate {
  readonly id: TemplateId;
  readonly name: string;
  readonly tagline: string;
  readonly description: string;
  /** Static preview asset used for lists and OG; the live preview renders from `layout`. */
  readonly previewImage: string;
  /** Extra charge in minor units, resolved server-side only. */
  readonly surcharge: Money;
  readonly layout: TemplateLayout;
}

/* -------------------------------- Products -------------------------------- */

export type SizeId = "30x40" | "40x60" | "50x70";

export interface PosterSize {
  readonly id: SizeId;
  readonly label: string;
  readonly widthCm: number;
  readonly heightCm: number;
}

export type ProductKind = "poster" | "framed-poster";

export interface Product {
  readonly id: string;
  readonly slug: string;
  readonly kind: ProductKind;
  readonly name: string;
  readonly tagline: string;
  readonly description: string;
  readonly highlights: readonly string[];
  readonly variants: readonly ProductVariant[];
}

export interface ProductVariant {
  readonly id: string;
  readonly sku: string;
  readonly productId: string;
  readonly sizeId: SizeId;
  readonly price: Money;
}
