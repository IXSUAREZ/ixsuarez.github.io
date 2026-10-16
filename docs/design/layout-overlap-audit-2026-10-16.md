# Text and control overlap audit — October 16, 2026

Implemented and reviewed on `codex/neumorphism-cleanup-20261016`. This record covers QA before publication and extends the earlier [material cleanup](neumorphism-cleanup-2026-10-16.md). Publication is verified separately in the external release receipt at `/Volumes/Codex SSD/tmp/release-layout-20261016/`.

## Repairs

- **Home:** removed the negative margin that pulled “Say hello” into “Accepting new students.” Both now belong to one wrapping action row: 18px horizontal separation when they fit, 14px vertical separation when they stack. The contact anchor and tracking ID are retained.
- **Learn:** the library heading and view switch can wrap independently. “Topics” stays inside its button with enlarged text.
- **Blog:** reference copy and its action wrap inside their panel; browse headings also reflow safely.
- **Service pages:** the canonical split panel uses intrinsic column sizing, zero minimum child widths, and safe wrapping. It becomes one column when enlarged copy cannot fit, preventing the discovery-flight walkthrough heading from crossing into the contact links.
- **Certificate Generator:** cropper and caption actions wrap and grow with their labels. The caption Edit control has sufficient width and a 44px minimum target. The generated certificate artwork and generation logic are unchanged.
- **FlightRisk:** entry actions, footer actions, and the live summary reflow within their available width. Results use one bounded scroll surface, an adaptive heading, and wrapping actions. The original 920px desktop dialog maximum is retained. Canonical source CSS, the deployed adapter, and the durable source patch carry the same corrections; no runtime rebuild or scoring change was needed.
- **Crank & Core:** the collection reserves separate rows for its introduction, selector, decorative title, model, specifications, and Explore action. The collection can scroll when text grows. The model canvas, loader, and transparent hit target share only the model row. Canonical and website CSS copies match; explorer controls and model/runtime files are retained.

These repairs use content-driven dimensions at the owning source. Unrelated negative margins, deliberate clipped labels, scrollable tables, model layers, and semantic colors were not flattened into a universal rule.

## Rendered verification

Evidence is saved on the external SSD at `/Volumes/Codex SSD/tmp/layout-audit-20261016/`. `coverage-summary.json` records the exact route and family counts; raw diagnostics are retained.

- Visited all **523 registered routes** in each narrow pass: requested 320px Day and 390px Night. The Guide route redirects to its locked private host. One Night navigation was sampled during that redirect and returned a body-null diagnostic; the settled authentication landing was inspected separately without requesting a passkey. That landing resolved to Day/System, so it is not counted as a Night private-app acceptance check.
- The initial Day Engine wrapper flag came from a visually hidden screen-reader label. The corrected visible-ink probe and a targeted retest report no label overflow. A known-bad copy of the homepage positively reproduced the reported collision, while the repaired row did not.
- **204 page-family cases:** 17 paths at normal 641/768/1280px and enlarged-text 320/641/768px, in Day and Night. No text/control, label, or unbounded page-overflow flags remained. Initial app states alone do not prove a loaded app is ready.
- **84 additional app-ready cases:** seven app surfaces at those same normal/enlarged widths in Day and Night. No text/control, label, or unbounded page-overflow flags remained. FlightRisk's remaining sibling-rectangle flags are the intended risk-tape marker lines layered over the colored bands; their text and controls do not collide.
- Manually checked the reported Home row at 320/390/641/768/1280px, including enlarged-text samples and Night phone states. It wraps or maintains its gap without intersection.
- Opened actual Certificate Generator cropper/caption states, Simply Endorsed workflow/detail/menu/copy feedback, PilotSolve calculator/keypad, FOI card/answer actions, synthetic saved CertPath requirements/endorsements, Engine notes/collection/parts, and FlightRisk expanded questions/live summary/results. Checked results actions at 320/641/1280px with enlarged text and normal desktop; keyboard focus scrolls the phone actions fully into view.
- The Engine model hit target retains computed `z-index:6`; a native click opened the actual Rotax explorer. The manufacturer-reference model also loaded and was visually reviewed. Its initial loading veil caused expected rectangle-overlap diagnostics and exceeded short automation waits on some navigations; the settled view reports zero geometry flags.

“Enlarged text” here means a test-only loopback response with the root font changed from 16px to 32px. It is not a claim of native browser zoom or physical-device testing. Requested viewport widths can have 15px less content width when a classic scrollbar is present. Fixed navigation, intentional visual layers, and closed states require the manual checks above; a zero heuristic count alone is not complete visual proof.

## Regression and preservation checks

The final verification receipt is `verification/final-completion-review.json` in the evidence directory. Asset synchronization reports 523/523 routes, six supporting documents, three manifests, and zero stale HTML sources. Site checks report zero broken references and zero JSON-LD failures. The focused regression suites pass 22 Python and 41 Node tests; the checked contrast set passes 111/111 pairs. The tactile audit passes 50 protected files and the footer audit passes 519 pages.

The private Guide package is rebuilt from the final shared assets: 38 files, matching public/auth stylesheet copies, protected runtime/data files retained, and all eight PDFs byte-identical. Its earlier security/guide tests pass 50/50. No authentication, curriculum, calculation, imagery, model, export-artwork, or content URL changes were introduced by this overlap pass.

## Review captures

- Home: `01-home-status-before-390.png` → `17-home-status-final-390-day.png`.
- Learn and Blog: `10-learn-after-641-large-night.png`, `11-blog-after-768-large-night.png`.
- Certificate Generator: `07-cropper-after-320-large-night.png`, `12-caption-header-final-320-large-night.png`.
- Service panel: `14-service-cta-before-641-large.png` → `22-service-cta-after-641-large-day.png`.
- FlightRisk: `15-flightrisk-footer-before-641.png` → `23-flightrisk-footer-after-641-night.png`; `32-flightrisk-summary-before-641-large-night.png` → `33-flightrisk-summary-after-641-large-day.png`; `35-flightrisk-results-before-320-large-day.png` → `36-flightrisk-results-after-320-large-night-top.png` and `37-flightrisk-results-after-320-large-night-actions.png`.
- Engine: `16-engine-collection-before-320-large.png` → `24-engine-collection-after-320-large-top.png`, `25-engine-collection-after-320-large-model.png`; actual parts panel in `30-engine-parts-320-large-night.png`.

The QA server and saved-plan fixture use synthetic data only. No inquiry, text, call, email, passkey request, print, reset, or external save was submitted. “Text first” is recorded as the user's preferred new-student contact direction; the separate contact conversion plan should lead with a native SMS link. This pass preserves the existing contact handoff.
