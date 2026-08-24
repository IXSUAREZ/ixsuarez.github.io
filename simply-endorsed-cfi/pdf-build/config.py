"""
config.py — Python side of the shared pipeline config (see config.js).

Reads config.json (same directory). The output PDF path can be overridden
with the SIMPLY_ENDORSED_OUT environment variable so scratch/test runs
never touch the real deliverable. Keep in sync with config.js.
"""

import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))

with open(os.path.join(HERE, "config.json")) as f:
    _CFG = json.load(f)

PDF_PATH = os.environ.get("SIMPLY_ENDORSED_OUT") or _CFG["outputPdf"]
OUT_DIR = os.path.dirname(PDF_PATH)
BASE_PATH = PDF_PATH[:-4] + ".base.pdf" if PDF_PATH.endswith(".pdf") \
    else PDF_PATH + ".base.pdf"
QA_DIR = os.path.join(OUT_DIR, "qa")
