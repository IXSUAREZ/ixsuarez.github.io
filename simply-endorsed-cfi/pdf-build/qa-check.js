"use strict";

/**
 * qa-check.js — structural QA for dist/book.html.
 *
 * Checks:
 *  1. No duplicate id="…" anywhere in the document.
 *  2. Zero broken internal links: every href="#…" has a matching id.
 *  3. All expected anchors present (counts derived from the data files):
 *       - endorsement anchors      A-<n>      (one per ENDORSEMENTS item)
 *       - category anchors         cat-<slug> (one per BROWSE_STRUCTURE category)
 *       - part-1 / part-2 / part-3
 *       - featured workflow anchors wf-<id>   (derived: featured or pre-solo
 *         BROWSE_STRUCTURE bundles — same rule as make-nav-data.js)
 *       - Part III guidance anchors (journey, scenarios, quickref, cfi-career,
 *         flashcards, lesson-plan, appendix — structural to the section files)
 *       - guidance lesson anchors  gs-<id>    (one per GUIDANCE_SECTIONS item)
 *  4. External links: ecfr.gov count > 0; FAA AC source links present.
 *  5. No "undefined" / "null" / "NaN" / "[object Object]" leakage in text.
 *
 * Usage:  node qa-check.js
 * Exit code 0 when every check passes, 1 otherwise.
 */

const fs = require("fs");
const path = require("path");
const { getData, endorsementById } = require("./lib/load-data");

const BOOK = path.join(__dirname, "dist", "book.html");
const html = fs.readFileSync(BOOK, "utf8");

const failures = [];
const notes = [];
function fail(msg) {
  failures.push(msg);
  console.error(`  FAIL  ${msg}`);
}
function pass(msg) {
  console.log(`  ok    ${msg}`);
}

/* ── 1. Duplicate ids ──────────────────────────────────────────────────── */
console.log("\n[1] Duplicate id check");
{
  const ids = [...html.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
  const counts = new Map();
  for (const id of ids) counts.set(id, (counts.get(id) || 0) + 1);
  const dupes = [...counts.entries()].filter(([, n]) => n > 1);
  if (dupes.length) fail(`duplicate ids: ${dupes.map(([id, n]) => `${id}×${n}`).join(", ")}`);
  else pass(`${ids.length} ids, all unique`);
}

/* ── 2. Broken internal links ──────────────────────────────────────────── */
console.log("\n[2] Internal link integrity");
{
  const idSet = new Set([...html.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]));
  const hrefs = [...html.matchAll(/ href="#([^"]+)"/g)].map((m) => m[1]);
  const broken = [...new Set(hrefs.filter((h) => !idSet.has(h)))];
  if (broken.length) fail(`${broken.length} broken internal link targets: ${broken.join(", ")}`);
  else pass(`${hrefs.length} internal links checked, 0 broken`);
  notes.push(`internal links checked: ${hrefs.length}`);
}

/* ── 3. Expected anchors ───────────────────────────────────────────────── */
console.log("\n[3] Required anchors");
{
  const idSet = new Set([...html.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]));
  const data = getData();

  const expected = [];
  // endorsement anchors
  for (const e of data.ENDORSEMENTS) {
    expected.push(`A-${e.id.slice(2)}`); // "A.6" → "A-6"
  }
  // category anchors
  for (const c of data.BROWSE_STRUCTURE) expected.push(`cat-${c.categoryId}`);
  // parts
  expected.push("part-1", "part-2", "part-3");
  // featured workflow anchors — derived from BROWSE_STRUCTURE (featured or
  // pre-solo bundles), the same rule make-nav-data.js / qa-markers.js use
  const wfIds = [];
  for (const c of data.BROWSE_STRUCTURE) {
    for (const b of c.subcategories) {
      if (b.featured || b.contentRenderer === "pre-solo") wfIds.push(b.id);
    }
  }
  for (const id of wfIds) expected.push(`wf-${id}`);
  // Part III guidance anchors
  expected.push(
    "journey",
    "scenarios",
    "quickref",
    "cfi-career",
    "flashcards",
    "lesson-plan",
    "appendix"
  );
  // guidance lesson anchors
  for (const g of data.GUIDANCE_SECTIONS) expected.push(`gs-${g.id}`);

  const missing = expected.filter((a) => !idSet.has(a));
  const groups = {
    endorsements: data.ENDORSEMENTS.length,
    categories: data.BROWSE_STRUCTURE.length,
    workflows: wfIds.length,
    "gs-* lessons": data.GUIDANCE_SECTIONS.length,
  };
  if (missing.length) {
    fail(`missing ${missing.length} required anchors: ${missing.join(", ")}`);
  } else {
    pass(
      `all ${expected.length} required anchors present ` +
        `(${groups.endorsements} A-*, ${groups.categories} cat-*, 3 parts, ${groups.workflows} wf-*, 7 Part III, ${groups["gs-* lessons"]} gs-*)`
    );
  }
  // sanity: endorsementById still resolves (last endorsement in the data —
  // derived, not hardcoded, so the check survives AC revision count moves)
  const lastId = data.ENDORSEMENTS[data.ENDORSEMENTS.length - 1].id;
  if (!endorsementById.get(lastId)) fail(`endorsementById lookup for ${lastId} failed`);
}

/* ── 4. External links ─────────────────────────────────────────────────── */
console.log("\n[4] External links");
{
  const ext = [...html.matchAll(/ href="(https?:\/\/[^"]+)"/g)].map((m) => m[1]);
  const ecfr = ext.filter((u) => u.includes("ecfr.gov"));
  const faa = ext.filter((u) => u.includes("faa.gov"));
  if (!ecfr.length) fail("no ecfr.gov links found");
  else pass(`${ecfr.length} eCFR links`);
  if (!faa.length) fail("no faa.gov links found (AC source links expected)");
  else pass(`${faa.length} faa.gov links (AC source)`);
  notes.push(`external links: ${ext.length} total, ${ecfr.length} eCFR, ${faa.length} faa.gov`);
}

/* ── 5. Leakage check ──────────────────────────────────────────────────── */
console.log("\n[5] Text leakage (undefined/null/NaN/[object Object])");
{
  // strip tags so markup attributes don't false-positive, then scan words
  const text = html.replace(/<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ");
  const patterns = [/\bundefined\b/, /\bnull\b/, /\bNaN\b/, /\[object Object\]/];
  let leaked = 0;
  for (const re of patterns) {
    const m = text.match(re);
    if (m) {
      leaked++;
      const at = Math.max(0, m.index - 60);
      fail(`found "${m[0]}" in text near: …${text.slice(at, m.index + 60).trim()}…`);
    }
  }
  if (!leaked) pass("no leakage");
}

/* ── Summary ───────────────────────────────────────────────────────────── */
console.log("\n──────────────────────────────");
for (const n of notes) console.log(`  ${n}`);
if (failures.length) {
  console.error(`\nQA FAILED: ${failures.length} problem(s)`);
  process.exit(1);
}
console.log("\nQA PASSED — all checks green");
