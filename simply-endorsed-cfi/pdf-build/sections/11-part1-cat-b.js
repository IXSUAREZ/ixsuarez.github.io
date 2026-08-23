"use strict";

/**
 * sections/11-part1-cat-b.js — Part I category chapters, group B:
 *   sport-pilot → recreational-pilot → private-pilot → commercial-pilot → atp
 * (in CATEGORY_ORDER). The Part I divider and the first categories live in
 * sections/10-part1-cat-a.js; this file renders chapters only, so it emits
 * NO h1 (the Part I h1 belongs to the divider section).
 *
 * Chapter pattern (shared Part I contract):
 *   helpers.renderCategoryHeader(slug, count)   — .category-banner breaks
 *                                                 to a fresh page by itself
 *   for each bundle in BROWSE_STRUCTURE order:
 *     helpers.renderBundleHeader(bundle, slug)  — includes the description
 *     full card for every primaryIds entry
 *     "Supplemental —" label + full card for every supplementalIds entry
 *   own-category endorsements not in any of the category's bundles render
 *   under <h3>Other endorsements in this category</h3>
 *   every card via helpers.renderEndorsementCard(e, { relatedHtml }) with
 *   up to 4 related chips: bundle co-members first, then tag-overlap within
 *   the same category.
 *
 * Anchor discipline: bundles deliberately re-render shared endorsements
 * (A.1/A.2/A.36/A.37/A.38/A.39/A.78 appear in several bundles), but an
 * id="A-<n>" anchor is only kept on the FIRST own-category occurrence in
 * this file; later occurrences and cross-category cards (A.1, A.2 →
 * practical-test-prereqs chapter; A.78 → additional-recurrent chapter) have
 * the id stripped so the book never gets duplicate anchors from this file.
 * Canonical anchors for cross-category cards are emitted by the chapters
 * that own those categories.
 */

const CHAPTER_SLUGS = new Set([
  "sport-pilot",
  "recreational-pilot",
  "private-pilot",
  "commercial-pilot",
  "atp",
]);

/** Scoped styles for this section only (p1b- prefix). */
const STYLE_BLOCK = `<style>
.p1b-supp-label{font-size:9pt;font-weight:600;color:var(--cat-ink,#313b4a);margin:10pt 0 2pt 0;padding-left:14pt;break-after:avoid;}
.p1b-rel-label{font-weight:600;color:var(--cat-ink,#313b4a);margin-right:3pt;}
</style>`;

/**
 * Up to 4 related chips for a card: first other endorsements sharing any
 * bundle with this one (BROWSE_STRUCTURE order, primary then supplemental
 * as listed), then tag-overlap within the same category (most shared tags
 * first, ties by endorsement order). Chips link to #A-<n>.
 */
function relatedChipsHtml(e, data, helpers) {
  const seen = new Set([e.id]);
  const picks = [];

  for (const cat of data.BROWSE_STRUCTURE) {
    for (const bundle of cat.subcategories || []) {
      const members = [...(bundle.primaryIds || []), ...(bundle.supplementalIds || [])];
      if (!members.includes(e.id)) continue;
      for (const mid of members) {
        if (picks.length >= 4) break;
        if (seen.has(mid)) continue;
        const m = helpers.endorsementById.get(mid);
        if (!m) continue;
        seen.add(mid);
        picks.push(m);
      }
    }
  }

  if (picks.length < 4) {
    const myTags = new Set(e.tags || []);
    const candidates = data.ENDORSEMENTS.filter(
      (x) => x.category === e.category && !seen.has(x.id)
    )
      .map((x) => ({
        x,
        shared: (x.tags || []).filter((t) => myTags.has(t)).length,
      }))
      .filter((c) => c.shared > 0)
      .sort((a, b) => b.shared - a.shared || (a.x.order || 0) - (b.x.order || 0));
    for (const c of candidates) {
      if (picks.length >= 4) break;
      seen.add(c.x.id);
      picks.push(c.x);
    }
  }

  if (!picks.length) return "";
  const chips = picks
    .map(
      (m) =>
        `<a class="chip tag-chip internal" href="#${helpers.anchorForEndorsement(
          m.id
        )}">${helpers.esc(m.id)} · ${helpers.esc(m.title)}</a>`
    )
    .join("\n      ");
  return `<span class="p1b-rel-label">Related:</span> ${chips}`;
}

/**
 * Render one endorsement card. Keeps the id="A-<n>" anchor only on the
 * first own-category occurrence in this file (see header comment).
 */
function renderCard(id, data, helpers, emittedAnchors) {
  const e = helpers.endorsementById.get(id);
  if (!e) return "";
  let html = helpers.renderEndorsementCard(e, {
    relatedHtml: relatedChipsHtml(e, data, helpers),
  });
  const anchor = helpers.anchorForEndorsement(e.id);
  if (CHAPTER_SLUGS.has(e.category) && !emittedAnchors.has(anchor)) {
    emittedAnchors.add(anchor);
  } else {
    html = html.replace(` id="${anchor}"`, "");
  }
  return html;
}

function renderChapter(slug, data, helpers, emittedAnchors) {
  const category = data.BROWSE_STRUCTURE.find((c) => c.categoryId === slug);
  const own = data.ENDORSEMENTS.filter((e) => e.category === slug);
  const bundledIds = new Set();
  const out = [];

  out.push(`<section class="p1b-chapter" style="${helpers.themeVars(slug)}">`);
  out.push(helpers.renderCategoryHeader(slug, own.length));

  for (const bundle of (category && category.subcategories) || []) {
    out.push(helpers.renderBundleHeader(bundle, slug));
    for (const id of bundle.primaryIds || []) {
      bundledIds.add(id);
      out.push(renderCard(id, data, helpers, emittedAnchors));
    }
    if (Array.isArray(bundle.supplementalIds) && bundle.supplementalIds.length) {
      const label =
        bundle.supplementalLabel ||
        "Additional endorsements commonly grouped with this bundle.";
      out.push(
        `<p class="p1b-supp-label">Supplemental — ${helpers.esc(label)}</p>`
      );
      for (const id of bundle.supplementalIds) {
        bundledIds.add(id);
        out.push(renderCard(id, data, helpers, emittedAnchors));
      }
    }
  }

  const others = own
    .filter((e) => !bundledIds.has(e.id))
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  if (others.length) {
    out.push(`<h3>Other endorsements in this category</h3>`);
    for (const e of others) {
      out.push(renderCard(e.id, data, helpers, emittedAnchors));
    }
  }

  out.push(`</section>`);
  return out.filter(Boolean).join("\n");
}

module.exports = {
  title: "Part I — Categories: Sport, Recreational, Private, Commercial, ATP",

  render(data, helpers) {
    const slugs = helpers.CATEGORY_ORDER.filter((s) => CHAPTER_SLUGS.has(s));
    const emittedAnchors = new Set();
    const chapters = slugs.map((slug) =>
      renderChapter(slug, data, helpers, emittedAnchors)
    );
    return `${STYLE_BLOCK}\n${chapters.join("\n")}`;
  },
};
