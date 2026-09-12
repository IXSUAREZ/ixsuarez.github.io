# SEO growth implementation handoff

Updated 2026-09-12. This document records the content and measurement work that is actually implemented in the repository. It does not report search traffic, rankings, conversions, or Search Console results.

## Implemented source corrections

Simply Endorsed now uses the FAA's current **AC 61-65K**, issued November 14, 2025, together with the current eCFR:

- [AC 61-65K (FAA PDF)](https://www.faa.gov/documentLibrary/media/Advisory_Circular/AC_61-65K.pdf)
- [14 CFR Part 61, eCFR](https://www.ecfr.gov/current/title-14/chapter-I/subchapter-D/part-61)
- [14 CFR § 61.93](https://www.ecfr.gov/current/title-14/chapter-I/subchapter-D/part-61/section-61.93)
- [14 CFR § 61.94](https://www.ecfr.gov/current/title-14/chapter-I/subchapter-D/part-61/section-61.94)
- [14 CFR § 61.95](https://www.ecfr.gov/current/title-14/chapter-I/subchapter-D/part-61/section-61.95)
- [14 CFR § 61.57](https://www.ecfr.gov/current/title-14/chapter-I/subchapter-D/part-61/section-61.57)

The structured endorsement data now reflects the source distinctions: A.8 has no stated standalone 90-day expiration; A.12/A.13 describe the required endorsement dating within 90 days; A.15/A.16 describe §61.94 training recency rather than an endorsement expiration; and A.71 describes a satisfactory IPC as potentially satisfying §61.57(d), subject to the applicable rules. The IPC cross-reference was corrected from A.61 to A.71.

The SEO source can be rebuilt with:

```bash
node simply-endorsed/build-seo-content.js
```

That command regenerates `simply-endorsed-cfi/index.html` from the structured data. The release build has been run; the generated page should remain covered by the repository's SEO parity check whenever the structured endorsement data changes.

## FOI Cards evidence boundary

The FOI deck contains 238 cards with complete declared source-page coverage (pages 1–8), unique IDs/prompts, and an official FAA/eCFR reference map. The map links cards by topic to the FAA Aviation Instructor's Handbook; it does not prove that every answer is an exhaustive or word-for-word verification. The deck remains a study aid, not an FAA publication or substitute for current regulations.

The primary handbook source is the [FAA Aviation Instructor's Handbook page](https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/aviation_instructors_handbook), including [AIH Chapter 1](https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/aviation_instructors_handbook/03_aih_chapter_1.pdf), [Chapter 3](https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/aviation_instructors_handbook/05_aih_chapter_3.pdf), and [Chapter 9](https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/aviation_instructors_handbook/11_aih_chapter_9.pdf). The sterile-flight-deck card also uses the [eCFR see-and-avoid rule, §91.113(b)](https://www.ecfr.gov/current/title-14/chapter-I/subchapter-F/part-91/section-91.113).

## Editorial review priority

Before describing the educational corpus as fully FAA-verified, review the highest-risk pages and cards against the exact eCFR, current AC revision, and applicable ACS. Prioritize first-solo and cross-country guidance, checkride/retest timing, IPC and flight-review explanations, CFI responsibilities, and the FOI Cards entries that combine instructional advice with regulatory claims. Keep the current qualifiers on the 238-card source map until those reviews are complete.

## Local SEO measurement plan

This plan defines what to measure after publication. It contains no assumed baseline or forecast.

| Checkpoint | Actions | Measures to record |
| --- | --- | --- |
| 30 days | Confirm canonical URLs, indexability, sitemap coverage, internal links, structured-data validity, and that rebuilt SEO content matches the JavaScript data. Record the initial page inventory. | Indexed URL count; crawl/index errors; impressions and clicks by page/query if an authorized analytics source is available; organic landing-page sessions; engagement or lead events. |
| 60 days | Compare pages by intent cluster: endorsement lookup, first solo, cross-country, IPC/flight review, FOI study, and local CFI services. Fix pages with impressions but weak engagement or unclear intent. | Change from the 30-day baseline in impressions, clicks, CTR, average position, landing sessions, and qualified contact actions. Record sample size and date range. |
| 90 days | Review winners and underperformers, consolidate overlapping pages only where intent and evidence support it, refresh stale FAA references, and document the next content batch. | 90-day trend by cluster; indexed-to-published ratio; non-brand query share where available; qualified inquiry rate; pages requiring source refresh. |

Use only authorized, aggregated measurement sources. Do not include account identifiers, private Search Console exports, or personal lead data in this handoff.

## Website release and maintenance

The shared registry (`config/site-pages.json`) covers 522 canonical page records, including the internal Certificate Generator. The audit also records two redirect aliases. All public pages get unique titles/descriptions, canonical URLs, robot directives, Open Graph/Twitter metadata and an identity assignment. Forty-six identity sets provide 512px logos, square icons and 1200×1200 clean-background centered-logo previews. Articles inherit their category identity. Certificate Generator is noindex and omitted from the sitemap; FOI Cards is public.

The new `/tools/` directory and homepage expose all six public tools. Shared menus and footers use “Blog.” Main service/category pages use their identity marks; article panels connect study content to related tools. `/learn/` adds a lazy-loaded index of 473 articles with text, topic and training-stage filtering. Local conversion pages identify Diego as a CFI at Kentucky Flight Training Center at Bowman Field, with discovery-flight inquiries as the next step.

Regenerate after any application build (which may replace an outer HTML head):

```bash
node simply-endorsed/build-seo-content.js
python3 scripts/sync-site-metadata.py
python3 scripts/sync-chrome.py --apply
python3 scripts/sync-site-metadata.py
python3 scripts/sync-site-metadata.py --check
python3 scripts/sync-chrome.py --check
python3 scripts/audit-site.py
node --test scripts/tests/*.test.cjs
python3 -m unittest scripts/tests/test_site_audit.py
node foi-cards/verify-content.mjs
node simply-endorsed/tests/run-tests.js
```

Identity export uses `scripts/render-identities.cjs` with Sharp, React, React DOM and Lucide available through Node's module resolution. Preserve the Lucide license. Do not replace approved application logos when regenerating page identities.

## Louisville search opportunity

Local competitor pages make the location and first-flight offer immediately recognizable. [Cardinal Wings](https://cardinalwingsaviation.com/) presents flight training and discovery flights at Bowman Field. [Louisville Aviation's purchase page](https://louisvilleaviation.com/purchase/) exposes a one-hour introductory lesson. These observations support making the discovery inquiry easy to find, explaining the first visit and giving a current total quote before commitment. They do not establish a competitor's rank, traffic or conversion rate.

Keep local intent on the Louisville/Bowman Field service pages; keep national study-tool and lesson titles focused on their actual topic. This reduces awkward location stuffing while connecting useful educational visits to local instruction. Check the Business Profile's actual name, category, phone, website and appointment links for consistency once its listing is identified. Google's guidance describes local relevance, distance and prominence; website changes alone do not control all three. [Google Business Profile local ranking guidance](https://support.google.com/business/answer/7091)

Page titles and descriptions are preferences supplied to Google, not a guarantee of the exact snippet shown. Google may construct its own title and snippet from page content. [Title links](https://developers.google.com/search/docs/appearance/title-link), [snippets](https://developers.google.com/search/docs/appearance/snippet). Google supports one search favicon per hostname, even though browser tabs can have per-page icons. The root site favicon stays stable. [Google favicon documentation](https://developers.google.com/search/docs/appearance/favicon-in-search)

## Outstanding external setup and evidence limits

A real Formspree public endpoint is still required to activate direct web submission. Configure `window.SUAREZ_CFI_FORM_ENDPOINT` before the form script or set `data-form-endpoint` on each mount. Until configured, the button explicitly opens an email draft. Automated tests exercise accepted responses, failure recovery, duplicate submission blocking and honest fallback behavior; they do not send real messages. Do not record a mail draft as a completed lead.

Search Console access was established and an aggregate baseline saved privately outside the release files. Indexing reason details and the exact Business Profile listing remain unverified. No ranking increase is claimed. The route audit verifies metadata, dimensions, links, JSON parsing and sitemap membership; it is not an exhaustive factual review of every article or a guarantee of indexing.
