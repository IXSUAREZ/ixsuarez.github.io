"use strict";

/**
 * load-data.js — loads the Simply Endorsed web-app data files into Node.
 *
 * The data files live in ../.. /simply-endorsed/js/ and are plain browser
 * scripts that assign to `window.*` (guidance-content.js also declares a
 * top-level `const GUIDANCE_SECTIONS`, which we capture by appending a
 * `return` statement to the evaluated code).
 *
 * Load order matters: guidance-content.js reads window.APP_META, which is
 * set by endorsements-data.js.
 *
 * This module also re-exports the app's own CFR linkifier (cfr-links.js is
 * UMD and require-able) behind a small `cfrLink()` wrapper, plus an
 * `endorsementById` Map built from ENDORSEMENTS.
 */

const fs = require("fs");
const path = require("path");

const DATA_DIR =
  process.env.SIMPLY_ENDORSED_DATA_DIR ||
  path.join(__dirname, "..", "..", "..", "simply-endorsed", "js");

const DATA_FILES = [
  "endorsements-data.js",
  "browse-structure.js",
  "guidance-content.js",
  "training-requirements-data.js",
  "privileges-limitations-data.js",
];

function evalWithWindow(filePath, extraReturn) {
  const code = fs.readFileSync(filePath, "utf8");
  return { code, extraReturn };
}

/**
 * Evaluates every data file against one shared `window` shim and returns
 * the assembled data object. Throws with a helpful message if a file is
 * missing or an expected global was not produced.
 */
function loadData() {
  const window = {};

  for (const name of DATA_FILES) {
    const filePath = path.join(DATA_DIR, name);
    if (!fs.existsSync(filePath)) {
      throw new Error(`[load-data] data file not found: ${filePath}`);
    }
    const { code, extraReturn } = evalWithWindow(
      filePath,
      // guidance-content.js keeps GUIDANCE_SECTIONS as a top-level const
      // instead of a window global; capture it explicitly.
      name === "guidance-content.js" ? "GUIDANCE_SECTIONS" : null
    );
    const body = extraReturn ? `${code}\n;return { ${extraReturn} };` : code;
    const fn = new Function("window", body);
    const captured = fn(window) || {};
    if (extraReturn && captured[extraReturn] !== undefined) {
      window[extraReturn] = captured[extraReturn];
    }
  }

  const data = {
    APP_META: window.APP_META,
    ENDORSEMENTS: window.ENDORSEMENTS,
    BROWSE_STRUCTURE: window.BROWSE_STRUCTURE,
    GUIDANCE_SECTIONS: window.GUIDANCE_SECTIONS,
    PRE_SOLO_CONTENT: window.PRE_SOLO_CONTENT,
    JOURNEY_STAGES: window.JOURNEY_STAGES,
    SCENARIO_CARDS: window.SCENARIO_CARDS,
    QUICK_REF_DATA: window.QUICK_REF_DATA,
    CFI_CAREER_DATA: window.CFI_CAREER_DATA,
    FLASHCARD_DECK: window.FLASHCARD_DECK,
    // NOTE: the actual browser global is window.TRAINING_REQUIREMENT_CARDS.
    TRAINING_REQUIREMENTS: window.TRAINING_REQUIREMENT_CARDS,
    PRIVILEGES_LIMITATIONS: window.PRIVILEGES_LIMITATIONS,
  };

  const missing = Object.entries(data)
    .filter(([, v]) => v === undefined)
    .map(([k]) => k);
  if (missing.length) {
    throw new Error(
      `[load-data] these globals were not produced by the data files: ${missing.join(", ")}`
    );
  }

  return data;
}

/* ── CFR linkifier (the app's own cfr-links.js, UMD/CommonJS-compatible) ── */

const CfrLinks = require(path.join(DATA_DIR, "cfr-links.js"));

/**
 * cfrLink(citation) → eCFR URL string, or null when nothing linkifiable.
 *
 * Section-level:  https://www.ecfr.gov/current/title-{14|49}/part-{P}/section-{S}
 * Part-level:     https://www.ecfr.gov/current/title-{14|49}/part-{P}
 * Title is 49 when the citation says "49 CFR" or the part number is >= 1000.
 */
function cfrLink(citation) {
  if (!citation) return null;
  const sectionUrl = CfrLinks.getEcfrSectionUrl(String(citation));
  if (sectionUrl) return sectionUrl;
  const partUrl = CfrLinks.getEcfrPartUrl(String(citation));
  return partUrl || null;
}

/* ── Lookup helpers ── */

let _data = null;
let _byId = null;

/** Lazily loads and caches the data object. */
function getData() {
  if (!_data) _data = loadData();
  return _data;
}

/** Map of endorsement id ("A.1") → endorsement object. */
function endorsementById() {
  if (!_byId) {
    _byId = new Map(getData().ENDORSEMENTS.map((e) => [e.id, e]));
  }
  return _byId;
}

module.exports = {
  DATA_DIR,
  loadData,
  getData,
  cfrLink,
  CfrLinks,
  endorsementById: endorsementById(),
};
