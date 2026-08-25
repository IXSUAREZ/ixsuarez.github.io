from pathlib import Path
#!/Users/diegosuarez/Desktop/VIBE CODING PROJECTS/Foreflight Document EDITOR/99_archive/generated-and-cache/pdf-build-venv/bin/python
"""
stamp_nav.py — stamps CFI-Binder-style navigation chrome onto every page of
the Simply Endorsed CFI PDF (except the cover):

  * top bar      y=16..38   CONTENTS LIBRARY WORKFLOWS GUIDANCE | AC 61-65K
  * right rail   x=552..612 hero badge + numbered beads (bleeds to page edge)
  * thumb band   x=608..612 staggered chapter index tab at the extreme edge
                 (idea-31; drawn before the rail so beads paint over)
  * bottom dock  y=748..772 breadcrumb | PREV CONTENTS NEXT BACK(GoBack)

Reads nav-data.json (make-nav-data.js) and the invisible ZZPGM|<key>|ZZ page
markers already in the PDF text layer. After chrome is stamped, every marker
is redacted out of the shipped text layer (scrub_pgm_markers) so in-PDF
search, copy-paste, and screen readers stay clean. Writes to a temp file and
atomically replaces the target PDF.

All drawing/model logic lives in chrome_core.py (idea #40 — shared with the
binder's endorse_chrome.py); this file is only the standalone-PDF wrapper:
deck = CONTENTS|LIBRARY|WORKFLOWS|GUIDANCE + AC button, page offset 0, and
BACK via a raw /Named /GoBack action (chrome_core.insert_raw_goback).

All chrome text uses an embedded bold TTF (fonts/Inter-700.ttf via
chrome_core's CHROME_FONT helpers — core-14 Helvetica is never embedded
and breaks fit_size() under viewer substitution). The final save uses
subset_fonts() + garbage=4, deflate=True, clean=True so the stamped file
stays close to the clean base (idea-48).

After chrome is stamped, every ZZPGM marker is redacted out of the shipped
text layer (chrome_core.scrub_pgm_markers) so in-PDF search, copy-paste,
and screen readers stay clean; the pristine .base.pdf keeps its markers
for the binder pipeline and QA.

Also stamps provenance metadata (author / subject / keywords / creator) onto
the document: the creator field carries the UTC build timestamp plus the
dataHash of the committed dist/data-snapshot.json (see qa-data-drift.js), so
every shipped PDF states exactly which data revision produced it.

Target PDF comes from config.py (config.json; SIMPLY_ENDORSED_OUT env var
overrides it for scratch runs); a positional pdf-path argument overrides
both.

Usage:  ./stamp_nav.py [pdf-path]   stamp the rendered PDF
        ./stamp_nav.py --from-base  copy .base.pdf over the target first,
                                    then stamp (fast re-stamp: skips the
                                    minutes-long render-pdf.js re-run)
"""

import argparse
import json
import os
import re
import shutil
import sys
from datetime import datetime, timezone

import fitz

from chrome_core import (      # noqa: F401  (re-exported for legacy callers)
    PAGE_W, PAGE_H, TOP_Y0, TOP_Y1, DOCK_Y0, DOCK_Y1, DOCK_RULE_Y,
    RAIL_X0, RAIL_DRAW_X0, HERO_Y0, HERO_H, BEAD_H, BEAD_PITCH,
    BEAD_FIRST_Y0, LINK_TO, hx, TITAN_DARK, TITAN_MID, ACTIVE_BLUE, SHADOW,
    SLATE, DIM, BEVEL_DARK, WHITE, RULE, NEUTRAL, BTN_FS, RADIUS, rrect,
    CHROME_FONT_FILE, CHROME_FONT, CHROME_FONTNAME, chrome_w, chrome_text,
    fit_size, ctext, chevron, ext_arrow, nav_button, scan_markers,
    scrub_pgm_markers, build_units,
    build_model, insert_raw_goback, insert_named_goback, draw_top_deck,
    draw_dock, draw_bead, draw_hero, draw_rail,
    BAND_X0, BAND_H, BAND_CLEARANCE, band_rect, draw_thumb_band,
)
import config

HERE = os.path.dirname(os.path.abspath(__file__))
PDF_PATH = config.PDF_PATH
BASE_PATH = config.BASE_PATH
NAV_DATA = os.path.join(HERE, "nav-data.json")
DATA_SNAPSHOT = os.path.join(HERE, "dist", "data-snapshot.json")


# ── provenance metadata ─────────────────────────────────────────────────
def ac_version_from_source(source_url):
    """'…/AC_61-65K.pdf' → 'AC 61-65K' (fallback: 'AC 61-65')."""
    m = re.search(r"AC_(\d+)-(\d+)([A-Z])", source_url or "")
    if m:
        return f"AC {m.group(1)}-{m.group(2)}{m.group(3)}"
    return "AC 61-65"


def set_provenance_metadata(doc, nav):
    """Author/subject/keywords + build stamp (UTC time · data-snapshot hash).

    Merges into the existing metadata so Chromium's title/producer survive.
    The dataHash links this PDF to the committed dist/data-snapshot.json —
    the qa-data-drift.js gate for an AC 61-65L revision.
    """
    data_hash = "unknown"
    try:
        with open(DATA_SNAPSHOT) as f:
            data_hash = json.load(f).get("dataHash", "unknown")
    except (OSError, ValueError):
        pass

    # AC version: nav-data's acVersion (APP_META — single source of truth),
    # falling back to parsing the sourceUrl for stale nav-data files.
    ac = nav.get("acVersion") or ac_version_from_source(
        nav.get("sourceUrl", ""))
    keywords = "; ".join(
        [c["label"] for c in nav.get("categories", [])] + ["logbook endorsement"]
    )
    stamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    md = dict(doc.metadata)
    md.update({
        "author": "Suarez CFI",
        "subject": f"FAA {ac} Endorsement Reference",
        "keywords": keywords,
        "creator": f"Simply Endorsed CFI pdf-build · built {stamp} UTC · data-snapshot {data_hash}",
    })
    doc.set_metadata(md)


# ── main ────────────────────────────────────────────────────────────────
def main():
    ap = argparse.ArgumentParser(
        description="Stamp navigation chrome onto the Simply Endorsed CFI PDF.")
    ap.add_argument("pdf", nargs="?", default=None,
                    help="target PDF path (overrides config.py / "
                         "SIMPLY_ENDORSED_OUT for this run)")
    ap.add_argument("--from-base", action="store_true",
                    help="copy the pristine .base.pdf over the target first, "
                         "then stamp (fast re-stamp without re-rendering)")
    args = ap.parse_args()

    pdf_path = args.pdf or PDF_PATH
    base_path = (pdf_path[:-4] + ".base.pdf"
                 if pdf_path.lower().endswith(".pdf")
                 else pdf_path + ".base.pdf")

    if args.from_base:
        if not os.path.exists(base_path):
            print(f"--from-base: base copy not found: {base_path}\n"
                  "run node render-pdf.js first to create it",
                  file=sys.stderr)
            sys.exit(1)
        shutil.copyfile(base_path, pdf_path)
        print(f"reset {pdf_path} from clean base {base_path}")

    with open(NAV_DATA) as f:
        nav = json.load(f)
    doc = fitz.open(pdf_path)
    npages = doc.page_count

    # idempotence guard: a raw /Named /GoBack BACK annot on page 2 (index 1)
    # means already stamped. get_links() cannot see /S/Named actions
    # (MuPDF limitation), so inspect the raw annot objects.
    for entry in doc[1].annot_xrefs():
        a_type, a_val = doc.xref_get_key(entry[0], "A")
        flat = a_val.replace(" ", "").replace("\n", "") \
            if a_type == "dict" else ""
        if "/S/Named" in flat and "/N/GoBack" in flat:
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
            [f"gs:{g['id']}" for g in nav["guidance"]] +
            [f"gs:{l['id']}" for l in nav.get("lessons", [])])
    missing = [k for k in need if k not in markers]
    if missing:
        print(f"missing markers: {missing}", file=sys.stderr)
        sys.exit(1)

    model = build_model(nav, markers)
    deck_targets = [("CONTENTS", model["toc"]), ("LIBRARY", model["p1"]),
                    ("WORKFLOWS", model["p2"]), ("GUIDANCE", model["p3"])]

    # Page 0 (Cover): Interactive ENTER DIRECTORY button linking to TOC
    btn_rect = fitz.Rect(170.0, 650.0, 442.0, 725.0)
    page0 = doc[0]
    page0.insert_link({"kind": fitz.LINK_GOTO, "from": btn_rect, "page": 1, "to": fitz.Point(36, 36)})

    for pno in range(1, doc.page_count):       # content pages
        page = doc[pno]
        _, active_top = model["crumb_for"](pno)
        draw_top_deck(page, deck_targets, active_top, nav["sourceUrl"],
                      ac_label=nav.get("acVersion", "AC 61-65K"))
        # idea-31: thumb band first — rail hero/beads paint over any overlap
        draw_thumb_band(page, pno, model)
        draw_rail(page, pno, model, nav, markers)
        draw_dock(page, pno, model)

    set_provenance_metadata(doc, nav)

    # markers have served their purpose — scrub them from the text layer
    scrubbed = scrub_pgm_markers(doc)

    tmp = pdf_path + ".tmp-stamp.pdf"
    # idea-48: subset the embedded chrome font (full TTF would add ~300 KB;
    # the chrome uses only a few dozen glyphs), then garbage=4 + clean —
    # together the stamped file lands well below the clean base (was
    # garbage=3, which bloated the file by ~48%). Exactly ONE save.
    doc.subset_fonts()
    doc.save(tmp, garbage=4, deflate=True, clean=True)
    doc.close()
    os.replace(tmp, pdf_path)
    print(f"stamped chrome onto pages 2..{npages} of {pdf_path}")
    print(f"scrubbed {scrubbed} ZZPGM page markers from the shipped text layer")


if __name__ == "__main__":
    main()
