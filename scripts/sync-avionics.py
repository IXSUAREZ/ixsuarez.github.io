#!/usr/bin/env python3
"""Add first-paint appearance and final semantic cascade to pages and templates."""
from pathlib import Path
import re,argparse
root=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser();parser.add_argument('--check',action='store_true');args=parser.parse_args()
changed=[]
for p in root.rglob('*.html'):
 rel=p.relative_to(root)
 if any(x in rel.parts for x in ['.git','node_modules','_local-only','.wrangler-integration']):continue
 if rel.parts[0] in {'pilotsolve','aero-lab','flight-risk-assessment'} or rel.parts[:2]==('engine-explorer','app'):continue # rebuilt authoring sources own compiled shells
 s=p.read_text(errors='strict')
 if not re.search(r'<head[\s>]',s,re.I):continue
 t=re.sub(r'\n?\s*<script src="/assets/appearance.js"></script>','',s)
 t=re.sub(r'\n?\s*<link rel="stylesheet" href="/assets/avionics.css(?:\?[^"]*)?">','',t)
 t=re.sub(r'(<head[^>]*>)',r'\1\n<script src="/assets/appearance.js"></script>',t,count=1,flags=re.I)
 t=t.replace('</head>','<link rel="stylesheet" href="/assets/avionics.css">\n</head>')
 if t!=s:
  changed.append(str(rel))
  if not args.check:p.write_text(t)
print(('Stale' if args.check else 'Updated'),len(changed),'HTML sources')
if args.check and changed:raise SystemExit(1)
