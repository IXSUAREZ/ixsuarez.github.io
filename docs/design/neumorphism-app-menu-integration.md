# Standalone app menu integration — 2026-10-14

The shared application launcher now connects to the actual Aero Lab and Crank & Core menus. App-owned model/workspace controls retain their existing menu and routing behavior.

## Source ownership

| Source | Responsibility |
| --- | --- |
| `config/site-pages.json` | Canonical public tool inventory, destinations and identity IDs |
| `scripts/sync-site-metadata.py` | Generates the adapter inventory: one All pilot tools link and seven icon tiles in catalog order |
| `assets/app-site-navigation.js` | Adds the shared launcher to an existing app menu, reuses existing destination anchors, and observes navigation subtree changes; does not read or alter scientific/model state |
| `scripts/sync-avionics.py` | Injects the adapter into independently built entry shells and maintains managed asset references after exports |
| `assets/avionics.css` | Owns the shared `.av-app-launcher`, `.av-app-tile` and icon-well material/grid rules |
| Aero Lab app-owned dock and Crank & Core `assets/avionics-overlay.js` | Continue owning native app menu open/close behavior and contextual app commands |

The adapter supports existing compatibility selectors `.site-navigation__drop-panel` and `.nav-drop-panel`, plus the actual app menu selectors `.aero-dock__panel-links` and `.explorer-menu-panel`. Its subtree observer permits an app menu recreated by its runtime to receive the inventory again.

Current shell wiring was verified directly in `aero-lab/index.html` and `engine-explorer/app/index.html`; both load `/assets/app-site-navigation.js`. Crank & Core keeps its pinned model/runtime bundles. No model runtime source was changed for this integration.

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

## QA responsibility

Aero Lab's seven-tile native-menu and reopen check was reported verified by the parent integration agent. The parent is performing the final Crank & Core rendered/menu/navigation check and will add its authoritative screenshot/receipt evidence to the release record.

The delegated Crank browser attempt did not reach the page: both an existing browser handle and a fresh in-app-tab request reported the IAB surface unavailable to subagents. No Chrome fallback or source changes were made during that check. Static selector/shell wiring is verified; that evidence alone is not a claim of rendered Crank menu acceptance.
