"use strict";

/**
 * test-render.js — renders one full endorsement card (A.6, student-pilot
 * amber theme) plus its category banner and a bundle header into
 * dist/preview-card.html so the output can be eyeballed in a browser or
 * diffed in review. Exits non-zero if required fields are missing.
 *
 * Usage:  node test-render.js
 */

const fs = require("fs");
const path = require("path");

const { getData, endorsementById } = require("./lib/load-data");
const render = require("./lib/render");
const theme = require("./lib/theme");

const DIST_DIR = path.join(__dirname, "dist");
const OUT_PATH = path.join(DIST_DIR, "preview-card.html");

function main() {
  const data = getData();
  const e = endorsementById.get("A.6");
  if (!e) {
    console.error("[test-render] endorsement A.6 not found");
    process.exit(1);
  }

  const bundle = data.BROWSE_STRUCTURE.find((c) => c.categoryId === "student-pilot")
    .subcategories.find((b) => b.id === "first-solo");

  const cardHtml = render.renderEndorsementCard(e, {
    sourceUrl: data.APP_META.sourceUrl,
    acVersion: data.APP_META.acVersion,
    relatedHtml: `See also <a class="internal" href="#A-7">A.7 — Solo flight (each additional 90-day period)</a>`,
  });

  const css = fs.readFileSync(path.join(__dirname, "styles", "pdf.css"), "utf8");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>Preview — endorsement card A.6</title>
<style>
${css}
</style>
</head>
<body>
${render.renderCategoryHeader(e.category, data.ENDORSEMENTS.filter((x) => x.category === e.category).length)}
${render.renderBundleHeader(bundle, e.category)}
${cardHtml}
</body>
</html>
`;

  fs.mkdirSync(DIST_DIR, { recursive: true });
  fs.writeFileSync(OUT_PATH, html, "utf8");

  // Verify the fields the card contract promises are present in the output.
  const checks = {
    "anchor id A-6": 'id="A-6"',
    "id pill text": ">A.6<",
    "title": e.title,
    "student-pilot amber accent": "--cat-accent:#f59e0b",
    "soft bg var": "--cat-soft:#fef7eb",
    "line var": "--cat-line:#fde7c2",
    "ink var": "--cat-ink:#b37000",
    "CFR chip link": "https://www.ecfr.gov/current/title-14/part-61/section-61.87",
    "verbatim block": 'class="verbatim"',
    "verbatim text (excerpt)": e.verbatimText.slice(0, 40),
    "explanation bullet": explanationFirst(e),
    "signer badge": theme.WHO_ISSUES_LABELS[e.whoIssues],
    "validity badge": theme.EXPIRATION_LABELS[e.expiration],
    "tag chip": (e.tags[0] || ""),
    "AC PDF link": data.APP_META.sourceUrl,
    "related slot": "ec-related",
    "category banner anchor": 'id="cat-student-pilot"',
    "bundle header anchor": 'id="bundle-first-solo"',
    "bundle featured badge": "Featured bundle",
  };

  let failed = 0;
  for (const [label, needle] of Object.entries(checks)) {
    const ok = needle && html.includes(needle);
    console.log(`[test-render] ${ok ? "ok  " : "FAIL"} ${label}${ok ? "" : ` (missing: ${needle})`}`);
    if (!ok) failed += 1;
  }

  console.log(
    `[test-render] wrote ${path.relative(__dirname, OUT_PATH)} — ${
      failed === 0 ? "all checks passed" : failed + " checks FAILED"
    }`
  );
  if (failed) process.exit(1);
}

function explanationFirst(e) {
  return render.explanationBullets(e.explanation)[0] || "";
}

main();
