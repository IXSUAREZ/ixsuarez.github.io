"use strict";

/**
 * qa-markers.js — audits the invisible navigation page markers emitted into
 * dist/book.html as `<span class="pgm">ZZPGM|<key>|ZZ</span>`. The later
 * navigation-chrome stamping pass (Agent B) keys its per-page overlay off
 * these markers, so the inventory must be exact.
 *
 * Expected inventory (all counts derived from the data files — they move
 * with AC revisions — except the structural cover/toc/part markers):
 *   cover:end ×1, toc:toc ×1, part:part-1 / part:part-2 / part:part-3 ×1 each
 *   cat:<slug> — one per BROWSE_STRUCTURE category
 *   bundle:<id> — one per BROWSE_STRUCTURE subcategory
 *   wf:<id> — one per featured/pre-solo BROWSE_STRUCTURE bundle, plus wf:wf-index
 *   gs:<id> — journey, scenarios, quickref, cfi-career, flashcards,
 *             lesson-plan, appendix (structural) + one per GUIDANCE_SECTIONS lesson
 *
 * Usage:  node qa-markers.js     (run after `node build.js`)
 * Exit code 0 when every check passes, 1 otherwise.
 */

const fs = require("fs");
const path = require("path");
const { getData } = require("./lib/load-data");

const BOOK = path.join(__dirname, "dist", "book.html");
const html = fs.readFileSync(BOOK, "utf8");

const failures = [];
function fail(msg) {
  failures.push(msg);
  console.error(`  FAIL  ${msg}`);
}
function pass(msg) {
  console.log(`  ok    ${msg}`);
}

/* ── Extract tokens ──────────────────────────────────────────────────── */
console.log("\n[1] Extract ZZPGM markers");
const tokens = [...html.matchAll(/ZZPGM\|([^|]+)\|ZZ/g)].map((m) => m[1]);
if (!tokens.length) {
  fail("no ZZPGM|…|ZZ markers found in dist/book.html");
  report(failures);
}
const counts = new Map();
for (const t of tokens) counts.set(t, (counts.get(t) || 0) + 1);
pass(`${tokens.length} marker tokens found (${counts.size} distinct keys)`);

/* ── 2. No duplicates ────────────────────────────────────────────────── */
console.log("\n[2] Duplicate marker keys");
{
  const dupes = [...counts.entries()].filter(([, n]) => n > 1);
  if (dupes.length) {
    fail(`duplicate marker keys: ${dupes.map(([k, n]) => `${k}×${n}`).join(", ")}`);
  } else {
    pass("every marker key appears exactly once");
  }
}

/* ── 3. Expected inventory ───────────────────────────────────────────── */
console.log("\n[3] Expected marker inventory");
{
  const data = getData();

  const expectOne = [
    "cover:end",
    "toc:toc",
    "part:part-1",
    "part:part-2",
    "part:part-3",
    "wf:wf-index",
    "gs:journey",
    "gs:scenarios",
    "gs:quickref",
    "gs:cfi-career",
    "gs:flashcards",
    "gs:lesson-plan",
    "gs:appendix",
  ];
  for (const c of data.BROWSE_STRUCTURE) expectOne.push(`cat:${c.categoryId}`);
  for (const c of data.BROWSE_STRUCTURE) {
    for (const b of c.subcategories) expectOne.push(`bundle:${b.id}`);
  }
  for (const c of data.BROWSE_STRUCTURE) {
    for (const b of c.subcategories) {
      if (b.featured || b.contentRenderer === "pre-solo") expectOne.push(`wf:${b.id}`);
    }
  }
  for (const g of data.GUIDANCE_SECTIONS) expectOne.push(`gs:${g.id}`);

  const missing = expectOne.filter((k) => !counts.has(k));
  const unexpected = [...counts.keys()].filter((k) => !expectOne.includes(k));
  if (missing.length) fail(`missing markers: ${missing.join(", ")}`);
  if (unexpected.length) fail(`unexpected markers: ${unexpected.join(", ")}`);
  if (!missing.length && !unexpected.length) {
    pass(`all ${expectOne.length} expected markers present, none unexpected`);
  }
}

/* ── 4. Group counts ─────────────────────────────────────────────────── */
console.log("\n[4] Group counts");
{
  const data = getData();
  // Derived from the data files (they move with AC revisions) instead of
  // hardcoded counts. cover:/toc:/part: stay constant — they are
  // structural to the section builders, as are the 7 top-level Part III
  // sections and wf-index.
  const PART_III_TOP_LEVEL = 7; // journey, scenarios, quickref, cfi-career, flashcards, lesson-plan, appendix
  const wfPages =
    data.BROWSE_STRUCTURE.reduce(
      (n, c) =>
        n +
        c.subcategories.filter(
          (b) => b.featured || b.contentRenderer === "pre-solo"
        ).length,
      0
    ) + 1; // + wf-index
  const groups = [
    ["cover:", 1],
    ["toc:", 1],
    ["part:", 3],
    ["cat:", data.BROWSE_STRUCTURE.length],
    ["bundle:", data.BROWSE_STRUCTURE.reduce((n, c) => n + c.subcategories.length, 0)],
    ["wf:", wfPages],
    ["gs:", PART_III_TOP_LEVEL + data.GUIDANCE_SECTIONS.length],
  ];
  const groupCount = (prefix) =>
    [...counts.keys()].filter((k) => k.startsWith(prefix)).length;
  let total = 0;
  for (const [prefix, expected] of groups) {
    const n = groupCount(prefix);
    total += n;
    if (n !== expected) fail(`${prefix}* count: expected ${expected}, got ${n}`);
    else console.log(`  ok    ${prefix}* = ${n}`);
  }
  const expectedTotal = groups.reduce((s, [, e]) => s + e, 0);
  if (tokens.length !== expectedTotal) {
    fail(`total markers: expected ${expectedTotal}, got ${tokens.length}`);
  } else {
    pass(`total markers = ${total}`);
  }
}

/* ── Summary ─────────────────────────────────────────────────────────── */
function report(fails) {
  console.log("\n──────────────────────────────");
  if (fails.length) {
    console.error(`\nMARKER QA FAILED: ${fails.length} problem(s)`);
    process.exit(1);
  }
  console.log("\nMARKER QA PASSED — all checks green");
}
report(failures);
