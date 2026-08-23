"use strict";

/**
 * sections/31-part3-quickref-appendix.js — second half of Part III (the
 * Part III divider h1 + id="part-3" lives in 30-part3-journey-scenarios.js;
 * this file contributes five h2 chapters under it):
 *   (a) Quick Reference        (h2 #quickref)   — QUICK_REF_DATA tables
 *   (b) CFI Career             (h2 #cfi-career) — CFI_CAREER_DATA blocks/tables
 *   (c) DPE Prep Flashcards    (h2 #flashcards) — FLASHCARD_DECK Q/A cards
 *   (d) Lesson Plan            (h2 #lesson-plan)— GUIDANCE_SECTIONS, h3 #gs-<id>
 *   (e) Appendix               (h2 #appendix)   — eCFR link index + source
 *
 * Scoped styles use .qr-*, .cc-*, .fc-*, .lp-*, .apx-* prefixes only.
 * Exports { title, render(data, helpers) → htmlString }. See CONTRACT.md.
 */

/* ── Scoped styles (prefixed; no global selectors) ─────────────────────── */

const SCOPED_CSS = `<style>
.qr-limit{display:inline-block;padding:2pt 6pt;border-left:3pt solid var(--cat-accent,#475569);background:var(--cat-soft,#f0f1f3);color:var(--cat-ink,#313b4a);font-weight:700;font-size:9pt;border-radius:2pt}
.qr-acref{display:inline-block;background:#1C2142;color:#fff;font-weight:700;font-size:8.5pt;padding:1.5pt 6pt;border-radius:8pt;text-decoration:none;font-family:"JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,monospace}
.qr-note{font-size:8.5pt;color:#5b6472;margin:-6pt 0 12pt 0}
.cc-compare{display:flex;gap:10pt;margin:6pt 0 12pt 0}
.cc-panel{flex:1;border:0.75pt solid #d7dbe2;border-radius:4pt;padding:8pt 10pt;break-inside:avoid}
.cc-panel-h{font-weight:700;color:#1C2142;margin:0 0 4pt 0;font-size:10pt}
.cc-panel p{margin:0 0 4pt 0;font-size:9pt}
.cc-note{font-size:8.5pt;color:#5b6472;margin:4pt 0 0 0}
.fc-card{border:0.75pt solid #d7dbe2;border-left:3pt solid #1C2142;border-radius:4pt;padding:8pt 10pt;margin:0 0 8pt 0;break-inside:avoid}
.fc-meta{display:flex;justify-content:space-between;align-items:center;margin:0 0 4pt 0}
.fc-badge{display:inline-block;background:#1C2142;color:#fff;font-size:7.5pt;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;padding:1.5pt 6pt;border-radius:8pt}
.fc-num{font-size:8pt;color:#8a92a3;font-family:"JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,monospace}
.fc-q{font-weight:700;font-size:9.5pt;margin:0 0 6pt 0}
.fc-a{border:0.75pt solid #d7dbe2;background:#f7f8fa;border-radius:3pt;padding:6pt 8pt;font-size:9pt}
.fc-a p{margin:0}
.lp-toc{columns:2;font-size:9.5pt}
.apx-src p{margin:0 0 4pt 0}
.apx-muted{color:#5b6472;font-size:8.5pt}
</style>`;

/* ── Local text utilities ──────────────────────────────────────────────── */

/**
 * linkifyProse(raw, helpers) — escape, then turn endorsement ids (A.6) into
 * internal links and CFR citations (§ 61.87(n), FAR 61.197(b), 14 CFR § …)
 * into external eCFR links. Safe on prose: endorsement ids are linked first,
 * and the CFR pattern requires an explicit FAR/§/14 CFR prefix, so it never
 * touches the A.x anchors or AC numbers (AC 61-83) in the text.
 */
function linkifyProse(raw, helpers) {
  let s = helpers.esc(raw);
  s = s.replace(/\bA\.(\d{1,2})\b/g, (m, n) => {
    const id = `A.${n}`;
    if (!helpers.endorsementById.get(id)) return m;
    return `<a class="internal" href="#${helpers.anchorForEndorsement(id)}">${m}</a>`;
  });
  s = s.replace(
    /((?:14\s*CFR\s*)?(?:FAR|§)\s*\d{1,4}\.\d+(?:\([a-zA-Z0-9]+\))*)/g,
    (m) => {
      const url = helpers.cfrLink(m);
      if (!url) return m;
      return `<a class="external" href="${helpers.esc(url)}" target="_blank" rel="noopener noreferrer">${m}</a>`;
    }
  );
  return s;
}

/** One or more CFR citations in a single data cell → cfrChip(s). */
function cfrChipsMulti(raw, helpers) {
  return String(raw ?? "")
    .split(/\s*,\s*/)
    .map((c) => c.trim())
    .filter(Boolean)
    .map((c) => helpers.cfrChip(c))
    .join(" ");
}

/** Internal pill linking an endorsement id ("A.1") to its card anchor. */
function endorsementPill(id, helpers) {
  if (!helpers.endorsementById.get(id)) return helpers.esc(id);
  return `<a class="internal qr-acref" href="#${helpers.anchorForEndorsement(id)}">${helpers.esc(id)}</a>`;
}

/* ── (a) Quick Reference ───────────────────────────────────────────────── */

function renderQuickRef(data, helpers) {
  const qr = data.QUICK_REF_DATA;

  const timeRows = qr.timeLimits
    .map(
      (t) => `<tr>
      <td><span class="qr-limit" style="${helpers.themeVars(t.color)}">${helpers.esc(t.limit)}</span></td>
      <td>${linkifyProse(t.appliesTo, helpers)}</td>
      <td>${cfrChipsMulti(t.governingFAR, helpers)}</td>
      <td>${linkifyProse(t.resetsWhen, helpers)}</td>
    </tr>`
    )
    .join("\n");

  const logbookRows = qr.logbookChecklist
    .map(
      (item, i) => `<tr>
      <td class="mono">${i + 1}</td>
      <td>${linkifyProse(item, helpers)}</td>
    </tr>`
    )
    .join("\n");

  const acFarRows = qr.acFarTable
    .map(
      (r) => `<tr>
      <td>${endorsementPill(r.acRef, helpers)}</td>
      <td>${cfrChipsMulti(r.far, helpers)}</td>
      <td>${linkifyProse(r.use, helpers)}</td>
      <td>${helpers.esc(r.expiration)}</td>
    </tr>`
    )
    .join("\n");

  const sfarRows = qr.sfarList
    .map(
      (s) => `<tr>
      <td class="mono">${helpers.esc(s.id)}</td>
      <td>${helpers.esc(s.title)}</td>
      <td>${linkifyProse(s.note, helpers)}</td>
    </tr>`
    )
    .join("\n");

  return `<div class="page-break">
  <span class="pgm">ZZPGM|gs:quickref|ZZ</span>
  <h2 id="quickref">Quick Reference</h2>
  <p>Print-friendly tables of the limits, records, and cross-references CFIs reach for most. Endorsement pills jump to the full card in Part I; CFR chips open the current eCFR text.</p>

  <h3>Endorsement Time Limits</h3>
  <table class="data-table">
    <thead><tr><th>Limit</th><th>Applies To</th><th>Governing FAR</th><th>Resets When</th></tr></thead>
    <tbody>
${timeRows}
    </tbody>
  </table>

  <h3>Logbook Entry Checklist</h3>
  <p class="qr-note">Every logbook entry should contain all of the following elements.</p>
  <table class="data-table">
    <thead><tr><th>#</th><th>Required Element</th></tr></thead>
    <tbody>
${logbookRows}
    </tbody>
  </table>

  <h3>AC 61-65K ↔ FAR Cross-Reference</h3>
  <table class="data-table">
    <thead><tr><th>AC Endorsement</th><th>FAR Reference</th><th>Use</th><th>Expiration</th></tr></thead>
    <tbody>
${acFarRows}
    </tbody>
  </table>

  <h3>Special Federal Aviation Regulations (SFARs)</h3>
  <table class="data-table">
    <thead><tr><th>SFAR</th><th>Title</th><th>Notes</th></tr></thead>
    <tbody>
${sfarRows}
    </tbody>
  </table>
</div>`;
}

/* ── (b) CFI Career ────────────────────────────────────────────────────── */

function renderCfiCareer(data, helpers) {
  const c = data.CFI_CAREER_DATA;

  const pathwayRows = c.renewalPathways
    .map(
      (p) => `<tr>
      <td><strong>${helpers.esc(p.title)}</strong></td>
      <td>${helpers.esc(p.timeFrame)}</td>
      <td>${linkifyProse(p.description, helpers)}</td>
      <td>${linkifyProse(p.notes, helpers)}</td>
    </tr>`
    )
    .join("\n");

  const groundItems = c.initialCfiTrainer.groundOptions
    .map((o) => `<li>${linkifyProse(o, helpers)}</li>`)
    .join("\n      ");
  const flightItems = c.initialCfiTrainer.flightOptions
    .map((o) => `<li>${linkifyProse(o, helpers)}</li>`)
    .join("\n      ");

  return `<div class="page-break">
  <span class="pgm">ZZPGM|gs:cfi-career|ZZ</span>
  <h2 id="cfi-career">CFI Career — Renewal, Reinstatement &amp; Trainer Qualification</h2>
  <p>Everything about keeping the instructor certificate itself alive: the December 2024 rule change, the six renewal pathways, reinstatement after expiration, and who may train initial CFI applicants.</p>

  <h3>Renewal Rules — Before vs. After December 1, 2024</h3>
  <div class="cc-compare">
    <div class="cc-panel">
      <p class="cc-panel-h">Issued Before December 1, 2024</p>
      <p>${linkifyProse(c.prePostDec2024.before, helpers)}</p>
    </div>
    <div class="cc-panel">
      <p class="cc-panel-h">Issued On or After December 1, 2024</p>
      <p>${linkifyProse(c.prePostDec2024.after, helpers)}</p>
    </div>
  </div>

  <h3>Renewal Pathways</h3>
  <table class="data-table">
    <thead><tr><th>Pathway</th><th>Time Frame</th><th>Description</th><th>Notes</th></tr></thead>
    <tbody>
${pathwayRows}
    </tbody>
  </table>

  <h3>Reinstatement After Expiration</h3>
  <div class="cc-compare">
    <div class="cc-panel">
      <p class="cc-panel-h">${helpers.esc(c.reinstatement.within3Months.heading)}</p>
      <p>${linkifyProse(c.reinstatement.within3Months.path, helpers)}</p>
      <p class="cc-note">${linkifyProse(c.reinstatement.within3Months.note, helpers)}</p>
    </div>
    <div class="cc-panel">
      <p class="cc-panel-h">${helpers.esc(c.reinstatement.after3Months.heading)}</p>
      <p>${linkifyProse(c.reinstatement.after3Months.path, helpers)}</p>
      <p class="cc-note">${linkifyProse(c.reinstatement.after3Months.note, helpers)}</p>
    </div>
  </div>
  <p class="cc-note">${linkifyProse(c.reinstatement.documentation, helpers)}</p>

  <h3>Qualifying to Train Initial CFI Applicants</h3>
  <p>${helpers.badge(`Effective ${c.initialCfiTrainer.effectiveDate}`, "muted")}</p>
  <h4>Ground training options</h4>
  <ul>
      ${groundItems}
  </ul>
  <h4>Flight training options</h4>
  <ul>
      ${flightItems}
  </ul>
</div>`;
}

/* ── (c) DPE Prep Flashcards ───────────────────────────────────────────── */

function renderFlashcards(data, helpers) {
  const deck = data.FLASHCARD_DECK;
  const cards = deck
    .map(
      (f, i) => `<div class="fc-card">
    <div class="fc-meta">
      <span class="fc-badge">${helpers.esc(f.category)}</span>
      <span class="fc-num">${i + 1} / ${deck.length}</span>
    </div>
    <p class="fc-q">Q: ${linkifyProse(f.question, helpers)}</p>
    <div class="fc-a"><p>${linkifyProse(f.answer, helpers)}</p></div>
  </div>`
    )
    .join("\n");

  return `<div class="page-break">
  <span class="pgm">ZZPGM|gs:flashcards|ZZ</span>
  <h2 id="flashcards">DPE Prep Flashcards</h2>
  <p>Fifteen oral-exam-style questions covering the endorsement knowledge DPEs actually probe. Answers link back to the full endorsement cards and the governing regulations.</p>
${cards}
</div>`;
}

/* ── (d) Lesson Plan ───────────────────────────────────────────────────── */

function renderLessonPlan(data, helpers) {
  const sections = data.GUIDANCE_SECTIONS;

  const tocItems = sections
    .map(
      (g) => `<li><a class="internal" href="#gs-${helpers.esc(g.id)}">${helpers.esc(g.title)}</a></li>`
    )
    .join("\n      ");

  const body = sections
    .map(
      (g) => `<section class="guidance-section">
  ${helpers.pgmMarker(`gs:${g.id}`)}
  <h3 id="gs-${helpers.esc(g.id)}">${helpers.esc(g.title)}</h3>
  ${helpers.renderBlocks(g.content)}
</section>`
    )
    .join("\n");

  return `<div class="page-break">
  <span class="pgm">ZZPGM|gs:lesson-plan|ZZ</span>
  <h2 id="lesson-plan">Lesson Plan — Teaching Endorsements</h2>
  <p>A ten-part ground lesson for CFI candidates and working instructors on issuing, managing, and verifying AC 61-65K endorsements.</p>
  <ol class="lp-toc">
      ${tocItems}
  </ol>
${body}
</div>`;
}

/* ── (e) Appendix ──────────────────────────────────────────────────────── */

function renderAppendix(data, helpers) {
  // eCFR link index: every unique eCFR URL across all 96 endorsements' cfr
  // arrays, keyed by URL (first citation text wins), sorted by URL.
  const byUrl = new Map();
  for (const e of data.ENDORSEMENTS) {
    for (const citation of e.cfr || []) {
      const url = helpers.cfrLink(citation);
      if (url && !byUrl.has(url)) byUrl.set(url, citation);
    }
  }
  const entries = [...byUrl.entries()].sort((a, b) => a[0].localeCompare(b[0]));

  const indexRows = entries
    .map(
      ([url, citation]) => `<tr>
      <td><a class="external" href="${helpers.esc(url)}" target="_blank" rel="noopener noreferrer">${helpers.esc(citation)}</a></td>
      <td class="mono"><a class="external" href="${helpers.esc(url)}" target="_blank" rel="noopener noreferrer">${helpers.esc(url)}</a></td>
    </tr>`
    )
    .join("\n");

  const meta = data.APP_META;

  return `<div class="page-break">
  <span class="pgm">ZZPGM|gs:appendix|ZZ</span>
  <h2 id="appendix">Appendix</h2>

  <h3>eCFR Link Index</h3>
  <p>Every unique eCFR section referenced by the ${data.ENDORSEMENTS.length} endorsement cards in this book, sorted by URL. Links open the current eCFR text — always verify against the live regulation.</p>
  <table class="data-table">
    <thead><tr><th>Citation (as listed in ${helpers.esc(meta.acVersion)})</th><th>eCFR URL</th></tr></thead>
    <tbody>
${indexRows}
    </tbody>
  </table>

  <h3>Source</h3>
  <div class="apx-src">
    <p><strong>${helpers.esc(meta.acVersion)}</strong> · Issued ${helpers.esc(meta.dateIssued)}</p>
    <p><a class="external" href="${helpers.esc(meta.sourceUrl)}" target="_blank" rel="noopener noreferrer">${helpers.esc(meta.acVersion)} (FAA)</a></p>
  </div>

  <p class="apx-muted">Interactive PDF prototype generated from the Simply Endorsed CFI web app (suarezcfi.com/simply-endorsed-cfi).</p>
</div>`;
}

/* ── Module export ─────────────────────────────────────────────────────── */

module.exports = {
  title: "Part III — Quick Reference, Career, Flashcards, Lesson Plan & Appendix",

  render(data, helpers) {
    return (
      SCOPED_CSS +
      "\n" +
      [
        renderQuickRef(data, helpers),
        renderCfiCareer(data, helpers),
        renderFlashcards(data, helpers),
        renderLessonPlan(data, helpers),
        renderAppendix(data, helpers),
      ].join("\n")
    );
  },
};
