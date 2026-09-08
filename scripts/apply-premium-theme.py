#!/usr/bin/env python3
"""Keep the shared premium finish last in every authored page/template.

Run after generating a page. FlightRisk owns its compiled HTML separately.
Redirect stubs and archives are intentionally excluded.
"""
import re
from hashlib import sha256
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VERSION = sha256((ROOT / 'assets' / 'premium.css').read_bytes()).hexdigest()[:10]
LINK = f'  <link rel="stylesheet" href="/assets/premium.css?v={VERSION}">'
SCRIPT_VERSIONS = {name: sha256((ROOT / 'assets' / name).read_bytes()).hexdigest()[:10]
                   for name in ('site-nav.js', 'premium-home.js')}
CALCULATOR_VERSION = sha256((ROOT / 'simply-endorsed/js/part61-calculator-ui.js').read_bytes()).hexdigest()[:10]


def version_scripts(source):
    for name, version in SCRIPT_VERSIONS.items():
        source = re.sub(r'src="/?assets/' + re.escape(name) + r'(?:\?[^\"]*)?"',
                        f'src="/assets/{name}?v={version}"', source)
    return re.sub(r'src="/simply-endorsed/js/part61-calculator-ui\.js(?:\?[^\"]*)?"',
                  f'src="/simply-endorsed/js/part61-calculator-ui.js?v={CALCULATOR_VERSION}"', source)


def apply():
    changed = 0
    for path in ROOT.rglob("*.html"):
        relative = path.relative_to(ROOT)
        if any(part.startswith(".") or part in {"node_modules", "_local-only", "flight-risk-assessment", "pdf-build", "templates"} for part in relative.parts):
            continue
        source = path.read_text(encoding="utf-8")
        if "<body" not in source or ('class="nav' not in source and 'chipnav' not in source and '{{NAV}}' not in source and relative.parts[:2] != ('blog', '_template')):
            continue
        category = "editorial-page"
        if str(relative) == "index.html":
            category = "home-page"
        elif relative.parts[0] in {"simply-endorsed-cfi", "part-61-calculator", "certificate-generator"}:
            category = "tool-page"
        elif relative.parts[0] == "foi-cards":
            category = "foi-page"
        def body(match):
            attrs = match.group(1)
            classes = re.search(r'class="([^"]*)"', attrs)
            if classes:
                names = classes[1].split()
                if not set(names) & {'home-page', 'editorial-page', 'tool-page', 'foi-page'}:
                    attrs = attrs.replace(classes[0], 'class="' + ' '.join(names + [category]) + '"')
            else:
                attrs += f' class="{category}"'
            return '<body' + attrs + '>'
        updated = re.sub(r'<body([^>]*)>', body, source, count=1)
        updated = re.sub(r'^[ \t]*<link[^>]*href="/assets/premium\.css[^>]*>\n?', '', updated, flags=re.M)
        updated = updated.replace('</head>', LINK + '\n</head>', 1)
        updated = version_scripts(updated)
        updated = re.sub(r'(<meta name="theme-color" content=")[^"]+', r'\g<1>#242725', updated)
        updated = re.sub(r'(class="(?:chipnav-)?wordmark"[^>]*>)Diego Suarez', r'\g<1>SUAREZ.CFI', updated)
        if updated != source:
            path.write_text(updated, encoding="utf-8")
            changed += 1
    print(f"Premium theme: {changed} pages updated")
    # Compiled app shells keep their own layout; only the shared asset URL changes.
    for path in (ROOT / 'flight-risk-assessment').rglob('index.html'):
        source = path.read_text(encoding='utf-8')
        source = re.sub(r'/assets/premium\.css\?v=[^"\s]+', f'/assets/premium.css?v={VERSION}', source)
        path.write_text(version_scripts(source), encoding='utf-8')


if __name__ == "__main__":
    apply()
