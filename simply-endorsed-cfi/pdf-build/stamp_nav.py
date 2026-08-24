#!/Users/diegosuarez/Desktop/VIBE CODING PROJECTS/Foreflight Document EDITOR/99_archive/generated-and-cache/pdf-build-venv/bin/python
"""
stamp_nav.py — stamps CFI-Binder-style navigation chrome onto every page of
the Simply Endorsed CFI PDF (except the cover):

  * top bar      y=16..38   CONTENTS LIBRARY WORKFLOWS GUIDANCE | AC 61-65K
  * right rail   x=552..612 hero badge + numbered beads (bleeds to page edge)
  * bottom dock  y=748..772 breadcrumb | PREV CONTENTS NEXT BACK(GoBack)

Reads nav-data.json (make-nav-data.js) and the invisible ZZPGM|<key>|ZZ page
markers already in the PDF text layer. Writes to a temp file and atomically
replaces the target PDF.

All drawing/model logic lives in chrome_core.py (idea #40 — shared with the
binder's endorse_chrome.py); this file is only the standalone-PDF wrapper:
deck = CONTENTS|LIBRARY|WORKFLOWS|GUIDANCE + AC button, page offset 0, and
BACK via a named /GoBack link (chrome_core.insert_named_goback).

Target PDF comes from config.py (config.json; SIMPLY_ENDORSED_OUT env var
overrides it for scratch runs).

Usage:  ./stamp_nav.py                stamp the rendered PDF
        ./stamp_nav.py --from-base    copy .base.pdf over the target first,
                                      then stamp (fast re-stamp: skips the
                                      minutes-long render-pdf.js re-run)
"""

import argparse
import json
import os
import shutil
import sys

import fitz

from chrome_core import (      # noqa: F401  (re-exported for legacy callers)
    PAGE_W, PAGE_H, TOP_Y0, TOP_Y1, DOCK_Y0, DOCK_Y1, DOCK_RULE_Y,
    RAIL_X0, RAIL_DRAW_X0, HERO_Y0, HERO_H, BEAD_H, BEAD_PITCH,
    BEAD_FIRST_Y0, LINK_TO, hx, TITAN_DARK, TITAN_MID, ACTIVE_BLUE, SHADOW,
    SLATE, DIM, BEVEL_DARK, WHITE, RULE, NEUTRAL, BTN_FS, RADIUS, rrect,
    fit_size, ctext, chevron, ext_arrow, nav_button, scan_markers,
    build_model, insert_named_goback, draw_top_deck, draw_dock, draw_bead,
    draw_hero, draw_rail,
)
import config

HERE = os.path.dirname(os.path.abspath(__file__))
PDF_PATH = config.PDF_PATH
BASE_PATH = config.BASE_PATH
NAV_DATA = os.path.join(HERE, "nav-data.json")


# ── main ────────────────────────────────────────────────────────────────
def main():
    ap = argparse.ArgumentParser(
        description="Stamp navigation chrome onto the Simply Endorsed CFI PDF.")
    ap.add_argument("--from-base", action="store_true",
                    help="copy the pristine .base.pdf over the target first, "
                         "then stamp (fast re-stamp without re-rendering)")
    args = ap.parse_args()

    if args.from_base:
        if not os.path.exists(BASE_PATH):
            print(f"--from-base: base copy not found: {BASE_PATH}\n"
                  "run node render-pdf.js first to create it",
                  file=sys.stderr)
            sys.exit(1)
        shutil.copyfile(BASE_PATH, PDF_PATH)
        print(f"reset {PDF_PATH} from clean base {BASE_PATH}")

    with open(NAV_DATA) as f:
        nav = json.load(f)
    doc = fitz.open(PDF_PATH)
    npages = doc.page_count

    # idempotence guard: chrome on page 2 (index 1) means already stamped
    dock_zone = fitz.Rect(0, 730, PAGE_W, PAGE_H)
    for lnk in doc[1].get_links():
        if lnk["kind"] == fitz.LINK_NAMED and \
                fitz.Rect(lnk["from"]).intersects(dock_zone):
            print("already stamped — for a fast re-stamp use "
                  "`./stamp_nav.py --from-base` (restores the clean base "
                  "first), or re-run node render-pdf.js for a full re-render",
                  file=sys.stderr)
            sys.exit(1)

    markers = scan_markers(doc)
    need = (["toc:toc", "part:part-1", "part:part-2", "part:part-3"] +
            [f"cat:{c['slug']}" for c in nav["categories"]] +
            [f"bundle:{b['id']}" for c in nav["categories"]
             for b in c["bundles"]] +
            [f"wf:{w['id']}" for w in nav["workflows"]] +
            [f"gs:{g['id']}" for g in nav["guidance"]])
    missing = [k for k in need if k not in markers]
    if missing:
        print(f"missing markers: {missing}", file=sys.stderr)
        sys.exit(1)

    model = build_model(nav, markers)
    deck_targets = [("CONTENTS", model["toc"]), ("LIBRARY", model["p1"]),
                    ("WORKFLOWS", model["p2"]), ("GUIDANCE", model["p3"])]

    for pno in range(1, doc.page_count):       # cover (page 0): no chrome
        page = doc[pno]
        _, active_top = model["crumb_for"](pno)
        draw_top_deck(page, deck_targets, active_top, nav["sourceUrl"],
                      ac_label=nav.get("acVersion", "AC 61-65K"))
        draw_rail(page, pno, model, nav, markers)
        draw_dock(page, pno, model)

    tmp = PDF_PATH + ".tmp-stamp.pdf"
    doc.save(tmp, garbage=3, deflate=True)
    doc.close()
    os.replace(tmp, PDF_PATH)
    print(f"stamped chrome onto pages 2..{npages} of {PDF_PATH}")


if __name__ == "__main__":
    main()
