# Polished Aurum implementation status

Release integration checkpoint: `/Users/diegosuarez/Projects/suarez-aurum-release-20260925`, branch `codex/polished-aurum-release-20260925`, rebased onto public `origin/main` at `4a20d30`. The older isolated Aurum snapshot is `26edd1a`; this checkout preserves the newer journal, contact/SEO, compact mobile dock and its latest brief-motion behavior. The mobile refinements below are the release candidate; deployment evidence belongs in the release record after publication.

Current public-source preview: http://127.0.0.1:8900/ (loopback only). The earlier 8898 isolated preview and 8896 comparison are historical references.

## Public-source mobile refinement, 2026-09-25

- Confirmed the live homepage bytes matched `origin/main` at `75b99da` before editing. Ported only the older isolated preview's compact phone scale and CertPath opaque-surface cleanup into this newer checkout; retained the current collapsible dock and Modern Aviation Journal code.
- At 390px, homepage hero heading changed from 43.2px to 35.2px, lead from 16px to 15px, and hero actions from 310×50px at 15px to 280×44px at 14px. At 320px Night, body width remains 320px, theme color is `#414141`, and the dock Menu opens and dismisses. FOI entry uses a 44px action; Certificate Generator's first-step title is 32px; PilotSolve and Simply Endorsed entries remain within 390px.
- Adapted the newer Journal landing-page rule directly: Blog and Learn titles now compute to 31.2px with 16px lead copy at 390px, without horizontal overflow. Article title/body computed 32px/17px in a representative article. Preserved reader size controls and content.
- Synced page references and standalone cache versions; `audit-aurum.py` passes 523/523 routes, 6/6 supporting documents and 4/4 manifests. `audit-site.py` finds zero broken references across 526 HTML documents. Shared Python tests pass 30/30 and the contrast audit passes 109/109 with minimum text ratio 4.54:1. `sync-avionics.py --check` reports zero stale HTML sources, and Git whitespace check passes. After the high-load interruption, the CertPath storage suite, Simply Endorsed's 1,678 workspace assertions, and all 98 wizard cases were rerun individually and exited successfully. These are current-public-source results; the remaining rendered, native-device and deep-state acceptance gates below remain open.

## Current-public route-wide material census, 2026-09-25

`material-census-public-20260925.json` records a fresh computed-style scan of the exact 523 registered routes in this public-source worktree, at 390×844 with browser-emulated System/Day and System/Night. Each appearance returned 523 HTTP 200 responses, zero navigation errors, zero page-width overflow and zero heuristic obsolete-material flags among 3,162 Day and 3,108 Night visible button-like controls. A separate 21-route/active-family sample at phone and desktop widths in both appearances found zero such flags and no page-width overflow among 743 visible controls. This strengthens initial-state coverage; it does not certify controls hidden behind menus, dynamic app states, keyboard/touch paths, exports, actual browser zoom or semantic color decisions. Those acceptance gates remain open.

## Current dock-motion integration, 2026-09-25

Public `origin/main` advanced to `4a20d30` after the initial draft PR. Reapplied the compact phone typography and CertPath opaque-surface cleanup on that commit, preserving its new dock-motion CSS. Synchronized the shared asset links and standalone caches, then passed the 523+6+4 Aurum wiring audit. Release browser testing found two transition edges: a canceled press could hold the dock open until another scroll, and a tap on the contracting shell could miss its click. The current `assets/site-nav.js` releases cancellation immediately and treats pointer-up inside that moving shell as a tap; the settled Menu key keeps its normal click action. The dock browser runner accepts `DOCK_CHROME_PATH` so it can use the installed Mac Chrome when Playwright's bundled headless binary is unavailable. The final full suite exits successfully, including Day/Night route matrices at 320, 390, 768, 1024 and 1440px across Home, Learn, Blog and Tools, Menu/Escape/focus, motion reversal, reduced motion, Back, and shell taps. The final 523-route Day/Night initial-state census reports zero HTTP failures, horizontal overflow or heuristic old-control flags among 3,162 Day and 3,108 Night visible controls. Actual native zoom/touch and deeper app states remain open.

## Release integration check, 2026-09-25

- Regenerated appearance and material links over current main, retaining the new journal article structure and compact dock. The dock's collapsed shell is gold; its full-width navigation node stays transparent so no rectangular ghost remains.
- Updated the PilotSolve, Aero Lab, FlightRisk, and FOI entry documents to match their packaged app assets and markup. Rebuilt the PilotSolve and Simply Endorsed offline cache revisions.
- `audit-aurum.py`: 523/523 registered routes, 6/6 supporting documents, 4/4 manifests. `audit-site.py`: 526 HTML documents, zero broken references. Shared Python tests: 30/30; static material contrast: 109/109; Simply Endorsed wizard: 98/98; shared JS tests: pass.
- Current compact-dock real-browser suite passes 11/11, including 320–1024px geometry, touch/keyboard recovery, motion, direct routes, zoom, and Back. The journal real-browser suite passes 20/20, including Day/Night article contrast, 200% zoom, blocked storage, and no horizontal overflow. Ten representative page/app entries load without local asset errors or horizontal overflow at phone width in both appearances. Production publication and live-byte verification were outside this local integration check.

## Implemented

- Canonical Polished Aurum gold gradient, gray Day/Night tokens in existing assets/avionics.css. Existing shared token aliases retained.
- System-first controller; valid canonical saved day/dark/system choices, migration from old light/dark/system and PilotSolve settings, blocked storage, live OS changes, cross-tab sync, browser theme colors.
- Uniform first-paint script and final material stylesheet ordering across 545 HTML files (523 registered active routes), including standalone shells/templates.
- Theme-color meta now precedes synchronous appearance bootstrap so the first paint receives the saved/system browser chrome color.
- Original 53 CSS/appearance/navigation sources archived outside deployable site under `_local-only/style-archive-before-aurum-20260924`, tarball plus SHA manifest.
- Simply Endorsed source palette consolidated, active workspace selection gold, menu Night label.
- Aero Lab app-owned selected lesson/segmented/flap controls now use gold; Night/Day labels and System fallback aligned. TypeScript/build and14 tests pass; Night main workspace reviewed. Advanced panels still pending.
- FlightRisk rebuilt from app-owned source: neutral surfaces and metallic profile selections; risk bands untouched. Source patch retained in docs/design/source-patches.
- PilotSolve app-owned migration rebuilt and packaged; original desktop/responsive structures restored after review, authoritative shared preference precedence fixed. Current artifact prototype-hdpX_fZf.css; runtime28-file guard,36 app regression tests,4 preference tests and TypeScript/build pass.
- FOI Flip action, engine collection selection, Certificate selection adapters. Print and forced-color fallback tokens.
- Byte-versioning sync and offline cache updates include current shared assets.

## Verified in this run

- 56 shared JS tests pass.
- CertPath 98 tests pass.
- Simply Endorsed 1,678 workspace assertions pass.
- FlightRisk TypeScript/build and 26 tests pass.
- PilotSolve worker reports 36 app regression tests, 28 protected runtime files, TypeScript/production build pass. Preference follow-up adds 4 focused tests.
- `scripts/audit-aurum.py`: 523/523 registered routes structurally integrated. This is not visual approval.
- Rendered homepage in Day; CertPath entry in Night; Simply Endorsed entry/menu in both modes; FlightRisk rebuilt Night profile with dark labels on gold; FOI entry and active card; engine collection; Certificate Generator selection with unchanged canvas artwork.

## Incomplete acceptance — do not claim full uniformity

- PilotSolve responsive recovery is now verified at desktop:1120px shell/four-column favorites, metallic selected dock,7+8=15 through keypad. Complete final mobile/tablet/zoom/choice-sheet and helper-flow acceptance remains.
- Crank & Core integration now uses the released editable `engine-explorer/app/assets/avionics-overlay.css` and `.js` around the unchanged pinned runtime; no stale source rebuild was needed. Collection, model, View controls and appearance menu reviewed in Night/Day; System restored. Remaining advanced engine flows and Aero Lab dialogs/geometry workspaces still need acceptance.
- Visually check every distinct public/article/tool template in Day/Night at desktop/tablet/phone. Review individual active routes for outliers; coverage.json entries intentionally pending.
- Verify remaining keyboard/touch paths,200% zoom,OS reduced-motion/reduced-transparency changes, full contrast and live OS changes in the final browser. Browser-simulated blocked storage now resolves System/Day and System/Night across the homepage and eight stateful tools without uncaught entry errors; the temporary explicit choice correctly resets on reload. Cross-tab Night/System and the user-selected opaque-glass setting are verified in the actual browser.
- Complete remaining live app workflows and print/share paths. Certificate JPEG generation rendered the 1080x1920 output with sample names; generator JS and template assets remain byte-unchanged. Native download delivery was not observable through the browser download event.
- Remove remaining competing material literals; keep required geometry/data/math/operational/category colors. Legacy layout CSS has not all been removed and must not be blindly deleted.
- 203 unreferenced generated app assets archived with dependency-closure and SHA verification; manifest in `archived-app-assets.json`. Final dynamic-flow acceptance remains required. Cache digests refreshed after the latest shared material correction.
- After this release, keep the remaining visual, accessibility, native-device and deep-state gates open until each has direct evidence.

## Source ownership and reproducibility

New app source copies are isolated at `/Users/diegosuarez/Projects/suarez-aurum-sources/{pilotsolve,flightrisk-app,aero-lab}`. Their original baseline is `/Users/diegosuarez/Projects/suarez-tactile-sources-20260924`. Source diffs are stored in docs/design/source-patches and must be regenerated after follow-up fixes. Other agents' directories were not edited.

## Latest verification continuation

- Corrected remaining blue tactile-dock and metal tokens to the shared gray material authority; press/release timing now100/220ms. Engine dock/menu visually checked in both appearances after this correction.
- Shared tests rerun:56/56 pass; source audit523/523; git diff whitespace check clean.
- Historical three-finish comparison remains independently usable at8896. Its8 appearance/state tests rerun and pass. Browser gallery:180NM at100kt produces1hr48min; result and input retained after finish, Night and phone-width changes. This does not substitute for full actual-site acceptance.

## Latest public-template and mobile pass

See `visual-checks-20260924.md` for the exact observation scope. Replaced the old decorative palette in `premium.css` with shared tokens while retaining layout rules and semantic completion/review/mastery colors. Removed the old liquid-navigation palette; fixed homepage secondary action contrast, menu/tab selected-label contrast, editorial/directory/library gold selections, certificate rating selection, FOI CTA material and dock clearance, and PilotSolve Done-key and result-unit-sheet typography.

PilotSolve source was rebuilt with runtime guard intact, packaged through `scripts/package-pilotsolve.py`, and its source patch regenerated. New CSS is `prototype-hdpX_fZf.css`; 36 app regression tests and 56 shared tests pass. Old four PilotSolve bundles were archived with SHA verification, with the prior 199-file manifest retained in archive-history.

Route audit now groups all523 pages into18 distinct stylesheet/inline-style families, verifies stylesheet existence and current shared bytes, and records zero literal inline color declarations. This is source inspection, not a claim of full rendered acceptance.

## Endorsement and study continuation

Simply Endorsed selected subcategories and mobile navigation now use Aurum; verified A.3 detail on desktop Day and phone Day/Night, including copy feedback. FOI phone Night study controls clear the dock, and Next/reload preserves Card 2. Exact scope is in visual-checks-20260924.md; remaining template, OS, zoom, and advanced-tool acceptance gates stay open.

## FlightRisk responsive continuation

Corrected shared touch-size specificity so app-owned dimensions remain authoritative; FlightRisk mobile certificate cards now retain their 168px swipe width. Selected instrument-rating controls now use gold. Phone profile and guide introduction reviewed in Day/Night. No calculation or risk-band changes. Full acceptance remains in progress.

## Aero Lab advanced-material continuation

Replaced remaining airflow toolbar and Geometry Studio decorative colors in app-owned source. Rebuilt and packaged current index-C1fiNUI2.js / index-Ct90X-y3.css; geometry-studio.css is included in the refreshed source patch. Day/Night studio and Night pressure controls visually reviewed; object selection and motion-preview interaction confirmed. 14 regression tests pass. Six superseded bundles archived, bringing the generated-asset archive total to 209. Further advanced/result/export acceptance remains open.

## Aero Lab reference and dialog continuation

Reference panels, equations, live values and source cards now use shared neutral materials. Verified reference chart labels and source-card captions in Night after contrast corrections; Day reference panels also reviewed. Current Aero Lab package index-LsKSwjRY.js / index-B90QPMlo.css; source patch refreshed. Archived 21 superseded/intermediate bundles (230 cumulative). No model/data/export code changed.

## Public-template continuation

Training journey selected stages now use shared gold, and the guide CTA's unbounded arrow SVG is corrected. Desktop Day/Night and phone Night checked. Added bounded visual observations for ground-school, learn-to-fly, and the Simply Endorsed introduction article. Remaining viewport/full-page coverage remains explicit in visual-checks-20260924.md.

## Crank & Core advanced continuation

Fixed selected study-button precedence and enabled gold switch tracks. Added theme integration for the lazy ignition comparison dialog; reviewed Day opening and Night opening/comparison section, plus Moving internals and Expose internals interactions. Model runtime and scientific colors unchanged. No full engine acceptance claim.

## Learn/control coverage continuation

Added static control families to route-coverage.json (54 families across the registered 523 routes) to support targeted material review. Runtime controls remain separately verified. Learn Private Pilot category and checkride-tips article/anchor reviewed at desktop, including Night reading contrast. Remaining full-site gates stay open.

## Canonical contrast continuation

New contrast audit passes 34/34 canonical text/gradient/input/glass pairs (minimum text 4.75:1). Increased glass opacity to .90 Day/.94 Night after a measured Night muted-text failure over bright content; Night menu visually checked. Report is stylesheet-hash-bound and explicitly excludes full rendered accessibility claims.

## Offline boundary and FOI keyboard continuation

The legacy /simply-endorsed/ redirect unregisters its retired worker; /simply-endorsed-cfi/ has no worker registration. Its legacy precache test must not be reported as active-workspace offline proof. Existing behavior retained. Appearance/offline focused suites pass 10/10.

FOI section chooser now contains keyboard focus and makes background controls inert; browser-tested Tab/Shift+Tab wrapping and Escape restoration at phone width. New regression passes. Its app.js now uses a content-bound URL through sync-avionics. Route wiring remains 523/523; this does not close remaining full visual/accessibility/export gates.

## FOI material-source consolidation

FOI app-owned CSS now references canonical g tokens for neutral surfaces, labels, lines, focus and primary actions instead of retaining old decorative blue values under overrides. Study-status colors remain semantic. Tablet Day/Night answer/actions/CTA and Night section chooser reviewed. Eleven relevant navigation/dialog tests pass, route wiring 523/523 and diff whitespace clean. Actual 200% browser zoom remains unverified; embedded browser ignored zoom shortcuts.

## CertPath materials and semantic errors

Consolidated prominent app-owned cream/olive button and surface declarations into shared tokens; versioned redesign/storage CSS by content. Corrected shared rules that hid validation colors. Night desktop errors and Day phone alert/inputs reviewed; no backend writes. Shared error shades now pass contrast on all four canonical solid surfaces; contrast report expanded to 42/42. CertPath storage regression plus 18 appearance/navigation tests pass. Route integration remains 523/523. Full saved-plan/result/export and viewport gates remain open.

## Shared tool core and selected-label continuation

Tool-core neutral surfaces/icon controls now use shared tokens; its CSS URL is content-bound. Certificate Generator selected title/subtitle contrast fixed and reviewed on tablet Day/Night. Simply Endorsed reviewed-state button now gold; lower disclosure icons and reference links migrated from old inline palette and checked in Night. 1,678 workspace assertions and 10 navigation tests pass. Full acceptance gates remain in progress.

## Public discovery and footer continuation

Discovery cards and article related-tool panels now reference shared materials directly; 518 stylesheet references are content-versioned. Related-tool links have visible gold/underline treatment. Phone Day/Night lower article and footer expansion/dock clearance reviewed; 14 footer/catalog tests pass. Remaining full-site acceptance gates stay open.

## FlightRisk result-flow continuation

Completed synthetic assessment and verified score3/reload persistence. Fixed desktop result-dialog positioning and modal stacking over dock. Adapted Night gauge neutral labels/pointer and keyboard skip-link to shared tokens, preserving risk arcs/math. Final package index-eVnrbulL.js / index-BNK65EUo.css; TypeScript/build and26 tests pass, source patch refreshed,29 bundles archived (259 cumulative). Day desktop and Night desktop/phone results inspected; ordinary phone keyboard dismissal returns focus. Responsive focus restoration after resizing an open dialog and native print delivery remain open.

## FlightRisk responsive focus resolved

Result dismissal now returns to an available equivalent trigger after a breakpoint change. Verified desktop-to-phone and phone-to-desktop in the browser; new regression brings app suite to27 passing tests. Current package index-Dj7sEDnv.js / index-BNK65EUo.css, source patch updated,9 bundles archived (268 cumulative). Print action exercised but preview/delivery unavailable in embedded browser; print acceptance and broader remaining gates stay open.

## Service FAQ and contact validation continuation

Replaced service FAQ translucent white fill with shared solid raised material, fixing Night contrast. Versioned learn/style.css by content. Contact alert and invalid-field colors now survive generic shared styles and use canonical semantic error shades. Reviewed desktop Night and phone Day/Night expanded FAQs/intake;4 contact tests and42 contrast checks pass, route integration523/523. No message sent. Full site/OS/zoom/export acceptance gates remain open.

## Learn source-token continuation

Removed additional old decorative values from Learn stylesheet (TOC fill, link underlines, hero grid, neutral shadows and border) and standardized contact handoff surface. Meaningful category colors retained. Tablet Day/Night article controls and keyboard anchor navigation verified; Day phone TOC44px targets/no horizontal overflow. Shared source URLs refreshed across479 pages; route wiring523/523. Full acceptance remains in progress.

## Generator validation and review continuation

Shared inputs now preserve explicit aria-invalid error borders, fixing Certificate Generator missing-name feedback. Generator source error colors use canonical semantic tokens. Phone Day/Night invalid state and caption editor inspected; synthetic First Solo flow reaches Review, keeps values across appearance changes, and clears validation after correction. Template artwork/export logic unchanged. No export delivery claim; full acceptance remains in progress.

## Generator material-source and cropper continuation

Generator CSS now uses canonical materials for remaining decorative neutral/primary surfaces, including photo cropper and mobile controls. Day desktop/phone and Night phone cropper reviewed using a public site-owned test image. Zoom/reset, keyboard focus wrap, accept, and reopen verified. Canvas/template logic unchanged; native pinch/export delivery and broader gates remain open.

## Tools directory material-source continuation

Catalog source now uses shared neutral materials and gold primary/filter controls; selected app ring is consistently gold while app icons remain distinct. Desktop Day, phone Day/Night, and tablet Night interaction checks cover filtering, Next, arrow-key selection, session return and expanded direct links. Eight catalog tests pass. Full-site acceptance gates remain open.

## Simply Endorsed selected-hover correction

Fixed current workspace navigation losing gold background on hover, which made its dark text unreadable in Night. Selected endorsement-row marker now uses shared gold while category badges retain their colors. Desktop Day/Night A.3 detail and Night hovered selection verified. Full acceptance remains in progress.

## Shared base-material continuation

Base design-system material aliases now point to Aurum rather than old white/blue/yellow materials; selected-text colors unified across shared styles. Homepage Day/Night hero checked, sky preserved. Contrast audit expanded to44/44 with text-selection pairs; footer6/6. Remaining app/viewport/OS/zoom/export acceptance gates remain open.

## Solid-mode and standalone cache correction

Opaque preference now applies to canonical glass tokens as well as existing component rules. Day/Night persistence and PilotSolve inheritance verified. Corrected PilotSolve worker update policy after browser evidence of stale HTML/theme; online document/shared-style refresh with offline fallback, cache-first immutable bundles, and worker-policy-bound revision. Four worker tests pass; appearance8/8, contrast44/44. Browser loaded current stylesheet after update. The earlier PilotSolve Dark-label item is resolved in the current packaged build and verified below. Broader OS/offline/zoom/export gates stay open.

## PilotSolve Night-label item resolved

Rebuilt and packaged Night settings label;36 app tests and protected runtime guard pass. Browser verifies Night selected/reload retention and return to System. Offline build now accepts explicit site root and reuses host worker policy. Source patch refreshed; three superseded bundles archived (271 cumulative). Current mobile-ByfunKI1.js / prototype-CIkk57bl.js. No calculation changes; broader verification gates remain open.

## Endorsement guide material correction

Reviewed `/simply-endorsed/blog/cfi-endorsements/` in the local preview. The Night card background was a fixed pale cream alpha fill with light text. Replaced guide card, ID, note, and action styling in `simply-endorsed/css/seo.css` with shared material tokens. Added this stylesheet to content-version synchronization and normalized relative stylesheet URLs across 18 guide documents.

Browser observations: at 1280×720 Night, core cluster cards, lower reference note, and primary/secondary actions are legible on solid gray surfaces; the primary action is metallic gold. At 390×844 Day and Night, core cards wrap within the viewport; Day document width measured 390px. Restored System appearance and reset viewport. This is a bounded template observation, not substantive endorsement-content review or full route acceptance.

## FOI desktop rating contrast correction

At 1280×720, reviewed the Day welcome, resumed Card 2 question/answer, and Day/Night ratings and lower CTA. The floating dock allows controls to scroll clear; no layout changes were made. Night semantic-label contrast was 4.30:1 for Review and 3.60:1 for Memorized. Changed only these labels to shared `--g-ink`, preserving amber/green borders and fills. Reloaded and inspected both appearances; all four resulting computed rating pairs pass 4.5:1 (see `foi-rating-contrast.json`). The gold Flip and CTA treatments remain intact. Reload retained Card 2, 238 unmemorized, and zero review-later cards; no ratings/reset actions used. This is not full long-card/zoom acceptance.

## Blog article material consolidation

Reviewed `/blog/private-pilot-cost-louisville-ky/` locally. Found legacy teal header/hover fills in the article table. Replaced those with `--g-raised`; replaced decorative blue grid/shadow, fixed dark metadata, old yellow link underline, and fixed footer-line declarations with shared neutral/accent tokens. Meaningful category palettes remain. Added `blog/style.css` to content-version synchronization and normalized relative blog stylesheet references; 42 HTML sources updated.

Browser evidence: desktop 1280×720 Day intro/table and Night table; tablet 834×1112 table in both appearances (Night header computed rgb(84,84,84), document width 834). Tablet Day FAQ expanded successfully. Phone 390×844 Day reading and FAQ collapse/wrapping inspected; document width 390. Restored System and normal viewport. Only visual/interaction review performed, not cost or aviation claim validation. Route audit remains 523/523; full article variants and remaining acceptance gates remain open.

## Learn library and category responsive review

Current local `/learn/`: desktop 1280×720 Day search `weather` returned 66 results. Selecting Weather and Safety reduced this to 42; switching to Night retained both query and topic. Reviewed solid result cards, gray Clear filters, and readable input/metadata. Tablet 834×1112 Night results wrap into the intended two-column filter layout; unmatched test query produced 0 results and a readable explanatory empty state. Clear filters restored the 459-entry library. At phone 390×844, Topics switched to the gold pressed state and displayed collection links in Day and Night; Day document width measured 390.

Followed the visible FAA Written Test Study Guides collection link. Reviewed its hero/actions on phone in both appearances, tablet hero and two-column cards in both appearances, and desktop Night hero/actions. Primary prep action remains metallic gold, secondary ground instruction remains gray, and category identity artwork stays unchanged. No content or logic edits needed in this review. Restored System and normal viewport. Remaining checks are explicitly retained in the acceptance matrix; these observations do not establish complete route or accessibility acceptance.

## FlightRisk methodology matrix correction

Reviewed local `/flight-risk-assessment/methodology/`: desktop Day introduction, table jump to IFR, and Day/Night scoring tables; phone Night disclosure for Night or twilight flight (`aria-expanded=true`, document width 390), plus phone risk-band cards in both appearances; tablet 834×1112 full band matrix in both appearances. Found `odd:bg-white` on desktop/tablet matrix rows: Night profile text was effectively invisible on white. Replaced only row material classes with `odd:bg-surface-card even:bg-surface-soft` in source `src/components/methodology/BandingMatrix.tsx`. No scoring/data changes.

TypeScript and Vite build passed. Packaged `index-BY8Vt2up.js` / `index-Bp18znhh.css`; refreshed route/cache wiring (523/523). Source patch now includes BandingMatrix. Archived 10 superseded generated assets with the existing hash-checked archive tool to `flightrisk-matrix-followup`, outside deployment. After reload, Night matrix row backgrounds computed rgb(74,74,74) with rgb(244,244,244) profile text; settled red/amber/green band fills remain visible. Day rebuild also visually checked. Full guide/reference/export/zoom acceptance remains open; this is UI verification, not scoring or aviation-content certification.

## FlightRisk guide timeline material correction

Source audit of guide/methodology fixed-color states located hard-coded white/teal timeline marker states in `src/components/guide/StepTimeline.tsx`. Browser Night review confirmed the teal active marker. Replaced the marker constants with shared gray idle and metallic gold active tokens, using CSS variable background values so live appearance changes resolve without reinitializing the timeline. Preserved all instructional SVG artwork, geometry, scroll behavior, and content. The expanded INCOMPLETE FAQ was also visually readable in desktop Night; its existing shared override already handles its white source class.

TypeScript and Vite build passed. Packaged `index-C3Bpn_gU.js` / unchanged `index-Bp18znhh.css`; updated source patch, refreshed wiring, and route audit passed 523/523. Archived nine superseded JS bundles in `flightrisk-timeline-followup` outside deployable files. After reload, inspected desktop Night Step 02 gold marker and live switch to Day: marker remains gold with dark readable text. Restored System. Remaining guide checks remain in the acceptance matrix.

## Training journey label wrapping correction

At 390×844 Day, the selected Commercial tab split its word into `Commerci` / `al`. Adjusted the journey's existing responsive rule: gap 10→6px, prevent dot shrinking, wrap labels at word boundaries, and use two columns below 381px. This preserves the six stages, content, navigation, and selection behavior while keeping narrow labels legible. The normal three-column tablet/phone layout and desktop route remain unchanged above that threshold.

Reload verification: 390px Day Commercial fits on one line. At 320×740 Night, six tabs fit in two columns, document width equals 320, and ArrowRight Commercial→CFI then ArrowLeft CFI→Commercial updated selected state/panel with visible gold focus. At 834×1112, Day journey controls/panel and Night panel/planning details were reviewed. Shared materials remain intact. Sync/cache refresh and 523/523 route audit passed; no data or form submissions. Remaining lower-page/enlarged-text checks retained.

## Aero Lab flow-status contrast correction

Desktop browser review found the Day `Below critical angle` label using pale rgb(167,199,183) text over an almost transparent green fill. Updated `.flow-status` source rules to solid shared surface/ink, with green default and amber warning borders/dots. Preserved scientific flow colors, instrument arcs, simulation logic, geometry, and labels.

TypeScript/Vite web build passed. Packaged `index-BRFyvVe9.js` / `index-BrlkFKEs.css`, updated source patch and cache/wiring; 523/523 route audit passed. Five superseded generated assets archived to `aero-status-followup` outside deployment. Reloaded browser Day badge computes text rgb(39,39,39) on rgb(239,239,239); warning at 30-degree angle uses amber border. Night warning computes text rgb(244,244,244) on rgb(74,74,74), with amber rgb(255,202,114) border. Both are canonical contrast-tested opaque text pairs. The initial exact-input/slider reads preceded simulation updates; final DOM confirmed 30 degrees and Beyond critical angle. Reset lesson restored Below critical angle and System appearance. This bounded check does not close responsive/help/export gates.

## Aero Lab responsive handoff and help

Reviewed supported narrow-device handoff at 390×844 and 834×1112 in Day/Night. Its primary Copy link action was still gray. Added shared `gold-primary` classification and gold source tokens in DesktopGate.tsx/css. Geometry, device requirements, URLs, and clipboard logic unchanged. Clicked the rebuilt phone action; UI displayed Link copied and the live status confirmed the Aero Lab URL was copied. Both appearances show gold action and readable gray surfaces.

Desktop 1280×720 How to explore overlay visually reviewed in both appearances; Escape dismissed the Day dialog and the Night close action worked. Restored System and default viewport. TypeScript/Vite passed; package now `index-C980s7W8.js` / `index-B2Pyi143.css`. Updated source patch, synced assets/cache, route audit 523/523. Five superseded assets archived outside deployment in `aero-handoff-followup`. Export and remaining desktop-state acceptance still open.

## Consolidated current-build regression checkpoint

Ran current shared Node suite (61), Python suite (10), Aero Lab (14), FlightRisk (27), PilotSolve (36), and Part 61 wizard suite (98): all 246 tests passed. Simply Endorsed workspace passed 1,678 assertions; CertPath storage/gate suite passed. PilotSolve protected runtime passed all 28 files. Route wiring 523/523, canonical contrast 44/44, and zero unreferenced generated assets. Exact commands, evidence scope, timestamp, and current artifact hashes are recorded in `regression-checkpoint.json`. These tests do not close rendered/OS/zoom/export acceptance gates.

## Crank & Core phone/tablet study controls

Reviewed Rotax collection and Study at 390×844 Day, then Moving internals in Night. Appearance switching retained the selected study view. Reviewed Lycoming collection/loading and Whole engine Study at 834×1112 Night and Day. Gold selected controls, gray secondary controls and the existing model artwork remained visible.

Tablet review exposed the pinned runtime's cream enabled Propeller switch surface. Added a scoped checked-switch rule in `engine-explorer/app/assets/avionics-overlay.css` using shared raised gray/ink and gold edge; the existing gold rocker track remains. Reloaded and visually verified both appearances. Toggling Propeller off removed its checked state; toggling back restored it. No model/runtime logic changes. System appearance and default viewport restored. Sync/cache refresh and route wiring audit passed 523/523. Remaining model-specific controls, enlarged text and cross-cutting acceptance remain open.

## PilotSolve tablet switch correction

At 834×1112 Day reviewed Fuel numeric keypad, disabled actions before input, and a synthetic 10 US gal/hr × 2:00:00 example returning 20 US gal. Settings Night review exposed the blue enabled Solid controls switch. Replaced switch track/thumb declarations in app-owned prototype.css with canonical gray/gold tokens; unchanged dimensions, semantics and checked behavior.

Runtime guard passed all 28 protected files; TypeScript/Vite production build passed. Packaged prototype-BB03Ca4u.css / prototype-BwLH_lGl.js / mobile-D-j-Bjkv.js; updated source patch, refreshed worker cache pilotsolve-site-7310c4bc6ec3, route audit 523/523. Four superseded bundles archived outside deployment in pilotsolve-switch-followup. Reload verified gold enabled switch in Night and Day; disabled it again and restored System/default viewport. Tablet settings and backup action surfaces reviewed, but no backup restore/export delivery performed. Unsaved synthetic calculation cleared by expected reload behavior. Remaining calculation helpers, trip/aircraft and native backup acceptance stay open.

## PilotSolve trip and aircraft surfaces

On the current switch-corrected build, desktop 1280×720 Day trip review enabled Plan climb & descent and added one blank leg. Reviewed phase fields, gold Average rate selection, gray Known time option and leg entry surfaces. Opened Aircraft profile and added a blank Custom 1 station; desktop Day solve dialog shows gold Moment selection with gray alternatives. At 390×844 Night the station dialog fits above the viewport edge with readable solid gray surface and gold selection. Escape dismissed it and restored focus to the station solve trigger. Reopening and selecting Weight changed the form to calculated Weight with Arm/Moment inputs and returned focus to the updated trigger.

No code changes were needed for these bounded surfaces. Restored System/default viewport and reloaded to discard unsaved review entries, retaining saved results/preferences. These observations do not certify populated trip/aircraft calculations, all responsive combinations, native backup delivery or enlarged-text acceptance.

## Homepage lower-section and contact review

Current local homepage at 834×1112 Day: inspected instruction rows/Book action, instructor card/disclosures, tool links with retained identities, and expanded Draft an email form. Gold primary actions, gray reading/entry surfaces and secondary actions are visible. Empty Open email draft attempt stayed on-page and produced the required-name/contact alert; no data entered and no email sent. Tablet Night form/error/footer reviewed after appearance switch.

At 390×844 Night and Day, reviewed focused empty Name field, required-field borders, wrapped error message, and expanded Where do lessons take place FAQ. Gold focus ring and primary action, semantic error colors and gray surfaces remain legible. FAQ appearance changes preserved expansion. Day document width equals viewport 390px. Restored System/default viewport and reloaded. No code correction was needed for these surfaces. Desktop lower sections, complete pathway-card states and enlarged-text verification remain open; no pricing or aviation-content accuracy claim is made.

## Supporting document coverage and factory-reference correction

Expanded structural audit beyond 523 SEO-registered routes to six supporting documents: Simply Endorsed and FRAT redirects, PilotSolve mobile entry, embedded engine app, engine factory-reference shell, and Aero Lab native-flow frame. All six pass current-byte appearance/material URLs and first-script checks. Source templates, HTML partials, test fixtures and PDF artwork previews remain outside this browser-entry count. This is wiring evidence only.

Found standalone factory-reference/reference.css still declaring cyan/navy appearance tokens. Replaced them with shared g tokens, gold selected camera buttons/animated-parts action, gray shells, and canonical focus/checkbox/spinner colors. Added its CSS to content-hash sync. Desktop Day and Night loading shell and Night return action visually verified; hosted external model remained loading, so enabled camera controls/model delivery are not accepted. Model/provider code and imagery unchanged. Restored System. Audit now passes 523 routes plus 6 supporting documents; diff check passes.

## Explicit supporting-page inventory and reference cleanup

Moved six supporting documents into config/theme-supporting-documents.json with explicit reasoned exclusions for source templates, partials, print artwork and the text-size test fixture. Audit now scans all repository HTML and fails on unclassified documents; it also verifies supporting stylesheets exist and shared authority is last in the head. A temporary self-created unregistered HTML probe caused the expected audit failure; removing the probe restored a passing report. Current report has zero unclassified HTML.

Confirmed original factory-reference/reference.css is present in styles-dfd653c.tar.gz. Removed remaining superseded literal palette declarations from the active reference stylesheet and replaced with shared tokens. Phone 390×844 Day controls/loading/disclosure reviewed, document width 390px. Tablet 834×1112 Day columns, expanded disclosure and gold animated-parts action reviewed. Hosted model stayed loading, so enabled model controls remain unverified. System remained selected; viewport restored. Route audit 523/523 plus supporting 6/6, sync check zero stale HTML, diff check passed.

## Local landing template review

Reviewed /learn-to-fly-louisville/ desktop 1280×720 Day hero and three service cards; keyboard Tab from Plan the full path moved to Start ground school with visible gold focus. Desktop Night FAQ expansion displayed readable gray panels. At 834×1112, contact panel and focus reviewed in Night, then Day; expanded FAQ persisted. At 390×844 Day, stacked contact fields/action fit and document width equals 390. No contact data entered or submitted.

The same style group contains /southern-indiana-flight-training/ and /flight-instructor-louisville/. Reviewed Southern Indiana phone hero/actions/badges in Day/Night, including longer heading wrapping. Reviewed instructor tablet Night hero, gold phone action, gray secondary action and services reading panel. Existing identity icons retained. No material correction needed for observed surfaces. Restored System/default viewport. These bounded observations do not claim every lower section/viewport, text zoom, aviation-content validation or complete template acceptance.

## Blog directory responsive filters and expansion

Reviewed /blog/ 834×1112 Day/Night featured card, filters and For Instructors result. Selection remained gold and retained one matching article across appearance changes. At 390×844 Night, All articles filters wrap without clipping; Show more reveals subsequent cards. At phone Day, Aircraft returned one article. Keyboard Tab from Aircraft to Airport & Airspace then Return selected it and announced three matching articles. Document width equals viewport 390px. Returning to All articles and activating Show more twice reached the final article and removed the exhausted Show more control. Gray cards, gold selected controls/links and focus border reviewed.

No free-text search exists on this directory, and available categories contain results; no empty-results test claimed. No code correction needed. Restored System/default viewport. These observations close the previously missing tablet and phone Day baseline coverage, but enlarged text and the separate endorsement directory remain to verify. Content/aviation claims were not audited.

## Endorsement introduction and linked FAQ correction

Reviewed What Is Simply Endorsed CFI desktop Day reading/cards and Night cards, plus tablet 834×1112 Night CTA/expanded FAQ. Found automatically linked CFR text became separate flex items in FAQ summaries, spacing a single question into disconnected fragments. Updated shared blog summary layout to normal inline text flow with an absolutely positioned disclosure chevron and reserved end padding. Content, destinations and details behavior unchanged.

Reload verified contiguous linked question at tablet Night. Phone 390×844 Day screenshot verifies natural two-line question wrapping, chevrons, solid reading surfaces and gold app action. Disclosures still toggle. Restored System/default viewport. Refreshed 42 blog-family CSS references; wiring audit passes 523 routes plus 6 supporting documents. Broader guide variants, tablet Day and enlarged-text acceptance remain open.

## Simply Endorsed search and category dialogs

Current workspace desktop Day unmatched query zzzzthemeprobe returned 0 matches with a readable gray recovery panel. Phone 390×844 Night retained the query across appearance change; Clear search recovered, and IPC returned seven matches (one endorsement, one checklist, five guidance results). Phone Night category dialog retained semantic category icons and gray surfaces; expanded Recurrent & aircraft displayed its subcategories. Escape closed the dialog and DOM focus returned to Browse categories.

Tablet 834×1112 Day populated search and expanded category dialog visually reviewed. No material correction needed for these observations. Cleared test search and restored System/default viewport. No checklist progress or user data changed. This does not close full guided-workflow, zoom or all viewport acceptance.

## Tools directory remaining baseline views

Current /tools/ desktop 1280×720 Night: Previous app changed Aircraft systems selection from Crank & Core to Aero Lab, showing gold launch action and selected app rim. Expanded All apps displays all seven app identities and quiet launch links. Tablet 834×1112 Day Flight planning shows gold selected filter, PilotSolve launch action and gray directional controls; expanded list uses two columns. Keyboard Enter on Next app changed the announced stage to 2 of 2 FlightRisk. Phone 390×844 Day stage/list and visible focus ring reviewed, document width equals 390.

No correction needed for these observed surfaces. Restored original Aircraft systems/Crank & Core selection, System appearance and default viewport. Together with earlier observations, each baseline viewport/appearance now has bounded directory evidence; enlarged text, reduced effects and full pointer/touch interaction acceptance remain open.

## Certificate Generator desktop Night review/export interface

Selected First Solo, entered synthetic Sample Student, retained pre-existing Sample Instructor/CFII example, and reviewed desktop Night name fields, selected rating, photo-optional step, review/download controls and caption editor. Gold actions/selected steps and gray inputs/editor remain readable; certificate artwork retains its own original colors.

The first download observation failed because the review contains two Download JPEG buttons and the pending observation timed out during an ambiguous action. Retried once using the explicit preview button #cgDownloadBtn with an immediately handled observation. UI announced FirstSolo_Sample_Student.jpg and rendered the finished-save fallback image #cgSaveImg as a blob with natural dimensions 1080×1920. The browser download event still timed out, so native saved-file delivery remains unverified; do not count the UI announcement as file proof. Caption editor closed without edits. System restored; sample preview remains available for review. No source changes were needed for these surfaces.

## Learn phone search and native clear-control correction

Reviewed populated weather search with Weather and Safety selected at 390×844 in Day and Night. The 42-result state and selected topic persisted across appearance changes. Found WebKit's native blue search-clear icon; scoped its existing pseudo-element to the shared gold accent with a masked x, retaining native clearing behavior. Day/Night screenshots confirm the gold icon and focus ring. Clicking the icon cleared the query while retaining the topic.

Keyboard Tab moved from search to Topic, Training stage, then Clear filters; Return reset all three fields and restored the 459-item library status. Document width equals 390. Restored System and default viewport. Shared asset URLs refreshed across 545 HTML sources and standalone cache digests refreshed. Wiring audit passes 523 registered routes plus six supporting documents; all 44 canonical contrast pairs pass (minimum 4.75). Forced-colors fallback is implemented but not natively exercised. Full-page, zoom, OS-setting and export acceptance remain open.

## FlightRisk tablet assessment and guide warning correction

At confirmed 834×1112, reviewed restored synthetic VFR/Private assessment profile and LOW 3 results in Day/Night. Native Escape closed Night results and focus returned to the responsive Results button; document width 834. The initial resize before full navigation reset to desktop, so tablet evidence begins only after reapplied size and DOM confirmation. Synthetic assessment values were not changed.

Guide worked example reviewed in Day/Night, then found the OVERRIDE → HIGH badge retained translucent white behind light red text in Night. Replaced that app-owned background with the existing solid semantic high-risk tint. An intermediate gray-surface candidate measured only 4.17:1 and was rejected. Final browser-computed Day/Night pairs and contrast are in flightrisk-override-contrast.json; screenshots confirm warning semantics and readable label. All 27 FlightRisk tests and TypeScript/Vite build passed. Packaged final index-BG7_EtUz.js / Guide-C2BBwHsc.js with unchanged index-Bp18znhh.css, updated source patch, archived 18 superseded bundles with dependency/hash verification, and passed 523-route plus six-supporting-document audit.

System/default viewport restored. This is material and interaction evidence, not a validation of aviation guidance or native printing. Full guide lower CTA, other assessment bands/IFR and enlarged-text checks remain open.

## FlightRisk override family and guide lower actions

Searched remaining translucent-white utility use in app-owned FlightRisk components after the guide correction. Found the same warning-surface issue in FlightProfileCard's IFR badge and OverrideActions' methodology icon/badge. Replaced those three backgrounds with the existing semantic high-risk tint; kept colors, wording, calculations, layout and export styles. Other white-opacity matches are switch hardware, gold glints, or button count overlays and were not treated as the same warning defect.

Rebuilt and packaged index-DttITNAe.js, Assessment-DEPPpDDC.js and Methodology-DyNQGesM.js; source patch regenerated. All 27 tests plus TypeScript/Vite build pass; wiring audit 523+6 passes. Archived nine superseded bundles with dependency/hash verification. Tablet Night methodology and synthetic IFR/not-rated warning screenshots confirm the corrected label/icon; computed badge colors match the previously measured 6.442:1 pair. Phone Day warning wraps and fits, with semantic red retained. Returned synthetic profile to VFR and reconfirmed it; experience inputs unchanged.

Guide phone Day/Night lower CTA reviewed, gold primary and gray secondary visible; keyboard Tab from Open FlightRisk reached Review the methodology with a gold focus ring. The link navigated correctly, document width 390. Save/share FAQ expanded and displayed its local-storage/print answer. Restored System/default viewport. These checks do not close the full IFR workflow, native print, reduced-motion or zoom gates.

## Service template tablet coverage

Reviewed Discovery Flight at confirmed 834×1112: Day hero/details, contact anchor, empty form validation, then Night form/error/actions and expanded FAQs. No contact information entered and no email draft or call launched. Keyboard Tab from gift FAQ reached What happens after the flight; Return opened it, confirmed via native details open state. Document width equals 834.

Ground-school service variant reviewed at the same tablet size: Night hero and three training cards; Day cards, expanded remote-session FAQ and footer. Existing category identity icon retained, gold primary/gray secondary/quiet reading links remain consistent. No new visual defect found in these observed surfaces. Restored System/default viewport. This fills missing tablet baseline observations but does not establish complete page/variant, zoom, motion or message-delivery acceptance.

## Endorsement content missing baseline views

CFI endorsement cluster guide: reviewed desktop Day cards, tablet 834×1112 Day cards/note/CTA and Night note/CTA/footer. Gold primary and gray secondary actions remain distinct. Keyboard Tab from Open the Simply Endorsed CFI tool reached Read the CFI initial guide with visible gold focus. Primary launch reached the actual Simply Endorsed task workspace. Tablet document width equals 834.

Introduction article: reviewed tablet Day audience/coverage cards, reading and gold app CTA; native FAQ opened and its details state was confirmed. No visual correction required in these observed views. Restored System/default viewport. This adds missing baseline combinations, not complete article/guide-variant, enlarged-text or content-accuracy acceptance.

## PilotSolve phone Day and calculator appearance persistence

At 390×844, repeated keypad input 125 × 4 produced 500 with readable Day keypad, solid result area, gold equals/selected controls and disabled memory actions. Found calculator expression/answer were lost when visiting Settings to change appearance and reopening Calculator, because draft hooks belonged to the unmounted route. Lifted calculator expression, mode, error and answer into a parent-owned in-memory session hook. No AppState, backup format or calculation engine changes. Explicit Reset session and Reset app data also clear the draft.

Rebuilt preview reproduced 125*4 = 500, visited Settings, changed Night to Day, returned through Tools and reopened Calculator: expression and answer retained. Explicit Reset session then restored empty expression, no answer and disabled Store. Full existing PilotSolve test command, 28-file protected runtime check and TypeScript/Vite build pass. Packaged prototype-DOuNOj3r.js / mobile-Bya7Y8qO.js / preview-C6OAzi0g.js with unchanged prototype-BB03Ca4u.css; source patch regenerated. Cache now pilotsolve-site-8b1f80f13020, wiring audit 523+6 passes, old bundles archived. System/default viewport restored.

This verifies the observed appearance-related state-loss fix and phone Day keypad; it does not close populated trip/aircraft, native backup delivery, zoom or all helper workflows.

## FOI longest-answer responsive review

Read current card inventory to choose the longest answer (card119, 472 characters), then navigated through Flight instruction via native section/Next controls without assigning ratings. At 390×844 Day, the answer's internal scroll area reaches its final line and Tap to return; Night appearance retains the same card and scroll position with readable answer/rating controls. At 834×1112 Day/Night, the entire long answer and three rating controls fit in the reviewed study surface. Existing semantic answer/rating colors retained.

No material correction needed for these observations. Restored All remaining cards to Card2 / pass2of238, confirmed238 left and0review later; no ratings changed. Restored System/default viewport. This closes the previously unreviewed long-answer surface, while enlarged-text, native reduced-motion and full interaction matrix remain open. Content was not audited in this visual pass.

## Endorsement directory variant

Reviewed /simply-endorsed/blog/ desktop Day three-column listing, tablet834 Day/Night two-column listing, and phone390 Day/Night lower app CTA/footer. The last Logbook Audit card navigated to its guide; returned to directory. Phone Tab from Open Simply Endorsed CFI reached Search the app with gold focus; document width390. No material fix needed for observed surfaces. System/default viewport restored.

Focused source search across blog/style.css, learn/style.css, simply-endorsed/css/seo.css and assets/contact-form.css found no literal background/text fills except intentional semantic error fallbacks in contact-form.css. This is a scoped source check, not proof about all computed styles. Directory desktop Night and complete phone listing/zoom remain to review.

## Endorsement directory Night and phone listing continuation

Reviewed desktop Night hero/listing, then phone390 Night listing in sequential scroll screenshots through the final article and CTA. Long checkride/recreational headings wrap; all19 cards have350px client/scroll widths and document width390. Day phone checkride cards also reviewed; all19 card text colors compute to canonical ink, link colors to canonical accent/hover ink, with zero card overflow. All19 post-card hrefs resolve to existing local article files. Initial source selector matched0 because cards use post-card, then corrected selector asserted19 before validating targets.

No new correction needed. System/default viewport restored. Baseline directory appearance coverage is now recorded across all sizes, while enlarged text and complete interaction/accessibility acceptance remain open. Local target presence does not prove remote publication or article-content accuracy.

## Blog table word-wrapping correction

Private-pilot-cost article at390×844 exposed words splitting into fragments in table cells (for example Louisville and planning), caused by inherited shared overflow-wrap:anywhere. Set overflow-wrap:normal on .prose table in blog/style.css, preserving its width/layout and existing table-wrap horizontal-overflow container. Reload confirmed intact words,348px table/wrapper width and390px document width. This particular table fits without horizontal overflow after correction; horizontal gesture behavior is therefore not claimed.

Reviewed corrected phone Day top rows and Night middle rows, plus tablet834 Night header/rows. Gray reading surfaces and text remain readable. Refreshed42 blog-family stylesheet URLs; cache refresh and523+6 wiring audit pass. Restored System/default viewport. Wider table variants, lower article CTA, zoom and full-page acceptance remain open. No article data or claims changed.

## Wide blog table keyboard access

The timeline article has the widest current blog table (four columns). At390×844 its table is the actual block scroll container (599px content/348px viewport), while the outer wrapper remains348px. Touch-style horizontal scroll reached the last columns and the page stayed390px. Found no keyboard focus target on the scrollable table. Added tabindex=0 and a descriptive aria-label to all three current blog tables (timeline, cost, aircraft comparison), plus an inset canonical-gold focus ring in blog/style.css. No data, column widths or scrolling implementation changed.

Reloaded timeline: ArrowRight focused the table and moved scrollLeft to40px; further ArrowRight input reached251.5px and the final column. Day/Night screenshots confirm focus ring and readable cells. Phone Day/Night lower article CTA also reviewed: gold booking action and gray message action fit. No external action submitted. Refreshed42 CSS references, cache refresh and523+6 route audit pass. System/default viewport restored. Other table content, zoom and full article acceptance remain bounded; current evidence verifies native table scrolling and focus.

## Training lower-page materials

Reviewed /flight-training-louisville-ky/ desktop Day service cards and empty contact form validation; tablet834 Night form/error/actions; phone390 Night reading/FAQ/final-next-step panel and Day final contact actions. No contact data entered, no email/call launched. Expanded ground-instruction FAQ and validation state persisted across appearance changes; phone document width390. Gold primary, gray secondary and solid reading surfaces remained consistent in observed sections. No new correction needed. Restored System/default viewport. These observations supplement journey checks; full-page combinations and enlarged-text/native reduced-effects acceptance remain open.

## CertPath residual decorative-token consolidation

Replaced31 literal decorative colors in assets/tool-system/part61-redesign.css with existing g-surface, g-raised, g-well, g-ink, g-muted, g-accent, g-line and g-edge tokens. This includes hero secondary text, reference/ledger reading surfaces and links, goal labels, focus outlines and no-time review controls. Existing selectors, geometry and semantic green completion values remain unchanged. Many earlier literals had broad downstream overrides; removing them also prevents latent states from restoring cream/olive surfaces. Shadow/backdrop alpha colors remain material effects.

Refreshed the one affected HTML stylesheet hash and app cache manifests; audit confirms523 registered routes and6 supporting documents. Browser reloaded current build and reviewed zero-hour summary at1280x720 Day and390x844 Night. All18 zero hour values retained across appearance switching; Review or edit totals reopened the form. Visible Night numeric fields computed ink244/surface84, document width390. No contact or result-gate submission. Restored System/default viewport and reloaded to clean intro; no saved user progress deleted. Result details remain source-integrated but not rendered-accepted behind the contact gate. No calculation or data code changed.

## CertPath base-control material consolidation

Replaced remaining primary-action rule families in part61.css (default, hover, panel-next and late calculator override) with g-gold/g-key-ink/g-edge/g-shadow. Default secondary controls, hover and text/numeric focus surfaces now use g-raised; legacy blue/orange focus glows use the shared gold accent. Header-action shadows also use g-shadow. Changed only targeted interactive declarations and neutral material variables; semantic invalid/completion styles, print rules, geometry and calculation logic were not modified. Other historical base declarations still require scoped review.

Added part61.css to sync-avionics.py content-hash assets, replacing stale v=1. Sync/check, cache refresh and523+6 wiring audit pass. Current browser reload verified desktop Day selected Private and Continue controls, then desktop Night numeric focus with gold ring and gray fill. No values or contact information entered. System appearance restored. Result/print/native gates remain open; these observations do not close full acceptance.

## CertPath selected credentials and legacy branding

Removed hardcoded orange brand declarations and old blue/orange decorative glows from part61.css. The legacy body.theme-orange class remains for compatibility but its material aliases now resolve to shared gold tokens. Selected option buttons use g-gold, g-key-ink and g-edge. Per-group category palettes, semantic completion/error colors, geometry, data and calculation logic remain untouched. Updated stale comments describing the superseded brand.

Sync/check, cache refresh and523+6 wiring audit pass. Current browser reload: selected Student Pilot on desktop Day renders gold; phone390 Night search for student retained the selection and showed gold focus/native clear, selected credential, gray removable chip and gold Continue. Removing the synthetic credential restored Student Pilot Add. Cleared query, restored No certificate yet, System and default viewport, reloaded to intro. No contact submission. These checks cover selection/search/removal and materials, not contact-gated results or full workflow acceptance.

## Refreshed regression checkpoint after material consolidation

Current shared Node61, Python10, Aero Lab14, FlightRisk27, PilotSolve36 and Part61 wizard98 tests all pass (246 total). Workspace1678 assertions pass; CertPath storage fresh/gate/failure/retry/save/reopen/update checks pass; PilotSolve28-file runtime guard passes. Canonical contrast44/44 (minimum4.75), route wiring523+6 and unreferenced generated assets0. All23 packaged PilotSolve/Aero/FlightRisk JS/CSS files match their local dist outputs by SHA256.

Archived the earlier checkpoint under regression-history and refreshed regression-checkpoint.json with current material, package and test hashes plus source-tree digests. This resolves stale checkpoint hashes after recent PilotSolve/FlightRisk and shared/CertPath stylesheet updates. It does not establish native exports, live OS effects, actual200% zoom, full visual acceptance or content-source accuracy. Production remains unpublished.

## Learn CFI lower collection and native-settings boundary

Attempted to open macOS System Settings for live appearance/reduced-motion acceptance. Computer-use tool reported the Mac locked and automatic unlock unavailable; no OS settings were changed. This is an environmental limitation for native checks, not a failure of the web appearance logic. Other local work remains available.

Reviewed /learn/cfi/ lower related collections at desktop1280 Day/Night and phone390 Night; reviewed final related card and shared footer at phone Day. Night keyboard Tab from Pilot Career Guides reached Checkride Prep Guides with visible gold focus. Phone document width390 equals viewport. All three related-card titles and descriptions wrap without clipping in observed views. No source fix required. Restored System/default viewport. Other category variants, tablet lower sections, enlarged text and live OS settings remain open.

## Shared tool control finish cleanup

Updated tool-core.css: four residual blue control-border declarations use g-line; native text selection uses g-mid/g-key-ink; tool-nav divider uses g-line; menu-button shadows use g-shadow/g-glass-edge; focus rings use g-accent. Preserved blue app-identity tokens and semantic category/scenario palettes, print colors and geometry. Sync refreshed four HTML sources; cache refresh, sync --check and523+6 wiring audit pass.

Current Simply Endorsed browser view: entered New student task and checked only Establish the training goal in the temporary checklist. System resolved Night; reviewed checkbox and1of7 status. Day desktop and Night phone390 completion-review panels retain the disabled final checkbox and explanatory text. Appearance changes retained temporary progress. Unchecked the synthetic review item, restored System/default viewport and returned to All tasks. This adds bounded task/disabled-state evidence; no endorsement issued or personal data entered. The previous regression checkpoint remains valid for tested logic, but its tool-core.css hash predates this CSS-only cleanup.

## Certificate Generator app-owned selection and focus

Updated certgen.css selected-certificate rule to directly use g-gold/g-key-ink/g-edge/g-shadow, replacing certificate-tinted selected fills and rings that had been superseded by the shared cascade. Certificate identity swatches/side accents remain. Input focus halos now use a30% shared gold accent rather than the neutral tool-soft surface; semantic invalid borders remain red. Primary-action base/hover shadows use the shared shadow and highlight tokens. Certificate artwork/canvas/export code, crop guides and geometry were not changed.

Refreshed one CSS reference, caches and523+6 wiring audit; sync --check passes. Browser verified First Solo selection, empty student-name Continue validation and gold focus in desktop Night and tablet834 Day, plus tablet selected-certificate grid. Photo/Review and export actions remain disabled with missing student names. Previously saved synthetic instructor defaults Sample Instructor/CFII retained; no names entered or artwork exported in this pass. Restored System/default viewport. This is bounded form/selection evidence; native-file delivery and remaining crop/review combinations stay open.

## Simply Endorsed fallback controls and offline revision fix

Static scan found no undefined g-* tokens across34 site/app stylesheets (22 definitions,20 referenced names). Updated legacy Simply Endorsed browse launcher primary/hover, selected DPE chips, secondary surfaces, focus and navigation edge to shared gold/gray tokens. App category/status data and palettes retained. Added simply-endorsed.css to sync content-hash assets, replacing v=2. These legacy fallback controls are source-integrated, not newly rendered-accepted by this pass.

Found offline worker still precaching tool-core.css, simply-endorsed.css and part61.css as v=1; its revision previously only hashed the redirect HTML and shared asset entries. refresh-tactile-caches.py now updates all three style URLs by content and hashes every precached asset plus normalized worker policy. Current cache simply-endorsed-tactile-5edfdbeac820; PilotSolve unchanged. Added an isolated filesystem regression that changes each style, app.js and worker policy: every change rotates only the endorsement cache; repeated refresh remains byte-identical. Extended worker-install regression to require current style hash URLs. Six focused Node tests and one Python fixture test pass; sync check and523+6 route audit pass. Native offline browser delivery remains a separate acceptance item.

## Factory-reference Night responsive and provider fallback

Navigated current local factory-reference page. DOM confirms Sketchfab SDK loaded and assigned the expected provider embed URL; hosted model did not signal ready. Waited for the existing45-second initialization deadline: loading changed to Hosted reference unavailable with an Open Rotax configurator link; camera/equipment controls remained disabled. No cause beyond failed readiness is established, and no geometry was fetched or substituted by this work.

Reviewed tablet834 Night loading/control shell and phone390 Night disclosure, disabled controls, unavailable panel and gold return action. Returned via Explore the animated parts to the local Rotax engine application. Default viewport restored; System preference retained. This closes previously unobserved responsive Night shell/failure-state coverage, but successful provider loading and enabled model controls remain unverified. No source change needed.

## PilotSolve populated aircraft readout correction

Entered a synthetic aircraft profile (1500lb empty weight,40in arm) through the actual numeric keypad and loaded profile stations. Empty station computed60000.00lb-in; incomplete other stations correctly withheld total loading. Desktop Night revealed the calculated field label touching its value. Added scoped flex spacing/wrapping and tabular numerals to .pilot-app .calculated-field in app-owned prototype.css; no calculation/state/data changes.

Runtime28-file guard, TypeScript and Vite production-config build passed. build:app offline stage initially used its default nonexistent sibling site path; reran build-offline.mjs with SUAREZ_SITE_ROOT pointing to this worktree successfully. Packaged prototype-CbtqH6Pp.css, prototype-CaUbXWQg.js, mobile-Co4tACtC.js and preview-CNp9GoIX.js. Regenerated source patch, refreshed caches (pilotsolve-site-accfb0d215f3),523+6 audit passes; archived four superseded bundles with manifest under pilotsolve-loading-readout-followup.

Reloaded current package and repeated the synthetic profile entry. Phone390 Day and Night screenshots show the calculated label and60000.00 separated, solid readout, tactile editable values and no page overflow. Appearance Settings round trip retained station values. Restored System/default viewport and reloaded; confirmed no station-name fields and blank total, then returned Tools. No saved calculations changed or backup exported. Other stations, populated trips, helpers and native backup delivery remain open.

## PilotSolve populated trip review

Used native keypad and time separator to enter one Synthetic preview leg:60NM, true course90degrees, TAS120kt, wind from0/speed0, fuel flow10gal/hr and departure12:00UTC. Computed results displayed120kt groundspeed,0WCA,90degree true/magnetic/compass headings,00:30ETE,5gal and12:30arrival. This is a synthetic arithmetic/interaction example, not operational planning guidance.

Reviewed desktop Night and phone390 Day/Night populated leg/totals and gold Add leg. Settings appearance round trips retained all values/results; phone document width390. Solid result surfaces remain readable. No new source correction needed. Restored System/default viewport, reloaded and confirmed zero Leg name controls before returning Tools. No saved data or exports changed. Multi-leg/phase variants, helper workflows and native backup delivery remain open.

## Homepage desktop lower controls

Reviewed1280x720 Night pathway cards, instruction-service rows and empty-contact validation; Day pathway cards, tool cards and retained contact error. Keyboard Tab from New to flying reached Already training with clear gold focus. Current homepage pathways are three links, not selectable journey tabs; training-page journey controls are covered separately. Gold booking/email-draft actions and gray cards retained readable contrast in observed sections. No contact values entered, no email/call launched. Closed draft disclosure, restored System and returned hero.

No source correction needed. These checks add desktop lower-section evidence; expanded instructor biography/certificates, remaining viewport combinations and enlarged-text/native-effect acceptance remain open.


## Homepage expanded biography and credentials

Reviewed expanded biography and FAA credential disclosure at desktop1280 Night/Day and phone390 Night/Day. Native summary Enter toggles and Tab into the first credential source link worked, with visible gold focus. Phone document width remained390. Existing source links were not opened and content accuracy was not re-audited.

Found a legacy -8px margin on the profile Say hello control causing its box to overlap the availability label by about4px on desktop. Replaced it with12px separation and a phone-specific8px top gap/zero left margin. Reloaded current source and verified desktop Day/Night separation and phone Day spacing. No navigation/content changes. Route wiring audit remains523/523 plus6/6 supporting documents; no app rebuild needed for this homepage-only correction. Restored System, desktop viewport and collapsed biography/credentials. Tablet variants, enlarged text and remaining acceptance gates remain open.


## FlightRisk methodology lower references and actions

Reviewed lower reference cards, calibration note and Run an assessment action group at desktop1280 Night, tablet834 Day/Night, and phone390 Day (Night phone action group also reviewed). Gold primary actions and selected navigation, gray secondary controls, solid reading cards and semantic risk badges remain distinct. Phone document width390 matches viewport. Keyboard Tab from Open the tool reached Read the guide with visible gold focus; FAA FRAT source link to PAVE source link likewise showed visible Day phone focus after scrolling settled. No external source or contact link opened, and no scoring/content changes made. Restored System/default desktop viewport.

These observations complete the named lower-section visual checks for those combinations; desktop Day/phone Night reference combinations, full-page keyboard traversal, enlarged text and native-effect acceptance remain open. No implementation correction required.


## Crank & Core legacy copper stylesheet retired

Material source scan found engine-explorer/app/brand/copper-theme.css still linked by the app shell beneath Aurum overrides. Archived the exact file outside deployable source to style-archive-before-aurum-20260924/crank-copper-theme-retirement/legacy-copper-theme.tar.gz; verified archive bytes before removal and recorded SHA-256/size in docs/design/archived-copper-theme.json. Removed its HTML link and retained the circular product-mark geometry and wordmark accent through the Aurum adapter. No model/scientific colors or runtime logic changed.

Refreshed shared content-hash references/caches. Route audit523+6 passes; both crank-blueprint regression tests pass. Reloaded browser confirms no copper stylesheet link, circular mark50%, and selected Lycoming button uses canonical gold gradient/dark label. Desktop Night collection/Whole engine Study and Day Fuel injection Study views rendered correctly after live selection. Restored System and engine collection. This removes a conflicting active legacy source; it does not complete remaining model-specific/zoom acceptance.


## FOI primary material source consolidation

Removed welcome/completion primary buttons from the legacy gray-secondary rule and gave both a scoped canonical gold/edge/key-ink material with shared glass-edge/shadow tokens. Start was already gold via shared ID override; completion Review later cards had remained gray in app-owned CSS. Replaced remaining targeted button/contact-action literal shadows with shared tokens. Semantic rating/answer colors and all study behavior/data remain unchanged.

After reload, DOM computed styles confirm Start and hidden Review later cards both resolve to the same canonical gold gradient/dark text/bronze edge. The hidden completion control has style evidence only, not a rendered completion-flow review. Resumed existing Card2 and flipped it; desktop Night and phone390 Day ratings remained amber/neutral/green and readable. Restored System/default viewport and reloaded: Card2/pass2,238 left,0review unchanged. Section-dialog regression test passes; sync and523+6 route wiring audit pass. No saved progress reset or external link opened.


## Shared decorative fallback consolidation

Audited public/shared CSS literal colors. Retained category palettes, sky artwork, semantic risk/progress colors and neutral masks. Replaced two old FOI rating palette declarations in premium.css with the same semantic token mixes used by the app; replaced olive/gold search-focus/hover shadows and FOI primary shadow with shared gold/material tokens. Conversion-bar call-button default/hover backgrounds now use shared glass/raised surfaces. Footer fallback text/surface/focus values now resolve through Aurum rather than historical blue-black literals. Layout and navigation untouched.

Sync refreshed531 HTML sources; Simply Endorsed cache is simply-endorsed-tactile-2a749a23e8ec. Wiring523+6 and44 canonical contrast pairs pass (minimum4.75:1). Eight Node footer/offline tests and seven Python footer-sync/cache-refresh tests pass. Browser reload checked FOI Night primary controls; phone390 homepage footer Explore disclosure and Learn focus rendered in Day/Night. Restored System/default viewport and collapsed mobile Explore. Legacy conversion-bar/filter-rail controls have source integration only here; no claim of rendered coverage for those dormant/alternate controls.

Follow-up: footer CSS had not been included in sync-avionics shared_versions. Added it and refreshed519 HTML references to its actual content hash bcb3bee0de; repeat --check reports0stale,523+6 audit passes. This closes the stale footer URL discovered during final hash verification.


## Managed theme asset integrity

Replaced duplicated sync-only asset lists with config/theme-assets.json and scripts/theme_assets.py. Both sync and audit now use the same 32 content-hashed theme assets. Audit validates stylesheet/script URLs anywhere in registered or supporting HTML, including footer body links, relative app URLs and single-quoted attributes; rejects missing/stale/duplicate v parameters and the retired Crank copper stylesheet. External assets and nonstylesheet links are excluded. All authored stylesheet families found in the route report are now managed; generated Vite filenames retain their build hashes.

Added library-search.css, premium-home.css and model-info.css; two formerly unversioned entry-point links refreshed. Seven focused unit cases plus the existing cache-refresh test pass, including changed asset bytes invalidating an old URL. Final sync check0stale and strengthened523+6 audit pass. This is structural cache/integration evidence, not new visual/workflow acceptance. No CSS declarations or application logic changed in this pass.


## Simply Endorsed completed temporary intake review

Using the local New student task with no pilot data, checked the six prerequisite/conditional controls. The final Review the next training milestone checkbox changed from disabled to enabled. Checked it to display7of7reviewed and the explicit temporary-review/endorsements-separate message. Reviewed desktop Night completion summary and phone390 Day summary/final row, plus Night final row. Day keyboard Tab from final checkbox reached Details & source with visible gold outline. Appearance changes retained temporary checked state. Semantic completion green, category identity and gold navigation remained readable.

Used Reset to clear all seven temporary selections; verified0of7,2unresolvedconditions and final checkbox disabled. Returned All tasks, restored System and desktop viewport. No endorsements issued, no pilot records entered, no source accuracy claim. No source correction required. Other guided workflows and enlarged text remain unverified.


## Embedded route palette cleanup

Source inventory found0inline style-attribute color literals but10embedded style rules with hex colors across five authored routes. Replaced training journey dot/selected gradient/border and gold connector/glow literals with shared tokens; replaced Simply Endorsed/CertPath muted fallback text, endorsement introduction icon/step badge backgrounds/text, and engine host canvas/title colors. No layout, navigation, diagrams or content changes. Follow-up embedded-hex scan finds0matches (bounded to CSS color/background/border declarations, not a complete color/cascade proof).

Reviewed training Instrument desktop Night and Commercial phone390 Day selections; endorsement introduction icons/numbered steps desktop Day and numbered steps phone390 Night, no horizontal overflow; engine host/collection desktop Night. Restored System/default viewport. Route audit523+6passes. These visual observations do not establish instructional accuracy or complete viewport/interaction acceptance; fallback text rules in the two apps remain source-level evidence for this pass.


## FOI rendered completion flow on isolated local origin

Opened a separate local origin http://localhost:8898/foi-cards/ (primary preview uses127.0.0.1). Its initial UI showed no saved pass,238remaining,0review. Selected the11-card ADM and safety section, marked its first card Review, then advanced the remaining10with Next. Actual workflow reached Session complete with238remaining/1review and the gold Review later cards action. Desktop Night screenshot shows gold primary plus visible keyboard focus; phone390 Day screenshot shows primary/secondary/back controls without clipped text. Clicking Review later cards opened Card121,pass1of1. This supersedes prior style-only evidence for that completion action. No original127.0.0.1progress was accessed or modified by these interactions.

Cleanup boundary: Reset study progress click on the isolated localhost origin caused a browser input timeout; getJsDialog returnedundefined, AX/key/close commands timed out while tab inventory still listedtab7. No reset/closure confirmed; isolated test data may remain238remaining/1review in localhost storage. Default viewport restoration also did not execute after close timed out. Original session unchanged is supported by separate-origin isolation, not a post-check this turn. Native browser reset prompt recovery remains open. No source changes in this pass.


## Shared/PilotSolve regression follow-up and browser recovery

Browser inventory confirms isolated testtab7no longer exists. Main preview responds normally and viewport restored1280x720. Reopened original127.0.0.1FOI and confirmed Card2/pass2,238remaining,0review unchanged. The localhost test-storage reset remains unverified; tab closure does not prove clearing it.

Fresh shared Node61/Python18/PilotSolve36tests pass (115total); PilotSolve runtime28protected files pass. All five current packaged PilotSolve bundles exactly match local dist bytes. Strengthened route audit523+6, canonical contrast44/min4.75, and0unreferenced generated assets pass. Saved current artifact hashes and exact scope in regression-followup.json; older full-app checkpoint remains historical. No claim that these checks prove remaining rendered/OS/zoom/native-export acceptance.


## FlightRisk guide responsive timeline

Reviewed phone390Night timeline steps2/3/5and Day step1; tablet834Day/Night alternating timeline covering steps1–4. Gold visited markers/connectors, solid gray callouts and unchanged instructional risk-color images remain readable without horizontal overflow (tablet document834). Native images deliberately retain their white artwork backgrounds. Opened INCOMPLETE FAQ at tablet Night and used Tab to next question; visible gold focus and readable expanded answer. Closed FAQ, restored System/default1280viewport.

No source correction required. These bounded observations close the named responsive timeline gap for reviewed portions, not every full-page/appearance combination, enlarged-text acceptance, or aviation claim accuracy.


## Reduced-motion pseudo-elements and pressed links

Shared CSS review found quiet/reduced-motion blocks omitted ::before and the old reduced-motion button:active transform override was less specific than primary pressed rules; anchor primary actions were also uncovered. Added ::before to animation/transition/scroll suppression and a specificity-matched active control selector for button/link/summary/role-button controls. Layout transforms remain untouched. Applied equivalent behavior to the explicit quiet-effects setting.

Browser FlightRisk guide menu Solid controls check resolves quiet; Start an assessment plus its ::before/::after all report animation none/transition0s, dock backgroundrgb74 opaque/backdropnone and screenshot retains proper placement. Unchecked Solid controls and confirmed normal effects restored, System unchanged. Native OS reduced-motion/active pointer rendering remains unverified. Sync545sources; caches pilotsolve-site-d838f896dca0 and simply-endorsed-tactile-25d061e215db;523+6wiring passes. Recent regression-followup hashes predate this CSS/cache update and are historical for those artifacts.

Focused navigation/tactile/offline/PilotSolve-cache regression run:23tests pass after the reduced-motion CSS update. These logic tests supplement, rather than prove, the rendered CSS motion behavior.


## Quiet text-action material

Added a shared quiet-action adapter for btn--tertiary,button.text-button,part61-text-button and part61-quiet-button. These declared text actions now have transparent surfaces/borders, no hardware shadow, gold text and underline on hover/focus; dimensions/padding and shared focus ring unchanged. This addresses the raised Back to deck treatment observed during FOI completion without altering primary gold actions.

Browser reviewed homepage Say hello focused at desktop Night and phone390Day; gold text and clear focus ring retain layout/touch area. Restored System/default viewport. FOI/CertPath selectors require follow-up rendered checks after this shared change. Sync545sources, caches pilotsolve-site-9e65f88e1b8d and simply-endorsed-tactile-29721178de24; route audit523+6passes. Canonical contrast44pairs pass; repeat sync0stale. Prior regression checkpoint hashes remain historical.


## Quiet-action app follow-up

CertPath: opened default Private/No certificate scenario and blank0of18experience form. Desktop Night and phone390Day show zero-fill/Next group text controls as gold with no background image/shadow; focused zero-fill has visible gold ring. Regular Back remains gray secondary hardware and returns to background. No values entered/zero-filled, contact gate not accessed. Restored System/default viewport and reloaded to intro.

FOI: reopened isolated localhost origin; prior test Review mark still persisted, confirming reset had not cleared it. Resumed its1-cardpass and advanced Next to completion. Reviewed quiet Back to deck focus at desktop Day and phone390Night while primary Review remained gold and secondary remained gray. Back to deck returned welcome correctly. Restored isolated origin to System, default viewport and closed tab8successfully. Test origin retains238remaining/1review; primary127.0.0.1study data not touched. No new source correction needed; this supplies rendered follow-up for the quiet-action adapter.


## Archive integrity and legacy FlightRisk server retirement

Verified all21archive tarballs against their per-file SHA-256 manifests:393file entries,340unique retired paths, no missing/mismatched bytes. Original53source snapshots remain recoverable alongside later generated-asset retirements. Verification discovered an unused1,722,080-byte FlightRisk server/index.js containing embedded obsolete app bundles. The static-site build explicitly excludes server output; archived this leftover copy, verified exact bytes before removal, and registered its path as retired. No active app runtime or calculation source changed.

Final deployable HTML/JS/CSS/JSON scan finds no retired filenames/paths; excludes tooling, evidence and the configuration retirement registry. Saved exact archive hashes and scope in archive-verification.json; server evidence in archived-flightrisk-server.json. Route wiring523+6and seven managed-asset tests pass. This establishes archive recovery and source separation, not completion of remaining visual, OS, zoom or export acceptance.


## PilotSolve phase and multi-leg control review

On phone390, enabled climb/descent, entered synthetic departure altitude1000and Known time climb0:10:00using the visible keypad. Reviewed Night selector, focused duration, contextual Clear menu and time keypad; Day selector/focused duration retained the entered values after navigating through Settings. Active method is metallic gold, inactive method/inputs gray, focus visible. Added five temporary legs; Add leg(5max) is visibly disabled above dock in Day and Night. Expanded Leg5, keyboard-focused gray Remove leg in Night, removed it and confirmed Add leg re-enabled. No calculation or aircraft-specific performance claim; incomplete phases intentionally show validation instead of results.

Restored System via Settings, reloaded, returned Trip and verified no legs, blank totals and phase switch off. Restored1280x720viewport. No saved calculations or aircraft profile changed. No source fix required. Remaining populated multi-leg phase results, helper states, enlarged text and native backup delivery remain open.


## PilotSolve populated two-leg phase results

Entered a synthetic no-wind two-leg example through the numeric keypad:60NM per leg,90degree course,120kt cruise; departure/arrival1000ft,cruise4000ft; climb500ft/min at90kt/12gal/hr,descent500ft/min at120kt/6gal/hr,cruise10gal/hr. No departure time entered. UI reports TOC9NMafter6min,TOD12NMbeforearrival,phase segment distances9/51/48/12NM,120NMtotal,01:02rounded time,10.0galrounded fuel. Independent arithmetic:6+25.5+24+6=61.5min;1.2+4.25+4+0.6=10.05gal before display rounding. This is a synthetic regression example, not an aircraft performance recommendation.

Reviewed solid result surfaces and gold actions at desktop1280Night(climb/TOC) and Day(descent/totals),tablet834Day(TOC/climb/cruise/descent/totals) and Night(cruise/descent/totals),phone390Day/Night(descent/totals). Text and units remain contained; appearances retain inputs and calculated values. No visual correction required. Restored System/default viewport, reloaded and verified no legs/blank totals/phase switch off. No saved profile/calculation modified. Remaining helper/aircraft states, enlarged text and native backup acceptance remain open.


## PilotSolve input-helper and cross-tab appearance review

Opened Altitude > Calculate Indicated altitude picker and its nested helper. Entered synthetic pressure altitude1000ft/barometric pressure29.92inHg; helper displayed998.839ft and enabled the gold return action. Reviewed desktop Night and phone390Night populated helper, visible keyboard focus and phone Day picker. Opened a second same-origin homepage tab and selected Day in shared Appearance: existing helper switched Day without navigation, retaining values/result. Used its return action; parent density-altitude form restored with998.839in Indicated altitude, Calculated provenance and1of3inputs. Reopening helper and Cancel preserved that parent value.

Phone Day cross-tab screenshot showed an apparent partial return-button label repaint despite full accessible name and successful return; this specific visual detail needs a fresh rendered recheck before accepting all helper visuals. No source fix inferred from that screenshot. Restored System from second tab, closed it, reloaded primary and verified0of3/blank inputs; default1280viewport restored. No saved result created. This verifies scoped helper return/cancel and app/shared-shell cross-tab state continuity, not scientific formula accuracy or all helper types.


## PilotSolve helper-label resolution and timer states

Fresh Day helper with the same synthetic1000ft/29.92inputs renders the complete Use998.839ft & return label at390px, including keyboard focus. DOM text matches; button width143.59px and scrollWidth142show no overflow. Earlier partial cross-tab screenshot did not reproduce; no CSS change justified.

Phone Day timer: Start changes to gold Pause with Running status, Pause retains8seconds; selected Stopwatch/Countdown gold and Restart/Reset gray. Entered1second countdown, started then paused past zero; Day red and Night light-red elapsed readout with Past zero retains semantic meaning. Settings navigation/appearance change preserved paused minus6seconds. Night duration input shows visible gold keyboard focus. Reset returned countdown to1second/Ready. Restored System, reloaded to clear unsaved helper/timer data, default1280viewport and Tools screen. No saved data modified; no native sound/background-notification claim.


## PilotSolve station solve directions and invalid state

Added a temporary Custom1station. Selected Weight solve mode using the picker and entered40in/60000lb-in: calculated1500lb, totals1500lb/60000lb-in/40in. Phone390Night readout, inputs and gray Remove station/gold Add station reviewed. Switched solve mode to Arm; original moment remained, weight was blank as expected. Entered0weight: calculated value/totals stayed blank with existing compatibility guidance visible. Entered1500weight: calculated40in/totals restored. Day appearance through Settings retained values; phone screenshot shows aligned readout and gold keyboard focus on gray Remove station. This uses synthetic arithmetic only, not an aircraft loading recommendation.

Removed temporary station and confirmed blank totals; restored System, reloaded, default1280viewport and Aircraft screen confirms no stations. No reusable aircraft profile edited. No source correction required. Remaining fuel/profile-specific control states, other helpers, enlarged text and native backup delivery remain separate.


## PilotSolve fuel profile and quantity controls

Reviewed phone390Night fuel selection sheet: selected AvGas gold, other choices gray, readable Cancel/close. Selected Jet fuel then Load profile stations; eight temporary stations appeared and Add station(8max) disabled. Expanded Fuel and entered10USgal/40in: UI shows68.4lb/2736lb-in. Incomplete other stations keep total unavailable. This is a synthetic arithmetic/UI example using the app's displayed density, not an operating recommendation.

Phone Night and Day populated Fuel row wraps long fuel label/help without overflow; gray numeric controls/readout and gold focus on solve picker match shared materials. Settings appearance change retained fuel values. Restored System, reloaded,1280viewport: verified no stations, blank totals/profile inputs, reduction1and original AvGas default. No backup saved. No source correction required. Fuel picker/quantity and profile-station loading gap reviewed; remaining acceptance includes other helper types, enlarged text and native backup delivery.


## Homepage tablet expanded sections

At834x1112opened biography and FAA certificates together; reviewed Night and Day solid reading surfaces, quiet gold disclosures/Sayhello, preserved green availability indicator, and certificate links. Tab from certificate summary reaches first reference link with visible gold focus. Expanded blank Draft an email: Day and Night labels/inputs/textarea/gold primary fit; keyboard Tab from textarea reaches Open email draft with visible gold ring. No contact values entered, mail client opened, or messages sent.

Collapsed all three disclosures, restored System/default1280viewport and reloaded homepage. No source correction required. This closes named tablet biography/certificates gap and adds expanded-form review; remaining full-page combinations/enlarged-text gates are unchanged.


## Learn category tablet lower sections and native-check availability

Native System Settings recheck reports Mac still locked; requested manual unlock asynchronously and continued available preview checks. No settings changed.

Private Pilot collection at834x1112: reviewed last article/related collection cards and footer start in Night and Day; gold keyboard focus on FAA Written Test Study Guides. Followed Checkride Prep Guides to its actual destination; reviewed Day/Night hero, first mixed-category card rows, gold primary/gray secondary and visible focus on both actions. Existing category identity artwork retained. Focused Night primary label renders completely. No external content or instructional accuracy claims. Restored System/default1280viewport. No source correction required; named tablet lower-section gap covered, remaining category/content variants and enlarged-text acceptance unchanged.


## Prevent unlinked retired artifacts from returning

The structural audit previously rejected HTML references to registered retired assets but could pass if a build restored an unlinked retired file. Added retired_asset_files check for existing paths and broken symlinks; audit now records restored_retired_assets and exits nonzero on any presence. This protects both archived copper stylesheet and embedded FlightRisk legacy server. No runtime CSS/JS or cache payload changed.

Ten focused managed-asset tests pass, including temporary fixtures for unlinked file/symlink restoration and a full CLI fixture that first passes, then restores legacy.css without a link and verifies exit1/report path. Current523registered+6supporting audit passes with empty restored list. Evidence remains structural; native/visual/export completion gates unchanged.


## Guard every archived generated app path

Consolidated340unique retired paths from20saved app/copper/server archive reports into config/theme-assets.json. Verified none exists in active source and none overlaps32managed assets. The registry now covers all prior generated app bundles, not only the copper and embedded-server files. archive-stale-app-styles.py automatically adds successfully archived paths to this registry; dry run remains read-only.

Eleven focused theme/archive tests pass. New temporary-site fixture retains a referenced runtime, reports but preserves unused CSS on dry run, archives exact unused bytes and registers its retired path only on archive execution. Current523+6route audit passes. A deliberate future reuse of a retired dependency must be reviewed against the current build before removing its specific retirement entry; do not broadly disable the guard. Runtime assets/caches unchanged in this pass.


## CertPath storage palette consolidation

Replaced remaining green/cream hardcoded declarations in storage.css: nav/button borders/text/surfaces/hover, focus, primary, error surface/text, delete-dialog backdrop and floating-nav shadow now use shared Aurum/semantic tokens. Existing final adapters already covered many normal states; removing underlying colors also prevents stale fallback/hover/focus behavior. No layout, input, backend, calculation or storage JS changes.

Reviewed CertPath intro and locked Submissions desktop Night, locked Submissions phone390Day with gold focus on Unlock submissions. Did not unlock, authenticate, read records or submit data. Restored System/default1280viewport and CertPath home. Source colors now contain no legacy hex palette. Sync updated1HTMLasset URL; repeat0stale; route523+6and44contrastpairs/min4.75pass. Existing cache IDs unchanged because this sheet is outside their payloads. Contact/result/delete/authenticated states remain source-only evidence for this correction and retain their acceptance gaps.


## CertPath contact step and sample cleanup

Built-in Try a sample scenario opens contact/save gate; no bypass to results. Reviewed blank form desktop Night and phone390Night/Day after storage palette consolidation: solid gray surfaces, primary gold, secondary gray, readable disclosure and wrapped phone primary label. Keyboard focus on Save & view and first-name input clearly gold. DOM confirms all four blank contact fields required/invalid; clicking Save keeps contact view and focuses first name. No contact data entered, no saved record or result accessed.

Used app Start over, reviewed phone Day dialog with gray Keep plan/gold Start over, confirmed discard of this generated sample and returned to intro. Restored System/default1280viewport. This closes contact-form visual follow-up for reviewed portions; actual gated result view and authenticated/delete storage controls remain unverified. No source changes this pass.


## Shared tool focus and reference borders

Bounded CSS inventory of blog/Learn/endorsement styles found remaining literal colors largely category identities, alpha shadows/masks, print output or crop artwork. Preserved those meanings. In tool-core.css replaced old navy-alpha regulatory-reference borders with g-line and shared control focus outline accent with g-accent, preventing category identity from driving keyboard focus. No dimensions/layout or app logic changed. Reference-border selectors were not found in current authored blog/endorsement HTML, so those declarations have source-level evidence only.

Sync4HTMLsources; refreshed endorsement cache simply-endorsed-tactile-4943ecd0fb2a (Pilot unchanged9e65f88e1b8d). Route523+6passes and two offline tests pass, including current cache precache verification. Browser Simply Endorsed desktop System/Night displays gold Search focus and selected Tasks material, category card colors retained; no input/progress changes.

## Checkride endorsement detail and shared regression checkpoint

Opened ASEL Initial Checkride Bundle and its A.37 detail through the actual workspace. Reviewed desktop Night detail, then phone390x844 Night and Day with Instructor guidance and Regulations & sources expanded. Gold Copy model text action, solid gray reading surfaces, quiet reference links and category accent remain legible. Keyboard Tab from Instructor guidance reaches Regulations & sources with visible gold focus; opening Appearance and selecting Day preserves both expanded disclosures and the current detail route. No clipboard action, checklist answer, endorsement issuance or contact submission performed. Restored System/default1280x720 and reloaded; all checklist values remain zero and completion remains disabled. No source correction required. This is scoped visual/interaction evidence, not regulatory-content validation or complete guided-task acceptance.

Fresh shared regression checkpoint:61Node tests and22Python tests pass. Shared asset check reports0staleHTML; structural audit passes523registered+6supporting documents; canonical contrast audit passes44pairs,minimum4.75:1. These checks do not replace outstanding full-template, native OS, actual200%zoom and export acceptance.

## FOI reset uses the shared materials

Replaced FOI Cards' browser-native progress-reset prompt with a local Aurum dialog: solid gray reading surface, gold Reset progress primary, gray Keep progress secondary, and explicit irreversible-action wording. The safe choice receives initial focus; Escape and Keep progress cancel, while confirmation clears only FOI progress/session keys. The existing shared navigation now dismisses before this dialog opens. Removed the app's redundant menu-toggle click, which could reopen a second modal behind the confirmation.

Verified the live dialog on desktop Night and phone390 Night/Day. Focus lands on Keep progress; Escape returns to the Menu button and retains the saved pass. The menu is absent behind the dialog after the correction. Restored System and desktop viewport, with the main-origin pass still at Card2. Three focused FOI dialog tests pass, including shared-menu handoff and confirmation scope. The older isolated localhost test origin still has one Review later and its browser-native prompt left a stalled tab; the primary-origin study data was not reset. Full FOI study and native reduced-motion acceptance remain open.

After the final FOI handler edit: all63shared Node tests and22Python tests pass, sync reports0staleHTML, route audit passes523registered+6supporting documents, contrast passes44canonical pairs with4.75:1minimum, and git diff --check passes. These are current local checks; they do not prove native export/OS/zoom gates or a production release.

## Certificate Generator synthetic photo and review flow

In the local preview selected First Solo, entered synthetic Test Pilot with the existing Sample Instructor value, and uploaded a generated 1200x800 geometric PNG. Desktop System/Night selection, names, photo and review controls retained gold selected/primary and gray secondary materials. Cropper rendered as a solid gray work surface; Zoom in changed slider0to30 and Reset returned it to0. Applying the crop produced the expected photo-ready state and preview. The review summary showed the synthetic names/photo and the preserved certificate artwork.

Switched to Day and reviewed phone390x844 review summary, caption, fallback image and cropper. The phone cropper's Reset/Cancel/Use photo controls fit, and Cancel preserved the already applied photo. The local export routine displayed a complete 1080x1920 blob-backed fallback image after Download JPEG. Browser automation did not receive a download event, so native saved-file delivery remains unverified despite the app status saying Downloaded. Restored System/default1280viewport and reloaded; intro returned with no selected template, names or photo. No source/style correction justified by these observations; exported template artwork was not changed.

## FlightRisk assessment and confirmation materials

Completed a synthetic IFR assessment in the local preview: the rated path showed a LOW result; changing the profile to Not rated displayed the existing red HIGH override despite a low raw score. Gold remained limited to selected controls and primary actions, while risk colors retained their meaning. Reviewed results on desktop Night and phone Day/Night, then restored the visible VFR, Not rated, Private Pilot example at score3 LOW and System appearance. The temporary IFR plan answers may remain in this browser's stored draft, so this is not an exact restoration of every hidden field. Neither operational scoring accuracy nor native print delivery was established by this material review.

Replaced FlightRisk's browser-native Reset and Clear local data confirmations with a reusable Radix Aurum dialog, and applied it to New assessment inside the results overlay. The safe Keep current data button receives initial focus; Escape/cancel preserves the assessment and restores focus, including when the confirmation is nested in results. Desktop Night and phone Night/Day dialogs were visually inspected; phone controls fit at390px. The live Clear local data confirmation was canceled without erasing the synthetic local draft. No actual destructive confirmation was performed in this preview; the source test covers cancel/confirm behavior.

The FlightRisk source patch was regenerated from the preserved baseline and dry-run applied cleanly. TypeScript/Vite build and27source tests pass; the new package uses index-D_TewKqs.js/index-CVFSuN1s.css. Ten superseded generated assets (837,525bytes) were SHA-verified in the external archive and removed from the deployable tree; dry run now finds zero stale bundles. Shared sync changed0HTMLsources; caches refreshed; route audit passes523registered+6supporting, contrast44pairs/minimum4.75:1, and git diff whitespace check passes. Remaining full-site, native OS/zoom, print/export and final visual acceptance gates stay open.

## Crank & Core firing-guide material correction

The active Rotax Learning guide still exposed pinned-runtime copper and slate text on the Night panel: power-stroke header, onset captions, Next/Power labels, stroke choices, timing note, slow-motion caption and crank-angle label. This was a rendered contrast defect, not merely a source-color search hit. Added explicit scoped overrides in `engine-explorer/app/assets/avionics-overlay.css` so those reading/control surfaces use the shared Aurum tokens. The four stroke-indicator bars, engine model, calculation state and panel geometry are unchanged.

Browser-reviewed closed and expanded guides at desktop Night and phone390 Day/Night. Selecting cylinder4 updated the announced next cylinder and crank angle to180 degrees while the gold selection moved; restored cylinder1/0 degrees and System appearance. Measured eleven Night label/control pairs against the solid panel: minimum5.75:1, with the gold section label6.06:1. This covers the observed guide, not every engine control or enlarged-text state. Shared sync changed1HTMLasset URL, caches stayed at the existing digests, and the523+6 structural audit passed.

## Crank & Core component browser and details materials

The live Rotax Parts browser and Details inspector exposed another pinned-runtime contrast defect in Night: secondary "Reconstructed" labels, part-number notes, purpose text, technical-details headings and source references used dark slate text on gray panels. Added scoped overrides to the editable `engine-explorer/app/assets/avionics-overlay.css`. Unselected part rows now use the shared muted ink, selected rows use gold with dark labels, and the Details reading hierarchy uses solid gray surfaces and shared ink/muted tokens. The geometry, catalog data, component selection behavior and pinned generated bundle are unchanged.

Reviewed the populated model list and selected Left crankcase half at desktop Night; its selected row computed a gold gradient with dark `rgb(43,35,22)` labels, while an unselected row caption computed `rgb(208,208,208)`. Opened Technical details and Geometry evidence & references, then checked the lower Details panel in desktop Day and phone390 Day/Night. Phone Night Source catalog showed readable part-number/status lines on gray cards, and the Study panel controls remained usable. Restored System appearance and the default viewport. Shared sync versioned one HTML asset URL, cache digests were unchanged, and the523+6 route/supporting-document audit passed. These observations do not close the remaining engine modules, enlarged-text, native OS or full-site visual gates.

## Blog article narrow-table access

At a 320px viewport, the private-pilot-cost article's three-column table painted its final column outside the visible table frame while that frame had zero horizontal scroll range. This made the explanatory text unreachable despite the existing focusable table. Added a 35rem minimum table width inside the already scrollable `.table-wrap` in `blog/style.css`; all three blog article tables use that wrapper. After regenerating style URLs, the 320px frame has a 282px horizontal range and touch-style horizontal scroll reaches the full final column. Focusing the table and pressing ArrowRight also advances its scroll offset. At 390px the range is 212px; at the default 1280px viewport the table fits with zero horizontal range. Page width equals viewport at both phone widths. This changes reading access only; article content and shared materials are unchanged.

Chrome accepted native zoom steps through 125%, but its computer-control connection disappeared while advancing further. The later zoom level could not be read or restored through that disconnected surface, so actual 200% browser zoom remains unverified. The 320/390 reflow observations above are narrower-view checks, not a substitute for 200% zoom acceptance. Shared sync updated 42 article HTML sources, cache digests stayed unchanged, and the 523+6 wiring audit passed.

## Aero Lab Geometry Studio output material

Opened the lazy-loaded Geometry Studio on an isolated localhost origin. Its selected Edit geometry control already used gold, but the primary Save .afoil output was indistinguishable from Open and Export SVG in the footer. Updated the preserved Aero Lab source `src/components/GeometryStudio.tsx` and `geometry-studio.css` so Save has an explicit semantic class and the canonical gold gradient, bronze edge and dark label. Open and Export SVG remain gray secondary controls, gaining a gold border on hover or keyboard focus. The initial site-only adapter was removed after the source rebuild; the current package uses the source-owned rule. Scene geometry, data and export logic are unchanged.

The local studio reported "Exported current geometry and animation as .afoil" and "Exported current view as SVG" after the respective actions. The in-app browser emitted no download event for either, so native saved-file delivery is still unverified. The 390px phone route retained its intended desktop-tool handoff with no page overflow; returning to 1280px reopened the desktop workspace. Reviewed the final rebuilt footer material in Night and Day: the loaded chunk is `GeometryStudio-Dst1IrYT.css`, Save computes the gold gradient/dark ink/bronze edge, and the separate authored adapter is absent. Restored the isolated origin to System.

The preserved Aero Lab source passed14tests and `npm run build:web`. Packaged the rebuilt app into the site, then SHA-verified and archived five superseded generated bundles (333,745bytes) outside the deployable tree at `/Users/diegosuarez/Projects/suarez-aurum-sources/_archives/aerolab-studio-gold-20260924/`. The retirement registry records those paths; the archive dry run now has no Aero Lab stale bundles. Shared sync reports0additional HTML updates, cache digests are unchanged, and the 523+6 wiring audit passes. Native delivery, full workspace coverage, native OS/zoom and final site-wide review remain open.

The current site package's eight Aero Lab assets match the rebuilt `dist/assets` byte-for-byte. Regenerated `docs/design/source-patches/aero-lab-aurum.patch` from the preserved tactile baseline; a dry-run patch applies cleanly to all eight affected source files, including the new semantic Save class. Ten theme-asset tests and the 44-pair canonical contrast audit pass. At320px System/Night, PilotSolve's Crosswind input/result controls and gray disabled Save/gold disabled Use result remain within the viewport; the lower actions are reachable by scrolling the app panel. No blue active material or document-level horizontal overflow was observed in those screens. This is bounded control evidence, not a full PilotSolve workflow or native 200% zoom check.

## CertPath stale zero-button style retirement

The active Part 61 stylesheet still held a red background, border and focus treatment for `.part61-zero-field-button` and its `.part61-zero-input-row` wrapper. A repository-wide markup/script search found no references to either class; the current experience screen instead exposes the gold quiet "Set remaining blanks to 0" action. Removed only the unused rules, including their mobile size override. Red validation/status styles remain because they carry meaning. On an isolated localhost origin, CertPath's current Goal, Background and Experience screens retained their gold selected/primary and gray secondary materials; a reload after the edit loaded the new hashed stylesheet and returned to the gold Start control. No data, calculation or layout behavior was edited. Shared sync changed one HTML asset URL, the Simply Endorsed worker cache rotated because it precaches Part 61 CSS, and the 523+6 route/supporting-document audit passed.

At 320px System/Night on isolated localhost, Simply Endorsed's task screen and Browse categories drawer fit the viewport. Expanding Private pilot retained its category identity, selecting All private pilot endorsements navigated to the two-item library, and the selected Library dock control remained gold. The category badge stayed blue for meaning. The page scroll width equaled 320px. The temporary test tabs were closed and the viewport override was reset. This is narrow rendered coverage, not complete mobile or content acceptance.

## CertPath retired step-palette cleanup

The active CertPath stylesheet still carried an earlier five-color step palette for indigo, green, amber, sky and purple. A later Aurum block already overrode these declarations on every current step, so the old colors were dead fallback material and a source of accidental regression. Removed that superseded block and its outdated comments; the endorsement/result category colors remain because they convey separate meanings. The current four step panels still compute the same gold accent tokens before and after the cleanup: Night `#ecd39b`, Day `#73551b`. The Goal and Pilot background selected dock/choice controls retain the metallic gradient with dark labels, and secondary controls remain gray. No wizard logic, data or page geometry changed.

Sync updated one CertPath HTML asset URL; the Simply Endorsed cache rotated to `simply-endorsed-tactile-8008b350dfe6`. The 523 registered routes plus six supporting documents pass the theme wiring audit, all 44 canonical contrast pairs pass at a 4.75:1 minimum, and all 98 Part 61 wizard tests pass. The browser check used isolated localhost, restored System appearance and closed its tab. Contact-gated results and native/zoom acceptance remain open.

## PilotSolve published-asset boundary

The current site packaged Vite's separate device-preview CSS/JS and preview-only Roboto fonts even though `/pilotsolve/` and `mobile.html` load only the mobile calculator. That preview CSS retained a white/blue device-simulator palette and was still listed in `BUILD.json` and the service-worker precache. `package-pilotsolve.py` now follows literal asset references from the published mobile entry through JS/CSS dependencies, copies only that closure, and filters the offline manifest before writing the site. It preflights the manifest, both HTML entries, and the worker file list before mutating package files.

The current closure is the mobile entry, shared prototype JS/CSS, and two Inter/Manrope fonts. The preview CSS/JS (136,940 bytes) were SHA-verified and archived externally with the normal stale-asset command; the two preview-only Roboto fonts (44,120 bytes) were separately SHA-verified and archived. All four paths are in the retired-asset registry. A second package run did not restore them; `pilotsolve/assets`, `BUILD.json` and `sw.js` contain no preview/Roboto entry. The actual Crosswind calculator opened in the isolated browser with the shared gold/gray material, and its only loaded stylesheets were the prototype CSS and shared Aurum CSS. Four PilotSolve worker tests and twelve cache/theme/archive tests pass. Route wiring remains 523/523 plus six documents; archive dry run reports zero stale generated assets. Native backup delivery and 200% zoom remain open.

## Homepage sky follows the resolved Aurum appearance

At local nighttime, explicit Day previously paired dark `#272727` hero text with the solar-night sky (`--sky-night:1`). This made the headline and lede hard to read, even though the gray Day canvas and gold controls were correct. The sky renderer now retains its shader, cloud animation, and solar-time calculation but keeps the image within the resolved appearance: solar variation spans 0–0.12 in Day and 0.88–1 in Night. The existing `suarez:appearance` event updates it immediately when the user changes Day/Night/System; a CSS fallback starts the Night image before WebGL draws. The hero layout, sky assets, copy and buttons are unchanged.

The corrected local preview at the same nighttime showed Day phase with factor0.12 and legible dark text on pale clouds; live Night selection showed factor1 and legible light text on dark clouds. The same Day/Night hero and gold/gray controls fit at390×844 and834×1112 with document width equal to the viewport. Restored System/default viewport on the isolated test origin. Registered `premium-home.js` as a managed theme asset so its HTML URL rotates with source changes; sync updated the relevant sources and the 523+6 route/supporting-document audit passes. All six focused sky tests, all63 shared Node tests, 44 canonical contrast pairs (minimum4.75:1), and git diff whitespace check pass. Native OS switching and actual200% zoom remain separate acceptance work.

## Ignition lab compact comparison correction

The pinned Crank & Core ignition comparison table wrapped header and row-label words into fragments at320px. The editable Aurum overlay now preserves readable table columns through horizontal scrolling below480px; a visible cue, named focusable region and sticky heading support touch and keyboard navigation. The Rotax/Slick models, teaching text, meters and React bundle are unchanged. The current browser showed the complete Conventional magneto column after ArrowRight scrolling, and Next spark still worked. Day/Night opening materials were checked at390px. Shared sync rotated the engine app's overlay URLs; cache refresh found no affected worker digest. The 523+6 route audit, JS syntax and diff whitespace checks pass. This is bounded phone/table acceptance, not full engine or native200% zoom acceptance.

## Simply Endorsed workspace Search material

The live Search submit control still used a flat gray36px treatment. The app-owned workspace stylesheet now renders it as a44px Aurum primary action; populated-query Clear remains a44px gray secondary action. Desktop Night and phone390 Night/Day screenshots, plus phone320 Day layout, show the hierarchy. A synthetic “solo” search returned86 matches; Clear restored the prior guidance article and focus. Shared sync rotated the workspace stylesheet URL; cache refresh found no affected worker digest. The route wiring audit passes523+6 and the diff whitespace check is clean. Full guided-workflow and enlarged-text acceptance remain open.

## CertPath dormant header/rail palette cleanup

Removed a superseded rainbow header gradient from `assets/tool-system/part61.css`; the active canonical gold pseudo-element rule still computes the same metallic gradient. The hidden legacy step rail's fixed white number-circle fallback now uses shared gray material/canvas tokens, with a specific green completion override retained. The current Goal screen and multi-goal picker were inspected in System/Night, including a synthetic second Instrument Rating goal; gold primary/selection and gray secondary controls were intact. `sync-avionics.py` versioned the Part 61 CSS URL and the Simply Endorsed offline worker cache rotated to `simply-endorsed-tactile-2cd267242822`. Route wiring523+6 and diff whitespace pass. This source cleanup does not close CertPath's contact-gated result, mobile/zoom, or export acceptance.

The full Part 61 wizard regression suite passed98/98 after this cleanup; it covers navigation, draft/result handling, source timing and engine fixtures, but not the browser-only appearance checks above.

## Local landing and PilotSolve compact settings follow-up

The current isolated Southern Indiana landing was visually reviewed at desktop Night and phone390 Day/Night across hero/actions, service cards, FAQ and contact, then at320 Day/Night across the service-card region. The 320px document width matched the viewport in both appearances; reading cards and quiet links remained legible. No contact draft was opened. PilotSolve's current packaged Settings screen at320px showed the Night/Day/System wording, gold selected segment, gray unselected segments and readable gray settings cards in both explicit appearances. Its document width also equaled320px. The stale Dark-label note above is closed without a rebuild because the preserved Aurum source, patch and current package already contain Night. System/default viewport were restored; no saved calculation, profile or backup changed. These are bounded rendered observations, not native zoom or complete route acceptance.

The Louisville flight-instructor landing was then checked at390px Day/Night across hero, credentials, service cards and contact. Gold primary/gray secondary actions, solid reading cards and form fields fit without document overflow. System/default viewport were restored and no message was drafted. Its lower-page, keyboard, actual200% zoom and full-size matrix gates remain open; Chrome browser control was unavailable during this pass.

## Simply Endorsed semantic palette contrast correction

Current-browser inspection of the Knowledge Test workflow list found a practical-test-prerequisites badge at4.29:1 in Night (`#b5aaff` on the solid `#4a4a4a` path card). Lightened only that category's bright label to `#bbb0ff`; the deep category fill, white-on-fill task cards, icon and task workflow remain unchanged. The current loaded model asset showed the updated lavender at desktop and320px Night, while Day retained its deeper `#6356d8` label on `#efefef`. Night hover now holds the card at `#4a4a4a` and uses a gold border, preserving contrast across six category labels that would fail on a lighter hover fill. Real pointer hover in the browser confirmed the background and border. Added the app-owned model file to managed asset versioning so its HTML URL changes with content; sync updated one page for the model and one for the workspace style, offline cache digests were unchanged, and route audit passed523+6. The contrast audit now covers all13 category fills plus Day/Night normal/hover category labels on solid surfaces:109/109 pairs pass, minimum4.54:1. Simply Endorsed's workspace suite passed1,678 assertions; theme/cache focused tests passed11/11 and diff whitespace check passed. This closes the observed category-label contrast defect, not full semantic/accessibility acceptance.

## Tools orbit initial-layout transition

The current catalog briefly stacked app icons and names on page entry while its initial `transform` positions animated. `tool-catalog.js` now marks the initial render, forces that layout to commit, and releases the marker on the next animation frame; `tool-catalog.css` disables transitions only during that marker. Later user-driven orbit selection keeps its existing motion. The isolated Night preview opened with distinct icon positions at1280px desktop,390px phone and834px tablet; explicit Day opened cleanly at1280px desktop and390px phone, with the gray canvas, solid stage, gold controls and selected orbit ring intact. Phone scroll width matched390px in both appearances. Selecting Next/Previous still updated the stage, pressed icon and live count. A left pointer drag on the390px Night rail selected FlightRisk and updated its stage, pressed icon and count; Previous restored PilotSolve. Catalog tests passed8/8, JavaScript syntax passed, sync updated two HTML asset URLs, cache refresh found no new worker digests, and route/supporting-document audit passed523+6. System/default viewport were restored. This is bounded first-frame and pointer-selection evidence; native touch, reduced-motion, enlarged-text and actual200% zoom gates remain open.

## CertPath solid result panels and standalone control sweep

Source and browser inspection found that the CertPath verdict and combined-summary elements inherited a translucent white `rgba(255,255,255,.58)` surface even in Night, while their text resolved to light gray. The shared result/readout rule now uses the opaque `--part61-soft` surface. The current isolated browser computed both elements as `#4a4a4a` with `#f4f4f4` text in Night and `#efefef` with `#272727` text in Day. The active Goal screen still rendered gold selected/primary and gray secondary controls after the asset refresh; no scenario data or calculations changed. The actual populated result view remains contact gated and was not visually accepted by this computed-style check.

A first-viewport computed-material sweep of FOI Cards, PilotSolve, Aero Lab, Crank & Core, Certificate Generator and Simply Endorsed in Day and Night found no flat chromatic control fill outside Simply Endorsed's six meaningful task-category cards. This only covers the initial viewport in each app and does not prove deeper dialogs, results or hover/disabled states. Sync updated one CertPath HTML URL; the Simply Endorsed worker cache rotated to `simply-endorsed-tactile-f9d1172b206e`. Route wiring passed523+6, material/category contrast109/109, wizard and cache tests passed, and diff whitespace was clean. The isolated origin was restored to System and temporary tabs closed.

## Shared selected-dock ink during first paint

A computed-material comparison across twelve distinct public/app entry routes found the canonical Aurum gold gradient on sampled primary and selected controls, with gray gradients on secondary controls. A first-frame sample exposed one brief mismatch: the selected shared dock key could show gray, transitioning ink over its gold fill while liquid navigation initialized. The selected key now excludes `color` from its transition list, so the dark action label switches immediately while the dock's other transitions remain. The transition declaration is non-important so the reduced-motion override can still remove it. An initial temporary class-based suppression did not prevent the interpolation and was removed before final verification.

Fresh HTML reloads loaded the current hashed stylesheet and immediately reported `#2b2316` selected-key ink with the gold gradient on Home, Tools, Learn and FlightRisk. At390px, the Tools dock was visually checked in Night and Day, stayed within390px document width, and kept the same dark selected label. The isolated preference and viewport were restored. A computed solid-control text scan across the current DOM of twelve representative route shells found no pairs below4.5:1 in Day or Night; the scan skips gradients, nested label overrides and unreached interaction states, so it is diagnostic evidence rather than a full accessibility acceptance. Shared sync updated545 HTML sources, both standalone worker cache names rotated, and route/supporting-document wiring passed523+6. Navigation and appearance regressions passed18/18, cache refresh test passed, sync reported zero stale sources, and diff whitespace was clean.

## Retired blue compatibility defaults in tool core

`body.theme-blue` remains a markup compatibility hook for Simply Endorsed and Certificate Generator, but its tool and default category tokens still resolved to the superseded `#2563EB` family. The active Simply Endorsed workspace already takes its six task-card identities from category data; the legacy shell was hidden, and the initial viewport showed no computed old-blue elements. Replaced only that default token block with shared Aurum accent/surface/line values. Per-category inline accent, soft, line and ink tokens still override those defaults, and Certificate Generator's own gold tokens remain authoritative.

After the current stylesheet URL loaded, the Simply Endorsed body resolved its tool, action and fallback category accents to Night `#ecd39b`; Day resolved them to `#73551b`. Search retained the canonical metallic gradient/dark label, while New Student, Solo, Knowledge Test, Checkride, Add a Rating and Recurrent & Aircraft kept their six prior category fills in both appearances. Certificate Generator resolved the same gold fallback and retained its app-owned override. The `tool-core.css` source no longer contains the five old blue hex/RGB values. Sync changed four HTML asset URLs; the Simply Endorsed worker cache rotated to `simply-endorsed-tactile-106e6d192a04`. The 1,678-assertion workspace suite, 10 theme-asset tests, cache/archive checks, 109 contrast pairs, 523+6 route/supporting-document wiring and diff whitespace all passed. System was restored and the temporary browser tab closed. This removes one stale palette block; other app-owned legacy declarations still need review.

## Deep workflow material review

The current isolated Simply Endorsed First Solo task detail was inspected in Day at phone width. Its gold selected Tasks/First Solo controls, gold Search action, gray section chips and neutral Not applicable action coexisted with the retained orange category header. A computed solid-control text diagnostic found no pair below 4.5:1 in that rendered state; it does not measure every gradient stop, hidden state or checklist outcome.

The current packaged Aero Lab Geometry Studio was opened from Aircraft & atmosphere and visually reviewed at desktop Day/Night and 1,024px Day/Night. Edit geometry, the selected object and Save .afoil use the shared gold gradient with dark `rgb(43,35,22)` ink; secondary editor, Open and Export SVG controls remain gray. At 1,024px Night, the modal fit inside a 984px wide viewport inset, document width equaled 1,024px, and its internal scroll reached the solid footer actions. At 1,024px Day, selecting the flap changed the gold object row and Name field to flap; its four-anchor label and Save action retained the same dark ink. Scrolling reached the footer without horizontal overflow. The 390px viewport intentionally showed Aero Lab's existing desktop handoff, including its gold copy-link action. No geometry was edited or file downloaded; native export delivery and broader desktop workflow acceptance remain open. The temporary Playwright browser was closed with System preference restored.

On a separate `127.0.0.1:8899` origin, FOI Cards' 390px answer/rating screen was visually checked in Day and Night. The answer retained its meaningful green, Review its amber edge, Memorized its green action and Next its gray secondary treatment; the bottom dock remained clear. Marking the first card Review advanced to card 2 and displayed one review later. The Night reset dialog focused Keep progress, displayed a solid gray reading surface and gold Reset progress action, and did not leave the navigation menu open behind it. Confirming reset on this synthetic test origin returned to the welcome screen with 238 remaining and zero review; reload preserved that reset state. The main `8898` preview's saved progress was untouched. System preference was restored, the temporary browser closed and the `8899` server stopped. Enlarged text, native reduced motion and the remaining card interactions are still open.

## Installable app launch colors

An active-source search found stale PWA manifest fallbacks outside the stylesheet audit: Simply Endorsed advertised blue `#2563eb`, PilotSolve advertised near-black `#080b10`, and Aero Lab advertised teal `#123f43`. Their installable manifests now use the Day-gray `#E3E3E3` fallback for both launch background and static theme color. The live browser chrome still follows `assets/appearance.js`, which sets `#E3E3E3` in Day and `#414141` in Night before paint. The Simply Endorsed CFI manifest URL was advanced to `v=aurum` to avoid retaining the older browser-fetched file; the legacy Simply Endorsed manifest was updated as well.

The preserved PilotSolve generator, source HTML and public manifest were updated, built with its 28-file runtime guard, and repackaged through the mobile-only site package. The preserved Aero Lab HTML/public manifest were rebuilt with unchanged JS/CSS asset hashes, and its generated manifest was copied to the site. Focused follow-up patches `pilotsolve-manifest-aurum.patch` and `aero-lab-manifest-aurum.patch` preserve these source changes after the earlier tactile patches. Shared sync found no stale HTML asset URLs; offline cache refresh rotated PilotSolve to `pilotsolve-site-4ded3d0bc4f6` and Simply Endorsed to `simply-endorsed-tactile-ad8733b4e0c8`. All four manifests returned HTTP 200 with `#E3E3E3` on the isolated preview. The structural audit now checks PWA colors and passes 523/523 routes, 6/6 support documents and 4/4 manifests. Ten theme-asset tests, cache-refresh test, four shipped PilotSolve worker tests and 14 Aero Lab tests pass. The PilotSolve source worker test was aligned with the current network-first shared-theme policy and passes three cases. This closes the stale installable launch palette, not native installed-PWA appearance or every tool interaction.

## CertPath populated result material

The contact-gated result was rendered on a separate `127.0.0.1:8899` test origin using the normal Goal → No certificate → Experience UI. “I haven’t logged any flight time” completed 18/18 synthetic hour fields. Immediately before Build my plan, the test tab alone set `window.CertPathStorage` to null so the existing calculation and result renderer ran locally without entering contact details or submitting a plan. The Private Pilot ASEL fixture displayed 40.0 additional hours and an $8,300 training estimate; these are renderer test values, not a training recommendation.

The current result was visually inspected at desktop width in Day and Night, at 390px in Night, and at 320px in both appearances. Metrics retained their meaningful green, regulatory links retained their gold accent, reading/result cards were solid gray layers, edit summaries were gray secondary controls, and the selected dock stayed metallic gold with dark ink. Training breakdown and the first Dual ASEL detail opened in both desktop appearances. At 320px the document width matched the viewport, and scrolling to the actual bottom placed the footer copyright/social links clear of the fixed dock. A first mid-scroll screenshot had shown the footer behind the dock; the bottom-position check disproved a clearance defect, so no layout rule was changed. Playwright browser `Meta+Equal` and `Control+Equal` did not change its measured zoom, so native 200% zoom remains unverified. The test origin's storage was cleared; reload returned System/Day, zero stored keys, the normal save hook and no visible result. The browser and temporary server were closed. This closes a synthetic rendered-result appearance gap, while the normal contact-save/API response flow and other result variants remain open.

## Reduced-effects cascade and menu pointer correction

Browser media emulation exposed two shared material defects. The primary gold control still computed a 220ms shadow/filter transition under `prefers-reduced-motion: reduce`, because its important declaration outranked the generic reduced-motion selector. A matching-specificity override now removes that transition for both reduced motion and the explicit Solid controls quiet-effects mode. The broad active-state override also removed the liquid menu tabs' positioning transform during pointerdown, moving Appearance away before pointerup; the static positioning transform is now exempt while its animation remains disabled.

On the current isolated preview, Day reduced motion reported `transition: none` on primary and dock controls, no active DOM element or pseudo-element with a nonzero animation/transition in the homepage shell, and a successful pointer click on Appearance. Night reduced motion also reported no primary/menu-tab transition and successful pointer Explore → Appearance clicks. With OS motion emulation cleared and Solid controls on, primary transition remained `none` and Explore → Appearance clicks succeeded; turning Solid controls off restored the normal 220ms/100ms primary feedback. The test browser finished at System with Solid controls off. Shared sync updated 545 HTML sources, both offline cache names rotated, and route/supporting-document/manifest wiring passed 523+6+4. This is browser-emulated reduced-motion evidence, not a native OS setting or actual 200% zoom check.

The separate Tools directory was also opened with reduced motion emulated. Its orbit app keys and Open PilotSolve action computed `transition: none`, and a DOM/pseudo-element scan found no active animation or transition above 10ms. The Next app button still selected FlightRisk, updating the heading, pressed orbit key, link and `2 of 7` status. This adds one functional reduced-effects route check without claiming native touch or OS acceptance.

## FlightRisk saved profile and Aero Lab browser exports

The current isolated FlightRisk assessment was opened in a fresh headed browser session. Its Day/Night entry screens showed gold selected VFR and Private Pilot controls, gold Start/Review actions, gray secondary actions and intact green/amber/red risk semantics. Confirm flight profile changed the local status to Profile confirmed; after Back to edit and reload, the confirmation persisted with 49 answers/profile values remaining. The provisional Assessment Results dialog was inspected in Day and Night at desktop and at 320×700. Its completion warning stayed amber, risk bands retained their meaning, the dialog was opaque, Print summary was gold and Back to edit/New assessment were gray. At 320px the score breakdown and training-aid note remained reachable through the modal scroll; document and dialog widths equaled 320px. No aviation scenario was completed or printed, and this is not a go/no-go result.

On the same isolated browser, Aero Lab's Aircraft & atmosphere → Geometry studio opened the default two-object scene. The real browser download event completed without failure for Save .afoil (`aero-scene.afoil`, 7,449 bytes) and Export SVG (`aero-scene.svg`, 3,969 bytes); Playwright saved both into its temporary `.playwright-cli` output. The `.afoil` file began with a scene and contained two object records with balanced delimiters; the SVG parsed as an SVG root with a viewBox. Each downloaded file was then reopened through the studio's native file chooser. The status reported `Loaded aero-scene.afoil` and `Loaded aero-scene.svg` respectively, with the geometry editor still announcing two objects. This closes the previously unobserved local-browser delivery and default-scene round-trip paths for those two controls. Edited-scene fidelity, installed-PWA save behavior, Certificate Generator delivery and other export formats remain separate checks. No app source changed.

## Certificate Generator headed-browser JPEG delivery

A fresh isolated headed browser completed the normal First Solo → Names → optional Photo → Review UI using synthetic Test Pilot and Sample Instructor names. The explicit preview `#cgDownloadBtn` produced a real browser download event with no failure and saved `FirstSolo_Test_Pilot.jpg`. The file was a valid 1080×1920 JPEG; visual inspection showed the placeholder scene, names and preserved certificate artwork. After switching System-resolved Day to emulated Night (`#414141` body), a second download completed and had the identical SHA-256 hash `7c58b3cc9098cb3e023392661eb66317532aace03e1a898aa91b3bc286efad58`, confirming the interface appearance did not alter that placeholder export.

The same synthetic JPEG was then uploaded as a test photo, accepted through the cropper, and the Review summary changed to Photo Added. A third download completed without failure as a valid 1080×1920 JPEG with a different hash; visual inspection showed the cropped image inside the certificate photo frame while the surrounding artwork and names remained intact. This closes local headed-browser file delivery for the First Solo placeholder and photo paths, correcting earlier event-timeout observations. It does not establish all certificate templates, mobile Photos/share behavior, or installed-device save locations. No source artwork, CSS or export code changed.

## Certificate Generator all-template placeholder delivery and blocked-storage appearance

The same isolated Aurum preview was checked with `localStorage` forced to throw `SecurityError` before scripts ran. The homepage and eight stateful app entries loaded in browser-emulated System/Day and System/Night with the correct gray canvas/theme-color meta and no uncaught entry errors. A current-session Night choice worked and reset to System after reload; emulated OS changes updated the open homepage and sky. This does not substitute for a live Mac appearance change or full workflows with unavailable storage. Exact route and console evidence is in `visual-checks-20260924.md`.

All nine Certificate Generator choices beyond First Solo were then selected and downloaded through the normal populated wizard with synthetic Test Pilot/Sample Instructor names. Each Day and Night browser download completed with null failure, and all 18 files decoded as 1080×1920 JPEGs. Each template's Day/Night pair was byte-identical. All nine outputs were visually opened and retained their distinct original artwork, readable synthetic names and photo placeholders. Together with the earlier First Solo check, this covers local placeholder delivery for all ten templates. Both Multi-Engine variants still suggest the same filename because that pre-existing export routine uses their common display title; their image bytes and artwork are distinct. No export code or artwork changed. Installed-device save/share and photo variants beyond First Solo remain open.

## Crank & Core desktop teaching surfaces

The current isolated Rotax 912 ULS route was entered through its collection UI, not by a test-only state hook. Its Learning guide was visually reviewed at desktop Day and Night: the solid gray guide, gold selected Learn dock key, hardware step controls and preserved engine/propeller colors remained readable. Expanding Power-stroke order showed gold selected cylinder 1 and Power stroke controls with distinct instructional phase lines.

Study → Compare ignition opened the Ignition Lab in Night, then Day. The modal retained the #414141/#E3E3 canvas pair, opaque comparison/readout surfaces, gold active Energy paths/Circuit ON controls and gray secondary options; both reconstructed 3D teaching models kept their own illustration colors. Shared scale became gold-selected, and Next spark advanced the comparison status from 110° to 155° and the described firing event to cylinder 4. The Day lower component area and the top comparison controls were visually checked by scrolling inside the modal. Browser-emulated reduced motion in the Day lab produced no active CSS animation/transition above 10ms across its DOM elements and pseudo-elements. No model assets, calculation data or source styles were edited in this pass. This extends desktop rendered coverage, not all model-specific interactions, native motion settings or zoom acceptance.

## Simply Endorsed loaded legacy guidance stylesheet cleanup

Removed the remaining fixed blue material/fallback declarations from `assets/tool-system/simply-endorsed.css`: old guidance selection now references metallic gold/dark ink, while reference keys, table-of-contents links, search focus and flashcard reading backs use shared gold/gray tokens. Endorsement category/status colors and content remain untouched. The current `workspace.js` task-first guidance does not render those old mode controls, so this is source retirement with a computed legacy-selector check, not a claim that a visible current feature changed.

Sync updated one HTML stylesheet URL; the Simply Endorsed offline cache rotated to `simply-endorsed-tactile-0c5e45b27d90`. On the current preview, the First Solo guidance A.3 detail opened after reload and was visually reviewed in Day and Night: gold actions, gray reading surfaces and the orange Student pilot identity remained. Workspace tests passed 1,678 assertions; 11 theme/cache tests, sync check, 523/523 route audit plus 6 supporting documents and 4 manifests, and diff whitespace passed. Native zoom, remaining guided workflows and full route visual acceptance stay open.

## Aero Lab lesson and teaching selection hardware

The shared theme now gives Aero Lab's borderless selected lesson and teaching tabs the same bronze rim as its other selected controls. Lesson keys have a 44px touch area within their original 49px rail. A headed local browser confirmed the rim and selection changes in Day and Night; at 1024px the rail and document widths remained intact, and reduced-motion emulation removed transitions and animation from the selected key. The lesson and teaching content responded to clicks. No simulation, diagram or export data changed. The theme URL and both offline cache keys were refreshed; 11 theme/cache tests, 15 appearance/tactile tests, sync check, 523/523 route audit plus 6 supporting documents and 4 manifests, and diff whitespace passed. Native touch, zoom and broader Aero Lab state coverage remain open.

## Service landing control census

Seven service landings plus Southern Indiana Flight Training were checked at 320px in browser-emulated System/Day and System/Night. Every visible primary/secondary CTA in that census used the canonical gold/gray material, document width equaled the viewport, and no surveyed CTA extended offscreen. Discovery Flight desktop Day and Southern Indiana phone Night hero/contact-form surfaces were visually inspected. This adds route-level control evidence without changing source or claiming full page, form, keyboard or enlarged-text acceptance. The precise routes and limits are recorded in `visual-checks-20260924.md`.

## Representative reading-template controls

The FAA Medical Certificates Learn article and Private Pilot Timeline blog article were opened at 320px in browser-emulated System Day/Night. Both held a 320px document width and used canonical gold/gray CTA materials. On desktop Day, the Learn article's TOC anchor click reached its matching heading. Its blue breadcrumb/TOC dots resolve from the Private Pilot category token and were preserved as category meaning. These observations update the route matrix only; no article source or claim changed, and full article-variant, keyboard and zoom review remains open.

## All-route rendered initial-state census

The current isolated preview completed four browser sweeps of the exact 523 registered routes: 320px System/Night and 1280px System/Day for HTTP/canvas/theme-color/document-width/shared-primary checks, then 390px System/Night and System/Day for saturated blue/cyan material on visible button-like controls. All four returned zero findings. This strengthens route integration evidence but leaves hidden/dynamic control states, app-specific interactions, visual template acceptance, native settings and zoom open. FOI Cards' Day desktop and Night 390px rating controls were inspected separately: amber Review and green Memorized retained outcome meaning, Next stayed gray, all three used raised hardware shadows, and solid-button label contrast stayed at or above 4.89:1. At the phone's true bottom, contact links cleared the dock. No source style changed in this pass; exact criteria, hashes and limits are in `visual-checks-20260924.md`.

## Shared dynamic tactile state restoration

Aero Lab's live overlay toggles exposed an old generic selected underline and a React rerender that removed the runtime-added `av-control` class from an existing button. The shared selected shadow is now raised metal, and `assets/tactile.js` re-enhances eligible buttons when their class changes. A regression test covers class replacement and an excluded native button. Day/Night headed checks confirmed Particle trails stays gold/bronze and regains its tactile class after toggling; Pressure selection moves correctly, and reduced-motion emulation computes 0s animation/transition. The current shared asset URLs and standalone cache names were refreshed. Shared Node 64/64, focused Python 11/11, sync zero stale, 523+6+4 wiring audit and diff whitespace passed. This fixes one systemic dynamic-control defect, while the remaining app-state and native touch review remains open.

## Crank & Core Lycoming interaction coverage

The isolated preview's Lycoming IO-360-L2A route was visually checked through collection, Study/Fuel injection, its learning guide and fuel-servo details, View X-ray/Internal detail, Parts/Manuals, and search. Gold selected hardware, gray secondary actions, `#414141` Night and `#E3E3E3` Day held across desktop and 390/320px phone views. Both selected View keys fit at 320px with 44px height, reduced-motion emulation removed their motion, and a direct deep-link reload retained the model entry. This was a coverage pass with no source edits. Full model-specific interactions, native touch and enlarged-text acceptance remain open; exact observations and images are in `visual-checks-20260924.md`.

## FlightRisk IFR material and semantic-state check

The current isolated FlightRisk assessment was checked through VFR → IFR selection at desktop Day and 320px System Day/Night. Selected radio, certificate and rating controls retained the shared metallic gold/bronze/dark-ink treatment, while the HIGH override stayed red. The keyboard-focused radio had a gold outline. The 320px document width stayed within the viewport, System followed emulated OS changes, and reduced-motion emulation removed animation/transition from selected controls. This adds rendered interaction evidence without source edits; actual browser zoom, remaining risk bands, complete workflow and print delivery are still open. See `visual-checks-20260924.md` for bounded evidence.

## CertPath Logged Events material consolidation

Removed the remaining teal Logged Events material block from the loaded CertPath base stylesheet and mapped its header, action and event edge to shared Aurum gray/gold tokens. The current Day desktop and Night 320px rendered flow opened the events section and changed a synthetic checkbox count from 0/9 to 1/9; Night retained its #414141 canvas and 320px document width. The separate green completed-status meaning was preserved. One HTML asset URL and the Simply Endorsed worker cache were refreshed. CertPath storage, 11 theme/cache tests, 523+6+4 wiring, 109 contrast pairs, sync and whitespace checks passed. Full workflow, actual zoom and all-route visual acceptance remain open; exact evidence is in `visual-checks-20260924.md`.

## PilotSolve selected-navigation source retirement

The isolated Aurum PilotSolve source no longer carries two early blue selected-dock gradients or the hard-coded blue primary declaration; its earlier fallback palette now resolves through shared gold/gray tokens. Rebuilt and repackaged only the mobile app closure, regenerated the six-file source patch with a successful dry-run, and archived the three prior bundles with verified hashes outside the deployable site. Current package CSS is `prototype-Cv6bjZxl.css`; current worker cache is `pilotsolve-site-17a65a21ab78`. A headed 320px browser verified gold selected Tools/Trip, gray inactive keys, `#E3E3E3` Day and `#414141` Night System canvases, direct `#trip` reload and 0s reduced-motion selection. Source runtime 28/28, 36 app tests, TypeScript/build, 3 source plus 4 shipped worker tests, 12 theme/cache/archive tests, sync and 523+6+4 wiring passed. This is targeted retirement, not full source-style or workflow acceptance; exact evidence is in `visual-checks-20260924.md`.

## Aero Lab authored fallback retirement

The isolated Aero Lab source now uses shared gray/gold tokens for its base, source button and lesson rail instead of the earlier decorative sage fallback. The rebuilt eight-asset package is live in the isolated preview, its eight-file source patch dry-applies to the preserved baseline, and five replaced bundles are hash-verified in the external archive. A headed Day/Night System pass confirmed lesson and Pressure selection, metallic gold/bronze hardware, gray inactive controls, `#E3E3E3`/`#414141` canvases and zero-duration reduced-motion behavior. All 14 source unit tests, TypeScript/Vite build, 12 theme/cache/archive tests, zero-stale sync, zero-stale asset inventory and the 523+6+4 wiring audit passed. The separate engine smoke script is limited by a missing `app/examples/flap.afoil` fixture in both isolated source and preserved baseline. Diagram/status colors and app logic were not changed; full app, native touch and zoom acceptance remain open.

## FlightRisk authored bridge retirement

Removed FlightRisk's competing light-only HSL material bridge and old near-black fallback; neutral/focus/sidebar colors now resolve from shared Aurum tokens. Its risk-band and warning colors retain their operational meaning. Rebuilt and packaged the ten current app assets, regenerated a 17-file source patch with a clean baseline dry-run, and hash-archived ten superseded bundles outside the deployable site. Source tests 27/27, TypeScript/Vite build, shared theme/cache/archive tests 12/12, zero-stale asset and HTML scans, and the 523+6+4 wiring audit passed. A headed browser verified rebuilt assessment IFR selection at 320px System/Night, Guide actions/focus in desktop System/Day, and Methodology actions at 320px System/Night. Full risk/save/print, native touch and zoom acceptance remain open; exact evidence is in `visual-checks-20260924.md`.

## Simply Endorsed conditional action material

Removed the workspace-wide shadow reset that flattened ordinary buttons. Reset and unpressed Not applicable now use shared tactile contact depth; the pressed conditional control is 44px gold/bronze with dark ink, while quiet navigation remains unraised. Its selected status toggled correctly in a temporary First Solo A.5 checklist at 320px System/Night and Day, with no width overflow; reduced-motion emulation removed transitions. Copy model text and selected System appearance also remained raised gold. The stylesheet URL was refreshed, 1,678 workspace assertions, 98 broader app tests, 12 theme/cache/archive tests, zero-stale sync and the 523+6+4 wiring audit passed. Category colors and checklist logic remain intact; complete workflow, native touch and zoom acceptance remain open.

## Tools directory control material

Inactive purpose filters and Previous/Next orbit arrows now use the shared raised gray hardware, while the selected filter remains metallic gold. Removed the catalog's local blanket shadow reset and stale selected-filter flattening; transparent orbit icons retain their app-color identity rings. The isolated preview was visually checked at desktop Day, 390px Night and 320px Day; selecting Aircraft systems and Next updated the featured Aero Lab/Crank & Core stage, and 390/320 document widths fit. Pointer-down on a filter produced 2px pressed travel and 100ms inset depth; reduced-motion emulation removed that travel and transition. Catalog tests 8/8, theme/cache/archive tests 12/12, contrast 109/109, sync and 523+6+4 wiring passed. Native touch, actual 200% zoom and the remaining directory interactions still need acceptance.

## Certificate Generator control depth

Removed the premium stylesheet's grouped shadow reset from Certificate Generator buttons while leaving its static preview card flat. Unselected certificate cards and secondary actions now use the shared gray contact depth; selected certificate and instructor-rating keys remain gold. A headed browser checked desktop Day First Solo and 320px Night CFI → CFII selection, reduced-motion rating state, original visible artwork and zero document overflow. Shared sync rotated 529 HTML URLs, and cache refresh completed; 12 theme/cache/archive tests, 109 contrast pairs, JavaScript syntax, zero-stale sync and the 523+6+4 wiring audit passed. Generator JS/templates were unchanged. Full viewport/template and installed-device share acceptance remain open.

## FOI shared-menu action depth

Removed the stale transparent Plan Training override and old chipnav-sheet CTA material, then assigned the reflowed FOI menu actions their intended hierarchy: raised metallic gold Plan Training and raised gray Reset study progress. A headed browser checked desktop System/Day and 390px System/Night materials and 44px action rows; reduced-motion emulation removed motion. The reset confirmation still focuses Keep progress, and Escape cancels without clearing progress. The FOI/navigation tests passed 13/13, theme/cache/archive tests 12/12, contrast 109/109, refreshed sync and 523+6+4 wiring audit passed. Enlarged text, native touch and remaining FOI interactions remain open; evidence is in `visual-checks-20260924.md`.

## Crank & Core ignition lab state review

The current Rotax ignition lab was checked in desktop Day/Night and 390px Day/Night. Selected Energy paths, Shared scale and circuit controls used the shared gold/dark-ink material; secondary controls stayed raised gray, and 3D teaching components remained visible after rendering. The CDI grounded state changed label while the other circuit stayed ON, and the phone document fit its viewport. Reduced-motion emulation removed selected-control transitions. No source change was needed for these states. Full lab/model variants, native touch and actual zoom remain open; exact observations are in `visual-checks-20260924.md`.

## CertPath ledger filter and retired results tabs

The current results screen uses disclosure panels rather than a tab row. Removed dead `.part61-results-tabs` material rules from the base/redesign/shared CSS and inline font selector, retaining the four live result content panels. The pressed ledger filter now uses the shared gold/bronze/dark-ink finish while inactive filters remain raised gray. A fresh synthetic zero-hour Private Pilot result was rendered with its save hook disconnected in the test browser; clicking Remaining Only moved the gold state and updated the ledger. Desktop Day and 390px Night screenshots were visually checked; 320px Night width, 44px control height and reduced-motion behavior passed. Shared sync, cache refresh, 523+6+4 wiring, 12 theme/cache/archive tests, 109 contrast pairs, CertPath storage tests and 1,678 workspace assertions passed. Live API save, native touch and zoom remain open; exact evidence is in `visual-checks-20260924.md`.

## CertPath multi-goal action hardware

The active Earlier/Later/Remove controls were transparent and only 40px tall when a second goal was added. The app-owned style now gives them the shared raised gray gradient, contact shadow and 44px minimum target. A headed 320px browser checked the two-goal Day/Night views and confirmed Later still swaps goal order without page overflow. Reduced-motion emulation removed transition/travel. CertPath storage, theme/cache/archive, contrast, sync and 523+6+4 wiring checks passed. Remaining multi-goal calculation, native touch and zoom acceptance are recorded in `visual-checks-20260924.md`.

## Aero Lab Geometry Studio launch hardware

The Aircraft & atmosphere panel's Geometry studio launch is now source-owned gold primary hardware with a neutral gray loading overlay. Authored lesson-card, prompt, badge, Recover action, segmented and supporting-copy fallbacks now use gray/gold tokens instead of sage. The final rebuilt eight-asset package and nine-file source patch are verified; two five-bundle superseded sets are hash-archived outside the site. Day/Night headed checks showed the metallic gold/bronze/dark-ink 44px launch, and clicking it still opened the editor with Save gold and Open/Export secondary. Lesson 02 showed neutral prompts and a gray 44px Recover action in Day/Night; clicking it set angle of attack to 3.0°. Aero Lab 14 tests and TypeScript/Vite build, 12 theme/cache/archive tests, 109 contrast pairs, zero-stale sync/archive scans, packaged asset hashes and 523+6+4 wiring passed. Transient loading render, full editor/lesson workflows, native touch and actual zoom remain open; details are in `visual-checks-20260924.md`.

## FlightRisk answered-row contrast

Replaced the source-owned translucent answered risk/mitigation row fills with existing solid semantic tints. Night risk-label contrast rose from a captured 2.87:1 to 12.46:1; Night mitigation measured 11.49:1. Day red/green pairs exceed 12:1. A headed 320px Day/Night browser confirmed the selected row fits with no document overflow, and changing Yes to No restores gray. The ten-asset published-base package and expanded 18-file source patch are verified; ten replaced bundles are hash-archived outside the site. FlightRisk 27 tests and build, 12 theme/cache/archive tests, 109 canonical contrast pairs, zero-stale sync/archive scans, packaged hashes and 523+6+4 wiring passed. Other risk states, full workflow, native touch/zoom and print delivery remain open; evidence is in `visual-checks-20260924.md`.

## Aero Lab neutral source fallback retirement

Retired fixed sage border, divider and supporting-text values from Aero Lab's authored header/intro styles in favor of shared gray line/muted tokens. Scientific airflow, instrument and reference colors were untouched. The rebuilt eight-asset package is live in the isolated preview; all eight assets match source `dist` by SHA-256, the nine-file source patch dry-applies to the preserved baseline, and five superseded bundles were SHA-archived outside deployment. Headed desktop Day/Night checks confirmed `#E3E3E3`/`#414141` canvases, neutral supporting copy and the existing gold selected controls. Aero Lab source tests 14/14, Python theme/cache/archive tests 22/22, contrast 109/109, zero-stale generated assets, 523+6+4 wiring and whitespace checks passed. This closes the named authored fallback, not the full app-state, native touch or zoom gates.

## CertPath neutral paperwork legend

The shared Part 61 stylesheet still gave neutral paperwork/dashboard tags a fixed cool-slate fill and text. Those declarations now use the canonical raised gray and ink tokens, leaving the green/amber/red/blue/purple/teal requirement meanings intact. A headed local browser rendered a synthetic zero-hour result with its save hook temporarily disconnected: the visible Paperwork legend used Night `rgb(244,244,244)` on `rgb(84,84,84)` and Day `rgb(39,39,39)` on `rgb(247,247,247)`. At 320px Night, the full legend wrapped within the viewport without horizontal overflow. The normal sample action still reached its contact gate; no personal details were entered or submitted. System was restored. Sync rotated the Part 61 stylesheet URL and offline caches; 22 Python theme/cache/archive tests, 109 contrast pairs and the 523+6+4 route/supporting/manifests audit passed. Live save, complete results workflow, native touch and actual zoom remain open.

## Simply Endorsed unused launcher style retirement

Removed the old mobile `browse-launcher` presentation block and its inline font selectors from the loaded Simply Endorsed stylesheet/HTML. The current page loads `workspace.js`, which neither creates that element nor loads the legacy `app.js` that still mentions it; the active category drawer and First Solo route remain intact. The original 53-source style archive was mirrored from the old volume outside the deployable site, byte-matched to the source archive, and every per-file hash verified. A headed 390px browser opened the current category drawer and First Solo in System/Day and emulated System/Night: current gold/gray controls, orange Student pilot identity and zero horizontal overflow held. The stylesheet URL and worker cache refreshed; workspace assertions 1,678, Python theme/cache/archive tests 22, contrast pairs 109, route wiring 523+6+4 and diff whitespace passed. This removes one orphan style family; other historical rules and full guided-workflow/zoom acceptance remain open.

## Simply Endorsed legacy guidance material retirement

Removed 644 additional CSS lines for the unloaded `app.js` Privileges & Limitations, Student Journey and Scenarios components, including their old translucent white cards and responsive rules. Current `workspace.js` renders different class families and was not changed; its data and the old JS file remain available. The present stylesheet parsed in the browser with 491 CSSOM rules. Current Guidance home → Student Journey → First Solo, Scenarios → failed-area detail, and the First Solo task all opened after the edit. At 390px System/Night and System/Day, current content and gold/gray controls fit without document overflow. The Simply Endorsed worker cache rotated; 1,678 workspace assertions, 22 Python theme/cache/archive tests, 109 contrast pairs, 523+6+4 wiring and whitespace checks passed. Other legacy CSS and full guided/zoom/native-touch acceptance remain open.

## Simply Endorsed full orphan teaching-mode block retirement

Retired the remaining 1,208-line old Teaching & Guidance View block and its duplicate legacy mode/layout selectors from the loaded Simply Endorsed stylesheet, plus its orphan inline `.guidance-view` font selector. A token audit of the 101 CSS class names in that block found no active current-workspace class usage: the only matches were an unused inline selector and a `cfr-link` inside an old parent selector that the current workspace does not render. Current Guidance uses distinct `workspace.js` classes and keeps all content/data. The current stylesheet loads and parses to 315 browser CSSOM rules. Day desktop Guidance home, Night 390px First Solo and Quick Reference, and Night 390px CFI Career were checked; document width stayed within 390px and SEO reference links retained their gold color. The old complete stylesheet remains in the verified 53-source external archive. Workspace 1,678 assertions, 22 Python tests, 109 contrast pairs, zero-stale sync, 523+6+4 wiring and whitespace checks passed. This retires that obsolete material family; full-site app states, native touch and zoom still require acceptance.

## PilotSolve decorative blue source retirement

The app-owned source now uses shared gold/gray fallbacks for its earlier primary, equals, selected segment, result-panel, dock-selection, shadow and sheet-backdrop declarations. Only wind-diagram vector colors remain blue. The rebuilt mobile-only package, five asset hashes and six-file source patch are verified; three replaced bundles were hash-archived outside the site, and the offline cache rotated. In a headed 390px browser, Crosswind's Day/Night result panel, active input and keypad used solid gray/gold materials; `12` plus Next advanced input focus. Calculator Numbers/equals stayed gold, numeric keys gray, and `1+2=` returned `3`. Reduced-motion emulation removed Done/glint motion. Runtime guard 28, source 36, source worker 3, shipped worker 4, theme/cache/archive 12, contrast 109, zero-stale archive and 523+6+4 wiring passed. Remaining helper workflows, backup delivery, native touch and actual zoom are still open; exact evidence is in `visual-checks-20260924.md`.

## Simply Endorsed final legacy module retirement

The remaining 2,623-line `simply-endorsed.css` matched only four selectors in the live workspace: three hidden-header selectors and the footer Guidance link. Its exact 49,456-byte pre-retirement state and SHA-256 manifest were archived outside deployment, then the loaded module was reduced to 25 lines preserving those compatibility controls. The active workspace continues to use `workspace.css` and shared Aurum materials. A before/after 640px Day Guidance screenshot was pixel-identical; 320px Night First Solo and its category dialog retained their content, orange Student pilot identity, gold controls and viewport fit. The 640px narrow-layout check also found no document overflow on home, tools, FlightRisk, FOI Cards, PilotSolve and Night CertPath. Shared sync/cache/audit, workspace assertions, offline cache tests, theme tests and contrast passed; exact observations are in `visual-checks-20260924.md`. Actual browser zoom and live OS appearance remain unverified because the available browser zoom shortcuts had no effect and macOS UI was locked.

## CertPath completed-field status material

The active Experience badge gained `.complete` from a real zero-entry action, but the shared neutral adapter overrode its old green styling, leaving the 4/4 completed badge visually indistinguishable from incomplete counters. The app-owned completion rule now uses the existing Day/Night semantic green text on a solid raised gray surface, with a green inset rim that does not change badge geometry. The live Day/Night badge computes 6.25:1 and 5.07:1 text contrast, remains 44×28px, and fits the 320px viewport. Adjacent primary, secondary and text actions were inspected and retained their correct gold, raised-gray and quiet hierarchy. No calculator logic or data format changed. The source and rendered evidence is in `visual-checks-20260924.md`; full planner, native touch and actual zoom acceptance remain open.

## Obsolete shared tool header retirement

Archived the current 32,184-byte `tool-core.css` outside deployment, then removed all 85 `.topbar-*` rules and mixed selectors for a header absent from the three pages that load this stylesheet. The resulting core is 1,003 lines / 21,674 bytes, retains the current floating nav and Part 61 workbench rules, and contains zero `.topbar-*` references. A fresh browser loaded its final `9a6c86ec5c` hash; the three affected app entries had identical visible computed-style signatures and document widths before/after at 390px Night. CertPath Private goal, Certificate Generator First Solo and Simply Endorsed Tasks selection still displayed the metallic gold gradient after interaction. Shared sync/cache/audit, workspace assertions, navigation/cache and theme tests, contrast and whitespace checks passed. The 523-route audit proves wiring, not every interaction; deeper route and native zoom/touch acceptance remain open. See `visual-checks-20260924.md` for evidence and the service-worker cache caveat.

## FlightRisk completed VFR risk bands

In a fresh isolated browser, confirmed a Private Pilot VFR profile, entered six synthetic experience values, selected aircraft hazards, and used each section's Complete Section action to reach a final result. The real score moved from MODERATE 14 (one +5 hazard and three +9 experience flags), to HIGH 24 (three hazards), to LOW 0 after answering those hazards No and clearing the automatic flags. The result dialog kept green/amber/red operational meanings, solid gray reading material, metallic gold Print summary action, and raised-gray secondary actions. Screenshots were reviewed across desktop and 320px Day/Night; the 320px dialog and three footer controls fit the viewport, with all controls 44px high. Reload retained the completed LOW result, confirmed profile, six reviewed sections and entered hours. FlightRisk source tests 27/27, canonical contrast 109/109 and route/supporting/manifest audit 523+6+4 passed; Night LOW badge/action title measured 7.37:1 on their solid green tint. This closes the named remaining VFR risk-band visual check, not IFR/other-profile paths, print delivery, native touch or actual zoom. The existing restored-draft banner says “unfinished” even after a complete result; it is logged without changing wording under this theme scope. See `visual-checks-20260924.md` for screenshots and exact observations.

## FlightRisk print summary isolation

Printing a completed LOW assessment initially produced two sheets: the assessment on page one and the shared site footer on page two. Hiding that footer alone still stranded the signature on a second sheet because the screen shell retained viewport-height flex geometry and bottom dock padding in print. FlightRisk's source-owned print CSS now hides only the direct site footer and removes that screen-only geometry during print. The current standalone package produces one Letter page for both a complete LOW 0 and a richer HIGH 24 VFR example; their green/red risk chips, drivers, mitigations, disclaimer and signature were visually checked in rendered PDFs with no clipping. The desktop Print summary action invoked `window.print()` once in a local browser probe. No score logic, on-screen geometry, branding or exported diagram artwork changed. Current source patch dry-applies, superseded generated assets were hash-archived outside deployment, and the 523+6+4 wiring audit passes. Native system print dialog and device delivery remain unverified; see the visual check for precise PDF evidence.

## FlightRisk completed IFR path

A fresh 834px Night browser selected IFR and Rated for a Private Pilot, confirmed the profile, entered all seven synthetic experience values, selected a zero-point precision approach, and completed each assessment section. The final LOW 0 result rendered at 834px in Day/Night and at 320px Night with gold/gray action hierarchy and the existing green risk meaning. Reload retained IFR, Rated, the confirmed profile, all six reviewed sections, the 30 actual-instrument hours and the selected precision approach; the 320px document width remained 320px. This closes one rated-Private IFR result path and saved approach state, not all profile/risk combinations, native touch, zoom or native print delivery. See `visual-checks-20260924.md` for screenshots.

## FOI Cards current study section material

The section chooser showed every destination in the same gray hardware, even during an active section pass. Its current remaining-card scope now receives the shared metallic-gold selected fill, bronze inset edge and dark key ink, with `aria-current=true`; unselected sections keep raised gray. No row dimensions, section destinations, card data, progress values or amber Review/green Memorized meanings changed. A fresh local pass showed All remaining selected; changing to Learning moved the gold state, and reload/Resume restored it. The welcome state has no current marker before a pass begins. Night and Day 390/320px screenshots fit the viewport. FOI dialog tests 3/3, 238-card content audit, 22 shared Python tests, 109 contrast pairs, 523+6+4 route/supporting/manifest audit and whitespace checks passed. See the visual check for bounded evidence.

## Aero Lab expanded teaching view

Rendered the full-screen wind tunnel in Day Air motion and Night Air motion/Pressure, including selected teaching modes and overlays. The active controls remained reflective gold with dark labels and the rest raised gray; airflow and pressure field colors stayed tied to the scientific visualization. The expanded stage filled the 1280×720 viewport without horizontal overflow; toggling its expand control returned to the normal layout. At 320px Night the existing desktop handoff appeared with a gold Copy link for your desktop action. No source change was needed. This adds a previously unreviewed Aero Lab state, while remaining model interactions, native touch and zoom stay open.

## Shared menu current-destination material

The floating dock's current destination was gold, while the matching link in its expanded Explore menu still rendered as gray. The shared Aurum authority now gives that current menu link and its “Current” label the same metallic gradient and dark key ink. A fresh local browser showed the Home state in Day/Night desktop and 390px Night, plus the nested Private Pilot Learn route in 390/320px Night; the gold held on hover, and neither page gained horizontal overflow. The selected System appearance was already gold and was left unchanged. A separate 32px-root-font probe at 320px showed vertical menu tabs, a scrollable complete link list and Escape focus return; actual 200% browser zoom remains open. Asset synchronization updated 545 HTML sources, both standalone caches rotated, and 523+6+4 wiring, 22 Python tests, 109 contrast pairs and whitespace checks passed. This is a shared navigation-state correction, not full route or keyboard/zoom acceptance; see `visual-checks-20260924.md`.

## Enlarged-text dock and homepage containment

At a 32px root font and 320px viewport, CertPath's five bottom-dock labels overlapped even though the page had no horizontal overflow. The shared liquid-dock rules now cap phone labels at 15px (normal 12px), preserving visible names and the existing 48px key widths. A fresh browser measured every CertPath key's scroll width no larger than its client width in System/Day and System/Night; the public homepage dock also fit at 320px. The same probe found the homepage hero's longest line clipped: its 320px font had grown to 81.6px inside a 276px column. The home-owned phone heading rules now cap growth by viewport width. At normal root size the 320px heading remains 40.8px; at 32px root it becomes 44.8px, wraps within the column, and leaves the gold primary and gray secondary actions unchanged. At 390px Night it fits at 54.6px. This is a text-enlargement probe, not an actual browser 200% zoom claim. The final shared/app style URLs and caches are refreshed; 523+6+4 wiring, 22 Python tests, 109 contrast pairs and whitespace checks pass. See the visual log for images and bounds.

## Simply Endorsed independent dock text containment

The First Solo task at 320px with a 32px root font exposed overlapping Tasks/Library/Guidance/Menu labels in the app-owned mobile dock. `simply-endorsed/js/workspace.css` now caps only that dock's label font at 15px, matching the shared dock's enlarged-text response while retaining its four-key layout and gold selected Tasks state. Fresh System/Day and System/Night renders measured each visible key's scroll width equal to its 68px client width; the page remained 320px wide. The orange Student pilot heading and data were untouched. At the same enlarged size, its Night menu dialog fit within x=19–301, scrolled vertically and returned focus to Menu on Escape, with System still gold-selected. FOI Cards' Night welcome and Card 1 answer controls also fit at 320px: Flip gold, Next gray, Review amber and Memorized green. PilotSolve's Night Tools and Calculator states fit at 320px; the inner calculator scroll exposed the gold equals key and `1+2=` returned `3`. These FOI/PilotSolve observations did not require source edits and do not prove all routes or native touch/zoom. Simply Endorsed workspace assertions 1,678, shared Python tests 22, contrast pairs 109, route wiring 523+6+4 and whitespace checks passed. See the visual log for bounded screenshots.

## Aero Lab enlarged-text phone handoff

At 320px with a 32px root font, the standalone simulator's desktop handoff retained its gold Copy link action and gray Day/Night materials. The longer text pushed the action below the first viewport, but the normal page scroll exposed its full 268×106px bounds above the bottom dock; document width stayed 320px. In System/Night, clicking it produced Link copied and a clipboard success status. No app source or aerodynamic model changed. This is a bounded handoff check, not desktop simulator or native zoom acceptance.

## FlightRisk and Certificate Generator enlarged-text containment

FlightRisk's Saved Setup grid expanded to 457px, and the instrument-rating controls expanded beyond their 132px slot at a 320px viewport with a 32px root font. The source-owned grid now uses zero-minimum tracks; the rating buttons stack and wrap on phones; shared app card headers wrap their title and right slot. The rebuilt package fits 320px in Day and Night with readable gold selection and 72–80px rating targets. FlightRisk source tests pass 27/27; its 18-file source patch dry-applies to the preserved tactile baseline. Ten superseded generated bundles were SHA-verified and archived outside deployment at `flightrisk-text-fit-20260925`; the stale scanner returns zero candidates.

The Certificate Generator's certificate grid and name-field rows had the same automatic minimum-track expansion, reaching 383–387px on its first two steps. Zero-minimum tracks and contained text inputs now keep Steps 1–3 at 320px. The review step's sticky Back/Download actions wrap into full-width buttons only when needed, with shared-dock clearance; the normal 16px-root phone labels remain side by side. A synthetic First Solo journey reached Review at 320px/32px root in Day and Night with no document overflow; the selected gold Download action and 1080×1920 canvas remain. The route audit passes 523+6+4, shared tests 22, canonical contrast pairs 109, Simply Endorsed assertions 1,678, and whitespace check. These are text-enlargement and one synthetic path checks, not actual browser 200% zoom, native touch, or installed-device export delivery.

## Crank & Core enlarged-text collection stage

The pinned engine runtime used absolute collection positions for its title, model tap area and preview canvas. At 320px/32px root, longer copy ran into those fixed positions. The editable `avionics-overlay.css` now scales the preview offset and stage height with enlarged root text while preserving the normal 16px geometry; the specs clear the gold Explore engine action at enlarged size. Final 16px/32px-root checks at 320, 360, 390, 401, 620, 621, 834 and 1280px widths kept the document within each viewport and separated intro, title and hit area. At 320px, the 16px-root stage remains 820px; at 32px root it grows to 1220px, with positive gaps throughout. Day/Night Rotax renders and Night Lycoming selection were checked. The packaged model assets, runtime, instructional colors and data were unchanged. Actual browser zoom, deeper model controls and native touch remain open.

## Tools directory enlarged-text active stage

At 320px/32px root, the active PilotSolve title crossed the app-stage card's right edge while the document itself remained 320px wide. The phone-owned `tool-catalog.css` title cap now preserves the original 26.4px font at a normal 16px root, uses 32px at the enlarged 320px sample, and allows long app names to wrap. A fresh browser measured every one of the seven selected names inside the stage identity at 320px and 390px/32px root in Day/Night. The gold selected filter and gold Open app action, raised-gray orbit arrows, category labels, and navigation remained intact; selecting Training and instruction then stepping to Simply Endorsed CFI kept the document at 390px. This does not claim native browser zoom or complete catalog keyboard/touch acceptance.

## Learn library enlarged-text tab containment

At 320px/32px root, the selected Topics label extended beyond its gold tab despite no page-level overflow. `learn/style.css` now lets the Browse view tabs wrap naturally when their intrinsic labels no longer fit; normal 16px-root tabs retain their side-by-side positions. A fresh Night/320px render kept both full-width controls inside the viewport with the selected Topics tab metallic gold and Training paths raised gray. The empty-search path kept its input and Clear filters action within the viewport; Clear stayed gray and restored the unfiltered route. The Learn stylesheet sync refreshed 478 HTML sources, and the 523+6+4 route/supporting/manifest audit passed. Native browser zoom, all article variants and full keyboard/touch acceptance remain open.

## Blog enlarged-text reading sample

The Blog directory's long Medical & Certificates filter wraps within its gold button at 320px/32px root and updates the article count without page overflow. The Private Pilot cost article's Night introduction fits the same viewport, and its labeled cost table scrolls internally by keyboard ArrowRight while the document remains 320px wide. No Blog code was changed in this review. Screenshots and exact scope are in `visual-checks-20260924.md`; other article variants, native touch and actual browser zoom remain open.

## Service split-panel text containment

Discovery Flight's split panels clipped copy and actions at 320px with a 32px root despite no document overflow. The phone-owned Learn stylesheet now wraps split-panel text within its grid track and caps enlarged headings by viewport width while preserving the normal 24px heading. Fresh Day/Night Discovery Flight checks found all five panels contained, the gold/gray lower actions visible, and the empty contact-form error within the card. A Night containment sweep of all seven service routes found no split-panel or heading overflow at 320px/32px root. The Learn hash was synchronized across 478 HTML files; cache refresh, 523+6+4 route audit, 22 shared tests, 109 contrast pairs and Git whitespace check pass. Broader interaction, native touch and true browser zoom remain open.

## Editorial FAQ enlarged-text containment

The Southern Indiana FAQ's long Jeffersonville question clipped inside its collapsed card at 320px/32px root; an opened Flight Training answer had a similar hidden overrun. The shared Learn phone rules now cap only enlarged summary text by viewport width and allow summaries and answer copy to wrap within the card. Normal 16px summaries remain 16px. A fresh browser opened all 34 FAQs across Southern Indiana and seven service pages at 320px/32px root with no internal horizontal overflow; Southern Indiana Day/Night visuals and its expanded answer were inspected. The final CSS hash was synchronized to 478 HTML sources; cache refresh, 523+6+4 route audit, 22 shared tests, 109 contrast pairs and Git whitespace check pass. Native zoom, touch and screen-reader review remain open.
