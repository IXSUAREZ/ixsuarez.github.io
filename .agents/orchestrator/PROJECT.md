# Project: SuarezCFI.com Redesign

## Architecture
- The main homepage is in `index.html`. It contains structural markup and embedded CSS in a `<style>` tag.
- The Simply Endorsed wizard resides under `simply-endorsed/` and has its own index.html and test suite under `simply-endorsed/tests/`.
- Changes must be visually premium, responsive, and preserve all functional behaviors tested by the E2E suite.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Baseline verification | Run the existing Simply Endorsed test suite to ensure a passing baseline. | None | DONE |
| 2 | Background & Glows (R1) | Implement coordinate grid lines, Bowman Field lat/long text, and soft shifting background color glows. | M1 | DONE |
| 3 | Manifesto Quotes (R2) | Upgrade quote strips to premium serif blockquotes with styled signature, wind vector, or sky gradient overlays. | M2 | DONE |
| 4 | About & Credentials (R3) | Redesign About layout to overlap profile photo, add handwriting signature quote, style certifications as interactive pilot logbook Credentials Cards. | M3 | IN_PROGRESS |
| 5 | E2E & Integrity Validation | Run the test suites, perform challenger verification, and pass Forensic Auditor integrity gate. | M4 | PLANNED |

## Interface Contracts
- The Simply Endorsed wizard's DOM structure must remain compatible with JSDOM tests.
- Class names, IDs, and elements targeted by `simply-endorsed/tests/` must not be broken.

## Code Layout
- Homepage: `index.html`
- Assets: `assets/`
- Simply Endorsed App: `simply-endorsed/`
- Simply Endorsed Tests: `simply-endorsed/tests/`
