# Compact liquid dock

Selected concept 2: a compact continuous glass pill, active-destination underline,
and centered 56px Menu circle. Existing buttons gather into that circle as the
shell contracts; the Menu icon remains visible throughout. Expanded content clearance stays constant, and desktop remains expanded.
The shell and buttons close over 1050ms and open over 1150ms with symmetric
easing. Buttons translate and scale throughout; only their labels recede near
the end of closing. The scroll thresholds stay the same.

## Scope and compatibility

- Shared `.nav.liquid-dock` navigation through 1024 CSS pixels; existing app-specific
  destination controls and menu handlers retain their nodes and events.
- 300px mobile / 440px tablet, expanding to 520px at 981–1024px for Fly with Diego.
- Collapse after 48px downward travel beyond the first 80px; expand after 16px upward.
- Pointer press, keyboard-visible focus, and an open menu suspend collapse.
- The collapsed Menu key is the sole focusable dock control. The first tap
  expands the dock; the next Menu tap opens the existing dialog. Keyboard
  activation restores focus to the current destination.
- Reduced motion, reader motion settings, solid surfaces, Day/Dark/System supported.
- Native fallback navigation remains available without JavaScript or dialog support.
- Existing tactile controller already excludes liquid-dock; no second scroll owner.

## Preservation and coverage

`compact-dock-coverage.json` records all updated HTML source paths, baseline,
asset hashes, and the comparison result. HTML changes are exclusively cache-version
queries for the two shared assets; all other bytes—including text, destinations,
metadata, tracking identifiers, tables, and citations—are unchanged. Authoring
templates receive the same versions. Offline cache manifests are refreshed.

## Verification

- 18 Python tests; 58 Node site, navigation, appearance, tactile, offline and search tests.
- Site route audit: 526 HTML documents, zero broken references or JSON-LD failures.
- Chromium and WebKit: eleven browser scenario groups pass in each engine.
- Real-browser runner: `scripts/tests/compact-dock-browser.cjs`.
- Viewports: 320, 390, 600, 768, 834, 1024; 1024x768 landscape; 1440 desktop.
- Scenarios: thresholds, rapid reversal, press/focus locks, inert/tab order, tap and
  keyboard reopening, menu Escape, appearance persistence, solid surfaces, motion
  preferences, browser Back, doubled root text size, viewport contraction, no-JS.
- Representative routes: Home, Learn, Blog, Tools, technical Learn article, long Blog
  article, Simply Endorsed guide. PNGs/results in `output/compact-dock*`.
- Independent GPT-6 Luna reviews covered keyboard/touch behavior and release/cache
  integrity. No blocking findings remained after final cache refresh.

Physical iOS/Android keyboards, VoiceOver, and hardware safe-area behavior are not
claimed as tested. WebKit and touch/viewport emulation provide local engine coverage.
The optional legacy avionics auditor requires an external acceptance-inventory.json
not present in this isolated checkout; focused navigation tests and site audit ran.

Chromium's native cross-document view transition can report `AbortError: Transition
was skipped` on browser Back. This was reproduced on the unchanged pre-dock release
83ea4ba. The browser runner records these known navigation cancellations separately
and continues to fail on other uncaught errors.
