# PDF Build — Section Author Contract

`pdf-build/` turns the Simply Endorsed web-app data into one print-ready HTML
book (`dist/book.html`), which a later Playwright step renders to PDF.

## Golden rules

1. **Each section file is independent.** Do not edit other sections, `lib/`,
   or `styles/`. Add your own `sections/NN-name.js` only.
2. `node build.js` must keep exiting 0. Build order = filename order
   (`00-cover.js`, `01-…`, `02-…`), so pick the right numeric prefix.
3. All HTML-escaping goes through `helpers.esc()`. Never interpolate raw
   data into HTML.

## Section module interface

```js
// sections/05-student-pilot.js
module.exports = {
  title: "Student Pilot",               // shown in build log; free-form
  render(data, helpers) {
    return `<h1 class="section-title" id="student-pilot">Student Pilot</h1>` + /* … */;
  },
};
```

- `render(data, helpers)` must return an HTML **string** (fragment, not a
  full document). Errors thrown inside `render` fail the whole build with
  your filename attached.
- Start each section with `<h1 class="section-title" id="…">` — Chromium's
  PDF outline uses h1–h6. Heading levels: **h1 section → h2 category banner
  → h3 bundle header → h4 endorsement card title** (the helpers already
  emit h2/h3/h4 at the right levels).
- Wrap the section in `<div class="page-break">…</div>` (or rely on
  `.category-banner`, which breaks automatically) if it must start on a
  fresh page.

## The `data` object

From `lib/load-data.js` (`loadData()`). All names are the app's browser
globals except where noted.

| Key | Shape |
|---|---|
| `APP_META` | `{ acVersion: "AC 61-65K", dateIssued: "2025-11-14", display, sourceUrl, documentPageUrl }` |
| `ENDORSEMENTS` | 96 items: `{ id: "A.1"…"A.96", order, title, cfr: string[], sourcePage, verbatimText, category, explanation, whoIssues, expiration, perFlight, aliases[], tags[], cardExplanation }`. `explanation` is a `"•\t…\n•\t…"` bullet string — use `helpers.explanationBullets()` or `renderEndorsementCard`. |
| `BROWSE_STRUCTURE` | 13 items, app order: `{ categoryId, subcategories: Bundle[] }` |
| `GUIDANCE_SECTIONS` | 10 lesson sections: `{ id, title, content: Block[] }` where `Block = { type: "h3"\|"h4"\|"p"\|"ul"\|"ol", value: string \| string[] }` — render with `helpers.renderBlocks(content)`. |
| `PRE_SOLO_CONTENT` | `{ intro, prerequisites: [{ id, title, description, refs[] }], accordionSections: [{ id, heading, blocks: Block[] }], … }` |
| `JOURNEY_STAGES` | 12 items: `{ id, label, phase, endorsements: [{ id, label }], regulation, description, timeLimit \| null, gotchas[], notes: [{ label, id, note }] }` |
| `SCENARIO_CARDS` | 8 items: `{ id, title, tag, regulation, steps[], endorsements: [{ id, label }], timeLimit, pitfalls[] }` |
| `QUICK_REF_DATA` | `{ timeLimits: [{ limit, appliesTo, governingFAR, resetsWhen, color }], logbookChecklist: string[], acFarTable: [{ acRef, far, use, expiration }], sfarList: [{ id, title, note }] }` |
| `CFI_CAREER_DATA` | `{ prePostDec2024: { before, after }, … }` (inspect for more keys) |
| `FLASHCARD_DECK` | 15 items: `{ id, category, question, answer }` |
| `TRAINING_REQUIREMENTS` | **browser global is `window.TRAINING_REQUIREMENT_CARDS`**. `{ sourceReviewDate, categoryCards: { <slug>: { title, summary, requirements: [{ label, text, refs[] }], relatedEndorsements: string[], sourceReviewDate, reviewNote } } }` |
| `PRIVILEGES_LIMITATIONS` | `{ sourceReviewDate, cards: { <slug>: { title, ruleRefs[], summary, privileges: [{ text, refs[] }], limitations: [{ text, refs[] }], … } } }` |

**Bundle shape** (`BROWSE_STRUCTURE[i].subcategories[j]`):

```js
{
  id: "first-solo",                 // ← bundle key, used in anchors
  label: "First Solo",
  description: "…",
  primaryIds: ["A.3", "A.4", "A.6"],
  supplementalIds: ["A.14"],        // optional
  supplementalLabel: "…",           // optional, only with supplementalIds
  featured: true,                   // optional
  contentRenderer: "pre-solo",      // optional; only the "pre-solo" bundle —
                                    // render PRE_SOLO_CONTENT there instead of cards
}
```

Resolve endorsement ids via `helpers.endorsementById.get("A.6")`.

## Helpers (`lib/render.js` + `lib/theme.js`, merged)

Every export of both modules is on the single `helpers` object.

| Helper | Signature → returns |
|---|---|
| `esc` | `(s) → string` HTML-escape |
| `anchorForEndorsement` | `("A.6") → "A-6"` |
| `renderEndorsementCard` | `(endorsement, opts?) → card HTML`. `opts.relatedHtml` fills the Related slot; `opts.showRelated:false` omits it. `sourceUrl`/`acVersion` are pre-bound from `APP_META`. |
| `renderCategoryHeader` | `(slug, count?) → banner HTML` (count = number or string, optional) |
| `renderBundleHeader` | `(bundle, categorySlug) → header HTML` |
| `renderBlocks` | `(Block[]) → HTML` for guidance/accordion content |
| `badge` | `(text, kind) → pill HTML`; kinds: `signer`, `validity`, `perflight`, `featured`, `muted` |
| `cfrChip` | `(citation) → chip HTML` (linked when possible) |
| `explanationBullets` | `(explanationString) → string[]` |
| `cfrLink` | `(citation) → ecfr.gov URL string \| null` |
| `endorsementById` | `Map<"A.6", endorsement>` |
| `themeVars` | `(slug) → "--cat-accent:…;--cat-soft:…;--cat-line:…;--cat-ink:…"` inline style |
| Theme maps | `CATEGORY_THEMES`, `CATEGORY_LABELS`, `CATEGORY_ORDER` (13 slugs, app order), `WHO_ISSUES_LABELS`, `EXPIRATION_LABELS` |

## Anchor naming scheme (stable — TOC and cross-links depend on it)

| Target | Anchor | Example |
|---|---|---|
| Endorsement card | `A-<n>` (dots → dashes) | `#A-6`, `#A-77` |
| Category banner | `cat-<slug>` | `#cat-student-pilot` |
| Bundle header | `bundle-<bundle.id>` | `#bundle-first-solo` |
| Guidance lesson section | `gs-<GUIDANCE_SECTIONS[i].id>` | `#gs-logbook` |

Internal links: `<a class="internal" href="#A-6">…</a>`.
External links: `<a class="external" href="…" target="_blank" rel="noopener noreferrer">…</a>`
(CSS appends the ↗ automatically — do not type it yourself).

## CSS class inventory (`styles/pdf.css`)

- Layout: `.page-break`, `.avoid-break`
- Cover: `.cover`, `.cover-logo`, `.cover-title`, `.cover-subtitle`, `.cover-meta`
- TOC: `.toc-list`, `.toc-level-2`
- Section: `.section-title` (h1)
- Category banner: `.category-banner`, `.category-banner-count`
- Bundle: `.bundle-header`, `.bundle-desc`
- Card: `.endorsement-card`, `.ec-head`, `.id-pill`, `.ec-title`,
  `.ec-badges`, `.ec-cfr`, `.ec-verbatim`, `.ec-verbatim-label`, `.verbatim`,
  `.ec-explanation`, `.ec-tags`, `.ec-related`, `.ec-foot`
- Pills/chips: `.badge.badge-{signer|validity|perflight|featured|muted}`,
  `.chip.cfr-chip`, `.chip.tag-chip`
- Content: `.guidance-section`, `table.data-table`, `.mono`
- Links: `a.internal`, `a.external`

Category colors are **never** hardcoded in sections — they come from
`--cat-accent / --cat-soft / --cat-line / --cat-ink`, set inline by the
helpers via `themeVars(slug)`. If you build custom per-category markup, put
`style="${helpers.themeVars(slug)}"` on the wrapper and use the vars.

## Verify your work

```sh
cd pdf-build
node build.js         # must end with "wrote dist/book.html (…), 0 errors"
node test-render.js   # fixture check: full A.6 card → dist/preview-card.html
```

Full pipeline (build → QA → render → stamp → nav QA): `node pipeline.js`
(records every stage in `dist/build-manifest.json`). Output paths live in
`config.json`; set `SIMPLY_ENDORSED_OUT=/scratch/path.pdf` to redirect a test
run away from the real deliverable. Fast chrome re-stamp without
re-rendering: `./stamp_nav.py --from-base`.
