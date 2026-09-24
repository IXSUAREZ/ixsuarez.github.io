# Compact tactile controls — implementation and verification

Date: 2026-09-24. Authorized scope: publish shared navigation and tactile controls across the public site and active tools. Baseline: fresh isolated clone of `origin/main` at `6c97779192aad3a245cd0a1b5db7aab0c3e34d3d`. Dirty authoring copies were used only to locate matched app sources. This record supersedes the older always-visible dock-label specification.

## Source guidance and product choices

Apple's live HIG source index was refreshed on September 24 (173 entries, no changed entries). Materials, buttons, motion, tab bars, sliders, toggles, accessibility, gestures, and focus guidance were read live. Apple guidance supports clear hierarchy, bounded materials, immediate feedback, accessible alternatives, and reduced effects. Satin metal, mechanical depth, compact dimensions, and direction thresholds are SUAREZ.CFI choices. CSS glass is a web adaptation; it is not the native Liquid Glass API or a claim of Apple certification.

| Foundation | Applicability and implementation |
|---|---|
| [Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) | Native values/handlers, labeled controls, keyboard alternatives to dragging, focus distinct from selection, 44 CSS-pixel web targets, reduced effects. |
| [App icons](https://developer.apple.com/design/human-interface-guidelines/app-icons) | Existing identities retained; no icon artwork/export changes. |
| [Branding](https://developer.apple.com/design/human-interface-guidelines/branding) | Garmin-inspired restrained metal and cyan; no Apple artwork or native-product imitation claim. |
| [Color](https://developer.apple.com/design/human-interface-guidelines/color) | Semantic action/status tokens; FlightRisk red/green meaning retained independently of generic selected styling. |
| [Dark Mode](https://developer.apple.com/design/human-interface-guidelines/dark-mode) | Existing Dark default and Day/System product overrides preserved; opaque mode verified separately. |
| [Icons](https://developer.apple.com/design/human-interface-guidelines/icons) | Existing Lucide graphics, accessible names when labels collapse, every icon remains actionable. |
| [Images](https://developer.apple.com/design/human-interface-guidelines/images) | Identity, homepage sky, model imagery, and certificate geometry preserved. |
| [Immersive experiences](https://developer.apple.com/design/human-interface-guidelines/immersive-experiences) | Engine canvas retains its interaction model; this change adds no immersive platform. |
| [Inclusion](https://developer.apple.com/design/human-interface-guidelines/inclusion) | Existing plain labels retained; no gesture-only or sound-only controls. |
| [Layout](https://developer.apple.com/design/human-interface-guidelines/layout) | 600px desktop dock; 60/56px expanded, 48px collapsed; safe areas, stable clearance, narrow responsive layouts. |
| [Materials](https://developer.apple.com/design/human-interface-guidelines/materials) | Glass on navigation/overlays; matte reading/results; Solid/no-blur/reduced-transparency opaque fallbacks. |
| [Motion](https://developer.apple.com/design/human-interface-guidelines/motion) | Immediate 2px press/release feedback; no activation delay; reduced motion removes control travel and transitions. |
| [Privacy](https://developer.apple.com/design/human-interface-guidelines/privacy) | No new backend, telemetry, permissions, or data format; records remain owned by each tool. |
| [Right to left](https://developer.apple.com/design/human-interface-guidelines/right-to-left) | Logical dimensions used where practical. Existing English product preserved; no new RTL localization claim. |
| [SF Symbols](https://developer.apple.com/design/human-interface-guidelines/sf-symbols) | Not applicable to asset delivery: web uses licensed Lucide icons, not SF Symbols. |
| [Spatial layout](https://developer.apple.com/design/human-interface-guidelines/spatial-layout) | No spatial OS interface; model viewport geometry unchanged. |
| [Typography](https://developer.apple.com/design/human-interface-guidelines/typography) | Existing system UI stack, visible values/units, flexible expanded labels; no rasterized control text. |
| [Writing](https://developer.apple.com/design/human-interface-guidelines/writing) | Existing destinations/actions retained; accessible names explicitly distinguish increase/decrease/exact values. |

All six HIG categories were screened: **Getting Started** informs the web adaptation and platform distinction; **Foundations** are assessed above; **Patterns** apply to navigation, modality, loading, and feedback; **Components** apply to buttons, tab navigation, segmented controls, switches, ranges, and number fields; **Inputs** apply to keyboard, focus, pointers, touch gestures, and cancellation; **Technologies** add no new platform integration, authentication, health, payment, or native sensor APIs. Physical haptics and audio are deliberately absent.

## Source-to-decision mapping

- [Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons): semantic native activation, distinct disabled/busy/focus/selected states, direct release with no delayed click. Material/press rules live in `assets/avionics.css`.
- [Tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars): preserve destination identity. Adaptive icon-only collapse is a requested web product decision, not a prescribed native tab-bar behavior. `assets/tactile.js` listens only to the main scroller, restores labels on focus/menu/up-scroll, and freezes geometry through pointer release/click.
- [Sliders](https://developer.apple.com/design/human-interface-guidelines/sliders), [toggles](https://developer.apple.com/design/human-interface-guidelines/toggles), [gestures](https://developer.apple.com/design/human-interface-guidelines/gestures): native numeric/range ownership; rotary drag is an additional input path alongside exact entry, arrow keys, and 44px +/− buttons. No wheel-to-value handler. Bounded values clamp using existing min/max/step; existing PilotSolve angles do not wrap.
- [Focus and selection](https://developer.apple.com/design/human-interface-guidelines/focus-and-selection): focused dock expands; focused controls use an outline; selection uses material/accent without replacing status meaning. Menus keep Escape/outside dismissal and focus return.

## Coverage and preserved boundaries

`coverage.json` audits all 523 canonical routes for final shared assets and byte-bound URLs. The full site audit also checks 526 HTML documents, two redirect aliases, metadata, references, and JSON-LD. Shared runtime/styles reach Home, learning categories/articles, Blog, catalog, public instruction pages, PilotSolve, FlightRisk, CertPath, Simply Endorsed, FOI, Aero Lab, Crank & Core, and Certificate Generator.

PilotSolve retains Tools/Trip/Aircraft with a visible header Menu. Its nested scroll region owns collapse, and its React angular fields own numeric updates. The source patch is `pilotsolve/source/tactile.patch`. Aero Lab and FlightRisk baseline builds matched released hashed entry filenames before edits. `app-source.patch` records their bounded source changes, with original-file hashes in `source-baseline-hashes.json`. Build FlightRisk with `FLIGHTRISK_BASE=flight-risk-assessment`; Aero Lab uses its existing relative base. `scripts/package-tactile-apps.py` rejects mismatched public base paths.

Crank & Core is updated only through presentation HTML/CSS/adapter scripts. Its old duplicate iframe load was removed, eliminating a theme initialization race. The legacy Flight Instruments category is hidden and archived deep links return to engine selection. Published engine runtime/model bytes remain unchanged. There is one navigation owner in the exploring view. Homepage sky bytes are unchanged. The protected-byte audit covers 70 sky, engine runtime/model, and certificate files. Certificate rendering JS and image templates are unchanged; controls do not modify canvas export geometry.

`sync-avionics.py` refreshes shared assets. `refresh-tactile-caches.py` must run afterward: it binds PilotSolve's cache to final HTML/shared bytes and precaches shared controls for the endorsement legacy offline shell. Endorsement cache cleanup is namespace-scoped so it cannot remove PilotSolve's cache. No local saved-data keys or migrations change.

## Verification evidence

Automated checks: 37 shared site/navigation/appearance/tactile/engine-loader/offline tests; 34 PilotSolve calculation tests, TypeScript and protected-runtime check; 3 PilotSolve offline-worker and 4 Sites-worker tests; 14 Aero Lab tests; 26 FlightRisk tests; all 98 endorsement engine scenarios; 1,598 workspace assertions; CertPath fresh-start/contact-gate/save/reopen/retry/preservation regressions; Python site audit unit tests. Final route/chrome/metadata/asset audits and authored-source whitespace checks are run before publishing. Generated bundle template strings and unified-diff context are excluded from whitespace lint to retain exact compiler output.

Focused regressions cover down/up thresholds beyond the top region; menu/secondary-scroller exclusion; native click activation while dock geometry is frozen; nested scroll ownership; rotary limits and decimal precision; direct entry; disabled state; canceled dragging; wheel non-interference; ten rapid repeated steps; no duplicated existing steppers; implicit labels isolated from companion controls; cache namespace isolation; archived deep-link normalization.

Browser checks use the Codex in-app browser at desktop 1280px, tablet 768px, phone 390px and narrow 320px widths. Reviewed distinct public families and active tool screens. Actual interactions include Aero Lab keyboard/drag angle updates with simulation output; PilotSolve keypad entry and keyboard/+ rotary adjustments producing a crosswind result; CertPath gated plan navigation directing to missing experience; certificate selection and disabled later stages; dock collapse/re-expansion; menu Escape/focus return; Day/Dark/System and Solid. Solid was verified with computed backdrop-filter `none` after correcting a cascade conflict. Responsive review caught/fixed duplicate FlightRisk steppers, missing PilotSolve Menu, a stale fourth dock column, narrow angle-field crowding, FOI's old competing dock rules, and overly thick range tracks.

Evidence boundary: browser viewport review is not physical-device, VoiceOver/Switch Control, or native iOS keyboard certification. The available browser does not expose media emulation or native zoom control: the 200% keyboard zoom attempt did not change its scale. Reduced-motion/transparency/contrast fallbacks are source/regression inspected, not represented as physical OS-setting tests. Offline behavior is worker-level tested with cached resources; a physical airplane-mode upgrade was not performed. No claim is made that every possible form state on all 523 routes was individually rendered.

Post-publication deployment and live hashes are saved outside the released source in `../tactile-release-verification-20260924.json`.

Final narrow collapse measurement: at a 320px viewport, the collapsed site dock measured exactly 48px; all four visible destination/menu targets measured 44px high and at least 62px wide. A final cascade rule ensures the collapsed state wins over expanded phone breakpoints.
