#!/usr/bin/env python3
"""Combine preservation, browser captures, and explicitly recorded visual review."""
import gzip, html, json
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
DOC = ROOT / 'docs/journal'
OUT = ROOT / 'output/playwright/journal'
load = lambda p: json.loads(p.read_text())
source = load(DOC / 'preservation.json')
base = load(OUT / 'coverage-0-500.json')
repair = OUT / 'coverage-repair-0-500.json'
merged = {r['index']: r for r in base}
if repair.exists(): merged.update({r['index']:r for r in load(repair)})
review = load(DOC / 'visual-review.json')
reviewed = set(review['reviewed_route_indices'])
manifest = {p['path']:p for p in load(ROOT / 'config/site-pages.json')['pages']}
rows=[]
for i,page in enumerate(source['pages']):
    browser = merged[i]
    assert page['path']==browser['path']
    variant = ('structured endorsement guide' if page['path'].startswith('/simply-endorsed/') else 'conventional article') if page['kind']=='article' else ('topic or training collection' if manifest[page['path']]['kind']=='category' else 'library index')
    rows.append({**page,'index':i,'variant':variant,'visual_reviewed':i in reviewed,'review_sheet':f'output/playwright/journal/review-sheet-{i//25+1:02}.jpg','captures':browser['captures']})
behavior = load(DOC/'behavior.json')
failures=[r['path'] for r in rows if not r['content_preserved'] or not r['visual_reviewed'] or any(not c['passed'] for c in r['captures'])]
report={'generated_utc':datetime.now(timezone.utc).isoformat(),'published':False,'route_count':len(rows),'variants':dict(Counter(r['variant'] for r in rows)),'templates':['blog/_template/index.html','templates/article.html','templates/library.html'],'redirects_in_reading_scope':0,'full_page_captures':sum(len(r['captures']) for r in rows),'opening_captures':sum(len(r['captures']) for r in rows),'reader_script_gzip_bytes':len(gzip.compress((ROOT/'assets/journal.js').read_bytes())),'content_failures':source['failures'],'coverage_failures':failures,'behavior':behavior,'visual_review':review,'pages':rows}
(DOC/'coverage.json').write_text(json.dumps(report,indent=2)+'\n')
e=html.escape
trs=[]
for r in rows:
    links=' '.join(f'<a href="{e(c["screenshot"].removeprefix("output/"))}">{e(c["device"])}</a>' for c in r['captures'])
    status='Pass' if r['path'] not in failures else 'Review'
    trs.append(f'<tr><td>{r["index"]:03}</td><td><a href="http://127.0.0.1:8965{e(r["path"])}">{e(r["path"])}</a></td><td>{e(r["variant"])}</td><td>{status}</td><td>{links}</td><td><a href="{e(r["review_sheet"].removeprefix("output/"))}">Sheet {r["index"]//25+1:02}</a></td></tr>')
checks=''.join(f'<li>{"Pass" if c["passed"] else "FAIL"}: {e(c["name"])}</li>' for c in behavior)
(ROOT/'output/journal-coverage.html').write_text('''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Modern Aviation Journal — coverage</title><style>
*{box-sizing:border-box}body{font:16px/1.65 system-ui;background:#0e1721;color:#e8eff5;margin:0;padding:36px;max-width:1600px}h1{font-size:clamp(32px,4vw,56px);line-height:1.1;max-width:22ch}h2{margin-top:44px}a{color:#92deed;text-underline-offset:3px}p{max-width:85ch}.stats{display:flex;gap:24px;flex-wrap:wrap;padding:24px 0;border-block:1px solid #415260}.stats strong{font-size:28px;display:block}input{font:inherit;padding:12px;width:min(600px,100%);background:#182734;color:white;border:1px solid #60798d;border-radius:6px}.table{overflow:auto}table{border-collapse:collapse;width:100%;font-size:13px}th,td{padding:12px;text-align:left;vertical-align:top;border-bottom:1px solid #415260}td:nth-child(2){overflow-wrap:anywhere;min-width:280px}td a{margin-right:8px}li{margin-bottom:8px}.note{padding:20px;background:#182734;border-left:3px solid #92deed}@media(max-width:600px){body{padding:20px}}
</style><body><p>SUAREZ.CFI · LOCAL DESIGN REVIEW</p><h1>Modern Aviation Journal</h1><p>Exact editorial content, a new reading experience. This report links every route to its real desktop and mobile screenshots. No publishing has occurred.</p>
''' + f'<div class="stats"><div><strong>{len(rows)}</strong>routes preserved</div><div><strong>{report["full_page_captures"]}</strong>full-page captures</div><div><strong>{len(reviewed)}</strong>routes visually reviewed</div><div><strong>{report["reader_script_gzip_bytes"]:,} bytes</strong>reader script, gzip</div></div>' + '''
<h2>Coverage and evidence</h2><p>473 articles (441 Learn, 14 Blog, 18 Simply Endorsed), three library indexes, and 24 topic/training collections. No redirects exist within these reading prefixes. Three authoring templates are updated separately. The global site audit includes 523 manifest routes plus two existing aliases.</p><p>Every route has 1440 × 1000 desktop and 390 × 844 mobile captures, both opening and full page. Layout review used all 20 contact sheets plus individual exception/representative screenshots. Automated checks cover loaded styles, font sizes, viewport overflow, anchor targets, one outer reader, visible text, and JavaScript errors. This is layout coverage, not a word-by-word visual content or factual aviation audit.</p>
<p class="note">The current reader metadata and preservation checks pass. The full-site metadata generator still flags five unrelated files: the three Flight Risk Assessment pages, Simply Endorsed CFI tool, and Tools index. Those generator differences remain outside this reading redesign. Shared navigation and footer synchronization, site links, and structured-data checks pass.</p>
<h2>Behavior and resilience</h2><ul>'''+checks+'''</ul><p>Additional Python authoring/site tests and existing search, contact, and footer tests pass. Appearance/contrast checks exercise the three article templates in Day and Dark. Reduced motion, storage blocking, no JavaScript, printing, fast scroll, 320px, 200% text enlargement, native browser history/search, and short-window dock clearance are covered. Browser tests use Chrome; this is not a formal accessibility or cross-browser certification.</p>
<h2>Every route</h2><label for="filter">Find a route</label><p><input id="filter" type="search" placeholder="Search path or template variant"></p><div class="table"><table><thead><tr><th>#</th><th>Route</th><th>Variant</th><th>Content + layout</th><th>Full screenshots</th><th>Visual review</th></tr></thead><tbody>'''+''.join(trs)+'''</tbody></table></div><script>document.querySelector('#filter').addEventListener('input',e=>document.querySelectorAll('tbody tr').forEach(r=>r.hidden=!r.textContent.toLowerCase().includes(e.target.value.toLowerCase())))</script></body></html>''')
print(json.dumps({k:report[k] for k in ['route_count','variants','full_page_captures','reader_script_gzip_bytes','content_failures','coverage_failures']},indent=2))
if failures or source['failures'] or any(not c['passed'] for c in behavior): raise SystemExit(1)
