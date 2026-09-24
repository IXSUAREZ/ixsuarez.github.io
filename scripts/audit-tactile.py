#!/usr/bin/env python3
"""Audit tactile release coverage against the immutable checkout starting commit."""
from pathlib import Path
from hashlib import sha256
import json,re,subprocess
ROOT=Path(__file__).resolve().parents[1]
GIT='/Library/Developer/CommandLineTools/usr/bin/git'
manifest=json.loads((ROOT/'config/site-pages.json').read_text())
base='6c97779192aad3a245cd0a1b5db7aab0c3e34d3d'
def git(*args):return subprocess.check_output([GIT,*args],cwd=ROOT)
failures=[];routes=[]
for p in manifest['pages']:
 f=ROOT/p['file']; s=f.read_text() if f.exists() else ''
 record={'route':p['path'],'file':p['file'],'exists':f.exists(),'runtime':bool(re.search(r'<script[^>]+src="/assets/tactile.js\?',s)),'sharedStyle':'/assets/avionics.css?v=' in s}
 if not record['exists']:failures.append(p['path']+' missing')
 # Redirect stubs do not have controls; canonical rendered routes must share both assets.
 if not re.search(r'http-equiv=["\']refresh',s,re.I):
  if not record['runtime']:failures.append(p['path']+' missing tactile runtime')
  if not record['sharedStyle']:failures.append(p['path']+' missing shared control styles')
 routes.append(record)
protected=['assets/premium-home.js','assets/premium-home.css','assets/premium/sky-horizon.png','assets/premium/sky-day.jpg','assets/premium/sky-night.jpg']
tracked=git('ls-tree','-r','--name-only',base).decode().splitlines()
protected += [p for p in tracked if p.startswith('engine-explorer/app/') and ((p.endswith('.js') and '/assets/' in p and 'avionics-overlay' not in p) or p.endswith(('.glb','.gltf','.bin')))]
protected += [p for p in tracked if p.startswith(('certificate-generator/js/','certificate-generator/templates/'))]
checks=[]
for p in protected:
 before=git('show',base+':'+p);after=(ROOT/p).read_bytes()
 ok=sha256(before).digest()==sha256(after).digest();checks.append({'file':p,'unchanged':ok})
 if not ok:failures.append(p+' changed protected bytes')
for rel in ['assets/tactile.js','assets/avionics.css','assets/site-nav.js']:
 version=sha256((ROOT/rel).read_bytes()).hexdigest()[:10]
 for r in routes:
  text=(ROOT/r['file']).read_text()
  urls=re.findall(r'(?:src|href)="(/'+re.escape(rel)+r'(?:\?[^" ]*)?)"',text)
  if any(u!='/'+rel+'?v='+version for u in urls):failures.append(r['route']+' stale '+rel)
report={'baseline':base,'canonicalRoutes':len(routes),'routes':routes,'protected':checks,'failures':failures,'evidenceBoundary':'Static route/asset checks. Visual and interaction evidence is recorded separately.'}
out=ROOT/'docs/tactile/coverage.json';out.parent.mkdir(exist_ok=True);out.write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({'routes':len(routes),'protectedFiles':len(checks),'failures':len(failures)}))
for failure in failures:print(failure)
raise SystemExit(bool(failures))
