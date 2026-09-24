#!/usr/bin/env python3
"""Build static metadata and crawlable directory from config/site-pages.json.
Run after application builds and chrome sync. --check never modifies files.
"""
import argparse,html,json,re,sys,xml.etree.ElementTree as ET,importlib.util
from hashlib import sha256
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
M=json.loads((ROOT/'config/site-pages.json').read_text());ORIGIN=M['origin']
E=lambda s:html.escape(str(s),quote=True)
spec=importlib.util.spec_from_file_location('tool_catalog',ROOT/'scripts/render-tool-catalog.py')
tool_catalog=importlib.util.module_from_spec(spec);spec.loader.exec_module(tool_catalog)
def meta(key,value,property=False):return f'<meta {"property" if property else "name"}="{key}" content="{E(value)}" />'
def head_for(p):
 base='/assets/identities/'+p['identity'];img=ORIGIN+base+'/preview.png'
 lines=[f'<title>{E(p["title"])}</title>',meta('description',p['description']),f'<link rel="canonical" href="{ORIGIN}{p["path"]}" />',meta('robots','index, follow, max-image-preview:large' if p['indexable'] else 'noindex, follow')]
 for k,v in {'type':'article' if p['kind']=='article' else 'website','url':ORIGIN+p['path'],'site_name':'SuarezCFI','title':p['title'],'description':p['description'],'image':img,'image:secure_url':img,'image:type':'image/png','image:width':'1200','image:height':'1200','image:alt':M['identities'][p['identity']]['label']+' logo','locale':'en_US'}.items():lines.append(meta('og:'+k,v,True))
 for k,v in {'card':'summary','title':p['title'],'description':p['description'],'image':img,'image:alt':M['identities'][p['identity']]['label']+' logo'}.items():lines.append(meta('twitter:'+k,v))
 if p['path']=='/':
  lines += ['<link rel="icon" type="image/x-icon" sizes="48x48" href="/favicon.ico" />','<link rel="icon" type="image/png" sizes="48x48" href="/assets/favicon-48.png" />','<link rel="icon" type="image/png" sizes="192x192" href="/assets/favicon-192.png" />','<link rel="icon" type="image/svg+xml" sizes="any" href="/assets/favicon.svg" />','<link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png" />']
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
 appearance=f'<script src="/assets/appearance.js?v={sha256((ROOT/"assets/appearance.js").read_bytes()).hexdigest()[:10]}"></script>'
 had_appearance=bool(re.search(r'<script src="/assets/appearance\.js(?:\?[^\"]*)?"></script>',head))
 prefix=appearance+'\n' if had_appearance else ''
 head=re.sub(r'\n[ \t]*\n(?:[ \t]*\n)*','\n',re.sub(r'<script src="/assets/appearance\.js(?:\?[^\"]*)?"></script>','',head)).lstrip()
 return text[:start]+'\n'+prefix+head_for(p)+'\n'+head+'\n'+text[end:]
def sync_tools_page(text):
 text=re.sub(r'<main\b[^>]*>.*?</main>',lambda _:tool_catalog.tools_main(),text,flags=re.S)
 if '/assets/tool-catalog.js' not in text:text=text.replace('</body>','<script src="/assets/tool-catalog.js" defer></script>\n</body>')
 if '/assets/tool-catalog.css' not in text:text=text.replace('</head>','<link rel="stylesheet" href="/assets/tool-catalog.css">\n</head>')
 return text
def sync_home_catalog(text):
 start=text.index('<div class="tools-dock-row">');end=text.index('\n      </div>\n    </section>',start)
 text=text[:start]+'<div class="tools-dock-row">\n'+tool_catalog.home_cards()+'\n</div>\n<p class="tools-directory-link"><a href="/tools/">Explore all pilot tools →</a></p>'+text[end:]
 if '/assets/tool-catalog.css' not in text:text=text.replace('</head>','<link rel="stylesheet" href="/assets/tool-catalog.css">\n</head>')
 return text
def blog_listing():
 posts=[p for p in M['pages'] if p['kind']=='article' and p['path'].startswith('/blog/') and p.get('editorial')]
 posts.sort(key=lambda p:(not p['editorial'].get('featured',False),-int(p['editorial']['published'].replace('-','')),p['path']))
 categories=sorted({p['editorial']['category'] for p in posts})
 def card(p,featured=False):
  e=p['editorial'];title=e.get('heading') or p['title'].split(' | ')[0];date=e['published'];read=str(e['readingMinutes'])+' min read'
  cls='blog-story blog-story--featured' if featured else 'blog-story'
  display_date=__import__('datetime').date.fromisoformat(date).strftime('%B %-d, %Y')
  return f'<a class="{cls}" href="{E(p["path"])}" data-category="{E(e["category"])}"><span class="blog-story-category">{E(e["category"])}</span><span class="blog-story-meta"><time datetime="{date}">{display_date}</time><span>{read}</span></span><h2>{E(title)}</h2><p>{E(p["description"])}</p><span class="blog-story-link">Read article <span aria-hidden="true">→</span></span></a>'
 chips='<button type="button" data-blog-category="" aria-pressed="true">All articles</button>'+''.join(f'<button type="button" data-blog-category="{E(cat)}" aria-pressed="false">{E(cat)}</button>' for cat in categories)
 featured=next((p for p in posts if p['editorial'].get('featured')),posts[0])
 listing=[p for p in posts if p is not featured]
 return f'''<section class="container blog-discovery" aria-labelledby="blog-browse-title">
 <div class="blog-featured"><span class="eyebrow">Featured article</span>{card(featured,True)}</div>
 <div class="blog-browse-head"><div><span class="eyebrow">From the blog</span><h2 id="blog-browse-title">More to explore</h2></div><p>{len(listing)} articles</p></div>
 <div class="blog-categories" role="group" aria-label="Filter articles by category">{chips}</div>
 <p id="blog-status" class="blog-status" role="status" aria-live="polite"></p>
 <div class="blog-stories">{''.join(card(p) for p in listing)}</div>
 <button id="blog-show-more" class="blog-show-more" type="button">Show more articles</button>
 <aside class="blog-reference"><div><span class="eyebrow">Reference collection</span><h2>Need an FAA endorsement?</h2><p>Browse the Simply Endorsed reference guides for certificate, solo, review, and aircraft endorsements.</p></div><a href="/simply-endorsed/blog/">Explore endorsement references <span aria-hidden="true">→</span></a></aside>
 </section>'''
def sync_blog_listing(text):
 return re.sub(r'<!-- blog-listing:start -->.*?<!-- blog-listing:end -->',lambda _: '<!-- blog-listing:start -->\n'+blog_listing()+'\n    <!-- blog-listing:end -->',text,flags=re.S)
def sync_category_content(text):
 """Put the requested article list before secondary related collections."""
 intro=re.search(r'    <section class="container section-intro" aria-labelledby="related-collections-heading">.*?</section>',text,flags=re.S)
 if not intro:return text
 grid=re.search(r'    <section class="container hub-grid track-grid" aria-label="Related guide collections">.*?</section>',text[intro.end():],flags=re.S)
 if not grid:return text
 grid_start=intro.end()+grid.start();grid_end=intro.end()+grid.end()
 articles=re.search(r'    <section class="container posts-grid" aria-label="[^"]+ articles">.*?</section>',text[grid_end:],flags=re.S)
 if not articles:return text
 article_start=grid_end+articles.start();article_end=grid_end+articles.end()
 intro_text=text[intro.start():grid_end]
 listing=text[article_start:article_end]
 heading='    <div class="container category-article-heading"><span class="eyebrow">Browse guides</span><h2>All guides in this collection</h2></div>\n'
 return text[:intro.start()]+heading+listing+'\n'+intro_text+text[article_end:]
def library_rows():
 rows=[];stage_memberships={}
 for hub,stage_label in [('private-pilot','Student pilot'),('instrument-rating','Instrument'),('commercial-pilot','Commercial'),('multi-engine-rating','Commercial'),('cfi','CFI'),('flight-training-costs','Exploring')]:
  hub_file=ROOT/'learn'/hub/'index.html'
  if hub_file.exists():
   for linked in re.findall(r'href="(/learn/[^"#]+/)"',hub_file.read_text()):
    if len(linked.strip('/').split('/'))>2:stage_memberships.setdefault(linked,set()).add(stage_label)
 for p in M['pages']:
  if p['kind']!='article' or not p['indexable'] or p['path'].startswith('/blog/'):continue
  category=p['path'].split('/')[2] if p['path'].startswith('/learn/') else 'cfi'
  stage='CFI' if category in ['cfi','career-and-cfi'] or p['path'].startswith('/simply-endorsed/') else 'Instrument' if category in ['instrument-rating','ifr-procedures'] else 'Commercial' if category in ['commercial-pilot','multi-engine-rating','pilot-careers'] else 'Exploring' if category in ['flight-training-costs','aircraft-ownership'] else 'Student pilot'
  rows.append({'title':p['title'].split(' | ')[0],'description':p['description'],'path':p['path'],'category':category,'categoryLabel':M['identities'][p['identity']]['label'].replace(' Guides',''),'stage':stage,'stages':sorted(stage_memberships.get(p['path'],{stage}))})
 return rows
def main():
 ap=argparse.ArgumentParser();ap.add_argument('--check',action='store_true');ap.add_argument('--content-only',action='store_true');args=ap.parse_args();drift=[]
 def write(rel,data):
  p=ROOT/rel
  if not p.exists() or p.read_text()!=data:
   drift.append(rel)
   if not args.check:p.parent.mkdir(parents=True,exist_ok=True);p.write_text(data)
 if args.content_only:
  rel='blog/index.html';write(rel,sync_blog_listing((ROOT/rel).read_text()))
  for page in M['pages']:
   if page['kind']=='category' and page['path'].startswith('/learn/'):
    write(page['file'],sync_category_content((ROOT/page['file']).read_text()))
  write('assets/library-index.json',json.dumps(library_rows(),ensure_ascii=False,separators=(',',':'))+'\n')
  print(('Drift' if args.check else 'Updated'),len(set(drift)),'content files')
  if args.check and drift:print('\n'.join(sorted(set(drift))));return 1
  return 0
 # Render tools once, then all heads. Always emit final content in a single pass.
 for p in M['pages']:
  file=ROOT/p['file']
  if p['path']=='/tools/':text=sync_tools_page(file.read_text())
  elif p['path']=='/blog/':text=sync_blog_listing(file.read_text())
  elif p['kind']=='category' and p['path'].startswith('/learn/'):text=sync_category_content(file.read_text())
  elif file.exists():text=file.read_text()
  else:raise RuntimeError('Missing route '+p['file'])
  write(p['file'],sync_head(text,p))
 # Keep independently built application menus linked to the same inventory.
 app_rel='assets/app-site-navigation.js';app_text=(ROOT/app_rel).read_text()
 app_items=[{'path':'/tools/','label':'All pilot tools','summary':'Explore the full collection'}]+[{k:t[k] for k in ['path','label','summary']} for t in M['tools']]
 app_text=re.sub(r'(// app-tool-links:.*?\n).*?(    // /app-tool-links)',lambda x:x[1]+'    var items = '+json.dumps(app_items,ensure_ascii=False,separators=(',',':'))+';\n'+x[2],app_text,flags=re.S)
 write(app_rel,app_text)
 # Menu inventories are generated; subsequent chrome sync distributes them.
 menu='<a href="/tools/"><strong>All pilot tools</strong><span>Explore the full collection</span></a>\n'+'\n'.join(f'<a href="{t["path"]}"><strong>{E(t["label"])}</strong><span>{E(t["summary"])}</span></a>' for t in M['tools'])
 for name in ['nav.html','nav-tool.html']:
  rel='assets/partials/'+name;text=(ROOT/rel).read_text();text=re.sub(r'(<div class="nav-drop-panel" role="menu">).*?(\n\s*</div>)',lambda m:m[1]+'\n'+menu+m[2],text,flags=re.S);write(rel,text.replace('>Journal</a>','>Blog</a>'))
 rel='index.html';text=(ROOT/rel).read_text()
 text=sync_home_catalog(text);write(rel,text)
 # Keep sitemap lastmod values; add/remove only canonical page membership.
 sitemap=ROOT/'sitemap.xml';ET.register_namespace('', 'http://www.sitemaps.org/schemas/sitemap/0.9');tree=ET.parse(sitemap);root=tree.getroot();ns='{http://www.sitemaps.org/schemas/sitemap/0.9}'
 allowed={ORIGIN+p['path'] for p in M['pages'] if p['indexable']};seen=set()
 for url in list(root):
  loc=url.find(ns+'loc')
  if loc is None or loc.text not in allowed:root.remove(url)
  else:seen.add(loc.text)
 for url in sorted(allowed-seen):entry=ET.SubElement(root,ns+'url');ET.SubElement(entry,ns+'loc').text=url
 ET.indent(tree,space='  ');write('sitemap.xml','<?xml version="1.0" encoding="UTF-8"?>\n'+ET.tostring(root,encoding='unicode')+'\n')
 # Search index contains Learn and endorsement references; Blog is editorial discovery.
 write('assets/library-index.json',json.dumps(library_rows(),ensure_ascii=False,separators=(',',':'))+'\n')
 print(('Drift' if args.check else 'Updated'),len(set(drift)),'files')
 if args.check and drift:print('\n'.join(sorted(set(drift))[:20]));return 1
 return 0
if __name__=='__main__':sys.exit(main())
