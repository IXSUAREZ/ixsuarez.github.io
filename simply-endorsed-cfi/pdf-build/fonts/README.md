# Vendored fonts (idea-48)

Static TrueType instances of **Inter** (400/500/600/700/800) and
**Inter Tight** (700/800), full character set (covers § · — – ’ “ ” → ≈ ↗
≠ ≤ ↔ used by the book). Downloaded from the Google Fonts static-TTF
endpoint (`fonts.googleapis.com/css2`, default UA → full TTF per weight).
Inter is licensed under the SIL Open Font License 1.1.

Why vendored: `styles/pdf.css` declared `font-family: "Inter"` with no
`@font-face`, so Chromium/Skia fell back to system fonts it cannot subset
and painted every run as unembedded Type3 glyph paths (~140 Type3 font
objects). With real TTFs referenced by `@font-face`, Chromium embeds
subset CID Type0 fonts (as it already does for Menlo).

`stamp_nav.py` also embeds `Inter-700.ttf` for the stamped nav chrome
(was core-14 Helvetica-Bold, unembedded).
