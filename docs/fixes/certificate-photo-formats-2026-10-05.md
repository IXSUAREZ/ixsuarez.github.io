# Certificate photo format compatibility — 2026-10-05

The Certificate Generator now checks actual image signatures rather than
rejecting photos solely by clipboard MIME or file extension. Upload, paste
and drop share one bounded local decoder. This extends the same user's
paste-button fix; the user explicitly authorized committing and deploying
the combined change after validation.

## Behavior and implementation

- `certificate-generator/js/photo-intake.js`: JPEG, PNG, WebP, GIF, BMP and
  AVIF use native browser decoding; HEIC/HEIF tries native decoding, then a
  separately loaded local WASM worker. TIFF works where the browser decodes
  it (WebKit here); otherwise a clear JPEG/PNG export instruction appears.
  Wrong, empty, generic or Apple MIME labels do not override real signatures.
- `certificate-generator/js/heif-worker.js`: selects the primary HEIF still,
  including orientation and alpha; auxiliary images and Live Photo motion
  are not certificate output. Work ends on cancellation or a 25-second timeout.
- `certificate-generator/js/certificate-generator.js`: accepts broader image
  and Apple clipboard representations, tries another representation after a
  bad candidate, and reads inline data-image bytes from clipboard HTML without
  inserting the HTML or fetching remote/blob/file URLs. No image bytes leave
  the browser. The original tap-gesture read and lifecycle cancellation remain.
- `certificate-generator/index.html`: advertises HEIC/HEIF in the upload
  picker, loads the intake module, uses content hashes for changed scripts,
  and links the separate library's source/license notice.
- `certificate-generator/vendor/libheif-1.23.5/`: unmodified, pinned
  libheif-js 1.23.5 browser bundle, upstream licenses, corresponding source
  archives, provenance and SHA-256 manifests. The bundle is 2,044,206 bytes
  (716,973 in a local gzip measurement), lazy loaded only when needed.

Input is limited to **20 MiB**, **50 million source pixels**, and **12,000px
per side**. Source dimensions are inspected before native decode where the
format exposes them, and the HEIF worker checks handle dimensions before
pixel allocation. Native decoded dimensions are checked again. Crop input
is normalized to an upright JPEG at **2400px maximum edge**, with transparent
pixels composited on white and metadata removed. It is an SDR still image;
HDR profiles, animation, RAW and every possible HEIF codec are not promised.
The existing final certificate remains a 1080×1920 JPEG.

Clipboard access and image decoding are distinct: Safari may expose PNG even
when the source is HEIC, or may expose no usable image bytes from Messages.
The latter now explains: save the photo from Messages to Photos, then use
Upload photo, or copy a screenshot. The site cannot retrieve bytes withheld
by the operating system/browser. Native Live Photo motion/video-only data
similarly requires its still photo.

These boundaries follow the primary references: [WebKit clipboard behavior](https://webkit.org/blog/10855/async-clipboard-api/),
[Safari 17 HEIC support](https://webkit.org/blog/14445/webkit-features-in-safari-17-0/),
[Apple HEIF sharing/export](https://support.apple.com/en-us/116944), and
[Apple Live Photos guidance](https://developer.apple.com/design/human-interface-guidelines/live-photos/).

## Verification before release

- **Chrome: 22/22 format checks and 18/18 photo UI checks passed.**
- **WebKit 26.6: 22/22 format checks and 18/18 photo UI checks passed.**
- Real valid fixtures decoded: JPEG, PNG, WebP, GIF, BMP, AVIF and HEIC with
  generic MIME. TIFF decoded in WebKit; Chrome reported its supported fallback.
  The HEIF worker was also deliberately exercised on both engines using real
  rotated, transparent, multiple-image and 10-bit HEIC fixtures.
- Pixel assertions verified orientation, primary-image selection, white
  transparency and bounded resizing. Corrupt/spoofed/truncated files, RAW,
  video-only Live Photo containers, byte/pixel limits, blocked decoder and
  actual worker cancellation returned useful errors without page exceptions.
- UI tests exercised HEIC uploads, Apple/generic/custom MIME variants,
  candidate fallback, manual empty-MIME paste and inline-image HTML. Remote
  HTML image references were not fetched, scripts did not execute, and image
  intake made no non-GET network requests.
- Original UI regressions passed: 18 Day/Night layout/text variants per engine,
  real hit tests, upload, controlled clipboard denied/unavailable/throwing
  cases, repeated taps, navigation/Back/Escape cancellation, desktop keyboard,
  crop and JPEG export. Clipboard read activation remained true during taps.
- Repository Python **30/30**, shared interface Node **27/27**, Aurum wiring
  **523 routes / 6 supporting documents / 4 manifests**, site audit **526
  documents, zero broken references or failures**. Syntax and whitespace passed.
  Required asset sync and cache refresh produced no unrelated file changes.

Fixtures in `scripts/tests/fixtures/certgen-images/` are self-authored synthetic
patterns with hashes and provenance. They are genuine format encodings; they
are not physical iPhone/iMessage fixtures. All clipboard MIME/permission
responses above were controlled browser tests, not native clipboard UI.

Re-run with Playwright's module on `NODE_PATH`, installed WebKit browsers on
`PLAYWRIGHT_BROWSERS_PATH`, and a threaded HTTP/1.1 preview at port 8994:

```sh
CERTGEN_ENGINE=chromium node scripts/tests/certgen-formats-browser.cjs
CERTGEN_ENGINE=webkit node scripts/tests/certgen-formats-browser.cjs
CERTGEN_ENGINE=chromium node scripts/tests/certgen-photo-browser.cjs
CERTGEN_ENGINE=webkit node scripts/tests/certgen-photo-browser.cjs
```

Set `CERTGEN_URL=https://suarezcfi.com` and `CERTGEN_RUN=live` for production
verification. Local evidence is Git-ignored under `output/playwright/` in
`image-formats/local/` and `paste-buttons/local/`; live verification has its
own `live/` folders so local evidence is preserved.

## Release and remaining acceptance

The established release is GitHub Pages legacy deployment from `main`, root
directory, at `https://suarezcfi.com/`. The validated baseline was
`166213b7b7cadea3b656a2afafab17b310319dfc`; push must be a normal fast-forward,
with no unrelated source changes. Exact pushed SHA, Pages CI result, public
asset hash parity and live browser results are captured after publication in
the task's `release-verification.json` and reported to the source task.

Physical iPhone acceptance remains: native Paste permission/long-press UI,
keyboard/safe-area interaction, real Messages clipboard representations, and
real camera HDR/Live Photo stills. Mac WebKit emulation cannot certify these.
