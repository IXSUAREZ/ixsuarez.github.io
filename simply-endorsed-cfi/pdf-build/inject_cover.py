import sys
import fitz
from pathlib import Path

if len(sys.argv) < 2:
    sys.exit(0)

pdf_path = Path(sys.argv[1])
cover_img = Path(__file__).resolve().parent / "simply_endorsed_cover_master.jpg"

if not cover_img.exists():
    print(f"[inject_cover] cover image not found: {cover_img}")
    sys.exit(0)

img_bytes = cover_img.read_bytes()
doc = fitz.open(pdf_path)
page0 = doc[0]

# Scrub any text/markers on page 0
for rect in page0.search_for("ZZPGM", quads=False):
    page0.add_redact_annot(rect, fill=False, cross_out=False)
page0.apply_redactions(graphics=fitz.PDF_REDACT_LINE_ART_NONE)

# Insert native JPEG stream cleanly
page0.insert_image(page0.rect, stream=img_bytes, keep_proportion=False)

tmp = str(pdf_path) + ".cov.pdf"
doc.save(tmp, garbage=4, deflate=True)
doc.close()

import os
os.replace(tmp, pdf_path)
print(f"[inject_cover] Injected native JPEG cover stream onto page 0 of {pdf_path.name}")
