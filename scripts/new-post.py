#!/usr/bin/env python3
"""new-post.py — scaffold a new blog post from blog/_template/.

Usage:
  python3 scripts/new-post.py <slug> "Title" "Description"

Creates blog/<slug>/index.html from the template with today's date stamped
in, then runs sync-chrome.py --apply so the shared chrome (nav/footer) lands
immediately and the post-CTA region is validated against its partial.

The slug must match ^[a-z0-9-]+$ and the directory must not already exist.
Title and description are inserted verbatim, including into JSON-LD strings —
keep them plain text without double quotes.
"""
import re
import subprocess
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TEMPLATE = ROOT / "blog" / "_template" / "index.html"
SYNC = ROOT / "scripts" / "sync-chrome.py"

SLUG_RE = re.compile(r"^[a-z0-9-]+$")
MONTHS = ("January", "February", "March", "April", "May", "June", "July",
          "August", "September", "October", "November", "December")


def fail(msg):
    print(f"new-post: error: {msg}", file=sys.stderr)
    return 1


def run_sync():
    return subprocess.run([sys.executable, str(SYNC), "--apply"]).returncode


def main():
    if len(sys.argv) != 4:
        print(__doc__)
        return 2
    slug, title, description = sys.argv[1:4]
    if not SLUG_RE.match(slug):
        return fail(f"invalid slug {slug!r} (want ^[a-z0-9-]+$)")
    dest = ROOT / "blog" / slug
    if dest.exists():
        return fail(f"blog/{slug}/ already exists — refusing to overwrite")

    today = date.today()
    text = TEMPLATE.read_text(encoding="utf-8")
    for token, value in (
        ("{{TITLE}}", title),
        ("{{DESCRIPTION}}", description),
        ("{{SLUG}}", slug),
        ("{{DATE_DISPLAY}}", f"{MONTHS[today.month - 1]} {today.day}, {today.year}"),
        ("{{DATE}}", today.isoformat()),
    ):
        text = text.replace(token, value)

    dest.mkdir()
    post = dest / "index.html"
    post.write_text(text, encoding="utf-8")
    print(f"new-post: created blog/{slug}/index.html")

    if run_sync() != 0:
        return fail("sync-chrome --apply failed; fix the errors above and re-run it")

    # Mark Blog as the current section in the freshly synced nav (every
    # existing post carries aria-current on that link), then re-sync so the
    # slot is validated and preserved like anywhere else.
    filled = post.read_text(encoding="utf-8")
    if '<a href="/blog/">Blog</a>' in filled:
        post.write_text(filled.replace(
            '<a href="/blog/">Blog</a>',
            '<a href="/blog/" aria-current="page">Blog</a>', 1), encoding="utf-8")
        if run_sync() != 0:
            return fail("sync-chrome --apply failed; fix the errors above and re-run it")

    print()
    print("Next steps:")
    print(f"  1. Write the article in blog/{slug}/index.html — replace the")
    print("     placeholder sections, FAQ items, and see-also links.")
    print("  2. Adjust the body category class, eyebrow label, and read time.")
    print(f"  3. Add a card for the post to blog/index.html.")
    print(f"  4. Add https://suarezcfi.com/blog/{slug}/ to sitemap.xml.")
    print("  5. python3 scripts/sync-chrome.py --check")
    return 0


if __name__ == "__main__":
    sys.exit(main())
