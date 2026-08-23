"use strict";

/**
 * build.js — assembles dist/book.html from the section registry.
 *
 * Reads sections/*.js in filename order. Each section module must export:
 *   { title: string, render(data, helpers) → htmlString }
 *
 * `data`     — the object returned by lib/load-data.js loadData()
 * `helpers`  — every export of lib/render.js + lib/theme.js maps + cfrLink
 *              + endorsementById (see CONTRACT.md for the full list)
 *
 * Sections are independent: build order never changes a section's output,
 * and adding a new NN-name.js file to sections/ is all that is needed.
 *
 * Usage:  node build.js
 * Exit code is non-zero if any sanity check or section render fails.
 */

const fs = require("fs");
const path = require("path");

const { getData, cfrLink, endorsementById } = require("./lib/load-data");
const theme = require("./lib/theme");
const render = require("./lib/render");

const ROOT = __dirname;
const SECTIONS_DIR = path.join(ROOT, "sections");
const STYLES_PATH = path.join(ROOT, "styles", "pdf.css");
const DIST_DIR = path.join(ROOT, "dist");
const OUT_PATH = path.join(DIST_DIR, "book.html");

/* ── Sanity checks on the data ─────────────────────────────────────────── */

function sanityChecks(data) {
  const endorsements = data.ENDORSEMENTS.length;
  const categories = data.BROWSE_STRUCTURE.length;
  const sampleLink = cfrLink("14 CFR § 61.87(n)");

  console.log(`[build] endorsements loaded: ${endorsements}`);
  console.log(`[build] categories loaded:   ${categories}`);
  console.log(`[build] cfrLink("14 CFR § 61.87(n)") → ${sampleLink}`);

  const problems = [];
  if (endorsements !== 96) problems.push(`expected 96 endorsements, got ${endorsements}`);
  if (categories !== 13) problems.push(`expected 13 categories, got ${categories}`);
  if (
    sampleLink !==
    "https://www.ecfr.gov/current/title-14/part-61/section-61.87"
  ) {
    problems.push(`unexpected cfrLink result: ${sampleLink}`);
  }
  if (!endorsementById.get("A.6")) problems.push("endorsementById lookup for A.6 failed");

  if (problems.length) {
    for (const p of problems) console.error(`[build] SANITY CHECK FAILED: ${p}`);
    process.exit(1);
  }
}

/* ── Section registry ──────────────────────────────────────────────────── */

function loadSections() {
  const files = fs
    .readdirSync(SECTIONS_DIR)
    .filter((f) => f.endsWith(".js"))
    .sort();

  return files.map((f) => {
    const mod = require(path.join(SECTIONS_DIR, f));
    if (!mod || typeof mod.render !== "function" || typeof mod.title !== "string") {
      throw new Error(
        `[build] sections/${f} must export { title: string, render(data, helpers) }`
      );
    }
    return { file: f, title: mod.title, render: mod.render };
  });
}

/* ── Main ──────────────────────────────────────────────────────────────── */

function main() {
  const data = getData();

  sanityChecks(data);

  // helpers handed to every section: render functions + theme maps + lookups.
  const helpers = {
    ...render,
    ...theme,
    cfrLink,
    endorsementById,
    // Pre-bind the AC source URL/version so cards link out correctly.
    renderEndorsementCard: (e, opts) =>
      render.renderEndorsementCard(e, {
        sourceUrl: data.APP_META.sourceUrl,
        acVersion: data.APP_META.acVersion,
        ...opts,
      }),
  };

  const sections = loadSections();
  console.log(
    `[build] sections: ${sections.map((s) => `${s.file} (“${s.title}”)`).join(", ")}`
  );

  const bodyParts = sections.map((s, i) => {
    try {
      return `<!-- section: ${s.file} — ${s.title} -->\n` + s.render(data, helpers);
    } catch (err) {
      throw new Error(`[build] render failed in sections/${s.file}: ${err.message}\n${err.stack}`);
    }
  });

  const css = fs.readFileSync(STYLES_PATH, "utf8");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>Simply Endorsed CFI — AC 61-65K Endorsement Reference</title>
<style>
${css}
</style>
</head>
<body>
${bodyParts.join("\n")}
</body>
</html>
`;

  fs.mkdirSync(DIST_DIR, { recursive: true });
  fs.writeFileSync(OUT_PATH, html, "utf8");

  const kb = (Buffer.byteLength(html, "utf8") / 1024).toFixed(1);
  console.log(`[build] wrote ${path.relative(ROOT, OUT_PATH)} (${kb} KB), 0 errors`);
}

main();
