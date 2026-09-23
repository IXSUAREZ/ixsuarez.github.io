# Desktop dark visual overview review

Reviewed all **22** contact sheets in `docs/avionics/refinement-review/sheets/desktop-dark/`. The sheets cover route IDs **000–522** from `config/site-pages.json` in manifest order: 21 sheets contain 24 thumbnails each and sheet 21 contains the final 19, for **523 route thumbnails** reviewed. I expanded 12 original captures for closer inspection: 000, 003, 034, 505, 506, 507, 512, 518, 519, 520, 521, and 522.

This was a desktop dark-mode viewport overview. It was a visual scan for major layout, theme, navigation, and image failures; it did not assess article accuracy or interaction behavior.

## Findings

1. **FlightRisk hero headlines are visibly clipped in two captures.** In `/flight-risk-assessment/methodology/` (route 506) and `/flight-risk-assessment/guide/` (route 507), the large hero heading is cut through the glyphs, leaving only part of the letters visible. See [route 506](refinement-review/desktop-dark/506.jpg) and [route 507](refinement-review/desktop-dark/507.jpg). This looks like a clipping or reveal-animation issue and warrants a fresh browser check before release.

2. **The fixed bottom dock covers content at the viewport edge.** On the homepage (route 000), the dock overlaps the small footer line; on the private-pilot guides page (route 034), it sits over the first visible row of guide cards. Similar overlap recurs across the article thumbnails. See [route 000](refinement-review/desktop-dark/000.jpg) and [route 034](refinement-review/desktop-dark/034.jpg). The screenshots show viewport occlusion; checking the page at its scroll limit would establish whether the final content has sufficient bottom clearance.

3. **Two app captures are still in loading states.** Aero Lab (route 518) shows “Preparing detailed airflow,” and Engine Explorer (route 519) shows “Preparing engine anatomy / Loading individual components.” See [route 518](refinement-review/desktop-dark/518.jpg) and [route 519](refinement-review/desktop-dark/519.jpg). The screenshots alone do not show whether those states persist after load, so I did not classify them as confirmed failures.

The remaining thumbnails showed a consistent dark surface treatment and readable page structures at this scale, with no other gross broken-image or theme failures observed. The Certificate Generator's white preview panel in route 512 is present before a certificate is selected and is not counted as a failure.

## Evidence note

The 523 original files under `desktop-dark/` use a `.png` suffix but contain JPEG data; for example, `000.png` is a 1280 × 720 JPEG and `512.png` is a 1280 × 800 JPEG. I reviewed the actual image bytes with `view_image`; correct the extensions before treating these files as final PNG evidence.


## Desktop day-mode review

Reviewed all **22** contact sheets in `docs/avionics/refinement-review/sheets/desktop-day/`. Together they cover route IDs **000–522** from `config/site-pages.json` in manifest order: 21 sheets contain 24 thumbnails each and the last contains 19, for **523 route thumbnails**. I expanded seven originals (506, 507, 518–522) to distinguish loading states from stable page content. This was a desktop day-mode viewport overview for gross theme, layout, navigation, and image failures; it was not a full-page, copy, or interaction audit.

The day-mode pages are visually consistent across the route set: light surfaces, dark readable type, teal actions, and the bottom dock remain coherent. I saw no gross broken-image patterns, blank route bodies, or widespread theme/layout regressions. Most content pages show the expected hierarchy and readable first-screen content.

1. **Capture timing left several app routes in transient loading states.** Route 506 (`/flight-risk-assessment/methodology/`) and 507 (`/flight-risk-assessment/guide/`) show only a “Loading FlightRisk…” label above the footer. Route 518 (`/aero-lab/`) shows “Opening Aero Lab…” on an otherwise blank viewport. Route 519 (`/engine-explorer/`) shows the engine chooser and “Preparing engine anatomy / Loading individual components.” See [506](refinement-review/desktop-day/506.jpg), [507](refinement-review/desktop-day/507.jpg), [518](refinement-review/desktop-day/518.jpg), and [519](refinement-review/desktop-day/519.jpg). These captures are insufficient to determine whether loading completes; they do not establish persistent route failures.

2. **The fixed bottom dock overlaps the bottom edge of visible page content in viewport captures.** This repeats on article and collection views, including homepage route 000 and guide collection route 034. It is a viewport-occlusion observation; this overview does not establish whether scrolling to the page end provides adequate clearance.

The remaining expanded utility/app routes (520–522) rendered recognizable first-screen content. Route 512’s unselected certificate preview and route 519’s loading anatomy state were not treated as confirmed failures. I found no separate day-mode defect from the thumbnail overview that warrants a code change.

Evidence note: original day captures have a `.png` filename suffix but contain JPEG image data (verified at `000.png` and `506.png`); they were inspected as provided and were not modified.


## Lead resolution after the overview

FlightRisk heading/reveal defects were repaired in authoring sources and rebuilt. Application routes 505–507 and 518–519 were recaptured after settling in all four appearances/viewports; the final gallery uses those captures. Phone article scroll-end inspection confirmed final-content clearance above the dock. Temporary viewport overlap during ordinary scrolling is distinguished from inaccessible final content. The original image suffixes were normalized to JPEG where appropriate, and contact sheets were refreshed. See [final implementation report](refinement-report.md) for current outcomes and remaining verification limits.
