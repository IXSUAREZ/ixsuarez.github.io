#!/usr/bin/env python3
"""
chrome_core.py — shared navigation-chrome core for the Simply Endorsed CFI
PDF and the CFI Binder endorsements section (idea #40).

Single source of truth for the code that used to be duplicated (~250 lines,
already drifting) between:

  * stamp_nav.py      (this directory — standalone PDF chrome stamper)
  * endorse_chrome.py (FORE repo 40_tooling/build-scripts — binder chrome)

Both stampers are now thin wrappers around this module. The three
parameterization points:

  1. deck button specs — draw_top_deck(targets=[(label, abs_page), ...],
     active_label=...) lets each caller decide the top-deck buttons and
     which one is painted active-blue.
  2. page offset/base — scan_markers/draw_rail/draw_dock take an `offset`;
     model pages stay section-relative, `offset` is added at link-insertion
     and page-number-display time (0 for the standalone PDF).
  3. goback injection — draw_dock(goback=callable(page, rect)); defaults to
     insert_raw_goback (raw /A<</S/Named/N/GoBack>> annot surgery — the
     only BACK form viewers honor).

Requires PyMuPDF (fitz). No file paths live here — callers own all I/O.
"""

import os
import re

import fitz

PAGE_W, PAGE_H = 612.0, 792.0

# ── geometry ────────────────────────────────────────────────────────────
TOP_Y0, TOP_Y1 = 16.0, 38.0          # top bar/deck (22pt)
DOCK_Y0, DOCK_Y1 = 748.0, 772.0      # bottom dock (24pt)
DOCK_RULE_Y = 742.0                  # hairline above dock
RAIL_X0 = 552.0                      # rail hitbox start (bleeds to 612)
RAIL_DRAW_X0 = 554.0                 # drawn bead left edge
HERO_Y0, HERO_H = 54.0, 28.0
BEAD_H, BEAD_PITCH = 24.0, 28.0
BEAD_FIRST_Y0 = HERO_Y0 + HERO_H + 6.0   # 88
LINK_TO = fitz.Point(36, 54)         # internal goto landing point

# ── thumb-index edge bands (idea-31) ────────────────────────────────────
# Staggered pure-color tabs flush at the extreme right edge (x=608..612),
# one per chapter, so a fanned book edge (or a ForeFlight/GoodReader
# thumbnail grid) reads as a visible index. The safe band area is computed
# per model (build_model): it starts below the deepest possible bead
# column (+ BAND_CLEARANCE) so bands never collide with bead/hero hitboxes,
# and ends at the dock hairline.
BAND_X0 = 608.0                      # band left edge (bleeds to PAGE_W)
BAND_H = 18.0                        # band height
BAND_CLEARANCE = 8.0                 # gap below the deepest bead column


def band_rect(slot, n_slots, area):
    """Rect of thumb-index band `slot` of `n_slots` within the safe band
    area (y0, y1): flush at the extreme right edge, staggered so slot 0
    sits at the area top and slot n_slots-1 flush at its bottom."""
    y0a, y1a = area
    y0 = y0a if n_slots < 2 else \
        y0a + (y1a - y0a - BAND_H) * slot / (n_slots - 1)
    return fitz.Rect(BAND_X0, y0, PAGE_W, y0 + BAND_H)

# ── palette ─────────────────────────────────────────────────────────────
def hx(s):
    s = s.lstrip("#")
    return tuple(int(s[i:i + 2], 16) / 255 for i in (0, 2, 4))

TITAN_DARK = hx("#0F172A")
TITAN_MID = hx("#1E293B")
ACTIVE_BLUE = hx("#2563EB")
SHADOW = hx("#CBD5E1")
SLATE = hx("#475569")
DIM = hx("#64748B")
BEVEL_DARK = hx("#334155")
WHITE = (1, 1, 1)
RULE = hx("#E2E8F0")
NEUTRAL = {"accent": TITAN_DARK, "soft": hx("#F1F5F9"),
           "line": hx("#CBD5E1"), "ink": hx("#334155")}

# ── chrome font (idea-48) ───────────────────────────────────────────────
# Embedded bold TTF for ALL stamped chrome text. Core-14 Helvetica-Bold
# ("hebo") is never embedded in the PDF, so viewers substitute it and the
# fit_size() measurements drift; an embedded font keeps metrics identical
# in every viewer. insert_font() with a fixed resource name reuses one
# document-wide font object, so the TTF lands in the file exactly once.
_HERE = os.path.dirname(os.path.abspath(__file__))
CHROME_FONT_FILE = os.path.join(_HERE, "fonts", "Inter-700.ttf")
CHROME_FONT = fitz.Font(fontfile=CHROME_FONT_FILE)
CHROME_FONTNAME = "CFIB"


def chrome_w(text, fs):
    """Width of `text` at fontsize `fs` in the embedded chrome font."""
    return CHROME_FONT.text_length(text, fontsize=fs)


def chrome_text(page, point, text, fs, color):
    """insert_text() with the embedded chrome font (registered per page
    under a fixed resource name; PyMuPDF reuses the shared font object)."""
    page.insert_font(fontname=CHROME_FONTNAME, fontfile=CHROME_FONT_FILE)
    page.insert_text(point, text, fontname=CHROME_FONTNAME, fontsize=fs,
                     color=color)


BTN_FS = 7.0          # top bar / dock button font size
RADIUS = 3.5


# ── drawing helpers ─────────────────────────────────────────────────────
def rrect(page, rect, fill, border=None, border_w=0.6, shadow=True,
          bevel=None, radius=RADIUS):
    """Squircle body with 1pt drop shadow + 0.4pt specular top bevel."""
    rr = (min(radius / rect.width, 0.5), min(radius / rect.height, 0.5))
    if shadow:
        page.draw_rect(
            fitz.Rect(rect.x0, rect.y0 + 1.0, rect.x1, rect.y1 + 1.0),
            color=None, fill=SHADOW, radius=rr)
    page.draw_rect(rect, color=border, fill=fill,
                   width=border_w if border else 0, radius=rr)
    if bevel:
        page.draw_line((rect.x0 + 2, rect.y0 + 0.6),
                       (rect.x1 - 2, rect.y0 + 0.6),
                       color=bevel, width=0.4)


def fit_size(text, max_w, base, minimum=4.2):
    """Largest fontsize <= base at which text fits max_w (chrome font)."""
    fs = base
    while fs > minimum and chrome_w(text, fs) > max_w:
        fs -= 0.1
    return fs


def ctext(page, rect, text, fs, color, dy=0.0):
    """Horizontally centered chrome text, cap-height vertically centered."""
    fs = fit_size(text, rect.width - 6, fs)
    tw = chrome_w(text, fs)
    baseline = rect.y0 + rect.height / 2 + fs * 0.35 + dy
    chrome_text(page, (rect.x0 + (rect.width - tw) / 2, baseline),
                text, fs, color)
    return fs, tw, baseline


def chevron(page, x, ymid, size, direction, color):
    """Small ‹/› chevron (vector — core fonts lack guillemets)."""
    s = size
    if direction < 0:  # left-pointing
        p1, p2, p3 = (x + s, ymid - s), (x, ymid), (x + s, ymid + s)
    else:
        p1, p2, p3 = (x, ymid - s), (x + s, ymid), (x, ymid + s)
    page.draw_line(p1, p2, color=color, width=1.1, lineCap=1)
    page.draw_line(p2, p3, color=color, width=1.1, lineCap=1)


def ext_arrow(page, x, y, size, color):
    """Small ↗ arrow (vector) with its top-right tip at (x+size, y-size)."""
    tip = (x + size, y - size)
    page.draw_line((x, y), tip, color=color, width=0.9, lineCap=1)
    page.draw_line(tip, (x + size - 2.6, y - size), color=color,
                   width=0.9, lineCap=1)
    page.draw_line(tip, (x + size, y - size + 2.6), color=color,
                   width=0.9, lineCap=1)


def nav_button(page, rect, label, link, fill=TITAN_DARK, text_color=WHITE,
               active=False, chev=0):
    """Titanium nav chip; chev: -1 left chevron, +1 right chevron."""
    bevel = WHITE if active else BEVEL_DARK
    border = tuple(c * 0.75 for c in fill)
    rrect(page, rect, fill, border=border, border_w=0.6, bevel=bevel)
    fs = fit_size(label, rect.width - 14, BTN_FS)
    tw = chrome_w(label, fs)
    gap = 3.0 if chev else 0.0
    group_w = tw + (gap + 3.0 if chev else 0.0)
    x = rect.x0 + (rect.width - group_w) / 2
    ymid = rect.y0 + rect.height / 2
    baseline = ymid + fs * 0.35
    if chev < 0:
        chevron(page, x, ymid - 0.4, 2.6, -1, text_color)
        x += 3.0 + gap
    chrome_text(page, (x, baseline), label, fs, text_color)
    if chev > 0:
        chevron(page, x + tw + gap, ymid - 0.4, 2.6, +1, text_color)
    if link:
        page.insert_link(dict(link, **{"from": rect}))


# ── model (offset-relative page numbers; offset added at link insertion) ──
def build_units(nav, markers, cat_order, p1, p2, p3):
    """PREV/NEXT unit sequence in reading order (idea-01).

    Part I   — category opener + one unit per bundle start page, so the
               dock steps bundle-by-bundle within a category before
               advancing to the next (previously whole bundle ranges were
               silently skipped, e.g. NEXT p9 -> p22 over Student Pilot).
    Part II  — one unit per workflow page (already granular).
    Part III — guidance sections + the lesson-plan sub-pages (nav
               "lessons", the 10 gs:<lesson> markers under gs:lesson-plan).

    Units that would share a page are merged (first/coarsest wins) so
    PREV/NEXT always land on a different page; nothing is skipped because
    merged units start on the same physical page. Unit pages strictly
    increase along the returned list.
    """
    units = [{"id": "part-1", "page": p1,
              "crumb": "PART I · ENDORSEMENT LIBRARY", "title": "PART I"}]
    for c in cat_order:
        units.append({"id": f"cat:{c['slug']}",
                      "page": markers[f"cat:{c['slug']}"],
                      "title": c.get("code", c.get("label", "")[:10])})
        for b in c["bundles"]:
            units.append({"id": f"bundle:{b['id']}",
                          "page": markers[f"bundle:{b['id']}"],
                          "title": b.get("abbrev", b.get("label", "")[:10])})
    units.append({"id": "part-2", "page": p2,
                  "crumb": "PART II · WORKFLOWS", "title": "PART II"})
    for w in nav["workflows"]:
        units.append({"id": f"wf:{w['id']}", "page": markers[f"wf:{w['id']}"],
                      "title": w.get("abbrev", w.get("label", "")[:10])})
    units.append({"id": "part-3", "page": p3,
                  "crumb": "PART III · CFI GUIDANCE", "title": "PART III"})
    for g in nav["guidance"]:
        units.append({"id": f"gs:{g['id']}", "page": markers[f"gs:{g['id']}"],
                      "title": g.get("abbrev", g.get("label", "")[:10])})
        if g["id"] == "lesson-plan":
            for l in nav.get("lessons", []):
                units.append({"id": f"gs:{l['id']}",
                              "page": markers[f"gs:{l['id']}"],
                              "title": l.get("abbrev", l.get("label", "")[:10])})
    units.sort(key=lambda u: u["page"])     # stable: reading order on ties
    return [u for i, u in enumerate(units)
            if i == 0 or u["page"] != units[i - 1]["page"]]


def scan_markers(doc, offset=0, count=None):
    """ZZPGM|<key>|ZZ marker pages, relative to offset. First wins.

    Collects every marker key verbatim, including ones the chrome model
    does not consume (e.g. the per-card `en:<id>` endorsement markers).
    build_model/units/crumb/rail only look up their explicit cat:/bundle:/
    wf:/gs:/part:/toc: keys, so extra keys are inert here but available to
    downstream consumers (the binder merge maps `en:` keys to pages)."""
    if count is None:
        count = doc.page_count - offset
    markers = {}
    for pno in range(offset, offset + count):
        for m in re.finditer(r"ZZPGM\|([^|]+)\|ZZ", doc[pno].get_text()):
            key = m.group(1)
            if key not in markers:          # first occurrence wins
                markers[key] = pno - offset
    return markers


def scrub_pgm_markers(doc):
    """Redact every ZZPGM|<key>|ZZ marker out of the shipped text layer.

    Call AFTER scan_markers() and chrome stamping: the markers have done
    their job and would otherwise pollute in-PDF search, copy-paste, and
    screen readers. Redaction rects come from search_for() on the exact
    token, so they wrap only the 0.6pt white marker glyphs — body text,
    vector banner fills, and the freshly stamped chrome are untouched
    (fill=False paints nothing; LINE_ART_NONE spares vector graphics).
    Returns the number of redacted marker rects.
    """
    scrubbed = 0
    for pno in range(doc.page_count):
        page = doc[pno]
        tokens = [m.group(0)
                  for m in re.finditer(r"ZZPGM\|[^|]+\|ZZ", page.get_text())]
        for token in tokens:
            for rect in page.search_for(token, quads=False):
                page.add_redact_annot(rect, fill=False, cross_out=False)
                scrubbed += 1
        if tokens:
            page.apply_redactions(graphics=fitz.PDF_REDACT_LINE_ART_NONE)
    return scrubbed


def build_model(nav, markers):
    cats_by_slug = {c["slug"]: c for c in nav["categories"]}
    # physical category order (the PDF's render order, not CATEGORY_ORDER)
    cat_pages = sorted(((markers[f"cat:{c['slug']}"], c)
                        for c in nav["categories"]))
    cat_order = [c for _, c in cat_pages]

    p1 = markers["part:part-1"]
    p2 = markers["part:part-2"]
    p3 = markers["part:part-3"]
    toc = markers["toc:toc"]

    # boundary page for each category chapter = next cat/part marker
    bounds = {}
    for i, (pg, c) in enumerate(cat_pages):
        nxt = cat_pages[i + 1][0] if i + 1 < len(cat_pages) else p2
        bounds[c["slug"]] = (pg, nxt)          # [start, end)

    # nav-unit sequence in reading order (see build_units docstring)
    units = build_units(nav, markers, cat_order, p1, p2, p3)

    # per-bundle marker pages within each category
    bundle_page = {b["id"]: markers[f"bundle:{b['id']}"]
                   for c in nav["categories"] for b in c["bundles"]}
    wf_page = {w["id"]: markers[f"wf:{w['id']}"] for w in nav["workflows"]}
    gs_page = {g["id"]: markers[f"gs:{g['id']}"] for g in nav["guidance"]}

    def unit_index_for(pno):
        idx = -1
        for i, u in enumerate(units):
            if u["page"] <= pno:
                idx = i
            else:
                break
        return idx

    def crumb_for(pno):
        """(breadcrumb_text, active_top) for an offset-relative page."""
        if pno < p1:
            return "SIMPLY ENDORSED CFI · CONTENTS", "CONTENTS"
        ui = unit_index_for(pno)
        u = units[ui]
        uid = u["id"]
        top = ("CONTENTS" if pno < p1 else
               "LIBRARY" if pno < p2 else
               "WORKFLOWS" if pno < p3 else "GUIDANCE")
        if "crumb" in u:                       # part dividers
            return u["crumb"], top
        if uid.startswith(("cat:", "bundle:")):
            if uid.startswith("cat:"):
                cat = cats_by_slug[uid[4:]]
            else:
                bid = uid[7:]
                cat = next(c for c in nav["categories"]
                           if any(b["id"] == bid for b in c["bundles"]))
            active_b = None
            for b in cat["bundles"]:
                if bundle_page[b["id"]] <= pno:
                    active_b = b
            base = f"PART I · {cat['label'].upper()}"
            if active_b is None:
                return base, top
            full = f"{base} · {active_b['label'].upper()}"
            if len(full) <= 58:
                return full, top
            short = f"{base} · {active_b['abbrev']}"
            if len(short) <= 62:
                return short, top
            return f"PART I · {cat['code']} · {active_b['abbrev']}", top
        if uid.startswith("wf:"):
            w = next(w for w in nav["workflows"] if w["id"] == uid[3:])
            lbl = "INDEX" if w["id"] == "wf-index" else w["label"].upper()
            crumb = f"PART II · WORKFLOWS · {lbl}"
            if len(crumb) > 62:
                crumb = f"PART II · WORKFLOWS · {w['abbrev']}"
            return crumb, top
        if uid.startswith("gs:"):
            g = next((g for g in nav["guidance"] if g["id"] == uid[3:]), None)
            if g is None:                # lesson sub-page: parent section crumb
                g = next(g for g in nav["guidance"] if g["id"] == "lesson-plan")
            return f"PART III · GUIDANCE · {g['label'].upper()}", top
        return "SIMPLY ENDORSED CFI", top

    def rail_for(pno):
        """Rail context: ('cat', cat, active_bundle_id) | ('flows', active_wf)
        | ('guide', active_gs) | None. Part dividers + front matter: None."""
        if pno < p1 or pno in (p1, p2, p3):
            return None
        if p1 < pno < p2:
            for c in cat_order:
                start, end = bounds[c["slug"]]
                if start <= pno < end:
                    active = None
                    for b in c["bundles"]:
                        if bundle_page[b["id"]] <= pno:
                            active = b["id"]
                    if pno < min(bundle_page[b["id"]] for b in c["bundles"]):
                        active = None      # precedes first bundle
                    return ("cat", c, active)
            return None
        if p2 < pno < p3:
            active = None
            for w in nav["workflows"]:
                if wf_page[w["id"]] <= pno:
                    active = w["id"]
            return ("flows", active)
        if p3 < pno:
            active = None
            for g in nav["guidance"]:
                if gs_page[g["id"]] <= pno:
                    active = g["id"]
            return ("guide", active)
        return None

    # ── thumb-index bands (idea-31) ─────────────────────────────────────
    # Safe band area: below the deepest bead column any railed page can
    # carry (+ clearance), above the dock hairline — bands stay outside
    # every bead/hero hitbox. Derived from the data so an AC revision that
    # adds bundles/workflows/guidance entries shifts the area with it.
    max_beads = max([len(c["bundles"]) for c in nav["categories"]]
                    + [len(nav["workflows"]), len(nav["guidance"])])
    band_area = (max(HERO_Y0 + HERO_H,
                     BEAD_FIRST_Y0 + (max_beads - 1) * BEAD_PITCH + BEAD_H)
                 + BAND_CLEARANCE, DOCK_RULE_Y)
    cat_slot = {c["slug"]: i for i, c in enumerate(cat_order)}
    n_band_slots = len(cat_order) + 2        # categories + Part II + Part III

    def band_for(pno):
        """Thumb-index band spec for an offset-relative page:
        (rect, fill, target_rel_page) | None. None exactly where the rail
        is suppressed (front matter, part dividers; the cover takes no
        chrome at all). Part I chapter pages carry their category's accent
        band at the category's physical-order slot; Part II/III pages a
        single neutral band at their trailing section slots."""
        ctx = rail_for(pno)
        if ctx is None:
            return None
        if ctx[0] == "cat":
            cat = ctx[1]
            accent = cat["theme"]["accent"]
            slot = cat_slot[cat["slug"]]
            fill = hx(accent) if isinstance(accent, str) else accent
            target = markers[f"cat:{cat['slug']}"]
        elif ctx[0] == "flows":
            slot, fill, target = len(cat_order), NEUTRAL["accent"], p2
        else:                                # guide
            slot, fill, target = len(cat_order) + 1, NEUTRAL["accent"], p3
        return (band_rect(slot, n_band_slots, band_area), fill, target)

    return dict(cat_order=cat_order, bounds=bounds, units=units,
                p1=p1, p2=p2, p3=p3, toc=toc, crumb_for=crumb_for,
                rail_for=rail_for, unit_index_for=unit_index_for,
                band_for=band_for, band_area=band_area,
                n_band_slots=n_band_slots, cat_slot=cat_slot)


# ── chrome drawing ──────────────────────────────────────────────────────
def draw_top_deck(page, targets, active_label, source_url,
                  ac_label="AC 61-65K", min_widths=None, ac_min_w=None):
    """Top deck: (label, absolute_page) chips, active_label in blue, plus the
    AC external source button (right cluster, ends x=548). `ac_label` is the
    AC version label — callers pass nav-data.json's acVersion (emitted by
    make-nav-data.js from APP_META.acVersion, the single source of truth);
    the default only covers stale nav-data files. `min_widths` optionally
    widens specific deck chips (label -> min width; the binder deck uses
    thumb-sized buttons); `ac_min_w` optionally floors the AC chip width."""
    x = 36.0
    for label, target in targets:
        w = chrome_w(label, BTN_FS) + 24
        if min_widths:
            w = max(min_widths.get(label, 0.0), w)
        rect = fitz.Rect(x, TOP_Y0, x + w, TOP_Y1)
        active = (label == active_label)
        nav_button(
            page, rect, label,
            {"kind": fitz.LINK_GOTO, "page": target, "to": LINK_TO},
            fill=ACTIVE_BLUE if active else TITAN_DARK, active=active)
        x += w + 6
    # AC external source button (right cluster, ends x=548)
    label = ac_label
    tw = chrome_w(label, BTN_FS)
    w = tw + 30
    if ac_min_w:
        w = max(ac_min_w, tw + 28)
    rect = fitz.Rect(548 - w, TOP_Y0, 548, TOP_Y1)
    rrect(page, rect, TITAN_MID, border=tuple(c * 0.75 for c in TITAN_MID),
          border_w=0.6, bevel=BEVEL_DARK)
    baseline = rect.y0 + rect.height / 2 + BTN_FS * 0.35
    tx = rect.x0 + (rect.width - tw - 9) / 2
    chrome_text(page, (tx, baseline), label, BTN_FS, WHITE)
    ext_arrow(page, tx + tw + 4, baseline - 1.2, 3.6, WHITE)
    page.insert_link({"kind": fitz.LINK_URI, "from": rect, "uri": source_url})


def insert_raw_goback(page, rect):
    """True /Named /GoBack link annotation (viewer history-back).

    Ported from sportys_linker._insert_goback_link (FORE binder) via idea
    #46's stamp_nav. insert_link({"kind": LINK_NAMED, "name": "GoBack"})
    writes a GoTo to a named destination 'GoBack' that does not exist — a
    dead link. Raw xref surgery emits the real /A<</S/Named/N/GoBack>>
    action instead.
    """
    doc = page.parent
    xref = doc.get_new_xref()
    y0 = page.rect.height - rect.y1
    y1 = page.rect.height - rect.y0
    doc.update_object(
        xref,
        f"<</Type/Annot/Subtype/Link/Rect[{rect.x0} {y0} {rect.x1} {y1}]"
        f"/Border[0 0 0]/A<</S/Named/N/GoBack>>>>",
    )
    key_type, value = doc.xref_get_key(page.xref, "Annots")
    if key_type == "array":
        doc.xref_set_key(page.xref, "Annots", value[:-1] + f" {xref} 0 R]")
    else:
        doc.xref_set_key(page.xref, "Annots", f"[{xref} 0 R]")
    return xref


def insert_named_goback(page, rect):
    """Legacy BACK-button action: a named /GoBack link annotation.

    DEAD in practice (see insert_raw_goback) — kept only for API
    compatibility with early chrome_core consumers.
    """
    page.insert_link({"kind": fitz.LINK_NAMED, "name": "GoBack",
                      "from": rect})


def draw_dock(page, rel, model, offset=0, goback=insert_raw_goback):
    """Bottom dock on doc page (offset + rel): hairline, breadcrumb + global
    1-based page number, then PREV CONTENTS NEXT BACK. `goback` is a
    callable(page, rect) that installs the BACK action (default: a raw
    /Named /GoBack action — the only form viewers honor)."""
    # hairline rule
    page.draw_line((36, DOCK_RULE_Y), (548, DOCK_RULE_Y), color=RULE,
                   width=0.5)
    # breadcrumb + global page number (1-based merged page)
    crumb, _ = model["crumb_for"](rel)
    crumb_full = f"{crumb}  ·  p. {offset + rel + 1}"
    fs = fit_size(crumb_full, 240, BTN_FS, minimum=5.0)
    chrome_text(page, (36, (DOCK_Y0 + DOCK_Y1) / 2 + fs * 0.35),
                crumb_full, fs, SLATE)
    # right cluster: PREV CONTENTS NEXT BACK
    units = model["units"]
    ui = model["unit_index_for"](rel)
    prev_u = units[ui - 1] if ui > 0 else None
    if ui < 0:                       # front matter: before the first unit
        next_u = units[0]
    else:
        next_u = units[ui + 1] if ui < len(units) - 1 else None
    bw, gap = 60.0, 6.0
    x0 = 548 - (4 * bw + 3 * gap)
    rects = [fitz.Rect(x0 + i * (bw + gap), DOCK_Y0,
                       x0 + i * (bw + gap) + bw, DOCK_Y1) for i in range(4)]
    # PREV
    if prev_u:
        prev_lbl = f"PREV: {prev_u['title']}" if "title" in prev_u else "PREV"
        nav_button(page, rects[0], prev_lbl,
                   {"kind": fitz.LINK_GOTO, "page": offset + prev_u["page"],
                    "to": LINK_TO}, chev=-1)
    else:
        nav_button(page, rects[0], "PREV", None, text_color=DIM, chev=-1)
    # CONTENTS (section TOC)
    nav_button(page, rects[1], "CONTENTS",
               {"kind": fitz.LINK_GOTO, "page": offset + model["toc"],
                "to": LINK_TO})
    # NEXT
    if next_u:
        next_lbl = f"NEXT: {next_u['title']}" if "title" in next_u else "NEXT"
        nav_button(page, rects[2], next_lbl,
                   {"kind": fitz.LINK_GOTO, "page": offset + next_u["page"],
                    "to": LINK_TO}, chev=+1)
    else:
        nav_button(page, rects[2], "NEXT", None, text_color=DIM, chev=+1)
    # BACK — chip drawn inline (identical to nav_button with link=None);
    # the caller-supplied goback callback installs the action.
    bevel = BEVEL_DARK
    border = tuple(c * 0.75 for c in TITAN_DARK)
    rrect(page, rects[3], TITAN_DARK, border=border, border_w=0.6, bevel=bevel)
    fs = fit_size("BACK", rects[3].width - 14, BTN_FS)
    tw = chrome_w("BACK", fs)
    baseline = rects[3].y0 + rects[3].height / 2 + fs * 0.35
    chrome_text(page, (rects[3].x0 + (rects[3].width - tw) / 2, baseline),
                "BACK", fs, WHITE)
    if goback:
        goback(page, rects[3])


def draw_bead(page, y0, num, label, target_page, theme, active):
    draw_rect = fitz.Rect(RAIL_DRAW_X0, y0, PAGE_W, y0 + BEAD_H)
    hit_rect = fitz.Rect(RAIL_X0, y0, PAGE_W, y0 + BEAD_H)
    if active:
        fill, txt, border, bevel = theme["accent"], WHITE, None, WHITE
    else:
        fill, txt, border, bevel = theme["soft"], theme["ink"], theme["line"], None
    rrect(page, draw_rect, fill, border=border, border_w=0.6, bevel=bevel,
          radius=3.0)
    # number line
    nfs = fit_size(num, draw_rect.width - 8, 8.0)
    ntw = chrome_w(num, nfs)
    chrome_text(page, (draw_rect.x0 + (draw_rect.width - ntw) / 2,
                       y0 + 10.6), num, nfs, txt)
    # abbrev line
    afs = fit_size(label, draw_rect.width - 6, 6.2)
    atw = chrome_w(label, afs)
    chrome_text(page, (draw_rect.x0 + (draw_rect.width - atw) / 2,
                       y0 + 19.6), label, afs, txt)
    page.insert_link({"kind": fitz.LINK_GOTO, "from": hit_rect,
                      "page": target_page, "to": LINK_TO})


def draw_hero(page, code, target_page, theme):
    rect = fitz.Rect(RAIL_DRAW_X0, HERO_Y0, PAGE_W, HERO_Y0 + HERO_H)
    hit = fitz.Rect(RAIL_X0, HERO_Y0, PAGE_W, HERO_Y0 + HERO_H)
    rrect(page, rect, theme["accent"],
          border=tuple(c * 0.75 for c in theme["accent"]), border_w=0.6,
          bevel=WHITE, radius=3.0)
    fs = fit_size(code, rect.width - 8, 11.0)
    tw = chrome_w(code, fs)
    chrome_text(page, (rect.x0 + (rect.width - tw) / 2,
                       rect.y0 + rect.height / 2 + fs * 0.35),
                code, fs, WHITE)
    page.insert_link({"kind": fitz.LINK_GOTO, "from": hit,
                      "page": target_page, "to": LINK_TO})


def draw_rail(page, rel, model, nav, markers, offset=0):
    """Right-edge hero + bead rail for doc page (offset + rel). `markers` are
    the offset-relative marker pages returned by scan_markers."""
    ctx = model["rail_for"](rel)
    if ctx is None:
        return
    if ctx[0] == "cat":
        _, cat, active_id = ctx
        theme = {k: hx(v) if isinstance(v, str) else v
                 for k, v in cat["theme"].items()}
        draw_hero(page, cat["code"], offset + markers["part:part-1"], theme)
        for i, b in enumerate(cat["bundles"]):
            draw_bead(page, BEAD_FIRST_Y0 + i * BEAD_PITCH, f"{i + 1:02d}",
                      b["abbrev"], offset + markers[f"bundle:{b['id']}"], theme,
                      b["id"] == active_id)
    elif ctx[0] == "flows":
        _, active_id = ctx
        draw_hero(page, "FLOWS", offset + model["p2"], NEUTRAL)
        theme = dict(NEUTRAL, accent=ACTIVE_BLUE)
        for i, w in enumerate(nav["workflows"]):
            draw_bead(page, BEAD_FIRST_Y0 + i * BEAD_PITCH, f"{i + 1:02d}",
                      w["abbrev"], offset + markers[f"wf:{w['id']}"], theme,
                      w["id"] == active_id)
    elif ctx[0] == "guide":
        _, active_id = ctx
        draw_hero(page, "GUIDE", offset + model["p3"], NEUTRAL)
        theme = dict(NEUTRAL, accent=ACTIVE_BLUE)
        for i, g in enumerate(nav["guidance"]):
            draw_bead(page, BEAD_FIRST_Y0 + i * BEAD_PITCH, f"{i + 1:02d}",
                      g["abbrev"], offset + markers[f"gs:{g['id']}"], theme,
                      g["id"] == active_id)


def draw_thumb_band(page, rel, model, offset=0):
    """Thumb-index edge band for doc page (offset + rel) — idea-31.

    A pure-color tab flush at the extreme right edge (x=608..612, ~18pt
    tall), staggered by chapter so a fanned book edge / thumbnail grid
    reads as an index: Part I pages carry their category's accent band at
    the category's slot, Part II/III pages a single neutral band at their
    section slot. No border/bevel/shadow — just the chapter color.

    The band doubles as a link to the chapter opener. Call BEFORE
    draw_rail so hero/beads paint over any overlap (bands sit behind at
    the edge). No-op where the model suppresses bands (front matter, part
    dividers); callers skip the cover entirely.
    """
    spec = model["band_for"](rel)
    if spec is None:
        return
    rect, fill, target = spec
    page.draw_rect(rect, color=None, fill=fill)
    page.insert_link({"kind": fitz.LINK_GOTO, "from": rect,
                      "page": offset + target, "to": LINK_TO})
