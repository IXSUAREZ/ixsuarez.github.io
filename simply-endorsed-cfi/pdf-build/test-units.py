#!/Users/diegosuarez/Desktop/VIBE CODING PROJECTS/Foreflight Document EDITOR/99_archive/generated-and-cache/pdf-build-venv/bin/python
"""
test-units.py — unit test for the PREV/NEXT unit sequence (idea-01).

Validates stamp_nav.build_units() against the real marker table:

  1. Part I steps category opener -> bundle start pages -> next category
     (prints the student-pilot run; every bundle start page is a unit page,
     so no pages are silently skipped by NEXT)
  2. Part II steps workflow-by-workflow (pre-existing granular behavior)
  3. Part III also steps through the 10 lesson-plan sub-pages
  4. unit pages strictly increase (no same-page dead clicks) and boundary
     clamp/dim behavior is preserved (first unit part-1, last unit dims
     NEXT; front matter dims PREV)
  5. crumb_for() resolves on every page of the book (bundle/lesson units
     used to fall through / raise StopIteration)

Usage:  venv-python test-units.py [pdf-path]
Default pdf-path is config.py's clean .base.pdf next to the stamped output.
Exit 0 = all green, 1 = failures. Read-only: never writes to the PDF.
"""

import json
import os
import sys

import fitz

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

import stamp_nav  # noqa: E402  (module import is side-effect free)
import config  # noqa: E402

# argv[1] overrides the default: the pristine .base.pdf next to the shipped
# PDF (markers survive there — the stamped PDF is scrubbed).
PDF_PATH = sys.argv[1] if len(sys.argv) > 1 else config.BASE_PATH

with open(os.path.join(HERE, "nav-data.json")) as f:
    NAV = json.load(f)

failures = []


def fail(msg):
    failures.append(msg)
    print(f"  FAIL  {msg}")


def ok(msg):
    print(f"  ok    {msg}")


doc = fitz.open(PDF_PATH)
npages = doc.page_count
markers = stamp_nav.scan_markers(doc)
model = stamp_nav.build_model(NAV, markers)
units = model["units"]
ids = [u["id"] for u in units]
pages = [u["page"] for u in units]
print(f"\npdf: {os.path.basename(PDF_PATH)} ({npages} pages), "
      f"{len(units)} nav units")

# ── [1] global shape: strictly increasing pages, boundaries ─────────────
print("\n[1] unit sequence shape")
if all(b > a for a, b in zip(pages, pages[1:])):
    ok(f"{len(units)} units, pages strictly increase (no dead-click units)")
else:
    fail(f"unit pages not strictly increasing: {pages}")
if ids[0] == "part-1" and "part-2" in ids and "part-3" in ids and \
        ids.index("part-1") < ids.index("part-2") < ids.index("part-3"):
    ok("part-1 < part-2 < part-3 anchors present in order")
else:
    fail(f"part anchors wrong: {[i for i in ids if i.startswith('part:')]}")
if all(0 <= p < npages for p in pages):
    ok("every unit page is inside the document")
else:
    fail(f"unit page out of range: {pages}")

# ── [2] Part I: bundle-by-bundle within each category ───────────────────
print("\n[2] Part I categories step bundle-by-bundle")
i1, i2, i3 = ids.index("part-1"), ids.index("part-2"), ids.index("part-3")
part1_units = units[i1 + 1:i2]
cat_order = model["cat_order"]
exp_ids = []
for c in cat_order:
    exp_ids.append(f"cat:{c['slug']}")
    exp_ids += [f"bundle:{b['id']}" for b in c["bundles"]]
# merged (same-page) units drop out, so actual must equal expected filtered
# to first-on-page — equivalent check: order-preserving subsequence + full
# page coverage.
actual_part1 = ids[i1 + 1:i2]
exp_on_page = []
seen_pages = set()
for u in part1_units:
    seen_pages.add(u["page"])
pos = 0
subseq_ok = True
for uid in actual_part1:
    try:
        pos = exp_ids.index(uid, pos) + 1
    except ValueError:
        subseq_ok = False
        fail(f"Part I unit {uid} out of reading order")
        break
if subseq_ok:
    ok("Part I unit order = category -> its bundles, in render order")
missing_pages = []
for c in cat_order:
    want = {markers[f"cat:{c['slug']}"]} | \
           {markers[f"bundle:{b['id']}"] for b in c["bundles"]}
    missing_pages += sorted(want - seen_pages)
if missing_pages:
    fail(f"Part I bundle start pages with no unit: {missing_pages}")
else:
    ok("every category + bundle start page in Part I is a unit page "
       "(no silent skips)")

# student-pilot demonstration run (the assignment's verified bug: NEXT from
# 1-based p9 used to jump to p22, skipping bundles 02-10)
print("\n[3] student-pilot unit run (bug repro: NEXT 9 -> 22)")
stu_start = actual_part1.index("cat:student-pilot") + i1 + 1
stu_end = next((k for k in range(stu_start + 1, len(units))
                if units[k]["id"].startswith("cat:")), i2)
print("        idx  unit                                   page (1-based)")
for k in range(stu_start, stu_end):
    print(f"        {k:3d}  {units[k]['id']:38s} {units[k]['page'] + 1}")
stu_cat = next(c for c in NAV["categories"] if c["slug"] == "student-pilot")
stu_want_pages = sorted({markers[f"cat:student-pilot"]} |
                        {markers[f"bundle:{b['id']}"] for b in stu_cat["bundles"]})
stu_got_pages = [u["page"] for u in units[stu_start:stu_end]]
if stu_got_pages == stu_want_pages:
    ok(f"student-pilot steps consecutively through all "
       f"{len(stu_want_pages)} bundle start pages "
       f"(1-based {[p + 1 for p in stu_want_pages]})")
else:
    fail(f"student-pilot unit pages {stu_got_pages} != expected "
         f"{stu_want_pages}")
# the exact old bug: from bundle:first-solo's page NEXT must NOT jump to
# the next category
fs_pno = markers["bundle:first-solo"]
ui = model["unit_index_for"](fs_pno)
nxt = units[ui + 1]
if nxt["id"] == "bundle:night-solo" and nxt["page"] < markers["cat:sport-pilot"]:
    ok(f"NEXT from 1-based p{fs_pno + 1} -> {nxt['id']} "
       f"(p{nxt['page'] + 1}), not the next category")
else:
    fail(f"NEXT from p{fs_pno + 1} -> {nxt['id']} p{nxt['page'] + 1} "
         f"(expected bundle:night-solo)")

# ── [4] Part II: workflow-by-workflow (unchanged) ───────────────────────
print("\n[4] Part II workflows stay granular")
want_wf = [f"wf:{w['id']}" for w in NAV["workflows"]]
got_wf = ids[i2 + 1:i3]
if got_wf == want_wf:
    ok(f"all {len(want_wf)} workflow units in order between part-2/part-3")
else:
    fail(f"Part II units {got_wf} != {want_wf}")

# ── [5] Part III: lesson sub-pages are units too ────────────────────────
print("\n[5] Part III steps through lesson-plan sub-pages")
want_gs = [f"gs:{g['id']}" for g in NAV["guidance"]]
got_gs = [u for u in ids[i3 + 1:] if u in want_gs]
if got_gs == want_gs:
    ok("all 7 top-level guidance units present in order")
else:
    fail(f"guidance units {got_gs} != {want_gs}")
lessons = NAV.get("lessons", [])
lesson_units = [u for u in units[i3 + 1:]
                if u["id"] in {f"gs:{l['id']}" for l in lessons}]
lesson_pages_want = sorted({markers[f"gs:{l['id']}"] for l in lessons})
unit_pages_p3 = {u["page"] for u in units[i3 + 1:]}
if lesson_units and all(p in unit_pages_p3 for p in lesson_pages_want):
    ok(f"{len(lesson_units)} lesson units (merges on shared pages); all "
       f"{len(lesson_pages_want)} lesson start pages are unit pages")
    lp = ids.index("gs:lesson-plan")
    apx = ids.index("gs:appendix")
    if all(lp < ids.index(u["id"]) < apx for u in lesson_units):
        ok("lesson units sit between gs:lesson-plan and gs:appendix")
    else:
        fail("lesson units not between lesson-plan and appendix")
else:
    fail(f"lesson start pages missing from units: "
         f"{[p for p in lesson_pages_want if p not in unit_pages_p3]}")

# ── [6] boundary clamp/dim behavior (mirrors draw_dock) ─────────────────
print("\n[6] boundary clamp/dim behavior")
ui_front = model["unit_index_for"](1)           # front matter page
if ui_front == -1:
    ok(f"front matter (p2): no current unit -> PREV dim, NEXT=part-1 "
       f"(p{units[0]['page'] + 1})")
else:
    fail(f"front matter unit index {ui_front}, expected -1")
ui_last = model["unit_index_for"](npages - 1)
if ui_last == len(units) - 1:
    ok(f"last page (p{npages}): current = last unit {units[-1]['id']} "
       f"-> NEXT dim")
else:
    fail(f"last page unit index {ui_last}, expected {len(units) - 1}")

# ── [7] crumb_for resolves on every page ────────────────────────────────
print("\n[7] breadcrumb resolves on every page")
bad = []
for pno in range(npages):
    try:
        crumb, top = model["crumb_for"](pno)
        if not crumb or not top:
            bad.append((pno + 1, "empty"))
    except Exception as e:                       # noqa: BLE001
        bad.append((pno + 1, repr(e)))
if bad:
    fail(f"crumb_for failed on pages: {bad[:8]}")
else:
    ok(f"crumb_for returns text on all {npages} pages "
       f"(bundle + lesson units included)")

# ── summary ─────────────────────────────────────────────────────────────
print("\n" + "─" * 40)
if failures:
    print(f"\nUNIT QA FAILED: {len(failures)} problem(s)")
    sys.exit(1)
print("\nUNIT QA PASSED — all checks green")
