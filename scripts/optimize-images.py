#!/usr/bin/env python3
"""
Generate WebP siblings for the site's images, and downscale a few that ship far
more pixels than they display.

Deliberate choices:
  * The original .jpg/.png files are LEFT IN PLACE. Every source reference was
    switched to .webp, but if one was missed the old file still resolves — a
    missed reference degrades to a larger image instead of a broken one.
  * Quality 82 / method 6. At the sizes used here this is visually
    indistinguishable from the q75 JPEGs it replaces while being much smaller,
    so "don't change the UI" holds for image fidelity too.
  * OG/social images stay PNG (see index.html) — some crawlers still handle
    WebP poorly, so those are only downscaled, never reformatted.

Run from the repo root:  python3 scripts/optimize-images.py
"""

import pathlib
import sys

from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
PUB = ROOT / "public" / "assets"

QUALITY = 82
METHOD = 6

# Images that ship far more pixels than they are ever displayed at.
# name -> max width in px (height scales proportionally).
DOWNSCALE = {
    "tke-lockup-dark.png": 1200,  # was 4500px wide, displayed at 200px. 1200 keeps
                                  # it valid as the og:image (crawlers want >=1200).
    "tke-crest.png": 512,         # displayed at ~167px (334px @2x)
    "tke-logo.png": 512,
    "stjude-logo.png": 512,
}


def human(n: int) -> str:
    return f"{n / 1024:.0f}KB"


def to_webp(src: pathlib.Path) -> tuple[int, int]:
    """Write a .webp sibling. Returns (before, after) bytes."""
    dst = src.with_suffix(".webp")
    before = src.stat().st_size
    with Image.open(src) as im:
        # Preserve alpha for PNGs; drop it for photos so WebP picks the lossy path.
        if im.mode in ("RGBA", "LA", "P"):
            im = im.convert("RGBA")
        else:
            im = im.convert("RGB")
        im.save(dst, "WEBP", quality=QUALITY, method=METHOD)
    return before, dst.stat().st_size


def downscale_in_place(src: pathlib.Path, max_w: int) -> tuple[int, int]:
    before = src.stat().st_size
    with Image.open(src) as im:
        if im.width <= max_w:
            return before, before
        h = round(im.height * max_w / im.width)
        im = im.resize((max_w, h), Image.LANCZOS)
        im.save(src, optimize=True)
    return before, src.stat().st_size


def main() -> int:
    if not PUB.is_dir():
        print(f"error: {PUB} not found — run from the repo root", file=sys.stderr)
        return 1

    total_before = total_after = 0

    # 1. Downscale the oversized originals FIRST so their WebP is generated
    #    from the already-correct dimensions.
    for name, max_w in DOWNSCALE.items():
        p = PUB / name
        if not p.exists():
            print(f"  skip (missing): {name}")
            continue
        b, a = downscale_in_place(p, max_w)
        if b != a:
            print(f"  downscale {name}: {human(b)} -> {human(a)}")

    # 2. WebP siblings for every raster image under public/assets.
    for src in sorted(PUB.rglob("*")):
        if src.suffix.lower() not in {".jpg", ".jpeg", ".png"}:
            continue
        try:
            b, a = to_webp(src)
        except Exception as exc:  # noqa: BLE001 - report and continue
            print(f"  FAILED {src.relative_to(PUB)}: {exc}", file=sys.stderr)
            continue
        total_before += b
        total_after += a
        rel = src.relative_to(PUB)
        print(f"  {rel}: {human(b)} -> {human(a)}")

    print(
        f"\ntotal raster payload: {human(total_before)} -> {human(total_after)} "
        f"({100 * (1 - total_after / total_before):.0f}% smaller)"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
