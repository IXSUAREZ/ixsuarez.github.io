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
