# Neumorphism implementation status

## October 16 cleanup — implementation and QA

The [overlap follow-up](layout-overlap-audit-2026-10-16.md) fixes the Home availability/action collision and additional source-owned wrapping issues. Narrow route coverage, responsive Day/Night family checks, loaded app checks, and actual open dialogs are recorded separately. Final assets and the private Guide package are refreshed. Publication verification is recorded separately at `/Volumes/Codex SSD/tmp/release-layout-20261016/`.

The layout/material cleanup is implemented and locally verified on `codex/neumorphism-cleanup-20261016`, based on `8a67aa5b`. Current scope is 523 routes, six supporting documents, three installable manifests and six public apps; Aero Lab remains removed. Redundant wrappers/disclosure faces, wrapping and fixed-dock focus clearance are repaired, and source-owned app/private styles are packaged. See [the cleanup record](neumorphism-cleanup-2026-10-16.md) for exact changes, checks, screenshots and limitations. Deployment evidence is separate from this implementation record.

## October 14 release record — historical

Baseline ae18e574; branch codex/neumorphism-20261014. Implementation, source regression, route/cache verification and rendered design QA are complete. `design-qa.md` records the passed visual gate; production publication is evidenced separately by the dated external release receipt.

- Shared soft raised/inset material, Day/Night/System and satin gold applied across524 registered routes,6 supporting documents and4 PWA manifests.
- Navigation, mobile shell/menu, app controls and private guide use the same material. Home/Tools expose all7 native-link app tiles; Aero's actual website menu also offers the complete picker. Crank retains its engine-control rails.
- Simply Endorsed, CertPath/storage, FOI Cards, Certificate Generator and FlightRisk material states verified; original workflows/content remain.
- PilotSolve, Aero Lab and Crank & Core use source-owned durable styles and explicit export/cache integration.81 protected runtime/model/data files remain unchanged; FlightRisk normal source rebuild has its own exact-baseline receipt.
- Private guide packaged from current shared assets;50 security/auth/guide tests pass,13 protected source files and8PDFs remain identical. Synthetic Day/Night visual QA passed. Native owner passkey acceptance is not inferred.
- Final independent verification:70JS tests,35Python tests,98wizard tests,1678workspace assertions;111/111 checked contrast pairs; zero broken refs/schema errors; current cache outputs deterministic and all HTML synchronized.

The primary dirty checkout is preserved. Source, screenshots and QA receipts remain on external storage. Physical-device, VoiceOver and native print/download dialog acceptance remain distinct from these checks.
