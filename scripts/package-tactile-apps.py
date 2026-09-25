#!/usr/bin/env python3
"""Package matched, rebuilt Aero Lab/FlightRisk assets without replacing release metadata."""
from pathlib import Path
import argparse, re, shutil
parser=argparse.ArgumentParser()
parser.add_argument('--source-root',type=Path,required=True)
parser.add_argument("--app", choices=["aero-lab", "flight-risk-assessment"], help="Package only the rebuilt app")
args=parser.parse_args()
root=Path(__file__).resolve().parents[1]
for app,source in [('aero-lab','aero-lab'),('flight-risk-assessment','flightrisk-app')]:
    if args.app and args.app != app: continue
    dist=args.source_root/source/'dist'
    html=(dist/'index.html').read_text()
    js=re.search(r'<script type="module"[^>]*src="([^"]+)"',html)[1]
    css=re.search(r'<link rel="stylesheet" crossorigin href="([^"]+)"',html)[1]
    if not all(url.startswith('/'+app+'/assets/') or (app=='aero-lab' and url.startswith('./assets/')) for url in (js,css)):
        raise SystemExit(f'{app}: rebuild with its published base path before packaging')
    for asset in (dist/'assets').iterdir():
        if asset.is_file(): shutil.copy2(asset,root/app/'assets'/asset.name)
    for shell in (root/app).rglob('*.html'):
        text=shell.read_text()
        if '<script type="module"' not in text:continue
        text=re.sub(r'(<script type="module"[^>]*src=")[^"]+("[^>]*>)',lambda m:m[1]+js+m[2],text,count=1)
        text=re.sub(r'(<link rel="stylesheet" crossorigin href=")[^"]+("[^>]*>)',lambda m:m[1]+css+m[2],text,count=1)
        shell.write_text(text)
    print(app,Path(js).name,Path(css).name)
