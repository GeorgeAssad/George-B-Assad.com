import type { Customization } from "./cart";
import type { SizeId, TemplateId, VehicleAsset } from "./catalog";

/* DESIGN-GENERATION DOMAIN — assets and jobs produced by the (future) AI
 * pipeline. Web preview, social, print image, print PDF and master source are
 * DIFFERENT assets with different dimensions; never reuse one for another. */

export type DesignAssetKind =
  | "web_preview"
  | "social_image"
  | "print_image"
  | "print_pdf"
  | "master_source";

export interface PrintSpec {
  readonly widthMm: number;
  readonly heightMm: number;
  readonly dpi: number;
  readonly bleedMm: number;
  readonly colorProfile: "sRGB" | "AdobeRGB" | "CMYK-FOGRA39";
}

export interface DesignAsset {
  readonly kind: DesignAssetKind;
  readonly mimeType: string;
  readonly widthPx: number;
  readonly heightPx: number;
  readonly dpi?: number;
  /** Absent in the prototype: previews are rendered client-side from template data. */
  readonly url?: string;
}

export type PipelineStageId =
  | "vehicle_asset"
  | "ai_generation"
  | "upscale"
  | "template_render"
  | "print_file"
  | "quality_check";

export interface PipelineStage {
  readonly id: PipelineStageId;
  readonly label: string;
  readonly durationMs: number;
}

export type DesignJobStatus = "queued" | "running" | "succeeded" | "failed";

export interface DesignRequest {
  readonly carSlug: string;
  readonly templateId: TemplateId;
  readonly sizeId: SizeId;
  readonly customization: Customization;
}

export interface DesignJob {
  readonly id: string;
  readonly status: DesignJobStatus;
  readonly request: DesignRequest;
  readonly stages: readonly PipelineStage[];
  readonly vehicle: VehicleAsset;
  readonly assets: readonly DesignAsset[];
  /** True while the pipeline is simulated. */
  readonly demo: boolean;
}

export interface ValidationIssue {
  readonly code: string;
  readonly message: string;
  readonly severity: "error" | "warning";
}

export interface ArtworkValidation {
  readonly valid: boolean;
  readonly issues: readonly ValidationIssue[];
}
