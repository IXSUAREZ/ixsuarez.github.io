# Polished Aurum — active design authority

The selected reference is Polished Aurum: reflective yellow gold, bright highlights, bronze edges, tactile depth. It supersedes prior champagne, cyan avionics, flat yellow, and inlay alternatives. Do not create new theme variants or import old palette files.

- Day canvas: #E3E3E3. Night canvas: #414141. Default: System.
- Canonical material tokens and app compatibility aliases: assets/avionics.css.
- Appearance lifecycle and saved-choice migration: assets/appearance.js.
- Installable app manifests use `#E3E3E3` as their static Day-gray launch fallback. The first-paint appearance controller sets the live browser theme color to `#E3E3E3` or `#414141` from System or the saved choice.
- Gold primary and selected controls; gray glass secondary controls; quiet text actions.
- Keep all geometry, navigation behavior, calculation/data formats, category/status meanings, instructional diagrams, and exported artwork.
- Reading/results surfaces stay opaque. Floating navigation/overlays may use softened glass.
- Press 100ms, hover/selection 220ms; no perpetual shimmer. Reduced motion disables travel/glints.
- Run scripts/sync-avionics.py after generating or packaging any page, then scripts/refresh-tactile-caches.py.
- config/theme-assets.json registers shared/app-owned theme asset hashes and all archived generated asset paths. The archive command adds future retirements automatically. Add new authored theme stylesheets there; audit-aurum.py rejects stale managed asset URLs, retired theme references, and retired files restored anywhere at their registered paths, even if unlinked.

## Prior style archive

Original CSS and appearance/navigation sources from release dfd653c are saved outside the deployable site. The verified local mirror is `/Users/diegosuarez/Projects/suarez-aurum-sources/_archives/style-baseline-20260924/styles-dfd653c.tar.gz`, beside its per-file SHA-256 manifest. It matches the original volume archive byte-for-byte; all 53 archived sources match their manifest hashes (`docs/design/style-baseline-mirror.json`). Historical layout code remains where applications require it; its material declarations are being consolidated into this authority.

The separately loaded Crank & Core copper stylesheet has also been retired; exact archive evidence is in `archived-copper-theme.json`. Its product-mark geometry remains in the Aurum adapter. The unused FlightRisk embedded legacy server is retired in `archived-flightrisk-server.json`; archive integrity and absence checks are recorded in `archive-verification.json`.

The loaded Simply Endorsed compatibility stylesheet now contains only the footer Guidance control and hidden legacy-header rules. Its prior 49,456-byte worktree version is preserved outside deployment as `simply-endorsed-legacy-before-final-retirement-20260925.css` with a SHA-256 manifest beside the verified original 53-source archive. The active workspace remains styled by `simply-endorsed/js/workspace.css` and the shared Aurum layer.

The current shared tool core no longer carries the obsolete `.topbar-*` header family. Its 32,184-byte pre-retirement version and SHA-256 manifest are archived outside deployment as `tool-core-before-topbar-retirement-20260925.css` beside the original style archive. The current pages use the floating shared navigation and their own tool dock; the remaining core retains active compatibility and Part 61 workbench rules.

## Completion gates (in progress)

- [x] Reference selected and previous style source archived.
- [x] Shared Aurum material foundation and System appearance implemented.
- [ ] Remove remaining conflicting component material declarations.
- [ ] Inspect every active route for integration; visually inspect each template and app in both appearances.
- [ ] Verify app inputs, saved progress, direct links, exports, responsive sizes, keyboard, zoom and reduced effects.
- [ ] Refresh standalone build/cache artifacts and validate regression suites.
- [ ] Deliver the isolated site preview. Production release remains separate.
