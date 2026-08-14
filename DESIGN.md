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
lift. Press yields: `scale(0.97)`, ≤120ms, shadow collapses.

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

- Reveal: `reveal-up`, `0.9s cubic-bezier(0.16, 1, 0.3, 1)`
  (`--ease-premium`), staggered via `--reveal-delay`.
- Hover: state change only (color, border, shadow, icon lean ≤2px) over
  150–200ms. Nothing levitates — `translateY` on hover is banned domain-wide.
  Press: `scale(0.97)`, ≤120ms.
- The journey plane animates along the route track; it is the one piece of
  decorative motion on the home page.
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
once, like letterhead), one seal, and ruled rows (`border-top: 1px solid
var(--border)`) of name + reference fine print (`font-feature-settings:
"tnum"`). No glass cards, no per-row stamps, no hover lift — a ledger is
read, not pressed. This is the only way credentials render anywhere on the
domain; it scales to N rows with zero layout debt. Anything that is not a
control must not wear control chrome (glass, shadow, stamp).


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
