# Sitewide theme and Apple-guided visual review — September 27, 2026

## Direction and scope

Carry the homepage's gray, gold, and bounded-glass language through every
public page and app while preserving the animated sky, bottom dock, article
content, app workflows, and meaningful category/risk/diagram colors. This is
an Apple-inspired website, so browser navigation, responsive layout, semantic
HTML, and web accessibility remain the platform contract. CSS glass is a web
adaptation, not Apple's native Liquid Glass implementation.

The current deployable source is a fresh worktree from `origin/main` at
`bb2069a7`. The earlier external-drive checkout was behind and modified; no
changes were made to it. The route manifest has 523 registered pages and 18
stylesheet/inline-style families. Six supporting documents and four installable
app manifests are also covered by the theme audit.

## Source → decision → evidence

| Area | Apple guidance consulted September 27, 2026 | Site decision and implementation | Evidence/status |
| --- | --- | --- | --- |
| Shared materials | [Materials](https://developer.apple.com/design/human-interface-guidelines/materials), Liquid Glass and standard materials | Keep glass on navigation and temporary controls; use opaque gray reading and result surfaces. Existing `assets/avionics.css` and app adapters preserve product colors. | Verified in 18 representative page families at phone and desktop sizes, in both Day and Night combinations. |
| Color and appearance | [Color](https://developer.apple.com/design/human-interface-guidelines/color), [Dark Mode](https://developer.apple.com/design/human-interface-guidelines/dark-mode) | Continue System default with explicit Day/Night as a product choice. `assets/appearance.js` and final `assets/avionics.css` remain the shared authority. | All 523 routes passed a rendered Night check at 390px: expected body gray, loaded CSS, no page overflow or script errors. Structural audit passed 523/523, supporting documents 6/6, manifests 4/4. |
| Readability and motion | [Motion](https://developer.apple.com/design/human-interface-guidelines/motion), [Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility), [Typography](https://developer.apple.com/design/human-interface-guidelines/typography) | `assets/journal.css` now uses a 4px, 180–200ms entrance shift without opacity loss for Blog and Learn content. The previous animation made text start at 30% opacity for 480–550ms. Existing reduced-motion handling remains. | Before/after phone captures in `output/playwright/theme-sweep/`; the entering guide card computed opacity 1 while animation was active. Reader browser suite passed 20/20, including reduced motion, text enlargement, focus, links, and no-result states. |
| Navigation and actions | [Layout](https://developer.apple.com/design/human-interface-guidelines/layout), [Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons), [Focus and selection](https://developer.apple.com/design/human-interface-guidelines/focus-and-selection) | Preserve the selected gold dock/action, gray secondary actions, visible focus, browser links, and tool-owned contextual navigation. | Representative screenshots show the same hierarchy across the 18 families; the 523-route sweep found zero document-width overflow at 390px. |

The 18 foundation topics were screened as follows. Applicable to this web
review: accessibility, branding, color, Dark Mode, icons, images, inclusion,
layout, materials, motion, privacy, typography, and writing. App icons and SF
Symbols are existing assets rather than production work in this change. Right
to left remains unresolved for translated content; current published pages are
English. Immersive experiences and spatial layout do not apply to the 2D site.
The six HIG categories were also screened: getting started and design
principles shaped hierarchy; foundations informed color, type, materials, and
motion; patterns informed loading/search/feedback; components informed
buttons/navigation/reading surfaces; inputs informed touch, keyboard, focus,
and pointer behavior; technologies added no new integration requirement for
this visual-material change. Existing saved-data and disclosure behavior was
left intact. The skill's live 173-topic source refresh reported no changed,
added, or removed topics against its September 23 index.

## Review method and boundary

- Visually inspected the first viewport of all 18 distinct page families at
  390×844 and 1200×800 in crossed Day/Night combinations. Rechecked the
  actual settled FlightRisk screen because its first frame is a loading state.
- A separate 390px pass with a 32px root font found no document-width overflow
  in any of the 18 representative families. This is a text-enlargement probe,
  not native browser or OS zoom evidence.
- Opened every registered route at 390×844 in Night and measured resolved
  appearance, loaded shared CSS, document width, and uncaught script errors:
  523/523 passed. This is a rendered integration sweep, not a claim that a
  person inspected every paragraph or interaction on all 523 pages.
- After the editorial change, synchronized 503 HTML/template references to
  the stylesheet's new byte-bound URL. `sync-avionics.py --check` found zero
  stale HTML. The canonical contrast audit passed 109/109 pairs (minimum
  tested text ratio 4.54:1). Thirty Python tests passed. The reader browser
  suite passed 20/20, and 69 shared Node tests passed using existing local
  dependencies. `git diff --check` passed.

This review does not establish physical touch/VoiceOver behavior, every
tool's deep workflow, or every paragraph's rendered contrast.

## Publication — September 28, 2026

- Committed the theme correction and 503 synchronized stylesheet references as
  `c53637a60e3e5fa78820b2ca695f6954fa427159`, then pushed to `main`.
- GitHub Pages reported that exact commit built successfully at
  `2026-09-28T14:20:24Z` for [suarezcfi.com](https://suarezcfi.com/).
- Compared cache-busted live bytes against the committed local files for the
  shared `assets/journal.css`, homepage, Learn index, Blog index, Simply
  Endorsed Blog, PilotSolve, and FlightRisk: all seven returned HTTP 200 and
  matched their local SHA-256 digests.
- Opened the live Learn, Blog, and PilotSolve routes at 390×844 in Night mode.
  Each resolved the dark appearance and expected gray background, fit the
  viewport, and produced no uncaught page errors. The visible Learn card
  computed opacity was 1. Live captures are in `output/playwright/theme-live/`.

## Angular slider follow-up — September 28, 2026

A user reported that the added circular drag control looked clipped and gave
no clear indication of its purpose. Crank & Core and Aero Lab already include
labeled horizontal range controls with live degree readouts, so the shared
`tactile.js` enhancement no longer adds a second rotary slider. This follows
Apple's [slider guidance](https://developer.apple.com/design/human-interface-guidelines/sliders)
for a finite range and visible feedback; numeric steppers remain available
where the source control is a number input. The custom rotary styling was
removed from `avionics.css`.

Local browser checks covered Crank & Core at 1200px Day and 390px Night and
Aero Lab at 1200px Night. Each angular control had one slider and no rotary
dial. ArrowRight advanced Crank angle from 361° to 362° and Aero Lab angle of
attack from 4.0° to 4.5°; both displayed values updated. Crank & Core fit the
390px viewport without document-width overflow. The shared tactile tests
passed 7/7, asset synchronization found zero stale HTML sources, the route
audit passed 523/523, the material contrast audit passed 109/109, and the
site audit found zero broken references.
