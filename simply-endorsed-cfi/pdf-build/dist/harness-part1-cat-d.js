"use strict";

/* Throwaway isolated harness for sections/13-part1-cat-d.js.
 * Mirrors the helper wiring in build.js exactly. */

const fs = require("fs");
const path = require("path");

const { getData, cfrLink, endorsementById } = require("../lib/load-data");
const theme = require("../lib/theme");
const render = require("../lib/render");
const section = require("../sections/13-part1-cat-d.js");

const data = getData();
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
const out = path.join(__dirname, "preview-part1-cat-d.html");
fs.writeFileSync(out, html, "utf8");

console.log("section title:", section.title);
console.log("html length:", html.length, "chars →", out);

// Anchor audit: ids produced (must be unique) and internal hrefs emitted.
const ids = [...html.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
const dupIds = ids.filter((x, i) => ids.indexOf(x) !== i);
const hrefs = [
  ...new Set([...html.matchAll(/class="internal[^"]*" href="#([^"]+)"/g)].map((m) => m[1])),
].sort();
console.log("ids produced:", ids.length, "| unique:", new Set(ids).size);
if (dupIds.length) console.log("DUPLICATE IDS:", [...new Set(dupIds)]);
console.log("internal hrefs:", hrefs.join(", "));

// Spot checks.
const cardCount = (html.match(/class="endorsement-card"/g) || []).length;
const bannerCount = (html.match(/class="category-banner"/g) || []).length;
const bundleCount = (html.match(/class="bundle-header"/g) || []).length;
const suppCount = (html.match(/class="p1cd-supp"/g) || []).length;
const xrefCount = (html.match(/class="p1cd-xref"/g) || []).length;
const sfarPlainChips = (html.match(/<span class="chip cfr-chip">SFAR 73/g) || []).length;
const sfarLinked = (html.match(/<a class="chip cfr-chip external"[^>]*>SFAR 73/g) || []).length;
const relatedSlots = (html.match(/p1cd-related-label/g) || []).length;
console.log(
  `cards: ${cardCount} | banners: ${bannerCount} | bundle-headers: ${bundleCount} | ` +
    `supplemental rows: ${suppCount} | xref lines: ${xrefCount} | related slots: ${relatedSlots}`
);
console.log(
  `SFAR chips plain: ${sfarPlainChips} | SFAR chips linked (must be 0): ${sfarLinked}`
);
