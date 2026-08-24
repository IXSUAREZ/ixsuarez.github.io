"use strict";

/**
 * sections/32-ac-number-index.js — AC 61-65K Number Quick Index (A.1 to A.96).
 *
 * Provides a comprehensive, tactile, hyperlinked grid index of all 96
 * AC 61-65K model endorsements grouped by tens (A.1–A.10, A.11–A.20, etc.).
 *
 * Exports { title, render(data, helpers) → htmlString }.
 */

const SCOPED_CSS = `<style>
.ac-idx-wrap {
  margin-top: 8pt;
}
.ac-idx-header {
  margin-bottom: 8pt;
  padding-bottom: 4pt;
  border-bottom: 1.5pt solid #0f172a;
}
.ac-idx-title {
  font-family: "Inter Tight", "Inter", -apple-system, sans-serif;
  font-size: 20pt;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 3pt 0;
}
.ac-idx-sub {
  font-size: 11.5pt;
  color: #475569;
  margin: 0;
  line-height: 1.35;
}
.ac-idx-group {
  margin-bottom: 8pt;
  break-inside: avoid;
}
.ac-idx-group-title {
  font-family: "Inter Tight", "Inter", sans-serif;
  font-size: 11.5pt;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #1e293b;
  margin: 0 0 3.5pt 0;
  padding-bottom: 1.5pt;
  border-bottom: 0.75pt solid #cbd5e1;
}
.ac-idx-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2.5pt 6pt;
}
.ac-idx-card {
  display: flex;
  align-items: center;
  gap: 5pt;
  padding: 2.5pt 5pt;
  background: var(--cat-soft, #f8fafc);
  border: 0.6pt solid var(--cat-line, #cbd5e1);
  border-radius: 3pt;
  text-decoration: none;
  color: var(--cat-ink, #0f172a);
  box-shadow: inset 0 0.5pt 0 rgba(255, 255, 255, 0.85);
  break-inside: avoid;
}
.ac-idx-pill {
  font-family: "JetBrains Mono", monospace;
  font-size: 10.5pt;
  font-weight: 800;
  background: var(--cat-accent, #0f172a);
  color: #ffffff;
  padding: 0.5pt 4pt;
  border-radius: 2pt;
  flex-shrink: 0;
  min-width: 24pt;
  text-align: center;
}
.ac-idx-text {
  flex: 1 1 auto;
  min-width: 0;
  font-size: 11.0pt; font-weight: 700;
  font-weight: 600;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ac-idx-cfr {
  font-family: "JetBrains Mono", monospace;
  font-size: 9.5pt;
  font-weight: 600;
  color: var(--cat-ink, #475569);
  flex-shrink: 0;
}
</style>`;

function renderAcNumberIndex(data, helpers) {
  const endorsements = data.ENDORSEMENTS;
  const groups = [];
  for (let i = 0; i < endorsements.length; i += 10) {
    const chunk = endorsements.slice(i, i + 10);
    const start = i + 1;
    const end = Math.min(i + 10, endorsements.length);
    groups.push({ label: `A.${start} — A.${end}`, items: chunk });
  }

  const groupHtml = groups
    .map((g) => {
      const cards = g.items
        .map((e) => {
          const cfr = (e.cfr && e.cfr.length > 0) ? e.cfr[0].replace(/^14\s*CFR\s*/, "") : "";
          const anchor = helpers.anchorForEndorsement(e.id);
          return `<a class="ac-idx-card internal" href="#${anchor}" style="${helpers.themeVars(e.category)}">
            <span class="ac-idx-pill">${helpers.esc(e.id)}</span>
            <span class="ac-idx-text">${helpers.esc(e.title)}</span>
            <span class="ac-idx-cfr">${helpers.esc(cfr)}</span>
          </a>`;
        })
        .join("\n");

      return `<div class="ac-idx-group">
        <div class="ac-idx-group-title">${g.label}</div>
        <div class="ac-idx-grid">
          ${cards}
        </div>
      </div>`;
    })
    .join("\n");

  return `<div class="page-break ac-idx-wrap">
    <div class="ac-idx-header">
      <h2 class="ac-idx-title" id="ac-number-index">AC 61-65K Endorsement Number Index (A.1 – A.96)</h2>
      <p class="ac-idx-sub">Rapid reference grid sorted strictly by official FAA AC 61-65K item number. Tap any endorsement card to jump directly to its complete template, regulation citations, and plain-English guidance.</p>
    </div>
    ${groupHtml}
  </div>`;
}

module.exports = {
  title: "Appendix — AC 61-65K Endorsement Number Index (A.1–A.96)",
  render(data, helpers) {
    return SCOPED_CSS + "\n" + renderAcNumberIndex(data, helpers);
  },
};
