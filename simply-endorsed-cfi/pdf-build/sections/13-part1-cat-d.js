"use strict";

/**
 * sections/13-part1-cat-d.js — Part I category chapters (group D):
 *   1. additional-recurrent  (20 endorsements, 11 bundles)
 *   2. robinson-sfar73       (9 endorsements, 2 bundles)
 *
 * No Part I divider here — that h1 lives in the divider section owned by
 * another agent. This file emits h2 (category banner) → h3 (bundle header)
 * → h4 (endorsement cards, via helpers.renderEndorsementCard).
 *
 * Chapter pattern (shared by all Part I category files):
 *   - helpers.renderCategoryHeader(slug, count) — .category-banner carries
 *     break-before:page in pdf.css, so every chapter starts on a fresh page.
 *   - Bundles in BROWSE_STRUCTURE order: helpers.renderBundleHeader (which
 *     already prints the description) → full cards for primaryIds →
 *     supplemental row (label + link chips).
 *   - Category endorsements not primary in any bundle → h3 "Other
 *     endorsements in this category" (only rendered when non-empty).
 *
 * Anchor-uniqueness rules applied here:
 *   - A.60 is primary in BOTH robinson bundles (r22-track, r44-track). The
 *     full card is rendered at its first occurrence (r22-track); later
 *     occurrences get a compact cross-reference line linking to #A-60.
 *   - Supplemental ids (A.1, A.2) belong to another category and get
 *     canonical cards there — they render as internal link chips, never as
 *     duplicate cards.
 *
 * SFAR 73 citations: helpers.cfrLink() returns null for them, so
 * helpers.cfrChip() (used inside renderEndorsementCard) already renders
 * them as plain, unlinked chips. No special handling needed.
 *
 * Related chips (per card, up to 4): other endorsements sharing a bundle
 * with this one first (bundle order, primaries then supplementals), then
 * tag-overlap within the same category (most overlap first, then AC order).
 */

const CATEGORY_SLUGS = ["additional-recurrent", "robinson-sfar73"];

/** Scoped styles for this section's small custom fragments. */
const STYLE_BLOCK = `<style>
.p1cd-supp { margin: 0 0 12pt 0; font-size: 9pt; color: #444; }
.p1cd-supp-label { margin-right: 4pt; font-style: italic; }
.p1cd-supp-title { color: #333; margin-right: 6pt; }
.p1cd-xref { margin: 0 0 12pt 0; font-size: 9pt; color: #444; }
.p1cd-related-label { margin-right: 4pt; color: #555; }
</style>`;

/** One internal link chip to an endorsement card anchor. */
function relatedChip(helpers, id) {
  return (
    `<a class="internal chip tag-chip" href="#${helpers.anchorForEndorsement(id)}">` +
    `${helpers.esc(id)}</a>`
  );
}

/**
 * Ids of endorsements sharing a bundle with `endorsementId`, in bundle
 * order (each bundle: primaryIds then supplementalIds), deduped, self
 * excluded. Cross-category bundle-mates (e.g. A.1/A.2 supplementals) are
 * kept — their canonical cards exist elsewhere in Part I.
 */
function bundleMates(subcategories, endorsementId) {
  const seen = new Set([endorsementId]);
  const out = [];
  for (const b of subcategories) {
    const ids = [...(b.primaryIds || []), ...(b.supplementalIds || [])];
    if (!ids.includes(endorsementId)) continue;
    for (const id of ids) {
      if (!seen.has(id)) {
        seen.add(id);
        out.push(id);
      }
    }
  }
  return out;
}

/**
 * Same-category endorsements sharing at least one tag with `e`, sorted by
 * overlap count (desc) then AC order (asc). `exclude` is a Set of ids
 * already picked (self + bundle mates).
 */
function tagOverlapMates(endorsements, e, exclude) {
  const myTags = new Set(e.tags || []);
  return endorsements
    .filter((c) => c.id !== e.id && !exclude.has(c.id))
    .map((c) => ({
      c,
      overlap: (c.tags || []).filter((t) => myTags.has(t)).length,
    }))
    .filter((x) => x.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap || a.c.order - b.c.order)
    .map((x) => x.c.id);
}

/** relatedHtml for one card: "Related:" label + up to 4 link chips. */
function relatedHtml(helpers, subcategories, categoryEndorsements, e) {
  const mates = bundleMates(subcategories, e.id);
  const picked = mates.slice(0, 4);
  if (picked.length < 4) {
    const exclude = new Set([e.id, ...mates]);
    picked.push(
      ...tagOverlapMates(categoryEndorsements, e, exclude).slice(
        0,
        4 - picked.length
      )
    );
  }
  if (!picked.length) return "";
  const chips = picked.map((id) => relatedChip(helpers, id)).join(" ");
  return `<span class="p1cd-related-label">Related:</span>${chips}`;
}

/** Full card for one endorsement id (defensive: skip unknown ids). */
function cardFor(helpers, subcategories, categoryEndorsements, id) {
  const e = helpers.endorsementById.get(id);
  if (!e) return "";
  return helpers.renderEndorsementCard(e, {
    relatedHtml: relatedHtml(helpers, subcategories, categoryEndorsements, e),
  });
}

/**
 * Compact cross-reference line for a primary id whose full card was
 * already rendered earlier in this chapter (A.60 in r44-track).
 */
function crossRefLine(helpers, id, firstBundle) {
  const e = helpers.endorsementById.get(id);
  const title = e ? ` ${helpers.esc(e.title)}` : "";
  return (
    `<p class="p1cd-xref">${relatedChip(helpers, id)}${title} — ` +
    `full card above under <a class="internal" href="#bundle-${helpers.esc(
      firstBundle.id
    )}">${helpers.esc(firstBundle.label)}</a>.</p>`
  );
}

/** Supplemental row: label + link chips with short titles (no duplicate cards). */
function supplementalBlock(helpers, bundle) {
  const ids = bundle.supplementalIds || [];
  if (!ids.length) return "";
  const label =
    bundle.supplementalLabel || "Related endorsements commonly included.";
  const items = ids
    .map((id) => {
      const e = helpers.endorsementById.get(id);
      if (!e) return "";
      return (
        `${relatedChip(helpers, id)} ` +
        `<span class="p1cd-supp-title">${helpers.esc(e.title)}</span>`
      );
    })
    .filter(Boolean)
    .join(" ");
  return (
    `<div class="p1cd-supp">` +
    `<span class="p1cd-supp-label">${helpers.esc(label)}</span>${items}</div>`
  );
}

/** One full category chapter. */
function renderCategory(data, helpers, slug) {
  const struct = data.BROWSE_STRUCTURE.find((c) => c.categoryId === slug);
  const categoryEndorsements = data.ENDORSEMENTS.filter(
    (e) => e.category === slug
  );
  if (!struct) return "";

  const parts = [helpers.renderCategoryHeader(slug, categoryEndorsements.length)];

  // Track ids already rendered as full cards so a primary appearing in two
  // bundles (A.60) never produces a duplicate anchor.
  const rendered = new Map(); // id → first bundle

  for (const bundle of struct.subcategories) {
    parts.push(helpers.renderBundleHeader(bundle, slug));
    for (const id of bundle.primaryIds || []) {
      if (rendered.has(id)) {
        parts.push(crossRefLine(helpers, id, rendered.get(id)));
      } else {
        rendered.set(id, bundle);
        parts.push(cardFor(helpers, struct.subcategories, categoryEndorsements, id));
      }
    }
    parts.push(supplementalBlock(helpers, bundle));
  }

  const unbundled = categoryEndorsements.filter((e) => !rendered.has(e.id));
  if (unbundled.length) {
    parts.push(`<h3>Other endorsements in this category</h3>`);
    for (const e of unbundled) {
      parts.push(
        helpers.renderEndorsementCard(e, {
          relatedHtml: relatedHtml(
            helpers,
            struct.subcategories,
            categoryEndorsements,
            e
          ),
        })
      );
    }
  }

  return parts.join("\n");
}

module.exports = {
  title: "Part I — Additional / Recurrent & Robinson SFAR 73",

  render(data, helpers) {
    const chapters = CATEGORY_SLUGS.map((slug) =>
      renderCategory(data, helpers, slug)
    );
    return STYLE_BLOCK + "\n" + chapters.join("\n");
  },
};
