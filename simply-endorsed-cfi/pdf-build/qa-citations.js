"use strict";

/**
 * qa-citations.js — consistency gate for hand-written A-number citations.
 *
 * Generated endorsement chips (rendered from the data files) are consistent
 * by construction. The risk is the hand-typed citations in ledger, tracker,
 * and manifest prose inside sections/*.js — e.g. the journey tracker once
 * cited "§ 61.87(o)" against A.8 (25 NM airport) instead of A.5 (night
 * training), and the DPE manifests cited recreational A.33 for the private
 * practical test. Both shipped. This gate fails the build on that class.
 *
 * Checks, per source line containing an A.x citation:
 *   1. Existence — every cited A.x exists in ENDORSEMENTS.
 *   2. Regulation consistency — if the line also carries CFR-style §
 *      reference(s), at least one cited endorsement must list at least one
 *      of the referenced sections in its own cfr[] data (prefix match, so
 *      a line's "§ 1552" satisfies A.14's "… § 1552.15(c)"). Multi-citation
 *      lines use this any-to-any form deliberately: ledger rows pair one
 *      milestone authority with several endorsements.
 *
 * Comment lines (// and block-comment stars) are ignored.
 *
 * Usage:  node qa-citations.js
 * Exit code 0 when every citation is sound, 1 otherwise.
 */

const fs = require("fs");
const path = require("path");
const { endorsementById } = require("./lib/load-data");

const SECTIONS_DIR = path.join(__dirname, "sections");

/** "A.14" style citations, e.g. chips: "A.5" or card("A.37"). */
const CITATION_RE = /\bA\.(\d{1,2})\b/g;
/** CFR-style section refs: "§ 61.87(o)", "§§ 61.35(a)(1)", "§ 1552". */
const SECTION_RE = /§{1,2}\s*(?:\d+\s*CFR\s*)?(\d{2,4}(?:\.\d+)?)/g;
/** Section tokens inside an endorsement's own cfr[] strings. */
const CFR_TOKEN_RE = /(\d{2,4}\.\d+)/g;

function sectionsOf(e) {
  const tokens = new Set();
  for (const c of e.cfr || []) {
    for (const m of String(c).matchAll(CFR_TOKEN_RE)) tokens.add(m[1]);
  }
  return tokens;
}

/** Prefix match either way: "1552" ~ "1552.15", "61.39" ~ "61.39". */
function tokenMatches(line, cite) {
  return cite.startsWith(line) || line.startsWith(cite);
}

function main() {
  const files = fs
    .readdirSync(SECTIONS_DIR)
    .filter((f) => f.endsWith(".js"))
    .sort();

  let cited = 0;
  let checked = 0;
  const violations = [];

  for (const file of files) {
    const lines = fs.readFileSync(path.join(SECTIONS_DIR, file), "utf8").split("\n");
    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("//") || trimmed.startsWith("*")) return;

      const ids = [
        ...new Set([...line.matchAll(CITATION_RE)].map((m) => `A.${m[1]}`)),
      ];
      if (!ids.length) return;
      cited += ids.length;

      for (const id of ids) {
        if (!endorsementById.has(id)) {
          violations.push(`${file}:${idx + 1}  unknown endorsement ${id}`);
        }
      }

      const refs = [
        ...new Set([...line.matchAll(SECTION_RE)].map((m) => m[1])),
      ];
      if (!refs.length) return;
      checked++;

      const known = ids.filter((id) => endorsementById.has(id));
      const anyMatch = known.some((id) => {
        const citeTokens = sectionsOf(endorsementById.get(id));
        return refs.some((r) =>
          [...citeTokens].some((t) => tokenMatches(r, t))
        );
      });
      if (!anyMatch) {
        violations.push(
          `${file}:${idx + 1}  ${ids.join(", ")} cited against ${refs
            .map((r) => "§ " + r)
            .join(", ")} — no cited endorsement covers that section`
        );
      }
    });
  }

  console.log(`[citations] scanned ${files.length} section files`);
  console.log(`[citations] ${cited} A-number citations, ${checked} lines with paired § refs`);

  if (violations.length) {
    console.error(`\nCITATION CHECK FAILED — ${violations.length} violation(s):`);
    for (const v of violations) console.error(`  ${v}`);
    process.exit(1);
  }
  console.log("[citations] all citations consistent with endorsement data");
}

main();
