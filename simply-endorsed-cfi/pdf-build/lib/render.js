"use strict";

/**
 * render.js — shared HTML helpers for all book sections.
 *
 * Everything here returns HTML strings; sections concatenate them.
 * All class names used here are defined in styles/pdf.css — see CONTRACT.md
 * for the full inventory and the anchor naming scheme.
 */

const { cfrLink } = require("./load-data");
const { usedInChips } = require("./used-in");
const {
  CATEGORY_LABELS,
  WHO_ISSUES_LABELS,
  EXPIRATION_LABELS,
  themeVars,
} = require("./theme");

/** Dark navy used for endorsement ID pills (matches the web app). */
const NAVY = "#1C2142";

/* ── Basics ─────────────────────────────────────────────────────────────── */

/** HTML-escape a value. */
function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * anchorForEndorsement("A.6") → "A-6"  (dots → dashes).
 * Use for id attributes and internal href targets: href="#A-6".
 */
function anchorForEndorsement(id) {
  return String(id ?? "").replace(/\./g, "-");
}

/**
 * pgmMarker(key) → invisible page-marker span, e.g. pgmMarker("cat:student-pilot")
 * → `<span class="pgm" aria-hidden="true">ZZPGM|cat:student-pilot|ZZ</span>`.
 * The .pgm CSS keeps it visually invisible (0.6pt white, zero line-height)
 * while the text stays in the PDF text layer for the later navigation-chrome
 * stamping pass; aria-hidden keeps it out of the tagged-PDF struct tree so
 * screen readers never announce it. stamp_nav.py redacts the token from the
 * shipped file once chrome is stamped, so search/copy-paste stay clean.
 * Token format is pipe-delimited with no spaces; place the span inside the
 * same wrapper as the anchor it marks so both land on the same page.
 */
function pgmMarker(key) {
  return `<span class="pgm" aria-hidden="true">ZZPGM|${esc(key)}|ZZ</span>`;
}

/**
 * badge(text, kind) → small pill.
 * Known kinds: "signer", "validity", "perflight", "featured", "muted".
 * Unknown kinds fall back to "muted".
 */
function badge(text, kind) {
  const known = new Set(["signer", "validity", "perflight", "featured", "muted"]);
  const k = known.has(kind) ? kind : "muted";
  return `<span class="badge badge-${k}">${esc(text)}</span>`;
}

/* ── Small fragments ────────────────────────────────────────────────────── */

/** One CFR citation chip, wrapped in an external eCFR link when possible. */
function cfrChip(citation) {
  const url = cfrLink(citation);
  const label = esc(citation);
  if (url) {
    return (
      `<a class="chip cfr-chip external" href="${esc(url)}" ` +
      `target="_blank" rel="noopener noreferrer">${label}</a>`
    );
  }
  return `<span class="chip cfr-chip">${label}</span>`;
}

/** Split the endorsement `explanation` field ("•\t…\n•\t…") into bullets. */
function explanationBullets(explanation) {
  return String(explanation ?? "")
    .split(/\n?•\t/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * renderBlocks(blocks) → HTML for the typed content blocks used by
 * GUIDANCE_SECTIONS[].content and PRE_SOLO_CONTENT accordion sections.
 * Supported types: h3, h4, p, ul, ol. Unknown types render as <p>.
 */
function renderBlocks(blocks) {
  if (!Array.isArray(blocks)) return "";
  return blocks
    .map((b) => {
      if (!b || typeof b !== "object") return "";
      switch (b.type) {
        case "h3":
          return `<h3>${esc(b.value)}</h3>`;
        case "h4":
          return `<h4>${esc(b.value)}</h4>`;
        case "p":
          return `<p>${esc(b.value)}</p>`;
        case "ul":
          return `<ul>${(b.value || []).map((li) => `<li>${esc(li)}</li>`).join("")}</ul>`;
        case "ol":
          return `<ol>${(b.value || []).map((li) => `<li>${esc(li)}</li>`).join("")}</ol>`;
        default:
          return `<p>${esc(b.value)}</p>`;
      }
    })
    .join("\n");
}

/* ── Big components ─────────────────────────────────────────────────────── */

/**
 * "Used in:" chip row for a card — reverse links to the pages that consume
 * the endorsement (Part II flow pages, Student Journey, DPE Scenarios; see
 * lib/used-in.js). Returns "" when nothing in the book uses the endorsement,
 * so cards without usages never render an empty row.
 */
function usedInRowHtml(id) {
  const chips = usedInChips(id);
  if (!chips.length) return "";
  const chipsHtml = chips
    .map(
      (c) =>
        `<a class="chip usedin-chip internal" href="${esc(c.href)}" ` +
        `title="${esc(c.title)}">${esc(c.label)}</a>`
    )
    .join("\n      ");
  return `\n    <div class="ec-usedin"><span class="ec-usedin-label">Used in:</span>\n      ${chipsHtml}\n    </div>`;
}

/**
 * renderEndorsementCard(endorsement, opts?) → full endorsement card HTML.
 *
 * opts:
 *   relatedHtml  HTML string placed in the card's "Related" slot (optional)
 *   sourceUrl    override for the "Open in AC PDF" link (defaults to
 *                APP_META.sourceUrl; build.js pre-binds this)
 *   acVersion    override for the AC version label in that link
 *   showRelated  set false to omit the Related slot entirely (default true)
 *   showUsedIn   set false to omit the "Used in:" chip row (default true;
 *                suppress when a card is rendered as a compact cross-ref
 *                rather than as a full library card)
 *
 * Heading level: the card title is an <h4>, so sections should use
 * h1 (section title) → h2 (category banner) → h3 (bundle header) → h4 (cards).
 *
 * Every card also carries an invisible `en:<id>` page marker (e.g.
 * ZZPGM|en:A.6|ZZ) as the first child of the <article> that owns the
 * id="A-<n>" anchor — the marker marks the canonical card's page for the
 * navigation-chrome pass and for cross-document link retargeting (binder
 * merge). Non-canonical re-renders MUST drop it together with the anchor —
 * see stripCardAnchor().
 */
function renderEndorsementCard(e, opts) {
  const o = opts || {};
  const anchor = anchorForEndorsement(e.id);
  const who = WHO_ISSUES_LABELS[e.whoIssues] || e.whoIssues || "";
  const validity = e.perFlight
    ? "Required per flight"
    : EXPIRATION_LABELS[e.expiration] || e.expiration || "";
  const sourceUrl =
    o.sourceUrl ||
    "https://www.faa.gov/documentLibrary/media/Advisory_Circular/AC_61-65K.pdf";
  const acVersion = o.acVersion || "AC 61-65K";

  const cfrChipsHtml = (e.cfr || []).map(cfrChip).join("\n      ");
  const bullets = explanationBullets(e.explanation)
    .map((li) => `<li>${esc(li)}</li>`)
    .join("\n      ");
  const tagsHtml = (e.tags || [])
    .map((t) => `<span class="chip tag-chip">${esc(t)}</span>`)
    .join("\n      ");
  const relatedSlot =
    o.showRelated === false
      ? ""
      : `\n    <div class="ec-related">${o.relatedHtml || ""}</div>`;
  const usedInSlot = o.showUsedIn === false ? "" : usedInRowHtml(e.id);

  return `<article class="endorsement-card" id="${esc(anchor)}" style="${themeVars(e.category)}">
    ${pgmMarker(`en:${e.id}`)}
    <header class="ec-head">
      <span class="id-pill" style="background:${NAVY}">${esc(e.id)}</span>
      <h4 class="ec-title">${esc(e.title)}</h4>
    </header>
    ${e.cardExplanation ? `\n    <p class="ec-lede">${esc(e.cardExplanation)}</p>` : ""}
    <div class="ec-badges">
      ${badge(who, "signer")}
      ${badge(validity, e.perFlight ? "perflight" : "validity")}
    </div>
    <div class="ec-cfr">
      ${cfrChipsHtml}
    </div>
    <div class="ec-verbatim">
      <span class="ec-verbatim-label">${esc(acVersion)} verbatim · AC page ${esc(e.sourcePage)}</span>
      <p class="verbatim">${esc(e.verbatimText)}</p>
    </div>
    <div class="ec-explanation">
      <ul>
      ${bullets}
      </ul>
    </div>
    <div class="ec-tags">
      ${tagsHtml}
    </div>${relatedSlot}${usedInSlot}
    <footer class="ec-foot">
      <a class="external" href="${esc(sourceUrl)}" target="_blank" rel="noopener noreferrer">Open in ${esc(acVersion)} PDF</a>
    </footer>
  </article>`;
}

/**
 * stripCardAnchor(html, id) → card HTML with the id="A-<n>" anchor AND its
 * en: page marker removed. Sections call this on every non-canonical copy
 * of a card (bundle re-renders, cross-category supplementals) so the book
 * keeps exactly one anchor and one ZZPGM|en:<id>|ZZ marker per endorsement
 * id — the marker always travels with the anchor, never with a re-render.
 * Pair this with the exact condition that decides the id is stripped.
 */
function stripCardAnchor(html, id) {
  return html
    .replace(` id="${anchorForEndorsement(id)}"`, "")
    .replace(pgmMarker(`en:${id}`), "");
}

/**
 * renderCategoryHeader(slug, count) → colored category banner with
 * anchor id `cat-<slug>`. `count` is the endorsement count (number) or any
 * pre-formatted string; pass null/undefined to omit the count chip.
 */
function renderCategoryHeader(slug, count) {
  const label = CATEGORY_LABELS[slug] || slug;
  const countHtml =
    count === null || count === undefined
      ? ""
      : `<span class="category-banner-count">${
          typeof count === "number" ? `${count} endorsement${count === 1 ? "" : "s"}` : esc(count)
        }</span>`;
  return `<section class="category-banner" id="cat-${esc(slug)}" style="${themeVars(slug)}">
    ${pgmMarker(`cat:${slug}`)}
    <h2>${esc(label)}</h2>
    ${countHtml}
  </section>`;
}

/**
 * renderBundleHeader(bundle, categorySlug) → subcategory header with
 * anchor id `bundle-<bundle.id>`. `bundle` is a BROWSE_STRUCTURE
 * subcategory object: { id, label, description, primaryIds,
 * supplementalIds?, supplementalLabel?, featured?, contentRenderer? }.
 * The banner inherits the parent category's theme colors.
 */
function renderBundleHeader(bundle, categorySlug) {
  const featured = bundle.featured ? ` ${badge("Featured bundle", "featured")}` : "";
  const desc = bundle.description
    ? `\n    <p class="bundle-desc">${esc(bundle.description)}</p>`
    : "";
  return `<header class="bundle-header" id="bundle-${esc(bundle.id)}" style="${themeVars(categorySlug)}">
    ${pgmMarker(`bundle:${bundle.id}`)}
    <h3>${esc(bundle.label)}${featured}</h3>${desc}
  </header>`;
}

module.exports = {
  NAVY,
  esc,
  anchorForEndorsement,
  pgmMarker,
  badge,
  cfrChip,
  explanationBullets,
  renderBlocks,
  usedInChips,
  renderEndorsementCard,
  stripCardAnchor,
  renderCategoryHeader,
  renderBundleHeader,
};
