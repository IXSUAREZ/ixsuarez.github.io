# Crank & Core navigation integration — design QA

## Comparison target

- Source visual truth: `/Users/diegosuarez/.codex/attachments/dc04fd78-13ac-4f71-b96d-5bbfb5b39573/image-1.png` (372 × 125 px, the pre-change page showing the separate Crank & Core app header below the site navigation).
- Intended result: move the existing Crank & Core mark and product name into the canonical SuarezCFI tool navigation, then leave the embedded bar for explorer-specific actions only.
- Implementation: `http://127.0.0.1:5090/engine-explorer/`, captured in the Codex in-app browser at 1280 × 720 and 390 × 844 CSS px, 1× density.
- State: Engine collection, Rotax 912 ULS selected; desktop Tools menu and mobile Menu → Tools section tested.

The supplied screenshot is deliberately the before-state rather than a pixel-for-pixel target. The comparison therefore evaluates the requested ownership change while preserving the established site tool-header pattern and the explorer’s controls.

## Evidence

- Desktop: the dark canonical tool pill contains `SUAREZ.CFI`, the existing Crank & Core mark, and `Crank & Core`; the duplicate product block is absent from the embedded toolbar.
- Embedded toolbar: `Teaching reconstruction` / `Model sources` and `More` remain visible and operational, so application-specific controls are not lost with the brand move.
- Mobile: the compact header reads `SUAREZ.CFI | Crank & Core | Menu`; the expandable tool sheet retains the current Crank & Core entry and all sibling tools.
- Interaction: desktop Tools opens the current `Crank & Core — Interactive engine explorer` item. On mobile, Menu and its nested Tools section open and close correctly.

## Required fidelity surfaces

- **Fonts and typography:** Uses the shared tool-header typography and compact mobile sizing; Crank & Core follows the same nav-tool label treatment as the other tools.
- **Spacing and layout rhythm:** The product mark is confined to the established 24 px navigation mark slot; the app toolbar is reduced to a 60 px action bar (56 px on small screens) with no blank brand block.
- **Colors and visual tokens:** The dark site pill remains unchanged. The existing dark Crank & Core mark receives a light inset field for contrast, matching the app’s neutral light surface.
- **Image quality and asset fidelity:** Uses the supplied production `app/brand/crank-core-mark.png` asset, not a recreated mark.
- **Copy and content:** Product label is `Crank & Core`; the accessible page heading is `Crank & Core Engine Explorer`; the existing tool-menu name and description remain intact.

## Comparison history

1. Initial local render: the embedded duplicate was removed and the outer tool navigation was structurally correct. The dark mark was too low-contrast against the dark pill (P1).
2. Fix: added the light, padded field behind the existing mark. Re-rendered at desktop and mobile widths; the product identity is now legible without altering the shared nav pattern.

## Residual test gap

- The in-app browser reports a `MutationObserver.observe` exception for both the local wrapper and the untouched published wrapper. The standalone explorer has no such error, and all visible navigation and explorer controls function. This pre-existing embedded-runtime behavior is not introduced by the navigation integration.

## Final result

final result: passed


# Crank & Core copper identity and Hangar review — 2026-09-13

final result: passed

This result covers the branding/layout change and its smoke tests, not engine-model fidelity.

## Visual evidence

- Selected source: second displayed opposed-piston concept, then the user-authorized copper variation.
- Source visual truth: `engine-explorer/app/brand/crank-core-mark-master.png` (1254 × 1254 RGBA).
- Preview master: `engine-explorer/app/brand/crank-core-preview-master.png` (1254 × 1254).
- Shipping exports: logo 512 square; share preview 1200 square; 192/180/48/32 icons.
- Evidence directory: `../output/crank-core-copper/` relative to this repository.
- Full views: `tools-desktop-live.jpg`, `tools-tablet.jpg`, `tools-mobile.jpg`, `engine-desktop.jpg`, `engine-mobile.jpg`, `engine-viewer.jpg`.
- Browser viewports tested: 1440 desktop, 834 tablet, 390 phone; engine navigation also checked at 320. Screenshots record their native browser pixel dimensions; no stretching or rescaling was used for UI inspection.
- Logo master and desktop engine screenshot were presented together in one comparison tool output. Identity placement was reviewed in the header and the larger homepage card. Site and app/source logo exports match byte-for-byte.
- The selected reference is an identity, not a full-page mockup. Homepage layout is assessed against the approved six-tool grid brief and existing site typography/palette, not claimed as a pixel match to a nonexistent page mockup.

## Findings and fixes

- P2, resolved: existing shared mobile CSS hid the tool logo. Added an engine-specific display override, kept the logo 22px, and checked 390/320 layouts. At 320 the tool name wraps cleanly to two lines without overlapping Menu.
- P2, resolved: the old mobile tools rule changed the grid to a horizontal flex scroller. Removed that rule; verified 3/2/1 columns and no document or tool-row overflow.
- No remaining P0/P1/P2 visual findings in the changed surfaces.

## Required fidelity surfaces

- Typography: existing SF/system stack; readable 21px tool names, 15px descriptions, 14px opening cues. No cropped names or descriptions.
- Spacing: equally prominent cards with consistent 28px padding, 18px gaps, 72px logo slots; phone padding 24px and logos 64px. All six desktop cards measured 307.2px high.
- Color: copper #A65F46, ivory #F4EEE5, charcoal #292D27. White on copper 4.83:1; changed card description/topic/action text exceeds 4.5:1. Semantic engine colors are unchanged.
- Imagery: actual selected raster art, transparent outside the emblem; no recreated mark. Circular silhouette and piston details retained, with normal raster downsampling at small sizes. Final preview text is readable and complete.
- Copy: all six public tools and existing descriptions/destinations retained, with explicit Open tool cues and existing analytics identifiers.

## Functional and static checks

- All six tool routes return HTTP 200; homepage card click opens Engine Explorer.
- Keyboard Tab reaches tool links with a visible 3px focus outline.
- Rotax and Lycoming models both load; Lycoming Explore opens the working viewer.
- Metadata sync --check: zero drift. Chrome sync --check: all pages in sync.
- Generator syntax and git diff whitespace checks passed.
- Exact PNG dimensions and source/site/app equality checked.
- Live homepage, engine wrapper, logo, and preview match local bytes after the workspace's concurrent site release (9248010c). Live homepage also inspected in browser.

## Evidence limits

- Browser console recorded a MutationObserver observe(Node) TypeError during iframe loading, including a fresh tab. No functional failure appeared in the engine selection/viewer smoke test. The engine JavaScript bundle was not changed by this branding work; the error's origin was not established. This is not a claim of an error-free app audit.
- No physical iPhone/iPad test or third-party social cache refresh verification.
- Source public branding and HTML are synchronized; the engine model bundle was not rebuilt or changed.

## Implementation checklist

- [x] Copper identity and square preview exported.
- [x] Shared site, embedded and standalone-source branding synchronized.
- [x] Regeneration retains the custom preview and homepage card structure.
- [x] Responsive grid, links, keyboard focus and engine entry verified.
- [x] Existing unrelated work preserved.
