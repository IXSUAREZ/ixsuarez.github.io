#!/usr/bin/env python3
"""Conservatively archive unreferenced hashed app JS/CSS, preserving import closure.

HTML shells, offline manifests/workers, and authored JS are roots. Candidate
filenames are matched literally to handle Vite dynamic-import maps as well as
relative imports. Only generated hashed JS/CSS are candidates; artwork/model
files and hand-authored presentation adapters are never moved.
"""
from pathlib import Path
from hashlib import sha256
import argparse,json,re,tarfile
root=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser();parser.add_argument('--archive',type=Path);args=parser.parse_args()
apps=['pilotsolve','aero-lab','flight-risk-assessment','engine-explorer/app']
report=[];stale=[]
for app in apps:
    candidates=[p for p in (root/app/'assets').glob('*') if re.fullmatch(r'.+-[A-Za-z0-9_-]{8}\.(?:js|css)',p.name)]
    roots=[]
    for p in root.rglob('*'):
        if not p.is_file() or any(v in p.relative_to(root).parts for v in ['node_modules','.git','docs','output']):continue
        if p.suffix=='.html' or p.name in ['BUILD.json','sw.js','service-worker.js']:roots.append(p)
        elif p.suffix=='.js' and 'assets' in p.parts and not re.fullmatch(r'.+-[A-Za-z0-9_-]{8}\.(?:js|css)',p.name):roots.append(p)
    text='\n'.join(p.read_text(errors='replace') for p in roots)
    kept=set();changed=True
    while changed:
        found={p for p in candidates if p.name in text}-kept
        changed=bool(found);kept.update(found)
        text='\n'.join(p.read_text(errors='replace') for p in found)
    unused=sorted(set(candidates)-kept)
    stale.extend(unused)
    report.append({'app':app,'kept':len(kept),'archive':[str(p.relative_to(root)) for p in unused]})
manifest={'scope':'Unreferenced generated app style/runtime versions; conservative filename import closure','apps':report,'files':{str(p.relative_to(root)):{'sha256':sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size} for p in stale}}
print(json.dumps({'archive_count':len(stale),'bytes':sum(p.stat().st_size for p in stale),'apps':report},indent=2))
if args.archive:
    destination=args.archive.resolve()
    if destination==root or root in destination.parents:raise SystemExit('Archive must be outside deployable source')
    destination.mkdir(parents=True,exist_ok=True)
    tar=destination/'superseded-app-assets.tar.gz'
    if tar.exists():raise SystemExit('Archive already exists; choose a new snapshot destination')
    with tarfile.open(tar,'w:gz') as out:
        for p in stale:out.add(p,arcname=str(p.relative_to(root)))
    with tarfile.open(tar,'r:gz') as check:
        for p in stale:
            rel=str(p.relative_to(root))
            if sha256(check.extractfile(rel).read()).hexdigest()!=manifest['files'][rel]['sha256']:raise SystemExit('Archive verification failed: '+rel)
    (destination/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
    for p in stale:p.unlink()
    report_path=root/'docs/design/archived-app-assets.json'
    if report_path.exists():
        previous=report_path.read_bytes()
        history=root/'docs/design/archive-history'
        history.mkdir(exist_ok=True)
        prior=history/('assets-'+sha256(previous).hexdigest()[:12]+'.json')
        prior.write_bytes(previous)
        manifest['previous_report']=str(prior.relative_to(root))
    manifest['archive_location']=str(tar)
    report_path.write_text(json.dumps(manifest,indent=2)+'\n')
    registry_path=root/'config/theme-assets.json'
    registry=json.loads(registry_path.read_text())
    registry['retired']=sorted(set(registry['retired']) | set(manifest['files']))
    registry_path.write_text(json.dumps(registry,indent=2)+'\n')
