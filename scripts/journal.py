#!/usr/bin/env python3
"""Idempotent, content-preserving journal presentation and inventory.

Usage: journal.py snapshot | apply | check
Uses only Python's standard library. Does not regenerate editorial content.
"""
import argparse
import hashlib
import html
import json
import re
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REPORT = ROOT / 'docs/journal'
GROUPS = ('learn', 'blog', 'simply-endorsed/blog')
VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}


class Node:
    def __init__(self, tag='', attrs=(), parent=None, start=0, open_end=0):
        self.tag, self.attrs, self.parent = tag, dict(attrs), parent
        self.start, self.open_end, self.end, self.close_start = start, open_end, open_end, open_end
        self.children = []

    def has(self, name):
        return name in self.attrs.get('class', '').split()

    def text(self):
        return ''.join(c if isinstance(c, str) else c.text() for c in self.children)

    def walk(self):
        for child in self.children:
            if isinstance(child, Node):
                yield child
                yield from child.walk()

    def ancestor(self, predicate):
        node = self.parent
        while node:
            if predicate(node):
                return node
            node = node.parent


class Document(HTMLParser):
    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.source = source
        self.lines = [0]
        self.lines.extend(m.end() for m in re.finditer('\n', source))
        self.root = Node()
        self.stack = [self.root]
        self.feed(source)
        self.close()

    def source_offset(self):
        row, col = self.getpos()
        return self.lines[row - 1] + col

    def handle_starttag(self, tag, attrs):
        start = self.source_offset()
        node = Node(tag, attrs, self.stack[-1], start, start + len(self.get_starttag_text()))
        self.stack[-1].children.append(node)
        if tag not in VOID:
            self.stack.append(node)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID:
            self.stack.pop()

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, 0, -1):
            if self.stack[i].tag == tag:
                node = self.stack[i]
                node.close_start = self.source_offset()
                node.end = self.source.find('>', self.source_offset()) + 1
                del self.stack[i:]
                break

    def handle_data(self, data):
        self.stack[-1].children.append(data)


def compact(text):
    return ' '.join(text.split())


def nodes(source):
    return list(Document(source).root.walk())


def kind(source):
    parsed = nodes(source)
    if any(n.tag == 'meta' and n.attrs.get('http-equiv', '').lower() == 'refresh' for n in parsed):
        return 'redirect'
    return 'article' if any(n.has('article-header') for n in parsed) else 'library'


def paths():
    for group in GROUPS:
        for path in sorted((ROOT / group).rglob('*.html')):
            if not any(p.startswith(('.', '_')) for p in path.relative_to(ROOT).parts):
                yield path


def signature(source):
    parsed = nodes(source)
    # Shared navigation/footer are maintained independently. Preservation is
    # scoped to the complete editorial main plus global metadata and schema.
    original = [n for n in parsed if (n.tag == 'main' or n.ancestor(lambda a: a.tag == 'main') or n.tag in {'meta','link','script','title'}) and 'data-journal-ui' not in n.attrs and not n.ancestor(lambda a: 'data-journal-ui' in a.attrs)]
    def get(tag):
        return [n for n in original if n.tag == tag]
    # Block ordering also verifies citations remain in the same adjacent prose.
    blocks = [(n.tag, compact(n.text())) for n in original if n.tag in {'p', 'li', 'h1', 'h2', 'h3', 'h4', 'td', 'th', 'blockquote', 'figcaption', 'summary'}]
    visible = []
    for n in original:
        if n.tag in {'script', 'style'} or n.ancestor(lambda a: a.tag in {'script', 'style'}):
            continue
        visible.extend(compact(c) for c in n.children if isinstance(c, str) and compact(c))
    return {
        'text': visible,
        'blocks': blocks,
        'links': [(n.attrs.get('href'), compact(n.text()), n.attrs.get('data-cta-id')) for n in get('a')],
        'headings': [(n.tag, compact(n.text()), n.attrs.get('id')) for n in original if re.fullmatch('h[1-6]', n.tag)],
        'tables': [source[n.start:n.end] for n in get('table')],
        'media': [(n.tag, n.attrs) for n in original if n.tag in {'img', 'source', 'video', 'iframe'}],
        'metadata': [n.attrs for n in get('meta')] + [n.attrs for n in get('link') if n.attrs.get('rel') == 'canonical'],
        'structured_data': [n.text() for n in get('script') if n.attrs.get('type') == 'application/ld+json'],
    }


def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, ensure_ascii=False).encode()).hexdigest()


def snapshot():
    target = REPORT / 'baseline.json'
    if target.exists():
        raise SystemExit('Baseline already exists; refusing to replace preservation evidence.')
    REPORT.mkdir(parents=True, exist_ok=True)
    rows = {}
    for path in paths():
        source = path.read_text()
        rows[str(path.relative_to(ROOT))] = {'kind': kind(source), 'sha256': hashlib.sha256(source.encode()).hexdigest(), 'signature': signature(source)}
    target.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + '\n')
    print(f'Snapshotted {len(rows)} routes: {dict(Counter(r["kind"] for r in rows.values()))}')


def rail(headings):
    links = ''.join(f'<li data-level="{level}"><a href="#{html.escape(ident, quote=True)}"><span class="journal-chapter-number" aria-hidden="true">{i:02}</span><span>{html.escape(title)}</span></a></li>' for i, (ident, title, level) in enumerate(headings, 1))
    chapters = f'<details class="journal-chapters" open><summary>In this article <span aria-hidden="true">{len(headings):02}</span></summary><nav aria-label="Article chapters"><ol>{links}</ol></nav></details>' if links else ''
    return f'''<aside class="journal-rail" data-journal-ui aria-label="Reading tools">
{chapters}
<details class="journal-settings" hidden><summary>Reading settings</summary><div class="journal-settings-inner">
<fieldset><legend>Text size</legend><div class="journal-size-options"><button type="button" data-reader-size="standard" aria-pressed="true">Standard</button><button type="button" data-reader-size="large" aria-pressed="false">Large</button><button type="button" data-reader-size="larger" aria-pressed="false">Larger</button></div></fieldset>
<label class="journal-motion-label"><input type="checkbox" data-reader-motion checked> Gentle transitions</label>
<p class="journal-motion-note">Your device’s reduced-motion setting is always respected.</p></div></details>
<p class="journal-position" hidden>Reading progress <span>0%</span></p>
</aside>'''


def enhance(source, page_kind=None):
    page_kind = page_kind or kind(source)
    if page_kind == 'redirect':
        return source
    # Rebuild the contents list from headings on every pass, including when an
    # author adds sections to an already enhanced page.
    if page_kind == 'article':
        existing = 'class="journal-layout"' in source
        parsed = nodes(source)
        header = next(n for n in parsed if n.has('article-header'))
        article = header.ancestor(lambda n: n.tag == 'article')
        if not article:
            raise ValueError('Article header has no outer article')
        # Cards remain part of the one outer reader. Their headings are valid
        # subsection destinations, alongside conventional article headings.
        headings = [n for n in article.walk() if re.fullmatch('h[2-6]', n.tag)]
        used = {n.attrs['id'] for n in parsed if 'id' in n.attrs}
        edits, contents = [], []
        for heading in headings:
            ident = heading.attrs.get('id')
            if not ident:
                stem = 'journal-' + (re.sub(r'[^a-z0-9]+', '-', compact(heading.text()).lower()).strip('-') or 'section')
                ident, count = stem, 2
                while ident in used:
                    ident, count = f'{stem}-{count}', count + 1
                used.add(ident)
                edits.append((heading.open_end - 1, f' id="{ident}"'))
            contents.append((ident, compact(heading.text()), heading.tag[1]))
        if not existing:
            edits.extend([(article.start, '<!-- journal:start -->\n<div class="journal-layout">\n' + rail(contents) + '\n'), (article.end, '\n</div>\n<!-- journal:end -->')])
        for offset, insertion in sorted(edits, reverse=True):
            source = source[:offset] + insertion + source[offset:]
        if existing:
            source = re.sub(r'<aside class="journal-rail".*?</aside>', lambda _: rail(contents), source, count=1, flags=re.S)
        else:
            source = source.replace('<main', '<div class="journal-progress" data-journal-ui aria-hidden="true"><span></span></div>\n<main', 1)
    def body(match):
        tag = match[0]
        cls = re.search(r'class="([^"]*)"', tag)
        existing = cls[1].split() if cls else []
        existing = [c for c in existing if c not in {'journal-article', 'journal-library'}]
        existing.append('journal-' + page_kind)
        if cls:
            return tag[:cls.start(1)] + ' '.join(existing) + tag[cls.end(1):]
        return tag[:-1] + ' class="' + ' '.join(existing) + '">'
    source = re.sub(r'<body\b[^>]*>', body, source, count=1)
    source = re.sub(r'[ \t]*<(?:link|script)\b[^>]*(?:href|src)="/assets/journal\.(?:css|js)[^"]*"[^>]*>(?:</script>)?\n?', '', source)
    css = hashlib.sha256((ROOT / 'assets/journal.css').read_bytes()).hexdigest()[:10]
    js = hashlib.sha256((ROOT / 'assets/journal.js').read_bytes()).hexdigest()[:10]
    source = source.replace('</head>', f'  <link rel="stylesheet" href="/assets/journal.css?v={css}">\n  <script src="/assets/journal.js?v={js}" defer></script>\n</head>', 1)
    return source


def apply():
    changed = 0
    public = list(paths())
    templates = [(ROOT / 'blog/_template/index.html', 'article'), (ROOT / 'templates/article.html', 'article'), (ROOT / 'templates/library.html', 'library')]
    for path, page_kind in [(p, None) for p in public] + templates:
        source = path.read_text()
        updated = enhance(source, page_kind)
        if source != updated:
            # Local preview requests must never see a half-written document.
            temporary = path.with_name(path.name + '.journal-tmp')
            temporary.write_text(updated)
            temporary.chmod(path.stat().st_mode)
            temporary.replace(path)
            changed += 1
    print(f'Journal: {changed} files updated')


def check():
    baseline = json.loads((REPORT / 'baseline.json').read_text())
    rows, failures = [], []
    current = {str(p.relative_to(ROOT)): p for p in paths()}
    if set(current) != set(baseline):
        failures.append('Route inventory changed')
    for rel, before in baseline.items():
        path = current.get(rel)
        if not path:
            failures.append(f'{rel}: missing'); continue
        source = path.read_text()
        after = signature(source)
        # Newly assigned anchors are allowed; all preexisting anchors are exact.
        for old, new in zip(before['signature']['headings'], after['headings']):
            if old[2] is None:
                new_index = after['headings'].index(new)
                after['headings'][new_index] = (new[0], new[1], None)
        different = [key for key in after if digest(after[key]) != digest(before['signature'][key])]
        if different:
            failures.append(f'{rel}: content drift in {different}')
        if before['kind'] != 'redirect' and enhance(source, before['kind']) != source:
            failures.append(f'{rel}: stale/non-idempotent enhancement')
        rows.append({'path': '/' + rel.removesuffix('index.html'), 'file': rel, 'kind': before['kind'], 'content_preserved': not different, 'before_sha256': before['sha256'], 'after_sha256': hashlib.sha256(source.encode()).hexdigest()})
    output = {'routes': len(rows), 'counts': dict(Counter(r['kind'] for r in rows)), 'failures': failures, 'pages': rows}
    (REPORT / 'preservation.json').write_text(json.dumps(output, indent=2) + '\n')
    print(json.dumps({k: v for k, v in output.items() if k != 'pages'}, indent=2))
    if failures:
        raise SystemExit(1)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action', choices=['snapshot', 'apply', 'check'])
    args = parser.parse_args()
    globals()[args.action]()
