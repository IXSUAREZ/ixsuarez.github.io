(function () {
  "use strict";

  var KNOWN_CFR_PARTS = {
    "1": true,
    "21": true,
    "23": true,
    "43": true,
    "45": true,
    "47": true,
    "61": true,
    "65": true,
    "67": true,
    "71": true,
    "73": true,
    "91": true,
    "97": true,
    "103": true,
    "107": true,
    "117": true,
    "119": true,
    "121": true,
    "125": true,
    "129": true,
    "135": true,
    "136": true,
    "137": true,
    "141": true,
    "142": true,
    "1552": true
  };
  var SKIP_TAGS = {
    A: true,
    SCRIPT: true,
    STYLE: true,
    TEXTAREA: true,
    TITLE: true,
    OPTION: true,
    SVG: true,
    NOSCRIPT: true
  };
  var SECTION_RE = /\b(\d{1,4})\.(\d+[a-z]?)(?:\([a-zA-Z0-9]+\))*/;
  var BARE_CFR_SECTION_RE = /\b(?:21|23|43|45|47|61|65|67|71|73|91|97|103|107|117|119|121|125|129|135|136|137|141|142|1552)\.\d+[a-z]?(?:\([a-zA-Z0-9]+\))*/i;
  var CFR_CONTEXT_RE = /\b(?:FAR|(?:14|49)\s*CFR)\b|§/i;
  var CFR_TOKEN_RE = /(\b(?:14|49)\s*CFR\s+Parts?\s+\d{1,4}\b)|((?:\b(?:14|49)\s*CFR\s*§{0,2}\s*|\bFAR\s+|§{1,2}\s*)?)(\d{1,4}\.\d+[a-z]?(?:\([a-zA-Z0-9]+\))*(?:(?:\s*(?:[-/]|(?:and|or))\s*\([a-zA-Z0-9]+\)(?:\([a-zA-Z0-9]+\))*)*))/gi;

  function titleForCitation(citation, part) {
    if (/\b49\s*CFR\b/i.test(citation) || Number(part) >= 1000) {
      return "49";
    }
    return "14";
  }

  function getEcfrPartUrl(citation) {
    var match = String(citation || "").match(/\b(14|49)\s*CFR\s+Parts?\s+(\d{1,4})\b/i);
    if (!match) return "";
    return "https://www.ecfr.gov/current/title-" + match[1] + "/part-" + match[2];
  }

  function getEcfrSectionUrl(citation) {
    var raw = String(citation || "");
    var match = raw.match(SECTION_RE);
    if (!match) return "";
    var part = match[1];
    var section = part + "." + match[2];
    var title = titleForCitation(raw, part);
    return "https://www.ecfr.gov/current/title-" + title + "/part-" + part + "/section-" + section;
  }

  function isLikelyCfrSection(prefix, section, hasContext) {
    var match = String(section || "").match(SECTION_RE);
    if (!match) return false;
    if (prefix) return true;
    return (hasContext || BARE_CFR_SECTION_RE.test(section)) && KNOWN_CFR_PARTS[match[1]] && match[2] !== "0";
  }

  function shouldSkip(node) {
    var el = node.nodeType === 1 ? node : node.parentElement;
    while (el) {
      if (SKIP_TAGS[el.tagName] || el.classList.contains("no-cfr-autolink")) {
        return true;
      }
      el = el.parentElement;
    }
    return false;
  }

  function normalizeEcfrAnchor(anchor) {
    var href = anchor.getAttribute("href") || "";
    if (!/\/\/(?:www\.)?ecfr\.gov\//i.test(href)) return;
    anchor.setAttribute("target", "_blank");
    anchor.setAttribute("rel", "noopener noreferrer");
    if (!anchor.classList.contains("cfr-link")) {
      anchor.classList.add("cfr-link");
    }
  }

  function createCfrLink(label, url) {
    var anchor = document.createElement("a");
    anchor.className = "cfr-link";
    anchor.href = url;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.textContent = label;
    return anchor;
  }

  function linkifyTextNode(node) {
    var text = node.nodeValue || "";
    var hasContext = CFR_CONTEXT_RE.test(text);
    if (!hasContext && !BARE_CFR_SECTION_RE.test(text)) return;

    var fragment = document.createDocumentFragment();
    var cursor = 0;
    var changed = false;
    var match;

    CFR_TOKEN_RE.lastIndex = 0;
    while ((match = CFR_TOKEN_RE.exec(text)) !== null) {
      var matched = match[0];
      var partCitation = match[1];
      var prefix = match[2] || "";
      var section = match[3] || "";
      var url = "";

      if (partCitation) {
        url = getEcfrPartUrl(partCitation);
      } else if (isLikelyCfrSection(prefix, section, hasContext)) {
        url = getEcfrSectionUrl(matched || section);
      }

      if (!url) continue;

      if (match.index > cursor) {
        fragment.appendChild(document.createTextNode(text.slice(cursor, match.index)));
      }
      fragment.appendChild(createCfrLink(matched, url));
      cursor = match.index + matched.length;
      changed = true;
    }

    if (!changed) return;
    if (cursor < text.length) {
      fragment.appendChild(document.createTextNode(text.slice(cursor)));
    }
    node.parentNode.replaceChild(fragment, node);
  }

  function processRoot(root) {
    if (!root) return;

    if (root.nodeType === 1) {
      if (root.tagName === "A") {
        normalizeEcfrAnchor(root);
      }
      root.querySelectorAll("a[href*='ecfr.gov']").forEach(normalizeEcfrAnchor);
    }

    if (root.nodeType === 3) {
      if (!shouldSkip(root)) linkifyTextNode(root);
      return;
    }

    if (root.nodeType !== 1 || shouldSkip(root)) return;

    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        return shouldSkip(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      }
    });
    var textNodes = [];
    var current;
    while ((current = walker.nextNode())) {
      textNodes.push(current);
    }
    textNodes.forEach(linkifyTextNode);
  }

  function start() {
    processRoot(document.body);

    if (!("MutationObserver" in window)) return;
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(processRoot);
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }

  window.SuarezCfiCfrAutolink = {
    getEcfrPartUrl: getEcfrPartUrl,
    getEcfrSectionUrl: getEcfrSectionUrl,
    processRoot: processRoot
  };
})();
