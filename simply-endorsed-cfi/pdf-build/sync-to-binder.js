"use strict";

/**
 * sync-to-binder.js — push the two binder-consumed artifacts of this pipeline
 * into the CFI Binder (FORE) repo and record a sha256 manifest of the copies.
 *
 * The binder keeps two manual byte-copies of SUAREZ outputs:
 *   1. 00_source-library/endorsements/Simply-Endorsed-CFI-AC61-65K.pdf
 *        ← the pristine pre-stamp base PDF written by render-pdf.js
 *   2. 40_tooling/build-scripts/endorse_nav_data.json
 *        ← this directory's nav-data.json (written by make-nav-data.js)
 *
 * This script performs both copies, verifies each destination hashes
 * identically to its source, and writes dist/sync-manifest.json recording
 * the sha256 of every source/destination pair. The binder's
 * 40_tooling/build-scripts/audit_sportys_links.py reads that manifest and
 * fails loudly when a copy drifts from the recorded SUAREZ source.
 *
 * Refuses to run when the base PDF is missing or older than dist/book.html
 * (i.e. book.html was rebuilt without re-rendering the PDF — sync would
 * push a stale artifact).
 *
 * Usage:  node sync-to-binder.js [--fore-repo <path>] [--base-pdf <path>]
 * Exit code 0 on success, 1 on any refusal or copy/hash failure.
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = __dirname;
const DIST_DIR = path.join(ROOT, "dist");
const BOOK_HTML = path.join(DIST_DIR, "book.html");
const NAV_DATA = path.join(ROOT, "nav-data.json");
const MANIFEST_PATH = path.join(DIST_DIR, "sync-manifest.json");

// Same OUT_DIR as render-pdf.js (the base PDF never enters this repo).
const DEFAULT_BASE_PDF =
  "/Users/diegosuarez/Desktop/VIBE CODING PROJECTS/SUAREZ.CFI/output/simply-endorsed-cfi-pdf/Simply-Endorsed-CFI-AC61-65K.base.pdf";
const DEFAULT_FORE_REPO =
  "/Users/diegosuarez/Desktop/VIBE CODING PROJECTS/Foreflight Document EDITOR";

/* ── Args ──────────────────────────────────────────────────────────────── */

function parseArgs(argv) {
  const opts = { foreRepo: DEFAULT_FORE_REPO, basePdf: DEFAULT_BASE_PDF };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = () => {
      if (i + 1 >= argv.length) die(`missing value for ${arg}`);
      return argv[++i];
    };
    if (arg === "--fore-repo") opts.foreRepo = next();
    else if (arg.startsWith("--fore-repo=")) opts.foreRepo = arg.slice("--fore-repo=".length);
    else if (arg === "--base-pdf") opts.basePdf = next();
    else if (arg.startsWith("--base-pdf=")) opts.basePdf = arg.slice("--base-pdf=".length);
    else die(`unknown argument: ${arg}`);
  }
  opts.foreRepo = path.resolve(opts.foreRepo);
  opts.basePdf = path.resolve(opts.basePdf);
  return opts;
}

function die(msg) {
  console.error(`[sync] ERROR: ${msg}`);
  process.exit(1);
}

function sha256(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

/* ── Main ──────────────────────────────────────────────────────────────── */

function main() {
  const opts = parseArgs(process.argv.slice(2));

  const PAIRS = [
    {
      key: "base-pdf",
      src: opts.basePdf,
      destRel: "00_source-library/endorsements/Simply-Endorsed-CFI-AC61-65K.pdf",
    },
    {
      key: "nav-data",
      src: NAV_DATA,
      destRel: "40_tooling/build-scripts/endorse_nav_data.json",
    },
  ];

  // Validate the FORE repo target (typo protection: both destinations are
  // long-lived paths that must already exist in a real binder checkout).
  if (!fs.statSync(opts.foreRepo, { throwIfNoEntry: false })?.isDirectory()) {
    die(`FORE repo not found: ${opts.foreRepo} (pass --fore-repo <path>)`);
  }
  for (const pair of PAIRS) {
    const destDir = path.join(opts.foreRepo, path.dirname(pair.destRel));
    if (!fs.statSync(destDir, { throwIfNoEntry: false })?.isDirectory()) {
      die(`FORE repo is missing ${path.dirname(pair.destRel)}/ — wrong --fore-repo?`);
    }
  }

  // Validate sources.
  if (!fs.statSync(BOOK_HTML, { throwIfNoEntry: false })?.isFile()) {
    die(`dist/book.html missing — run \`node build.js\` first`);
  }
  for (const pair of PAIRS) {
    if (!fs.statSync(pair.src, { throwIfNoEntry: false })?.isFile()) {
      die(`source missing: ${pair.src}` +
        (pair.key === "base-pdf" ? " — run \`node render-pdf.js\` first" : ""));
    }
  }

  // Freshness gate: a rebuilt book.html means the rendered PDF is stale.
  const baseMtime = fs.statSync(opts.basePdf).mtimeMs;
  const bookMtime = fs.statSync(BOOK_HTML).mtimeMs;
  if (baseMtime < bookMtime) {
    die(
      `stale base PDF: ${opts.basePdf}\n` +
      `  is older than dist/book.html — re-run \`node render-pdf.js\`, then sync again`
    );
  }

  // Copy + hash-verify each pair.
  const manifestPairs = [];
  for (const pair of PAIRS) {
    const dest = path.join(opts.foreRepo, pair.destRel);
    fs.copyFileSync(pair.src, dest);
    const sourceSha256 = sha256(pair.src);
    const destSha256 = sha256(dest);
    if (sourceSha256 !== destSha256) {
      die(`copy verification failed for ${pair.key}: ${dest} hash != source hash`);
    }
    const bytes = fs.statSync(pair.src).size;
    console.log(`[sync] ${pair.key}: ${pair.destRel}  sha256 ${sourceSha256.slice(0, 12)}…  (${bytes} bytes)`);
    manifestPairs.push({
      key: pair.key,
      sourcePath: pair.src,
      destPath: pair.destRel, // repo-relative; the binder audit resolves it against its own root
      bytes,
      sourceSha256,
      destSha256,
    });
  }

  const manifest = {
    version: 1,
    generatedBy: "simply-endorsed-cfi/pdf-build/sync-to-binder.js",
    generatedAt: new Date().toISOString(),
    foreRepo: opts.foreRepo,
    pairs: manifestPairs,
  };
  fs.mkdirSync(DIST_DIR, { recursive: true });
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n", "utf8");
  console.log(`[sync] wrote ${path.relative(ROOT, MANIFEST_PATH)} (${manifestPairs.length} pairs)`);
  console.log("[sync] done");
}

main();
