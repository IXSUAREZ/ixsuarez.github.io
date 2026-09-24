#!/usr/bin/env python3
"""Render the public tool catalog and compact homepage entries from one source."""
from pathlib import Path
import json,html,re,argparse
ROOT=Path(__file__).resolve().parents[1]
def data(): return json.loads((ROOT/'config/tool-catalog.json').read_text())
def E(s): return html.escape(str(s),quote=True)
def tools_main():
 d=data()
 filters='<button type="button" data-catalog-filter="all" aria-pressed="true">All tools</button>'+''.join(f'<button type="button" data-catalog-filter="{E(g["id"])}" aria-pressed="false">{E(g["name"])}</button>' for g in d['groups'])
 directory=''.join(f'<a href="{E(t["path"])}" data-cta-id="directory-{E(t["id"])}"><img src="/assets/identities/{E(t["id"])}/logo.png" alt="" width="40" height="40" loading="lazy"><span><strong>{E(t["name"])}</strong><small>{E(t["short"])}</small></span><span aria-hidden="true">↗</span></a>' for t in d['tools'])
 rail=''.join(f'<button type="button" class="orbit-app" data-orbit-app="{E(t["id"])}" aria-label="Select {E(t["name"])}" aria-pressed="false"><span class="orbit-icon"><img src="/assets/identities/{E(t["id"])}/logo.png" alt="" width="64" height="64" draggable="false"></span><span class="orbit-name">{E(t["name"])}</span></button>' for t in d['tools'])
 return f'''<main id="main-content" class="tools-experience">
 <header class="tools-intro"><div><p class="tools-eyebrow">THE SUAREZCFI TOOLKIT</p><h1>A tool for your next step.</h1></div><p>Plan. Practice. Explore.<br>Seven free apps, built by your instructor.</p></header>
 <section class="orbit-catalog" aria-label="Pilot tools">
 <div class="catalog-filters" role="group" aria-label="Filter tools by purpose" hidden>{filters}</div>
 <div class="orbit-experience" hidden>
 <article class="app-stage" aria-labelledby="stage-title">
 <div class="stage-copy"><div class="stage-identity"><img id="stage-icon" alt="" width="64" height="64"><div><p id="stage-group" class="tools-eyebrow"></p><h2 id="stage-title"></h2></div></div><p id="stage-purpose"></p><p id="stage-description"></p><p id="stage-compatibility"></p><a id="stage-open" class="stage-open" href="/tools/">Open app <span aria-hidden="true">↗</span></a></div>
 </article>
 <div class="orbit-browser"><div class="orbit-rail" role="group" aria-label="Choose an app" aria-describedby="orbit-hint">{rail}</div><div class="orbit-controls"><button type="button" data-orbit-step="-1" aria-label="Previous app">←</button><p id="orbit-position" role="status" aria-live="polite" aria-atomic="true"></p><button type="button" data-orbit-step="1" aria-label="Next app">→</button></div><p id="orbit-hint">Choose an app, or swipe to explore.</p></div>
 </div>
 <details class="all-apps" open><summary>All apps <span>7 tools</span></summary><div class="all-apps-list">{directory}</div></details>
 <p class="catalog-guide-link">Looking for a lesson? <a href="/learn/">Browse the aviation library →</a></p>
 </section><script type="application/json" id="tool-catalog-data">{json.dumps(d,ensure_ascii=False).replace('<',chr(92)+'u003c')}</script></main>'''
def home_cards():
 # Keep the home Hangar focused; the directory still renders every public tool.
 featured={
  'part-61-calculator':'Map your training requirements and see what comes next.',
  'flight-risk-assessment':'Review conditions and risks before a flight.',
  'pilotsolve':'Work through common flight calculations.',
 }
 tools={t['id']:t for t in data()['tools']}
 return '<div class="home-tool-grid">'+''.join(f'<a class="home-tool-entry" href="{E(tools[id]["path"])}" data-cta-id="home-tools-{E(id)}"><img src="/assets/identities/{E(id)}/logo.png" alt="" width="52" height="52" loading="lazy"><span><strong>{E(tools[id]["name"])}</strong><span>{E(description)}</span></span><span aria-hidden="true">↗</span></a>' for id,description in featured.items())+'</div>'
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
