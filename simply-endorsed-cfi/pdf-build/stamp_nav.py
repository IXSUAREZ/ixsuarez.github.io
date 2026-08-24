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

Usage:  ./stamp_nav.py            (idempotent-guarded; re-run `node
        render-pdf.js` first if the PDF was already stamped)
"""

import json
import os
import re
import sys

import fitz

HERE = os.path.dirname(os.path.abspath(__file__))
PDF_PATH = "/Users/diegosuarez/Desktop/VIBE CODING PROJECTS/SUAREZ.CFI/output/simply-endorsed-cfi-pdf/Simply-Endorsed-CFI-AC61-65K.pdf"
NAV_DATA = os.path.join(HERE, "nav-data.json")

PAGE_W, PAGE_H = 612.0, 792.0

# ── geometry ────────────────────────────────────────────────────────────
TOP_Y0, TOP_Y1 = 16.0, 38.0          # top bar (22pt)
DOCK_Y0, DOCK_Y1 = 748.0, 772.0      # bottom dock (24pt)
DOCK_RULE_Y = 742.0                  # hairline above dock
RAIL_X0 = 552.0                      # rail hitbox start (bleeds to 612)
RAIL_DRAW_X0 = 554.0                 # drawn bead left edge
HERO_Y0, HERO_H = 54.0, 28.0
BEAD_H, BEAD_PITCH = 24.0, 28.0
BEAD_FIRST_Y0 = HERO_Y0 + HERO_H + 6.0   # 88
LINK_TO = fitz.Point(36, 54)         # internal goto landing point

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
    """Largest fontsize <= base at which text fits max_w (hebo)."""
    fs = base
    while fs > minimum and fitz.get_text_length(
            text, fontname="hebo", fontsize=fs) > max_w:
        fs -= 0.1
    return fs


def ctext(page, rect, text, fs, color, dy=0.0):
    """Horizontally centered hebo text, cap-height vertically centered."""
    fs = fit_size(text, rect.width - 6, fs)
    tw = fitz.get_text_length(text, fontname="hebo", fontsize=fs)
    baseline = rect.y0 + rect.height / 2 + fs * 0.35 + dy
    page.insert_text((rect.x0 + (rect.width - tw) / 2, baseline),
                     text, fontname="hebo", fontsize=fs, color=color)
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
    tw = fitz.get_text_length(label, fontname="hebo", fontsize=fs)
    gap = 3.0 if chev else 0.0
    group_w = tw + (gap + 3.0 if chev else 0.0)
    x = rect.x0 + (rect.width - group_w) / 2
    ymid = rect.y0 + rect.height / 2
    baseline = ymid + fs * 0.35
    if chev < 0:
        chevron(page, x, ymid - 0.4, 2.6, -1, text_color)
        x += 3.0 + gap
    page.insert_text((x, baseline), label, fontname="hebo",
                     fontsize=fs, color=text_color)
    if chev > 0:
        chevron(page, x + tw + gap, ymid - 0.4, 2.6, +1, text_color)
    if link:
        page.insert_link(dict(link, **{"from": rect}))


# ── model ───────────────────────────────────────────────────────────────
def scan_markers(doc):
    markers = {}
    for pno in range(doc.page_count):
        for m in re.finditer(r"ZZPGM\|([^|]+)\|ZZ", doc[pno].get_text()):
            key = m.group(1)
            if key not in markers:          # first occurrence wins
                markers[key] = pno
    return markers


def build_model(doc, nav, markers):
    npages = doc.page_count
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

    # nav-unit sequence in reading order
    units = [{"id": "part-1", "page": p1,
              "crumb": "PART I · ENDORSEMENT LIBRARY"}]
    for c in cat_order:
        units.append({"id": f"cat:{c['slug']}", "page": markers[f"cat:{c['slug']}"]})
    units.append({"id": "part-2", "page": p2,
                  "crumb": "PART II · WORKFLOWS"})
    for w in nav["workflows"]:
        units.append({"id": f"wf:{w['id']}", "page": markers[f"wf:{w['id']}"]})
    units.append({"id": "part-3", "page": p3,
                  "crumb": "PART III · CFI GUIDANCE"})
    for g in nav["guidance"]:
        units.append({"id": f"gs:{g['id']}", "page": markers[f"gs:{g['id']}"]})
    units.sort(key=lambda u: u["page"])

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
        """(breadcrumb_text, active_top) for a 0-based page."""
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
        if uid.startswith("cat:"):
            slug = uid[4:]
            cat = cats_by_slug[slug]
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
            g = next(g for g in nav["guidance"] if g["id"] == uid[3:])
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

    return dict(cat_order=cat_order, bounds=bounds, units=units,
                p1=p1, p2=p2, p3=p3, toc=toc, crumb_for=crumb_for,
                rail_for=rail_for, unit_index_for=unit_index_for)


# ── chrome drawing ──────────────────────────────────────────────────────
def draw_top_bar(page, pno, model, nav, source_url):
    targets = [("CONTENTS", model["toc"]), ("LIBRARY", model["p1"]),
               ("WORKFLOWS", model["p2"]), ("GUIDANCE", model["p3"])]
    _, active_top = model["crumb_for"](pno)
    x = 36.0
    for label, target in targets:
        w = fitz.get_text_length(label, fontname="hebo",
                                 fontsize=BTN_FS) + 24
        rect = fitz.Rect(x, TOP_Y0, x + w, TOP_Y1)
        active = (label == active_top)
        nav_button(
            page, rect, label,
            {"kind": fitz.LINK_GOTO, "page": target, "to": LINK_TO},
            fill=ACTIVE_BLUE if active else TITAN_DARK, active=active)
        x += w + 6
    # AC external source button (right cluster, ends x=548). Label comes
    # from nav-data.json (acVersion, emitted by make-nav-data.js from
    # APP_META.acVersion — the single source of truth); the fallback only
    # covers stale nav-data files.
    label = nav.get("acVersion", "AC 61-65K")
    tw = fitz.get_text_length(label, fontname="hebo", fontsize=BTN_FS)
    w = tw + 30
    rect = fitz.Rect(548 - w, TOP_Y0, 548, TOP_Y1)
    rrect(page, rect, TITAN_MID, border=tuple(c * 0.75 for c in TITAN_MID),
          border_w=0.6, bevel=BEVEL_DARK)
    baseline = rect.y0 + rect.height / 2 + BTN_FS * 0.35
    tx = rect.x0 + (rect.width - tw - 9) / 2
    page.insert_text((tx, baseline), label, fontname="hebo",
                     fontsize=BTN_FS, color=WHITE)
    ext_arrow(page, tx + tw + 4, baseline - 1.2, 3.6, WHITE)
    page.insert_link({"kind": fitz.LINK_URI, "from": rect, "uri": source_url})


def draw_dock(page, pno, model, nav):
    # hairline rule
    page.draw_line((36, DOCK_RULE_Y), (548, DOCK_RULE_Y), color=RULE,
                   width=0.5)
    # breadcrumb
    crumb, _ = model["crumb_for"](pno)
    crumb_full = f"{crumb}  ·  p. {pno + 1}"
    fs = fit_size(crumb_full, 240, BTN_FS, minimum=5.0)
    page.insert_text((36, (DOCK_Y0 + DOCK_Y1) / 2 + fs * 0.35), crumb_full,
                     fontname="hebo", fontsize=fs, color=SLATE)
    # right cluster: PREV CONTENTS NEXT BACK
    units = model["units"]
    ui = model["unit_index_for"](pno)
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
        nav_button(page, rects[0], "PREV",
                   {"kind": fitz.LINK_GOTO, "page": prev_u["page"],
                    "to": LINK_TO}, chev=-1)
    else:
        nav_button(page, rects[0], "PREV", None, text_color=DIM, chev=-1)
    # CONTENTS
    nav_button(page, rects[1], "CONTENTS",
               {"kind": fitz.LINK_GOTO, "page": model["toc"], "to": LINK_TO})
    # NEXT
    if next_u:
        nav_button(page, rects[2], "NEXT",
                   {"kind": fitz.LINK_GOTO, "page": next_u["page"],
                    "to": LINK_TO}, chev=+1)
    else:
        nav_button(page, rects[2], "NEXT", None, text_color=DIM, chev=+1)
    # BACK (named GoBack)
    nav_button(page, rects[3], "BACK",
               {"kind": fitz.LINK_NAMED, "name": "GoBack"})


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
    ntw = fitz.get_text_length(num, fontname="hebo", fontsize=nfs)
    page.insert_text((draw_rect.x0 + (draw_rect.width - ntw) / 2, y0 + 10.6),
                     num, fontname="hebo", fontsize=nfs, color=txt)
    # abbrev line
    afs = fit_size(label, draw_rect.width - 6, 6.2)
    atw = fitz.get_text_length(label, fontname="hebo", fontsize=afs)
    page.insert_text((draw_rect.x0 + (draw_rect.width - atw) / 2, y0 + 19.6),
                     label, fontname="hebo", fontsize=afs, color=txt)
    page.insert_link({"kind": fitz.LINK_GOTO, "from": hit_rect,
                      "page": target_page, "to": LINK_TO})


def draw_hero(page, code, target_page, theme):
    rect = fitz.Rect(RAIL_DRAW_X0, HERO_Y0, PAGE_W, HERO_Y0 + HERO_H)
    hit = fitz.Rect(RAIL_X0, HERO_Y0, PAGE_W, HERO_Y0 + HERO_H)
    rrect(page, rect, theme["accent"],
          border=tuple(c * 0.75 for c in theme["accent"]), border_w=0.6,
          bevel=WHITE, radius=3.0)
    fs = fit_size(code, rect.width - 8, 11.0)
    tw = fitz.get_text_length(code, fontname="hebo", fontsize=fs)
    page.insert_text((rect.x0 + (rect.width - tw) / 2,
                      rect.y0 + rect.height / 2 + fs * 0.35),
                     code, fontname="hebo", fontsize=fs, color=WHITE)
    page.insert_link({"kind": fitz.LINK_GOTO, "from": hit,
                      "page": target_page, "to": LINK_TO})


def draw_rail(page, pno, model, nav):
    ctx = model["rail_for"](pno)
    if ctx is None:
        return
    markers_page = build_model.marker_pages
    if ctx[0] == "cat":
        _, cat, active_id = ctx
        theme = {k: hx(v) if isinstance(v, str) else v
                 for k, v in cat["theme"].items()}
        draw_hero(page, cat["code"], markers_page[f"cat:{cat['slug']}"], theme)
        for i, b in enumerate(cat["bundles"]):
            draw_bead(page, BEAD_FIRST_Y0 + i * BEAD_PITCH, f"{i + 1:02d}",
                      b["abbrev"], markers_page[f"bundle:{b['id']}"], theme,
                      b["id"] == active_id)
    elif ctx[0] == "flows":
        _, active_id = ctx
        draw_hero(page, "FLOWS", model["p2"], NEUTRAL)
        theme = dict(NEUTRAL, accent=ACTIVE_BLUE)
        for i, w in enumerate(nav["workflows"]):
            draw_bead(page, BEAD_FIRST_Y0 + i * BEAD_PITCH, f"{i + 1:02d}",
                      w["abbrev"], markers_page[f"wf:{w['id']}"], theme,
                      w["id"] == active_id)
    elif ctx[0] == "guide":
        _, active_id = ctx
        draw_hero(page, "GUIDE", model["p3"], NEUTRAL)
        theme = dict(NEUTRAL, accent=ACTIVE_BLUE)
        for i, g in enumerate(nav["guidance"]):
            draw_bead(page, BEAD_FIRST_Y0 + i * BEAD_PITCH, f"{i + 1:02d}",
                      g["abbrev"], markers_page[f"gs:{g['id']}"], theme,
                      g["id"] == active_id)


# ── main ────────────────────────────────────────────────────────────────
doc_page_count = [0]      # mutable cell used by draw_dock


def main():
    with open(NAV_DATA) as f:
        nav = json.load(f)
    doc = fitz.open(PDF_PATH)
    doc_page_count[0] = doc.page_count

    # idempotence guard: chrome on page 2 (index 1) means already stamped
    dock_zone = fitz.Rect(0, 730, PAGE_W, PAGE_H)
    for lnk in doc[1].get_links():
        if lnk["kind"] == fitz.LINK_NAMED and \
                fitz.Rect(lnk["from"]).intersects(dock_zone):
            print("already stamped — re-run node render-pdf.js first",
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
    build_model.marker_pages = markers

    model = build_model(doc, nav, markers)

    for pno in range(1, doc.page_count):       # cover (page 0): no chrome
        page = doc[pno]
        draw_top_bar(page, pno, model, nav, nav["sourceUrl"])
        draw_rail(page, pno, model, nav)
        draw_dock(page, pno, model, nav)

    tmp = PDF_PATH + ".tmp-stamp.pdf"
    doc.save(tmp, garbage=3, deflate=True)
    doc.close()
    os.replace(tmp, PDF_PATH)
    print(f"stamped chrome onto pages 2..{doc_page_count[0]} of {PDF_PATH}")


if __name__ == "__main__":
    main()
