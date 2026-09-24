#!/usr/bin/env python3
"""Check shared footer coverage; optional pre-rollout snapshot proves isolation."""
import argparse, hashlib, importlib.util, json, re
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
spec=importlib.util.spec_from_file_location('chrome',ROOT/'scripts/sync-chrome.py')
chrome=importlib.util.module_from_spec(spec);spec.loader.exec_module(chrome)

def outside(text):
    text=re.sub(r'^[ \t]*<!-- /?site-footer -->\n?', '',text,flags=re.M)
    return re.sub(r'<footer\b[^>]*class="[^"]*site-footer[^\"]*"[^>]*>.*?</footer>|<footer>\s*<div class="container">.*?</footer>', '<FOOTER>',text,flags=re.S)

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--baseline');ap.add_argument('--output');args=ap.parse_args()
    baseline=json.loads(Path(args.baseline).read_text()) if args.baseline else {}
    pages=[];errors=[]
    for p in chrome.iter_pages(footer_only=True):
        text=p.read_text();rel=p.relative_to(ROOT).as_posix()
        if 'site-footer-v2' not in text:
            if rel in baseline and '<footer' in baseline[rel]:
                pages.append({'path':rel,'single_shared_footer':False})
                errors.append(rel+': missing redesigned footer')
            continue
        blocks=re.findall(r'<footer\b[^>]*class="[^"]*site-footer-v2[^\"]*"[^>]*>.*?</footer>',text,re.S)
        checks={'single_shared_footer':len(blocks)==1}
        if len(blocks)==1:
            block=blocks[0]
            checks.update(canonical=[l.strip() for l in chrome.render_footer(block,rel).splitlines()]==[l.strip() for l in block.splitlines()],explicit_slot=block.count('<!-- footer-notes -->')==1,static_groups=block.count('class="site-footer-group" open')==2,no_duplicate_credit='footer-designer' not in block)
            links=re.findall(r'<a\b[^>]*>',block)
            checks['social_security']=all('target="_blank"' in link and 'rel="me noopener"' in link and 'aria-label=' in link for link in links if 'footer-social-' in link)
            if rel in baseline:
                before=outside(baseline[rel]);after=outside(text)
                # Marker insertion may remove blank indentation around a footer, but not content.
                checks['outside_unchanged']=before==after
                if before!=after:
                    clean=lambda value: re.sub(r'(/simply-endorsed/js/workspace(?:-model)?\.(?:css|js)\?v=)[^\"\s]+',r'\1VERSION',value)
                    if clean(before)==clean(after):
                        checks.pop('outside_unchanged')
                        checks['outside_unchanged_except_concurrent_workspace_asset_versions']=True
        pages.append({'path':rel,**checks})
        errors.extend(rel+': '+k for k,v in checks.items() if not v)
    result={'pages':len(pages),'passed':len(pages)-len({e.split(':')[0] for e in errors}),'errors':errors,'coverage':pages}
    if args.output:Path(args.output).write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps({k:v for k,v in result.items() if k!='coverage'},indent=2))
    return bool(errors)
if __name__=='__main__':raise SystemExit(main())
