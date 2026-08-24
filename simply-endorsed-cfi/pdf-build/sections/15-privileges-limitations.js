"use strict";

/**
 * sections/15-privileges-limitations.js — Certificate Privileges & Limitations Panels.
 *
 * Renders the 10 certificate panels (PRIVILEGES_LIMITATIONS) comparing
 * what each certificate grade authorizes vs. strict statutory limits.
 */

const SCOPED_CSS = `<style>
.pl-wrap { margin-top: 10pt; }
.pl-header { margin-bottom: 8pt; padding-bottom: 4pt; border-bottom: 1.5pt solid #0f172a; }
.pl-title { font-family: "Inter Tight", "Inter", sans-serif; font-size: 20pt; font-weight: 800; color: #0f172a; margin: 0 0 3pt 0; }
.pl-sub { font-size: 11.5pt; color: #475569; margin: 0; line-height: 1.4; }
.pl-card {
  margin-bottom: 10pt;
  padding: 8pt 10pt;
  background: #ffffff;
  border: 0.75pt solid #cbd5e1;
  border-radius: 4pt;
  box-shadow: 0 1pt 2pt rgba(0,0,0,0.03);
  break-inside: avoid;
}
.pl-card-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 4pt; border-bottom: 0.75pt solid #e2e8f0; padding-bottom: 3pt; }
.pl-card-title { font-family: "Inter Tight", "Inter", sans-serif; font-size: 14.5pt; font-weight: 800; color: #0f172a; margin: 0; }
.pl-rules { font-family: "JetBrains Mono", monospace; font-size: 11.0pt; font-weight: 700; color: #0369a1; }
.pl-summary { font-size: 11.5pt; color: #334155; margin: 0 0 6pt 0; line-height: 1.4; }
.pl-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8pt; }
.pl-col-h { font-size: 11.0pt; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 3pt; padding-bottom: 1pt; }
.pl-col-priv .pl-col-h { color: #059669; border-bottom: 1pt solid #a7f3d0; }
.pl-col-lim .pl-col-h { color: #dc2626; border-bottom: 1pt solid #fecaca; }
.pl-list { list-style: none; margin: 0; padding: 0; font-size: 11.0pt; line-height: 1.45; color: #1e293b; line-height: 1.35; }
.pl-item { margin-bottom: 3.5pt; padding-left: 8pt; position: relative; }
.pl-col-priv .pl-item::before { content: "+"; font-family: monospace; position: absolute; left: 0; color: #059669; font-weight: 800; }
.pl-col-lim .pl-item::before { content: "−"; font-family: monospace; position: absolute; left: 0; color: #dc2626; font-weight: 800; }
.pl-cfr-chip {
  font-family: "JetBrains Mono", monospace;
  font-size: 9.5pt;
  font-weight: 600;
  background: #f1f5f9;
  border: 0.4pt solid #cbd5e1;
  color: #334155;
  padding: 0.5pt 3pt;
  border-radius: 2pt;
  text-decoration: none;
  display: inline-block;
  margin-top: 1pt;
}
</style>`;

function renderPrivilegesLimitations(data, helpers) {
  const pl = data.PRIVILEGES_LIMITATIONS;
  const cards = pl.cards || {};

  const cardsHtml = Object.entries(cards).map(([slug, card]) => {
    const rulesHtml = (card.ruleRefs || []).map((ref) => {
      const url = helpers.cfrLink(ref);
      return url
        ? `<a class="pl-cfr-chip external" href="${helpers.esc(url)}" target="_blank" rel="noopener noreferrer">${helpers.esc(ref)} ↗</a>`
        : `<span class="pl-cfr-chip">${helpers.esc(ref)}</span>`;
    }).join(" ");

    const privHtml = (card.privileges || []).map((p) => {
      const refs = (p.refs || []).map((r) => {
        const u = helpers.cfrLink(r);
        return u ? `<a class="pl-cfr-chip external" href="${helpers.esc(u)}" target="_blank" rel="noopener noreferrer">${helpers.esc(r)}</a>` : "";
      }).filter(Boolean).join(" ");
      return `<li class="pl-item">${helpers.esc(p.text)} ${refs}</li>`;
    }).join("\n");

    const limHtml = (card.limitations || []).map((l) => {
      const refs = (l.refs || []).map((r) => {
        const u = helpers.cfrLink(r);
        return u ? `<a class="pl-cfr-chip external" href="${helpers.esc(u)}" target="_blank" rel="noopener noreferrer">${helpers.esc(r)}</a>` : "";
      }).filter(Boolean).join(" ");
      return `<li class="pl-item">${helpers.esc(l.text)} ${refs}</li>`;
    }).join("\n");

    return `<div class="pl-card" style="${helpers.themeVars(slug)}">
      <div class="pl-card-head">
        <h3 class="pl-card-title">${helpers.esc(card.title)}</h3>
        <div class="pl-rules">${rulesHtml}</div>
      </div>
      <p class="pl-summary">${helpers.esc(card.summary)}</p>
      <div class="pl-grid">
        <div class="pl-col-priv">
          <div class="pl-col-h">Privileges Authorized</div>
          <ul class="pl-list">${privHtml}</ul>
        </div>
        <div class="pl-col-lim">
          <div class="pl-col-h">Statutory Limitations</div>
          <ul class="pl-list">${limHtml}</ul>
        </div>
      </div>
    </div>`;
  }).join("\n");

  return `<div class="page-break pl-wrap">
    <div class="pl-header">
      <h2 class="pl-title" id="privileges-limitations">Part I — Airman Certificate Privileges &amp; Limitations</h2>
      <p class="pl-sub">Comprehensive regulatory summary of airman operating privileges vs. absolute limitations under 14 CFR Part 61. Essential ground reference for stage checks and practical test readiness briefings.</p>
    </div>
    ${cardsHtml}
  </div>`;
}

module.exports = {
  title: "Part I — Privileges & Limitations",
  render(data, helpers) {
    return SCOPED_CSS + "\n" + renderPrivilegesLimitations(data, helpers);
  },
};
