#!/usr/bin/env python3
"""Read-only static audit for the public site route inventory."""
import json, re, struct, sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlparse

ROOT = Path(__file__).resolve().parent.parent
EXCLUDED = {'.git', '.agents', 'node_modules', 'output', '_local-only', 'templates', '_template'}
EXCLUDED_PREFIXES = ('engine-explorer/app/', 'aero-lab/native-flow/', 'assets/partials/', 'simply-endorsed-cfi/pdf-build/dist/', 'simply-endorsed/tests/')
HTTP = re.compile(r'^https?://', re.I)

class PageParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True); self.title=''; self.desc=''; self.canonical=''; self.robots=''; self.refresh=''; self.links=[]; self.sources=[]; self.headings=[]; self.jsonld=[]; self._tag=''; self._capture=None
    def handle_starttag(self, tag, attrs):
        a=dict(attrs); self._tag=tag
        if tag in ('a','img','script','link','iframe','source','video','audio'):
            ref=a.get('href') or a.get('src');
            if ref: self.links.append(ref)
        if tag=='title': self._capture='title'
        if tag in ('h1','h2','h3'): self._capture='heading'
        if tag=='meta':
            key=(a.get('name') or a.get('property') or '').lower()
            if key=='description': self.desc=a.get('content','')
            if key=='robots': self.robots=a.get('content','')
            if a.get('http-equiv','').lower()=='refresh': self.refresh=a.get('content','')
        if tag=='link' and a.get('rel','').lower()=='canonical': self.canonical=a.get('href','')
        if tag=='script' and a.get('type','').lower()=='application/ld+json': self._capture='jsonld'
    def handle_endtag(self, tag): self._capture=None; self._tag=''
    def handle_data(self, data):
        if self._capture=='title': self.title += data
        elif self._capture=='heading': self.headings.append(data.strip())
        elif self._capture=='jsonld': self.jsonld.append(data)

def png_size(path):
    try:
        b=path.read_bytes()
        if b[:8] != b'\x89PNG\r\n\x1a\n': return None
        return struct.unpack('>II', b[16:24])
    except (OSError, struct.error): return None

def local_target(source, ref):
    if not ref or ref.startswith(('#','mailto:','tel:','data:','javascript:')) or HTTP.match(ref): return None
    rel=source.relative_to(ROOT)
    base='https://local.invalid/'+(str(rel.parent).replace('\\','/')+'/' if str(rel.parent)!='.' else '')
    raw=urlparse(urljoin(base, ref))
    path=raw.path
    if not path.startswith('/'): path='/'+path
    target=ROOT / path.lstrip('/')
    if path.endswith('/'): target=target/'index.html'
    return target

def main():
    manifest=json.loads((ROOT/'config/site-pages.json').read_text()); pages=manifest['pages']; by_file={ROOT/p['file']:p for p in pages}; sitemap_text=(ROOT/'sitemap.xml').read_text()
    sitemap=set(re.findall(r'<loc>(.*?)</loc>',sitemap_text)); rows=[]; failures=[]; source_failures=[]; jsonld_failures=[]; aliases=[]
    discovered=[]
    for f in ROOT.rglob('*.html'):
        rel=str(f.relative_to(ROOT))
        if any(part in EXCLUDED for part in f.relative_to(ROOT).parts) or rel.startswith(EXCLUDED_PREFIXES): continue
        discovered.append(f)
    def fail(kind, route, detail): failures.append({'kind':kind,'route':route,'detail':detail})
    for f in discovered:
        p=by_file.get(f); route=p['path'] if p else ('/'+str(f.relative_to(ROOT)).replace('index.html',''))
        try: text=f.read_text()
        except OSError as e: fail('unreadable',route,str(e)); continue
        q=PageParser(); q.feed(text); q.close(); expected=p
        alias_match=re.search(r'url\s*=\s*([^;]+)',q.refresh,re.I)
        if not expected and alias_match:
            destination=urljoin('/',alias_match.group(1).strip().strip('"\'')); aliases.append({'route':route,'destination':destination});
        if expected:
            if not q.title.strip(): fail('title',route,'missing title')
            elif q.title.strip()!=expected['title']: fail('title',route,'does not match manifest')
            if not q.desc.strip(): fail('description',route,'missing description')
            elif q.desc.strip()!=expected['description']: fail('description',route,'does not match manifest')
            canonical=urljoin(manifest['origin']+'/',q.canonical)
            if canonical != manifest['origin']+expected['path']: fail('canonical',route,'expected '+manifest['origin']+expected['path']+' got '+q.canonical)
            indexed='noindex' not in q.robots.lower()
            if indexed != bool(expected['indexable']): fail('robots',route,'indexability disagrees with manifest')
            in_map=manifest['origin']+expected['path'] in sitemap
            if in_map != bool(expected['indexable']): fail('sitemap',route,'membership disagrees with indexable flag')
        bad=[]
        for ref in q.links:
            target=local_target(f,ref)
            if target and not target.exists(): bad.append(ref)
        for ref in bad: fail('broken_ref',route,ref); source_failures.append(ref)
        for raw in q.jsonld:
            try: json.loads(raw)
            except json.JSONDecodeError as e: fail('jsonld',route,'invalid JSON-LD: '+str(e)); jsonld_failures.append(route)
        rows.append({'route':route,'title':q.title.strip(),'description':q.desc.strip(),'kind':p['kind'] if p else ('alias' if alias_match else 'discovered'),'identity':p['identity'] if p else None,'indexable':p['indexable'] if p else False if alias_match else None,'source_urls':[x for x in q.links if HTTP.match(x)],'broken_refs':bad,'headings':[x for x in q.headings if x]})
    manifest_files=set(by_file); discovered_set=set(discovered)
    for f in sorted(manifest_files-discovered_set): fail('missing_route',next((p['path'] for p in pages if ROOT/p['file']==f),str(f)),'manifest file not discovered')
    for f in sorted(discovered_set-manifest_files):
        text=f.read_text(); q=PageParser(); q.feed(text); q.close()
        if not re.search(r'url\s*=\s*[^;]+',q.refresh,re.I): fail('unmanifested_route','/'+str(f.relative_to(ROOT)),'HTML route is outside config/site-pages.json')
    for ident in sorted(manifest['identities']):
        base=ROOT/'assets/identities'/ident
        for name in ('preview.png','logo.png'):
            size=png_size(base/name)
            expected_size=(1200,1200) if name=='preview.png' else (512,512)
            if size != expected_size: fail('asset',ident,f'{name} expected PNG {expected_size[0]}x{expected_size[1]}, got {size or "missing/invalid"}')
        for name in ('icon-48.png','icon-192.png','icon-180.png'):
            if not png_size(base/name): fail('asset',ident,f'{name} missing/invalid PNG')
    report={'generated_by':'scripts/audit-site.py','origin':manifest['origin'],'summary':{'manifest_routes':len(pages),'discovered_html':len(discovered),'audit_rows':len(rows),'alias_count':len(aliases),'failure_count':len(failures),'broken_reference_count':len(source_failures),'jsonld_failure_count':len(jsonld_failures),'origin_unknown_failure_count':len(failures)},'aliases':aliases,'failures':failures,'rows':sorted(rows,key=lambda x:x['route'])}
    (ROOT/'docs').mkdir(exist_ok=True); (ROOT/'docs/site-route-audit.json').write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n')
    md=['# Site route audit','',f"Generated by `scripts/audit-site.py` (read-only source audit). Finding origin is **unknown** without a trusted baseline; this report makes no pre-existing or introduced claim.",'',f"Routes in manifest: **{len(pages)}**",f"HTML files discovered: **{len(discovered)}**",f"Redirect aliases: **{len(aliases)}**",f"Failure count: **{len(failures)}**",f"Broken references: **{len(source_failures)}**",f"Invalid JSON-LD blocks: **{len(jsonld_failures)}**",'']
    if failures:
        md += ['## Findings','', '| Severity | Route | Finding |','|---|---|---|'] + [f"| error | `{x['route']}` | {x['kind']}: {x['detail']} |" for x in failures]
    else: md += ['No failures found.']
    (ROOT/'docs/site-route-audit.md').write_text('\n'.join(md)+'\n')
    print(json.dumps(report['summary'],sort_keys=True)); return 1 if failures else 0
if __name__=='__main__': sys.exit(main())
