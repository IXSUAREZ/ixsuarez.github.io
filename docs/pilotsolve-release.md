# PilotSolve website preparation — 2026-09-14

Prepared route: https://suarezcfi.com/pilotsolve/
Local review: http://localhost:5190/pilotsolve/
Status: release authorized; local validation passed and package ready for GitHub Pages.

## Included

- Standalone compiled app at `pilotsolve/index.html`; no shared site navigation, footer, premium stylesheet, or iframe wrapper.
- PilotSolve identity: vector mark, transparent logo, branded 1200×1200 preview and 48/180/192/512 icons. Preview follows the branded Crank & Core composition with the site's warm-gray palette and PilotSolve blue.
- Manifest name/short name and Apple home-screen title: PilotSolve. Start URL, ID and scope: `/pilotsolve/`; display: standalone; Apple touch icon: 180px PNG.
- Canonical and Open Graph/Twitter metadata derived from config/site-pages.json; homepage and tools cards, menu inventories, and sitemap entry.
- Isolated service-worker scope and cache namespace; no interception of other site paths.
- Explicit exclusion from shared theme and chrome automation. The app retains its approved Manrope/Inter and glass design.

## Verification

- Matching manifest/canonical path and name, local HTML asset references, icon dimensions, no shared chrome, and metadata-generator idempotence passed.
- Browser: Tools → Open PilotSolve leads directly to the app; its own five tabs appear and shared site header/footer disappear.
- Confirmed 390×844 app viewport. Stopped the HTTP server, reloaded `/pilotsolve/`, and opened Trip successfully from cache. Server restarted for review.
- Icon/preview PNGs visually inspected against existing site identities. Renderer reproducibility checked by the asset agent.
- Underlying app is the prior tested build (29 tests passed); calculation code was not changed for site packaging.
- Actual iPhone Add to Home Screen UI remains a physical-device check. Normal Safari links retain browser-controlled bars; the installed Home Screen web app requests standalone display.

## Rebuild

The source app remains at `Foreflight Document EDITOR/40_tooling/web-tools/pilotsolve` in the sibling workspace.
Run `npm run build:app` there, then `node scripts/prepare-suarezcfi.mjs <absolute-path-to-ixsuarez.github.io>`.
Run `scripts/render-pilotsolve-identity.cjs` with the existing sharp dependency available to regenerate identity assets before packaging if the icon changes.
The export deliberately uses the site's metadata generator and copies only compiled JS/CSS/fonts and app icons, not the phone-frame preview HTML or device assets.

## Publication boundary

User authorized publication on 2026-09-14. Existing unrelated changes to DESIGN.md and design-qa.md were preserved. GitHub Pages publishes the main branch. Local browser data does not automatically migrate across origins to the public website; users can use the app's Export/Restore backup.

Release checks: 523 manifest routes / 525 HTML files audited, zero failures, zero broken references, zero invalid JSON-LD blocks. Shared chrome and metadata checks pass after distributing the PilotSolve menu entry.
