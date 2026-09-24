#!/usr/bin/env python3
"""Read-only route, shared-shell, resource, and protected-asset audit.

Writes docs/avionics/coverage.json as a review artifact. It never edits site HTML.
Independent app builds are enumerated but excluded from shared-shell gates because
their source/build pipelines own their generated markup.
"""
from __future__ import annotations
import hashlib, html.parser, json, re, sys
from pathlib import Path
from urllib.parse import urlsplit, unquote

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT.parent
BASE = WORK / 'baseline' / 'site'
HASHES = WORK / 'baseline' / 'file-hashes.json'
OUT = ROOT / 'docs' / 'avionics' / 'coverage.json'
OWNERS = {
    'pilotsolve': 'PilotSolve independent source/build owner',
    'aero-lab': 'Aero Lab independent source/build owner (pending corrected loader build)',
    'flight-risk-assessment': 'FlightRisk independent React/Vite source/build owner',
    'engine-explorer': 'Engine Explorer independent source/build owner',
    'app': 'Engine Explorer compiled application',
}
APP_CSS_ALLOW = {
    'flight-risk-assessment': 'bundled application CSS is emitted after shared semantic CSS by the app build',
    'engine-explorer': 'bundled Engine Explorer CSS is emitted after shared semantic CSS by its app build',
    'pilotsolve': 'bundled PilotSolve CSS is emitted after shared semantic CSS by its app build',
}
NON_RELEASE_HTML = {
    '_local-only/avionics-refinement/index.html': 'local visual review gallery; excluded from public routes and shared shell',
    'simply-endorsed/tests/text-size-preview.html': 'manual 200% text-size QA fixture; not a public route or production shell',
    'simply-endorsed-cfi/pdf-build/dist/preview-part1-cat-d.html': 'PDF-renderer content fragment; not a standalone HTML page',
}
SKY_FILES = [
    'assets/premium-home.js', 'assets/premium-home.css',
    'assets/premium/sky-horizon.png', 'assets/premium/sky-day.jpg', 'assets/premium/sky-night.jpg',
]
AVIONICS_CSS_URL = '/assets/avionics.css?v=' + hashlib.sha256((ROOT/'assets/avionics.css').read_bytes()).hexdigest()[:10]
SITE_NAV_URL = '/assets/site-nav.js?v=' + hashlib.sha256((ROOT/'assets/site-nav.js').read_bytes()).hexdigest()[:10]
APPROVED_UI_SHA256 = {
    # These exact bytes are already in the published site. Any further change
    # still fails until its source and behavior receive a new review.
    'certificate-generator/js/certificate-generator.js': '0e08465fe711c3b9853ce52cf9a2ed7ac09a68eb833767422c29e0cb05abd857',
    'part-61-calculator/storage.js': '0e5608b39d5b873d5b5b1b9ca9cde77b713bf6e8dbca273509743e69a97360c5',
}

class Scan(html.parser.HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True); self.head=False; self.head_tags=[]; self.refs=[]; self.tags=[]
    def handle_starttag(self, tag, attrs):
        a=dict(attrs); self.tags.append((tag,a))
        if tag=='head': self.head=True
        if self.head: self.head_tags.append((tag,a))
        for key in ('src','href','poster'):
            if a.get(key): self.refs.append((tag,key,a[key]))
        if a.get('srcset'):
            for item in a['srcset'].split(','):
                url=item.strip().split(' ')[0]
                if url: self.refs.append((tag,'srcset',url))
    def handle_endtag(self, tag):
        if tag=='head': self.head=False

def sha(path):
    h=hashlib.sha256()
    with path.open('rb') as f:
        for b in iter(lambda:f.read(1024*1024),b''): h.update(b)
    return h.hexdigest()
def owner(rel):
    p=Path(rel)
    if p.parts and p.parts[0] in OWNERS: return OWNERS[p.parts[0]]
    if p.parts[:2]==('engine-explorer','app'): return OWNERS['app']
    return 'shared site source'
def root_relative(url, source):
    u=urlsplit(url)
    if u.scheme or u.netloc or not u.path or u.path.startswith(('data:','mailto:','tel:','javascript:')): return None
    path=unquote(u.path)
    if path.startswith('/'): target=ROOT/path.lstrip('/')
    else: target=source.parent/path
    target=target.resolve()
    if target.is_dir(): target=target/'index.html'
    return target
def scan_html(path):
    sc=Scan(); sc.feed(path.read_text(errors='replace')); return sc
def read_route_manifest():
    data=json.loads((ROOT/'config/site-pages.json').read_text())
    return data.get('pages',[])

def main():
    baseline_hashes=json.loads(HASHES.read_text()) if HASHES.exists() else {}
    routes=read_route_manifest(); route_records=[]; failures=[]
    html_files=sorted(p for p in ROOT.rglob('*.html') if not any(x in p.relative_to(ROOT).parts for x in ('.git','node_modules','.wrangler-integration')))
    route_files=set()
    for r in routes:
        f=(ROOT/r['file']).resolve(); route_files.add(f)
        rec={'path':r['path'],'file':r['file'],'kind':r.get('kind'),'identity':r.get('identity'),'owner':owner(r['file']),'exists':f.is_file()}
        if not f.is_file(): failures.append('missing canonical route file: '+r['file'])
        route_records.append(rec)
    html_records=[]
    for p in html_files:
        rel=p.relative_to(ROOT).as_posix(); sc=scan_html(p); own=owner(rel); is_route=p.resolve() in route_files
        exemption=own!='shared site source'
        nonrelease=NON_RELEASE_HTML.get(rel)
        head_scripts=[a for t,a in sc.head_tags if t=='script' and a.get('src','').split('?')[0]=='/assets/appearance.js']
        site_nav_urls=[a.get('src','') for t,a in sc.tags if t=='script' and a.get('src','').split('?')[0]=='/assets/site-nav.js']
        shared_nav_count=len(site_nav_urls)
        adapter_count=sum(1 for t,a in sc.tags if t=='script' and a.get('src','').split('?')[0]=='/assets/avionics-tools.js')
        avionics_css_urls=[a.get('href','') for t,a in sc.head_tags if t=='link' and a.get('href','').split('?')[0]=='/assets/avionics.css']
        avionics_css_count=len(avionics_css_urls)
        head_styles=[a.get('href','').split('?')[0] for t,a in sc.head_tags if t=='link' and 'stylesheet' in a.get('rel','').lower().split()]
        head_order=[(t,a) for t,a in sc.head_tags if (t=='script' and a.get('src','').split('?')[0]=='/assets/appearance.js') or (t=='link' and 'stylesheet' in a.get('rel','').lower().split())]
        appearance_before_css=bool(head_order) and next((i for i,x in enumerate(head_order) if x[0]=='script'),999)<next((i for i,x in enumerate(head_order) if x[0]=='link'),999)
        css_ok=bool(head_styles and head_styles[-1]=='/assets/avionics.css')
        avionics_positions=[i for i,x in enumerate(head_styles) if x=='/assets/avionics.css']
        post_css=head_styles[avionics_positions[-1]+1:] if avionics_positions else head_styles
        allowed_post=not post_css or (Path(rel).parts[0] in APP_CSS_ALLOW and all('assets/' in x for x in post_css))
        nav_count=sum(1 for t,a in sc.tags if t in ('nav','div','header') and ('nav' in a.get('class','').split() or a.get('aria-label')=='Primary'))
        dup_appearance=sum(1 for t,a in sc.tags if t=='fieldset' and 'av-appearance' in a.get('class','').split())
        missing=[]
        for tag,key,url in sc.refs:
            target=root_relative(url,p)
            if target and not target.exists(): missing.append({'tag':tag,'attribute':key,'url':url})
        page_shell=not nonrelease and p.name not in ('nav.html','nav-tool.html','footer.html','post-cta.html') and not rel.startswith('assets/partials/')
        if page_shell:
            # Every standalone HTML page, including independent app outputs, must
            # carry synchronous first-paint appearance and the shared design layer.
            if len(head_scripts)!=1: failures.append(f'{rel}: expected one synchronous appearance.js in head, found {len(head_scripts)}')
            elif any(k in head_scripts[0] for k in ('async','defer')): failures.append(f'{rel}: appearance.js is async/deferred')
            if avionics_css_count!=1: failures.append(f'{rel}: expected one avionics.css link, found {avionics_css_count}')
            elif avionics_css_urls[0]!=AVIONICS_CSS_URL: failures.append(f'{rel}: stale avionics.css version')
            if any(url!=SITE_NAV_URL for url in site_nav_urls): failures.append(f'{rel}: stale site-nav.js version')
            if dup_appearance: failures.append(f'{rel}: duplicate authored appearance fieldset ({dup_appearance})')
            if not exemption and (shared_nav_count>1 or adapter_count>1 or avionics_css_count>1): failures.append(f'{rel}: duplicate shared script/style injection (site-nav={shared_nav_count}, avionics-tools={adapter_count}, avionics.css={avionics_css_count})')
            if avionics_css_count and not css_ok and not (exemption and allowed_post): failures.append(f'{rel}: avionics.css is not final linked stylesheet')
            if head_scripts and head_styles and not appearance_before_css: failures.append(f'{rel}: appearance script does not precede CSS')
            if avionics_css_count and not allowed_post: failures.append(f'{rel}: unexpected stylesheet after avionics.css: {post_css}')
        if missing and not exemption and not nonrelease: failures.append(f'{rel}: {len(missing)} broken local resource reference(s)')
        html_records.append({'file':rel,'canonicalRoute':is_route,'owner':own,'type':('route' if is_route else ('template/partial' if rel.startswith(('templates/','assets/partials/')) else ('non-release-fixture-or-fragment' if nonrelease else 'utility/iframe/other HTML'))),'nonReleaseReason':nonrelease,'sharedShellExempt':exemption,'appearanceHeadCount':len(head_scripts),'appearanceSynchronous':bool(head_scripts) and not any(k in head_scripts[0] for k in ('async','defer')),'siteNavScriptCount':shared_nav_count,'toolAdapterScriptCount':adapter_count,'avionicsStylesheetCount':avionics_css_count,'stylesheetOrder':head_styles,'lastStylesheetIsAvionics':css_ok,'bundledCssAllowance':APP_CSS_ALLOW.get(Path(rel).parts[0]) if Path(rel).parts else None,'navigationLandmarkLikeCount':nav_count,'authoredAppearanceFieldsets':dup_appearance,'missingLocalResources':missing})
    sky=[]
    for rel in SKY_FILES:
        cur=ROOT/rel; expected=baseline_hashes.get(rel); actual=sha(cur) if cur.is_file() else None
        sky.append({'file':rel,'baselineSha256':expected,'currentSha256':actual,'matches':bool(expected and actual==expected)})
        if not expected or not actual or expected!=actual: failures.append('protected sky hash mismatch: '+rel)
    # Compare hero subtree by balanced-element extraction, allowing page-shell/nav changes elsewhere.
    def hero(path):
        s=path.read_text(errors='replace'); m=re.search(r'<([a-z][\w:-]*)\b[^>]*\bid=["\']hero["\'][^>]*>',s,re.I)
        if not m:return None
        tag=m.group(1); stack=1; token=re.compile(r'<(/?'+re.escape(tag)+r')\b[^>]*>',re.I)
        for x in token.finditer(s,m.end()):
            if x.group(1).startswith('/'): stack-=1
            elif not x.group(0).rstrip().endswith('/>'): stack+=1
            if stack==0:return s[m.start():x.end()]
        return None
    basehero=hero(BASE/'index.html') if (BASE/'index.html').exists() else None; currenthero=hero(ROOT/'index.html')
    # The later approved reference added an icon to each hero CTA. Normalize
    # only those two exact decorative tags, then compare the full hero so sky
    # markup, behavior attributes, copy, and CTA destinations remain guarded.
    approved_icons = ('<img class="button-icon" src="/assets/home-plane.svg" width="26" height="26" alt="">',
                      '<img class="button-icon" src="/assets/home-book.svg" width="26" height="26" alt="">')
    comparable_hero=currenthero
    if comparable_hero is not None:
        for icon in approved_icons: comparable_hero=comparable_hero.replace(icon,'')
    hero_same=bool(basehero is not None and comparable_hero==basehero)
    if not hero_same: failures.append('homepage #hero differs beyond the two approved decorative CTA icons')
    # Protected core source hashes: prefer known authored source/data/storage/export files found in manifest.
    protected_patterns=('part61-calculator-core.js','part61-rules-data.js','part61-scenario-generator.js','workspace-model.js','workspace.js','storage.js','storage-config.js','certificate-generator.js','cards.js','frat.ts','store.tsx')
    protected=[]
    for rel,expected in baseline_hashes.items():
        if not isinstance(rel,str) or not rel.endswith(protected_patterns): continue
        cur=ROOT/rel
        if cur.is_file(): actual=sha(cur); status='match' if actual==expected else 'changed'
        else: actual=None; status='missing'
        # Declared UI-only exceptions are permissive only for the named adapter files.
        permitted=rel in {'foi-cards/app.js','flight-risk-assessment/src/components/NavExtras.tsx'} or (rel in APPROVED_UI_SHA256 and actual==APPROVED_UI_SHA256[rel])
        protected.append({'file':rel,'baselineSha256':expected,'currentSha256':actual,'status':status,'allowedUIException':permitted})
        if status!='match' and not permitted: failures.append(f'protected core source {status}: {rel}')
    summary={'canonicalRouteCount':len(routes),'canonicalRoutesExisting':sum(1 for r in route_records if r['exists']),'canonicalRouteKinds':{},'htmlFileCount':len(html_files),'renderableNonRouteHtmlCount':sum(1 for h in html_records if not h['canonicalRoute'] and h['type'] not in ('template/partial','non-release-fixture-or-fragment')),'templatePartialHtmlCount':sum(1 for h in html_records if h['type']=='template/partial'),'nonReleaseFixtureOrFragmentCount':sum(1 for h in html_records if h['type']=='non-release-fixture-or-fragment'),'ownerExemptHtmlCount':sum(1 for h in html_records if h['sharedShellExempt']),'failures':len(failures)}
    for r in routes: summary['canonicalRouteKinds'][r.get('kind','unknown')]=summary['canonicalRouteKinds'].get(r.get('kind','unknown'),0)+1
    nav_plan=json.loads((WORK/'acceptance-inventory.json').read_text()).get('dockPlan',{})
    report={'generatedBy':'scripts/audit-avionics.py','scope':'Static filesystem/HTML audit; no browser rendering or runtime interaction performed.','summary':summary,'routeManifestSource':'config/site-pages.json','routes':route_records,'renderableHtml':html_records,'protectedSkyAssets':sky,'homepageHeroSubtreeMatchesBaseline':hero_same,'protectedCoreSources':protected,'navigationOwnership':{'sharedGlobalDock':'assets/site-nav.js owns shared site Menu, global destinations, appearance controls, and dock placement.','toolAdapter':'assets/avionics-tools.js mirrors supported native step/section controls while native handlers remain authoritative.','independentOwners':OWNERS,'plannedDockBehavior':nav_plan},'sharedNavigationReview':{'source':'assets/site-nav.js','risks':['No focus trap; appropriate only while Menu remains a disclosure containing ordinary navigation links and controls.','Focusout closes the panel; verify keyboard traversal remains usable when focus moves among disclosure content.','ResizeObserver clearance is layout-based; fixed overlays inside tool apps still need app-specific occlusion checks.'],'verifiedByStaticSource':['Escape closes and returns focus to Menu toggle.','Opening Menu moves focus to its first link/control.','Outside pointer and navigation link close the panel.','Current shared code guards against moving .nav-links into itself.']},'toolAdapterReview':{'source':'assets/avionics-tools.js','risks':['Adapter labels/icons are index-based; added native steps can produce an undefined icon or missing label.','Disabled state mirrors .disabled but not aria-disabled, and active state mirrors .active/aria-current only.','MutationObserver observes native owner; a replaced owner node may stop updates.','Dock controls proxy native controls by click; correctness depends on prerequisite handlers staying attached to native control.'],'verifiedByStaticSource':['Native source controls remain mounted and own calculations, persistence, validation, exports, and prerequisite state.','Current targets: Simply Endorsed workspace links, Certificate Generator four steps, Part 61 calculator four steps.']},'failuresDetail':failures}
    OUT.parent.mkdir(parents=True,exist_ok=True); OUT.write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n')
    print(f"routes={summary['canonicalRouteCount']} html={summary['htmlFileCount']} nonroute_renderable={summary['renderableNonRouteHtmlCount']} owner_exempt={summary['ownerExemptHtmlCount']} failures={len(failures)}")
    for x in failures[:200]: print('FAIL:',x)
    print('Wrote',OUT)
    return bool(failures)
if __name__=='__main__': sys.exit(main())
