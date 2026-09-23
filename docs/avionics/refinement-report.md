# Suarez CFI refinement — implementation and verification

September 23, 2026 · local preview only · branch `codex/suarez-avionics`

**Working preview:** http://127.0.0.1:8940/  
**Screenshot gallery:** http://127.0.0.1:8940/_local-only/avionics-refinement/

## What changed

- The website dock has five desktop destinations: Home, Learn, Tools, Fly with Diego, Menu. Compact layouts use Home, Learn, Tools, Menu. Menus use full-width, left-aligned rows with separate website, tool-action, and appearance groups. Shared controls have a single styling owner; legacy navigation/button rules were removed from migrated components.
- Homepage CTA icons are actual child elements, eliminating the plane icon/pressed-shadow collision. The surrounding interface retains shallow Garmin-style bevels while content stays matte. The existing animated sky sources and assets remain unchanged.
- Learn now has a compact introduction, one search field, five Training paths and 19 Topics. Active search/filter state replaces browsing with one results list, persists in the URL, and covers 459 records (441 Learn articles and 18 endorsement references). Category pages prioritize their article lists. Article metadata, code wrapping, leads, and related surfaces use readable semantic colors.
- Blog has its own editorial discovery: one featured article, six additional articles initially, category filters, Show more, and one endorsement-reference link. All 14 ordinary Blog articles retain their existing content and URLs. Listing metadata is maintained in the canonical manifest.
- Tools is a seven-app catalog organized into Flight planning, Training and instruction, and Aircraft systems. Cards offer direct Open actions and keyboard-accessible Preview dialogs containing two current product screenshots each. The same catalog data generates the homepage tool section. Certificate Generator remains internal and outside the public catalog.
- All 47 approved square identity masters were imported through the scoped renderer. Page marks, applicable app headers, favicons, touch icons, and PWA manifests use the matching set. Functional navigation icons remain separate.
- All eight tools received presentation changes. Authoring copies were rebuilt where required. Crank & Core uses its pinned-runtime overlay, preserving 44 JavaScript bundles and 23 model files byte-for-byte. See [authoring changes and build commands](authoring-source-changes.md).

## Defects repaired during review

The centered menu button stack; homepage CTA pseudo-element collision; pale Dark-mode search and selected-endorsement rows; low-contrast Blog dates/article leads; Learn inline-code phone overflow; duplicate Tools stylesheet inclusion; preview-dialog keyboard escape into browser chrome; FlightRisk sticky table navigation covering headings and delayed heading reveals; Crank & Core short-window collection clipping; Aero Lab's outdated dock destinations; and homepage buttons overlapping the dock in short desktop windows.

Dark, Day, System, and Solid controls remain available. Shared appearance initialization runs before page paint; persistence, cross-tab/embedded propagation, reduced-motion behavior, and blocked-storage fallback are covered by focused tests. Actual OS appearance/reduced-transparency switching was not exercised on physical devices.

## Coverage and evidence

| Check | Result | Evidence boundary |
| --- | --- | --- |
| Canonical browser captures | **523 routes × 4 modes = 2,092 captures** | Desktop Dark/Day and 390px phone Dark/Day; viewport captures, not complete page scroll captures |
| Automated browser route checks | No horizontal overflow or broken loaded images across the final canonical records | Includes title, heading, theme, page width and visible/loaded image checks; lazy resources additionally covered by static reference audit |
| Visual overview | All 523 routes reviewed in each mode through 88 contact sheets | Expanded representative and flagged originals; not an individual review of every paragraph or every control state |
| Additional viewport checks | 56 captures: 14 families at 320×568, 768×1024, 1024×768, and 1280×480 | No horizontal overflow in these records; settled application routes were recaptured separately |
| Utility/embedded surfaces | 15 surfaces × 4 modes = 60 captures | Two fixed-width PDF-authoring previews exceed phone width by design; export geometry was preserved |
| Static route/resource audit | 523 canonical routes; 526 audited HTML records; zero failures, broken references, or JSON-LD failures | Two aliases and one built PilotSolve runtime entry are classified separately |
| Generators | Metadata, chrome, and avionics checks: zero drift | Shared partials, listings, authoring templates, and built route sources synchronized |
| Identities | 47 masters match approved source bytes; 1,569 canonical icon references checked | Master-set aggregate SHA-256: `62d044fb60759731569ef4dbf8fea73596368bfd00f7257a6a760115ecacbe57` |
| Sky protection | All five protected source/asset hashes match this task's starting baseline | Surrounding CTA markup/styles changed; shader, animation code, sky CSS and imagery did not |
| Contrast | Semantic muted/raised Dark pair 7.17:1 minimum; Day cyan/background 5.48:1 minimum; main ink pairs above 12:1 | Source-token calculation, not a complete per-pixel contrast audit of all imagery and glass combinations |

Machine-readable records: [canonical](refinement-review/coverage.json), [additional viewports](refinement-review/family-coverage.json), [utilities](refinement-review/utility-coverage.json), [summary](refinement-review/summary.json), [sky hashes](refinement-review/sky-hashes.json).

The final contact sheets and original captures reflect settled FlightRisk/Aero Lab/Crank & Core views. Earlier reviewer notes describing loading placeholders or clipped FlightRisk headings are retained as findings history; these were resolved and recaptured. Screenshot extensions now match their encoded format. All 14 catalog screenshots are genuine PNG files.

### Interaction checks

The lead exercised menu dismissal/focus, compact menu scrolling, Learn search and reload persistence, Clear filters and browse views, Blog filtering and Show more, catalog preview focus wrapping and Escape restoration, CertPath start/goal progression, Simply Endorsed selection/citations, FOI card flipping, PilotSolve numeric entry and a 10-knot crosswind result, Aero Lab lesson controls, and Crank & Core collection-to-exploration navigation ownership. The long-article phone scroll-end check left roughly 24px between the final footer content and the dock. The final homepage foreground-spacing correction leaves about 22px of button-to-dock clearance at 1280×480 and 78px at 1280×720/800, while retaining the 900px hero/sky bounds. Desktop homepage and short-window evidence were refreshed after that change.

Keyboard and accessibility-tree checks provide useful semantic evidence; they do **not** constitute a VoiceOver session or WCAG certification. Fixed navigation naturally overlays intermediate content while scrolling; page-end clearance and reachable controls were checked separately.

### Regression suites

- Shared site tests: **25/25 passed**, including appearance, navigation, content discovery, catalog dialogs, and protected sky behavior.
- Static audit classification tests: **4/4 passed**.
- Simply Endorsed / CertPath: **98/98 passed**, plus the private saved-plan flow.
- PilotSolve: **34 calculation/session tests**, offline-worker tests, build and protected-runtime checks passed. Final shared-asset cache: `pilotsolve-site-422b3fe1c6e0`; the two final worker tests passed after cache regeneration.
- FlightRisk: **26 tests passed** after the final route-prefixed rebuild.
- Aero Lab: **14 tests passed**.
- Crank & Core: **5 focused navigation tests passed**, with pinned runtime/model hash preservation. The large geometry/provenance dataset suite was not rerun in the lightweight authoring copy.
- FOI Cards: **238-card content audit passed**.
- Print/export and saved-state safeguards are covered by existing automated checks. No calculation engines, saved-work schemas, backend APIs, route paths, or certificate canvas/export dimensions were intentionally changed.

## Remaining acceptance limits

Physical iPhone Safari safe-area/keyboard behavior, the installed PilotSolve PWA in airplane mode, VoiceOver, and genuine 200% browser zoom remain **unverified**. The in-app browser did not apply the attempted native zoom shortcut; 320px reflow is recorded separately and is not presented as a replacement for zoom testing. Physical printing and a manual visual comparison of every export were not performed. The source/test checks do not substitute for those device and output checks.

The PDF-authoring `book.html` and `preview-part3.html` utility surfaces keep their fixed print layout and exceed a 390px viewport. They are outside the canonical public route set and were not restyled to change export geometry.

This is a working local implementation with documented verification, not a claim that every acceptance item is complete or that Apple HIG/WCAG conformance has been certified. HIG adaptations and source references remain in [the applicability matrix](hig-applicability.md).

## Rollback and release boundary

Starting commit: `cbe93bda`. The task's starting status and tracked-file hashes are preserved in `../refinement-baseline-20260923/`. The previously existing `certpath-api/.wrangler-integration/` and `simply-endorsed/node_modules` were retained. Work remains in the isolated preview branch; the main checkout supplied the approved identity assets and was not used as a deployment target.

To inspect or serve the previous version without destroying current work, create a **separate detached worktree** at `cbe93bda` and serve that directory on a different local port. Do not reset or clean the current checkout. Independent app source changes are documented in `authoring-source-changes.md`; keep those isolated source folders with this preview for future rebuilds. No production deployment or public release was performed.

The local screenshot gallery under `_local-only/` and `docs/avionics/refinement-review/` are review artifacts; exclude them from any later production release bundle unless intentionally publishing documentation.
