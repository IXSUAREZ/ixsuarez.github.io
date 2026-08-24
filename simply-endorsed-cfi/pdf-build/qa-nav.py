#!/Users/diegosuarez/Desktop/VIBE CODING PROJECTS/Foreflight Document EDITOR/99_archive/generated-and-cache/pdf-build-venv/bin/python
"""
qa-nav.py — programmatic QA for the stamped navigation chrome.

Checks:
  1. every page except the cover has >= 8 chrome links (top bar y=16..38,
     dock y>=742, rail x0>=552 — content links never enter these zones)
  2. every non-cover page has exactly one LINK_NAMED GoBack
  3. rail bead counts per chapter == bundle counts (3 chapters sampled in
     full; bead counts printed for ALL chapters)
  4. 5 sampled bead links land on pages containing their bundle marker
  5. prints total link annotations + per-chapter bead counts

Run via the pdf-build venv python. Exit 0 = all green, 1 = failures.
(Invoke with the interpreter path — the shebang contains a space.)

Target PDF comes from config.py (config.json; SIMPLY_ENDORSED_OUT env var
overrides it for scratch runs).
"""

import json
import os
import re
import sys

import fitz

import config

HERE = os.path.dirname(os.path.abspath(__file__))
PDF_PATH = config.PDF_PATH

with open(os.path.join(HERE, "nav-data.json")) as f:
    NAV = json.load(f)

failures = []


def fail(msg):
    failures.append(msg)
    print(f"  FAIL  {msg}")


def ok(msg):
    print(f"  ok    {msg}")


def chrome_zone(r):
    r = fitz.Rect(r)
    in_top = r.y0 >= 15 and r.y1 <= 39.5
    in_dock = r.y0 >= 741.5
    in_rail = r.x0 >= 552
    return in_top or in_dock or in_rail


doc = fitz.open(PDF_PATH)
npages = doc.page_count

# markers (target verification)
markers = {}
for pno in range(npages):
    for m in re.finditer(r"ZZPGM\|([^|]+)\|ZZ", doc[pno].get_text()):
        markers.setdefault(m.group(1), pno)

all_links = []
per_page_chrome = {}
goback_pages = []
for pno in range(npages):
    links = doc[pno].get_links()
    all_links.extend(links)
    chrome = [l for l in links if chrome_zone(l["from"])]
    per_page_chrome[pno] = chrome
    if sum(1 for l in links if l["kind"] == fitz.LINK_NAMED
           and l.get("nameddest") == "GoBack"):
        goback_pages.append(pno)

print("\n[1] chrome link counts per page")
bad = [p for p in range(1, npages) if len(per_page_chrome[p]) < 8]
if bad:
    fail(f"pages with <8 chrome links: {[p + 1 for p in bad]}")
else:
    ok(f"pages 2..{npages} each have >=8 chrome links")
if per_page_chrome[0]:
    fail("cover page has chrome links (must be chrome-free)")
else:
    ok("cover page is chrome-free")

print("\n[2] exactly one LINK_NAMED GoBack per non-cover page")
bad = []
for pno in range(1, npages):
    n = sum(1 for l in doc[pno].get_links()
            if l["kind"] == fitz.LINK_NAMED and l.get("nameddest") == "GoBack")
    if n != 1:
        bad.append((pno + 1, n))
if goback_pages and 0 in goback_pages:
    bad.append((1, "cover has GoBack"))
if bad:
    fail(f"GoBack count != 1 on pages: {bad}")
else:
    ok(f"pages 2..{npages} each have exactly one GoBack")

print("\n[3] rail bead counts per chapter")
cat_pages = sorted((markers[f"cat:{c['slug']}"], c) for c in NAV["categories"])
bead_counts = {}
for i, (pg, c) in enumerate(cat_pages):
    nxt = cat_pages[i + 1][0] if i + 1 < len(cat_pages) else markers["part:part-2"]
    mid = pg if pg < nxt else pg
    beads = [l for l in per_page_chrome[mid]
             if fitz.Rect(l["from"]).x0 >= 552 and fitz.Rect(l["from"]).y0 >= 84]
    bead_counts[c["slug"]] = len(beads)
    print(f"        {c['slug']:<28} beads={len(beads):<3} bundles={len(c['bundles'])}")
for slug in ["student-pilot", "additional-recurrent", "robinson-sfar73"]:
    cat = next(c for c in NAV["categories"] if c["slug"] == slug)
    if bead_counts[slug] != len(cat["bundles"]):
        fail(f"{slug}: bead count {bead_counts[slug]} != bundle count {len(cat['bundles'])}")
    else:
        ok(f"{slug}: {bead_counts[slug]} beads == {len(cat['bundles'])} bundles")

print("\n[4] sampled bead links land on their bundle marker pages")
sampled = 0
sample_bad = []
for i, (pg, c) in enumerate(cat_pages):
    if c["slug"] not in ("student-pilot", "additional-recurrent",
                         "robinson-sfar73", "private-pilot"):
        continue
    beads = sorted(
        (l for l in per_page_chrome[pg]
         if fitz.Rect(l["from"]).x0 >= 552 and fitz.Rect(l["from"]).y0 >= 84),
        key=lambda l: fitz.Rect(l["from"]).y0)
    for bi, l in enumerate(beads):
        if sampled >= 5:
            break
        b = c["bundles"][bi]
        tgt = l.get("page", -1)
        want = markers[f"bundle:{b['id']}"]
        txt = doc[tgt].get_text() if 0 <= tgt < npages else ""
        if tgt != want or f"ZZPGM|bundle:{b['id']}|ZZ" not in txt:
            sample_bad.append((c["slug"], b["id"], tgt, want))
        sampled += 1
if sample_bad:
    fail(f"bead link target mismatches: {sample_bad}")
else:
    ok(f"{sampled} sampled bead links land on pages carrying their bundle marker")

print("\n[5] totals")
print(f"        total link annotations in PDF: {len(all_links)}")
new_links = sum(len(v) for v in per_page_chrome.values())
print(f"        chrome links added (in chrome zones): {new_links}")

print("\n" + "─" * 40)
if failures:
    print(f"\nNAV QA FAILED: {len(failures)} problem(s)")
    sys.exit(1)
print("\nNAV QA PASSED — all checks green")
