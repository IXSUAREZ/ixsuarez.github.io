#!/usr/bin/env python3
"""Add first-paint appearance and final semantic cascade to pages and templates."""
from pathlib import Path
from hashlib import sha256
import re,argparse
from journal import enhance
from theme_assets import load_asset_versions
root=Path(__file__).resolve().parents[1]
version=sha256((root/'assets/avionics.css').read_bytes()).hexdigest()[:10]
appearance_version=sha256((root/'assets/appearance.js').read_bytes()).hexdigest()[:10]
tactile_version=sha256((root/'assets/tactile.js').read_bytes()).hexdigest()[:10]
tactile=f'<script defer src="/assets/tactile.js?v={tactile_version}"></script>'
appearance=f'<script src="/assets/appearance.js?v={appearance_version}"></script>'
parser=argparse.ArgumentParser();parser.add_argument('--check',action='store_true');args=parser.parse_args()
asset_versions, _ = load_asset_versions(root)
shared_versions={name.removeprefix('assets/'):digest for name,digest in asset_versions.items() if name.startswith('assets/')}
app_versions={name:digest for name,digest in asset_versions.items() if not name.startswith('assets/')}
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
 for name,digest in app_versions.items():
  base=re.sub(r'(/'+re.escape(name)+r')(?:\?[^"\s]*)?(?=")',lambda m:m.group(1)+'?v='+digest,base)
 if rel.parts[0]=='blog':
  base=re.sub(r'href="(?:\.\./|\./)*style\.css(?:\?[^"]*)?"', 'href="/blog/style.css?v='+app_versions['blog/style.css']+'"',base)
 if rel.parts[0]=='simply-endorsed':
  base=re.sub(r'href="(?:\.\./)+css/seo\.css(?:\?[^"]*)?"', 'href="/simply-endorsed/css/seo.css?v='+app_versions['simply-endorsed/css/seo.css']+'"',base)
 if rel.parts[:2]==('engine-explorer','app'):
  for name in ['avionics-overlay.css','avionics-overlay.js']:
   digest=app_versions['engine-explorer/app/assets/'+name]
   base=re.sub(r'(\./assets/'+re.escape(name)+r')(?:\?[^"\s]*)?(?=")',lambda m:m.group(1)+'?v='+digest,base)
 if rel.parts[:3]==('engine-explorer','app','factory-reference'):
  digest=app_versions['engine-explorer/app/factory-reference/reference.css']
  base=re.sub(r'(\./reference\.css)(?:\?[^"\s]*)?(?=")',lambda m:m.group(1)+'?v='+digest,base)
 if rel.parts[0]=='foi-cards':
  base=re.sub(r'src="app\.js(?:\?[^"]*)?"', 'src="/foi-cards/app.js?v='+app_versions['foi-cards/app.js']+'"',base)
  base=re.sub(r'href="styles\.css(?:\?[^"]*)?"', 'href="/foi-cards/styles.css?v='+app_versions['foi-cards/styles.css']+'"',base)
 if not re.search(r'<head[\s>]',s,re.I):continue
 t=re.sub(r'\n?\s*<script src="/assets/appearance.js(?:\?[^\"]*)?"></script>','',base)
 t=re.sub(r'\s*<meta\s+[^>]*name="theme-color"[^>]*>\s*','',t,flags=re.I)
 t=re.sub(r'(<head[^>]*>)',lambda m:m.group(1)+'\n<meta name="theme-color" content="#E3E3E3">\n'+appearance,t,count=1,flags=re.I)
 # The single material authority must follow every app-owned stylesheet.
 t=re.sub(r'\s*<link[^>]*href="/assets/avionics\.css(?:\?[^\"]*)?"[^>]*>', '', t)
 t=t.replace('</head>',f'<link rel="stylesheet" href="/assets/avionics.css?v={version}">\n</head>')
 if 'journal-article' in t or 'journal-library' in t:
  t=enhance(t)
 if t!=s:
  changed.append(str(rel))
  if not args.check:p.write_text(t)
print(('Stale' if args.check else 'Updated'),len(changed),'HTML sources')
if args.check and changed: print('\n'.join(changed))
if args.check and changed:raise SystemExit(1)
if not args.check:
 from journal import apply as apply_journal
 apply_journal()
