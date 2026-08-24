"use strict";

/**
 * make-nav-data.js — dumps nav-data.json for the PyMuPDF chrome stamper
 * (stamp_nav.py). Run:  node make-nav-data.js
 *
 * Contents:
 *   - sourceUrl, acVersion + acSlug (APP_META — the single source of truth
 *     for the AC version label; acSlug is the no-spaces filename form,
 *     e.g. "AC 61-65K" → "AC61-65K")
 *   - categories: slug, label, hero short code, theme hex, bundles in
 *     BROWSE_STRUCTURE order with hand-tuned rail abbreviations
 *   - workflows: the 9 flow pages (pre-solo + featured bundles) + wf-index
 *   - guidance: the 7 top-level Part III sections
 *   - lessons: the 10 GUIDANCE_SECTIONS lesson sub-pages rendered under
 *     the lesson-plan section (PREV/NEXT steps through them, idea-01)
 *
 * Abbreviation rules: UPPERCASE, <= 10 chars, no ellipsis, ASCII only
 * (core Helvetica is WinAnsi — no arrows/guillemets). Hand-tuned below;
 * stamp_nav.py also auto-shrinks the bead font as a safety net.
 */

const fs = require("fs");
const path = require("path");
const { loadData } = require("./lib/load-data");
const { CATEGORY_THEMES, CATEGORY_LABELS } = require("./lib/theme");

const data = loadData();

/* ── Hero badge short codes per category ─────────────────────────────── */
const CAT_CODES = {
  "practical-test-prereqs": "PTP",
  "student-pilot": "STU",
  "sport-pilot": "SPT",
  "recreational-pilot": "REC",
  "private-pilot": "PVT",
  "commercial-pilot": "COM",
  atp: "ATP",
  "instrument-rating": "INS",
  "flight-instructor": "CFI",
  "sport-pilot-instructor": "SPI",
  "specialty-operations": "SPE",
  "additional-recurrent": "ADD",
  "robinson-sfar73": "RBZ",
};

/* ── Bundle rail-bead abbreviations (<=10 chars, no truncation) ──────── */
const BUNDLE_ABBREV = {
  // practical-test-prereqs
  "practical-test-recommendation": "TEST REC",
  "knowledge-test-deficiency-review": "DEFICIENCY",
  // student-pilot
  "pre-solo": "PRE-SOLO",
  "first-solo": "1ST SOLO",
  "night-solo": "NGT SOLO",
  "solo-renewal": "RENEWAL",
  "another-airport-within-25nm": "25NM ARPT",
  "initial-solo-xc": "SOLO XC",
  "repeated-solo-xc-50nm": "50NM XC",
  "class-b-solo": "CLASS B",
  "bcd-towered-solo": "B/C/D TWR",
  "tsa-citizenship": "TSA CIT",
  // sport-pilot
  "sport-knowledge-test": "KNOW TEST",
  "sport-additional-category-class-proficiency": "ADD CAT/CL",
  "sport-practical-test-package": "PRAC TEST",
  "sport-towered-bcd-ops": "TWR B/C/D",
  "sport-vh-87-or-less": "VH <87",
  "sport-vh-above-87": "VH >87",
  "sport-night-training": "NIGHT",
  "sport-retractable-gear": "RETRACT",
  "sport-controllable-pitch-propeller": "PROP CTRL",
  // recreational-pilot
  "recreational-knowledge-test": "KNOW TEST",
  "recreational-practical-test": "PRAC TEST",
  "recreational-within-50nm": "IN 50NM",
  "recreational-beyond-50nm": "OUT 50NM",
  "recreational-under-400-no-pic": "<400 PIC",
  "recreational-additional-rating-solo": "ADD RATING",
  "recreational-towered-bcd-ops": "TWR B/C/D",
  // private-pilot
  "private-knowledge-test": "KNOW TEST",
  "private-airplane-initial-checkride-bundle": "ASEL INIT",
  "private-airplane-add-on-bundle": "ASEL ADDON",
  "private-amel-initial-checkride-bundle": "AMEL INIT",
  "private-amel-add-on-checkride-bundle": "AMEL ADDON",
  // commercial-pilot
  "commercial-knowledge-test": "KNOW TEST",
  "commercial-airplane-initial-checkride-bundle": "ASEL INIT",
  "commercial-airplane-add-on-bundle": "ASEL ADDON",
  "commercial-amel-initial-checkride-bundle": "AMEL INIT",
  "commercial-amel-add-on-checkride-bundle": "AMEL ADDON",
  // atp
  "restricted-atp-amel": "R-ATP",
  "atp-ctp": "ATP CTP",
  // instrument-rating
  "instrument-knowledge-test": "KNOW TEST",
  "instrument-checkride-bundle": "CHECKRIDE",
  // flight-instructor
  "flight-instructor-foi-knowledge": "FOI",
  "flight-instructor-aeronautical-knowledge": "AERO KNOW",
  "cfi-initial-checkride-bundle": "ASEL INIT",
  "cfi-amel-initial-checkride-bundle": "AMEL INIT",
  "cfi-amel-add-on-checkride-bundle": "AMEL ADDON",
  "cfii-add-on-bundle": "CFII ADDON",
  "helicopter-touchdown-autorotation": "AUTOROT",
  // sport-pilot-instructor
  "sport-instructor-foi-knowledge": "FOI",
  "sport-instructor-aeronautical-knowledge": "AERO KNOW",
  "sport-instructor-additional-category-class-proficiency": "ADD CAT/CL",
  "sport-instructor-practical-test-package": "PRAC TEST",
  "sport-instructor-instrument-reference-training": "INST REF",
  "sport-instructor-spin-training": "SPIN",
  // specialty-operations
  nvg: "NVG",
  efvs: "EFVS",
  "simplified-flight-controls": "SIMP CTRL",
  // additional-recurrent
  "ground-instructor-recent-experience": "GND INST",
  "flight-review-and-wings": "FLT REVIEW",
  "instrument-proficiency-check": "IPC",
  "aircraft-endorsements": "AIRCRAFT",
  "solo-without-category-class": "SOLO NOCAT",
  "retest-after-disapproval": "RETEST",
  "additional-category-or-class": "ADD CAT/CL",
  "type-rating-practical-test-non-atp": "TYPE N-ATP",
  "type-rating-practical-test-atp": "TYPE ATP",
  "glider-and-tow-operations": "GLIDER/TOW",
  "home-study-and-ultralight-credit": "HOME STUDY",
  // robinson-sfar73
  "r22-track": "R22",
  "r44-track": "R44",
};

/* ── Workflow bead labels (9 flows + index) ──────────────────────────── */
const WF_ABBREV = {
  "pre-solo": "PRE-SOLO",
  "first-solo": "1ST SOLO",
  "initial-solo-xc": "SOLO XC",
  "private-airplane-initial-checkride-bundle": "PVT CHK",
  "commercial-airplane-initial-checkride-bundle": "COM CHK",
  "instrument-checkride-bundle": "INS CHK",
  "cfi-initial-checkride-bundle": "CFI CHK",
  "flight-review-and-wings": "FLT REV",
  "aircraft-endorsements": "AIRCRAFT",
  "wf-index": "INDEX",
};

/* ── Guidance bead labels ────────────────────────────────────────────── */
const GUIDANCE_SECTIONS = [
  { id: "journey", label: "Pilot Journey", abbrev: "JOURNEY" },
  { id: "scenarios", label: "Scenarios", abbrev: "SCENARIOS" },
  { id: "quickref", label: "Quick Reference", abbrev: "QUICKREF" },
  { id: "cfi-career", label: "CFI Career", abbrev: "CAREER" },
  { id: "flashcards", label: "Flashcards", abbrev: "CARDS" },
  { id: "lesson-plan", label: "Lesson Plans", abbrev: "LESSONS" },
  { id: "appendix", label: "Appendix", abbrev: "APPENDIX" },
];

/* ── Assemble ────────────────────────────────────────────────────────── */
const categories = data.BROWSE_STRUCTURE.map((c) => {
  const slug = c.categoryId;
  return {
    slug,
    label: CATEGORY_LABELS[slug] || slug,
    code: CAT_CODES[slug] || slug.slice(0, 3).toUpperCase(),
    theme: CATEGORY_THEMES[slug] || CATEGORY_THEMES.all,
    bundles: c.subcategories.map((b) => {
      const abbrev = BUNDLE_ABBREV[b.id];
      if (!abbrev) throw new Error(`missing BUNDLE_ABBREV for ${b.id}`);
      if (abbrev.length > 10) throw new Error(`abbrev too long: ${abbrev}`);
      return { id: b.id, label: b.label, abbrev };
    }),
  };
});

// Workflow order = BROWSE_STRUCTURE traversal of (pre-solo renderer or
// featured) bundles — this matches the Part II render order in the PDF.
const workflows = [];
for (const c of data.BROWSE_STRUCTURE) {
  for (const b of c.subcategories) {
    if (b.featured || b.contentRenderer === "pre-solo") {
      workflows.push({
        id: b.id,
        label: b.label,
        abbrev: WF_ABBREV[b.id],
      });
    }
  }
}
workflows.push({ id: "wf-index", label: "Workflow Index", abbrev: "INDEX" });

// Lesson-plan sub-pages (Part III): the 10 GUIDANCE_SECTIONS lessons
// rendered under the lesson-plan section, in render order. stamp_nav.py
// inserts them into the PREV/NEXT unit sequence after gs:lesson-plan.
const lessons = data.GUIDANCE_SECTIONS.map((g) => ({
  id: g.id,
  title: g.title,
}));

const out = {
  sourceUrl: data.APP_META.sourceUrl,
  // Single source of truth for the AC version label is APP_META.acVersion.
  // stamp_nav.py / endorse_chrome.py read acVersion for the top-bar button;
  // render-pdf.js uses the same slug rule for its output filenames.
  acVersion: data.APP_META.acVersion,
  acSlug: data.APP_META.acVersion.replace(/\s+/g, ""),
  categories,
  workflows,
  guidance: GUIDANCE_SECTIONS,
  lessons,
};

const dest = path.join(__dirname, "nav-data.json");
fs.writeFileSync(dest, JSON.stringify(out, null, 2) + "\n");
console.log(`wrote ${dest}`);
console.log(
  `categories=${categories.length} bundles=${categories.reduce((n, c) => n + c.bundles.length, 0)} workflows=${workflows.length} guidance=${GUIDANCE_SECTIONS.length} lessons=${lessons.length}`
);
