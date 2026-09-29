/* Tiny hex colour helpers so vehicle paint can be lightened/darkened without a dependency. */

const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));

export function parseHex(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h.padEnd(6, "0");
  return [parseInt(full.slice(0, 2), 16), parseInt(full.slice(2, 4), 16), parseInt(full.slice(4, 6), 16)];
}

export function toHex([r, g, b]: [number, number, number]): string {
  return `#${[r, g, b].map((v) => clamp(v).toString(16).padStart(2, "0")).join("")}`;
}

/** Mix `hex` toward `target` by t (0–1). */
export function mix(hex: string, target: string, t: number): string {
  const a = parseHex(hex);
  const b = parseHex(target);
  return toHex([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]);
}

export const lighten = (hex: string, t: number) => mix(hex, "#ffffff", t);
export const darken = (hex: string, t: number) => mix(hex, "#000000", t);
