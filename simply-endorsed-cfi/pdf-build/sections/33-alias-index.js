"use strict";

/**
 * sections/33-alias-index.js — A–Z Plain Language & Alias Quick-Search Index.
 *
 * Provides a comprehensive alphabetical search matrix of 250+ colloquial terms,
 * acronyms, checkride types, and synonyms mapping directly to official A-numbers.
 */

const SCOPED_CSS = `<style>
.alias-wrap { margin-top: 8pt; }
.alias-header { margin-bottom: 8pt; padding-bottom: 4pt; border-bottom: 1.5pt solid #0f172a; }
.alias-title { font-family: "Inter Tight", "Inter", sans-serif; font-size: 15pt; font-weight: 800; color: #0f172a; margin: 0 0 3pt 0; }
.alias-sub { font-size: 9.5pt; color: #475569; margin: 0; }
.alias-columns { columns: 3; column-gap: 8pt; }
.alias-group { margin-bottom: 6pt; break-inside: avoid; }
.alias-group-letter {
  font-family: "Inter Tight", "Inter", sans-serif;
  font-size: 9.5pt;
  font-weight: 800;
  color: #0f172a;
  background: #f1f5f9;
  padding: 1pt 4pt;
  border-radius: 2pt;
  margin-bottom: 2pt;
  border-bottom: 1pt solid #cbd5e1;
}
.alias-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 2pt 2pt;
  border-bottom: 0.4pt solid #f1f5f9;
  font-size: 8.5pt;
  text-decoration: none;
}
.alias-term { color: #1e293b; font-weight: 600; }
.alias-arrow { color: #94a3b8; font-size: 6pt; margin: 0 2pt; }
.alias-target {
  font-family: "JetBrains Mono", monospace;
  font-size: 8.0pt;
  font-weight: 700;
  color: #2563eb;
  background: #eff6ff;
  padding: 0.5pt 3pt;
  border-radius: 2pt;
  flex-shrink: 0;
}
</style>`;

function renderAliasIndex(data, helpers) {
  const entries = [];

  for (const e of data.ENDORSEMENTS) {
    // Add title
    entries.push({ term: e.title, id: e.id, cat: e.category });
    // Add aliases
    for (const a of e.aliases || []) {
      entries.push({ term: a, id: e.id, cat: e.category });
    }
  }

  // Common aviation synonym mappings
  const extraSynonyms = [
    { term: "BFR (Biennial Flight Review)", id: "A.69" },
    { term: "Flight Review Sign-off", id: "A.69" },
    { term: "Instrument Proficiency Check (IPC)", id: "A.70" },
    { term: "Complex Aircraft Endorsement", id: "A.72" },
    { term: "High-Performance Airplane", id: "A.73" },
    { term: "High-Altitude Endorsement (Pressurized)", id: "A.74" },
    { term: "Tailwheel Transition Endorsement", id: "A.75" },
    { term: "Spin Training Competency (CFI)", id: "A.49" },
    { term: "FOI Knowledge Test Signoff", id: "A.46" },
    { term: "Retest After Checkride Failure", id: "A.77" },
    { term: "Pre-Solo Aeronautical Knowledge Test", id: "A.3" },
    { term: "Pre-Solo Flight Training (14 CFR 61.87)", id: "A.4" },
    { term: "First 90-Day Solo Flight", id: "A.6" },
    { term: "Solo Cross-Country Flight", id: "A.9" },
    { term: "Repeated Solo Cross-Country (50 NM)", id: "A.11" },
    { term: "Class B Airspace Solo Operation", id: "A.12" },
    { term: "TSA Citizenship Verification", id: "A.14" },
    { term: "Prerequisites for Practical Test", id: "A.1" },
    { term: "Review of Written Test Deficiencies (AKTR)", id: "A.2" },
    { term: "IACRA / 8710-1 Practical Test Recommendation", id: "A.1" },
  ];
  for (const s of extraSynonyms) {
    const e = helpers.endorsementById.get(s.id);
    if (e) entries.push({ term: s.term, id: s.id, cat: e.category });
  }

  // Deduplicate by term
  const unique = new Map();
  for (const item of entries) {
    const key = item.term.trim().toLowerCase();
    if (!unique.has(key)) unique.set(key, item);
  }

  const sorted = [...unique.values()].sort((a, b) => a.term.localeCompare(b.term));

  // Group by first letter
  const byLetter = new Map();
  for (const item of sorted) {
    const letter = item.term[0].toUpperCase();
    if (!byLetter.has(letter)) byLetter.set(letter, []);
    byLetter.get(letter).push(item);
  }

  const groupsHtml = [...byLetter.entries()].map(([letter, items]) => {
    const rows = items.map((it) => {
      const anchor = helpers.anchorForEndorsement(it.id);
      return `<a class="alias-row internal" href="#${anchor}">
        <span class="alias-term">${helpers.esc(it.term)}</span>
        <span class="alias-arrow">&rarr;</span>
        <span class="alias-target">${helpers.esc(it.id)}</span>
      </a>`;
    }).join("\n");

    return `<div class="alias-group">
      <div class="alias-group-letter">${letter}</div>
      ${rows}
    </div>`;
  }).join("\n");

  return `<div class="page-break alias-wrap">
    <div class="alias-header">
      <h2 class="alias-title" id="alias-index">Appendix — Plain-Language &amp; Alias Index (A–Z)</h2>
      <p class="alias-sub">Comprehensive cross-reference index mapping colloquial aviation terminology, slang, FAR acronyms, and practical test codes directly to official AC 61-65K endorsement numbers.</p>
    </div>
    <div class="alias-columns">
      ${groupsHtml}
    </div>
  </div>`;
}

module.exports = {
  title: "Appendix — Plain-Language & Alias Index (A–Z)",
  render(data, helpers) {
    return SCOPED_CSS + "\n" + renderAliasIndex(data, helpers);
  },
};
