"use strict";

/**
 * sections/20-part2-workflows.js — Part II divider + workflow flow-pages.
 *
 * Renders:
 *   1. Part II divider (h1#part-2) with an explainer and a mini-TOC chip
 *      grid: one chip per featured flow → #wf-<id>, plus a navy index chip
 *      → #wf-index.
 *   2. One flow page per featured bundle in BROWSE_STRUCTURE, plus the
 *      student-pilot "pre-solo" bundle (contentRenderer: "pre-solo"), in
 *      BROWSE_STRUCTURE category order. Each page: id="wf-<bundle.id>",
 *      numbered endorsement steps linking to Part I cards (#A-<n>),
 *      supplemental chips, and a back-link to the Part I category.
 *   3. An "All workflows index" (h3) listing every bundle, grouped by
 *      category, linking to the Part I bundle headers (#bundle-<id>).
 *
 * Custom styles are scoped to .wf-* and inlined below; category colors come
 * from helpers.themeVars(slug) → var(--cat-*) only. Navy ID pills reuse the
 * shared .id-pill class with the helpers.NAVY constant.
 */

const SCOPED_CSS = `<style>
/* Part II — workflow flows (scoped: wf-*) */
.wf-part-lead { font-size: 11pt; line-height: 1.5; color: #374151; max-width: 46em; }
/* Part II divider mini-TOC: one theme-colored chip per featured flow plus a
   navy index chip; same chip anatomy as the Part I/III divider grids. */
.wf-grid-label { font-size: 8.5pt; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #6b7280; margin: 14pt 0 5pt; }
.wf-flow-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 5pt; }
.wf-flow-chip { display: flex; align-items: center; gap: 6pt; padding: 5pt 9pt; background: var(--cat-soft, #f3f4f8); border: 0.75pt solid var(--cat-line, #d9dce6); border-left: 3.5pt solid var(--cat-accent, #1c2142); border-radius: 4pt; text-decoration: none; break-inside: avoid; }
.wf-flow-label { font-weight: 600; font-size: 9.5pt; color: var(--cat-ink, #1c2142); }
.wf-flow-cat { margin-left: auto; font-size: 8pt; font-weight: 700; color: var(--cat-accent, #6b7280); white-space: nowrap; text-align: right; }
.wf-title { margin: 0 0 2pt; }
.wf-swatch { display: inline-block; width: 9pt; height: 9pt; border-radius: 50%; background: var(--cat-accent, #475569); margin-right: 6pt; }
.wf-meta { margin: 0 0 6pt; }
.wf-cat-chip { display: inline-block; padding: 1pt 7pt; border-radius: 8pt; font-size: 8pt; font-weight: 600; color: var(--cat-ink, #313b4a); background: var(--cat-soft, #f0f1f3); border: 0.75pt solid var(--cat-line, #d1d5da); }
.wf-lead { font-size: 12pt; color: #374151; margin: 0 0 10pt; line-height: 1.45; }
.wf-h3 { margin: 12pt 0 5pt; color: var(--cat-ink, #1c2142); }
.wf-steps { list-style: none; margin: 0 0 10pt; padding: 0; counter-reset: wf-step; }
.wf-step { position: relative; counter-increment: wf-step; margin: 0 0 6pt; padding: 7pt 10pt 7pt 32pt; background: var(--cat-soft, #f7f7f8); border: 0.75pt solid var(--cat-line, #d1d5da); border-left: 3pt solid var(--cat-accent, #475569); border-radius: 4pt; break-inside: avoid; }
.wf-steps .wf-step::before { content: counter(wf-step); position: absolute; left: 8pt; top: 8pt; width: 15pt; height: 15pt; border-radius: 50%; background: var(--cat-accent, #475569); color: #ffffff; font-size: 8.5pt; font-weight: 700; line-height: 15pt; text-align: center; }
.wf-step-head { display: flex; align-items: baseline; gap: 7pt; margin-bottom: 2pt; }
.wf-step-link { font-weight: 700; font-size: 13.5pt; color: #1c2142; }
.wf-step-title { font-weight: 700; font-size: 13.5pt; color: #1c2142; }
.wf-step-desc { margin: 0; font-size: 11.5pt; color: #4b5563; line-height: 1.4; }
.wf-step-tim { padding-left: 10pt; }
.wf-tim { margin: 0 0 10pt; }
.wf-tim-pill { display: inline-block; min-width: 15pt; height: 15pt; border-radius: 50%; background: var(--cat-accent, #475569); color: #ffffff; font-size: 8.5pt; font-weight: 700; line-height: 15pt; text-align: center; padding: 0 3pt; box-sizing: border-box; }
.wf-refs { margin-top: 4pt; }
.wf-supplemental { margin: 0 0 10pt; padding: 7pt 10pt; border: 0.75pt dashed var(--cat-line, #d1d5da); border-radius: 4pt; break-inside: avoid; }
.wf-supp-label { display: block; font-size: 8pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--cat-ink, #313b4a); margin-bottom: 4pt; }
.wf-supp-chip { display: inline-block; margin: 0 4pt 3pt 0; padding: 2pt 7pt; border-radius: 8pt; font-size: 8.5pt; background: #ffffff; border: 0.75pt solid var(--cat-line, #d1d5da); color: var(--cat-ink, #313b4a); }
.wf-supp-note { margin: 3pt 0 0; font-size: 8.5pt; color: #6b7280; font-style: italic; }
.wf-catlink { margin: 8pt 0 0; font-size: 9pt; }
.wf-res-links, .wf-regs { margin: 4pt 0 8pt; }
.wf-reg-note { color: #4b5563; }
.wf-index-cat { margin: 0 0 8pt; padding: 7pt 10pt; background: var(--cat-soft, #f7f7f8); border: 0.75pt solid var(--cat-line, #d1d5da); border-radius: 4pt; break-inside: avoid; }
.wf-index-cat-title { margin: 0 0 4pt; color: var(--cat-ink, #1c2142); }
.wf-index-list { margin: 0; padding-left: 16pt; columns: 2; font-size: 9pt; }
.wf-index-list li { margin-bottom: 2pt; break-inside: avoid; }
.wf-flow-link { font-size: 8pt; }
</style>`;

/** One linked chip for an endorsement id, e.g. "A.14 — TSA …". */
function suppChip(id, helpers) {
  const e = helpers.endorsementById.get(id);
  if (!e) return "";
  const anchor = helpers.anchorForEndorsement(e.id);
  return (
    `<a class="wf-supp-chip internal" href="#${helpers.esc(anchor)}">` +
    `<strong>${helpers.esc(e.id)}</strong> — ${helpers.esc(e.title)}</a>`
  );
}

/** Numbered step list: one step per primaryIds endorsement. */
function stepsHtml(bundle, helpers) {
  const steps = (bundle.primaryIds || [])
    .map((id) => {
      const e = helpers.endorsementById.get(id);
      if (!e) return "";
      const anchor = helpers.anchorForEndorsement(e.id);
      return `<li class="wf-step">
      <div class="wf-step-head"><span class="id-pill" style="background:${helpers.NAVY}">${helpers.esc(e.id)}</span>
      <a class="wf-step-link internal" href="#${helpers.esc(anchor)}">${helpers.esc(e.title)}</a></div>
      <p class="wf-step-desc">${helpers.esc(e.cardExplanation || "")}</p>
    </li>`;
    })
    .filter(Boolean)
    .join("\n");
  if (!steps) return "";
  return `<ol class="wf-steps">\n${steps}\n</ol>`;
}

/** "Also commonly included" row of linked chips for supplementalIds. */
function supplementalHtml(bundle, helpers) {
  const ids = bundle.supplementalIds || [];
  if (!ids.length) return "";
  const chips = ids.map((id) => suppChip(id, helpers)).filter(Boolean).join("\n    ");
  if (!chips) return "";
  const note = bundle.supplementalLabel
    ? `\n    <p class="wf-supp-note">${helpers.esc(bundle.supplementalLabel)}</p>`
    : "";
  return `<div class="wf-supplemental">
    <span class="wf-supp-label">Also commonly included</span>
    ${chips}${note}
  </div>`;
}

/**
 * Chip for a prerequisite ref string. "AC 61-65K, A.14" links internally to
 * that endorsement's Part I card; CFR citations go through cfrChip (eCFR).
 */
function refChip(ref, helpers) {
  const m = String(ref).match(/AC 61-65[A-Z]?,?\s*(A\.\d+)/);
  if (m && helpers.endorsementById.get(m[1])) {
    const anchor = helpers.anchorForEndorsement(m[1]);
    return `<a class="chip cfr-chip internal" href="#${helpers.esc(anchor)}">${helpers.esc(ref)}</a>`;
  }
  return helpers.cfrChip(ref);
}

/** The pre-solo "resources" accordion: external links + regulation list. */
function resourcesHtml(section, helpers) {
  const links = (section.links || [])
    .map(
      (l) =>
        `<li><a class="external" href="${helpers.esc(l.url)}" target="_blank" rel="noopener noreferrer">${helpers.esc(l.label)}</a></li>`
    )
    .join("\n    ");
  const regs = (section.regs || [])
    .map((r) => {
      const m = String(r).match(/^(\d+) CFR ([\d.]+(?:\([a-z0-9]+\))?)\s*[—–-]\s*(.+)$/i);
      if (m) {
        return `<li>${helpers.cfrChip(`${m[1]} CFR § ${m[2]}`)} <span class="wf-reg-note">${helpers.esc(m[3])}</span></li>`;
      }
      return `<li>${helpers.esc(r)}</li>`;
    })
    .join("\n    ");
  const linksUl = links ? `<ul class="wf-res-links">\n    ${links}\n  </ul>` : "";
  const regsUl = regs ? `<ul class="wf-regs">\n    ${regs}\n  </ul>` : "";
  return `<h3 class="wf-h3">${helpers.esc(section.heading)}</h3>\n  ${linksUl}\n  ${regsUl}`;
}

/**
 * Special case: the pre-solo bundle renders PRE_SOLO_CONTENT — the intro,
 * the T / I / M prerequisite step cards, then the accordion sections via
 * helpers.renderBlocks — instead of endorsement steps.
 */
function preSoloHtml(data, helpers) {
  const ps = data.PRE_SOLO_CONTENT || {};
  const timCards = (ps.prerequisites || [])
    .map(
      (p) => `<div class="wf-step wf-step-tim">
      <div class="wf-step-head"><span class="wf-tim-pill">${helpers.esc(p.id)}</span>
      <span class="wf-step-title">${helpers.esc(p.title)}</span></div>
      <p class="wf-step-desc">${helpers.esc(p.description)}</p>
      <div class="wf-refs">${(p.refs || []).map((r) => refChip(r, helpers)).join("\n      ")}</div>
    </div>`
    )
    .join("\n");

  const accordions = (ps.accordionSections || [])
    .map((s) => {
      if (s.type === "resources") return resourcesHtml(s, helpers);
      if (!Array.isArray(s.blocks) || !s.blocks.length) return "";
      return `<h3 class="wf-h3">${helpers.esc(s.heading)}</h3>\n${helpers.renderBlocks(s.blocks)}`;
    })
    .filter(Boolean)
    .join("\n");

  const intro = ps.intro ? `<p class="wf-lead">${helpers.esc(ps.intro)}</p>` : "";
  return `${intro}
  <h3 class="wf-h3">Before the first solo — T · I · M</h3>
  <div class="wf-tim">
  ${timCards}
  </div>
  ${accordions}`;
}

/** One flow page for a bundle. */
function flowPage(categorySlug, bundle, data, helpers) {
  const isPreSolo = bundle.contentRenderer === "pre-solo";
  const catLabel = helpers.CATEGORY_LABELS[categorySlug] || categorySlug;
  const body = isPreSolo
    ? preSoloHtml(data, helpers)
    : `${stepsHtml(bundle, helpers)}\n  ${supplementalHtml(bundle, helpers)}`;
  return `<section class="page-break wf-flow" id="wf-${helpers.esc(bundle.id)}" style="${helpers.themeVars(categorySlug)}">
  ${helpers.pgmMarker(`wf:${bundle.id}`)}
  <h2 class="wf-title"><span class="wf-swatch"></span>${helpers.esc(bundle.label)}</h2>
  <p class="wf-meta"><span class="wf-cat-chip">${helpers.esc(catLabel)}</span></p>
  <p class="wf-lead">${helpers.esc(bundle.description || "")}</p>
  ${body}
  <p class="wf-catlink"><a class="internal" href="#cat-${helpers.esc(categorySlug)}">Open this category in Part I →</a></p>
</section>`;
}

/** "All workflows index": every bundle, grouped by category → #bundle-<id>. */
function indexHtml(data, helpers, flowIds) {
  const cats = data.BROWSE_STRUCTURE.map((cat) => {
    const items = cat.subcategories
      .map((b) => {
        const flow = flowIds.has(b.id)
          ? ` · <a class="wf-flow-link internal" href="#wf-${helpers.esc(b.id)}">flow page</a>`
          : "";
        return `<li><a class="internal" href="#bundle-${helpers.esc(b.id)}">${helpers.esc(b.label)}</a>${flow}</li>`;
      })
      .join("\n    ");
    return `<div class="wf-index-cat" style="${helpers.themeVars(cat.categoryId)}">
    <h4 class="wf-index-cat-title"><span class="wf-swatch"></span>${helpers.esc(
      helpers.CATEGORY_LABELS[cat.categoryId] || cat.categoryId
    )}</h4>
    <ul class="wf-index-list">
    ${items}
    </ul>
  </div>`;
  }).join("\n");

  return `<div class="page-break wf-index">
  <span class="pgm" aria-hidden="true">ZZPGM|wf:wf-index|ZZ</span>
  <h3 id="wf-index">All workflows index</h3>
  <p class="wf-lead">Every bundle in the book, grouped by category. Links jump to the bundle headers in Part I; bundles with a dedicated flow page also link back to it.</p>
  ${cats}
</div>`;
}

module.exports = {
  title: "Part II — Workflow Flows",
  render(data, helpers) {
    // Featured bundles in BROWSE_STRUCTURE order, plus the pre-solo bundle.
    const flows = [];
    for (const cat of data.BROWSE_STRUCTURE) {
      for (const bundle of cat.subcategories) {
        if (bundle.featured || bundle.contentRenderer === "pre-solo") {
          flows.push({ categorySlug: cat.categoryId, bundle });
        }
      }
    }
    const flowIds = new Set(flows.map((f) => f.bundle.id));

    /* Divider mini-TOC: one chip per featured flow (category themeVars) plus
       a navy chip for the all-workflows index — 9 flows + index. */
    const navItems = flows
      .map(
        ({ categorySlug, bundle }) =>
          `<a class="internal wf-flow-chip" href="#wf-${helpers.esc(bundle.id)}" style="${helpers.themeVars(categorySlug)}">` +
          `<span class="wf-flow-label">${helpers.esc(bundle.label)}</span>` +
          `<span class="wf-flow-cat">${helpers.esc(
            helpers.CATEGORY_LABELS[categorySlug] || categorySlug
          )}</span></a>`
      )
      .join("\n  ");

    const bundleTotal = data.BROWSE_STRUCTURE.reduce(
      (n, c) => n + c.subcategories.length,
      0
    );
    const indexChip =
      `<a class="internal wf-flow-chip" href="#wf-index" ` +
      `style="--cat-accent:${helpers.NAVY};--cat-soft:#f3f4f8;--cat-line:#d9dce6;--cat-ink:${helpers.NAVY}">` +
      `<span class="wf-flow-label">All workflows index</span>` +
      `<span class="wf-flow-cat">${bundleTotal} bundles</span></a>`;

    const divider = `<div class="page-break wf-divider">
<span class="pgm" aria-hidden="true">ZZPGM|part:part-2|ZZ</span>
<h1 class="section-title" id="part-2">Part II — Workflow Flows</h1>
<p class="wf-part-lead">This part walks through the most common real-world sign-off workflows a CFI performs — from a student pilot's pre-solo prerequisites and first solo to checkride packages, flight reviews, and aircraft endorsements. Each numbered step names the exact AC 61-65K endorsement used at that point and links straight to its full card in Part I, so you can jump from the workflow to the verbatim endorsement language and back. Supplemental endorsements that are commonly signed in the same sitting are listed under "Also commonly included."</p>
<p class="wf-grid-label">In this part — ${flows.length} featured flows + index</p>
<div class="wf-flow-grid">
  ${navItems}
  ${indexChip}
</div>
</div>`;

    const pages = flows
      .map(({ categorySlug, bundle }) => flowPage(categorySlug, bundle, data, helpers))
      .join("\n");

    return `${SCOPED_CSS}\n${divider}\n${pages}\n${indexHtml(data, helpers, flowIds)}`;
  },
};
