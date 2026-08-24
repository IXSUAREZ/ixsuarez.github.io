#!/Users/diegosuarez/Desktop/VIBE CODING PROJECTS/Foreflight Document EDITOR/99_archive/generated-and-cache/pdf-build-venv/bin/python
"""
qa-nav.py — exhaustive programmatic QA for the stamped navigation chrome.
Nothing is sampled: every check below runs on EVERY stamped page.

Checks:
  1. every page except the cover has >= 8 chrome links (top bar y=16..38,
     dock y>=742, rail x0>=552 — content links never enter these zones);
     the cover must be chrome-free
  2. every non-cover page has exactly one LINK_NAMED GoBack, in dock slot 4
  3. top deck, every non-cover page: exactly 4 internal buttons targeting
     CONTENTS / LIBRARY / WORKFLOWS / GUIDANCE (the toc, part-1, part-2,
     part-3 marker pages, in x order) plus exactly one URI button whose
     target equals nav-data.json's sourceUrl (the AC 61-65K button)
  4. dock, every non-cover page: CONTENTS always targets the toc page;
     PREV / NEXT target exactly the previous / next nav-unit page from the
     stamp_nav model (and are absent — drawn disabled — at the edges of
     the unit sequence)
  5. rail, every non-cover page: pages the model marks rail-less carry
     zero rail links; every other page has a hero badge targeting its
     chapter marker page plus one bead per bundle / workflow / guidance
     entry — and EVERY bead (all ~88 targets, on every page where they
     appear) lands on the page that actually carries its ZZPGM marker
  6. prints total link annotations + per-chapter bead counts

Geometry constants and the nav-unit model come from stamp_nav.py itself
(the module under test is also the spec); marker pages and link targets
are re-derived here from the shipped PDF and nav-data.json.

Usage:  ./qa-nav.py [pdf-path]     (default: the shipped PDF)
Run via the pdf-build venv python. Exit 0 = all green, 1 = failures.
(Invoke with the interpreter path — the shebang contains a space.)
"""

import json
import os
import re
import sys

import fitz

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import stamp_nav  # noqa: E402  geometry constants + build_model (the spec)

DEFAULT_PDF = "/Users/diegosuarez/Desktop/VIBE CODING PROJECTS/SUAREZ.CFI/output/simply-endorsed-cfi-pdf/Simply-Endorsed-CFI-AC61-65K.pdf"
PDF_PATH = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_PDF

with open(os.path.join(HERE, "nav-data.json")) as f:
    NAV = json.load(f)

failures = []


def fail(msg):
    failures.append(msg)
    print(f"  FAIL  {msg}")


def ok(msg):
    print(f"  ok    {msg}")


# ── zones (constants from stamp_nav — the module that drew the chrome) ──
def in_top(r):
    r = fitz.Rect(r)
    return r.y0 >= stamp_nav.TOP_Y0 - 1 and r.y1 <= stamp_nav.TOP_Y1 + 1.5


def in_dock(r):
    return fitz.Rect(r).y0 >= stamp_nav.DOCK_Y0 - 6.5


def in_rail(r):
    return fitz.Rect(r).x0 >= stamp_nav.RAIL_X0


def chrome_zone(r):
    return in_top(r) or in_dock(r) or in_rail(r)


# dock slot geometry — mirrors draw_dock's locals (bw=60, gap=6, 4 slots
# ending at x=548). Slot 0=PREV 1=CONTENTS 2=NEXT 3=BACK.
DOCK_BW, DOCK_GAP = 60.0, 6.0
DOCK_X0 = 548 - (4 * DOCK_BW + 3 * DOCK_GAP)  # 290


def dock_slot(rect):
    x0 = fitz.Rect(rect).x0
    i = round((x0 - DOCK_X0) / (DOCK_BW + DOCK_GAP))
    if 0 <= i <= 3 and abs(x0 - (DOCK_X0 + i * (DOCK_BW + DOCK_GAP))) < 2:
        return i
    return None


doc = fitz.open(PDF_PATH)
npages = doc.page_count
page_texts = [doc[p].get_text() for p in range(npages)]
page_links = [doc[p].get_links() for p in range(npages)]

# marker table (target verification) — first occurrence wins, as stamp_nav
markers = {}
for pno in range(npages):
    for m in re.finditer(r"ZZPGM\|([^|]+)\|ZZ", page_texts[pno]):
        markers.setdefault(m.group(1), pno)

need = (
    ["toc:toc", "part:part-1", "part:part-2", "part:part-3"]
    + [f"cat:{c['slug']}" for c in NAV["categories"]]
    + [f"bundle:{b['id']}" for c in NAV["categories"] for b in c["bundles"]]
    + [f"wf:{w['id']}" for w in NAV["workflows"]]
    + [f"gs:{g['id']}" for g in NAV["guidance"]]
)
missing = [k for k in need if k not in markers]
if missing:
    print(f"missing markers: {missing}", file=sys.stderr)
    sys.exit(1)

model = stamp_nav.build_model(doc, NAV, markers)
units = model["units"]
toc_page = markers["toc:toc"]

print("\n[1] chrome link counts per page")
bad = [p + 1 for p in range(1, npages)
       if sum(1 for l in page_links[p] if chrome_zone(l["from"])) < 8]
if bad:
    fail(f"pages with <8 chrome links: {bad}")
else:
    ok(f"pages 2..{npages} each have >=8 chrome links")
if any(chrome_zone(l["from"]) for l in page_links[0]):
    fail("cover page has chrome links (must be chrome-free)")
else:
    ok("cover page is chrome-free")

print("\n[2] exactly one LINK_NAMED GoBack per non-cover page, dock slot 4")
bad = []
for pno in range(1, npages):
    gb = [l for l in page_links[pno]
          if l["kind"] == fitz.LINK_NAMED and l.get("nameddest") == "GoBack"]
    if len(gb) != 1:
        bad.append((pno + 1, f"{len(gb)} GoBack links"))
    elif dock_slot(gb[0]["from"]) != 3:
        bad.append((pno + 1, "GoBack not in dock slot 4"))
if any(l["kind"] == fitz.LINK_NAMED and l.get("nameddest") == "GoBack"
       for l in page_links[0]):
    bad.append((1, "cover has GoBack"))
if bad:
    fail(f"GoBack problems: {bad[:10]}{' …' if len(bad) > 10 else ''}")
else:
    ok(f"pages 2..{npages} each have exactly one GoBack in slot 4")

print("\n[3] top deck: 4 chapter buttons + AC sourceUrl button, every page")
want_deck = [toc_page, markers["part:part-1"],
             markers["part:part-2"], markers["part:part-3"]]
deck_bad, ac_bad = [], []
for pno in range(1, npages):
    top = [l for l in page_links[pno] if in_top(l["from"])]
    gotos = sorted((l for l in top if l["kind"] == fitz.LINK_GOTO),
                   key=lambda l: fitz.Rect(l["from"]).x0)
    uris = [l for l in top if l["kind"] == fitz.LINK_URI]
    if len(top) != 5 or len(gotos) != 4 or \
            [l.get("page") for l in gotos] != want_deck:
        deck_bad.append(pno + 1)
    if len(uris) != 1 or uris[0].get("uri") != NAV["sourceUrl"]:
        ac_bad.append(pno + 1)
if deck_bad:
    fail(f"top-deck button/target problems on pages: {deck_bad[:15]}"
         f"{' …' if len(deck_bad) > 15 else ''}")
else:
    ok(f"pages 2..{npages}: CONTENTS/LIBRARY/WORKFLOWS/GUIDANCE all target "
       f"their marker pages")
if ac_bad:
    fail(f"AC button URI != nav-data sourceUrl on pages: {ac_bad[:15]}"
         f"{' …' if len(ac_bad) > 15 else ''}")
else:
    ok(f"pages 2..{npages}: AC button URI == {NAV['sourceUrl']}")

print("\n[4] dock PREV/CONTENTS/NEXT on every page (model-exact)")
dock_bad = []
prev_checked = next_checked = 0
for pno in range(1, npages):
    probs = []
    by_slot = {}
    for l in (l for l in page_links[pno] if in_dock(l["from"])):
        s = dock_slot(l["from"])
        by_slot.setdefault(s if s is not None else "stray", []).append(l)
    if "stray" in by_slot:
        probs.append(f"{len(by_slot['stray'])} dock link(s) outside the 4 slots")

    ui = model["unit_index_for"](pno)
    prev_u = units[ui - 1] if ui > 0 else None
    if ui < 0:  # front matter: before the first unit
        next_u = units[0]
    else:
        next_u = units[ui + 1] if ui < len(units) - 1 else None

    prev = by_slot.get(0, [])
    if prev_u is None:
        if prev:
            probs.append("PREV link present at start of unit sequence")
    elif len(prev) != 1 or prev[0]["kind"] != fitz.LINK_GOTO \
            or prev[0].get("page") != prev_u["page"]:
        probs.append(f"PREV -> {prev[0].get('page') if prev else None}, "
                     f"want page {prev_u['page'] + 1} ({prev_u['id']})")
    else:
        prev_checked += 1

    cont = by_slot.get(1, [])
    if len(cont) != 1 or cont[0]["kind"] != fitz.LINK_GOTO \
            or cont[0].get("page") != toc_page:
        probs.append("CONTENTS missing or not targeting the toc page")

    nxt = by_slot.get(2, [])
    if next_u is None:
        if nxt:
            probs.append("NEXT link present at end of unit sequence")
    elif len(nxt) != 1 or nxt[0]["kind"] != fitz.LINK_GOTO \
            or nxt[0].get("page") != next_u["page"]:
        probs.append(f"NEXT -> {nxt[0].get('page') if nxt else None}, "
                     f"want page {next_u['page'] + 1} ({next_u['id']})")
    else:
        next_checked += 1

    back = by_slot.get(3, [])
    if len(back) != 1 or back[0]["kind"] != fitz.LINK_NAMED \
            or back[0].get("nameddest") != "GoBack":
        probs.append("BACK missing from slot 4 or not a GoBack named link")

    if probs:
        dock_bad.append((pno + 1, probs))
if dock_bad:
    fail(f"dock problems: {dock_bad[:5]}{' …' if len(dock_bad) > 5 else ''}")
else:
    ok(f"pages 2..{npages}: CONTENTS always -> toc; {prev_checked} PREV + "
       f"{next_checked} NEXT links match the unit sequence exactly "
       f"(disabled edges link-free)")

print("\n[5] rail: hero + every bead target, every page")
rail_bad = []
bead_links = 0
verified_targets = set()
all_bead_keys = (
    {f"bundle:{b['id']}" for c in NAV["categories"] for b in c["bundles"]}
    | {f"wf:{w['id']}" for w in NAV["workflows"]}
    | {f"gs:{g['id']}" for g in NAV["guidance"]}
)
for pno in range(1, npages):
    ctx = model["rail_for"](pno)
    rail = [l for l in page_links[pno] if in_rail(l["from"])]
    if ctx is None:
        if rail:
            rail_bad.append((pno + 1, [f"{len(rail)} unexpected rail link(s)"]))
        continue
    hero = [l for l in rail
            if fitz.Rect(l["from"]).y1 <= stamp_nav.HERO_Y0 + stamp_nav.HERO_H + 1]
    beads = sorted(
        (l for l in rail
         if fitz.Rect(l["from"]).y0 >= stamp_nav.BEAD_FIRST_Y0 - 4),
        key=lambda l: fitz.Rect(l["from"]).y0)

    if ctx[0] == "cat":
        _, cat, _ = ctx
        want_hero = markers[f"cat:{cat['slug']}"]
        entries = [(b["id"], f"bundle:{b['id']}") for b in cat["bundles"]]
    elif ctx[0] == "flows":
        want_hero = model["p2"]
        entries = [(w["id"], f"wf:{w['id']}") for w in NAV["workflows"]]
    else:  # guide
        want_hero = model["p3"]
        entries = [(g["id"], f"gs:{g['id']}") for g in NAV["guidance"]]

    probs = []
    if len(hero) != 1 or hero[0]["kind"] != fitz.LINK_GOTO \
            or hero[0].get("page") != want_hero:
        probs.append(f"hero -> {hero[0].get('page') if hero else None}, "
                     f"want page {want_hero + 1}")
    if len(beads) != len(entries):
        probs.append(f"{len(beads)} beads, want {len(entries)}")
    else:
        for l, (eid, mkey) in zip(beads, entries):
            bead_links += 1
            tgt = l.get("page", -1)
            want = markers[mkey]
            if l["kind"] == fitz.LINK_GOTO and tgt == want \
                    and f"ZZPGM|{mkey}|ZZ" in page_texts[tgt]:
                verified_targets.add(mkey)
            else:
                probs.append(f"bead {eid} -> page "
                             f"{tgt + 1 if tgt >= 0 else tgt}, want {want + 1}")
    if probs:
        rail_bad.append((pno + 1, ctx[0], probs))

unverified = sorted(all_bead_keys - verified_targets)
if rail_bad:
    fail(f"rail problems: {rail_bad[:5]}{' …' if len(rail_bad) > 5 else ''}")
elif unverified:
    fail(f"bead targets never verified: {unverified}")
else:
    ok(f"{bead_links} rail bead links checked across all pages — every one "
       f"of the {len(all_bead_keys)} bead targets (71 bundles + 10 workflows "
       f"+ 7 guidance) lands on a page carrying its marker")
    ok("rail-less pages (cover/front matter/part dividers) carry zero rail links")

print("\n[6] per-chapter bead counts (diagnostic)")
cat_pages = sorted((markers[f"cat:{c['slug']}"], c) for c in NAV["categories"])
for i, (pg, c) in enumerate(cat_pages):
    beads = [l for l in page_links[pg]
             if fitz.Rect(l["from"]).x0 >= stamp_nav.RAIL_X0
             and fitz.Rect(l["from"]).y0 >= stamp_nav.BEAD_FIRST_Y0 - 4]
    print(f"        {c['slug']:<28} beads={len(beads):<3} bundles={len(c['bundles'])}")

total_links = sum(len(v) for v in page_links)
chrome_links = sum(1 for v in page_links for l in v if chrome_zone(l["from"]))
print(f"\n        total link annotations in PDF: {total_links}")
print(f"        chrome links (in chrome zones): {chrome_links}")

print("\n" + "─" * 40)
if failures:
    print(f"\nNAV QA FAILED: {len(failures)} problem(s)")
    sys.exit(1)
print("\nNAV QA PASSED — all checks green")
