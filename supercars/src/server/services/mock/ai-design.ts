import { getRepositories } from "@/server/repositories";
import type { ArtworkValidation, DesignAsset, DesignJob, DesignRequest, PipelineStage, ValidationIssue } from "@/domain/design";
import type { VehicleAsset } from "@/domain/catalog";
import { assetPlanFor, effectiveDpi, printSpecFor } from "@/lib/print-spec";
import { newId } from "@/lib/ids";
import { ProviderError } from "../errors";
import type { AiDesignProvider } from "../contracts";

/* MOCK AI DESIGN PROVIDER — no model is called, no key is needed. It returns
 * the local SVG vehicle asset and a believable pipeline description so the UI
 * can simulate the real flow. Replace with an implementation that calls an
 * image-generation/upscaling service using server-side secrets. */

export const PIPELINE_STAGES: readonly PipelineStage[] = [
  { id: "vehicle_asset", label: "Locating your vehicle asset", durationMs: 500 },
  { id: "ai_generation", label: "Composing the artwork", durationMs: 700 },
  { id: "upscale", label: "Upscaling to print resolution", durationMs: 600 },
  { id: "template_render", label: "Rendering your design template", durationMs: 600 },
  { id: "print_file", label: "Preparing the print file", durationMs: 500 },
  { id: "quality_check", label: "Running quality checks", durationMs: 400 },
];

export const mockAiDesignProvider: AiDesignProvider = {
  id: "mock",

  async generateVehicleAsset({ carSlug }): Promise<VehicleAsset> {
    const entry = await getRepositories().cars.getEntryBySlug(carSlug);
    if (!entry) throw new ProviderError("unavailable", "Unknown vehicle.");
    return entry.generation.vehicle;
  },

  async generatePoster(request: DesignRequest): Promise<DesignJob> {
    const vehicle = await mockAiDesignProvider.generateVehicleAsset({ carSlug: request.carSlug });
    return {
      id: newId("job"),
      status: "succeeded",
      request,
      stages: PIPELINE_STAGES,
      vehicle,
      assets: assetPlanFor(request.sizeId),
      demo: true,
    };
  },

  async upscaleArtwork({ asset, target }): Promise<DesignAsset> {
    const targetWidth = Math.round(((target.widthMm + target.bleedMm * 2) / 25.4) * target.dpi);
    const scale = targetWidth / asset.widthPx;
    return { ...asset, widthPx: targetWidth, heightPx: Math.round(asset.heightPx * scale), dpi: target.dpi };
  },

  async validateArtwork({ asset, spec }): Promise<ArtworkValidation> {
    const issues: ValidationIssue[] = [];
    const dpi = effectiveDpi(asset.widthPx, spec.widthMm + spec.bleedMm * 2);
    if (dpi < 150) issues.push({ code: "dpi_too_low", message: `Effective resolution is ${Math.round(dpi)} DPI; at least 150 is required.`, severity: "error" });
    else if (dpi < spec.dpi * 0.9) issues.push({ code: "dpi_marginal", message: `Effective resolution is ${Math.round(dpi)} DPI; ${spec.dpi} is recommended.`, severity: "warning" });
    const expectedRatio = (spec.heightMm + spec.bleedMm * 2) / (spec.widthMm + spec.bleedMm * 2);
    if (Math.abs(asset.heightPx / asset.widthPx - expectedRatio) > 0.01) {
      issues.push({ code: "aspect_mismatch", message: "Aspect ratio does not match the print size including bleed.", severity: "error" });
    }
    return { valid: !issues.some((i) => i.severity === "error"), issues };
  },

  async renderPrintAssets(request: DesignRequest): Promise<readonly DesignAsset[]> {
    void printSpecFor(request.sizeId);
    return assetPlanFor(request.sizeId);
  },
};
