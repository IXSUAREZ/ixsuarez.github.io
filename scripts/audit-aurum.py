#!/usr/bin/env python3
"""Check actual active-route theme wiring, never treat it as visual approval."""
from pathlib import Path
from hashlib import sha256
import json,re,posixpath,fnmatch
from html.parser import HTMLParser
from collections import Counter
from theme_assets import load_asset_versions, theme_asset_errors, retired_asset_files

class ControlInventory(HTMLParser):
    """Source inventory only: dynamic app controls require runtime review."""
    def __init__(self):
        super().__init__();self.controls=Counter()
    def handle_starttag(self,tag,attrs):
        attrs=dict(attrs);classes=attrs.get("class", "").split()
        if tag == "button" or (tag == "a" and any("btn" in c or "button" in c for c in classes)):
            self.controls[tag + " | " + " ".join(sorted(classes))] += 1
root=Path(__file__).resolve().parents[1]
asset_versions, retired_assets = load_asset_versions(root)
restored_retired_assets = retired_asset_files(root, retired_assets)
rows=[]
groups={}
# Supporting documents are real browser entry points but are not SEO routes.
supporting_config=json.loads((root/'config/theme-supporting-documents.json').read_text())
supporting_files=supporting_config['documents']
registered_pages=json.loads((root/'config/site-pages.json').read_text())['pages']
pwa_manifests=[]
for file in ('simply-endorsed-cfi/site.webmanifest', 'simply-endorsed/site.webmanifest',
             'pilotsolve/manifest.webmanifest', 'aero-lab/site.webmanifest'):
    manifest=json.loads((root/file).read_text())
    colors={key:manifest.get(key) for key in ('background_color','theme_color')}
    errors=[f'{key} must use the Day gray fallback #E3E3E3, got {value!r}'
            for key,value in colors.items() if value != '#E3E3E3']
    pwa_manifests.append({'file':file,'colors':colors,'integration_errors':errors})
known_files={page['file'] for page in registered_pages} | set(supporting_files)
excluded_html=[]
unclassified=[]
for path in root.rglob('*.html'):
    relative=path.relative_to(root)
    if any(part in relative.parts for part in ['.git','node_modules','_local-only','.wrangler-integration','output','.venv']):
        continue
    file=relative.as_posix()
    if file in known_files: continue
    reason=next((reason for pattern,reason in supporting_config['excluded_html'].items() if fnmatch.fnmatchcase(file,pattern)),None)
    if reason: excluded_html.append({'file':file,'reason':reason})
    else: unclassified.append(file)
supporting=[]
for file in supporting_files:
    source=(root/file).read_text(); head=source.split('</head>',1)[0]
    errors=theme_asset_errors(file, source, asset_versions, retired_assets)
    for asset in ['appearance.js','avionics.css']:
        expected='/assets/'+asset+'?v='+sha256((root/'assets'/asset).read_bytes()).hexdigest()[:10]
        if expected not in head: errors.append('missing/current-byte URL: '+asset)
    scripts=re.findall(r'<script[^>]*src="([^"]+)"',head)
    if not scripts or not scripts[0].startswith('/assets/appearance.js?'):
        errors.append('appearance not first script')
    styles=re.findall(r'<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"',head)
    if not styles or not styles[-1].startswith('/assets/avionics.css?'):
        errors.append('material authority not final head stylesheet')
    for href in styles:
        if href.startswith(('http:','https:','//')): continue
        clean=href.split('?',1)[0]
        asset=clean.lstrip('/') if clean.startswith('/') else posixpath.normpath(posixpath.join(posixpath.dirname(file),clean))
        if not (root/asset).is_file(): errors.append('missing stylesheet: '+asset)
    supporting.append({'file':file,'integration_errors':errors,'visual_review':'pending'})

for page in registered_pages:
    path=root/page['file'];source=path.read_text();head=source.split('</head>',1)[0]
    scripts=re.findall(r'<script[^>]*src="([^"]+)"',head)
    styles=re.findall(r'<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"',head)
    errors=theme_asset_errors(page['file'], source, asset_versions, retired_assets)
    for asset in ['appearance.js','avionics.css']:
        expected='/assets/'+asset+'?v='+sha256((root/'assets'/asset).read_bytes()).hexdigest()[:10]
        if expected not in head:errors.append('missing/current-byte URL: '+asset)
    if not scripts or not scripts[0].startswith('/assets/appearance.js?'):errors.append('appearance not first script')
    if not styles or not styles[-1].startswith('/assets/avionics.css?'):errors.append('material authority not final head stylesheet')
    all_styles=re.findall(r'<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"',source)
    resolved=[]
    for href in all_styles:
        if href.startswith(('http:','https:','//')):continue
        clean=href.split('?',1)[0]
        asset=clean.lstrip('/') if clean.startswith('/') else posixpath.normpath(posixpath.join(posixpath.dirname(page['file']),clean))
        resolved.append(asset)
        if not (root/asset).is_file():errors.append('missing stylesheet: '+asset)
    inline='\n'.join(re.findall(r'<style[^>]*>(.*?)</style>',source,re.S)).strip()
    signature=sha256(('\n'.join(resolved)+'\n'+inline).encode()).hexdigest()[:12]
    group=groups.setdefault(signature,{'stylesheets':resolved,'inline_style_sha256':sha256(inline.encode()).hexdigest(),'routes':[]})
    group['routes'].append(page['path'])
    inventory=ControlInventory();inventory.feed(source)
    literals=[value for value in re.findall(r'style="([^"]*)"',source) if re.search(r'(?:color|background)[^:]*:\s*(?:#|rgb|hsl)',value)]
    rows.append({'route':page['path'],'file':page['file'],'integration_errors':errors,'style_group':signature,'inline_color_literals':literals,'source_controls':dict(inventory.controls),'visual_review':'pending'})
control_families={}
for row in rows:
    for family,count in row['source_controls'].items():
        item=control_families.setdefault(family,{'count':0,'routes':[]})
        item['count']+=count;item['routes'].append(row['route'])
report={'unclassified_html':unclassified,'excluded_html':excluded_html,'supporting_documents':supporting,'pwa_manifests':pwa_manifests,'source_control_families':control_families,'scope':'Registered active routes. Structural integration only; not visual, accessibility, workflow, or export approval. Visual review observations are recorded separately in visual-checks-20260924.md.','template_groups':groups,'routes':rows}
report['restored_retired_assets'] = restored_retired_assets
out=root/'docs/design/route-coverage.json';out.write_text(json.dumps(report,indent=2)+'\n')
fail=[r for r in rows if r['integration_errors']]
print(f'{len(rows)-len(fail)}/{len(rows)} registered routes have current first-paint appearance and final material authority')
for row in fail:print(row['route'],row['integration_errors'])
supporting_fail=[r for r in supporting if r['integration_errors']]
print(f'{len(supporting)-len(supporting_fail)}/{len(supporting)} supporting documents have current appearance/material assets')
for row in supporting_fail: print(row['file'],row['integration_errors'])
pwa_fail=[item for item in pwa_manifests if item['integration_errors']]
print(f'{len(pwa_manifests)-len(pwa_fail)}/{len(pwa_manifests)} installable app manifests use the Aurum gray fallback')
for item in pwa_fail: print(item['file'],item['integration_errors'])
for file in unclassified: print('Unclassified HTML document:',file)
for file in restored_retired_assets: print('Retired asset restored in active site:',file)
raise SystemExit(bool(fail or supporting_fail or pwa_fail or unclassified or restored_retired_assets))
