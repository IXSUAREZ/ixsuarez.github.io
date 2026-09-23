# Homepage reference refinement — design QA

**Follow-up:** A later whole-site browser review found mixed legacy surfaces and narrow-dock wrapping outside this original hero comparison. Those defects were corrected and verified in [the 2026-09-22 visual audit](docs/avionics/visual-audit-2026-09-22.md). The pass statement below applies to the earlier hero-reference comparison.

Source: `/Users/diegosuarez/.codex/generated_images/01a0cb6b-a55f-73e3-96c3-dfc2ab086a8e/exec-d159ddfe-c1fd-46aa-87cb-1906c455d031.png`.
Implementation: http://127.0.0.1:8938/ at1487×1058 CSS pixels, 1× capture. Source normalized to the same size for comparison. Night sky / Dark interface; cloud positions vary because the existing sky continues animating.

Full comparison: `docs/avionics/screenshots/home-refinement-comparison.jpg`.
Focused control comparison: `docs/avionics/screenshots/home-refinement-controls.jpg`.
Latest desktop capture: `docs/avionics/screenshots/home-reference-refinement-desktop.png`.
Narrow-phone capture: `docs/avionics/screenshots/home-reference-refinement-320.png`.

## Findings and iteration history

Initial view had a missing top-left wordmark, filled cyan CTA, text-only secondary action, serif supporting copy, flat/small dock controls and an824px hero that exposed the next section. These were P1/P2 mismatches to the selected image. The homepage-only stylesheet now supplies the wordmark, outlined shallow-bevel icon buttons, sans-serif supporting copy, stronger dock, and full-height desktop composition. Existing shared navigation labels and Menu structure remain; the reference's Journal/About dock labels are intentional differences from the approved information architecture.

The desktop hero frame now follows viewport height (minimum900px), as required by this newly selected composition. This supersedes the earlier fixed824px desktop frame. Sky JS/CSS/image assets, solar behavior, animation and reduced-motion behavior remain unchanged; the renderer naturally resizes with its container. Mobile retains its existing hero sizing.

Second review corrected a legacy important serif rule, a hidden primary-button icon, narrow-phone CTA min-width, and signature clearance above the mobile dock. Final combined comparisons show no actionable P0/P1/P2 differences.

## Fidelity and functionality

- Typography: thin large display heading and sans-serif support/controls now match the reference's hierarchy and wrapping. Existing licensed fonts/system fallbacks retained.
- Layout: left-aligned copy, upper-left brand, lower signature and floating dock follow the reference. Dock stays860px maximum per approved compact navigation; mobile becomes four destinations.
- Color/material: cyan outlined primary action and selected controls, dark beveled surfaces, restrained floating glass; Day controls use the shared readable palette.
- Assets: original animated sky retained. Plane/book icons reuse the licensed Lucide sprite geometry. Outline versus filled plane silhouette is minor accepted library variation.
- Copy: existing copy and link destinations preserved. Menu appearance controls exercised, including Day and Escape/focus return. 320px document width equals viewport width; hero CTAs remain within bounds.
- Validation: six sky tests pass; full static route audit reports523 routes and zero findings; shared chrome and appearance generator checks pass. Physical Safari/VoiceOver limitations remain as documented in the site implementation report.

Prior whole-site QA: `docs/avionics/site-design-qa.md`.

final result: passed
