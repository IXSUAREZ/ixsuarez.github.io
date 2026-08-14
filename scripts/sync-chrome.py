#!/usr/bin/env python3
"""sync-chrome.py — build-time sync for shared site chrome (nav + footer +
blog post-CTA).

suarezcfi.com is a static site: nav and footer markup MUST stay server-rendered
static HTML in every page (crawlable, no-JS-safe). The single source of truth
is therefore a set of partial files plus this build-time sync tool — never a
client-side include.

Partials (canonical markup, column-0 based):
  assets/partials/nav.html       site pill nav (home page variant)
  assets/partials/nav-tool.html  tool nav variant (nav--tool: breadcrumb
                                 link-back + wordmark + tool mark + full links)
  assets/partials/footer.html    canonical footer
  assets/partials/post-cta.html  end-of-article CTA (yellow mat + inset paper
                                 sheet + two lacquer buttons)

Every synced page wraps its chrome in marker comments, one marker per line at
the element's indentation, with the ENTIRE nav/footer element between them:

  <!-- site-nav -->
  <header class="nav-wrap" role="banner"> ... </header>
  <!-- /site-nav -->
  <!-- site-footer -->
  <footer> ... </footer>
  <!-- /site-footer -->

Blog posts additionally wrap their end-of-article CTA:

  <!-- post-cta -->
  <div class="cta-box"> ... </div>
  <!-- /post-cta -->

Per-page slots (preserved verbatim across syncs, everything else regenerates
from the partials):
  nav:      the trailing .nav-cta anchor (contextual CTA: href, label,
            data-cta-id) and the aria-current="page" placement.
  nav-tool: additionally the .nav-tool-mark anchor (logo + tool name), any
            app-specific links before "Learn" in .nav-links, and any
            app-specific buttons after the menu toggle in .nav-tools.
  footer:   class="site-footer" on the element, and any tool-specific extra
            lines between the social links and the credential line.
  post-cta: the <h2> inner text and the data-cta-id of each of the two
            anchors (btn--primary / btn--secondary). A missing data-cta-id
            falls back to the partial default for that anchor. Everything
            else — structure (.cta-sheet wrapper), copy, hrefs, classes —
            comes from the partial.

Unlike nav/footer, post-cta regions are only synced where the markers
already exist; the markers are never auto-added around a bare .cta-box.

Skipped directories (never touched, never warned about):
  blog/_template/            post skeleton with {{PLACEHOLDER}} slots — not a
                             page; scripts/new-post.py renders copies of it.
  flight-risk-assessment/  compiled React SPA — its chrome is baked in by its
                           own build; syncing it here would be overwritten on
                           the next app build and could corrupt the bundle.
  foi-cards/               immersive variant — deliberately ships a compact
                           dark chip nav (.chipnav-wrap) instead of the site
                           pill, and no footer. That is the intended "app
                           mode" for a focused study deck, not chrome drift.

Pages with no site chrome at all (e.g. frat/, simply-endorsed/ redirect
stubs) are ignored silently.

Usage:
  python3 scripts/sync-chrome.py --apply   # add markers + sync all pages
  python3 scripts/sync-chrome.py --check   # CI: exit 1 and list drifted files
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PARTIALS = ROOT / "assets" / "partials"

SKIP_DIRS = {
    "flight-risk-assessment": "compiled React SPA — chrome owned by its app build",
    "foi-cards": "immersive variant — compact chip nav by design, no footer",
}

NAV_OPEN = "<!-- site-nav -->"
NAV_CLOSE = "<!-- /site-nav -->"
FOOTER_OPEN = "<!-- site-footer -->"
FOOTER_CLOSE = "<!-- /site-footer -->"
POST_CTA_OPEN = "<!-- post-cta -->"
POST_CTA_CLOSE = "<!-- /post-cta -->"

CTA_RE = re.compile(r'<a [^>]*class="nav-cta"[^>]*>.*?</a>')
# Substitution variants consume the element's leading indent so the
# replacement fully owns its line(s).
CTA_SUB_RE = re.compile(r'^[ \t]*<a [^>]*class="nav-cta"[^>]*>.*?</a>$', re.M)
TOOL_MARK_RE = re.compile(r'^[ \t]*<a [^>]*class="nav-tool-mark"[^>]*>.*?</a>', re.S | re.M)
TOOL_MARK_SUB_RE = re.compile(r'^[ \t]*<a [^>]*class="nav-tool-mark"[^>]*>.*?</a>', re.S | re.M)
AC_RE = re.compile(r'<a ([^>]*?)aria-current="page"')
HREF_RE = re.compile(r'href="([^"]*)"')
A_TAG_RE = re.compile(r'<a [^>]*>')
H2_RE = re.compile(r"<h2[^>]*>(.*?)</h2>", re.S)
DATA_CTA_ID_RE = re.compile(r'data-cta-id="([^"]*)"')


def load_partial(name):
    return (PARTIALS / name).read_text(encoding="utf-8").rstrip("\n")


def indent_of(line):
    return len(line) - len(line.lstrip(" "))


def shift(text, n):
    """Indent every non-blank line of text by n spaces (n >= 0)."""
    pad = " " * n
    return "\n".join(pad + l if l.strip() else l for l in text.split("\n"))


def dedent_lines(lines):
    """Dedent a list of lines by the first non-blank line's indent."""
    base = next((indent_of(l) for l in lines if l.strip()), 0)
    return [l[base:] if l.strip() else l for l in lines]


def find_region(lines, open_marker, close_marker):
    """Return (open_idx, close_idx) of an existing marked region, or None."""
    try:
        o = next(i for i, l in enumerate(lines) if l.strip() == open_marker)
        c = next(i for i, l in enumerate(lines) if l.strip() == close_marker and i > o)
        return o, c
    except StopIteration:
        return None


def find_unmarked_block(lines, start_re, end_re):
    """Find an unmarked chrome block; return (start_idx, end_idx inclusive)."""
    for i, l in enumerate(lines):
        if start_re.search(l):
            for j in range(i, len(lines)):
                if end_re.search(lines[j]):
                    return i, j
            raise ValueError(f"unterminated block starting at line {i + 1}")
    return None


def insert_aria_current(text, href, page):
    """Add aria-current="page" to the best-matching anchor for href."""
    candidates = []
    for m in A_TAG_RE.finditer(text):
        tag = m.group(0)
        h = HREF_RE.search(tag)
        if h and h.group(1) == href:
            candidates.append((m.start(), m.end(), tag))
    # Shared chrome anchors only — never the wordmark, back-link, tool mark,
    # or the marketing CTA. What remains are plain nav links + menuitems.
    chrome = [c for c in candidates
              if 'class="wordmark"' not in c[2]
              and 'class="link-back"' not in c[2]
              and 'class="nav-tool-mark"' not in c[2]
              and 'class="nav-cta"' not in c[2]]
    picks = chrome or candidates
    if not picks:
        raise ValueError(f"{page}: cannot place aria-current for href {href!r}")
    start, end, tag = picks[-1]
    if 'aria-current' in tag:
        return text  # already there (idempotent re-render)
    return text[:end - 1] + ' aria-current="page">' + text[end:]


def render_nav(current_block, page):
    """Render fresh nav markup (column-0) from partial + preserved slots."""
    variant = "tool" if 'class="nav nav--tool"' in current_block else "site"
    partial = load_partial("nav-tool.html" if variant == "tool" else "nav.html")
    lines = current_block.split("\n")

    # --- preserve the trailing CTA anchor (single line in every page)
    cta_m = CTA_RE.search(current_block)
    cta = cta_m.group(0).strip() if cta_m else None

    tool_mark = None
    app_links = []
    app_tools = []
    if variant == "tool":
        tm_m = TOOL_MARK_RE.search(current_block)
        if tm_m:
            tool_mark = "\n".join(dedent_lines(tm_m.group(0).split("\n")))
        # app links: lines between the .nav-links opening and the first
        # partial-owned link (Learn; the Home link was retired in v10).
        # A leftover Home anchor from a pre-v10 page is dropped, not kept.
        try:
            nl = next(i for i, l in enumerate(lines)
                      if '<div class="nav-links" id="primary-nav-links">' in l)
            learn_i = next(i for i, l in enumerate(lines)
                           if i > nl and re.search(r'<a href="/learn/"[^>]*>Learn</a>', l))
            app_links = dedent_lines([
                l for l in lines[nl + 1:learn_i]
                if not re.search(r'<a href="/"[^>]*>Home</a>', l)])
        except StopIteration:
            raise ValueError(f"{page}: malformed tool nav (nav-links/Learn)")
        # app tools: lines between the menu-toggle close and .nav-tools close
        try:
            nt = next(i for i, l in enumerate(lines) if '<div class="nav-tools">' in l)
            toggle_end = next(i for i, l in enumerate(lines) if i > nt and "</button>" in l)
            tools_end = next(i for i, l in enumerate(lines) if i > toggle_end and "</div>" in l)
            app_tools = dedent_lines(lines[toggle_end + 1:tools_end])
        except StopIteration:
            raise ValueError(f"{page}: malformed tool nav (nav-tools)")

    # aria-current is re-inserted only when it sits in partial-owned markup;
    # anchors inside preserved fragments keep their own aria-current verbatim.
    fragment_texts = [t for t in (
        cta,
        tool_mark,
        "\n".join(app_links),
        "\n".join(app_tools),
    ) if t]
    ac_href = None
    for m in AC_RE.finditer(current_block):
        tag_end = current_block.index(">", m.start()) + 1
        tag_text = current_block[m.start():tag_end]
        if any(tag_text in frag for frag in fragment_texts):
            continue
        href = HREF_RE.search(m.group(1))
        ac_href = href.group(1) if href else None
        break

    out = partial
    if tool_mark is not None:
        out = TOOL_MARK_SUB_RE.sub(lambda _: shift(tool_mark, 6), out, count=1)
    if app_links:
        body = "\n".join(shift(l, 6) if l.strip() else l for l in app_links)
        out = re.sub(r'(<div class="nav-links" id="primary-nav-links">\n)',
                     lambda m: m.group(1) + body + "\n", out, count=1)
    if app_tools:
        body = "\n".join(shift(l, 6) if l.strip() else l for l in app_tools)
        # insert after the menu-toggle </button> inside .nav-tools
        nt = out.index('<div class="nav-tools">')
        toggle_end = out.index("</button>", nt) + len("</button>")
        out = out[:toggle_end] + "\n" + body + out[toggle_end:]
    if cta is not None:
        out = CTA_SUB_RE.sub(lambda _: shift(cta, 6), out, count=1)
    if ac_href is not None:
        out = insert_aria_current(out, ac_href, page)
    return out


def render_footer(current_block, page):
    """Render fresh footer markup (column-0) from partial + preserved slots."""
    partial = load_partial("footer.html")
    if not current_block.strip():
        return partial  # empty markers: default footer (template scaffolding)
    opening = current_block.split("\n", 1)[0]
    site_footer = 'class="site-footer"' in opening

    lines = current_block.split("\n")
    extras = []
    try:
        soc = next(i for i, l in enumerate(lines) if '<div class="social-links' in l)
        soc_end = next(i for i, l in enumerate(lines) if i > soc and "</div>" in l)
        cred = next(i for i, l in enumerate(lines)
                    if i > soc_end and '<p class="fine">FAA Certificated' in l)
        extras = dedent_lines(lines[soc_end + 1:cred])
    except StopIteration:
        raise ValueError(f"{page}: malformed footer (social/credential lines)")

    out = partial
    if site_footer:
        out = out.replace("<footer>", '<footer class="site-footer">', 1)
    if extras:
        body = "\n".join(shift(l, 4) if l.strip() else l for l in extras)
        cred_i = out.index('<p class="fine">FAA Certificated')
        line_start = out.rindex("\n", 0, cred_i) + 1
        out = out[:line_start] + body + "\n" + out[line_start:]
    return out


def swap_cta_id(text, cls, cta_id):
    """Point the partial's .btn cls anchor at the preserved data-cta-id.

    cta_id=None means the slot was absent in the old block: the partial
    default stays.
    """
    if cta_id is None:
        return text
    m = re.search(r'<a [^>]*class="btn %s"[^>]*>' % cls, text)
    if not m:
        raise ValueError(f"partial post-cta.html lost its {cls} anchor")
    tag = DATA_CTA_ID_RE.sub(
        lambda _: 'data-cta-id="%s"' % cta_id, m.group(0), count=1)
    return text[:m.start()] + tag + text[m.end():]


def render_post_cta(current_block, page):
    """Render fresh post-CTA markup (column-0) from partial + preserved slots."""
    if 'class="cta-box"' not in current_block:
        raise ValueError(f"{page}: post-cta markers without a .cta-box inside")
    partial = load_partial("post-cta.html")

    h2_m = H2_RE.search(current_block)
    if not h2_m:
        raise ValueError(f"{page}: malformed post-cta (no <h2>)")
    h2_text = h2_m.group(1).strip()
    ids = []
    for cls in ("btn--primary", "btn--secondary"):
        a_m = re.search(r'<a [^>]*class="btn %s"[^>]*>' % cls, current_block)
        id_m = DATA_CTA_ID_RE.search(a_m.group(0)) if a_m else None
        ids.append(id_m.group(1) if id_m else None)

    # Rebuild from the partial: keep the partial's <h2 ...> opening tag,
    # swap in the preserved inner text.
    out = H2_RE.sub(lambda m: m.group(0)[:m.group(0).index(">") + 1]
                    + h2_text + "</h2>", partial, count=1)
    for cls, cta_id in zip(("btn--primary", "btn--secondary"), ids):
        out = swap_cta_id(out, cls, cta_id)
    return out


def sync_file(path, apply):
    """Return (changed, reasons) for one page; writes when apply=True."""
    text = path.read_text(encoding="utf-8")
    lines = text.split("\n")
    reasons = []
    errors = []

    for name, open_m, close_m, start_re, end_re, renderer in (
        ("nav", NAV_OPEN, NAV_CLOSE,
         re.compile(r'<header class="nav-wrap"'), re.compile(r"</header>"), render_nav),
        ("footer", FOOTER_OPEN, FOOTER_CLOSE,
         re.compile(r"<footer[ >]"), re.compile(r"</footer>"), render_footer),
        # post-cta has no auto-detection: start_re/end_re=None means it only
        # syncs where the markers already exist.
        ("post-cta", POST_CTA_OPEN, POST_CTA_CLOSE,
         None, None, render_post_cta),
    ):
        region = find_region(lines, open_m, close_m)
        if region:
            o, close_idx = region
            indent = indent_of(lines[o])
            block = "\n".join(lines[o + 1:close_idx]).strip("\n")
            c = close_idx + 1  # exclusive replace end (through close marker)
            marked = False
        else:
            if start_re is None:
                continue  # markers-only type; nothing to auto-detect
            found = find_unmarked_block(lines, start_re, end_re)
            if not found:
                continue  # no such chrome on this page
            o, c_incl = found
            indent = indent_of(lines[o])
            block = "\n".join(lines[o:c_incl + 1])
            c = c_incl + 1  # exclusive replace end
            marked = True
            reasons.append(f"{name}: markers added")
        try:
            rendered = renderer(block, str(path.relative_to(ROOT)))
        except ValueError as e:
            errors.append(str(e))
            continue
        new_block = shift(rendered, indent)
        marked_block = (f"{' ' * indent}{open_m}\n{new_block}\n{' ' * indent}{close_m}")
        old_segment = "\n".join(lines[o:c])
        if marked or old_segment != marked_block:
            if not marked:
                reasons.append(f"{name}: synced")
            lines = lines[:o] + marked_block.split("\n") + lines[c:]

    if errors:
        return None, errors
    new_text = "\n".join(lines)
    changed = new_text != text
    if changed and apply:
        path.write_text(new_text, encoding="utf-8")
    return changed, reasons


def iter_pages():
    for p in sorted(ROOT.rglob("*.html")):
        rel = p.relative_to(ROOT)
        if any(part.startswith(".") or part == "node_modules" for part in rel.parts):
            continue
        if rel.parts[:2] == ("assets", "partials"):
            continue  # the source of truth is not a page
        if "_template" in rel.parts:
            continue  # blog post skeleton with {{PLACEHOLDER}} slots
        top = rel.parts[0]
        if top in SKIP_DIRS:
            continue
        yield p


def main():
    if len(sys.argv) != 2 or sys.argv[1] not in ("--apply", "--check"):
        print(__doc__)
        return 2
    apply = sys.argv[1] == "--apply"
    drifted = []
    errors = []
    synced = 0
    for path in iter_pages():
        result = sync_file(path, apply)
        if result[0] is None:
            errors.extend(result[1])
            continue
        changed, reasons = result
        if changed:
            drifted.append((path.relative_to(ROOT), reasons))
            synced += 1
    for e in errors:
        print(f"ERROR: {e}", file=sys.stderr)
    if apply:
        print(f"sync-chrome: {synced} file(s) updated")
        for rel, reasons in drifted:
            print(f"  {rel}: {', '.join(reasons)}")
    else:
        if drifted:
            print(f"sync-chrome --check: {len(drifted)} file(s) out of sync:")
            for rel, reasons in drifted:
                print(f"  {rel}: would change ({', '.join(reasons)})")
        else:
            print("sync-chrome --check: all pages in sync")
    if errors or (drifted and not apply):
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
