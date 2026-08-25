#!/Users/diegosuarez/Desktop/VIBE CODING PROJECTS/Foreflight Document EDITOR/99_archive/generated-and-cache/pdf-build-venv/bin/python
"""
qa-content.py — PDF-level content completeness gate.

Runs against the clean .base.pdf (the stamped PDF is marker-free by design —
stamp_nav.py redacts the ZZPGM markers). The defect class this catches is
Chromium print silently DROPPING content that overflows the page box: the
HTML holds all 96 cards and all 96 index entries, but overflow can erase
them from the rendered PDF (the A.22–A.40 evens vanished from the number
index that way).

Checks:
  1. every one of the 96 endorsement card markers (ZZPGM|en:A.n|ZZ) is
     present in the base PDF text layer
  2. the AC 61-65K Number Index pages list every A.1–A.96 pill

Usage:  qa-content.py        Exit 0 = complete, 1 = content missing.
"""

import re
import sys

import fitz  # PyMuPDF

from config import BASE_PATH

MARKER_RE = re.compile(r"ZZPGM\|en:(A\.\d+)\|ZZ")
# Index pages carry "A.n — A.n+10" group labels; other pages never do.
INDEX_GROUP_RE = re.compile(r"\bA\.\d{1,2} — A\.\d{1,2}\b")
INDEX_PILL_RE = re.compile(r"\bA\.(\d{1,2})\b")

EXPECTED = {f"A.{n}" for n in range(1, 97)}


def main():
    doc = fitz.open(BASE_PATH)

    # ── 1. all 96 card markers ───────────────────────────────────────────
    markers = set()
    index_ids = set()
    for page in doc:
        text = page.get_text()
        markers.update(MARKER_RE.findall(text))
        if len(INDEX_GROUP_RE.findall(text)) >= 1:
            index_ids.update(f"A.{n}" for n in INDEX_PILL_RE.findall(text))
    doc.close()

    failures = []

    missing_markers = sorted(EXPECTED - markers, key=lambda s: int(s[2:]))
    if missing_markers:
        failures.append(f"{len(missing_markers)} card marker(s) missing: "
                        + ", ".join(missing_markers))
    else:
        print(f"  ok    all {len(EXPECTED)} endorsement card markers present")

    # The index check is set-completeness over pages carrying the group
    # labels; ids picked up from the labels themselves never hurt.
    missing_index = sorted(EXPECTED - index_ids, key=lambda s: int(s[2:]))
    if missing_index:
        failures.append(f"{len(missing_index)} number-index entr(y/ies) missing: "
                        + ", ".join(missing_index))
    else:
        print(f"  ok    number index lists all {len(EXPECTED)} endorsements")

    if failures:
        print(f"\nCONTENT COMPLETENESS FAILED — {len(failures)} check(s):")
        for f in failures:
            print(f"  {f}")
        sys.exit(1)
    print("CONTENT COMPLETENESS PASSED")


if __name__ == "__main__":
    main()
