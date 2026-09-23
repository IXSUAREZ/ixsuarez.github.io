# Content discovery review — September 23, 2026

This review covers the Learn library, Blog listing, category/article presentation, and their authoring sources. It records automated checks separately from rendered browser evidence.

## Implemented content behavior

- Learn presents five certificate/rating paths and 19 topic routes. The 459-row index contains 441 Learn articles and 18 endorsement references; the 14 ordinary Blog articles stay in Blog discovery.
- Search accepts a query, topic, and training stage. It replaces the browse area while active, reports the result count, provides Clear filters and an empty state, keeps state in `q`, `topic`, and `stage` URL parameters, and leaves browse routes available if the index request fails.
- Blog lists one featured article, six initially visible additional articles, category filters, Show more, and one link to the endorsement reference collection. Canonical page metadata supplies its dates, read times, categories, headings, and featured designation.
- Category pages with a related-collections block put their own article list first. Related collections follow as secondary navigation. One category without that block is unchanged.
- The 47 manifest identity sources now point to the confirmed square masters; Learn/Blog use their generated identity marks.

## Checks run

| Check | Result | Limit |
|---|---|---|
| `node --test scripts/tests/library-search.test.cjs` | 3 passed: index membership and route existence, 5/19 collection routes, 14 Blog metadata/listing membership | Static/generated data, not interaction or visual proof |
| `python3 scripts/sync-site-metadata.py --content-only --check` | 0 drift | Scoped content outputs only |
| Generator transform repeatability for Home catalog, Tools catalog, Blog listing, and an Aircraft Systems category | All transforms idempotent and equal current files | Does not cover every route or a full metadata run |
| `python3 -m py_compile scripts/sync-site-metadata.py scripts/new-post.py` | Passed | Syntax only |
| Semantic token contrast calculation | Dark: muted on raised 7.17:1 minimum; Day: cyan on background 5.48:1 minimum; ink pairs all above 12:1 | Source colors, not computed browser styles on every component |
| Authoring template inspection | `templates/*.html` insert one shared NAV and FOOTER, with one design/premium/avionics stylesheet sequence | Future generated page must still be rendered and inspected |

The Blog article lead and Learn article lead had a hardcoded dark `rgba(11,12,14,.76)` foreground that could be unreadable in Dark appearance. The owned styles now use semantic foreground/surface tokens. Blog CTA sheet and selected Learn secondary surfaces also use semantic surfaces. `scripts/new-post.py` now marks the current **Blog** menu link and instructs authors to add editorial metadata to `config/site-pages.json` before running the metadata generator; it no longer directs edits to generated Blog cards or the sitemap.

## Browser evidence boundary

Before the final shared sync, an isolated local browser session showed Learn and Blog at desktop and 390px phone widths in Dark, plus Learn phone in Day. Those snapshots showed no horizontal overflow. It also showed six additional Blog articles initially visible, 459 Learn records, and a `q=weather&stage=Instrument` query surviving reload. These are **pre-sync observations** and do not establish final UI acceptance.

A requested post-sync CUA review could not run in this agent context: `cua.createBrowserTab("iab", ..., {visible:false})` returned `Browser is not available: iab`, and `cua.getState()` reported no browser providers. The lead agent has a working browser context and owns the post-sync Learn search/clear/Back, Blog category/Show more, long-article visual review, and whole-site route coverage. No post-sync browser outcome is claimed here.

## Remaining risks for final review

- Confirm browser Back restores Learn query/topic/stage after changes, and Clear filters returns the browse view.
- Confirm Blog category counts and Show more in the final build, including the featured article's separate placement.
- Inspect a long Learn article and a Blog article in Dark and Day for prose, table, citation, metadata, and CTA contrast after the semantic CSS fixes.
- Run the full metadata/chrome sync and checks after all agents finish; this review ran only scoped content checks to avoid overwriting concurrent work.
