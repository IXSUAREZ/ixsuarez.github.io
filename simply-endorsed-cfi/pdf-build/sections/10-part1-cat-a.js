"use strict";

/**
 * sections/10-part1-cat-a.js — Part I divider + the first two category
 * chapters of the Endorsement Library, in CATEGORY_ORDER:
 *   1. practical-test-prereqs  (Practical Test Prerequisites)
 *   2. student-pilot           (Student Pilot — incl. the PRE_SOLO_CONTENT
 *                               pre-solo bundle)
 *
 * Structure: one h1 (Part I divider) → h2 category banners → h3 bundle
 * headers → h4 endorsement card titles (cards via helpers). See CONTRACT.md.
 *
 * Anchor discipline (shared Part I contract, same as 11/12/13): bundles
 * deliberately re-render shared endorsements (e.g. A.14 appears supplemental
 * in the first-solo bundle and primary in the tsa-citizenship bundle), but
 * the id="A-<n>" anchor is only kept on the FIRST occurrence rendered by
 * this file; later occurrences have the id stripped.
 *
 * Scoped CSS classes here are prefixed `p1a-`.
 */

/** The category slugs this file is responsible for (CATEGORY_ORDER heads). */
const MY_CATEGORIES = ["practical-test-prereqs", "student-pilot"];

const SCOPED_CSS = `
<style>
.p1a-sub-label {
  font-size: 8.5pt;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6b7280;
  margin: 10pt 0 4pt 0;
}
.p1a-related-label {
  font-size: 8pt;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #6b7280;
  margin-right: 4pt;
}
.p1a-lead {
  font-size: 10pt;
  margin: 0 0 8pt 0;
}
.p1a-pre-solo {
  margin: 0 0 10pt 0;
}
.p1a-prereq {
  border-left: 2pt solid #1c2142;
  background: #f4f5f9;
  padding: 6pt 8pt;
  margin: 0 0 6pt 0;
  break-inside: avoid;
}
.p1a-prereq-title {
  font-weight: 700;
  color: #1c2142;
  margin: 0 0 2pt 0;
}
.p1a-prereq-id {
  display: inline-block;
  background: #1c2142;
  color: #ffffff;
  border-radius: 3pt;
  padding: 0 4pt;
  margin-right: 4pt;
}
.p1a-prereq-desc {
  margin: 0 0 4pt 0;
}
.p1a-prereq-refs {
  margin: 0;
}
.p1a-accordion {
  margin: 0 0 8pt 0;
}
.p1a-accordion-heading {
  color: #1c2142;
  margin: 8pt 0 4pt 0;
}
.p1a-links {
  margin: 0 0 6pt 0;
}
</style>`;

/* ── Related-endorsement chips ───────────────────────────────────────────── */

/**
 * Ids of other endorsements that share a bundle (primary or supplemental
 * membership) with `id`, in bundle → primary → supplemental order.
 */
function bundleMates(id, bundles) {
  const out = [];
  for (const b of bundles) {
    const members = [...(b.primaryIds || []), ...(b.supplementalIds || [])];
    if (!members.includes(id)) continue;
    for (const other of members) {
      if (other !== id && !out.includes(other)) out.push(other);
    }
  }
  return out;
}

/**
 * Ids of same-category endorsements sharing at least one tag with `e`,
 * sorted by overlap count (desc), then endorsement order (asc).
 */
function tagMates(e, catEndorsements, exclude) {
  const tags = new Set(e.tags || []);
  return catEndorsements
    .filter((o) => o.id !== e.id && !exclude.includes(o.id))
    .map((o) => ({
      o,
      score: (o.tags || []).filter((t) => tags.has(t)).length,
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.o.order - b.o.order)
    .map((x) => x.o.id);
}

/**
 * relatedHtml for a card: up to 4 chips — bundle-mates first, then
 * tag-overlap within the category. Chips link to #A-<n>.
 */
function relatedChipsHtml(helpers, e, bundles, catEndorsements) {
  const mates = bundleMates(e.id, bundles);
  const fill = tagMates(e, catEndorsements, mates);
  const ids = [...mates, ...fill].slice(0, 4);
  if (!ids.length) return "";
  const chips = ids
    .map((id) => {
      const target = helpers.endorsementById.get(id);
      const label = target ? `${id} · ${target.title}` : id;
      return (
        `<a class="chip tag-chip internal" href="#${helpers.anchorForEndorsement(id)}">` +
        `${helpers.esc(label)}</a>`
      );
    })
    .join("\n      ");
  return `<span class="p1a-related-label">Related</span>\n      ${chips}`;
}

/* ── Pre-solo bundle content (PRE_SOLO_CONTENT) ──────────────────────────── */

function renderPreSolo(helpers, preSolo) {
  const esc = helpers.esc;
  const parts = [`<div class="p1a-pre-solo">`];

  if (preSolo.intro) {
    parts.push(`<p class="p1a-lead">${esc(preSolo.intro)}</p>`);
  }

  const prereqs = preSolo.prerequisites || [];
  if (prereqs.length) {
    parts.push(`<p class="p1a-sub-label">Prerequisites before solo</p>`);
    for (const p of prereqs) {
      const refs = (p.refs || []).map((r) => helpers.cfrChip(r)).join(" ");
      parts.push(`<div class="p1a-prereq">
    <p class="p1a-prereq-title"><span class="p1a-prereq-id">${esc(p.id)}</span>${esc(p.title)}</p>
    <p class="p1a-prereq-desc">${esc(p.description)}</p>
    <p class="p1a-prereq-refs">${refs}</p>
  </div>`);
    }
  }

  for (const sec of preSolo.accordionSections || []) {
    parts.push(`<section class="p1a-accordion">
    <h4 class="p1a-accordion-heading">${esc(sec.heading)}</h4>`);
    if (sec.type === "resources") {
      if ((sec.links || []).length) {
        parts.push(
          `<ul class="p1a-links">` +
            sec.links
              .map(
                (l) =>
                  `<li><a class="external" href="${esc(l.url)}" target="_blank" ` +
                  `rel="noopener noreferrer">${esc(l.label)}</a></li>`
              )
              .join("") +
            `</ul>`
        );
      }
      if ((sec.regs || []).length) {
        parts.push(`<p class="p1a-sub-label">Regulations &amp; references</p>`);
        parts.push(`<p class="p1a-prereq-refs">${sec.regs.map((r) => helpers.cfrChip(r)).join(" ")}</p>`);
      }
    } else {
      parts.push(helpers.renderBlocks(sec.blocks));
    }
    parts.push(`</section>`);
  }

  parts.push(`</div>`);
  return parts.join("\n");
}

/* ── Bundles & category chapters ─────────────────────────────────────────── */

/**
 * Render one endorsement card. Keeps the id="A-<n>" anchor only on the
 * first occurrence in this file; later occurrences (bundles deliberately
 * re-render shared endorsements, e.g. A.14 supplemental in first-solo and
 * primary in tsa-citizenship) have the id stripped so the book never gets
 * duplicate anchors. Same convention as sections/11-part1-cat-b.js.
 */
function renderCard(helpers, e, bundles, catEndorsements, emittedAnchors) {
  let html = helpers.renderEndorsementCard(e, {
    relatedHtml: relatedChipsHtml(helpers, e, bundles, catEndorsements),
  });
  const anchor = helpers.anchorForEndorsement(e.id);
  if (emittedAnchors.has(anchor)) {
    html = html.replace(` id="${anchor}"`, "");
  } else {
    emittedAnchors.add(anchor);
  }
  return html;
}

function resolveIds(helpers, ids) {
  return (ids || []).map((id) => helpers.endorsementById.get(id)).filter(Boolean);
}

function renderBundle(data, helpers, bundle, slug, catEndorsements, bundles, emittedAnchors) {
  const parts = [helpers.renderBundleHeader(bundle, slug)];

  if (bundle.contentRenderer === "pre-solo") {
    parts.push(renderPreSolo(helpers, data.PRE_SOLO_CONTENT));
  }

  const primary = resolveIds(helpers, bundle.primaryIds);
  if (primary.length) {
    parts.push(`<p class="p1a-sub-label">Primary endorsements</p>`);
    parts.push(...primary.map((e) => renderCard(helpers, e, bundles, catEndorsements, emittedAnchors)));
  }

  const supplemental = resolveIds(helpers, bundle.supplementalIds);
  if (supplemental.length) {
    parts.push(
      `<p class="p1a-sub-label">${helpers.esc(
        bundle.supplementalLabel || "Also commonly included"
      )}</p>`
    );
    parts.push(...supplemental.map((e) => renderCard(helpers, e, bundles, catEndorsements, emittedAnchors)));
  }

  return parts.join("\n");
}

function renderCategoryChapter(data, helpers, slug, emittedAnchors) {
  const cat = data.BROWSE_STRUCTURE.find((c) => c.categoryId === slug);
  const catEndorsements = data.ENDORSEMENTS.filter((e) => e.category === slug);
  const bundles = (cat && cat.subcategories) || [];

  const parts = [
    `<div class="page-break">`,
    helpers.renderCategoryHeader(slug, catEndorsements.length),
  ];

  for (const bundle of bundles) {
    parts.push(renderBundle(data, helpers, bundle, slug, catEndorsements, bundles, emittedAnchors));
  }

  const bundled = new Set(
    bundles.flatMap((b) => [...(b.primaryIds || []), ...(b.supplementalIds || [])])
  );
  const orphans = catEndorsements.filter((e) => !bundled.has(e.id));
  if (orphans.length) {
    parts.push(`<h3>Other endorsements in this category</h3>`);
    parts.push(...orphans.map((e) => renderCard(helpers, e, bundles, catEndorsements, emittedAnchors)));
  }

  parts.push(`</div>`);
  return parts.join("\n");
}

/* ── Section entry point ─────────────────────────────────────────────────── */

module.exports = {
  title: "Part I — Endorsement Library (Practical Test Prerequisites, Student Pilot)",

  render(data, helpers) {
    const total = data.ENDORSEMENTS.length;
    const catCount = data.BROWSE_STRUCTURE.length;
    /** A-anchor ids already emitted in this file (first occurrence keeps the anchor). */
    const emittedAnchors = new Set();

    const divider = `<div class="page-break">
  <span class="pgm" aria-hidden="true">ZZPGM|part:part-1|ZZ</span>
  <h1 class="section-title" id="part-1">Part I — Endorsement Library</h1>
  <p>This part collects all ${total} model endorsements from FAA ${helpers.esc(
      data.APP_META.display
    )}, grouped into ${catCount} color-coded categories that mirror the browse
  view of the Simply Endorsed app. Each card shows the verbatim model text from
  the Advisory Circular, plain-English notes, who may sign the endorsement, and
  how long it remains valid; chips on each card link to related endorsements
  inside this book and to the referenced regulations on eCFR.</p>
</div>`;

    const chapters = MY_CATEGORIES.map((slug) =>
      renderCategoryChapter(data, helpers, slug, emittedAnchors)
    );

    return SCOPED_CSS + "\n" + divider + "\n" + chapters.join("\n");
  },
};
