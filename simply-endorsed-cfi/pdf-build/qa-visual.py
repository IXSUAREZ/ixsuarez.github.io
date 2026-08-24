#!/Users/diegosuarez/Desktop/VIBE CODING PROJECTS/Foreflight Document EDITOR/99_archive/generated-and-cache/pdf-build-venv/bin/python
"""
qa-visual.py — visual regression gate. Pixel-diffs qa/pages/ (fresh renders
from render-pages.py) against the committed baseline in qa/baseline/.

A pixel counts as changed when any RGB channel differs by more than
DIFF_TOLERANCE (absorbs anti-aliasing/hinting jitter between renders); a
page fails when its changed-pixel fraction exceeds MAX_CHANGED_FRACTION.
The file sets must match exactly in both directions (a new page needs a
baseline; a vanished page leaves a stale one).

Usage:
  ./qa-visual.py                    compare; exit 1 on any page above threshold
  ./qa-visual.py --update-baseline  accept qa/pages/ as the new committed baseline

Typical flow after an intentional visual change:
  node render-pdf.js && ./stamp_nav.py          # rebuild the shipped PDF
  ./render-pages.py && ./qa-visual.py           # see what moved
  ./qa-visual.py --update-baseline              # accept it

Run via the pdf-build venv python (needs PyMuPDF + numpy).
(Invoke with the interpreter path — the shebang contains a space.)
"""

import os
import shutil
import sys

import fitz
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
PAGES_DIR = os.path.join(HERE, "qa", "pages")
BASELINE_DIR = os.path.join(HERE, "qa", "baseline")

DIFF_TOLERANCE = 16               # per-channel, 0..255
MAX_CHANGED_FRACTION = 0.001      # 0.1% of a page's pixels — intentionally tiny


def pngs(d):
    if not os.path.isdir(d):
        return set()
    return {f for f in os.listdir(d) if f.endswith(".png")}


def load_rgb(path):
    pix = fitz.Pixmap(path)
    if pix.alpha:
        pix = fitz.Pixmap(pix, 0)  # drop alpha
    arr = np.frombuffer(pix.samples, dtype=np.uint8)
    return arr.reshape(pix.height, pix.width, pix.n)[:, :, :3].astype(np.int16)


def update_baseline():
    names = pngs(PAGES_DIR)
    if not names:
        print("qa/pages/ has no PNGs — run render-pages.py first", file=sys.stderr)
        sys.exit(1)
    os.makedirs(BASELINE_DIR, exist_ok=True)
    for stale in sorted(pngs(BASELINE_DIR) - names):
        os.remove(os.path.join(BASELINE_DIR, stale))
        print(f"  removed stale baseline page {stale}")
    for f in sorted(names):
        shutil.copy2(os.path.join(PAGES_DIR, f), os.path.join(BASELINE_DIR, f))
    print(f"baseline updated: {len(names)} pages accepted into qa/baseline/ — commit them")


def main():
    if "--update-baseline" in sys.argv:
        update_baseline()
        return

    pages, base = pngs(PAGES_DIR), pngs(BASELINE_DIR)
    failures = []
    if not pages:
        print("qa/pages/ has no PNGs — run render-pages.py first", file=sys.stderr)
        sys.exit(1)
    if not base:
        print("qa/baseline/ has no PNGs — run qa-visual.py --update-baseline first",
              file=sys.stderr)
        sys.exit(1)

    for f in sorted(pages - base):
        failures.append(f"{f}: no baseline page (new pick? accept with --update-baseline)")
    for f in sorted(base - pages):
        failures.append(f"{f}: stale baseline page (no longer rendered)")

    print(f"\n[1] pixel-diff {len(pages & base)} pages vs qa/baseline/ "
          f"(tolerance {DIFF_TOLERANCE}/255, threshold {MAX_CHANGED_FRACTION * 100}%)")
    worst = 0.0
    for f in sorted(pages & base):
        a = load_rgb(os.path.join(PAGES_DIR, f))
        b = load_rgb(os.path.join(BASELINE_DIR, f))
        if a.shape != b.shape:
            failures.append(f"{f}: geometry changed {b.shape} -> {a.shape}")
            print(f"  FAIL  {f:<36} geometry changed")
            continue
        frac = float((np.abs(a - b).max(axis=2) > DIFF_TOLERANCE).mean())
        worst = max(worst, frac)
        if frac > MAX_CHANGED_FRACTION:
            failures.append(
                f"{f}: {frac * 100:.4f}% of pixels changed "
                f"(threshold {MAX_CHANGED_FRACTION * 100}%)"
            )
            print(f"  FAIL  {f:<36} changed={frac * 100:.4f}%")
        else:
            print(f"  ok    {f:<36} changed={frac * 100:.4f}%")

    print("\n" + "─" * 40)
    if failures:
        for m in failures:
            print(f"  FAIL  {m}")
        print(
            f"\nVISUAL QA FAILED: {len(failures)} problem(s) — inspect qa/pages/ "
            f"vs qa/baseline/; accept intentional changes with "
            f"qa-visual.py --update-baseline"
        )
        sys.exit(1)
    print(f"\nVISUAL QA PASSED — {len(pages & base)} pages within threshold "
          f"(worst {worst * 100:.4f}%)")


if __name__ == "__main__":
    main()
