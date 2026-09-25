#!/usr/bin/env python3
"""Check shared materials and category-label pairs, not full rendered accessibility."""
from pathlib import Path
from hashlib import sha256
import json,re
root=Path(__file__).resolve().parents[1]
css=(root/'assets/avionics.css').read_text()
base=re.search(r':root\{\s*--g-bg:.*?\n\}',css,re.S)[0]
dark=re.search(r'html\[data-gold-mode=dark\]\{--g-bg:.*?\}',css,re.S)[0]
def tokens(s):return dict(re.findall(r'(--g-[\w-]+):([^;]+)',s))
def rgb(s):return [int(s[i:i+2],16)/255 for i in (1,3,5)]
def luminance(c):return sum(v*w for v,w in zip([x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4 for x in c],[.2126,.7152,.0722]))
def ratio(a,b):
 lo,hi=sorted([luminance(a),luminance(b)]);return (hi+.05)/(lo+.05)
checks=[]
mode_tokens={'day':tokens(base),'dark':tokens(base)|tokens(dark)}
for mode,t in mode_tokens.items():
 for fg in ['--g-ink','--g-muted','--g-accent']:
  for bg in ['--g-bg','--g-surface','--g-raised','--g-well']:
   checks.append(dict(mode=mode,foreground=fg,background=bg,ratio=round(ratio(rgb(t[fg]),rgb(t[bg])),3),required=4.5))
 checks.append(dict(mode=mode,foreground='--g-key-ink',background='--g-mid (text selection)',ratio=round(ratio(rgb(t['--g-key-ink']),rgb(t['--g-mid'])),3),required=4.5))
 # Error text must remain readable on every canonical opaque surface.
 error_scope=re.search(r':root\[data-suarez-theme="light"\]\s*\{([^}]+)',css)[1] if mode=='day' else css.split('}',1)[0]
 error=re.search(r'--av-error:(#[0-9a-f]{6})',error_scope)[1]
 for bg in ['--g-bg','--g-surface','--g-raised','--g-well']:
  checks.append(dict(mode=mode,foreground='--av-error',background=bg,ratio=round(ratio(rgb(error),rgb(t[bg])),3),required=4.5))
 # Bound any underlying sRGB color by black/white luminance extremes.
 glass=[float(x) for x in re.findall(r"[\d.]+",t['--g-glass'])]
 for fg in ['--g-ink','--g-muted','--g-accent']:
  backgrounds=[[(channel*glass[3]+under*(1-glass[3]))/255 for channel in glass[:3]] for under in (0,255)]
  checks.append(dict(mode=mode,foreground=fg,background='glass over black/white bounds',ratio=round(min(ratio(rgb(t[fg]),b) for b in backgrounds),3),required=4.5))
 # Border contrast for the actual solid input surface, not decorative separators.
 control=re.search(r'html\[data-gold-mode='+mode+r'\]\{--g-control-line:(#[0-9a-f]+)',css)[1]
 checks.append(dict(mode=mode,foreground='--g-control-line',background='--g-raised',ratio=round(ratio(rgb(control),rgb(t['--g-raised'])),3),required=3))
 stops=[rgb(x) for x in re.findall(r'#[0-9a-f]{6}',t['--g-gold'])]
 samples=[[a+(b-a)*i/100 for a,b in zip(start,end)] for start,end in zip(stops,stops[1:]) for i in range(101)]
 checks.append(dict(mode=mode,foreground='--g-key-ink',background='gold gradient, 101 sRGB samples per segment',ratio=round(min(ratio(rgb(t['--g-key-ink']),s) for s in samples),3),required=4.5))
palette_source=(root/'simply-endorsed/js/workspace-model.js').read_text()
palette_block=re.search(r'const categoryPresentation = \{(.*?)\n  \};',palette_source,re.S)
if not palette_block: raise SystemExit('Simply Endorsed category palette not found')
categories=re.findall(r'"([\w-]+)": \["(#[0-9a-f]{6})", "(#[0-9a-f]{6})",',palette_block[1])
if len(categories)!=13: raise SystemExit(f'Expected 13 Simply Endorsed categories; found {len(categories)}')
workspace_css=(root/'simply-endorsed/js/workspace.css').read_text()
if not re.search(r'html\[data-gold-mode="dark"\] body\.se-redesigned #se-workspace \.se-path:hover\s*\{background:var\(--se-surface\);border-color:var\(--g-accent\)\}',workspace_css):
 raise SystemExit('Night category-card hover no longer retains its contrast-safe solid surface')
for name,fill,bright in categories:
 checks.append(dict(mode='category',foreground='white text on '+name,background=fill,ratio=round(ratio(rgb('#ffffff'),rgb(fill)),3),required=4.5))
 checks.append(dict(mode='day',foreground=name+' label',background='--g-surface',ratio=round(ratio(rgb(fill),rgb(mode_tokens['day']['--g-surface'])),3),required=4.5))
 checks.append(dict(mode='day hover',foreground=name+' label',background='--g-raised',ratio=round(ratio(rgb(fill),rgb(mode_tokens['day']['--g-raised'])),3),required=4.5))
 checks.append(dict(mode='dark',foreground=name+' label',background='--g-surface',ratio=round(ratio(rgb(bright),rgb(mode_tokens['dark']['--g-surface'])),3),required=4.5))
 checks.append(dict(mode='dark hover',foreground=name+' label',background='--g-surface with gold edge',ratio=round(ratio(rgb(bright),rgb(mode_tokens['dark']['--g-surface'])),3),required=4.5))
for c in checks:c['pass']=c['ratio']>=c['required']
report={'scope':'Canonical opaque text, input-border and base metallic-gradient pairs plus Simply Endorsed category text on filled cards and normal/hover Day/Night reading surfaces. Night hover retains the solid surface and adds a gold edge. Includes sRGB glass compositing over black/white bounds, shared error text and text-selection colors. Excludes edge shadows, other app overrides, diagrams, disabled states and full rendered accessibility.','stylesheet_sha256':sha256(css.encode()).hexdigest(),'category_palette_sha256':sha256(palette_source.encode()).hexdigest(),'category_stylesheet_sha256':sha256(workspace_css.encode()).hexdigest(),'checks':checks}
(root/'docs/design/contrast-coverage.json').write_text(json.dumps(report,indent=2)+'\n')
print(f"{sum(c['pass'] for c in checks)}/{len(checks)} material and category contrast pairs pass; minimum text ratio {min(c['ratio'] for c in checks if c['required']==4.5):.2f}:1")
raise SystemExit(any(not c['pass'] for c in checks))
