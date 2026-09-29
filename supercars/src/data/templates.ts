import { money } from "@/domain/money";
import type { DesignTemplate, TextStyleSpec } from "@/domain/catalog";

/* DESIGN TEMPLATES — pure data. The poster renderer reads `layout`; nothing
 * about a template is hardwired into components. The future AI pipeline can
 * replace the vehicle artwork while these layouts stay untouched.
 * Sizes are fractions of poster width; y positions are fractions of height. */

const ts = (
  font: TextStyleSpec["font"],
  weight: number,
  size: number,
  tracking: number,
  color: string,
  align: TextStyleSpec["align"] = "start",
  uppercase = true,
): TextStyleSpec => ({ font, weight, size, tracking, uppercase, color, align });

export const templates: readonly DesignTemplate[] = [
  {
    id: "minimal",
    name: "Minimal",
    tagline: "Quiet, precise, gallery-clean.",
    description:
      "Generous white space, one thin red rule and editorial type. Lets the silhouette do the talking.",
    previewImage: "/templates/minimal.jpg",
    surcharge: money(0),
    layout: {
      background: {
        base: "#efece6",
        gradient: { angle: 180, stops: [{ offset: 0, color: "#f6f4ef" }, { offset: 1, color: "#e4e0d7" }] },
      },
      margin: 0.09,
      artFrame: { x: 0.03, y: 0.19, w: 0.94, h: 0.36 },
      artTreatment: "float",
      title: { y: 0.615, style: ts("display", 600, 0.078, 0.05, "#141414") },
      subtitle: { y: 0.652, style: ts("sans", 500, 0.024, 0.2, "#6d6a64") },
      personalization: {
        y: 0.795,
        nameStyle: ts("display", 700, 0.135, 0.02, "#141414"),
        metaStyle: ts("sans", 500, 0.021, 0.16, "#6d6a64"),
      },
      technical: {
        y: 0.905,
        layout: "row",
        labelStyle: ts("mono", 500, 0.014, 0.18, "#8c8880"),
        valueStyle: ts("display", 600, 0.026, 0.04, "#141414"),
      },
      branding: { y: 0.968, text: "SUPERCARS", style: ts("sans", 700, 0.016, 0.4, "#141414") },
      decorations: ["red-rule", "micro-labels"],
      accent: "#e10600",
      ink: "#141414",
    },
  },
  {
    id: "blueprint",
    name: "Blueprint",
    tagline: "Engineering drawing, fully dimensioned.",
    description:
      "Deep navy paper, hairline grid, dimension lines and a wireframe silhouette. Made for the technical minded.",
    previewImage: "/templates/blueprint.jpg",
    surcharge: money(0),
    layout: {
      background: {
        base: "#0b1a2c",
        gradient: { angle: 160, stops: [{ offset: 0, color: "#0f2540" }, { offset: 1, color: "#081422" }] },
      },
      margin: 0.08,
      artFrame: { x: 0.06, y: 0.19, w: 0.88, h: 0.38 },
      artTreatment: "blueprint",
      title: { y: 0.665, style: ts("mono", 600, 0.05, 0.08, "#dbeaff") },
      subtitle: { y: 0.7, style: ts("mono", 500, 0.02, 0.22, "#7fb2e5") },
      personalization: {
        y: 0.82,
        nameStyle: ts("mono", 700, 0.1, 0.04, "#ffffff"),
        metaStyle: ts("mono", 500, 0.018, 0.2, "#7fb2e5"),
      },
      technical: {
        y: 0.9,
        layout: "columns",
        labelStyle: ts("mono", 500, 0.013, 0.2, "#5f8fc4"),
        valueStyle: ts("mono", 600, 0.024, 0.04, "#dbeaff"),
      },
      branding: { y: 0.968, text: "SUPERCARS / TECH SHEET", style: ts("mono", 600, 0.014, 0.3, "#7fb2e5") },
      decorations: ["tech-grid", "blueprint-dims", "crosshair", "measure-ticks", "corner-marks", "micro-labels"],
      accent: "#7fb2e5",
      ink: "#dbeaff",
    },
  },
  {
    id: "racing",
    name: "Racing",
    tagline: "Speed you can hang on a wall.",
    description:
      "Near-black canvas, a red diagonal, speed lines and a chequered strip. Motorsport energy, kept disciplined.",
    previewImage: "/templates/racing.jpg",
    surcharge: money(0),
    layout: {
      background: {
        base: "#0a0a0b",
        gradient: { angle: 165, stops: [{ offset: 0, color: "#17181b" }, { offset: 0.55, color: "#0c0c0e" }, { offset: 1, color: "#060607" }] },
        glow: { cx: 0.7, cy: 0.35, r: 0.55, color: "rgba(225,6,0,0.22)" },
      },
      margin: 0.08,
      artFrame: { x: -0.02, y: 0.17, w: 1.04, h: 0.4 },
      artTreatment: "float",
      title: { y: 0.66, style: ts("display", 700, 0.1, 0.03, "#ffffff") },
      subtitle: { y: 0.697, style: ts("sans", 600, 0.023, 0.26, "#e10600") },
      personalization: {
        y: 0.815,
        nameStyle: ts("display", 700, 0.15, 0.015, "#ffffff"),
        metaStyle: ts("sans", 500, 0.02, 0.2, "#a3a3a8"),
      },
      technical: {
        y: 0.915,
        layout: "row",
        labelStyle: ts("mono", 500, 0.013, 0.2, "#7c7c82"),
        valueStyle: ts("display", 600, 0.026, 0.05, "#ffffff"),
      },
      branding: { y: 0.972, text: "SUPERCARS", style: ts("sans", 800, 0.016, 0.42, "#ffffff", "start") },
      decorations: ["speed-lines", "checker-strip", "red-rule", "micro-labels"],
      accent: "#e10600",
      ink: "#ffffff",
    },
  },
  {
    id: "heritage",
    name: "Heritage",
    tagline: "Motor-club poster, printed in ink.",
    description:
      "Warm paper stock, a double keyline, laurels and serif lettering. A nod to the golden age of motoring prints.",
    previewImage: "/templates/heritage.jpg",
    surcharge: money(0),
    layout: {
      background: {
        base: "#e8dcc4",
        gradient: { angle: 180, stops: [{ offset: 0, color: "#eee3cc" }, { offset: 1, color: "#dccfb1" }] },
      },
      margin: 0.1,
      artFrame: { x: 0.08, y: 0.17, w: 0.84, h: 0.36 },
      artTreatment: "duotone",
      title: { y: 0.615, style: ts("serif", 700, 0.066, 0.06, "#2a2118", "middle") },
      subtitle: { y: 0.655, style: ts("serif", 500, 0.024, 0.28, "#8a3b2e", "middle") },
      personalization: {
        y: 0.785,
        nameStyle: ts("serif", 700, 0.11, 0.06, "#2a2118", "middle"),
        metaStyle: ts("serif", 500, 0.022, 0.22, "#5b4c3a", "middle"),
      },
      technical: {
        y: 0.9,
        layout: "row",
        labelStyle: ts("serif", 500, 0.014, 0.22, "#7a6a55", "middle"),
        valueStyle: ts("serif", 700, 0.024, 0.06, "#2a2118", "middle"),
      },
      branding: { y: 0.958, text: "SUPERCARS · EST. AUTOMOTIVE STUDIO", style: ts("serif", 600, 0.014, 0.3, "#5b4c3a", "middle") },
      decorations: ["double-frame", "laurel", "corner-marks", "micro-labels"],
      accent: "#8a3b2e",
      ink: "#2a2118",
    },
  },
  {
    id: "luxury",
    name: "Luxury",
    tagline: "Black, gold and restraint.",
    description:
      "Deep black, fine gold keylines and a soft spotlight. Understated luxury for a statement wall.",
    previewImage: "/templates/luxury.jpg",
    surcharge: money(1000),
    layout: {
      background: {
        base: "#08080a",
        gradient: { angle: 180, stops: [{ offset: 0, color: "#141416" }, { offset: 1, color: "#050506" }] },
        glow: { cx: 0.5, cy: 0.36, r: 0.5, color: "rgba(199,164,90,0.16)" },
      },
      margin: 0.1,
      artFrame: { x: 0.04, y: 0.17, w: 0.92, h: 0.38 },
      artTreatment: "float",
      artPaint: "#2b2b31",
      title: { y: 0.635, style: ts("serif", 600, 0.058, 0.16, "#e6d3a3", "middle") },
      subtitle: { y: 0.675, style: ts("sans", 500, 0.02, 0.36, "#a58c58", "middle") },
      personalization: {
        y: 0.8,
        nameStyle: ts("serif", 500, 0.105, 0.12, "#f4ead0", "middle"),
        metaStyle: ts("sans", 500, 0.018, 0.3, "#a58c58", "middle"),
      },
      technical: {
        y: 0.91,
        layout: "row",
        labelStyle: ts("sans", 500, 0.013, 0.28, "#8a7647", "middle"),
        valueStyle: ts("serif", 600, 0.024, 0.1, "#e6d3a3", "middle"),
      },
      branding: { y: 0.962, text: "SUPERCARS", style: ts("sans", 600, 0.016, 0.6, "#c7a45a", "middle") },
      decorations: ["double-frame", "gold-rule", "micro-labels"],
      accent: "#c7a45a",
      ink: "#f4ead0",
    },
  },
];
