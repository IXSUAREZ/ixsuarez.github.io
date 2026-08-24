"use strict";

/**
 * sections/01-front-matter.js — "How to use this PDF", the category color
 * legend, and the master TOC (Contents) on its own page.
 *
 * Industrial minimalism / Ferrari cockpit & Ive-Newson tactile button architecture.
 * Scoped styles under .fm-* / .toc-* for zero leakage.
 */

module.exports = {
  title: "Front Matter",

  render(data, helpers) {
    const { esc, anchorForEndorsement, themeVars, CATEGORY_ORDER, CATEGORY_LABELS } = helpers;

    /* Short category codes */
    const CAT_CODES = {
      "practical-test-prereqs": "PTP",
      "student-pilot": "STU",
      "sport-pilot": "SPT",
      "recreational-pilot": "REC",
      "private-pilot": "PVT",
      "commercial-pilot": "COM",
      atp: "ATP",
      "instrument-rating": "INS",
      "flight-instructor": "CFI",
      "sport-pilot-instructor": "SPI",
      "additional-recurrent": "ADD",
      "robinson-sfar73": "SFAR",
      "specialty-operations": "SPEC",
    };

    /* Per-category endorsement counts. */
    const counts = {};
    for (const e of data.ENDORSEMENTS) {
      counts[e.category] = (counts[e.category] || 0) + 1;
    }

    /* Featured bundles (with parent category) for the Part II TOC rows. */
    const featured = [];
    for (const cat of data.BROWSE_STRUCTURE) {
      for (const b of cat.subcategories) {
        if (b.featured) featured.push({ id: b.id, label: b.label, categoryId: cat.categoryId });
      }
    }

    const exampleChip = `<a class="internal fm-inline-chip" href="#${esc(anchorForEndorsement("A.6"))}">A.6</a>`;

    /* ── (a) How to use this PDF ──────────────────────────────────────── */

    const howtoItems = [
      `<strong>Tactile Interactive Switchplates.</strong> Every category, workflow, and guidance module is an engineered interactive button. Tap any card to jump immediately to that section.`,
      `<strong>Calibrated Category Chromatics.</strong> Each of the ${CATEGORY_ORDER.length} endorsement categories possesses a dedicated semantic color theme for instant visual recognition.`,
      `<strong>Direct Endorsement Access.</strong> Monospaced chips like ${exampleChip} jump directly to full endorsement cards featuring verbatim AC text, regulatory citations, and plain-English notes.`,
      `<strong>Active FAA & eCFR Telemetry.</strong> Links marked with &#8599; open live electronic Code of Federal Regulations and FAA advisory circular documents in your browser.`,
      `<strong>Cockpit PDF Bookmarks.</strong> Your PDF reader outline mirrors the four-tier hierarchy (Parts &rarr; Categories &rarr; Bundles &rarr; Endorsements) for rapid single-tap navigation.`,
    ]
      .map((html) => `<li class="fm-howto-li">${html}</li>`)
      .join("\n      ");

    /* ── (b) Category color legend ────────────────────────────────────── */

    const legendChips = CATEGORY_ORDER.map((slug, idx) => {
      const count = counts[slug] || 0;
      const code = CAT_CODES[slug] || String(idx + 1).padStart(2, "0");
      return `<a class="internal fm-cat-btn" href="#cat-${esc(slug)}" style="${themeVars(slug)}">
        <span class="fm-cat-stripe"></span>
        <span class="fm-cat-code">${esc(code)}</span>
        <span class="fm-cat-label">${esc(CATEGORY_LABELS[slug] || slug)}</span>
        <span class="fm-cat-count">${count}</span>
        <span class="fm-cat-chevron">&#x203A;</span>
      </a>`;
    }).join("\n      ");

    /* ── (c) Master TOC Buttons ──────────────────────────────────────── */

    const part1Buttons = CATEGORY_ORDER.map((slug, idx) => {
      const count = counts[slug] || 0;
      const num = String(idx + 1).padStart(2, "0");
      return `<a class="internal toc-btn toc-cat-btn" href="#cat-${esc(slug)}" style="${themeVars(slug)}">
          <span class="toc-btn-stripe"></span>
          <span class="toc-btn-idx">${num}</span>
          <span class="toc-btn-label">${esc(CATEGORY_LABELS[slug] || slug)}</span>
          <span class="toc-btn-count">${count}</span>
          <span class="toc-btn-arrow">&#x203A;</span>
        </a>`;
    }).join("\n        ");

    const wfLabelOverrides = {
      "pre-solo": "Pre-Solo Requirements & Knowledge",
      "first-solo": "First Solo Flight",
      "initial-solo-xc": "Initial Solo Cross-Country",
      "private-airplane-initial-checkride-bundle": "Private Pilot ASEL Checkride",
      "commercial-airplane-initial-checkride-bundle": "Commercial Pilot ASEL Checkride",
      "instrument-checkride-bundle": "Instrument Rating Checkride",
      "cfi-initial-checkride-bundle": "Flight Instructor ASEL Checkride",
      "flight-review-and-wings": "Flight Review & WINGS Program",
      "aircraft-endorsements": "Complex · HP · High-Alt · Tailwheel",
    };

    const part2FlowButtons = featured.map((b) => {
      const catCode = CAT_CODES[b.categoryId] || b.categoryId.slice(0, 3).toUpperCase();
      const label = wfLabelOverrides[b.id] || b.label;
      return `<a class="internal toc-btn toc-wf-btn" href="#wf-${esc(b.id)}" style="${themeVars(b.categoryId)}">
          <span class="toc-btn-stripe"></span>
          <span class="toc-wf-cat-pill">${esc(catCode)}</span>
          <span class="toc-btn-label">${esc(label)}</span>
          <span class="toc-wf-badge">FLOW</span>
          <span class="toc-btn-arrow">&#x203A;</span>
        </a>`;
    });

    part2FlowButtons.push(`<a class="internal toc-btn toc-wf-btn" href="#wf-index" style="--cat-accent:#0f172a;--cat-soft:#f8fafc;--cat-line:#cbd5e1;--cat-ink:#0f172a">
          <span class="toc-btn-stripe toc-stripe-navy"></span>
          <span class="toc-wf-cat-pill" style="background:#0f172a">ALL</span>
          <span class="toc-btn-label">All 71 Workflows Directory Index</span>
          <span class="toc-wf-badge">INDEX</span>
          <span class="toc-btn-arrow">&#x203A;</span>
        </a>`);

    const part2Buttons = part2FlowButtons.join("\n        ");

    const guidanceItems = [
      { id: "journey", label: "Student Pilot Journey", code: "MAP", desc: "Stage-by-stage progression" },
      { id: "scenarios", label: "Checkride Decision Scenarios", code: "CASE", desc: "Oral defense cases" },
      { id: "quickref", label: "Quick Reference & FAR Tables", code: "REF", desc: "Time limits matrix" },
      { id: "cfi-career", label: "CFI Career & Regulations", code: "FAR", desc: "Dec 2024 rule changes" },
      { id: "flashcards", label: "DPE Prep Oral Flashcards", code: "DECK", desc: "15 oral checkride cards" },
      { id: "lesson-plan", label: "Lesson Plan Architecture", code: "PLAN", desc: "10 ground lesson signoffs" },
    ];

    const guidanceButtons = guidanceItems.map((g) => {
      return `<a class="internal toc-btn toc-guide-btn" href="#${esc(g.id)}">
          <span class="toc-btn-stripe toc-stripe-navy"></span>
          <span class="toc-guide-code">${esc(g.code)}</span>
          <span class="toc-btn-label">${esc(g.label)}</span>
          <span class="toc-btn-sub">${esc(g.desc)}</span>
          <span class="toc-btn-arrow">&#x203A;</span>
        </a>`;
    }).join("\n        ");

    return `<!-- (a)(b) front matter intro page -->
<div class="fm-intro">
  <div class="fm-hero-bar">
    <h2 class="fm-h">How to use this PDF</h2>
    <span class="fm-hero-badge">AC 61-65K COMPLIANT · C.F.I. FIELD REFERENCE</span>
  </div>
  <div class="fm-howto">
    <ul>
      ${howtoItems}
    </ul>
  </div>
  <div class="fm-navchrome">
    <p class="fm-navchrome-title">Navigation Chrome Architecture</p>
    <table class="fm-navchrome-table">
      <tr><th>Top Deck</th><td>Global switchgear: Jump between Contents, Part I Library, Part II Workflows, and Part III Guidance.</td></tr>
      <tr><th>Right Rail</th><td>Chapter rail with subcategory beads. Tap any bead to jump directly to that bundle.</td></tr>
      <tr><th>Bottom Dock</th><td>Breadcrumb path + binder page number, &lsaquo; PREV / NEXT &rsaquo; unit stepper, and BACK history button.</td></tr>
      <tr><th>Cover</th><td>Milled cover is clean and chrome-free.</td></tr>
    </table>
  </div>
  <h2 class="fm-h">Category Color System</h2>
  <div class="fm-legend-grid">
      ${legendChips}
  </div>
</div>

<!-- (c) master TOC on its own page -->
<div class="page-break">
  <span class="pgm" aria-hidden="true">ZZPGM|toc:toc|ZZ</span>
  
  <!-- Sculpted Cockpit Header HUD -->
  <div class="toc-header-hud">
    <div class="toc-title-row">
      <h1 class="section-title toc-main-title">Contents</h1>
      <div class="toc-telemetry-badge">
        <span class="toc-pulse-dot"></span>
        <span class="toc-telemetry-txt">AC 61-65K &middot; ${data.ENDORSEMENTS.length} ENDORSEMENTS &middot; ${CATEGORY_ORDER.length} CATEGORIES</span>
      </div>
    </div>
  </div>

  <div class="toc-cols">
    <!-- LEFT COLUMN: PART I ENDORSEMENT LIBRARY -->
    <div class="toc-col toc-col-left">
      <div class="toc-deck-header">
        <h2 class="toc-part"><a class="internal" href="#part-1">Part I &mdash; Endorsement Library</a></h2>
        <span class="toc-part-note">${data.ENDORSEMENTS.length} certs &middot; ${CATEGORY_ORDER.length} cats</span>
      </div>
      <div class="toc-btn-stack">
        ${part1Buttons}
      </div>
    </div>

    <!-- RIGHT COLUMN: PART II WORKFLOWS + PART III GUIDANCE + APPENDIX -->
    <div class="toc-col toc-col-right">
      <!-- PART II -->
      <div class="toc-deck-header">
        <h2 class="toc-part"><a class="internal" href="#part-2">Part II &mdash; Workflow Flows</a></h2>
        <span class="toc-part-note">${featured.length} featured flows</span>
      </div>
      <div class="toc-btn-stack">
        ${part2Buttons}
      </div>

      <!-- PART III -->
      <div class="toc-deck-header toc-deck-header-mt">
        <h2 class="toc-part"><a class="internal" href="#part-3">Part III &mdash; Guidance &amp; Toolkit</a></h2>
        <span class="toc-part-note">6 modules</span>
      </div>
      <div class="toc-btn-stack">
        ${guidanceButtons}
      </div>

      <!-- APPENDIX -->
      <div class="toc-deck-header toc-deck-header-mt">
        <h2 class="toc-part"><a class="internal" href="#appendix">Appendix &amp; Cross-Reference</a></h2>
      </div>
      <div class="toc-btn-stack">
        <a class="internal toc-btn toc-app-btn" href="#ac-number-index">
          <span class="toc-btn-stripe toc-stripe-navy"></span>
          <span class="toc-guide-code">A-Z</span>
          <span class="toc-btn-label">AC 61-65K Number Index (A.1 – A.96)</span>
          <span class="toc-btn-arrow">&#x203A;</span>
        </a>
        <a class="internal toc-btn toc-app-btn" href="#appendix">
          <span class="toc-btn-stripe toc-stripe-navy"></span>
          <span class="toc-guide-code">APP</span>
          <span class="toc-btn-label">Regulatory References, Acronyms &amp; Index</span>
          <span class="toc-btn-arrow">&#x203A;</span>
        </a>
      </div>
    </div>
  </div>
</div>

<style>
/* ── (a)(b) FRONT MATTER INTRO & LEGEND ────────────────────────────── */
.fm-intro {
  padding-top: 2pt;
}
.fm-hero-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 0 6pt 0;
  padding-bottom: 3pt;
  border-bottom: 1.5pt solid #0f172a;
}
.fm-h {
  font-family: "Inter Tight", "Inter", -apple-system, sans-serif;
  font-size: 12pt;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: #0f172a;
  margin: 0;
  padding-bottom: 2pt;
  border-bottom: 1pt solid #cbd5e1;
}
.fm-hero-bar .fm-h {
  border-bottom: none;
  padding-bottom: 0;
}
.fm-hero-badge {
  font-family: "JetBrains Mono", monospace;
  font-size: 6.5pt;
  font-weight: 700;
  letter-spacing: 0.06em;
  padding: 2pt 6pt;
  background: #0f172a;
  color: #ffffff;
  border-radius: 3pt;
}
.fm-h + .fm-howto, .fm-h + .fm-legend-grid { margin-bottom: 10pt; }
.fm-howto {
  background: #f8fafc;
  border: 0.6pt solid #cbd5e1;
  border-left: 3.5pt solid #0f172a;
  border-radius: 4pt;
  padding: 6pt 10pt;
  margin-bottom: 10pt;
  box-shadow: inset 0 0.5pt 0 rgba(255, 255, 255, 0.9);
}
.fm-howto ul { margin: 0; padding-left: 12pt; }
.fm-howto-li { margin-bottom: 4pt; font-size: 9.5pt; line-height: 1.4; color: #334155; } line-height: 1.35; color: #334155; }
.fm-howto-li:last-child { margin-bottom: 0; }
.fm-navchrome { margin: 0 0 10pt 0; }
.fm-navchrome-title {
  margin: 0 0 3pt 0;
  font-family: "Inter Tight", "Inter", sans-serif;
  font-size: 7.5pt;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #475569;
}
.fm-navchrome-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 8pt;
  background: #f8fafc;
  border: 0.6pt solid #cbd5e1;
  border-radius: 4pt;
  box-shadow: inset 0 0.5pt 0 rgba(255, 255, 255, 0.9);
}
.fm-navchrome-table th,
.fm-navchrome-table td {
  border: 0.5pt solid #e2e8f0;
  padding: 3pt 6pt;
  text-align: left;
  vertical-align: top;
}
.fm-navchrome-table th {
  width: 1.05in;
  font-size: 7.5pt;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #0f172a;
  white-space: nowrap;
  background: #f1f5f9;
}
.fm-inline-chip {
  font-family: "JetBrains Mono", monospace;
  font-size: 7.5pt;
  font-weight: 700;
  padding: 0.5pt 4.5pt;
  border-radius: 3pt;
  background: #0f172a;
  color: #ffffff !important;
}
.fm-legend-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3.5pt;
  margin-top: 4pt;
}
.fm-cat-btn {
  position: relative;
  display: flex;
  align-items: center;
  gap: 4pt;
  padding: 2.5pt 5pt 2.5pt 2pt;
  background: var(--cat-soft, #f8fafc);
  border: 0.6pt solid var(--cat-line, #cbd5e1);
  border-radius: 3.5pt;
  color: var(--cat-ink, #0f172a);
  text-decoration: none;
  font-size: 7.5pt;
  break-inside: avoid;
  box-shadow: inset 0 0.5pt 0 rgba(255, 255, 255, 0.8), 0 0.5pt 1.5pt rgba(15, 23, 42, 0.03);
}
.fm-cat-stripe {
  width: 2.5pt;
  align-self: stretch;
  background: var(--cat-accent, #0f172a);
  border-radius: 1.5pt;
  flex-shrink: 0;
}
.fm-cat-code { font-family: "JetBrains Mono", monospace; font-size: 8.5pt;
  font-weight: 700;
  color: var(--cat-accent, #0f172a);
  letter-spacing: 0.02em;
  flex-shrink: 0;
}
.fm-cat-label {
  font-weight: 700;
  color: var(--cat-ink, #0f172a);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1 1 auto;
}
.fm-cat-count { font-size: 8.5pt;
  font-weight: 800;
  color: #ffffff;
  background: var(--cat-accent, #0f172a);
  padding: 0.5pt 3.5pt;
  border-radius: 2.5pt;
  flex-shrink: 0;
}
.fm-cat-chevron {
  font-size: 9pt;
  font-weight: 700;
  line-height: 1;
  color: var(--cat-accent, #64748b);
  opacity: 0.7;
}

/* ── (c) MASTER CONTENTS (TOC) IVE/NEWSON & FERRARI SYSTEM ────────── */

.toc-header-hud {
  margin-bottom: 8pt;
  padding-bottom: 4pt;
  border-bottom: 1.5pt solid #0f172a;
}
.toc-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.toc-main-title {
  margin: 0 !important;
  padding: 0 !important;
  border-bottom: none !important;
  font-family: "Inter Tight", "Inter", -apple-system, sans-serif;
  font-size: 18pt;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #0f172a;
  line-height: 1.1;
}
.toc-telemetry-badge {
  display: flex;
  align-items: center;
  gap: 4.5pt;
  background: #0f172a;
  padding: 2.5pt 7pt;
  border-radius: 3.5pt;
  box-shadow: inset 0 0.5pt 0 rgba(255, 255, 255, 0.2);
}
.toc-pulse-dot {
  width: 4.5pt;
  height: 4.5pt;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 4pt #10b981;
  flex-shrink: 0;
}
.toc-telemetry-txt {
  font-family: "JetBrains Mono", monospace;
  font-size: 6.5pt;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: #f1f5f9;
}

.toc-cols {
  display: flex;
  gap: 14pt;
  align-items: flex-start;
}
.toc-col {
  flex: 1 1 0;
  min-width: 0;
}
.toc-col-left {
  flex: 1 1 0;
}
.toc-col-right {
  flex: 1 1 0;
}

.toc-deck-header {
  margin-bottom: 3.5pt;
  padding-bottom: 1.5pt;
  border-bottom: 0.75pt solid #cbd5e1;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}
.toc-deck-header-mt {
  margin-top: 6.5pt;
}
.toc-part {
  font-family: "Inter Tight", "Inter", sans-serif;
  font-size: 9pt;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin: 0;
  padding: 0;
  border: none;
}
.toc-part a {
  color: #0f172a;
  text-decoration: none;
}
.toc-part-note {
  font-family: "JetBrains Mono", monospace;
  font-size: 6.5pt;
  font-weight: 600;
  color: #64748b;
  letter-spacing: 0.02em;
}

.toc-btn-stack {
  display: flex;
  flex-direction: column;
  gap: 2.2pt;
}

/* Base Tactile Switchplate */
.toc-btn {
  position: relative;
  display: flex;
  align-items: center;
  gap: 4.5pt;
  text-decoration: none;
  border-radius: 3.5pt;
  box-shadow: inset 0 0.5pt 0 rgba(255, 255, 255, 0.85), 0 0.5pt 1.5pt rgba(15, 23, 42, 0.03);
  break-inside: avoid;
}

/* Category Button (Part I) */
.toc-cat-btn {
  height: 18.5pt;
  padding: 0 5pt 0 2pt;
  background: var(--cat-soft, #f8fafc);
  border: 0.6pt solid var(--cat-line, #cbd5e1);
  color: var(--cat-ink, #0f172a);
}
.toc-btn-stripe {
  width: 2.5pt;
  align-self: stretch;
  background: var(--cat-accent, #0f172a);
  border-radius: 1.5pt;
  flex-shrink: 0;
}
.toc-stripe-navy {
  background: #0f172a !important;
}
.toc-btn-idx { font-family: "JetBrains Mono", monospace; font-size: 9.0pt;
  font-weight: 700;
  color: var(--cat-accent, #475569);
  background: rgba(255, 255, 255, 0.85);
  border: 0.4pt solid var(--cat-line, #cbd5e1);
  padding: 0.5pt 2.5pt;
  border-radius: 2pt;
  flex-shrink: 0;
  letter-spacing: -0.01em;
}
.toc-btn-label { font-size: 10.5pt;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1 1 auto;
}
.toc-btn-count { font-size: 9.0pt;
  font-weight: 800;
  color: #ffffff;
  background: var(--cat-accent, #0f172a);
  padding: 0.5pt 4pt;
  border-radius: 2.5pt;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
}
.toc-btn-arrow {
  font-size: 9.5pt;
  font-weight: 700;
  line-height: 1;
  color: var(--cat-accent, #64748b);
  opacity: 0.8;
  flex-shrink: 0;
}

/* Workflow Flow Button (Part II) */
.toc-wf-btn {
  height: 18.5pt;
  padding: 0 5pt 0 2pt;
  background: #ffffff;
  border: 0.6pt solid var(--cat-line, #cbd5e1);
  color: #0f172a;
}
.toc-wf-cat-pill { font-family: "JetBrains Mono", monospace; font-size: 8.5pt;
  font-weight: 800;
  color: #ffffff;
  background: var(--cat-accent, #0f172a);
  padding: 1pt 3pt;
  border-radius: 2pt;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}
.toc-wf-badge { font-family: "JetBrains Mono", monospace; font-size: 7.5pt;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: #475569;
  background: #f1f5f9;
  border: 0.4pt solid #cbd5e1;
  padding: 0.5pt 3pt;
  border-radius: 2pt;
  flex-shrink: 0;
}

/* Guidance Module Button (Part III) */
.toc-guide-btn {
  height: 18.5pt;
  padding: 0 5pt 0 2pt;
  background: #f8fafc;
  border: 0.6pt solid #cbd5e1;
  color: #0f172a;
}
.toc-guide-code { font-family: "JetBrains Mono", monospace; font-size: 8.5pt;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: #ffffff;
  background: #0f172a;
  padding: 1pt 3pt;
  border-radius: 2pt;
  flex-shrink: 0;
}
.toc-btn-sub { font-size: 8.5pt;
  font-weight: 500;
  color: #64748b;
  margin-left: auto;
  margin-right: 2pt;
  white-space: nowrap;
}

/* Appendix Button */
.toc-app-btn {
  height: 19pt;
  padding: 0 6pt 0 2pt;
  background: #f8fafc;
  border: 0.6pt solid #cbd5e1;
  color: #0f172a;
}
</style>`;
  },
};
