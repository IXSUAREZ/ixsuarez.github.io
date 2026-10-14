#!/usr/bin/env python3
"""Rebuild FlightRisk while preserving current site-owned navigation and metadata.

After packaging, run the documented shared material and cache synchronization.
This exporter never runs a global theme-replacement script as a side effect.
"""
import argparse
import os
import re
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--source', type=Path, default=ROOT.parent / 'flightrisk-app',
                    help='FlightRisk app-owned source directory (supports isolated external worktrees).')
parser.add_argument('--skip-build', action='store_true',
                    help='Package an already completed production build.')
args = parser.parse_args()
source = args.source.resolve()
dist = source / 'dist'
if not args.skip_build:
    subprocess.run(['npm', 'run', 'build'], cwd=source,
                   env={**os.environ, 'FLIGHTRISK_BASE': 'flight-risk-assessment'}, check=True)

asset_url = re.compile(r'(?P<prefix>(?:src|href)=["\'])/flight-risk-assessment/assets/(?P<name>index-[^"\']+\.(?:js|css))(?P<suffix>["\'])')
shell = (dist / 'index.html').read_text()
entries = {Path(match.group('name')).suffix: match.group('name') for match in asset_url.finditer(shell)}
if entries.keys() != {'.js', '.css'}:
    raise SystemExit('Expected one FlightRisk JS and CSS entry with the public route base; build with FLIGHTRISK_BASE=flight-risk-assessment.')
for name in entries.values():
    if not (dist / 'assets' / name).is_file():
        raise SystemExit(f'Built entry is missing: {name}')

for path in dist.rglob('*'):
    relative = path.relative_to(dist)
    if not path.is_file() or relative.parts[0] in {'server', '.openai'}:
        continue
    destination = ROOT / 'flight-risk-assessment' / relative
    destination.parent.mkdir(parents=True, exist_ok=True)
    if relative.name == 'index.html' and destination.exists():
        current = destination.read_text()
        updated, count = asset_url.subn(
            lambda match: f"{match.group('prefix')}/flight-risk-assessment/assets/{entries[Path(match.group('name')).suffix]}{match.group('suffix')}",
            current,
        )
        if count != 2:
            raise SystemExit(f'Expected two Vite entries in {relative}; refusing to replace current shell.')
        destination.write_text(updated)
    else:
        shutil.copy2(path, destination)
print('FlightRisk packaged with current site shells. Run sync-avionics.py and refresh-tactile-caches.py before release; no deployment performed.')
