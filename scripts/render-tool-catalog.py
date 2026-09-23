#!/usr/bin/env python3
"""Render the public tool catalog and compact homepage entries from one source."""
from pathlib import Path
import json,html,re,argparse
ROOT=Path(__file__).resolve().parents[1]
def data(): return json.loads((ROOT/'config/tool-catalog.json').read_text())
def E(s): return html.escape(str(s),quote=True)
def card(t):
 return f'''<article class="catalog-card" data-tool-group="{E(t['group'])}"><div class="catalog-identity"><img src="/assets/identities/{E(t['id'])}/logo.png" alt="" width="72" height="72" loading="lazy"><div><h3>{E(t['name'])}</h3><p class="catalog-compat">{E(t['compatibility'])}</p></div></div><p class="catalog-summary">{E(t['description'])}</p><div class="catalog-actions"><button type="button" class="catalog-preview" data-tool-preview="{E(t['id'])}" hidden>Preview<span class="sr-only"> {E(t['name'])}</span></button><a class="btn btn--secondary" href="{E(t['path'])}" aria-label="Open {E(t['name'])}" data-cta-id="directory-{E(t['id'])}">Open <span aria-hidden="true">↗</span></a></div></article>'''
def tools_main():
 d=data();groups=''.join(f'<section class="catalog-group" data-catalog-group="{E(g["id"])}" aria-labelledby="group-{E(g["id"])}"><div class="catalog-group-heading"><h2 id="group-{E(g["id"])}">{E(g["name"])}</h2><span>{sum(t["group"]==g["id"] for t in d["tools"])} tools</span></div><div class="catalog-grid">'+''.join(card(t) for t in d['tools'] if t['group']==g['id'])+'</div></section>' for g in d['groups'])
 filters='<button type="button" data-catalog-filter="all" aria-pressed="true">All tools</button>'+''.join(f'<button type="button" data-catalog-filter="{E(g["id"])}" aria-pressed="false">{E(g["name"])}</button>' for g in d['groups'])
 return f'''<main id="main-content"><section class="page-hero"><div class="container"><span class="eyebrow">Free tools · built by your instructor</span><h1>A tool for your next step.</h1><p>Plan your training, study a concept, or prepare for a flight.</p></div></section><div class="container catalog"><div class="catalog-filters" role="group" aria-label="Filter tools by purpose" hidden>{filters}</div><p class="catalog-count" role="status">7 free pilot tools</p>{groups}<p class="catalog-guide-link">Looking for a lesson? <a href="/learn/">Browse the aviation library →</a></p></div><dialog class="tool-preview-dialog" aria-labelledby="preview-title"><div class="preview-heading"><div class="preview-identity"><img id="preview-icon" alt="" width="64" height="64"><div><p class="preview-kicker">Pilot tools</p><h2 id="preview-title"></h2></div></div><button class="preview-close" type="button" aria-label="Close preview">Close</button></div><p id="preview-description"></p><p id="preview-compatibility"></p><div id="preview-images" class="preview-images"></div><ul id="preview-features"></ul><a class="btn btn--primary" id="preview-open" href="/tools/">Open tool</a></dialog><script type="application/json" id="tool-catalog-data">{json.dumps(d,ensure_ascii=False).replace('<',chr(92)+'u003c')}</script></main>'''
def home_cards():
 return '<div class="home-tool-grid">'+''.join(f'<a class="home-tool-entry" href="{E(t["path"])}" data-cta-id="home-tools-{E(t["id"])}"><img src="/assets/identities/{E(t["id"])}/logo.png" alt="" width="52" height="52" loading="lazy"><span><strong>{E(t["name"])}</strong><span>{E(t["short"])}</span></span><span aria-hidden="true">↗</span></a>' for t in data()['tools'])+'</div>'
def transform(path):
 s=path.read_text()
 if path.name=='index.html' and path.parent.name=='tools':
  s=re.sub(r'<main\b[^>]*>.*?</main>',lambda _:tools_main(),s,flags=re.S)
  if '/assets/tool-catalog.js' not in s:s=s.replace('</body>','<script src="/assets/tool-catalog.js" defer></script>\n</body>')
 else:
  a=s.index('<div class="tools-dock-row">');b=s.index('\n      </div>\n    </section>',a)
  s=s[:a]+'<div class="tools-dock-row">\n'+home_cards()+'\n</div>\n<p class="tools-directory-link"><a href="/tools/">Explore all pilot tools →</a></p>'+s[b:]
 if '/assets/tool-catalog.css' not in s:s=s.replace('</head>','<link rel="stylesheet" href="/assets/tool-catalog.css">\n</head>')
 # Generated pages include each stylesheet once.
 seen=set()
 def once(m):
  href=m[1]
  if href in seen:return ''
  seen.add(href);return m[0]
 s=re.sub(r'<link rel="stylesheet" href="([^"]+)"[^>]*>',once,s)
 return s

def apply(check=False):
 changed=[]
 for rel in ['tools/index.html','index.html']:
  p=ROOT/rel;s=transform(p)
  if s!=p.read_text():
   changed.append(rel)
   if not check:p.write_text(s)
 return changed
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--check',action='store_true');a=p.parse_args();changed=apply(a.check);print('Catalog:',changed or 'current');raise SystemExit(bool(a.check and changed))
