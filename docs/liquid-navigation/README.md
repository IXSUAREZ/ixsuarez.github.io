# Liquid navigation and orbit stage — implementation record

## Latest revision: description-only stage

At the user’s request, interface screenshots and the Overview/In detail controls have been removed. The same curved app selector now updates a compact description, compatibility notice and explicit Open link above it. Screenshot metadata and screenshot state are no longer part of the catalog. All eight catalog checks pass; desktop and phone layouts were inspected. See [current desktop](screenshots/description-only-desktop.png) and [current phone](screenshots/description-only-phone.png).

The original evidence below records the preceding screenshot-based version; those screenshot-specific statements are superseded by this revision.

Redesign prepared for the user-authorized GitHub Pages release, 2026-09-24. The live release is verified separately after the push.

Preview: http://127.0.0.1:8941/tools/

Checkout: `/Users/diegosuarez/Projects/suarez-liquid-navigation-20260924`  
Branch: `codex/liquid-navigation`  
Baseline: current remote main `27911c6` (`Redesign shared footer while preserving current site navigation`). The original dirty workspace was not changed.

## Result

The shared bottom dock opens a native dialog whose decorative surface blooms separately from its upright text. Explore, Connect and Appearance support direct selection, arrow keys and horizontal swipes. Close, Escape and backdrop dismissal restore focus and page position. Contextual actions retain their original handlers; opening an app dialog releases the site dialog first. FOI has a generated partial preserving Sections, reset, related-tool links and its CTA identifier.

The tools catalog now presents one app, its actual screenshot, purpose, compatibility and an explicit launch link. The curved rail selects previews; it never launches or advances automatically. Filters preserve eligible selection, and session storage restores selection and screenshot. All seven direct links remain in a native disclosure with scripting disabled. The homepage Hangar keeps its existing three entries. Standalone app shells and aviation logic/content remain unchanged.

Glass is confined to navigation. The stage is a quiet matte surface. At 200% text, the menu selector becomes a vertical list and the app rail uses three neighbors; this intentional adaptation protects readable labels. The engine screenshots were recaptured from the current local engine app, replacing imagery showing the archived instruments tab.

## Evidence

| Check | Result and evidence boundary |
|---|---|
| Automated behavior | **44 passed, 0 failed**. [Full output](test-results.txt). Navigation, catalog, appearance, tactile controls, footer, homepage and offline cache references. |
| Catalog | Browser selected all seven apps and their detail screenshots; destinations and compatibility matched catalog data. Unit checks cover all launch identifiers, filters, keyboard controls, missing images, blocked storage and malformed saved state. |
| Return journey | Browser drag selected PilotSolve, explicit Open navigated to the app, Back restored PilotSolve. The app's independent shell remained intact. |
| Menu | Browser checked all three sections, current destination, Escape focus return and short-screen focus wrapping. Unit tests cover backdrop dismissal, repeat initialization/toggles, focus containment, preference persistence, app action forwarding and modal transfer. |
| App integration | Browser checked CertPath contextual step dock, FOI Sections, FOI generated menu, Simply Endorsed's independent category dialog and engine wrapper appearance. Reset action forwarding was tested with a spy, without erasing study progress. |
| Responsive | Inspected 390×844 phone, 768×1024 tablet, 1440×1000 desktop and 844×390 landscape in dark/light combinations. Short panels scroll internally. No horizontal overflow observed on the tools phone layout. |
| Enlarged text | Browser fixture sets root text to 200%; checked tablet and phone, dark and light. Fixed overlapping menu sections and adapted the rail. This is text enlargement, not an OS Dynamic Type or browser-zoom certification. |
| No JavaScript | Browser sandboxed iframe with scripting disabled exposed all seven app destinations and all standard site links. [Screenshot](screenshots/no-javascript.png). |
| Reduced motion | Unit tests explicitly ensure no stage or closing-surface WAAPI animation under reduced motion. CSS disables expansion/rotation transitions. Actual OS preference toggling was not exercised. |
| Solid surfaces | Browser computed styles report opaque RGB backgrounds and `backdrop-filter: none` on both dock and panel. [Screenshot](screenshots/solid-controls.png). |
| Contrast | Calculated muted-text contrast: dark stage 8.76:1, light stage 6.03:1; glass menu over worst black/white backdrops 7.67:1 dark / 5.32:1 light. [Values](contrast.json). This checks text tokens, not every pixel of every app screenshot. |
| Accessibility | Native dialog, labelled tabs/panels, pressed-state app buttons, polite position status, alt text, 44px controls and ordinary launch links. Inspected browser accessibility tree and keyboard behavior. VoiceOver speech output, physical touch devices and a full cross-browser assistive-technology audit remain unverified. |
| Generators | `render-tool-catalog.py --check`: current; `sync-chrome.py --check`: all pages in sync; `sync-avionics.py --check`: 0 stale sources; `git diff --check`: clean. |

The in-app browser intermittently skipped cached script initialization on first navigation; a fresh canonical navigation recovered the affected existing app. These observations are not a claim that every application has received a functional or content audit. No backend or aviation calculations were changed.

## Rendered review passes

1. **Structure:** one prominent app, explicit launch, purpose filters, discoverable all-app links; site destinations split from appearance and app actions.
2. **Interaction:** verified selection, drag, browser Back, modal dismissal/focus, internal scrolling and persistence. Added regression coverage for moving a contextual action into another dialog.
3. **Finish:** corrected inherited button transforms, enlarged-text collisions, FOI link layout, screenshot clipping and solid-material specificity. Rechecked the affected rendered states.

## Screenshots

- [Desktop dark](screenshots/desktop-dark.png) · [Desktop light](screenshots/desktop-light.png)
- [Phone light stage](screenshots/phone-light.png) · [Phone dark menu](screenshots/phone-menu-dark.png)
- [Tablet dark](screenshots/tablet-dark.png) · [Tablet light](screenshots/tablet-light.png)
- [Landscape dark menu](screenshots/landscape-menu-dark.png) · [Landscape light menu](screenshots/landscape-menu.png)
- [Phone text 200%, dark](screenshots/phone-text-200-dark.png) · [Phone text 200%, light](screenshots/phone-text-200-light.png)
- [Tablet text 200%](screenshots/text-200-menu.png) · [Desktop Connect](screenshots/desktop-menu-dark.png)

## Apple guidance and web decisions

Official HIG guidance consulted 2026-09-24. This is an Apple-inspired website, not native Liquid Glass or an Apple-approved component. The live HIG source refresh checked 173 source pages without fetch failures or index drift; substantive consultation was focused on applicable topics, not all 173 pages. The materials examples were also inspected visually.

| Area / source | Recommendation and decision | Implementation / evidence | Status |
|---|---|---|---|
| [Materials](https://developer.apple.com/design/human-interface-guidelines/materials), navigation and legibility | Use a distinct functional layer and sufficient density. Smoked regular glass for navigation, opaque content surfaces, solid alternative. | `assets/avionics.css`, `assets/tool-catalog.css`; dark/light and solid screenshots | Implemented, visually checked |
| [Motion](https://developer.apple.com/design/human-interface-guidelines/motion) | Motion explains relationships and respects reduced motion. Surface bloom is separate from content; transitions are brief and cancelable. | `site-nav.js`, `tool-catalog.js`; reduced-motion tests, CSS inspection | Implemented; OS toggle unverified |
| [Gestures](https://developer.apple.com/design/human-interface-guidelines/gestures) | Avoid gesture-only actions. Swipes have arrows, tabs, direct links and keyboard equivalents; vertical scrolling remains native. | Browser drag and keyboard tests | Verified within tested browser |
| [Collections](https://developer.apple.com/design/human-interface-guidelines/collections) | Keep content selection understandable and navigable. The requested orbit deliberately departs from standard grids; explicit launch and All apps preserve a familiar path. | Static renderer and catalog tests | Intentional web deviation |
| [Modality](https://developer.apple.com/design/human-interface-guidelines/modality) / [Focus and selection](https://developer.apple.com/design/human-interface-guidelines/focus-and-selection) | Distinguish focus from selection and contain modal interaction. Use native HTML dialog with labelled tabs, visible Close, Escape, focus return and app-dialog handoff. | Native accessibility tree, browser keyboard checks, modal transfer test | Verified behavior; spoken screen reader unverified |
| [Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) / [Layout](https://developer.apple.com/design/human-interface-guidelines/layout) | Provide legible adaptable content and alternatives. Enlarge text without forcing the arc, allow panel scrolling, preserve static links and error recovery. | 200% text, landscape and no-JS screenshots; image/storage recovery tests | Verified with stated fixture limits |
| [Dark Mode](https://developer.apple.com/design/human-interface-guidelines/dark-mode), branding and writing | Coordinate appearances and keep recognizable identities and concise labels. Retain app icons, use accent sparingly, preserve current theme preference API. | Catalog colors, appearance tests, actual screenshot assets | Implemented and reviewed |

Foundation screening (all 18): accessibility, app icons, branding, color, Dark Mode, icons, images, inclusion, layout, materials, motion, typography and writing apply to the controls, content hierarchy and adaptation above. Privacy applies narrowly: the new selection state is session-local, with no new transmission. Immersive experiences and spatial layout do not apply to this 2D navigation task. SF Symbols production does not apply because the existing SVG/icon assets are retained. Right-to-left localization is outside this English-only redesign; no RTL support claim is made.

Six HIG categories screened: getting started (web adaptation), foundations (above), patterns (navigation/modality), components (buttons, tabs, collections, dialogs), inputs (pointer/touch/keyboard/focus), technologies (no new native Apple framework; semantic HTML/CSS/JS).

## Files and regeneration

Main sources: `assets/site-nav.js`, `assets/avionics.css`, `assets/tactile.js`, `assets/tool-catalog.js`, `assets/tool-catalog.css`, `config/tool-catalog.json`, and `assets/partials/nav*.html`.

Generated page changes are shared navigation and byte-bound resource URLs across the site. The tools page additionally contains the new generated stage. The FOI partial preserves its custom study dock. The asset-version generator preserves existing stylesheet order so application-specific CSS continues to own its shell.

Run from the isolated checkout:

```sh
python3 scripts/render-tool-catalog.py
python3 scripts/sync-chrome.py --apply
python3 scripts/sync-avionics.py
python3 scripts/refresh-tactile-caches.py
python3 -m http.server 8941 --bind 127.0.0.1
```

The preview server is local only. Test dependencies are provided by an ignored local `simply-endorsed/node_modules` link. The temporary enlarged-text and scripting-disabled fixtures live in ignored `output/liquid-qa/`.

## Concurrent redesign compatibility

Release baseline was re-fetched and confirmed as `27911c63a46ef94c302692881dca86d4c9838553`. No intervening production commits required merging. The active **Prototype premium gold theme** task confirmed its work is a local overlay only, with no production edits or push planned, and is adapting the liquid/orbit selectors and tokens against this checkout. The active **Redesign blog reading experience** task is working in a separate journal checkout; its generator adds scoped journal resources and reading markup. It has been notified to integrate over this release and regenerate shared chrome before publication. Neither unfinished redesign is included in this deployment.

Keep `--dock-clearance`, the `SuarezAppearance` preference API, app accent semantics, `.nav.liquid-dock`, `.liquid-menu`, `.tools-experience`, and `.orbit-catalog` when merging future work. Use source transformations on current main instead of replacing complete generated pages from an older snapshot. Future unmerged designs still require their own integration checks; this release cannot certify their unfinished behavior.

The final description-only release passes all 44 regression checks and all three generator checks. Screenshot assets from the earlier experiment were restored to baseline because the catalog no longer uses them.
