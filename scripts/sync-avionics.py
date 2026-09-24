#!/usr/bin/env python3
"""Add first-paint appearance and final semantic cascade to pages and templates."""
from pathlib import Path
from hashlib import sha256
import re,argparse
root=Path(__file__).resolve().parents[1]
version=sha256((root/'assets/avionics.css').read_bytes()).hexdigest()[:10]
appearance_version=sha256((root/'assets/appearance.js').read_bytes()).hexdigest()[:10]
tactile_version=sha256((root/'assets/tactile.js').read_bytes()).hexdigest()[:10]
tactile=f'<script defer src="/assets/tactile.js?v={tactile_version}"></script>'
appearance=f'<script src="/assets/appearance.js?v={appearance_version}"></script>'
parser=argparse.ArgumentParser();parser.add_argument('--check',action='store_true');args=parser.parse_args()
shared_versions={name:sha256((root/'assets'/name).read_bytes()).hexdigest()[:10] for name in ['site-nav.js','avionics-tools.js','tool-catalog.js','tool-catalog.css']}
changed=[]
for p in root.rglob('*.html'):
 rel=p.relative_to(root)
 if any(x in rel.parts for x in ['.git','node_modules','_local-only','.wrangler-integration','output']):continue
 s=p.read_text(errors='strict')
 if '<head' not in s.lower():continue
 # Tools and templates receive the same runtime, with a byte-bound cache URL.
 base=re.sub(r'\s*<script[^>]*src="/assets/tactile\.js(?:\?[^"]*)?"[^>]*></script>','',s)
 base=base.replace('</head>',tactile+'\n</head>')
 for name,digest in shared_versions.items():
  base=re.sub(r'(/assets/'+re.escape(name)+r')(?:\?[^"\s]*)?(?=")',lambda m:m.group(1)+'?v='+digest,base)
 if rel.parts[0] in {'pilotsolve','aero-lab','flight-risk-assessment'} or rel.parts[:2]==('engine-explorer','app'):
  # Built apps own their shell order, but the shared CSS URL still needs a new
  # version after packaging so returning visitors do not keep stale chrome.
  base=re.sub(r'(/assets/appearance\.js)(?:\?[^"\s]*)?(?=")',lambda m:m.group(1)+'?v='+appearance_version,base)
  t=re.sub(r'(/assets/avionics\.css)(?:\?[^"\s]*)?(?=")',lambda m:m.group(1)+'?v='+version,base)
  if t!=s:
   changed.append(str(rel))
   if not args.check:p.write_text(t)
  continue
 if not re.search(r'<head[\s>]',s,re.I):continue
 t=re.sub(r'\n?\s*<script src="/assets/appearance.js(?:\?[^\"]*)?"></script>','',base)
 t=re.sub(r'(<head[^>]*>)',lambda m:m.group(1)+'\n'+appearance,t,count=1,flags=re.I)
 if '/assets/avionics.css' in t:
  t=re.sub(r'(/assets/avionics\.css)(?:\?[^"\s]*)?(?=")',lambda m:m.group(1)+'?v='+version,t)
 else:
  t=t.replace('</head>',f'<link rel="stylesheet" href="/assets/avionics.css?v={version}">\n</head>')
 if t!=s:
  changed.append(str(rel))
  if not args.check:p.write_text(t)
print(('Stale' if args.check else 'Updated'),len(changed),'HTML sources')
if args.check and changed:raise SystemExit(1)
