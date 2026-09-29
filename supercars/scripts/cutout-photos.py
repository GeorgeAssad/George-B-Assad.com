#!/usr/bin/env python3
"""
Removes the background from the car images that photos/manifest.json marks `"mode": "cutout"`.

    node scripts/process-photos.mjs --framed     # writes assets-src/framed/<slug>/<id>.png (plates blurred, cropped)
    python3 scripts/cutout-photos.py             # writes assets-src/cutouts/<slug>/<id>.png (RGBA)
    node scripts/process-photos.mjs              # trims, encodes AVIF/WebP with alpha, regenerates car-photos.ts

`npm run photos:cutout` runs the first two. Developer tool only: the processed web files are committed,
so builds never need Python. Setup once:  python3 -m venv .venv && .venv/bin/pip install "rembg[cpu]" pillow numpy scipy

Beyond the model's mask this script:
  * keeps only the biggest connected shape (the car) and drops specks,
  * fills holes so glass and grilles stay solid, darkening filled glass so no room shows through,
  * feathers the edge slightly and replaces edge colours with the car's own colours (no white halo).
"""
import argparse
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent


def clean_alpha(alpha: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """Returns (cleaned alpha 0..1, mask of hole pixels that were filled)."""
    solid = alpha > 0.5
    labels, n = ndimage.label(solid)
    if n > 1:
        sizes = ndimage.sum(solid, labels, range(1, n + 1))
        keep = 1 + int(np.argmax(sizes))
        solid = labels == keep
    filled = ndimage.binary_fill_holes(solid)
    holes = filled & ~solid
    # Smooth 1px staircase from the model, then a soft edge.
    soft = ndimage.gaussian_filter(filled.astype(np.float32), sigma=1.1)
    soft = np.clip((soft - 0.35) / 0.5, 0.0, 1.0)  # tighten so the edge sits slightly inside, killing halos
    return soft, holes


def defringe(rgb: np.ndarray, alpha: np.ndarray) -> np.ndarray:
    """Replace colours of semi-transparent edge pixels with the nearest fully opaque pixel's colour."""
    core = alpha > 0.98
    if not core.any():
        return rgb
    idx = ndimage.distance_transform_edt(~core, return_distances=False, return_indices=True)
    return rgb[idx[0], idx[1]]


def cut(img_path: Path, out_path: Path, session, alpha_matting: bool) -> None:
    from rembg import remove

    src = Image.open(img_path).convert("RGB")
    result = remove(src, session=session, alpha_matting=alpha_matting, post_process_mask=True)
    alpha = np.asarray(result.getchannel("A"), dtype=np.float32) / 255.0
    rgb = np.asarray(src, dtype=np.float32)

    cleaned, holes = clean_alpha(alpha)
    # Glass that the model treated as background: keep it, but dark, so the stage never shows the old room.
    if holes.any():
        rgb = rgb.copy()
        rgb[holes] = rgb[holes] * 0.28 + np.array([6, 8, 12], dtype=np.float32) * 0.72
    rgb = defringe(rgb, cleaned)

    out = np.dstack([np.clip(rgb, 0, 255), cleaned * 255.0]).astype(np.uint8)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(out, "RGBA").save(out_path, optimize=True)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--model", default="birefnet-general-lite", help="rembg model: birefnet-general-lite (default), birefnet-general, isnet-general-use, …")
    ap.add_argument("--only", help="only this slug (or slug/id)")
    ap.add_argument("--matting", action="store_true", help="alpha matting for softer edges (slower)")
    args = ap.parse_args()

    from rembg import new_session

    manifest = json.loads((ROOT / "photos" / "manifest.json").read_text())
    todo = [p for p in manifest["photos"] if p.get("mode") == "cutout" and not p.get("alreadyTransparent")]
    if args.only:
        todo = [p for p in todo if args.only in (p["slug"], f'{p["slug"]}/{p["id"]}')]
    if not todo:
        print("nothing to cut out (no photo with mode \"cutout\")")
        return 0

    session = new_session(args.model)
    for p in todo:
        src = ROOT / "assets-src" / "framed" / p["slug"] / f'{p["id"]}.png'
        if not src.exists():
            print(f"missing {src} — run: node scripts/process-photos.mjs --framed", file=sys.stderr)
            return 1
        dst = ROOT / "assets-src" / "cutouts" / p["slug"] / f'{p["id"]}.png'
        cut(src, dst, session, args.matting)
        print(f'cut {p["slug"]}/{p["id"]}  ({args.model})')
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
