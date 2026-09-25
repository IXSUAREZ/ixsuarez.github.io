# Compact liquid dock — motion refinement

Updated September 25, 2026 from upstream `75b99da6f7790f77b910f8f272a8d3db0bf81bdd`.
Local branch: `improve/dock-motion-20260925`. This work is a local preview, not a production release.

## Behavior and ownership

`assets/site-nav.js` owns `.nav.liquid-dock`; the tactile controller retains its
existing exclusion/lock for that dock. `assets/avionics.css` owns its motion and
Polished Aurum materials. No destination nodes, URLs, navigation handlers, data
formats, saved preferences, calculations, or app-owned docks were replaced.

- Expanded widths stay 300px on phones, 440px on tablets, 520px at 981–1024px.
  The minimized Menu circle remains 56px. Desktop stays expanded.
- Collapse: 240ms. Expand: 200ms. Both use `cubic-bezier(.2,0,0,1)` with no bounce.
  Native CSS transitions reverse from their current presentation.
- Destinations move inward 12px, scale only to 94%, and fade over 120ms; they no
  longer shrink to dots. Labels keep their layout rather than animating height.
- An aria-hidden copy of the existing Menu SVG translates independently of its
  button's hit-area scaling. The original SVG stays in layout; the visible glyph
  remains 21px throughout. Desktop uses the original glyph.
- The shell keeps one fixed-strength glass surface. A decorative gold layer
  fades in/out; blur strength is not animated.
- Collapse after 48px downward travel beyond the first 80px; expand after 16px
  upward or near the top. Clamp scroll positions at both document boundaries.
- A real pointer press pauses current dock transitions through the click event;
  release/cancel resumes them. Keyboard focus, an open Menu, and detected keyboard
  input keep navigation expanded. Only the document's scroll drives compaction.
- Actual transition completion/cancellation releases the contracting shell's hit
  testing to the real Menu button; there is no duplicated duration timer.
- Height-only viewport changes preserve state and accumulated scroll intent.
  Width changes remeasure and expand. Keyboard viewport changes retain the active
  field, navigation access, and the site's existing safe-area/viewport clearance.
- Collapsed destinations are inert and hidden from accessibility navigation.
  First activation expands; subsequent Menu activation opens the existing dialog.
  Keyboard restoration, Escape, expanded content clearance, and 44px minimum
  visible target sizes remain. Reduced motion/reader motion-off is immediate;
  Solid, reduced transparency, high contrast, and no-JavaScript fallback remain.

## Apple source → decision → evidence

Apple guidance was reviewed live September 25, 2026; the HIG freshness check found
no changes from the skill's current baseline. Applicability is limited to this
navigation transition: foundations (motion, materials, layout, accessibility),
components (navigation), input (touch, pointer, keyboard), and interruption patterns.
New branding, content design, app icons, spatial experiences, privacy flows, and
system integrations are outside this refinement.

| Source | Decision | Evidence |
| --- | --- | --- |
| [Motion: feedback](https://developer.apple.com/design/human-interface-guidelines/motion#Providing-feedback) | Brief, interruptible motion; 240/200ms are our web choices, not Apple-specified timings. | Browser timing samples, reversal and pointer interruption scenarios, before/after recordings. |
| [Tab bars: iOS](https://developer.apple.com/design/human-interface-guidelines/tab-bars#iOS) | Retain navigation context and an explicit way to restore it. The circle/two-tap design is a selected web adaptation, not the native accessory example. | Rendered Apple example reviewed during planning; real Menu, keyboard, inert-state, and route tests. |
| [Materials](https://developer.apple.com/design/human-interface-guidelines/materials) | Glass remains on navigation; preserve legibility and opaque alternatives. CSS blur is an approximation of native material. | Day/Night, Solid, and reduced-effects checks; the page content is unchanged. |
| [Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) | Preserve keyboard access, visible target sizes, meaningful labels, and a motion-off path. | Keyboard/focus, viewport, enlarged-text, reduced-motion and fallback scenarios. Native point sizes are not claimed as CSS standards. |

## Verification and reproducibility

Final results: 14 scenario groups and 40 Day/Night layout combinations verified
in each engine; 43 shared Node tests, 6 offline/cache tests, and 30 Python tests
pass. All 523 registered routes and 6 supporting documents use current assets;
sync reports zero stale HTML. The 526-document route audit has zero broken
references or JSON-LD failures. All 545 changed HTML files contain only dock
asset-version URL updates; homepage sky and footer source bytes are unchanged.


The existing runner `scripts/tests/compact-dock-browser.cjs` now checks brief
motion, continuous reversals, constant glyph size, paused hit areas, scroll
thresholds, height-only resizing, synthetic keyboard viewports, rapid Menu
activation, focus/inert state, rotation, root text enlargement, browser Back,
reader preferences, no-JS, and a Day/Night route matrix. Screenshots and JSON live
in `output/playwright/dock-motion/<engine>/tests/`. `DOCK_GROUP=core` runs only the
interaction groups; `DOCK_GROUP=matrix` runs the independent layout cases in fresh
pages and saves them under `tests-matrix/`. This isolates layout checks from
Chromium locator timeouts observed after long repeated-navigation runs; navigation
and browser-Back behavior remain separately tested. The shared Playwright browser
cache disappeared during verification. Final Chromium runs use the task-local
runtime via `PLAYWRIGHT_BROWSERS_PATH=output/playwright/browser-runtime`;
WebKit results were captured before that shared-cache removal. Chromium uses
`--use-angle=metal` on macOS, following the supported [ANGLE backend option](https://chromium.googlesource.com/angle/angle/+/HEAD/doc/DebuggingTips.md).
The default headless graphics path stalled on desktop Home captures; the native
Metal renderer successfully captures the unchanged animated sky. No production
code or sky effects were disabled to accommodate the test environment.

The matrix covers Home, the TAF Learn article, a long Blog article, and Tools at
320, 390, 768, 1024, and 1440 CSS pixels in Day and Night, expanded and scrolled.
The basic geometry pass additionally checks 600 and 834px. WebKit completed all
14 groups and 40 layout cases; its motion samples settled within 0.5px at 211ms
closing and 233ms opening.

This isolated checkout reuses the installed test dependencies through
`NODE_PATH=/Users/diegosuarez/Projects/suarez-aurum-release-20260925/node_modules`
for Node commands.

`node scripts/tests/dock-motion-profile.cjs` records video and per-frame geometry.
Set `DOCK_ENGINE=webkit` for WebKit, `DOCK_URL` for another server, and
`DOCK_LABEL=before` for baseline evidence. Profile data and recordings are in
`output/playwright/dock-motion/<engine>/<label>/`. The default local URL is
`http://127.0.0.1:8970`; the baseline is served separately on port 8971.

Chromium's recorded baseline reached within 0.5px of the final shell width at
1049.7ms closing / 1132.0ms opening. The new recording reached the same tolerance
at 205.0ms / 215.4ms. The CSS durations remain 240ms / 200ms; requestAnimationFrame
scheduling and the 0.5px tolerance explain measurement differences. New-run 95th
percentile frame intervals were 16.7ms / 16.8ms. These are one local engine run,
not a device-wide performance guarantee.

The before/after comparison is `output/playwright/dock-motion/index.html`.
Final test results and asset-preservation checks are summarized in
`dock-motion-verification.json` alongside this document.

## Evidence boundaries

WebKit/Chromium engine tests and synthetic viewport changes do not establish
physical iOS/Android keyboard, toolbar, safe-area, or VoiceOver behavior. Root
text enlargement is distinct from native browser zoom. These hardware and
assistive-technology checks remain unverified. All-site material migration gates
remain separate from this dock refinement. Production was not deployed.

The browser runner retains the baseline handling for known Chromium cross-document
view-transition cancellation messages and fails on other uncaught errors.
