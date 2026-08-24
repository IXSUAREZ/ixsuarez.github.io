"use strict";

/**
 * config.js — single source of truth for pipeline paths.
 *
 * Reads config.json (same directory). The output PDF path can be overridden
 * with the SIMPLY_ENDORSED_OUT environment variable so scratch/test runs
 * never touch the real deliverable:
 *
 *   SIMPLY_ENDORSED_OUT=/tmp/scratch/Simply-Endorsed-CFI-AC61-65K.pdf node pipeline.js
 *
 * config.py exposes the same values to the Python stages (stamp_nav.py,
 * qa-nav.py) — keep the two modules in sync.
 */

const fs = require("fs");
const path = require("path");

const CONFIG_PATH = path.join(__dirname, "config.json");
const cfg = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));

const PDF_PATH = process.env.SIMPLY_ENDORSED_OUT || cfg.outputPdf;

module.exports = {
  PDF_PATH,
  OUT_DIR: path.dirname(PDF_PATH),
  BASE_PATH: PDF_PATH.replace(/\.pdf$/, ".base.pdf"),
  QA_DIR: path.join(path.dirname(PDF_PATH), "qa"),
};
