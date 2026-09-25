# DESIGN.md — suarezcfi.com design constitution

Engineer-facing contract for every page and app on this site. If a change
violates this file, the change is wrong — update the constitution deliberately,
never by drift.

## Shared liquid dock motion — September 25, 2026

For `.nav.liquid-dock`, this refinement supersedes the older compact-dock motion
and icon-row descriptions below. Polished Aurum remains the material authority.
Phones/tablets through 1024 CSS pixels keep the existing expanded pill and centered
56px Menu circle; desktop stays expanded. Collapse takes 240ms; expansion 200ms,
with `cubic-bezier(.2,0,0,1)` and continuous interruption/reversal. Destinations fade
with a 12px inward movement; the Menu glyph stays 21px throughout. A decorative
opacity layer blends glass into gold. These timings and the circle are web product
choices, not Apple-prescribed native behavior.

Retain 48px down / 16px up thresholds beyond the first 80px, expanded content
clearance, 44px minimum usable targets, keyboard/menu/press locks, and accessible
first-tap expansion. Browser toolbar height changes preserve state and accumulated
scroll travel; width changes remeasure and expand. Reduced motion is immediate.
`assets/site-nav.js` is the sole shared-dock scroll owner. App-owned docks retain
their existing behavior. See `docs/navigation/compact-dock.md` for verification.

## Compact tactile interaction system — September 24, 2026

The user-approved glass-and-metal refinement supersedes earlier dock dimensions,
always-visible labels, 5–6px control corners, and the exemption for app interiors.
`assets/tactile.js` owns adaptive dock state and progressive native input companions;
`assets/avionics.css` owns materials, feedback, and accessible fallbacks. Independent
React apps retain native state and handlers and expose thin adapter attributes.

- Dock: one glass enclosure, desktop maximum 600px and minimum 60px expanded,
  phone 56px, collapsed 48px. Labels can grow the expanded row. All targets remain
  at least 44 CSS pixels. The 44px standard is our web product choice.
- Begin expanded; collapse after 48px down beyond the first 80px; expand after
  16px up, near the top, hover, or keyboard focus. Menu/focus lock it open; pointer
  press freezes geometry. Only the main scrolling region counts. Keep bottom
  clearance at its expanded size. Safe areas and visual viewport remain supported.
- Collapsed icons retain accessible names and direct actions. Preserve each tool's
  contextual steps, prerequisites, selected state, browser history, and one dock
  owner in Crank & Core. Fly with Diego remains in Menu on mobile.
- Satin controls show immediate 2px press depth and a brief release; activation
  is never delayed. Focus, selection, busy, and disabled states stay distinct.
  Risk meaning is authoritative; no generic selection accent overrides it.
- Angular values offer keyboard arrows, dragging, exact number entry, and +/−.
  Preserve original bounds, precision, handlers, data formats, and non-wrapping
  behavior. Wheel scrolling never rotates dials. Linear settings retain ranges.
- Dark/Day/System and Solid remain. Glass is reserved for navigation/overlays;
  reading/results stay matte. Reduced motion removes travel, and reduced
  transparency/no blur/increased contrast receive opaque navigation.
- Mechanical metal and the scroll thresholds are SUAREZ.CFI design choices;
  CSS blur is a web adaptation, not Apple's native Liquid Glass API. No haptics.
- Homepage sky, engine bundles/models, calculations, saved records, export
  geometry, Aero Lab desktop requirement, and archived Flight Instruments remain.

See [the source-linked applicability and verification record](docs/tactile/design-verification.md)
and [route coverage](docs/tactile/coverage.json) for the release evidence boundary.

## Homepage and shared shell refinement — September 24, 2026

This user-approved refinement extends the Avionics contract below. The homepage
opens with its existing animated sky, with `CFI Diego Suarez`, location, promise,
and actions centered in the upper sky. The primary action books a discovery
flight; the secondary action helps visitors find their path. The first section
after the sky offers three student choices: new to flying, already training,
and looking for a pilot tool. Instruction options are a compact list. The About
section shows a short introduction and credentials, with the full story in a
native disclosure. The Hangar features CertPath, FlightRisk, and PilotSolve,
then links to the full Tools directory. FAQ precedes a single contact card;
the email-draft form lives in a disclosure.

The shared site shell uses a platform system sans stack for UI and main copy;
the editorial serif is reserved for occasional story or quotation text. Dark
uses deep blue graphite and neutral text, with restrained sky blue and aviation
amber accents. Day and System remain supported through the existing appearance
controller, storage keys, and Menu control. Content surfaces are solid; dock
and menu may use bounded translucency. Keep the compact bottom navigation and
all semantic status colors. Standalone app interiors retain their interfaces.
The homepage content reorganization here supersedes earlier preservation and
seven-tool Hangar instructions; the animated sky implementation stays intact.

## Active design contract — Avionics, September 22, 2026

This user-approved contract supersedes historical styling and navigation below.

- Dark is the new-visitor default; Day and System are equal supported appearances.
  `assets/appearance.js` runs synchronously in the head. `suarez:appearance` stores
  `dark | light | system`; existing valid global preference wins over a valid
  `pilotsolve:app.settings.theme`. No other saved data is rewritten. Solid controls
  use `suarez:solid-controls`; reduced transparency also forces opaque controls.
- `assets/avionics.css` is the FINAL cascade after all page styles, including
  premium.css and site-discovery.css. Semantic --av-* colors drive matte content,
  tactile 5–6px control corners, shallow highlights and bounded glass overlays.
  Existing category and risk colors retain their meanings. Day uses darker accents.
- One bottom navigation panel. Desktop 64px / max860; tablet64px / max640;
  phone56px control row with12px side margins. Safe area adds space. These are
  minimum targets: text growth can expand controls. All targets >=44 CSS px.
- Site: Home, Training, Learn, Blog, Tools, Fly with Diego, Menu. At <=980px,
  Home, Learn, Tools, Menu. All destinations remain in the menu. Tool adapters
  preserve native section/wizard semantics and prerequisite/reset handlers.
- Focus is immediate and distinct from selection; selected destinations use
  aria-current=page, ordered wizard stages use aria-current=step. Commands never
  receive a current-page state. Menu supports Escape/outside dismissal and focus return.
- Dock persists while scrolling and during ordinary input. The visual viewport
  provides keyboard clearance; self-contained modal editors may cover navigation.
- Glass belongs only on dock, menus and temporary overlays; article/form/result
  surfaces are matte. Reduced motion removes new UI transitions. No magnification,
  decorative loops or counting animation through intermediate calculated results.
- Site menu contains every top-level destination, grouped as Explore and Connect;
  appearance stays in its own control group. Shared controls give immediate pressed
  feedback. Same-origin page navigation uses a brief crossfade where supported,
  while ordinary links, browser history and reduced-motion navigation stay native.
- Keep the existing system-font fallbacks. Dock icons are licensed Lucide paths
  (`assets/avionics-icons-LICENSE.txt`) and always have visible text labels.
- THE HOMEPAGE SKY IS PROTECTED: premium-home.js, premium-home.css, all sky assets,
  shader, timing, solar behavior, fallback, layers and hero bounds remain unchanged.
  Theme preference affects surrounding interface, not the sky renderer.
- Preserve all content, routes, calculations, source links, saved formats, backend
  APIs and certificate/export geometry. Aero Lab retains its desktop/pointer gate.
  Crank & Core parent owns collection navigation; child owns exploration toolbar.
- Generate shared HTML using sync-chrome.py; sync-avionics.py injects first-paint
  appearance and final stylesheet order into pages and future templates. Compiled
  tools must be edited/rebuilt from the isolated authoring sources, not their bundles.
- Acceptance evidence and limitations are in docs/avionics and design-qa.md.
  Public deployment is a separate authorized release; this branch is a local preview.

## Historical design contract — Graphite Horizon, September 7, 2026

The user selected option 1 and authorized the redesign across every page and
app. This section supersedes the older color, type, geometry, navigation, and
motion rules below. Those sections remain as historical implementation notes.

- `assets/premium.css` is the final shared cascade after each page/app stylesheet.
  Warm grey (#e9e7e1), graphite (#242725), champagne gold (#bba16a), warm paper,
  SF Pro and Iowan Old Style typography, fine borders, and restrained inset highlights form the system.
- Typography contract: the site pairs Apple San Francisco / SF Pro with Iowan Old Style:
  - **Primary UI / numbers / headings**: SF Pro stack (`-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif;` via `--font-sans`, `--font-display`, and `--display`). Provides high-legibility precision, machined cockpit feel across all headings (`h1`–`h6`), numerals, buttons, and navigation wordmarks.
  - **Hero supporting text / editorial serif**: Iowan Old Style stack (`"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif;` via `--font-editorial` and `--font-serif`). Used on `.horizon-lede`, `.hero-tagline`, `.hero-supporting`, `.hero-lede`, `.post-header .lede`, `.article-header .lede`, `.page-hero p`, and `.service-hero p` for an authoritative, luxury editorial finish.
- Use the tracked SUAREZ.CFI wordmark and the shared dark header. Public navigation
  is Training, Learn, Journal, Tools, About, and Fly with Diego. App headers keep
  their tool identity and working app controls. FOI uses the same finish in a
  focused dark study shell.
- Primary actions are tactile gold; secondary actions are silver/paper. Use 5–8px
  control corners and 10–12px panels, with readable labels and visible focus.
- Simply Endorsed category assignments and Part 61 category/step meanings remain
  owned by their existing modules. Do not replace semantic colors with brand gold.
  FlightRisk low/moderate/high colors also remain unchanged. Certificate editing
  uses the shared gold finish while preserving certificate artwork/export geometry.
- The home hero has an original photographic sky asset and slow, transform-only
  movement. Its native, keyboard-operable Sky motion switch persists the choice;
  movement pauses offscreen and in hidden tabs and defaults off for reduced motion.
  No audio. Text and navigation stay stationary.
- Reusable templates are in `templates/`; the existing blog generator continues
  to use `blog/_template/index.html`. Run `scripts/apply-premium-theme.py` after
  changing the shared stylesheet or generating a page to update asset versions.
- Keep all existing content, tool calculations, saved-progress formats, sources,
  export dimensions, and app IDs intact. Certificate Generator stays internal and
  is not linked from public chrome. The template examples are not public routes.
- Shared navigation/footer remain static HTML from `assets/partials/`; run
  `scripts/sync-chrome.py --check`. Use `scripts/build-flightrisk.py` to rebuild
  the React app into the static site without touching other app source or assets.

## Crank & Core identity — September 13, 2026

The selected identity is the circular opposed-piston mark, in copper `#A65F46`,
warm ivory `#F4EEE5`, and charcoal `#292D27`. Copper is the Engine Explorer
brand accent for its icon, sharing preview, collection action, and engine selection.
Keep model parts, instructional overlays, and semantic state colors unchanged.
The homepage Hangar presents the existing six public tools equally in a 3/2/1-column
responsive grid, with all tools available through normal vertical scrolling.

## Historical design contract (superseded where noted above)

## 1. Hierarchy: one primary per viewport

Each viewport has exactly ONE primary action (`.btn--primary`). Everything
else is secondary (`.btn--secondary`) or quiet (`.btn--tertiary` / text
links). If a screen seems to need two primaries, the page structure is wrong —
re-split the content instead of stacking competing CTAs. The nav CTA and the
in-content primary may share a viewport when they are the SAME action —
repetition of one command is not competition.

## 2. Buttons: `.btn` in three weights

- `.btn--primary` — "lacquer": two-stop 180° wash `--yellow-bright → --yellow`,
  1px inset top highlight, `--shadow-sm`; NO halo, NO inverted variant.
- `.btn--secondary` — paper-press pill.
- `.btn--tertiary` — text-and-arrow (44px hit area, arrow travels 3px); for
  wayfinding that must not compete.

All weights share one geometry: min-height 52px, padding 0 28px, `--r-pill`.
Hover is a state change (color/border/shadow, 150–200ms) — surfaces never
lift. Press yields: 2px `translateY` travel on pills (90ms in, ~220ms release);
on lacquer primaries the resting `--shadow-sm` crossfades into a collapsed
contact shadow carried by `::before`. `scale(0.97)` survives ONLY on small
square icon keys (the conversion-bar call key).

No fourth weight. Radius and motion come from the shared tokens
(`--r-pill: 999px`, `--ease-premium`). App-internal controls that are used
repeatedly (wizard steps, filters, chips) use `--r-tool: 16px` instead of the
pill radius — pills are for decisions, not for tools you press fifty times.

## 3. Color ownership: yellow = shared chrome, accent = in-app

- **Yellow** (`--yellow-*`) belongs to the shared site chrome and Diego's
  wayfinding: nav CTA, hover states, focus outlines, route/journey accents.
  Apps do not repaint the shared chrome with their accent.
- **Tool accent** (`--tool-accent` family) lives INSIDE the app surface only:
  app controls, tool mark glow, in-app selection/focus. The pill nav keeps its
  yellow + navy on tool pages; the accent survives on in-app controls and the
  tool icon.
- Palette, icons, and fonts are locked. No new hex values; extend meaning
  through tokens, not literals.

### Accent registry (`theme-*`)

The single sanctioned way to give an app an accent is a `body.theme-*` class
that maps the `--tool-*` tokens. Registry:

| Class          | Assignment                                   | Status    |
| -------------- | -------------------------------------------- | --------- |
| `theme-blue`   | Simply Endorsed CFI (+ Certificate Generator)| live      |
| `theme-orange` | CertPath                           | live      |
| `theme-teal`   | reserved (next tool)                         | reserved  |
| `theme-night`  | reserved (dark app surfaces)                 | reserved  |

Never invent a per-page accent outside this registry. Claim a reserved slot
and define it next to the others: shared `theme-blue` lives in
`assets/tool-system/tool-core.css`, app-exclusive themes (e.g. `theme-orange`)
live in that app's module under `assets/tool-system/`.

### Tool stylesheets (`assets/tool-system/`)

Tool pages retain a shared core and app modules. The current Simply Endorsed
workspace also loads `simply-endorsed/js/workspace.css`; shared Aurum materials
in `assets/avionics.css` have final authority:

- `tool-core.css` — compatibility tokens, base, shared chrome (`nav--tool`, footer),
  workbench shell, and components used by ≥2 apps. The unused pre-workspace
  `.topbar-*` header rules are archived outside the site.
- `simply-endorsed.css` — small compatibility rules for the current footer guidance link and hidden legacy header; the active endorsement workspace is styled by `simply-endorsed/js/workspace.css` and shared Aurum materials.
- `part61.css` — wizard steps, step rail, results pane, `theme-orange`.
- `certgen.css` — Certificate Generator exclusives (internal tool).

No app module may style another app's namespaced classes, and no app module
is loaded by another app's page.

## 4. Nav contexts and the entry–exit ritual

Three nav contexts, chosen by how the visitor arrives:

1. **Site pill** (`.nav` inside `.nav-wrap`) — the canonical liquid-glass pill
   with wordmark (Home is the wordmark — no Home link), Learn, Blog, Tools
   dropdown, Contact, and the CTA. The nav CTA is 'Book a Discovery Flight' →
   `/discovery-flight-louisville-ky/` on every page; on the discovery-flight
   page alone the per-page `.nav-cta` slot swaps to 'Call 502-510-0508'
   (`tel:`). Every publishable page arrives on the full pill.
   Compress-on-scroll (`.nav--compact` via `assets/site-nav.js`) is the only
   permitted mutation.
2. **Tool nav** (`.nav nav--tool`) — for repeatedly-used tools
   (`simply-endorsed-cfi/`, `part-61-calculator/`, `certificate-generator/`).
   Adds a brand cluster at the leading edge: quiet `.link-back`
   ("← SuarezCFI.com"), wordmark, divider, tool mark (logo + name). The full
   site link set (including the Tools dropdown) stays; app-specific controls
   may append inside `.nav-links`/`.nav-tools`. The `.link-back` is the exit
   ritual: in-app it is the always-visible quiet way home.
3. **Immersive chip** (`.chipnav` in `foi-cards/`) — for focused, deck-style
   study apps. Compact dark chip with back-link, wordmark, and minimal
   actions; no site footer. Use only when the app IS the destination.

Certificate Generator is internal: never link it from nav, footer, or
marketing pages.

## 5. Shared chrome is build-time synced, never JS-injected

Nav and footer markup MUST remain server-rendered static HTML in every page
(crawlable, works without JS). The single source of truth is the partials:

- `assets/partials/nav.html` — site pill nav
- `assets/partials/nav-tool.html` — tool nav variant
- `assets/partials/footer.html` — canonical footer

Every synced page carries marker comments around the whole element:
`<!-- site-nav -->` … `<!-- /site-nav -->`, `<!-- site-footer -->` …
`<!-- /site-footer -->`. `scripts/sync-chrome.py` regenerates everything
between markers from the partials, preserving only the sanctioned per-page
slots: the trailing `.nav-cta` (contextual CTA), the `aria-current="page"`
placement, and on tool pages the tool mark, app-specific nav controls,
`class="site-footer"`, and tool-specific footer lines.

Workflow:

- Edit a partial, then run `python3 scripts/sync-chrome.py --apply`.
- Run `python3 scripts/sync-chrome.py --check` before every commit — it must
  exit 0. It also fails on pages that have chrome but no markers.

Sync skips, deliberately:

- `flight-risk-assessment/` — compiled React SPA; its chrome is baked in by
  its own build and would be overwritten (or corrupted) by syncing.
- `foi-cards/` — immersive chip variant by design (see §4), no site footer.

## 6. Motion contract

Motion is a whitelist. Everything that moves on this site is one of:

1. **Boot** — the hero's load choreography, once, ≤700ms, pure CSS (kicker
   dash, masked headline rises, tagline/lede rise, the Crown settles, the
   hero photo fades in).
2. **Reveals** — once per element: opacity + 16px rise over 250ms,
   transform+opacity together, stagger ≤60ms, ≤5 items per group
   (`reveal-arm`/`reveal-in`, one IntersectionObserver).
3. **Ledger stamp** — the credential rows stamp in once (scale 1.12→1,
   −3.5°→0°, 240ms, 70ms stagger).
4. **The journey slider** — radio-driven, draggable (transform-only), glide
   450ms with ≤10° banking, detent squash-and-rebound.
5. **Form/focus states** — hovers, presses, focus rings, details open/close.

Nothing loops. Nothing tracks scrollY. Press = 2px travel on pills,
scale(0.97) on small icon keys only.

- Hover: state change only (color, border, shadow, icon lean ≤2px) over
  150–200ms. Nothing levitates — `translateY` on hover is banned domain-wide.
- The journey slider plane may be dragged (pointer capture, transform-only,
  snaps to the nearest detent); it is the one input-driven decorative motion
  on the home page.
- `prefers-reduced-motion: reduce` disables animation/transition globally and
  forces revealed content visible. This is non-negotiable.

## 7. Dark as a mode, via tokens

There is no global dark theme. Dark is an app-level mode: an app surface that
is intrinsically dark (FOI Cards) re-declares the SAME token names
(`--bg`, `--surface`, `--ink`, `--ink-muted`, …) with dark values, scoped to
its own stylesheet/root. Components read tokens, so the mode change is a
token swap — never a forked component set, never page-level hex overrides.

## 8. Radii

- `--r-pill: 999px` — nav, buttons, chips: decision elements.
- `--r-tool: 16px` — repeated-use app controls.
- Cards/panels use the shared card radius already in `design-system.css`.
  One radius scale; no per-page inventions.

## 9. Credentials: the ledger, never cards

Credentials, ratings, and certifications render as `.credential-ledger` — the
logbook pattern: one letterhead line naming the issuing authority (stated
once, like letterhead) and ruled rows (`border-top: 1px solid
var(--border)`) of name + reference fine print (`font-feature-settings:
"tnum"`). No seals, no glass cards, no per-row stamps, no hover lift — a
ledger is read, not pressed; the citations carry the credibility. This is
the only way credentials render anywhere on the domain; it scales to N rows
with zero layout debt. Anything that is not a control must not wear control
chrome (glass, shadow, stamp).


## 10. Materials: Air / Glass / Paper

Three materials, each with one job:

- **Air** — the page base (`--bg`, ambience, grain). All content rests on it.
- **Glass** — floating chrome ONLY: nav pill, dropdown panel, mobile sheets and
  conversion bar. Nothing in document flow wears glass (no glass eyebrows,
  kickers, pills, FAQ rows, or form cards).
- **Paper** — in-flow surfaces (`--paper-bg`, 1px `--border` hairline,
  `--shadow-sm`, `--paper-radius: 20px`). Two finishes of one sheet:
  `paper` (read: ledgers, FAQ sheets, bio, form sheet — zero interaction)
  and `paper--press` (pressable cards: hover warms border to `--yellow-line`
  and steps shadow to `--shadow-md`; never lifts, never glass).

Yellow appears as ONE field per page maximum (e.g. the contact mat), and no
control may sit directly on a yellow field — controls live on the inset paper
sheet. Small machined yellow doses (primary button, focus rings, seals, open
FAQ left rule) are always allowed.

## 11. Stage selectors: the detent slider

Choosing one of N stages (journey legs, training phases) uses the detent
slider: a `<fieldset>` of native radio inputs rendered as a hairline track
with 15px dots inside 44px hit areas; active dot = navy fill + `--yellow-deep`
ring. State is pure CSS (`:checked` + `:has()` inside `@supports`) so it
works without JS; browsers without `:has()` get all panels stacked. The plane
rides the track as the position needle and moves ONLY on user input (glide
~450ms, transform-only; reduced-motion snaps instantly). One panel visible at
a time; each panel carries exactly ONE action. No decorative self-running
animation anywhere — motion is earned by input.

## 12. Removed motifs

The "spine" (dashed centerline + waypoint dots + taxiing plane, v11.0.0) was
cut in v11.0.1: it read as visual noise and misbehaved on mobile. Lesson now
codified: no page-spanning decorative apparatus — motion belongs inside the
control the visitor is touching, never on the page's chrome or background.

## 13. Sound: removed (v12.0.1)

The "quiet sky" synthesized sound layer (v12.0.0) was cut after one release:
the owner judged it not good enough. The domain is silent — no audio layer,
no sound toggles, no exceptions. If sound ever returns, it must beat that bar.

## 14. The STRIP (home page app chrome)

The home page's one piece of persistent chrome (replaces the v10–11
conversion bar, whose component it absorbs):

- Contents: seven stage dots (RAMP · FLIGHT PLAN · CREW · ENROUTE · HANGAR ·
  CHECKLIST · TOWER), a "Next · {stage}" anchor (desktop only), and on mobile
  the compact Crown + phone icon. The Crown NEVER duplicates on desktop —
  the locked nav CTA owns booking there.
- Layouts: mobile = glass bottom bar (≤64px content, safe-area padded);
  desktop = slim fixed right-edge rail. Both are floating chrome (glass is
  lawful here and nowhere else in flow).
- Truth: dots and Next are real anchor links (URL updates, back-button and
  deep links work); an IntersectionObserver only *reports* the active stage.
  The strip is JS-hidden by default — with JS off it never appears, and the
  page loses nothing.
- §12's ban stands: the strip is chrome, not apparatus — it must never
  animate itself, track scrollY, or decorate beyond dot state changes.

(Also removed in v12.0.1: the v12.0.0 3D hero plane — the hero visual is the
arch photo again. Same bar as §13's: spectacle must earn its place.)
