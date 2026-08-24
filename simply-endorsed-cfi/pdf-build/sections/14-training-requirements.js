"use strict";

/**
 * sections/14-training-requirements.js — Training Requirements & Checklists.
 *
 * Renders the 13 category requirement checklists (TRAINING_REQUIREMENTS)
 * detailing prerequisites, medicals, knowledge, and flight experience
 * required before signing off endorsements.
 */

const SCOPED_CSS = `<style>
.tr-wrap { margin-top: 10pt; }
.tr-header { margin-bottom: 8pt; padding-bottom: 4pt; border-bottom: 1.5pt solid #0f172a; }
.tr-title { font-family: "Inter Tight", "Inter", sans-serif; font-size: 16pt; font-weight: 800; color: #0f172a; margin: 0 0 3pt 0; }
.tr-sub { font-size: 8.5pt; color: #475569; margin: 0; line-height: 1.4; }
.tr-card {
  margin-bottom: 10pt;
  padding: 8pt 10pt;
  background: var(--cat-soft, #f8fafc);
  border: 0.75pt solid var(--cat-line, #cbd5e1);
  border-left: 3.5pt solid var(--cat-accent, #0f172a);
  border-radius: 4pt;
  break-inside: avoid;
}
.tr-card-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 4pt; }
.tr-card-title { font-family: "Inter Tight", "Inter", sans-serif; font-size: 10.5pt; font-weight: 800; color: #0f172a; margin: 0; }
.tr-card-cat { font-family: "JetBrains Mono", monospace; font-size: 7.5pt; font-weight: 700; color: var(--cat-accent, #0f172a); }
.tr-card-summary { font-size: 8.5pt; color: #334155; margin: 0 0 6pt 0; line-height: 1.4; }
.tr-req-list { list-style: none; margin: 0 0 6pt 0; padding: 0; }
.tr-req-item { margin-bottom: 4pt; font-size: 8pt; color: #1e293b; line-height: 1.35; padding-left: 10pt; position: relative; }
.tr-req-item::before { content: "•"; position: absolute; left: 0; color: var(--cat-accent, #0f172a); font-weight: 800; font-size: 10pt; }
.tr-req-lbl { font-weight: 700; color: #0f172a; }
.tr-chip-row { display: flex; flex-wrap: wrap; gap: 3pt; align-items: center; margin-top: 4pt; }
.tr-chip-lbl { font-size: 7pt; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.04em; }
.tr-pill {
  font-family: "JetBrains Mono", monospace;
  font-size: 7pt;
  font-weight: 700;
  background: #ffffff;
  border: 0.5pt solid var(--cat-line, #cbd5e1);
  color: var(--cat-ink, #0f172a);
  padding: 0.5pt 4pt;
  border-radius: 2.5pt;
  text-decoration: none;
}
.tr-cfr-chip {
  font-family: "JetBrains Mono", monospace;
  font-size: 6.5pt;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.7);
  border: 0.4pt solid #cbd5e1;
  color: #1e293b;
  padding: 0.5pt 3.5pt;
  border-radius: 2pt;
  text-decoration: none;
  margin-left: 3pt;
}
</style>`;

function renderTrainingRequirements(data, helpers) {
  const tr = data.TRAINING_REQUIREMENTS;
  const categories = data.BROWSE_STRUCTURE;

  const cardsHtml = categories.map((cat) => {
    const card = tr.categoryCards[cat.categoryId];
    if (!card) return "";

    const reqsHtml = (card.requirements || []).map((r) => {
      const refsHtml = (r.refs || []).map((ref) => {
        const url = helpers.cfrLink(ref);
        return url
          ? `<a class="tr-cfr-chip external" href="${helpers.esc(url)}" target="_blank" rel="noopener noreferrer">${helpers.esc(ref.replace(/^14\s*CFR\s*/, ""))} ↗</a>`
          : `<span class="tr-cfr-chip">${helpers.esc(ref)}</span>`;
      }).join(" ");

      return `<li class="tr-req-item"><span class="tr-req-lbl">${helpers.esc(r.label)}:</span> ${helpers.esc(r.text)} ${refsHtml}</li>`;
    }).join("\n");

    const relatedHtml = (card.relatedEndorsements || []).map((id) => {
      const anchor = helpers.anchorForEndorsement(id);
      return `<a class="tr-pill internal" href="#${anchor}">${helpers.esc(id)}</a>`;
    }).join("\n");

    return `<div class="tr-card" style="${helpers.themeVars(cat.categoryId)}">
      <div class="tr-card-head">
        <h3 class="tr-card-title">${helpers.esc(card.title)}</h3>
        <span class="tr-card-cat">${helpers.esc(cat.label)}</span>
      </div>
      <p class="tr-card-summary">${helpers.esc(card.summary)}</p>
      <ul class="tr-req-list">
        ${reqsHtml}
      </ul>
      <div class="tr-chip-row">
        <span class="tr-chip-lbl">Applicable Endorsements:</span>
        ${relatedHtml}
      </div>
    </div>`;
  }).join("\n");

  return `<div class="page-break tr-wrap">
    <div class="tr-header">
      <h2 class="tr-title" id="training-requirements">Part I — Category Training Prerequisites &amp; Checklists</h2>
      <p class="tr-sub">Essential prerequisite verifications and regulatory standards that must be satisfied before issuing endorsements in each category. Verify student documents, medical status, ground training, and aeronautical experience.</p>
    </div>
    ${cardsHtml}
  </div>`;
}

module.exports = {
  title: "Part I — Training Requirements & Checklists",
  render(data, helpers) {
    return SCOPED_CSS + "\n" + renderTrainingRequirements(data, helpers);
  },
};
