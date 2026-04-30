#!/usr/bin/env node
// Pre-render every endorsement into static HTML so search crawlers can index
// the content without executing the app's JavaScript. Run after editing
// js/endorsements-data.js:
//
//   node simply-endorsed/build-seo-content.js
//
// The script reads endorsements-data.js, evaluates it in a minimal sandbox to
// get window.ENDORSEMENTS and window.APP_META, then rewrites the block between
// <!-- SEO:START --> and <!-- SEO:END --> in simply-endorsed/index.html.

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const here = __dirname;
const dataPath = path.join(here, "js", "endorsements-data.js");
const indexPath = path.join(here, "index.html");

const dataSource = fs.readFileSync(dataPath, "utf8");
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(dataSource, sandbox);

const endorsements = sandbox.window.ENDORSEMENTS || [];
const meta = sandbox.window.APP_META || {};

if (!endorsements.length) {
  throw new Error("No endorsements found — is endorsements-data.js healthy?");
}

const escapeHtml = (str) =>
  String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const categoryLabel = (slug) =>
  String(slug || "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const groups = new Map();
for (const e of endorsements) {
  const cat = e.category || "general";
  if (!groups.has(cat)) groups.set(cat, []);
  groups.get(cat).push(e);
}

const sortedGroups = [...groups.entries()].sort((a, b) => {
  const minA = Math.min(...a[1].map((e) => e.order || 0));
  const minB = Math.min(...b[1].map((e) => e.order || 0));
  return minA - minB;
});

const intro = `
<section class="seo-intro">
  <h2>Every FAA ${escapeHtml(meta.acVersion || "AC 61-65")} endorsement at a glance</h2>
  <p>
    Simply Endorsed is a free, searchable reference for all ${endorsements.length}
    endorsements in <strong>${escapeHtml(meta.display || "AC 61-65")}</strong>
    — the FAA advisory circular that defines the sign-offs CFIs use to authorize
    student solos, cross-country flights, endorsements for higher-performance or
    tailwheel airplanes, flight reviews, and every category of checkride. Use
    the search bar above to find any endorsement by ID (e.g. <code>A.9</code>),
    FAR citation (e.g. <code>14 CFR 61.87</code>), or alias (e.g.
    <em>BFR</em>, <em>tailwheel</em>, <em>solo cross-country</em>). Full list
    below so search engines and screen readers can read everything without JavaScript.
  </p>
</section>
`;

const endorsementHtml = (e) => {
  const cfr = Array.isArray(e.cfr) ? e.cfr.join("; ") : "";
  const aliasText = Array.isArray(e.aliases)
    ? e.aliases.filter((a) => a && a !== e.id.toLowerCase()).join(", ")
    : "";
  const tagText = Array.isArray(e.tags) ? e.tags.join(", ") : "";
  return `
  <article class="seo-endorsement" id="seo-${escapeHtml(e.id)}">
    <h3><span class="seo-endorsement-id">${escapeHtml(e.id)}</span> ${escapeHtml(e.title)}</h3>
    ${cfr ? `<p class="seo-endorsement-cfr"><strong>CFR:</strong> ${escapeHtml(cfr)}</p>` : ""}
    ${e.cardExplanation ? `<p>${escapeHtml(e.cardExplanation)}</p>` : ""}
    ${aliasText ? `<p class="seo-endorsement-aliases"><strong>Also searched as:</strong> ${escapeHtml(aliasText)}</p>` : ""}
    ${tagText ? `<p class="seo-endorsement-tags"><strong>Tags:</strong> ${escapeHtml(tagText)}</p>` : ""}
  </article>`;
};

const sections = sortedGroups
  .map(([cat, items]) => {
    items.sort((a, b) => (a.order || 0) - (b.order || 0));
    const heading = escapeHtml(categoryLabel(cat));
    const body = items.map(endorsementHtml).join("");
    return `
<section class="seo-category">
  <h3 class="seo-category-heading">${heading} endorsements</h3>
${body}
</section>`;
  })
  .join("\n");

const faq = `
<section class="seo-faq">
  <h2>Frequently asked questions about FAA endorsements</h2>

  <h3>What is AC 61-65?</h3>
  <p>FAA Advisory Circular 61-65 provides the model endorsement text that
  certificated flight instructors (CFIs) and ground instructors use to document
  training and authorize specific privileges in a pilot's logbook. The current
  revision is ${escapeHtml(meta.display || "AC 61-65K")}.</p>

  <h3>Do CFIs have to copy the AC 61-65 endorsement text word-for-word?</h3>
  <p>The exact wording is not mandatory, but it is strongly recommended. Using
  the model text ensures all required elements are present and reduces the risk
  of a rejected endorsement at a checkride or FAA ramp check. Simply Endorsed
  shows the verbatim text for every endorsement alongside a plain-language
  explanation.</p>

  <h3>How is Simply Endorsed different from wificfi?</h3>
  <p>Simply Endorsed is a free, search-first tool built specifically for AC
  61-65K (the current 2025 revision). Every endorsement is searchable by ID,
  FAR citation, alias, or checkride use case, and every endorsement links to
  its source page in the FAA's PDF. There is no account, no paywall, and no ads.</p>

  <h3>Which endorsement do I need for a first solo?</h3>
  <p>First solo endorsements come from 14 CFR 61.87 and typically include A.3
  (pre-solo aeronautical knowledge), A.4 (pre-solo flight training), and A.6
  (solo flight in a specific make and model). Search "first solo" in the tool
  above for the complete list with verbatim text.</p>

  <h3>Is Simply Endorsed free?</h3>
  <p>Yes. Simply Endorsed is a free reference tool for CFIs and student pilots,
  built and maintained by Diego Suarez, a Certified Ground Instructor based at
  Bowman Field (KLOU) in Louisville, Kentucky.</p>
</section>
`;

const closing = `
<section class="seo-closing">
  <p>
    Simply Endorsed was built by
    <a href="/">Diego Suarez</a>, a Certified Ground Instructor working toward
    his Flight Instructor Certificate at Bowman Field (KLOU) in Louisville,
    Kentucky. Have feedback or spotted an error? Email
    <a href="mailto:diegoasuarez02@gmail.com">diegoasuarez02@gmail.com</a>.
    For in-depth endorsement guides, see the
    <a href="/simply-endorsed/blog/">Simply Endorsed blog</a>.
  </p>
</section>
`;

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is AC 61-65?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "FAA Advisory Circular 61-65 provides the model endorsement text that CFIs and ground instructors use to document training and authorize specific privileges in a pilot's logbook. The current revision is " +
          (meta.display || "AC 61-65K") +
          ".",
      },
    },
    {
      "@type": "Question",
      name: "Do CFIs have to copy the AC 61-65 endorsement text word-for-word?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "The exact wording is not mandatory but strongly recommended. Using the model text ensures all required elements are present and reduces the risk of a rejected endorsement at a checkride or FAA ramp check.",
      },
    },
    {
      "@type": "Question",
      name: "How is Simply Endorsed different from wificfi?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Simply Endorsed is a free, search-first tool built specifically for the current AC 61-65K revision. Every endorsement is searchable by ID, FAR citation, alias, or checkride use case, with no account, paywall, or ads.",
      },
    },
    {
      "@type": "Question",
      name: "Which endorsement do I need for a first solo?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "First solo endorsements come from 14 CFR 61.87 and typically include A.3 (pre-solo aeronautical knowledge), A.4 (pre-solo flight training), and A.6 (solo flight in a specific make and model).",
      },
    },
    {
      "@type": "Question",
      name: "Is Simply Endorsed free?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Yes. Simply Endorsed is a free reference tool for CFIs and student pilots, built and maintained by Diego Suarez, a Certified Ground Instructor based at Bowman Field (KLOU) in Louisville, Kentucky.",
      },
    },
  ],
};

const faqScript = `<script type="application/ld+json">${JSON.stringify(
  faqSchema,
  null,
  2,
)}</script>`;

const replacement = `<!-- SEO:START (generated by build-seo-content.js — do not edit by hand) -->
<section id="seo-content" class="seo-content" aria-label="Full endorsement reference">
  ${intro.trim()}
  ${sections.trim()}
  ${faq.trim()}
  ${closing.trim()}
</section>
${faqScript}
<!-- SEO:END -->`;

const html = fs.readFileSync(indexPath, "utf8");
const marker = /<!-- SEO:START[\s\S]*?<!-- SEO:END -->/;
if (!marker.test(html)) {
  throw new Error(
    "Could not find <!-- SEO:START --> / <!-- SEO:END --> markers in index.html",
  );
}
const next = html.replace(marker, replacement);
fs.writeFileSync(indexPath, next);
console.log(
  `Injected ${endorsements.length} endorsements across ${sortedGroups.length} categories into index.html`,
);
