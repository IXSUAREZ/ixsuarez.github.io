(function (root, factory) {
  "use strict";
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  root.CfrLinks = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const SECTION_RE = /\b(\d{1,4})\.(\d+[a-z]?)(?:\([a-zA-Z0-9]+\))*/;

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function titleForCitation(citation, part) {
    if (/\b49\s*CFR\b/i.test(citation) || Number(part) >= 1000) {
      return "49";
    }
    return "14";
  }

  function getEcfrSectionUrl(citation) {
    const raw = String(citation || "");
    const match = raw.match(SECTION_RE);
    if (!match) {
      return "";
    }
    const part = match[1];
    const section = part + "." + match[2];
    const title = titleForCitation(raw, part);
    return "https://www.ecfr.gov/current/title-" + title + "/part-" + part + "/section-" + section;
  }

  function linkifyCfrText(value, options) {
    const settings = options || {};
    const raw = String(value ?? "");
    const hasCfrContext = settings.linkBare || /\b(?:FAR|(?:14|49)\s*CFR)\b|§/.test(raw);
    if (!hasCfrContext) {
      return escapeHtml(raw);
    }

    const pattern = /((?:\b(?:14|49)\s*CFR\s*§{1,2}\s*|\bFAR\s+|§{1,2}\s*)?)(\d{1,4}\.\d+[a-z]?(?:\([a-zA-Z0-9]+\))*)/gi;
    let html = "";
    let cursor = 0;
    let match;

    while ((match = pattern.exec(raw)) !== null) {
      const matched = match[0];
      const section = match[2];
      const start = match.index;
      const url = getEcfrSectionUrl(matched || section);

      html += escapeHtml(raw.slice(cursor, start));
      if (url) {
        html +=
          '<a class="cfr-link" href="' +
          escapeHtml(url) +
          '" target="_blank" rel="noopener noreferrer">' +
          escapeHtml(matched) +
          "</a>";
      } else {
        html += escapeHtml(matched);
      }
      cursor = start + matched.length;
    }

    html += escapeHtml(raw.slice(cursor));
    return html;
  }

  return {
    escapeHtml,
    getEcfrSectionUrl,
    linkifyCfrText
  };
});
