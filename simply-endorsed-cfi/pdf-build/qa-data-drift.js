"use strict";

/**
 * qa-data-drift.js — data-drift early warning for the AC 61-65 source data.
 *
 * load-data.js evals the live browser globals, so a content edit in any of
 * the 5 data files (e.g. an AC 61-65L revision of one endorsement's verbatim
 * text) flows through build/render/QA completely silently. This script is
 * the gate: it fingerprints the data and diffs against a committed snapshot.
 *
 * Fingerprints:
 *   - files:        sha256 of the raw bytes of each data JS file
 *   - endorsements: sha256 of JSON {id, title, verbatimText, cfr} per entry
 *   - dataHash:     sha256 of the stable {files, endorsements} pair — a
 *                   single content hash, embedded in the PDF metadata by
 *                   stamp_nav.py as the build's data provenance stamp
 *
 * Snapshot: dist/data-snapshot.json (tracked in git).
 *
 * Usage:
 *   node qa-data-drift.js            diff against the snapshot; exit 1 on drift
 *   node qa-data-drift.js --update   accept current data; rewrite the snapshot
 *
 * Honors SIMPLY_ENDORSED_DATA_DIR (via lib/load-data.js) so drift can be
 * rehearsed against a scratch copy of the data without touching the repo.
 */

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { DATA_DIR, loadData } = require("./lib/load-data");

const SNAPSHOT_PATH = path.join(__dirname, "dist", "data-snapshot.json");
const SNAPSHOT_VERSION = 1;

const DATA_FILES = [
  "endorsements-data.js",
  "browse-structure.js",
  "guidance-content.js",
  "training-requirements-data.js",
  "privileges-limitations-data.js",
];

function sha256(s) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

/** Per-endorsement fingerprint: only the four fields the AC cares about. */
function endorsementHash(e) {
  return sha256(
    JSON.stringify({
      id: e.id,
      title: e.title,
      verbatimText: e.verbatimText,
      cfr: e.cfr,
    })
  );
}

/** Compute the in-memory snapshot of the data as it exists right now. */
function computeSnapshot() {
  const files = {};
  for (const name of DATA_FILES) {
    const p = path.join(DATA_DIR, name);
    if (!fs.existsSync(p)) {
      throw new Error(`[drift] data file not found: ${p}`);
    }
    files[name] = sha256(fs.readFileSync(p));
  }

  const data = loadData();
  const endorsements = {};
  for (const e of data.ENDORSEMENTS) {
    if (endorsements[e.id]) {
      throw new Error(`[drift] duplicate endorsement id in data: ${e.id}`);
    }
    endorsements[e.id] = endorsementHash(e);
  }

  const dataHash = sha256(
    JSON.stringify({
      files: Object.fromEntries(
        Object.entries(files).sort(([a], [b]) => (a < b ? -1 : 1))
      ),
      endorsements: Object.fromEntries(
        Object.entries(endorsements).sort(([a], [b]) => (a < b ? -1 : 1))
      ),
    })
  );

  return {
    snapshotVersion: SNAPSHOT_VERSION,
    generatedAt: new Date().toISOString(),
    acVersion: data.APP_META.acVersion,
    endorsementCount: data.ENDORSEMENTS.length,
    dataHash,
    files,
    endorsements,
  };
}

function main() {
  const update = process.argv.includes("--update");
  const current = computeSnapshot();

  if (update) {
    fs.mkdirSync(path.dirname(SNAPSHOT_PATH), { recursive: true });
    fs.writeFileSync(
      SNAPSHOT_PATH,
      JSON.stringify(current, null, 2) + "\n",
      "utf8"
    );
    console.log(
      `[drift] snapshot updated: ${path.relative(__dirname, SNAPSHOT_PATH)}`
    );
    console.log(
      `[drift] ${current.endorsementCount} endorsements, ${DATA_FILES.length} files, dataHash=${current.dataHash.slice(0, 12)}…`
    );
    return;
  }

  if (!fs.existsSync(SNAPSHOT_PATH)) {
    console.error(
      `[drift] no snapshot at ${path.relative(__dirname, SNAPSHOT_PATH)} — run: node qa-data-drift.js --update`
    );
    process.exit(1);
  }
  const committed = JSON.parse(fs.readFileSync(SNAPSHOT_PATH, "utf8"));

  let drift = 0;

  /* ── data files (raw byte hashes) ──────────────────────────────────── */
  console.log("\n[1] data file hashes");
  for (const name of DATA_FILES) {
    const oldH = committed.files && committed.files[name];
    const newH = current.files[name];
    if (oldH !== newH) {
      drift++;
      console.error(
        `  CHANGED  ${name}  (${(oldH || "missing").slice(0, 12)}… → ${newH.slice(0, 12)}…)`
      );
    } else {
      console.log(`  ok       ${name}`);
    }
  }

  /* ── per-endorsement hashes ────────────────────────────────────────── */
  console.log("\n[2] endorsement fingerprints (id · title · verbatimText · cfr)");
  const oldE = committed.endorsements || {};
  const newE = current.endorsements;
  const data = loadData();
  const titleOf = new Map(data.ENDORSEMENTS.map((e) => [e.id, e.title]));

  const added = Object.keys(newE).filter((id) => !(id in oldE));
  const removed = Object.keys(oldE).filter((id) => !(id in newE));
  const changed = Object.keys(newE).filter(
    (id) => id in oldE && oldE[id] !== newE[id]
  );

  for (const id of added.sort()) {
    drift++;
    console.error(`  ADDED    ${id}  ${titleOf.get(id) || ""}`);
  }
  for (const id of removed.sort()) {
    drift++;
    console.error(`  REMOVED  ${id}`);
  }
  for (const id of changed.sort()) {
    drift++;
    console.error(`  CHANGED  ${id}  ${titleOf.get(id) || ""}`);
  }
  if (!added.length && !removed.length && !changed.length) {
    console.log(
      `  ok       ${current.endorsementCount} endorsements match the snapshot`
    );
  }

  /* ── summary ───────────────────────────────────────────────────────── */
  console.log("\n──────────────────────────────");
  console.log(`  committed snapshot: ${committed.generatedAt} (${committed.acVersion})`);
  console.log(`  dataHash committed: ${(committed.dataHash || "?").slice(0, 16)}…`);
  console.log(`  dataHash current:   ${current.dataHash.slice(0, 16)}…`);

  if (drift) {
    console.error(
      `\nDATA DRIFT DETECTED: ${drift} difference(s) vs dist/data-snapshot.json`
    );
    console.error(
      "If this is an intentional AC revision, review the diff above, then run: node qa-data-drift.js --update"
    );
    process.exit(1);
  }
  console.log("\nDATA DRIFT CHECK PASSED — data matches the committed snapshot");
}

main();
