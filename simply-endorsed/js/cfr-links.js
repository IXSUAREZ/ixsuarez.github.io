(function (root, factory) {
  "use strict";
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  root.CfrLinks = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const KNOWN_CFR_PARTS = new Set([
    "1", "21", "23", "43", "45", "47", "61", "65", "67", "71", "73", "91", "97",
    "103", "107", "117", "119", "121", "125", "129", "135", "136", "137", "141",
    "142", "1552"
  ]);
  const SECTION_RE = /\b(\d{1,4})\.(\d+[a-z]?)(?:\([a-zA-Z0-9]+\))*/;
  const BARE_CFR_SECTION_RE = /\b(?:21|23|43|45|47|61|65|67|71|73|91|97|103|107|117|119|121|125|129|135|136|137|141|142|1552)\.\d+[a-z]?(?:\([a-zA-Z0-9]+\))*/i;
  const CFR_CONTEXT_RE = /\b(?:FAR|(?:14|49)\s*CFR)\b|§/i;
  const CFR_TOKEN_RE = /(\b(?:14|49)\s*CFR\s+Parts?\s+\d{1,4}\b)|((?:\b(?:14|49)\s*CFR\s*§{0,2}\s*|\bFAR\s+|§{1,2}\s*)?)(\d{1,4}\.\d+[a-z]?(?:\([a-zA-Z0-9]+\))*(?:(?:\s*(?:[-/]|(?:and|or))\s*\([a-zA-Z0-9]+\)(?:\([a-zA-Z0-9]+\))*)*))/gi;

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

  function getEcfrPartUrl(citation) {
    const raw = String(citation || "");
    const match = raw.match(/\b(14|49)\s*CFR\s+Parts?\s+(\d{1,4})\b/i);
    if (!match) {
      return "";
    }
    return "https://www.ecfr.gov/current/title-" + match[1] + "/part-" + match[2];
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

  function isLikelyCfrSection(prefix, section, options) {
    if (options.linkBare || prefix) {
      return true;
    }
    const match = String(section || "").match(SECTION_RE);
    return Boolean(match && KNOWN_CFR_PARTS.has(match[1]) && match[2] !== "0");
  }

  function linkifyCfrText(value, options) {
    const settings = options || {};
    const raw = String(value ?? "");
    const hasCfrContext = settings.linkBare || CFR_CONTEXT_RE.test(raw);
    if (!hasCfrContext && !BARE_CFR_SECTION_RE.test(raw)) {
      return escapeHtml(raw);
    }

    let html = "";
    let cursor = 0;
    let match;

    CFR_TOKEN_RE.lastIndex = 0;
    while ((match = CFR_TOKEN_RE.exec(raw)) !== null) {
      const matched = match[0];
      const partCitation = match[1];
      const prefix = match[2] || "";
      const section = match[3] || "";
      const start = match.index;
      let url = "";

      if (partCitation) {
        url = getEcfrPartUrl(partCitation);
      } else if (isLikelyCfrSection(prefix, section, settings)) {
        url = getEcfrSectionUrl(matched || section);
      }

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
    getEcfrPartUrl,
    getEcfrSectionUrl,
    linkifyCfrText
  };
});
