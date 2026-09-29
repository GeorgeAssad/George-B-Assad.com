import type { VehicleArchetype } from "@/domain/catalog";

/* ORIGINAL GENERIC VEHICLE SILHOUETTES — hand-authored, not traced from any
 * manufacturer artwork or photo. Side profile, facing right, in a shared
 * 1000×340 frame. Real cars are ~3.3:1 (length:height); wheels ~15% of length.
 * These are placeholders for the future AI-generated vehicle asset. */

export const VEHICLE_VIEWBOX = { width: 1000, height: 340 } as const;
export const GROUND_Y = 320;
export const WHEEL_CY = 254;
export const TIRE_R = 66;
export const RIM_R = 46;

export interface VehicleShape {
  /** Outline from the rear-lower point, over the roof, to the front-lower point. */
  readonly top: string;
  readonly rearX: number;
  readonly frontX: number;
  readonly archR: number;
  readonly sillY: number;
  readonly glass: string;
  readonly pillars: readonly string[];
  readonly crease: string;
  readonly doors: readonly string[];
  readonly headlight: string;
  readonly taillight: string;
  readonly mirror: string;
  readonly vent?: string;
  readonly wing: string;
  readonly flares: readonly string[];
}

const common = {
  sillY: 298,
  archR: 80,
  headlight: "M 892 168 L 938 184 L 944 197 L 890 183 Z",
  taillight: "M 72 172 L 100 162 L 100 178 L 74 192 Z",
  mirror: "M 690 126 L 716 128 L 710 140 L 690 138 Z",
} as const;

export const vehicleShapes: Record<VehicleArchetype, VehicleShape> = {
  "sport-sedan": {
    ...common,
    rearX: 240,
    frontX: 772,
    top: "M 84 270 L 72 214 C 70 178 76 150 100 140 C 112 136 124 134 150 133 L 262 129 C 304 98 344 62 402 55 L 540 52 C 600 52 652 90 714 128 C 790 142 856 160 906 176 C 938 186 952 206 953 236 L 950 264 L 932 284",
    glass: "M 284 127 C 322 96 354 68 404 62 L 538 59 C 590 60 636 90 692 127 Z",
    pillars: ["M 474 60 L 482 128"],
    crease: "M 104 168 C 300 152 680 156 906 190",
    doors: ["M 482 129 L 480 296", "M 298 130 L 292 294", "M 668 132 L 672 296"],
    wing: "M 100 136 L 168 130 L 170 136 L 102 143 Z",
    flares: ["M 166 262 C 174 222 306 222 314 262", "M 700 262 C 708 222 838 222 846 262"],
  },
  coupe: {
    ...common,
    rearX: 240,
    frontX: 772,
    top: "M 84 270 L 72 216 C 70 182 80 154 108 146 L 250 136 C 300 112 342 70 408 62 L 540 60 C 600 60 656 96 716 132 C 792 146 858 162 908 178 C 940 188 953 208 953 238 L 950 266 L 932 284",
    glass: "M 276 134 C 316 108 350 74 410 68 L 536 66 C 592 67 640 98 694 134 Z",
    pillars: [],
    crease: "M 108 172 C 300 156 680 160 908 192",
    doors: ["M 662 136 L 668 296", "M 330 138 L 322 294"],
    wing: "M 100 146 L 160 140 L 162 146 L 102 153 Z",
    flares: ["M 166 262 C 174 222 306 222 314 262", "M 700 262 C 708 222 838 222 846 262"],
  },
  "boxy-coupe": {
    ...common,
    rearX: 240,
    frontX: 772,
    top: "M 86 272 L 72 208 C 70 172 78 140 112 134 L 250 128 C 292 100 340 62 416 55 L 548 52 C 606 52 654 88 704 122 C 790 140 862 160 912 178 C 942 190 954 210 954 240 L 950 268 L 932 286",
    glass: "M 278 127 C 318 98 354 68 420 62 L 546 59 C 594 60 638 90 684 124 Z",
    pillars: ["M 476 60 L 484 126"],
    crease: "M 112 168 C 300 154 680 158 912 194",
    doors: ["M 656 130 L 662 296", "M 322 132 L 314 294"],
    wing: "M 92 130 L 164 124 L 166 130 L 94 138 Z",
    flares: ["M 166 262 C 174 220 306 220 314 262", "M 700 262 C 708 220 838 220 846 262"],
  },
  "sports-coupe": {
    ...common,
    rearX: 262,
    frontX: 760,
    top: "M 90 270 L 80 222 C 78 190 88 162 118 154 L 240 146 C 290 112 338 68 404 62 L 500 60 C 562 60 620 96 680 130 C 780 146 856 162 908 180 C 940 190 953 210 953 240 L 950 268 L 932 286",
    glass: "M 268 144 C 308 114 344 76 408 70 L 498 67 C 552 68 606 98 664 132 Z",
    pillars: [],
    crease: "M 116 178 C 300 162 680 164 908 194",
    doors: ["M 640 134 L 646 296", "M 350 148 L 342 294"],
    wing: "M 100 156 L 164 148 L 166 154 L 102 162 Z",
    flares: ["M 188 262 C 196 222 328 222 336 262", "M 690 262 C 698 222 830 222 838 262"],
  },
  muscle: {
    ...common,
    rearX: 238,
    frontX: 782,
    top: "M 82 272 L 70 214 C 68 180 78 152 108 146 L 226 138 C 270 108 318 66 382 58 L 500 56 C 552 56 602 84 650 118 C 740 134 850 156 910 176 C 942 188 954 208 954 238 L 950 268 L 932 286",
    glass: "M 254 136 C 292 108 326 72 384 64 L 496 62 C 544 63 586 90 632 124 Z",
    pillars: [],
    crease: "M 106 170 C 300 154 680 158 910 190",
    doors: ["M 604 128 L 610 296", "M 316 138 L 308 294"],
    wing: "M 96 146 L 152 140 L 154 146 L 98 153 Z",
    flares: ["M 164 262 C 172 222 304 222 312 262", "M 712 262 C 720 222 850 222 858 262"],
  },
  fastback: {
    ...common,
    rearX: 236,
    frontX: 748,
    headlight: "M 886 188 a 17 17 0 1 0 34 0 a 17 17 0 1 0 -34 0 Z",
    mirror: "M 680 134 L 706 138 L 700 150 L 680 146 Z",
    top: "M 90 270 L 78 226 C 72 196 78 170 96 156 C 108 148 122 142 140 132 C 210 90 318 66 440 64 L 500 66 C 580 70 644 102 704 144 C 780 154 856 172 906 192 C 938 204 952 222 953 246 L 950 268 L 932 286",
    glass: "M 196 132 C 262 98 352 76 452 74 L 500 76 C 570 80 626 108 678 142 Z",
    pillars: ["M 426 75 L 432 138"],
    crease: "M 116 184 C 300 174 640 178 904 204",
    doors: ["M 610 148 L 616 296", "M 328 152 L 320 294"],
    wing: "M 92 150 L 178 128 L 180 134 L 96 158 Z",
    flares: ["M 160 262 C 168 220 300 220 308 262", "M 690 262 C 698 220 816 220 824 262"],
  },
  wagon: {
    ...common,
    rearX: 238,
    frontX: 778,
    top: "M 84 270 L 70 208 C 66 168 72 118 98 82 C 108 66 124 60 152 58 L 520 54 C 592 54 654 90 714 128 C 790 142 856 160 906 176 C 938 186 952 206 953 236 L 950 264 L 932 284",
    glass: "M 138 126 C 138 100 146 80 162 72 L 516 62 C 582 62 636 94 694 127 Z",
    pillars: ["M 256 68 L 250 127", "M 444 62 L 448 127"],
    crease: "M 98 168 C 300 152 680 156 906 190",
    doors: ["M 448 129 L 446 296", "M 254 130 L 248 294", "M 672 132 L 676 296"],
    wing: "M 100 60 L 176 54 L 178 60 L 102 68 Z",
    flares: ["M 164 262 C 172 222 304 222 312 262", "M 706 262 C 714 222 846 222 854 262"],
  },
  gt: {
    ...common,
    rearX: 228,
    frontX: 796,
    top: "M 84 270 L 72 216 C 70 184 80 160 110 152 L 212 144 C 250 114 304 84 366 78 L 440 78 C 490 78 540 100 584 128 C 660 142 800 162 892 182 C 934 192 954 208 955 238 L 951 266 L 934 286",
    glass: "M 240 144 C 274 118 316 90 368 85 L 438 85 C 484 86 522 106 560 132 Z",
    pillars: [],
    crease: "M 108 178 C 300 164 700 168 910 194",
    doors: ["M 560 134 L 566 296", "M 316 148 L 308 294"],
    wing: "M 96 150 L 154 144 L 156 150 L 98 157 Z",
    flares: ["M 160 262 C 168 222 296 222 304 262", "M 728 262 C 736 222 864 222 872 262"],
  },
  supercar: {
    ...common,
    archR: 76,
    rearX: 234,
    frontX: 772,
    mirror: "M 676 138 L 700 142 L 694 152 L 674 148 Z",
    headlight: "M 878 196 L 940 214 L 942 224 L 874 208 Z",
    top: "M 88 270 L 76 220 C 72 190 82 168 116 160 L 226 150 C 274 130 330 106 396 98 L 462 96 C 524 96 578 112 626 134 C 700 150 820 176 900 200 C 934 210 954 224 956 246 L 952 268 L 934 286",
    glass: "M 306 136 C 342 116 378 106 414 104 L 462 103 C 510 104 552 118 592 138 Z",
    pillars: [],
    crease: "M 112 188 C 300 174 640 178 904 214",
    doors: ["M 556 142 L 560 296", "M 340 146 L 334 294"],
    vent: "M 452 170 C 500 172 548 184 572 216 L 566 232 C 520 222 480 214 452 208 Z",
    wing: "M 88 156 L 172 142 L 174 148 L 92 164 Z",
    flares: ["M 158 262 C 166 224 296 224 304 262", "M 706 262 C 714 224 836 224 844 262"],
  },
};

/** Builds the full body outline: `top` + front arch + sill + rear arch. */
export function bodyPath(shape: VehicleShape): string {
  const dy = shape.sillY - WHEEL_CY;
  const dx = Math.sqrt(shape.archR * shape.archR - dy * dy);
  const r = shape.archR;
  const f = (n: number) => Math.round(n * 10) / 10;
  return [
    shape.top,
    `L ${f(shape.frontX + dx)} ${shape.sillY}`,
    `A ${r} ${r} 0 1 0 ${f(shape.frontX - dx)} ${shape.sillY}`,
    `L ${f(shape.rearX + dx)} ${shape.sillY}`,
    `A ${r} ${r} 0 1 0 ${f(shape.rearX - dx)} ${shape.sillY}`,
    "L 108 290 Z",
  ].join(" ");
}
