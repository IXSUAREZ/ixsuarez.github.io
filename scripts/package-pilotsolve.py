#!/usr/bin/env python3
"""Package app-owned PilotSolve builds while retaining published metadata."""
from pathlib import Path
import argparse
import json
import re
import shutil

parser = argparse.ArgumentParser()
parser.add_argument('--dist', type=Path, required=True)
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
app = root / 'pilotsolve'
source = (args.dist / 'mobile.html').read_text()
patterns = [
    r'(<script type="module"[^>]*src=")[^"]+("[^>]*>)',
    r'(<link rel="modulepreload"[^>]*href=")[^"]+("[^>]*>)',
    r'(<link rel="stylesheet" crossorigin href=")[^"]+("[^>]*>)',
]
replacements = []
for pattern in patterns:
    match = re.search(pattern, source)
    if not match:
        raise SystemExit('Missing expected app entry: ' + pattern)
    replacements.append(match.group(0))
assets = {asset.name: asset for asset in (args.dist / 'assets').iterdir() if asset.is_file()}
# This site publishes the mobile entry, not Vite's separate device-preview entry.
# Follow literal Vite asset names through JS/CSS so preview-only bundles and fonts
# cannot return to the deployed app or its offline cache on a later rebuild.
required_assets = set()
frontier = [source]
while frontier:
    referenced = '\n'.join(frontier)
    discovered = {name for name in assets if name in referenced} - required_assets
    required_assets.update(discovered)
    frontier = [assets[name].read_text(errors='replace') for name in discovered
                if assets[name].suffix in {'.js', '.css'}]
if not required_assets:
    raise SystemExit('Mobile entry references no build assets')
build = json.loads((args.dist / 'BUILD.json').read_text())
manifest_assets = {Path(path).name for path in build['files'] if path.startswith('./assets/')}
if missing := required_assets - manifest_assets:
    raise SystemExit('Mobile dependencies missing from offline manifest: ' + ', '.join(sorted(missing)))
build['files'] = [path for path in build['files']
                  if not path.startswith('./assets/') or Path(path).name in required_assets]
build['cache'] = json.loads((app / 'BUILD.json').read_text())['cache']
pages = {}
for name in ('index.html', 'mobile.html'):
    page = app / name
    text = page.read_text()
    for pattern, replacement in zip(patterns, replacements):
        text, count = re.subn(pattern, lambda _: replacement, text, count=1)
        if count != 1:
            raise SystemExit(f'{name}: missing expected entry')
    pages[page] = text
worker = app / 'sw.js'
worker_text, count = re.subn(r'const FILES=\[.*?\];',
    'const FILES=' + json.dumps(['./'] + build['files']) + ';', worker.read_text())
if count != 1:
    raise SystemExit('Service worker is missing its precache file list')
for name in sorted(required_assets):
    shutil.copy2(assets[name], app / 'assets' / name)
for page, text in pages.items():
    page.write_text(text)
(app / 'BUILD.json').write_text(json.dumps(build, indent=2) + '\n')
worker.write_text(worker_text)
print('Packaged PilotSolve. Run sync-avionics and refresh-tactile-caches next.')
