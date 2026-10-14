# Standalone app menu integration — 2026-10-14

The shared application launcher connects to Aero Lab’s existing website menu. Crank & Core’s current released runtime uses engine-control rails and has no website/app menu; those existing controls receive the shared material without adding a new navigation model.

## Source ownership

| Source | Responsibility |
| --- | --- |
| `config/site-pages.json` | Canonical public tool inventory, destinations and identity IDs |
| `scripts/sync-site-metadata.py` | Generates the adapter inventory: one All pilot tools link and seven icon tiles in catalog order |
| `assets/app-site-navigation.js` | Adds the shared launcher to an existing app menu, reuses existing destination anchors, and observes navigation subtree changes; does not read or alter scientific/model state |
| `scripts/sync-avionics.py` | Injects the adapter into independently built entry shells and maintains managed asset references after exports |
| `assets/avionics.css` | Owns the shared `.av-app-launcher`, `.av-app-tile` and icon-well material/grid rules |
| Aero Lab app-owned dock | Owns menu open/close behavior and contextual app commands |
| Crank & Core source-owned `neumorphism.css` | Restyles the released engine-control rails without altering their runtime |

The adapter supports existing compatibility selectors `.site-navigation__drop-panel` and `.nav-drop-panel`, plus Aero’s actual `.aero-dock__panel-links` and the historical `.explorer-menu-panel` compatibility selector. Its subtree observer permits an app menu recreated by its runtime to receive the inventory again.

Current shell wiring was verified in `aero-lab/index.html`. Root rendered inspection confirmed Crank’s current runtime has no website/app menu, so the unused adapter injection was removed from its shell. Crank keeps its pinned model/runtime bundles; no model runtime source changed.

## Seven-tile acceptance

The icon grid must show exactly one link each, in catalog order, to:

1. Simply Endorsed CFI
2. CertPath
3. FlightRisk
4. Aero Lab
5. Crank & Core
6. FOI Cards
7. PilotSolve

All pilot tools remains a separate overview link. Each app tile retains a real destination URL and its existing product identity image. Opening, closing and reopening the native app menu must retain one complete grid without duplication. In-app Collection/View/model controls must continue to function alongside the launcher.

## Rendered QA

Root IAB verified Aero Lab’s seven native links, exactly one grid, close/reopen behavior and menu overflow scrolling. `output/neumorphism/site/aero-app-picker-day.jpg` records the menu state.

Root IAB loaded Crank’s original Rotax model and exercised Explore then Parts. Original geometry/colors and component lists remain visible, no horizontal overflow or application errors were observed, and its existing control rails use the approved material. Evidence: `output/neumorphism/site/crank-parts-day.jpg`. This is control-rail acceptance, not an invented Crank app menu.
