# Certificate photo controls — 2026-10-05

The supplied IMG_8462.jpeg was retrieved through ChatGPT Library into the
consumer's Mac workspace, verified readable at 706×1536, and visually inspected.
It shows `/certificate-generator/`, Step 3 **Add the photo**, with the Upload
photo and Paste image labels crossing their divider. The original fault was
reproduced in fresh mobile Chrome and WebKit sessions before implementation.

## Source and scope

- Production `IXSUAREZ/ixsuarez.github.io` main was verified at
  `166213b7b7cadea3b656a2afafab17b310319dfc` on 2026-10-05.
- The existing **Align website with gold style** task was completed/not loaded.
  The clean release checkout at `~/Projects/suarez-gold-review-release-20261004`
  supplied the isolated working copy. The dirty, older volume authoring checkout
  and unrelated Instructor Studio/CFI Binder projects were preserved.
- Working branch: `fix/mobile-copy-buttons`. No push, PR, merge, or deployment.

## Changes

1. `assets/tool-system/certgen.css`: phone photo buttons now use their content
   height rather than the desktop zero flex basis. Icons keep their dimensions;
   text blocks wrap inside the correct button. At 393px, the former 44px rows
   grow to approximately 76px (Upload) and 89px (Paste), with all copy contained.
   Desktop keeps the side-by-side arrangement and the existing Aurum materials.
2. The same stylesheet places the manual paste target above the navigation dock
   and above its stacking layer. The prior target was covered by the dock and
   failed the actual center-point hit test.
3. `certificate-generator/js/certificate-generator.js`: one clipboard request
   may be active at a time. Navigation, Back, Escape, page dismissal, another
   photo input, or reset invalidates pending clipboard/type/decode results.
   A late result cannot reopen the crop dialog on another step. Manual image
   pastes also use this guard. Clipboard reads remain synchronous within the
   user's click/tap handler, preserving Safari's activation requirement.
4. `certificate-generator/index.html`: CSS and application JS cache URLs now
   bind to the changed bytes. The repository's asset/cache synchronization ran.
5. `scripts/tests/certgen-photo-browser.cjs`: reproducible browser regression
   coverage for layout, hit areas, upload, paste, export, and lifecycle behavior.

## Verification performed

- Chrome: **18/18 checks passed**. WebKit: **18/18 checks passed**.
- Each engine's layout check contains **18 variants**: Day/Night at widths
   320, 353, 393, 480, 481, 768, 1440px; plus 320/393px at 32px root text.
   Full text containment, non-overlapping buttons, stable icon size, no document
   overflow, and three actual hit-test points per button all passed.
- Exercised file-picker upload; real image decoding; crop confirmation and
   cancellation; ready-state replacement; keyboard activation on desktop;
   download of a **1080×1920 JPEG**; and a useful empty-clipboard status.
- Clipboard availability, success, permission denial, synchronous failure,
   delayed reads, and delayed image representations were controlled browser
   mocks. The normal application UI/decoding/export ran, and clipboard read
   activation was asserted. Manual fallback image paste used a synthetic
   ClipboardEvent with real PNG bytes.
- Repeated taps produced one pending read/crop dialog. Touch step navigation,
   browser Back, Escape, switching to Upload, and late manual image decoding
   dismissed or invalidated the paste work as expected.
- Python repository tests: **30/30 passed**.
- Aurum wiring: **523/523 routes**, **6/6 supporting documents**, **4/4 manifests**.
- Site audit: **526 HTML documents**, **zero broken references/failures**.
- `sync-avionics.py --check`: **zero stale HTML sources**. JS syntax and Git
  whitespace checks passed. Cache refresh was deterministic and did not change
  either unrelated offline app's generated cache.
- Visually inspected before/after phone controls, Night controls, fallback
  placement, and desktop controls.

## Re-run

Serve the repository with a threaded HTTP/1.1 server at `127.0.0.1:8994` (or set
`CERTGEN_URL`). Use the installed Playwright module through `NODE_PATH`:

```sh
CERTGEN_ENGINE=chromium node scripts/tests/certgen-photo-browser.cjs
CERTGEN_ENGINE=webkit node scripts/tests/certgen-photo-browser.cjs
```

Set `CERTGEN_CHROME_PATH` to use a different installed Chrome executable.
Playwright's WebKit installation must be available through its configured
browser path. The verification here used fresh profiles, Mac Chrome and
Playwright WebKit 26.6, with external font CSS disabled.

## Evidence and remaining acceptance

Evidence is retained locally in `output/playwright/paste-buttons/` (Git-ignored):
the original reproduction images/metrics, per-engine `results.json`,
`geometry.json`, Day/Night screenshots, paste-fallback captures, desktop
photo-ready captures and exported JPEGs. The original screenshot is in the
parent task workspace's `input/IMG_8462.jpeg` with its Library identity retained.

Physical iPhone Safari testing remains: native Paste permission UI, long-press
Paste, the software keyboard and safe-area behavior, and real camera-roll/HEIC
conversion. Browser emulation does not certify those native interactions.
The working fix is local and ready for integration; production deployment
requires the separate release step.
