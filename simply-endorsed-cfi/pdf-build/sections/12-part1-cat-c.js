"use strict";

/**
 * sections/12-part1-cat-c.js — Part I category chapters (no Part divider):
 *   instrument-rating, flight-instructor, sport-pilot-instructor
 *   (filtered through CATEGORY_ORDER). specialty-operations lives in
 *   13-part1-cat-d.js so the book's physical order matches CATEGORY_ORDER.
 *
 * Chapter pattern (per category):
 *   helpers.renderCategoryHeader(slug, count)   — h2 banner, page-breaks itself
 *   for each bundle in BROWSE_STRUCTURE order:
 *     helpers.renderBundleHeader(bundle, slug)  — h3 header (description included)
 *     Primary endorsements                      — full cards
 *     Supplemental endorsements                 — compact reference lines
 *   unbundled endorsements (if any) under h3 "Other endorsements in this category"
 *
 * Anchor-integrity rules for this section:
 *   - A full card (with its id="A-<n>" anchor) is rendered exactly ONCE per
 *     endorsement, at its first primary appearance. Several endorsements here
 *     repeat as primary across bundles (A.47/A.49 in the three CFI checkride
 *     bundles); repeats render as compact .p1c-ref lines linking to #A-<n>.
 *   - Supplementals are ALWAYS compact reference lines, never full cards:
 *     every supplemental id is primary somewhere (verified in the data), so
 *     the link target always exists. Cross-category supplementals (A.1, A.2)
 *     point at the Practical Test Prerequisites chapter.
 *
 * Related chips (full cards only, max 4): first other endorsements sharing a
 * bundle with this one (BROWSE_STRUCTURE order, primary then supplemental
 * ids), then tag-overlap within the same category (most shared tags first,
 * then numeric id). Chips link to #A-<n>.
 *
 * Extra styles are scoped under .p1c-* so they cannot clash with pdf.css or
 * other sections. Category colors come only from helpers.themeVars(slug),
 * set on the .p1c-chapter wrapper so var(--cat-*) inherit into the custom
 * elements (the helper-emitted banners/cards carry their own inline vars).
 */

const MY_SLUGS = [
  "instrument-rating",
  "flight-instructor",
  "sport-pilot-instructor",
];

const MAX_RELATED = 4;

/** "A.47" → 47 (for deterministic numeric ordering). */
function idNum(id) {
  const n = Number(String(id).split(".")[1]);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Up to 4 related chips for a full card: bundle-mates first (any bundle in
 * BROWSE_STRUCTURE containing this id, in app order), then tag-overlap
 * within the same category.
 */
function relatedHtml(e, data, helpers) {
  const seen = new Set([e.id]);
  const picked = [];

  outer: for (const cat of data.BROWSE_STRUCTURE) {
    for (const b of cat.subcategories) {
      const ids = [...b.primaryIds, ...(b.supplementalIds || [])];
      if (!ids.includes(e.id)) continue;
      for (const id of ids) {
        if (seen.has(id)) continue;
        seen.add(id);
        picked.push(id);
        if (picked.length === MAX_RELATED) break outer;
      }
    }
  }

  if (picked.length < MAX_RELATED) {
    const myTags = new Set(e.tags || []);
    const candidates = data.ENDORSEMENTS.filter(
      (x) => x.category === e.category && !seen.has(x.id)
    )
      .map((x) => ({
        x,
        shared: (x.tags || []).filter((t) => myTags.has(t)).length,
      }))
      .filter((c) => c.shared > 0)
      .sort((a, b) => b.shared - a.shared || idNum(a.x.id) - idNum(b.x.id));
    for (const c of candidates) {
      seen.add(c.x.id);
      picked.push(c.x.id);
      if (picked.length === MAX_RELATED) break;
    }
  }

  if (!picked.length) return "";

  const chips = picked
    .map((id) => {
      const target = helpers.endorsementById.get(id);
      const title = target ? ` title="${helpers.esc(target.title)}"` : "";
      return (
        `<a class="chip tag-chip internal" href="#${helpers.anchorForEndorsement(id)}"${title}>` +
        `${helpers.esc(id)}</a>`
      );
    })
    .join("\n      ");
  return `<span class="p1c-related-label">Related</span>\n      ${chips}`;
}

module.exports = {
  title:
    "Part I — Instrument Rating, Flight Instructor & Sport Pilot Instructor",

  render(data, helpers) {
    const { esc } = helpers;

    const orderedSlugs = helpers.CATEGORY_ORDER.filter((s) => MY_SLUGS.includes(s));

    // One full card per endorsement across the whole section; cardLocation
    // remembers which bundle label the full card lives under.
    const renderedIds = new Set();
    const cardLocation = new Map();

    /** Compact reference line linking to the full card rendered elsewhere. */
    function refLine(id) {
      const e = helpers.endorsementById.get(id);
      if (!e) return "";
      const anchor = helpers.anchorForEndorsement(id);
      const where = cardLocation.has(id)
        ? `full card under “${esc(cardLocation.get(id))}”`
        : `full card in ${esc(helpers.CATEGORY_LABELS[e.category] || e.category)}`;
      return `<p class="p1c-ref"><span class="id-pill">${esc(id)}</span> ` +
        `<a class="internal" href="#${anchor}">${esc(e.title)}</a> ` +
        `<span class="p1c-ref-note">— ${where}</span></p>`;
    }

    /** Full card (first primary appearance only) with related chips. */
    function fullCard(e, bundleLabel) {
      renderedIds.add(e.id);
      cardLocation.set(e.id, bundleLabel);
      return helpers.renderEndorsementCard(e, {
        relatedHtml: relatedHtml(e, data, helpers),
      });
    }

    const chapters = orderedSlugs
      .map((slug) => {
        const cat = data.BROWSE_STRUCTURE.find((c) => c.categoryId === slug);
        if (!cat) return "";
        const inCategory = data.ENDORSEMENTS.filter((e) => e.category === slug);

        let out = `<section class="p1c-chapter" style="${helpers.themeVars(slug)}">\n`;
        out += helpers.renderCategoryHeader(slug, inCategory.length) + "\n";

        const bundled = new Set();
        for (const bundle of cat.subcategories) {
          out += helpers.renderBundleHeader(bundle, slug) + "\n";

          const supIds = bundle.supplementalIds || [];
          if (supIds.length) {
            out += `<p class="p1c-group-label">Primary endorsements</p>\n`;
          }
          for (const id of bundle.primaryIds) {
            bundled.add(id);
            const e = helpers.endorsementById.get(id);
            if (!e) continue;
            out +=
              (renderedIds.has(id) ? refLine(id) : fullCard(e, bundle.label)) + "\n";
          }

          if (supIds.length) {
            const note =
              bundle.supplementalLabel ||
              "Also commonly included with this bundle.";
            out += `<p class="p1c-sup-note">${esc(note)}</p>\n`;
            for (const id of supIds) {
              bundled.add(id);
              out += refLine(id) + "\n";
            }
          }
        }

        const unbundled = inCategory.filter((e) => !bundled.has(e.id));
        if (unbundled.length) {
          out += `<h3>Other endorsements in this category</h3>\n`;
          for (const e of unbundled) {
            out +=
              (renderedIds.has(e.id)
                ? refLine(e.id)
                : fullCard(e, "Other endorsements in this category")) + "\n";
          }
        }

        out += `</section>`;
        return out;
      })
      .join("\n");

    return `${chapters}
<style>
.p1c-group-label {
  margin: 8pt 0 4pt 0;
  font-size: 8pt;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--cat-accent, #475569);
  break-after: avoid;
}
.p1c-sup-note {
  margin: 8pt 0 3pt 0;
  font-size: 8.5pt;
  font-weight: 600;
  color: var(--cat-ink, #313b4a);
  break-after: avoid;
}
.p1c-ref {
  margin: 0 0 4pt 0;
  padding: 4pt 8pt;
  font-size: 9pt;
  background: var(--cat-soft, #f0f1f3);
  border: 0.75pt solid var(--cat-line, #d1d5da);
  border-radius: 3pt;
  break-inside: avoid;
}
.p1c-ref-note {
  font-size: 8pt;
  color: #6b7280;
}
.p1c-related-label {
  display: inline-block;
  margin: 0 4pt 2pt 0;
  font-size: 8pt;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #6b7280;
}
</style>`;
  },
};
