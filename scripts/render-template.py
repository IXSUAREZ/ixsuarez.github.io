#!/usr/bin/env python3
"""Render a premium authoring template into a new page without overwriting files."""
import argparse
import html
import re
import subprocess
import sys
from hashlib import sha256
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('template', choices=['home', 'service', 'library', 'article', 'workspace', 'study', 'editor'])
parser.add_argument('destination', type=Path)
parser.add_argument('--title', required=True)
parser.add_argument('--description', required=True)
parser.add_argument('--eyebrow', default='SUAREZ.CFI')
parser.add_argument('--content', required=True, type=Path)
args = parser.parse_args()
destination = (ROOT / args.destination).resolve()
if destination.exists() or not destination.is_relative_to(ROOT) or destination.suffix != '.html':
    parser.error('Destination must be a new .html file inside the site.')
source = (ROOT / 'templates' / f'{args.template}.html').read_text()
for token, value in {
    'TITLE': html.escape(args.title, quote=True),
    'DESCRIPTION': html.escape(args.description, quote=True),
    'EYEBROW': html.escape(args.eyebrow, quote=True),
    'CONTENT': args.content.read_text(),
    'NAV': (ROOT / 'assets/partials/nav.html').read_text().strip(),
    'FOOTER': (ROOT / 'assets/partials/footer.html').read_text().strip(),
    'PREMIUM_VERSION': sha256((ROOT / 'assets/premium.css').read_bytes()).hexdigest()[:10],
}.items():
    source = source.replace('{{' + token + '}}', value)
if re.search(r'\{\{[A-Z_]+\}\}', source):
    parser.error('Content still has unfilled template placeholders.')
destination.parent.mkdir(parents=True, exist_ok=True)
destination.write_text(source)
subprocess.run([sys.executable, str(ROOT / 'scripts/sync-chrome.py'), '--apply'], check=True)
subprocess.run([sys.executable, str(ROOT / 'scripts/apply-premium-theme.py')], check=True)
print(f'Created {destination.relative_to(ROOT)}. Review content before publishing.')
