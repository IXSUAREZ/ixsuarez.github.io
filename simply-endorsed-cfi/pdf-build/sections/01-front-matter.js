"use strict";

/**
 * sections/01-front-matter.js — "How to use this PDF", the category color
 * legend, and the master TOC (Contents) on its own page.
 *
 * Heading plan (single h1 per file): h2 How to use → h2 Color legend →
 * h1 Contents → h2 part groups.
 * Extra styles are scoped under .fm-* / .toc-* (only names not present in
 * pdf.css) so they cannot clash with other sections.
 */

module.exports = {
  title: "Front Matter",

  render(data, helpers) {
    const { esc, anchorForEndorsement, themeVars, CATEGORY_ORDER, CATEGORY_LABELS } = helpers;

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
      `<strong>Clickable contents.</strong> The master TOC on the next page — and every cross-reference in this book — is a live link. Click any row, chip, or card ID to jump straight to it.`,
      `<strong>Category color coding.</strong> Each of the ${CATEGORY_ORDER.length} endorsement categories owns a color (legend below). Category banners, bundle headers, and endorsement cards all wear their category color.`,
      `<strong>Endorsement chips.</strong> Inline chips like ${exampleChip} jump to that endorsement's full card — verbatim AC text, plain-English notes, and citations.`,
      `<strong>External links.</strong> eCFR regulation citations and FAA source links open in your browser and are marked with &#8599;.`,
      `<strong>PDF bookmarks.</strong> Your PDF viewer's outline/bookmark panel mirrors this book's heading structure (parts &rarr; categories &rarr; bundles &rarr; endorsements) for quick navigation.`,
    ]
      .map((html) => `<li>${html}</li>`)
      .join("\n      ");

    /* ── (b) Category color legend ────────────────────────────────────── */

    const legendChips = CATEGORY_ORDER.map((slug) => {
      const count = counts[slug] || 0;
      return `<a class="internal fm-cat-chip" href="#cat-${esc(slug)}" style="${themeVars(slug)}">
        <span class="fm-cat-label">${esc(CATEGORY_LABELS[slug] || slug)}</span>
        <span class="fm-cat-count">${count}</span>
      </a>`;
    }).join("\n      ");

    /* ── (c) Master TOC ───────────────────────────────────────────────── */

    const part1Rows = CATEGORY_ORDER.map((slug) => {
      const count = counts[slug] || 0;
      return `<li class="toc-row" style="${themeVars(slug)}">
          <span class="toc-dot"></span>
          <a class="internal toc-link" href="#cat-${esc(slug)}">${esc(CATEGORY_LABELS[slug] || slug)}</a>
          <span class="toc-count">${count}</span>
        </li>`;
    }).join("\n        ");

    const part2Rows = featured.map((b) => {
      return `<li class="toc-row" style="${themeVars(b.categoryId)}">
          <span class="toc-dot"></span>
          <a class="internal toc-link" href="#wf-${esc(b.id)}">${esc(b.label)}</a>
        </li>`;
    }).join("\n        ");

    const guidanceRows = [
      ["journey", "Student Journey"],
      ["scenarios", "Scenarios"],
      ["quickref", "Quick Reference"],
      ["cfi-career", "CFI Career"],
      ["flashcards", "DPE Prep Flashcards"],
      ["lesson-plan", "Lesson Plan"],
    ]
      .map(
        ([anchor, label]) => `<li class="toc-row">
          <span class="toc-dot toc-dot-navy"></span>
          <a class="internal toc-link" href="#${esc(anchor)}">${esc(label)}</a>
        </li>`
      )
      .join("\n        ");

    return `<!-- (a)(b) front matter intro page -->
<div class="fm-intro">
  <h2 class="fm-h">How to use this PDF</h2>
  <div class="fm-howto">
    <ul>
      ${howtoItems}
    </ul>
  </div>
  <div class="fm-navchrome">
    <p class="fm-navchrome-title">Navigation chrome</p>
    <table class="fm-navchrome-table">
      <tr><th>Top bar</th><td>Jump between Contents, Part I Library, Part II Workflows, and Part III Guidance &mdash; the active part is highlighted.</td></tr>
      <tr><th>Right-edge rail</th><td>Numbered subcategory beads for the current chapter &mdash; tap a bead to jump to that bundle. The active bead marks where you are.</td></tr>
      <tr><th>Bottom dock</th><td>Breadcrumb + page number, &lsaquo; PREV / NEXT &rsaquo; section buttons, and BACK (uses your PDF viewer&#39;s history, like a browser back button).</td></tr>
      <tr><th>Cover</th><td>The cover page has no chrome.</td></tr>
    </table>
  </div>
  <h2 class="fm-h">Category color legend</h2>
  <div class="fm-legend-grid">
      ${legendChips}
  </div>
</div>

<!-- (c) master TOC on its own page -->
<div class="page-break">
  <span class="pgm">ZZPGM|toc:toc|ZZ</span>
  <h1 class="section-title">Contents</h1>
  <div class="toc-cols">
    <div class="toc-col">
      <h2 class="toc-part"><a class="internal" href="#part-1">Part I &mdash; Endorsement Library</a></h2>
      <p class="toc-part-note">${data.ENDORSEMENTS.length} endorsements &middot; ${CATEGORY_ORDER.length} categories</p>
      <ul class="toc-list toc-rows">
        ${part1Rows}
      </ul>
    </div>
    <div class="toc-col">
      <h2 class="toc-part"><a class="internal" href="#part-2">Part II &mdash; Workflow Flows</a></h2>
      <p class="toc-part-note">${featured.length} featured flows</p>
      <ul class="toc-list toc-rows">
        ${part2Rows}
      </ul>
      <h2 class="toc-part"><a class="internal" href="#part-3">Part III &mdash; Guidance</a></h2>
      <ul class="toc-list toc-rows">
        ${guidanceRows}
      </ul>
      <h2 class="toc-part"><a class="internal" href="#appendix">Appendix</a></h2>
    </div>
  </div>
</div>
<style>
/* front matter intro (scoped .fm-*) */
.fm-h {
  font-size: 13pt;
  color: #1C2142;
  margin: 0 0 6pt 0;
  padding-bottom: 3pt;
  border-bottom: 1pt solid #d7dbe2;
}
.fm-h + .fm-howto, .fm-h + .fm-legend-grid { margin-bottom: 14pt; }
.fm-howto {
  background: #f8f9fb;
  border: 0.75pt solid #d7dbe2;
  border-left: 4pt solid #1C2142;
  border-radius: 4pt;
  padding: 8pt 12pt;
}
.fm-howto ul { margin: 0; padding-left: 14pt; }
.fm-howto li { margin-bottom: 4pt; font-size: 9.5pt; }
.fm-howto li:last-child { margin-bottom: 0; }
.fm-navchrome { margin: 0 0 14pt 0; }
.fm-navchrome-title {
  margin: 0 0 3pt 0;
  font-size: 8pt;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #6b7280;
}
.fm-navchrome-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 9pt;
  background: #f8f9fb;
  border: 0.75pt solid #d7dbe2;
  border-radius: 4pt;
}
.fm-navchrome-table th,
.fm-navchrome-table td {
  border: 0.75pt solid #d7dbe2;
  padding: 3.5pt 8pt;
  text-align: left;
  vertical-align: top;
}
.fm-navchrome-table th {
  width: 1.15in;
  font-size: 8pt;
  font-weight: 700;
  color: #1C2142;
  white-space: nowrap;
}
.fm-inline-chip {
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 8pt;
  font-weight: 700;
  padding: 0.5pt 5pt;
  border-radius: 7pt;
  background: #1C2142;
  color: #ffffff !important;
}
.fm-legend-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 5pt;
}
.fm-cat-chip {
  display: flex;
  align-items: center;
  gap: 6pt;
  padding: 4pt 8pt;
  background: var(--cat-soft);
  border: 0.75pt solid var(--cat-line);
  border-left: 3.5pt solid var(--cat-accent);
  border-radius: 4pt;
  color: var(--cat-ink);
  text-decoration: none;
  font-size: 8.5pt;
  break-inside: avoid;
}
.fm-cat-label { font-weight: 600; color: var(--cat-ink); }
.fm-cat-count {
  margin-left: auto;
  font-size: 8pt;
  font-weight: 700;
  color: var(--cat-accent);
}
/* master TOC (scoped .toc-* additions; .toc-list itself lives in pdf.css) */
.toc-cols { display: flex; gap: 18pt; align-items: flex-start; }
.toc-col { flex: 1 1 0; }
.toc-part {
  font-size: 10.5pt;
  margin: 10pt 0 4pt 0;
  padding-bottom: 2pt;
  border-bottom: 1pt solid #d7dbe2;
}
.toc-col > .toc-part:first-child { margin-top: 0; }
.toc-part a { color: #1C2142; }
.toc-part-note {
  margin: 0 0 4pt 0;
  font-size: 8pt;
  color: #6b7280;
}
.toc-rows { margin: 0; }
.toc-rows .toc-row {
  display: flex;
  align-items: baseline;
  gap: 6pt;
  margin: 0 0 2.5pt 0;
  font-size: 9pt;
  break-inside: avoid;
}
.toc-dot {
  flex: 0 0 auto;
  width: 6pt;
  height: 6pt;
  border-radius: 50%;
  background: var(--cat-accent, #1C2142);
  align-self: center;
}
.toc-dot-navy { background: #1C2142; }
.toc-link { color: #1f2430; }
.toc-count {
  margin-left: auto;
  font-size: 8pt;
  font-weight: 700;
  color: var(--cat-accent, #6b7280);
}
</style>`;
  },
};
