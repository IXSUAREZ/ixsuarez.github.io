#!/usr/bin/env python3
"""Render the same complete Home Screen app grid on the homepage and Tools page."""
from pathlib import Path
import argparse
import html
import json
import re

ROOT = Path(__file__).resolve().parents[1]


def data():
    return json.loads((ROOT / 'config/tool-catalog.json').read_text())


def E(value):
    return html.escape(str(value), quote=True)


def app_grid(context):
    """Keep launch destinations, names, order, and artwork in the public catalog."""
    catalog = data()
    filters = '<button type="button" data-native-control data-catalog-filter="all" aria-pressed="true">All tools</button>'
    filters += ''.join(
        f'<button type="button" data-native-control data-catalog-filter="{E(group["id"])}" aria-pressed="false">{E(group["name"])}</button>'
        for group in catalog['groups']
    )
    entries = []
    for tool in catalog['tools']:
        description_id = f'{context}-{tool["id"]}-description'
        # Keep important device limits visible; the full description remains available to assistive technology.
        device = ''
        if tool['compatibility'].startswith('Desktop'):
            label = 'Desktop required' if 'required' in tool['compatibility'] else 'Desktop recommended'
            device = f'<span class="tool-app-device">{E(label)}</span>'
        entries.append(
            f'<li class="tool-app-item" data-catalog-group="{E(tool["group"])}" data-catalog-app="{E(tool["id"])}">'
            f'<a class="tool-app" href="{E(tool["path"])}" data-cta-id="{E(context)}-{E(tool["id"])}" aria-describedby="{E(description_id)}">'
            f'<span class="tool-app-icon"><img src="/assets/identities/{E(tool["id"])}/logo.png" alt="" width="128" height="128" loading="lazy" draggable="false"></span>'
            f'<span class="tool-app-name">{E(tool["name"])}</span>{device}</a>'
            f'<span class="catalog-sr-only" id="{E(description_id)}">{E(tool["description"])} {E(tool["compatibility"])}.</span></li>'
        )
    return (
        '<div class="tool-catalog" data-tool-catalog>'
        f'<div class="catalog-filters" role="group" aria-label="Filter tools by purpose" hidden>{filters}</div>'
        f'<ul class="tool-app-grid" aria-label="Pilot apps">{"".join(entries)}</ul>'
        '<p class="catalog-sr-only" data-catalog-status role="status" aria-live="polite" aria-atomic="true"></p>'
        '</div>'
    )


def tools_main():
    count = len(data()['tools'])
    return f'''<main id="main-content" class="tools-experience">
 <header class="tools-intro"><p class="tools-eyebrow">THE SUAREZCFI TOOLKIT</p><h1>A tool for your next step.</h1><p>{count} free apps, built by your instructor.</p></header>
 <section class="tools-collection" aria-label="Pilot tools">
 {app_grid('directory')}
 <p class="catalog-guide-link"><a href="/learn/">Browse the aviation library <span aria-hidden="true">→</span></a></p>
 </section></main>'''


def home_cards():
    return app_grid('home-tools')


def transform(path):
    source = path.read_text()
    if path.name == 'index.html' and path.parent.name == 'tools':
        source = re.sub(r'<main\b[^>]*>.*?</main>', lambda _: tools_main(), source, flags=re.S)
    else:
        start = source.index('<div class="tools-dock-row">')
        end = source.index('\n      </div>\n    </section>', start)
        source = (
            source[:start] + '<div class="tools-dock-row">\n' + home_cards()
            + '\n</div>\n<p class="tools-directory-link"><a href="/tools/">Explore all pilot tools →</a></p>' + source[end:]
        )
    if '/assets/tool-catalog.js' not in source:
        source = source.replace('</body>', '<script src="/assets/tool-catalog.js" defer></script>\n</body>')
    if '/assets/tool-catalog.css' not in source:
        source = source.replace('</head>', '<link rel="stylesheet" href="/assets/tool-catalog.css">\n</head>')
    # Generated pages include each stylesheet once.
    seen = set()

    def once(match):
        href = match[1]
        if href in seen:
            return ''
        seen.add(href)
        return match[0]

    return re.sub(r'<link rel="stylesheet" href="([^"]+)"[^>]*>', once, source)


def apply(check=False):
    changed = []
    for relative in ['tools/index.html', 'index.html']:
        path = ROOT / relative
        rendered = transform(path)
        if rendered != path.read_text():
            changed.append(relative)
            if not check:
                path.write_text(rendered)
    return changed


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    changed = apply(args.check)
    print('Catalog:', changed or 'current')
    raise SystemExit(bool(args.check and changed))
