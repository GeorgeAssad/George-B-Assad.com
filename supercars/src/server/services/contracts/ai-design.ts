import type { VehicleAsset } from "@/domain/catalog";
import type { ArtworkValidation, DesignAsset, DesignJob, DesignRequest, PrintSpec } from "@/domain/design";

/* AI DESIGN BOUNDARY (server-only).
 * Browser → our endpoint → this provider → result. Provider keys live in
 * server env; endpoints in front of it enforce auth, quotas and rate limits
 * because generation is the expensive operation.
 *
 * Future pipeline: car → vehicle asset → AI generation/editing → upscale →
 * template render → high-res print file → quality validation. */

export interface AiDesignProvider {
  readonly id: string;
  generateVehicleAsset(input: { carSlug: string }): Promise<VehicleAsset>;
  generatePoster(request: DesignRequest): Promise<DesignJob>;
  upscaleArtwork(input: { asset: DesignAsset; target: PrintSpec }): Promise<DesignAsset>;
  validateArtwork(input: { asset: DesignAsset; spec: PrintSpec }): Promise<ArtworkValidation>;
  /** Produce every deliverable (web, social, print image, print PDF, master) for a request. */
  renderPrintAssets(request: DesignRequest): Promise<readonly DesignAsset[]>;
}
