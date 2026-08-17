# DESIGN.md — suarezcfi.com design constitution

Engineer-facing contract for every page and app on this site. If a change
violates this file, the change is wrong — update the constitution deliberately,
never by drift.

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
| `theme-orange` | Part 61 Calculator                           | live      |
| `theme-teal`   | reserved (next tool)                         | reserved  |
| `theme-night`  | reserved (dark app surfaces)                 | reserved  |

Never invent a per-page accent outside this registry. Claim a reserved slot
and define it next to the others: shared `theme-blue` lives in
`assets/tool-system/tool-core.css`, app-exclusive themes (e.g. `theme-orange`)
live in that app's module under `assets/tool-system/`.

### Tool stylesheets (`assets/tool-system/`)

One shared core plus one module per app; each tool page loads exactly
`tool-core.css` + its own module (in that order):

- `tool-core.css` — tokens, base, shared chrome (`nav--tool`, footer),
  workbench shell, and any component used by ≥2 apps.
- `simply-endorsed.css` — endorsement browser, category rail, guidance view.
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
