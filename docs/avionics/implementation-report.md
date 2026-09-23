# Suarez CFI avionics implementation

Implemented in an isolated branch, `codex/suarez-avionics`. Public website and original dirty checkout remain untouched. [Open local preview](http://127.0.0.1:8938/). [Visual examples](visual-evidence.md). [Full design QA](../../design-qa.md).

The [2026-09-22 visual regression follow-up](visual-audit-2026-09-22.md) records repairs to the homepage stage/contact surfaces, editorial category contrast, tool dialogs/loading, and narrow wizard docks. Shared tests and the PilotSolve offline cache were refreshed after those changes.

## Scope

Shared Dark/Day/System appearance, saved preference migration, solid controls, matte semantic surfaces, tactile controls, compact bottom navigation, accessible menu dismissal/focus return, native tool dock adapters, and wrapper/iframe ownership. Site navigation has six desktop destinations plus Menu; About stays in Menu. Compact navigation is Home/Learn/Tools/Menu. Wizard steps retain prerequisite handling. Card/explorer commands remain contextual.

The static audit passes for **523/523 canonical routes**, 551 HTML files, independently built apps, templates and utility documents. No missing linked local resources or duplicate shared injections were found. See [coverage.json](coverage.json) for per-file results. Every template family and all eight tools have representative browser review; every article has not been individually visually inspected.

The five protected sky files match baseline hashes, and the homepage hero subtree is byte-identical. Controlled baseline/current geometry matches at desktop, tablet and phone. A desktop sky-only crop has identical pixels. No sky implementation was changed. Nine selected calculation/data/storage/export core files also match baseline.

## Verification

| Check | Result |
|---|---|
| Shared site Node tests | 22 passed, including appearance, navigation adapters, sky, contact and library behavior |
| Python site audit unit tests | 3 passed |
| Simply Endorsed scenarios | 98 passed |
| Endorsement workspace checks | 1,598 assertions passed |
| CertPath saved-plan integration | Fresh start, contact gate, failure preservation, retry, save/reopen/latest, locked inbox passed |
| PilotSolve | 34 tests, typecheck, runtime check and build passed; current local offline cache `pilotsolve-site-8095442a1028`, all 19 precache URLs/hash checks passed; two offline-worker tests prove shared theme requests are served from cache with network unavailable |
| FlightRisk | 26 tests, lint and production build passed |
| FOI Cards | 238 cards, 8 content pages, 20 anchors verified |
| Aero Lab | 14 tests and production web build passed |
| Crank & Core | 22 focused tests, typecheck and production build passed |
| Route/cascade audit | Zero failures; shared chrome and appearance generator checks pass |

Browser checks cover Dark/Day, narrow320/390px, tablet834px, desktop1440px, short1024×600 windows, native calculator keypad/results, wizard progression, menu focus/Escape, single explorer dock and shared appearance. Synthetic 200% text enlargement at320px exposed and resolved CTA/footer overflow; final article scroll width is320px. This fixture is distinct from actual browser text zoom. Details and screenshots are in the design QA record.

## Source and release

Deployable site: `/Users/diegosuarez/Projects/suarez-avionics-work/site`.

Authoring copies: sibling `sources/pilotsolve`, `sources/crank-core`, `sources/aero-lab`, and `flightrisk-app`. Rebuild changes in these sources before future app updates. PilotSolve and Crank file deltas/build commands are in [authoring-source-changes.md](authoring-source-changes.md). Aero uses `npm test` then `npm run build:web`; FlightRisk uses `FLIGHTRISK_BASE=flight-risk-assessment npm run build` after tests/lint. Shared changes require PilotSolve's offline-cache regeneration after the final shared bytes settle.

Original-work snapshot commit: **1fea5c9a**. Complete local copy and hashes: sibling `baseline/`. A final hash comparison checked 1,387 original-site files against that snapshot: zero differences (local runtime database files excluded). Roll back a future release by rebuilding/deploying that snapshot in a separate checkout; do not reset the original dirty working tree. Deployment, remote push and live verification were not performed.

## Remaining release checks

Physical iPhone Safari safe areas/keyboards, installed PilotSolve PWA, VoiceOver, true browser text zoom, full print/export interaction sampling, and comprehensive WCAG2.2AA evaluation remain unverified. Full Crank provenance suites need excluded reference fixtures; focused engine tests passed. Native platform-only HIG technologies remain outside scope. [HIG applicability matrix](hig-applicability.md) records source, adaptation, evidence and these verification boundaries; it is not a compliance certification.

Preview restart: `python3 /Users/diegosuarez/Projects/suarez-avionics-work/serve.py 8938 /Users/diegosuarez/Projects/suarez-avionics-work/site`. The server binds to localhost only.

### Crank & Core runtime boundary

The Studio authoring tree contains newer, unrelated instrument studies that were not in the deployed baseline. The release preview therefore pins the complete baseline runtime and all 23 model files, applying a small navigation/appearance adapter around native controls. Both primary runtime chunks and all model files are byte-identical to baseline; see [preservation evidence](crank-baseline-preservation.json). The reproducible release command is `node ../sources/crank-core/scripts/prepare-baseline-overlay.mjs` from the site directory. Do not replace this pinned runtime with a generic Studio build as part of this visual release. The earlier 22 focused source tests describe authoring checks; final pinned-runtime validation is byte preservation plus browser engine/six-pack/Parts/Menu/Day checks. This adaptation avoids shipping unrelated simulator expansion.

## Homepage reference follow-up
The selected image was implemented more closely in `assets/home-avionics.css`: brand, outlined icon CTAs, typography and tactile dock. Desktop hero geometry now fills the viewport (minimum900px), intentionally replacing the earlier824px frame; previous geometry/pixel-comparison artifacts describe the prior implementation. Sky source/assets and automatic animation behavior remain unchanged. See current root design-qa.md and home-refinement-comparison.jpg.
