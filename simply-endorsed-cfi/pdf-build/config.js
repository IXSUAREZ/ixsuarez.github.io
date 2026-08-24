"use strict";

/**
 * config.js — single source of truth for pipeline paths.
 *
 * Output filenames derive from APP_META.acVersion (endorsements-data.js —
 * the single source of truth for the AC version) via the slug rule "strip
 * whitespace": "AC 61-65K" → "AC61-65K". The output directory comes from
 * config.json (same directory).
 *
 * Overrides for scratch/test runs (never point these at the real
 * deliverable casually):
 *
 *   SIMPLY_ENDORSED_OUT=/tmp/scratch/anything.pdf   full output path
 *   SIMPLY_ENDORSED_OUT_DIR=/tmp/scratch            output dir, derived name
 *
 * config.py exposes the same values to the Python stages (stamp_nav.py,
 * qa-nav.py) — keep the two modules in sync.
 */

const fs = require("fs");
const path = require("path");
const { getData } = require("./lib/load-data");

const CONFIG_PATH = path.join(__dirname, "config.json");
const cfg = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));

// Same slug rule as make-nav-data.js (which emits it as acSlug).
const AC_SLUG = getData().APP_META.acVersion.replace(/\s+/g, "");
const OUT_DIR = process.env.SIMPLY_ENDORSED_OUT_DIR || cfg.outputDir;
const PDF_PATH =
  process.env.SIMPLY_ENDORSED_OUT ||
  path.join(OUT_DIR, `Simply-Endorsed-CFI-${AC_SLUG}.pdf`);

module.exports = {
  PDF_PATH,
  OUT_DIR: path.dirname(PDF_PATH),
  BASE_PATH: PDF_PATH.replace(/\.pdf$/, ".base.pdf"),
  QA_DIR: path.join(path.dirname(PDF_PATH), "qa"),
  AC_SLUG,
};
