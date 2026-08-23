"use strict";

/**
 * dist/harness-part1-cat-b.js — throwaway isolated harness for
 * sections/11-part1-cat-b.js. Mirrors the helper wiring in build.js
 * (which cannot be required without running the whole build), renders the
 * section, writes dist/preview-part1-cat-b.html, and prints sanity stats.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const { getData, cfrLink, endorsementById } = require(path.join(ROOT, "lib", "load-data"));
const theme = require(path.join(ROOT, "lib", "theme"));
const render = require(path.join(ROOT, "lib", "render"));
const section = require(path.join(ROOT, "sections", "11-part1-cat-b.js"));

const data = getData();

// Exact copy of build.js helper wiring.
const helpers = {
  ...render,
  ...theme,
  cfrLink,
  endorsementById,
  renderEndorsementCard: (e, opts) =>
    render.renderEndorsementCard(e, {
      sourceUrl: data.APP_META.sourceUrl,
      acVersion: data.APP_META.acVersion,
      ...opts,
    }),
};

const html = section.render(data, helpers);

const css = fs.readFileSync(path.join(ROOT, "styles", "pdf.css"), "utf8");
const doc = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>Preview — ${section.title}</title>
<style>
${css}
</style>
</head>
<body>
${html}
</body>
</html>
`;

const outPath = path.join(__dirname, "preview-part1-cat-b.html");
fs.writeFileSync(outPath, doc, "utf8");

/* ── Sanity stats ────────────────────────────────────────────────────── */
const ids = [...html.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
const dupeIds = [...new Set(ids.filter((v, i, a) => a.indexOf(v) !== i))];
const hrefs = [...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);
const uniqueHrefs = [...new Set(hrefs)].sort();
const cardCount = (html.match(/class="endorsement-card"/g) || []).length;
const bannerCount = (html.match(/class="category-banner"/g) || []).length;
const bundleCount = (html.match(/class="bundle-header"/g) || []).length;
const suppLabelCount = (html.match(/p1b-supp-label/g) || []).length;
const relatedChipCount = (html.match(/p1b-rel-label/g) || []).length;

console.log(`[harness] section title:        ${section.title}`);
console.log(`[harness] html length:          ${html.length}`);
console.log(`[harness] category banners:     ${bannerCount}`);
console.log(`[harness] bundle headers:       ${bundleCount}`);
console.log(`[harness] supplemental labels:  ${suppLabelCount}`);
console.log(`[harness] endorsement cards:    ${cardCount}`);
console.log(`[harness] cards with related:   ${relatedChipCount}`);
console.log(`[harness] id= count:            ${ids.length}`);
console.log(`[harness] duplicate ids:        ${dupeIds.length ? dupeIds.join(", ") : "none"}`);
console.log(`[harness] unique #hrefs:        ${uniqueHrefs.length}`);

// Every internal href must resolve to an id emitted by this file or by a
// sibling Part I chapter (A-1, A-2 → cat-a; A-78 → cat-c).
const ownIds = new Set(ids);
const externalToFile = uniqueHrefs.filter((h) => !ownIds.has(h));
console.log(`[harness] hrefs not in my ids:  ${externalToFile.length ? externalToFile.join(", ") : "none"}`);

console.log(`[harness] wrote ${outPath}`);
if (dupeIds.length) {
  console.error("[harness] FAIL: duplicate id anchors in output");
  process.exit(1);
}
console.log("[harness] OK");
