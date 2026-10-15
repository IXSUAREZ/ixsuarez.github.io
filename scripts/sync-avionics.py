#!/usr/bin/env python3
"""Add first-paint appearance and final semantic cascade to pages and templates."""
from pathlib import Path
from hashlib import sha256
import re,argparse,posixpath
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
app_versions={name:digest for name,digest in asset_versions.items() if not name.startswith('assets/')}
changed=[]
for p in root.rglob('*.html'):
 if p.name.startswith('._'):continue
 rel=p.relative_to(root)
 if any(x in rel.parts for x in ['.git','node_modules','_local-only','.wrangler-integration','output']):continue
 s=p.read_text(errors='strict')
 if '<head' not in s.lower():continue
 opaque_tail=''
 if rel.as_posix()=='engine-explorer/rotax-component-studies.html':
  # This saved viewer embeds large immutable model payloads in its body.
  # Version its interface head without scanning or rewriting those bytes.
  boundary=s.find('</head>')+len('</head>')
  if boundary < len('</head>'):raise ValueError('Rotax viewer requires a complete head')
  opaque_tail=s[boundary:];s=s[:boundary]
 # Tools and templates receive the same runtime, with a byte-bound cache URL.
 base=re.sub(r'\s*<script[^>]*src="/assets/tactile\.js(?:\?[^"]*)?"[^>]*></script>','',s)
 base=base.replace('</head>',tactile+'\n</head>')
 if str(rel) in {'aero-lab/index.html','engine-explorer/app/index.html'}:
  base=re.sub(r'\s*<script[^>]*src="/assets/app-site-navigation\.js(?:\?[^"]*)?"[^>]*></script>','',base)
  # Aero Lab owns a website menu. Crank & Core uses engine-control rails and
  # has no website/app menu in the released runtime; preserve those controls.
  if str(rel)=='aero-lab/index.html':
   base=base.replace('</head>','<script defer src="/assets/app-site-navigation.js"></script>\n</head>')
 # Source-owned exports also use ./ and ../ asset paths. Resolve those paths
 # against this document so their cache URLs track the same managed bytes.
 # Match whole URL attributes; a path suffix on an external host is not local.
 def relative_asset(match):
  prefix,url,quote=match.groups()
  if re.match(r'^[a-zA-Z][a-zA-Z0-9+.-]*:|^//|^#',url):return match.group(0)
  path=url.split('?',1)[0].split('#',1)[0]
  resolved=path.lstrip('/') if path.startswith('/') else posixpath.normpath(posixpath.join(rel.parent.as_posix(),path))
  digest=asset_versions.get(resolved)
  if not digest:return match.group(0)
  fragment='#'+url.split('#',1)[1] if '#' in url else ''
  return prefix+path+'?v='+digest+fragment+quote
 base=re.sub(r'(?<![\w:-])((?:src|href)\s*=\s*["\'])([^"\'\s]+)(["\'])',relative_asset,base,flags=re.I)
 if rel.parts[0]=='blog':
  base=re.sub(r'href="(?:\.\./|\./)*style\.css(?:\?[^"]*)?"', 'href="/blog/style.css?v='+app_versions['blog/style.css']+'"',base)
 if rel.parts[0]=='simply-endorsed':
  base=re.sub(r'href="(?:\.\./)+css/seo\.css(?:\?[^"]*)?"', 'href="/simply-endorsed/css/seo.css?v='+app_versions['simply-endorsed/css/seo.css']+'"',base)
 if rel.parts[0]=='foi-cards':
  base=re.sub(r'src="app\.js(?:\?[^"]*)?"', 'src="/foi-cards/app.js?v='+app_versions['foi-cards/app.js']+'"',base)
  base=re.sub(r'href="styles\.css(?:\?[^"]*)?"', 'href="/foi-cards/styles.css?v='+app_versions['foi-cards/styles.css']+'"',base)
 if not re.search(r'<head[\s>]',s,re.I):continue
 t=re.sub(r'\n?\s*<script src="/assets/appearance.js(?:\?[^\"]*)?"></script>','',base)
 t=re.sub(r'\s*<meta\s+[^>]*name="theme-color"[^>]*>\s*','',t,flags=re.I)
 t=re.sub(r'(<head[^>]*>)\s*',lambda m:m.group(1)+'\n<meta name="theme-color" content="#E3E3E3">\n'+appearance+'\n',t,count=1,flags=re.I)
 # The single material authority must follow every app-owned stylesheet.
 t=re.sub(r'\s*<link[^>]*href="/assets/avionics\.css(?:\?[^\"]*)?"[^>]*>', '', t)
 t=t.replace('</head>',f'<link rel="stylesheet" href="/assets/avionics.css?v={version}">\n</head>')
 if 'journal-article' in t or 'journal-library' in t:
  t=enhance(t)
 if t!=s:
  changed.append(str(rel))
  if not args.check:p.write_text(t+opaque_tail)
print(('Stale' if args.check else 'Updated'),len(changed),'HTML sources')
if args.check and changed: print('\n'.join(changed))
if args.check and changed:raise SystemExit(1)
if not args.check:
 from journal import apply as apply_journal
 apply_journal()
