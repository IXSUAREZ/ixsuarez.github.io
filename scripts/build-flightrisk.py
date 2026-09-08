#!/usr/bin/env python3
"""Rebuild the sibling FlightRisk source and refresh its GitHub Pages shells."""
import os
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT.parent / 'flightrisk-app'
subprocess.run(['npm', 'run', 'build'], cwd=SOURCE,
               env={**os.environ, 'FLIGHTRISK_BASE': 'flight-risk-assessment'}, check=True)
for path in (SOURCE / 'dist').rglob('*'):
    relative = path.relative_to(SOURCE / 'dist')
    if path.is_file() and relative.parts[0] not in {'server', '.openai'}:
        destination = ROOT / 'flight-risk-assessment' / relative
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(path, destination)
subprocess.run([sys.executable, str(ROOT / 'scripts' / 'apply-premium-theme.py')], check=True)
print('FlightRisk is ready in the static site; no deployment performed.')
