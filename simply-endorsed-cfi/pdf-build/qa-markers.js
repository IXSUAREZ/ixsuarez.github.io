"use strict";

/**
 * qa-markers.js — audits the invisible navigation page markers emitted into
 * dist/book.html as `<span class="pgm">ZZPGM|<key>|ZZ</span>`. The later
 * navigation-chrome stamping pass (Agent B) keys its per-page overlay off
 * these markers, so the inventory must be exact.
 *
 * Expected inventory:
 *   cover:end ×1, toc:toc ×1, part:part-1 / part:part-2 / part:part-3 ×1 each
 *   cat:<slug> ×13   (one per BROWSE_STRUCTURE category)
 *   bundle:<id> ×71  (one per BROWSE_STRUCTURE subcategory)
 *   wf:<id> ×10      (9 flow pages: featured bundles + pre-solo, plus wf:wf-index)
 *   gs:<id> ×17      (journey, scenarios, quickref, cfi-career, flashcards,
 *                     lesson-plan, appendix + the 10 GUIDANCE_SECTIONS lessons)
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
  const groupCount = (prefix) =>
    [...counts.keys()].filter((k) => k.startsWith(prefix)).length;
  const groups = [
    ["cover:", 1],
    ["toc:", 1],
    ["part:", 3],
    ["cat:", 13],
    ["bundle:", 71],
    ["wf:", 10],
    ["gs:", 17],
  ];
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
