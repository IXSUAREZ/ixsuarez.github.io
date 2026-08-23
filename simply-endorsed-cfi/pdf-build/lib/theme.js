"use strict";

/**
 * theme.js — category theming and label maps.
 *
 * CATEGORY_THEMES hex values are copied VERBATIM from
 * simply-endorsed/js/app.js lines 85-170. Do not "improve" them — the PDF
 * must match the web app exactly.
 *
 * CATEGORY_LABELS / CATEGORY_ORDER come from CATEGORY_DEFS in the same file
 * (app.js lines 12-83). WHO_ISSUES_LABELS mirrors app.js ISSUER_LABELS.
 * EXPIRATION_LABELS uses print-friendly long forms (app.js uses terse
 * "90 days"/"2 months"; the long forms read better on paper).
 */

const CATEGORY_THEMES = {
  all: {
    accent: "#475569",
    soft: "#f0f1f3",
    line: "#d1d5da",
    ink: "#313b4a",
  },
  "practical-test-prereqs": {
    accent: "#4f46e5",
    soft: "#f1f0fd",
    line: "#d3d1f9",
    ink: "#1d13be",
  },
  "student-pilot": {
    accent: "#f59e0b",
    soft: "#fef7eb",
    line: "#fde7c2",
    ink: "#b37000",
  },
  "sport-pilot": {
    accent: "#16a34a",
    soft: "#ecf8f1",
    line: "#c5e8d2",
    ink: "#0b7633",
  },
  "recreational-pilot": {
    accent: "#65a30d",
    soft: "#f3f8ec",
    line: "#d9e8c3",
    ink: "#477605",
  },
  "private-pilot": {
    accent: "#0ea5e9",
    soft: "#ecf8fd",
    line: "#c3e9fa",
    ink: "#0476a9",
  },
  "commercial-pilot": {
    accent: "#ca8a04",
    soft: "#fbf6eb",
    line: "#f2e2c0",
    ink: "#906200",
  },
  atp: {
    accent: "#1f2937",
    soft: "#edeeef",
    line: "#c7cacd",
    ink: "#151d27",
  },
  "instrument-rating": {
    accent: "#64748b",
    soft: "#f3f4f6",
    line: "#d8dce2",
    ink: "#455162",
  },
  "flight-instructor": {
    accent: "#dc2626",
    soft: "#fceeee",
    line: "#f6c9c9",
    ink: "#a11414",
  },
  "sport-pilot-instructor": {
    accent: "#ea580c",
    soft: "#fdf2ec",
    line: "#fad5c2",
    ink: "#aa3c02",
  },
  "additional-recurrent": {
    accent: "#0d9488",
    soft: "#ecf6f5",
    line: "#c3e4e1",
    ink: "#056b62",
  },
  "robinson-sfar73": {
    accent: "#db2777",
    soft: "#fceef4",
    line: "#f6c9dd",
    ink: "#a01553",
  },
  "specialty-operations": {
    accent: "#7c3aed",
    soft: "#f5effe",
    line: "#decefb",
    ink: "#4f0ac4",
  },
};

/** The app's 13-category browse order (CATEGORY_DEFS order in app.js). */
const CATEGORY_ORDER = [
  "practical-test-prereqs",
  "student-pilot",
  "sport-pilot",
  "recreational-pilot",
  "private-pilot",
  "commercial-pilot",
  "atp",
  "instrument-rating",
  "flight-instructor",
  "sport-pilot-instructor",
  "additional-recurrent",
  "robinson-sfar73",
  "specialty-operations",
];

/** slug → display label (from CATEGORY_DEFS in app.js). */
const CATEGORY_LABELS = {
  all: "All Endorsements",
  "practical-test-prereqs": "Practical Test Prerequisites",
  "student-pilot": "Student Pilot",
  "sport-pilot": "Sport Pilot",
  "recreational-pilot": "Recreational Pilot",
  "private-pilot": "Private Pilot",
  "commercial-pilot": "Commercial Pilot",
  atp: "ATP",
  "instrument-rating": "Instrument Rating",
  "flight-instructor": "Flight Instructor",
  "sport-pilot-instructor": "Sport Pilot Instructor",
  "additional-recurrent": "Additional / Recurrent",
  "robinson-sfar73": "Robinson SFAR 73",
  "specialty-operations": "Specialty Operations",
};

/** whoIssues slug → label. Mirrors ISSUER_LABELS in app.js (lines 237-243). */
const WHO_ISSUES_LABELS = {
  "standard-cfi": "Standard CFI signoff",
  "examiner-only": "Examiner only",
  "dpe-or-asi-only": "DPE or ASI only",
  "approved-institution": "Approved institution",
  "non-instructor": "Qualified non-instructor",
};

/** expiration slug → print-friendly label. */
const EXPIRATION_LABELS = {
  none: "No expiration",
  "90-calendar-days": "90 calendar days",
  "2-calendar-months": "2 calendar months",
};

/**
 * Inline style string setting the four per-category CSS custom properties.
 * Unknown slugs fall back to the neutral "all" theme.
 */
function themeVars(slug) {
  const t = CATEGORY_THEMES[slug] || CATEGORY_THEMES.all;
  return (
    `--cat-accent:${t.accent};` +
    `--cat-soft:${t.soft};` +
    `--cat-line:${t.line};` +
    `--cat-ink:${t.ink}`
  );
}

module.exports = {
  CATEGORY_THEMES,
  CATEGORY_ORDER,
  CATEGORY_LABELS,
  WHO_ISSUES_LABELS,
  EXPIRATION_LABELS,
  themeVars,
};
