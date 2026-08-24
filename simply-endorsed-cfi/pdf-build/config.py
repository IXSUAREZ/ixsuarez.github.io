"""
config.py — Python side of the shared pipeline config (see config.js).

Output filenames derive from the single source of truth for the AC version
(APP_META.acVersion → nav-data.json's acSlug, emitted by make-nav-data.js);
the output directory comes from config.json (same directory). Overrides:

  SIMPLY_ENDORSED_OUT       full output PDF path (scratch/test runs)
  SIMPLY_ENDORSED_OUT_DIR   output dir, derived filename

Keep in sync with config.js.
"""

import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))

with open(os.path.join(HERE, "config.json")) as f:
    _CFG = json.load(f)


def _ac_slug():
    with open(os.path.join(HERE, "nav-data.json")) as f:
        slug = json.load(f).get("acSlug")
    if not slug:
        raise RuntimeError(
            "nav-data.json has no acSlug — run `node make-nav-data.js` first")
    return slug


PDF_PATH = os.environ.get("SIMPLY_ENDORSED_OUT")
if not PDF_PATH:
    _OUT_DIR = os.environ.get("SIMPLY_ENDORSED_OUT_DIR") or _CFG["outputDir"]
    PDF_PATH = os.path.join(_OUT_DIR, f"Simply-Endorsed-CFI-{_ac_slug()}.pdf")
OUT_DIR = os.path.dirname(PDF_PATH)
BASE_PATH = PDF_PATH[:-4] + ".base.pdf" if PDF_PATH.endswith(".pdf") \
    else PDF_PATH + ".base.pdf"
QA_DIR = os.path.join(OUT_DIR, "qa")
