# Sitewide neumorphism completeness review

final result: passed

Scope: complete the gray-and-gold material system across the existing website and source-owned app interfaces. Preserve content, workflows, original imagery, scientific/semantic colors, calculations, authentication and exports. This is a material-consistency follow-up to release `104626f9`, not a pixel-for-pixel rebuild of generated concept layouts.

## Visual truth and comparison inputs

- User material reference: `/Users/diegosuarez/Downloads/IMG_8619.PNG`, 1206 × 2622 pixels; the gray dashboard region is the material reference.
- Approved direction: `/Volumes/VIXIONDRIVE/VIBE CODING PROJECTS/SUAREZ.CFI/docs/design/neumorphism-previews-2026-10-14/{website-pages,app-launcher,tool-workspaces}.png`.
- Actual current renders and computed samples: `output/neumorphism-completeness/site/`, `apps/`, and `standalone/`.
- Combined full-view comparison inputs opened and reviewed: `comparison/launcher-full-comparison.png` and `comparison/pages-full-comparison.png` under the same output root.
- Combined focused material comparison opened and reviewed: `comparison/material-focused-comparison.png`. It compares the actual reference material with cropper actions/range, reader controls, model-note dialog and validation fields. `comparison/comparison-inputs.json` records source dimensions and normalization.

Desktop CSS viewport: 1440 × 1000. Phone: 390 × 844. Additional narrow/reflow checks: 320 × 760 with Larger reader text and open menus. Current full-view screenshots include `28-tools-day-desktop-final.jpg`, `29-home-day-desktop-final.jpg`, `30-reader-day-desktop-final.jpg`, and `27-tools-night-phone-final.jpg`. Desktop rasters are 1425 × 990 and the phone raster is 375 × 812: these have uniform density scaling and were fitted without distortion. Model dialog `31-model-notes-night-phone-final.jpg` is 390 × 844. Source boards are illustrative compositions, so comparisons judge the required material, hierarchy and grid rather than inventing pixel precision for their differing frames.

The invalid early `11-model-notes-night-phone-after.jpg` is excluded; `31-model-notes-night-phone-final.jpg` replaces its visual evidence. The first attempted desktop launcher capture was recaptured after viewport settlement, then the combined comparison was regenerated and reopened. The excluded wrong-viewport Day phone census and pre-Day-alias census are diagnostic history, not final acceptance evidence. App-owner reports separately flag compressed and stale-tab captures; those are not used for acceptance.

## Required fidelity surfaces

- **Typography:** system sans-serif / SF fallback family is retained consistently; current computed UI family is `-apple-system, system-ui, SF Pro Display, SF Pro Text, Helvetica Neue, Arial, sans-serif`. Headline hierarchy, existing compact UI labels and prose line lengths remain readable. Standard and Larger reader states and 320px wrapping were inspected. No new font or generated text was substituted for product copy.
- **Spacing and layout:** the complete seven-app, four-column phone grid and four-plus-three desktop grid retain names below icons. Purpose filters return to all seven apps. Dock compaction, dialogs, disclosure rows, input hit areas and native range geometry retain their original behavior. All final route entries have no page-width overflow. Existing page proportions and footer placement take precedence over illustrative concept framing.
- **Colors and tokens:** Day `#E3E3E3`, Night `#414141`, charcoal/light text, paired light/dark shadows and inset wells map to shared tokens. Gold identifies primary/current/selected states. All 111 audited contrast pairs pass. Category, risk, stage, valve, plot and model colors retain their meaning. Forced-color and print fallbacks remain intact.
- **Imagery and assets:** original app icons, portraits, animated sky, certificate artwork, model data and scientific renderers are preserved. No mock logo, CSS drawing or replacement illustration was substituted. Original assets take precedence over small generated-art differences in the concept sheets.
- **Copy and content:** 524 editorial route signatures and actual active runtime roles are preserved by independent comparison. No teaching copy, calculations, curriculum, credentials or model-fidelity claims were changed. Interface labels remain the existing product labels.

## Comparison and repair history

The initial source/state audit was not sufficient to pass. These substantive differences were repaired and reviewed in current after states:

1. Flat quiet/tertiary actions, menu rows, inactive dock keys and disclosures now use neutral raised material; primary/selected gold and active inset states remain clear.
2. The legacy Day appearance selector overrode generic control shadows. Matching canonical alias specificity fixes Day as well as Night. The corrected Day desktop census has no unexplained button candidates.
3. Reader selected text size and motion checkbox retained old/flat treatment. The shared reader CSS now supplies gold selected depth and native inset checkbox wells. After evidence: `22-reader-larger-day-320-final` and `26-reader-settings-night-320-final`.
4. Simply Endorsed quiet/navigation/category actions and checkboxes, CertPath menu/status/checkbox controls, and Certificate Generator ghost/upload/paste/range controls were corrected. Selected Not applicable was additionally repaired to pair gold background with dark key text. Current exact-asset receipts and Day/Night screenshots are in `apps/remaining-family-verification.md`.
5. Aero Lab source/header and independent phone Menu actions, selected studio controls, analysis surfaces and dialog depth were corrected; current Day/Night open-close-reopen states pass.
6. Crank & Core's lazy ignition dialog, combustion/firing/Lycoming teaching panels and separate sticky panel header were corrected. Scientific/model colors were retained.
7. The reachable Rotax saved-component study was brought into shared theme/supporting-document coverage without changing its embedded renderer/model payload. Factory reference outer chrome was corrected.
8. PilotSolve helper/menu/disabled actions and private Guide menu/lesson/tray/timer/primary controls were corrected in their source-owned CSS exports. Private auth and protected copies receive the same final shared material bytes.

Before/after findings and valid state indexes are in the app and standalone audit reports. Native cropper zoom was exercised with a self-authored colored-shape fixture: 0 → ArrowRight 1 → reset 0, then Photo Added at review. No personal photo or production contact submission was used.

## Coverage and limits

`site/four-viewport-summary.json` contains four sets of 531 unique entries: 524 registered routes plus seven supporting documents. There are no pending loads, errors, unexpected widths or horizontal overflow in the final merged sets. Later targeted samples replace early transient app/loading samples. The 62 reachable interface families are mapped in `verification/requirement-evidence-matrix.md`; representative component variants establish material coverage, not every aviation scenario or numeric permutation.

The public guide gateway redirects to another origin, whose existing appearance preference is independent. Its redirect/layout is counted in the route matrix; private Day/Night styling is separately verified from the packaged auth/guide UI. This review does not claim automatic cross-origin preference synchronization.

Transparent search children inside an inset search well, native range hitboxes with a raised thumb/track, and the compact Menu face on its own material shell are intentional composites. Inline prose/source links, scientific canvases and exported print/certificate artwork retain their appropriate treatment. Native OS/file/print/biometric UI and Sketchfab-owned interior UI are outside source-owned CSS. The factory provider reported unavailable; its outer loading/unavailable/disabled shell was inspected. Actual owner passkey acceptance remains a separate device/session check.

## Findings and implementation checklist

No actionable P0/P1/P2 material or layout differences remain in the reviewed source-owned interfaces. Original workflow/layout/imagery differences from generated concepts are intentional preservation constraints. No prompt/planning text was added to product flows.

- [x] Shared and app-owned material corrections saved in source and matching exports.
- [x] Current combined full-view and focused comparisons opened after repairs.
- [x] Day/Night desktop/phone route census and targeted selected/disabled/open/checked states reviewed.
- [x] 320px and enlarged-reader reflow checked.
- [x] Content/runtime/private/embedded-payload preservation and deterministic caches checked independently.
- [x] Twelve isolated theme/sync regressions pass; private Guide typecheck and 50 tests pass; relevant app lifecycle/focus regressions pass.
- Publication is verified in a separate release receipt; it is not inferred from this local visual-QA gate.

No P3 visual refinement is required for this consistency scope. Real-device/passkey/provider checks retain the limits stated above.
