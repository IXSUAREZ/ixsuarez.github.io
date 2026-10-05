# Synthetic photo-format fixtures

These are self-authored test images, generated locally on 2026-10-05.
They contain colored rectangles and no user photographs. HEIC, HEIF and AVIF
fixtures are genuine encoded files, not renamed JPEGs. `manifest.json`
records SHA-256 hashes. No fixture came from an actual iPhone or Messages.

- `sample.*`: 240×160; left half red, upper right green, lower right blue.
  Pillow produced PNG, JPEG, WebP, GIF, BMP and TIFF. ImageMagick encoded
  `sample.heic` and `sample.avif` from this same PNG.
- `oriented.jpg`: JPEG with EXIF orientation 6 (90° clockwise). Upright decode
  must be 160×240, with red at top left and green at bottom right.
- `transparent.png`: transparent left strip (80px), red opaque remainder.
  `transparent.heic` is its lossless HEIC encoding including alpha.
- `secondary.png`: solid green, used as the second still in `multiple.heic`.
  The primary still is the sample pattern, not the second green image.
- `oriented.heic`: HEIC rotation metadata, encoded with `--rotate-cw 90`.
- `ten-bit.heic`: 10-bit HEIC encoded from a 16-bit PNG version of the sample.
- `large.jpg`: 3840×2560 red image; normalization must produce 2400×1600.

HEIC variants were generated with local libheif's `heif-enc`:

```sh
heif-enc --lossless transparent.png -o transparent.heic
heif-enc --rotate-cw 90 sample.png -o oriented.heic
heif-enc sample.png secondary.png -o multiple.heic
magick sample.png -depth 16 PNG48:/tmp/certgen-16bit.png
heif-enc -b 10 /tmp/certgen-16bit.png -o ten-bit.heic
```

These files exercise real browser/decoder bytes, orientation, primary-image
selection, alpha and depth. They do not prove iOS clipboard permission UI,
camera HDR color fidelity, all HEIF codecs, or native Live Photo motion.
Certificate output intentionally uses a bounded SDR JPEG still.
