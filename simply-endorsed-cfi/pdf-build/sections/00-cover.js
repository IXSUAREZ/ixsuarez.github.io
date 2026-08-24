"use strict";

/**
 * sections/00-cover.js — polished book cover.
 *
 * Inlines ../logo.svg (scaled to ~120px), title, subtitle, prototype badge,
 * AC meta + library counts, and the official FAA source link.
 * Extra styles are scoped under .cov-* so they cannot clash with pdf.css
 * or other sections.
 */

const fs = require("fs");
const path = require("path");

const LOGO_PATH = path.join(__dirname, "..", "..", "logo.svg");

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function logoSvg() {
  try {
    return fs.readFileSync(LOGO_PATH, "utf8");
  } catch {
    return "";
  }
}

/** "2025-11-14" → "November 14, 2025" (deterministic, no locale/timezone drift). */
function formatIssued(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ""));
  if (!m) return String(iso || "");
  return `${MONTHS[Number(m[2]) - 1]} ${Number(m[3])}, ${m[1]}`;
}

module.exports = {
  title: "Cover",

  render(data, helpers) {
    const { esc } = helpers;
    const meta = data.APP_META;
    const nEndorsements = data.ENDORSEMENTS.length;
    const nCategories = data.BROWSE_STRUCTURE.length;

    return `<div class="cover cov-wrap">
  <div class="cov-rule"></div>
  <div class="cov-logo">${logoSvg()}</div>
  <h1 class="cover-title cov-title">Simply Endorsed CFI</h1>
  <p class="cover-subtitle cov-subtitle">FAA ${esc(meta.acVersion)} Endorsement Reference</p>
  <p class="cov-badge">Interactive PDF Prototype</p>
  <div class="cov-meta-card">
    <p class="cov-meta-line">
      <strong>${esc(meta.acVersion)}</strong> &middot; Issued ${esc(formatIssued(meta.dateIssued))}
      &middot; ${nEndorsements} endorsements &middot; ${nCategories} categories
    </p>
    <p class="cov-meta-line">
      <a class="external" href="${esc(meta.sourceUrl)}" target="_blank" rel="noopener noreferrer">Official FAA source: ${esc(meta.acVersion)}</a>
    </p>
  </div>
  <p class="cov-disclaimer">Hyperlinked study reference &mdash; not for operational use. Always verify against current FAA sources.</p>
  <div class="cov-rule"></div>
  <span class="pgm" aria-hidden="true">ZZPGM|cover:end|ZZ</span>
</div>
<style>
.cov-wrap { position: relative; }
.cov-rule {
  width: 1.1in;
  height: 2.5pt;
  background: #1C2142;
  border-radius: 2pt;
  margin: 0.18in 0;
}
.cov-logo { width: 120px; height: 120px; margin-bottom: 0.28in; }
.cov-logo svg { width: 100%; height: 100%; display: block; }
.cov-title { font-size: 34pt; letter-spacing: -0.01em; }
.cov-subtitle { margin-bottom: 14pt; }
.cov-badge {
  display: inline-block;
  margin: 0 0 0.32in 0;
  padding: 3pt 14pt;
  border-radius: 11pt;
  background: #1C2142;
  color: #ffffff;
  font-size: 8.5pt;
  font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}
.cov-meta-card {
  background: #f8f9fb;
  border: 0.75pt solid #d7dbe2;
  border-radius: 6pt;
  padding: 10pt 20pt;
}
.cov-meta-line { margin: 0; font-size: 10pt; color: #374151; }
.cov-meta-line + .cov-meta-line { margin-top: 5pt; }
.cov-disclaimer {
  margin: 0.28in 0 0 0;
  font-size: 8.5pt;
  color: #6b7280;
  max-width: 4.9in;
}
</style>`;
  },
};
