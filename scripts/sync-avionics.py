#!/usr/bin/env python3
"""Add first-paint appearance and final semantic cascade to pages and templates."""
from pathlib import Path
from hashlib import sha256
import re,argparse
root=Path(__file__).resolve().parents[1]
version=sha256((root/'assets/avionics.css').read_bytes()).hexdigest()[:10]
appearance_version=sha256((root/'assets/appearance.js').read_bytes()).hexdigest()[:10]
appearance=f'<script src="/assets/appearance.js?v={appearance_version}"></script>'
parser=argparse.ArgumentParser();parser.add_argument('--check',action='store_true');args=parser.parse_args()
changed=[]
for p in root.rglob('*.html'):
 rel=p.relative_to(root)
 if any(x in rel.parts for x in ['.git','node_modules','_local-only','.wrangler-integration']):continue
 s=p.read_text(errors='strict')
 if rel.parts[0] in {'pilotsolve','aero-lab','flight-risk-assessment'} or rel.parts[:2]==('engine-explorer','app'):
  # Built apps own their shell order, but the shared CSS URL still needs a new
  # version after packaging so returning visitors do not keep stale chrome.
  t=re.sub(r'(/assets/avionics\.css)(?:\?[^"\s]*)?(?=")',lambda m:m.group(1)+'?v='+version,s)
  if t!=s:
   changed.append(str(rel))
   if not args.check:p.write_text(t)
  continue
 if not re.search(r'<head[\s>]',s,re.I):continue
 t=re.sub(r'\n?\s*<script src="/assets/appearance.js(?:\?[^\"]*)?"></script>','',s)
 t=re.sub(r'\n?\s*<link rel="stylesheet" href="/assets/avionics.css(?:\?[^"]*)?">','',t)
 t=re.sub(r'(<head[^>]*>)',lambda m:m.group(1)+'\n'+appearance,t,count=1,flags=re.I)
 t=t.replace('</head>',f'<link rel="stylesheet" href="/assets/avionics.css?v={version}">\n</head>')
 if t!=s:
  changed.append(str(rel))
  if not args.check:p.write_text(t)
print(('Stale' if args.check else 'Updated'),len(changed),'HTML sources')
if args.check and changed:raise SystemExit(1)
