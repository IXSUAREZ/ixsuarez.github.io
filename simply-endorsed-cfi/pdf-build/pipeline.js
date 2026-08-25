"use strict";

/**
 * pipeline.js — one-command runner for the full Simply Endorsed CFI PDF
 * pipeline. Stages, in order:
 *
 *   build → test-render → qa-check → qa-citations → qa-markers
 *         → make-nav-data → render-pdf → stamp_nav → qa-nav → qa-content
 *
 * Aborts on the first stage that exits non-zero. Every stage's timing and
 * exit code is recorded in dist/build-manifest.json (written on success AND
 * on failure) along with the git HEAD sha.
 *
 * Usage:  node pipeline.js
 * Env:    SIMPLY_ENDORSED_OUT      overrides the output PDF path — point a
 *                                  test run at a scratch dir with this, never
 *                                  at the real output (see config.js)
 *         SIMPLY_ENDORSED_PYTHON   overrides the PyMuPDF venv interpreter
 */

const { execFileSync, spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const { PDF_PATH } = require("./config");

const ROOT = __dirname;
const MANIFEST_PATH = path.join(ROOT, "dist", "build-manifest.json");

// PyMuPDF venv interpreter — same one named in the stamp_nav.py/qa-nav.py
// shebangs (invoke the interpreter directly; the shebang contains a space).
const PYTHON =
  process.env.SIMPLY_ENDORSED_PYTHON ||
  "/Users/diegosuarez/Desktop/VIBE CODING PROJECTS/Foreflight Document EDITOR/" +
    "99_archive/generated-and-cache/pdf-build-venv/bin/python";

const STAGES = [
  { name: "build",         cmd: ["node", ["build.js"]] },
  { name: "test-render",   cmd: ["node", ["test-render.js"]] },
  { name: "qa-check",      cmd: ["node", ["qa-check.js"]] },
  { name: "qa-citations",  cmd: ["node", ["qa-citations.js"]] },
  { name: "qa-markers",    cmd: ["node", ["qa-markers.js"]] },
  { name: "make-nav-data", cmd: ["node", ["make-nav-data.js"]] },
  { name: "render-pdf",    cmd: ["node", ["render-pdf.js"]] },
  { name: "stamp_nav",     cmd: [PYTHON, ["stamp_nav.py"]] },
  { name: "qa-nav",        cmd: [PYTHON, ["qa-nav.py"]] },
  { name: "qa-content",    cmd: [PYTHON, ["qa-content.py"]] },
];

function gitSha() {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: ROOT,
      encoding: "utf8",
    }).trim();
  } catch {
    return null;
  }
}

function main() {
  const startedAt = new Date();
  console.log(`[pipeline] ${STAGES.length} stages: ${STAGES.map((s) => s.name).join(" → ")}`);
  console.log(`[pipeline] output PDF: ${PDF_PATH}` +
    (process.env.SIMPLY_ENDORSED_OUT ? " (SIMPLY_ENDORSED_OUT override)" : ""));
  console.log(`[pipeline] git HEAD: ${gitSha() || "unknown"}`);

  const manifest = {
    pipeline: "simply-endorsed-cfi pdf-build",
    gitSha: gitSha(),
    outputPdf: PDF_PATH,
    startedAt: startedAt.toISOString(),
    stages: [],
  };
  const writeManifest = (status) => {
    manifest.status = status;
    manifest.finishedAt = new Date().toISOString();
    manifest.durationMs = new Date() - startedAt;
    fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true });
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");
  };

  for (const { name, cmd: [bin, args] } of STAGES) {
    const t0 = new Date();
    console.log(`\n[pipeline] ▶ ${name}`);
    const res = spawnSync(bin, args, { cwd: ROOT, stdio: "inherit" });
    const t1 = new Date();
    const exitCode = res.status === null ? (res.error ? 1 : 128) : res.status;
    manifest.stages.push({
      name,
      command: [bin, ...args].join(" "),
      startedAt: t0.toISOString(),
      finishedAt: t1.toISOString(),
      durationMs: t1 - t0,
      exitCode,
    });
    if (exitCode !== 0) {
      const why = res.error ? ` (${res.error.message})` : "";
      console.error(`\n[pipeline] ✗ stage "${name}" exited ${exitCode}${why} — aborting`);
      writeManifest("failed");
      console.error(`[pipeline] manifest: ${path.relative(ROOT, MANIFEST_PATH)}`);
      process.exit(1);
    }
    console.log(`[pipeline] ✓ ${name} (${((t1 - t0) / 1000).toFixed(1)}s)`);
  }

  writeManifest("ok");
  console.log(`\n[pipeline] all ${STAGES.length} stages green`);
  console.log(`[pipeline] manifest: ${path.relative(ROOT, MANIFEST_PATH)}`);
}

main();
