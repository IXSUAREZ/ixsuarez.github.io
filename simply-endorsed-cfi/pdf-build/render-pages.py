#!/Users/diegosuarez/Desktop/VIBE CODING PROJECTS/Foreflight Document EDITOR/99_archive/generated-and-cache/pdf-build-venv/bin/python
"""
render-pages.py — rasterize a fixed list of book pages into qa/pages/ for
the pixel-diff visual regression check (qa-visual.py).

Pages are selected by their invisible ZZPGM|<key>|ZZ text markers, NOT by
hardcoded page numbers, so the same logical page is captured even when
pagination shifts between builds. File names are stable keys (cover.png,
toc.png, part-1.png, cat-student-pilot.png, wf-pre-solo.png,
gs-journey.png, ...) — that stability is what makes qa/baseline/
comparable across builds.

Fixed page list: cover, toc, the 3 part dividers, one page per category
chapter, one workflow flow page (pre-solo), and the journey, quickref,
flashcards and appendix guidance pages.

Usage:  ./render-pages.py [pdf-path]     (default: the shipped PDF)
Writes: qa/pages/<key>.png + qa/pages/manifest.json (key → marker → page)

Run via the pdf-build venv python. Exit 0 = rendered, 1 = missing markers.
(Invoke with the interpreter path — the shebang contains a space.)
"""

import json
import os
import re
import sys

import fitz

import config

HERE = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.join(HERE, "qa", "pages")

ZOOM = 2.0  # fixed forever — baseline and candidates must rasterize identically

# The fixed page list beyond cover/toc/parts/categories: one workflow flow
# page plus four guidance pages.
WORKFLOW_PICK = "pre-solo"
GUIDANCE_PICKS = ["journey", "quickref", "flashcards", "appendix"]


def main():
    pdf_path = sys.argv[1] if len(sys.argv) > 1 else config.PDF_PATH
    with open(os.path.join(HERE, "nav-data.json")) as f:
        nav = json.load(f)

    doc = fitz.open(pdf_path)
    markers = {}
    for pno in range(doc.page_count):
        for m in re.finditer(r"ZZPGM\|([^|]+)\|ZZ", doc[pno].get_text()):
            markers.setdefault(m.group(1), pno)

    # (output key, marker key) — the cover is always page 0 (marker None)
    picks = [("cover", None), ("toc", "toc:toc")]
    picks += [(f"part-{i}", f"part:part-{i}") for i in (1, 2, 3)]
    picks += [(f"cat-{c['slug']}", f"cat:{c['slug']}") for c in nav["categories"]]
    picks.append((f"wf-{WORKFLOW_PICK}", f"wf:{WORKFLOW_PICK}"))
    picks += [(f"gs-{g}", f"gs:{g}") for g in GUIDANCE_PICKS]

    missing = [m for _, m in picks if m and m not in markers]
    if missing:
        print(f"missing markers in {pdf_path}: {missing}", file=sys.stderr)
        sys.exit(1)

    os.makedirs(OUT_DIR, exist_ok=True)
    mat = fitz.Matrix(ZOOM, ZOOM)
    manifest = {"zoom": ZOOM, "pdf": os.path.basename(pdf_path), "pages": {}}
    for key, marker in picks:
        pno = 0 if marker is None else markers[marker]
        pix = doc[pno].get_pixmap(matrix=mat, alpha=False)
        pix.save(os.path.join(OUT_DIR, f"{key}.png"))
        manifest["pages"][key] = {"marker": marker, "page": pno + 1}
        print(f"  {key:<36} page {pno + 1:>3}  {pix.width}x{pix.height}")

    with open(os.path.join(OUT_DIR, "manifest.json"), "w") as f:
        json.dump(manifest, f, indent=2)
    print(f"\nwrote {len(picks)} pages to {os.path.relpath(OUT_DIR, HERE)}")


if __name__ == "__main__":
    main()
