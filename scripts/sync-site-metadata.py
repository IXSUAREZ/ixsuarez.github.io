#!/usr/bin/env python3
"""Build static metadata and crawlable directory from config/site-pages.json.
Run after application builds and chrome sync. --check never modifies files.
"""
import argparse,html,json,re,sys,xml.etree.ElementTree as ET
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
M=json.loads((ROOT/'config/site-pages.json').read_text());ORIGIN=M['origin']
E=lambda s:html.escape(str(s),quote=True)
def meta(key,value,property=False):return f'<meta {"property" if property else "name"}="{key}" content="{E(value)}" />'
def head_for(p):
 base='/assets/identities/'+p['identity'];img=ORIGIN+base+'/preview.png'
 lines=[f'<title>{E(p["title"])}</title>',meta('description',p['description']),f'<link rel="canonical" href="{ORIGIN}{p["path"]}" />',meta('robots','index, follow, max-image-preview:large' if p['indexable'] else 'noindex, follow')]
 for k,v in {'type':'article' if p['kind']=='article' else 'website','url':ORIGIN+p['path'],'site_name':'SuarezCFI','title':p['title'],'description':p['description'],'image':img,'image:secure_url':img,'image:type':'image/png','image:width':'1200','image:height':'1200','image:alt':M['identities'][p['identity']]['label']+' logo','locale':'en_US'}.items():lines.append(meta('og:'+k,v,True))
 for k,v in {'card':'summary','title':p['title'],'description':p['description'],'image':img,'image:alt':M['identities'][p['identity']]['label']+' logo'}.items():lines.append(meta('twitter:'+k,v))
 if p['path']=='/':
  lines += ['<link rel="icon" href="/favicon.ico" sizes="any" />','<link rel="icon" type="image/png" sizes="192x192" href="/assets/favicon-192.png" />','<link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png" />']
 else:
  lines += [f'<link rel="icon" type="image/png" sizes="{size}x{size}" href="{base}/icon-{size}.png" />' for size in [48,192]]+[f'<link rel="apple-touch-icon" sizes="180x180" href="{base}/icon-180.png" />']
 return '<!-- page-metadata: generated from config/site-pages.json -->\n'+'\n'.join(lines)+'\n<!-- /page-metadata -->'
def sync_head(text,p):
 # Preserve all stylesheets, app scripts, manifests, verification tokens and schema.
 def clean(m):
  tag=m.group(0); attrs=dict(re.findall(r'([\w:-]+)\s*=\s*["\']([^"\']*)["\']',tag))
  if tag.lower().startswith('<meta') and (attrs.get('name','').lower() in ['description','robots'] or attrs.get('name','').startswith('twitter:') or attrs.get('property','').startswith('og:')):return ''
  if tag.lower().startswith('<link') and attrs.get('rel','') in ['canonical','icon','shortcut icon','apple-touch-icon','apple-touch-icon-precomposed']:return ''
  return tag
 start,end=text.index('<head>')+6,text.index('</head>');head=text[start:end]
 head=re.sub(r'<!-- page-metadata:.*?<!-- /page-metadata -->','',head,flags=re.S)
 head=re.sub(r'<title\b[^>]*>.*?</title>','',head,flags=re.S|re.I)
 head=re.sub(r'<(?:meta|link)\b[^>]*>',clean,head,flags=re.I)
 head=re.sub(r'\n[ \t]*\n(?:[ \t]*\n)*','\n',head).strip()
 return text[:start]+'\n'+head_for(p)+'\n'+head+'\n'+text[end:]
def tool_cards(home=False):
 out=[]
 for t in M['tools']:
  if home:out.append(f'<a href="{t["path"]}" class="tool-card paper paper--press" data-tool="{t["id"]}" data-cta-id="home-tools-{t["id"]}"><span class="tool-card-top"><span class="tool-icon" aria-hidden="true"><img src="/assets/identities/{t["id"]}/logo.png" width="72" height="72" alt="" /></span><span class="tool-topic">{E(t["topic"])}</span></span><span class="tool-card-copy"><strong>{E(t["label"])}</strong><span class="tool-description">{E(t["description"])}</span></span><span class="tool-card-open">Open tool<span aria-hidden="true">↗</span></span></a>')
  else:out.append(f'<article class="hub-card tool-directory-card"><img src="/assets/identities/{t["id"]}/logo.png" width="64" height="64" alt="" /><span class="eyebrow">{E(t["topic"])}</span><h2><a href="{t["path"]}" data-cta-id="directory-{t["id"]}">{E(t["label"])}</a></h2><p>{E(t["description"])}</p><a href="{t["path"]}" class="tool-open" aria-label="Open {E(t["label"])}">Open tool →</a></article>')
 return '\n'.join(out)
def tools_page():
 nav=(ROOT/'assets/partials/nav.html').read_text();footer=(ROOT/'assets/partials/footer.html').read_text()
 return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
<link rel="stylesheet" href="/assets/design-system.css" /><link rel="stylesheet" href="/learn/style.css" /><link rel="stylesheet" href="/assets/premium.css" /><link rel="stylesheet" href="/assets/site-discovery.css" />
</head><body class="editorial-page">
<!-- site-nav -->
{nav}<!-- /site-nav -->
<main><section class="page-hero"><div class="container"><img class="page-identity" src="/assets/identities/tools/logo.png" width="64" height="64" alt="" /><span class="eyebrow">Free tools · built by your instructor</span><h1>A tool for your next step.</h1><p>Plan your training, study a concept, or prepare for a flight. Explore the full SuarezCFI tool collection below.</p><a class="btn btn--secondary" href="/learn/">Browse aviation guides</a></div></section>
<section class="container hub-grid tools-directory" aria-label="Pilot tools">{tool_cards()}</section>
<section class="container directory-next"><h2>Put your learning into practice.</h2><p>Learn to fly with Diego Suarez, a CFI at Kentucky Flight Training Center at Bowman Field in Louisville.</p><a class="btn btn--primary" href="/discovery-flight-louisville-ky/" data-cta-id="tools-discovery">Request a discovery flight</a></section></main>
<!-- site-footer -->
{footer}<!-- /site-footer -->
<script src="/assets/site-nav.js" defer></script><script src="/assets/cta-tracking.js" defer></script>
<script defer data-domain="suarezcfi.com" src="https://plausible.io/js/script.js"></script>
</body></html>'''
def main():
 ap=argparse.ArgumentParser();ap.add_argument('--check',action='store_true');args=ap.parse_args();drift=[]
 def write(rel,data):
  p=ROOT/rel
  if not p.exists() or p.read_text()!=data:
   drift.append(rel)
   if not args.check:p.parent.mkdir(parents=True,exist_ok=True);p.write_text(data)
 # Render tools once, then all heads. Always emit final content in a single pass.
 for p in M['pages']:
  file=ROOT/p['file']
  if p['path']=='/tools/':text=tools_page()
  elif file.exists():text=file.read_text()
  else:raise RuntimeError('Missing route '+p['file'])
  write(p['file'],sync_head(text,p))
 # Keep independently built application menus linked to the same inventory.
 app_rel='assets/app-site-navigation.js';app_text=(ROOT/app_rel).read_text()
 app_items=[{'path':'/tools/','label':'All pilot tools','summary':'Explore the full collection'}]+[{k:t[k] for k in ['path','label','summary']} for t in M['tools']]
 app_text=re.sub(r'(// app-tool-links:.*?\n).*?(    // /app-tool-links)',lambda x:x[1]+'    var items = '+json.dumps(app_items,ensure_ascii=False,separators=(',',':'))+';\n'+x[2],app_text,flags=re.S)
 write(app_rel,app_text)
 # Menu inventories are generated; subsequent chrome sync distributes them.
 menu='<a href="/tools/" role="menuitem"><strong>All pilot tools</strong><span>Explore the full collection</span></a>\n'+'\n'.join(f'<a href="{t["path"]}" role="menuitem"><strong>{E(t["label"])}</strong><span>{E(t["summary"])}</span></a>' for t in M['tools'])
 for name in ['nav.html','nav-tool.html']:
  rel='assets/partials/'+name;text=(ROOT/rel).read_text();text=re.sub(r'(<div class="nav-drop-panel" role="menu">).*?(\n\s*</div>)',lambda m:m[1]+'\n'+menu+m[2],text,flags=re.S);write(rel,text.replace('>Journal</a>','>Blog</a>'))
 rel='index.html';text=(ROOT/rel).read_text()
 start=text.index('<div class="tools-dock-row">');end=text.index('\n      </div>\n    </section>',start)
 # Region includes the tool-row closing div but not the outer container.
 text=text[:start]+'<div class="tools-dock-row">\n'+tool_cards(True)+'\n</div>\n<p class="tools-directory-link"><a href="/tools/">Explore all pilot tools →</a></p>'+text[end:];write(rel,text)
 # Keep sitemap lastmod values; add/remove only canonical page membership.
 sitemap=ROOT/'sitemap.xml';ET.register_namespace('', 'http://www.sitemaps.org/schemas/sitemap/0.9');tree=ET.parse(sitemap);root=tree.getroot();ns='{http://www.sitemaps.org/schemas/sitemap/0.9}'
 allowed={ORIGIN+p['path'] for p in M['pages'] if p['indexable']};seen=set()
 for url in list(root):
  loc=url.find(ns+'loc')
  if loc is None or loc.text not in allowed:root.remove(url)
  else:seen.add(loc.text)
 for url in sorted(allowed-seen):entry=ET.SubElement(root,ns+'url');ET.SubElement(entry,ns+'loc').text=url
 ET.indent(tree,space='  ');write('sitemap.xml','<?xml version="1.0" encoding="UTF-8"?>\n'+ET.tostring(root,encoding='unicode')+'\n')
 # Search index contains public article metadata only, not personal/tool state.
 rows=[]
 stage_memberships={}
 for hub,stage_label in [('private-pilot','Student pilot'),('instrument-rating','Instrument'),('commercial-pilot','Commercial'),('multi-engine-rating','Commercial'),('cfi','CFI'),('flight-training-costs','Exploring')]:
  hub_file=ROOT/'learn'/hub/'index.html'
  if hub_file.exists():
   for linked in re.findall(r'href="(/learn/[^"#]+/)"',hub_file.read_text()):
    if len(linked.strip('/').split('/'))>2:stage_memberships.setdefault(linked,set()).add(stage_label)
 for p in M['pages']:
  if p['kind']!='article' or not p['indexable']:continue
  category=p['path'].split('/')[2] if p['path'].startswith('/learn/') else ('blog' if p['path'].startswith('/blog/') else 'cfi')
  stage='CFI' if category in ['cfi','career-and-cfi'] or p['path'].startswith('/simply-endorsed/') else 'Instrument' if category in ['instrument-rating','ifr-procedures'] else 'Commercial' if category in ['commercial-pilot','multi-engine-rating','pilot-careers'] else 'Exploring' if category in ['flight-training-costs','aircraft-ownership','blog'] else 'Student pilot'
  rows.append({'title':p['title'].split(' | ')[0],'description':p['description'],'path':p['path'],'category':category,'categoryLabel':M['identities'][p['identity']]['label'].replace(' Guides',''),'stage':stage,'stages':sorted(stage_memberships.get(p['path'],{stage}))})
 write('assets/library-index.json',json.dumps(rows,ensure_ascii=False,separators=(',',':'))+'\n')
 print(('Drift' if args.check else 'Updated'),len(set(drift)),'files')
 if args.check and drift:print('\n'.join(sorted(set(drift))[:20]));return 1
 return 0
if __name__=='__main__':sys.exit(main())
