"use strict";

/**
 * render-pdf.js — render dist/book.html to the final PDF and capture QA
 * screenshots with Playwright/Chromium.
 *
 * Playwright is resolved from the existing npx cache install (no download);
 * the Chromium browser binary comes from ~/Library/Caches/ms-playwright.
 *
 * Usage:  node render-pdf.js
 * Env:    SIMPLY_ENDORSED_OUT overrides the output PDF path (see config.js).
 */

const fs = require("fs");
const path = require("path");

/* ── Playwright resolution (existing installs only, no downloads) ──────── */
const PW_CANDIDATES = [
  "/Users/diegosuarez/.npm/_npx/e41f203b7505f1fb/node_modules/playwright",
  "/Users/diegosuarez/.npm/_npx/705bc6b22212b352/node_modules/playwright",
  "playwright",
];
let playwright = null;
let pwSource = "";
for (const cand of PW_CANDIDATES) {
  try {
    playwright = require(cand);
    pwSource = cand;
    break;
  } catch {
    /* try next */
  }
}
if (!playwright) {
  console.error("Could not require playwright from any known location.");
  process.exit(1);
}
console.log(`[render] playwright from: ${pwSource}`);

/* ── Paths ─────────────────────────────────────────────────────────────── */
const BOOK = path.join(__dirname, "dist", "book.html");
// Shared config (config.json; SIMPLY_ENDORSED_OUT env var overrides the
// output PDF path for scratch runs). BASE_PATH is the pristine pre-stamp
// copy consumed by the CFI Binder V34 merge pipeline (the binder stamps its
// own chrome; stamp_nav.py must never see this file).
const { QA_DIR, PDF_PATH, BASE_PATH } = require("./config");
fs.mkdirSync(QA_DIR, { recursive: true });

/* Screenshot targets: [filename, selector, mode]
 * mode "view"  → scroll selector to top, capture the viewport (page-ish shot)
 * mode "elem"  → element screenshot (stitched full element)                 */
const SHOTS = [
  ["01-cover.png", ".cover", "elem"],
  ["02-howto-legend.png", ".fm-intro", "view"],
  ["03-master-toc.png", ".toc-cols", "view"],
  ["04-cat-student-pilot.png", "#cat-student-pilot", "view"],
  ["05-cat-flight-instructor.png", "#cat-flight-instructor", "view"],
  ["06-workflow.png", "#wf-pre-solo", "view"],
  ["07-journey.png", "#journey", "view"],
  ["08-quickref.png", "#quickref", "view"],
  ["09-flashcards.png", "#flashcards", "view"],
  ["10-appendix.png", "#appendix", "view"],
];

async function main() {
  const browser = await playwright.chromium.launch();
  console.log("[render] chromium launched");

  /* ── PDF ────────────────────────────────────────────────────────────── */
  const page = await browser.newPage();
  await page.goto("file://" + BOOK, { waitUntil: "networkidle" });
  console.log("[render] book.html loaded");

  const pdfOpts = {
    path: PDF_PATH,
    format: "Letter",
    preferCSSPageSize: true, // @page { size: Letter; margin: 0.75in 0.95in 0.8in 0.7in }
    printBackground: true,
    tagged: true,
    outline: true,
    // No displayHeaderFooter/headerTemplate/footerTemplate on purpose: the
    // navigation-chrome stamping pass draws the bottom dock (with page
    // numbers) instead. No `margin` here either: the CSS @page margins
    // apply, and the 0.95in right margin is the gutter for the rail overlay.
  };
  try {
    await page.pdf(pdfOpts);
  } catch (err) {
    if (/outline/i.test(String(err && err.message))) {
      console.warn(`[render] outline option unsupported (${err.message}); retrying without it`);
      delete pdfOpts.outline;
      await page.pdf(pdfOpts);
    } else {
      throw err;
    }
  }
  const mb = (fs.statSync(PDF_PATH).size / (1024 * 1024)).toFixed(2);
  console.log(`[render] wrote ${PDF_PATH} (${mb} MB)`);
  fs.copyFileSync(PDF_PATH, BASE_PATH);
  console.log(`[render] wrote clean base copy ${BASE_PATH}`);

  /* ── QA screenshots ─────────────────────────────────────────────────── */
  const shotPage = await browser.newPage({
    viewport: { width: 1100, height: 1450 }, // ~Letter proportions at 1100px wide
    deviceScaleFactor: 1,
  });
  await shotPage.goto("file://" + BOOK, { waitUntil: "networkidle" });
  await shotPage.emulateMedia({ media: "screen" });

  for (const [file, selector, mode] of SHOTS) {
    const out = path.join(QA_DIR, file);
    const loc = shotPage.locator(selector).first();
    if (!(await loc.count())) {
      console.warn(`[shots] MISSING selector ${selector} for ${file}`);
      continue;
    }
    if (mode === "elem") {
      await loc.screenshot({ path: out });
    } else {
      await loc.scrollIntoViewIfNeeded();
      await shotPage.waitForTimeout(120);
      await shotPage.screenshot({ path: out });
    }
    console.log(`[shots] ${file}`);
  }

  await browser.close();
  console.log("[render] done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
