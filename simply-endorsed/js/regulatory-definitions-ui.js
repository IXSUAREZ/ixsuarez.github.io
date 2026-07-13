(function (root, factory) {
  "use strict";
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.RegulatoryDefinitionsUI = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function buildEntries(data, curation) {
    const editorialTerms = curation && curation.terms ? curation.terms : {};
    return (data && Array.isArray(data.definitions) ? data.definitions : []).map(function (entry) {
      const editorial = editorialTerms[entry.id] || {};
      const aliases = Array.isArray(editorial.aliases) ? editorial.aliases.slice() : [];
      const keywords = Array.isArray(editorial.keywords) ? editorial.keywords.slice() : [];
      const topics = Array.isArray(editorial.topics) ? editorial.topics.slice() : [];
      const explanation = editorial.explanation || "";
      return Object.assign({}, entry, {
        aliases,
        keywords,
        topics,
        explanation,
        searchText: normalize([entry.term, aliases.join(" "), entry.officialText, keywords.join(" "), explanation].join(" "))
      });
    });
  }

  function scoreEntry(entry, query) {
    const needle = normalize(query);
    if (!needle) return 1;
    const term = normalize(entry.term);
    const aliases = (entry.aliases || []).map(normalize);
    if (term === needle) return 1000;
    if (aliases.indexOf(needle) !== -1) return 900;
    if (term.indexOf(needle) === 0) return 800;
    if (aliases.some(function (alias) { return alias.indexOf(needle) === 0; })) return 700;
    if (term.indexOf(needle) !== -1) return 600;
    if (entry.searchText.indexOf(needle) !== -1) return 400;
    const words = needle.split(" ").filter(Boolean);
    if (words.length && words.every(function (word) { return entry.searchText.indexOf(word) !== -1; })) return 300;
    return 0;
  }

  function searchEntries(entries, query, filters) {
    const settings = filters || {};
    const topic = settings.topic || "all";
    const letter = settings.letter || "all";
    return entries
      .map(function (entry) { return { entry, score: scoreEntry(entry, query) }; })
      .filter(function (item) {
        if (!item.score) return false;
        if (topic !== "all" && item.entry.topics.indexOf(topic) === -1) return false;
        if (letter !== "all" && item.entry.term.charAt(0).toUpperCase() !== letter) return false;
        return true;
      })
      .sort(function (left, right) {
        return right.score - left.score || left.entry.term.localeCompare(right.entry.term);
      })
      .map(function (item) { return item.entry; });
  }

  function sourceFor(entry, data) {
    return entry.sourcePart === "1.1" ? data.meta.sources.part1 : data.meta.sources.part61;
  }

  function sourceBadge(entry) {
    return entry.sourcePart === "1.1" ? "§1.1 instructor-critical" : "§61.1 definition";
  }

  function formatOfficialText(value) {
    return String(value || "").split("\n").map(function (line) {
      return "<span>" + escapeHtml(line) + "</span>";
    }).join("");
  }

  function renderDefinitionCard(entry, active) {
    return (
      '<button type="button" class="definition-card no-cfr-autolink' + (active ? " is-active" : "") + '" data-definition-open="' + escapeHtml(entry.id) + '" aria-pressed="' + (active ? "true" : "false") + '">' +
        '<span class="definition-card-source">' + escapeHtml(sourceBadge(entry)) + "</span>" +
        '<span class="definition-card-term">' + escapeHtml(entry.term) + "</span>" +
        '<span class="definition-card-preview">' + escapeHtml(entry.explanation || entry.officialText.split("\n")[0]) + "</span>" +
      "</button>"
    );
  }

  function renderDetail(entry, data, curation) {
    if (!entry) {
      return '<article class="definition-detail definition-detail-empty"><h3>Select a definition</h3><p>Choose a term to review the exact regulatory text, source snapshot, and instructor planning explanation.</p></article>';
    }
    const source = sourceFor(entry, data);
    const aliases = entry.aliases.length
      ? '<div class="definition-aliases"><strong>Also searched as</strong><span>' + entry.aliases.map(escapeHtml).join(" · ") + "</span></div>"
      : "";
    const editorial = entry.explanation
      ? '<section class="definition-editorial" aria-label="Editorial explanation"><p class="definition-panel-label">' + escapeHtml(curation.editorialLabel) + '</p><p>' + escapeHtml(entry.explanation) + "</p></section>"
      : "";
    return (
      '<article class="definition-detail" id="definition-' + escapeHtml(entry.id) + '" tabindex="-1" data-definition-detail="' + escapeHtml(entry.id) + '">' +
        '<header><div><p class="definition-detail-kicker">' + escapeHtml(sourceBadge(entry)) + '</p><h3>' + escapeHtml(entry.term) + '</h3></div>' +
        '<div class="definition-detail-actions"><button type="button" data-definition-copy="citation">Copy citation</button><button type="button" data-definition-copy="link">Copy link</button></div></header>' +
        '<p class="definition-citation">' + escapeHtml(entry.citation) + "</p>" +
        '<section class="definition-official" aria-label="Exact regulatory text"><p class="definition-panel-label">Exact regulatory text</p><div class="definition-official-text">' + formatOfficialText(entry.officialText) + "</div></section>" +
        editorial + aliases +
        '<footer class="definition-source-footer"><span>Snapshot through ' + escapeHtml(data.meta.currentThrough) + '</span><a href="' + escapeHtml(source.currentUrl) + '" target="_blank" rel="noopener noreferrer">Current eCFR</a><a href="' + escapeHtml(source.datedUrl) + '" target="_blank" rel="noopener noreferrer">Dated source</a></footer>' +
      "</article>"
    );
  }

  function renderDecisions(curation) {
    const decisions = curation && Array.isArray(curation.decisions) ? curation.decisions : [];
    return decisions.map(function (decision) {
      return (
        '<details class="definition-decision" id="decision-' + escapeHtml(decision.id) + '">' +
          '<summary class="no-cfr-autolink"><span><b>' + escapeHtml(decision.title) + '</b><small>' + escapeHtml(decision.summary) + '</small></span><span aria-hidden="true">+</span></summary>' +
          '<div class="definition-decision-body">' +
            '<p class="definition-panel-label">' + escapeHtml(curation.conclusionLabel) + "</p>" +
            '<div class="definition-branch-list">' + decision.branches.map(function (branch) {
              return '<article><h4>' + escapeHtml(branch.when) + '</h4><p class="definition-operator"><strong>Rule operator:</strong> <code>' + escapeHtml(branch.operator) + '</code></p><p>' + escapeHtml(branch.conclusion) + "</p></article>";
            }).join("") + "</div>" +
            '<p class="definition-decision-sources"><strong>Review:</strong> ' + decision.sources.map(escapeHtml).join(" · ") + "</p>" +
          "</div>" +
        "</details>"
      );
    }).join("");
  }

  function create(options) {
    const root = options && options.root;
    const data = options && options.data;
    const curation = options && options.curation;
    if (!root || !data || !curation) return null;

    const entries = buildEntries(data, curation);
    const entryMap = new Map(entries.map(function (entry) { return [entry.id, entry]; }));
    const availableLetters = Array.from(new Set(entries.map(function (entry) { return entry.term.charAt(0).toUpperCase(); }))).sort();
    let state = { query: "", term: "", topic: "all", letter: "all" };
    let copyStatus = "";

    function notify() {
      if (typeof options.onStateChange === "function") {
        options.onStateChange({ query: state.query, term: state.term });
      }
    }

    function currentLink() {
      const url = new URL(window.location.href);
      url.search = "";
      url.searchParams.set("view", "definitions");
      if (state.query) url.searchParams.set("dq", state.query);
      if (state.term) url.searchParams.set("term", state.term);
      url.hash = state.term ? "definition-" + state.term : "";
      return url.toString();
    }

    function render() {
      const results = searchEntries(entries, state.query, state);
      const selected = entryMap.get(state.term) || null;
      const topics = curation.topics || [];
      const letters = ["all"].concat(availableLetters);
      root.innerHTML =
        '<div class="definitions-shell">' +
          '<header class="definitions-hero"><div><p class="definitions-eyebrow">Regulatory reference</p><h1>Regulatory Definitions &amp; Instructor Decisions</h1><p>Exact §61.1 text, selected instructor-critical §1.1 terms, and clearly labeled planning explanations.</p></div>' +
          '<div class="definitions-source-actions"><a href="' + escapeHtml(data.meta.sources.part61.currentUrl) + '" target="_blank" rel="noopener noreferrer">Current §61.1</a><a href="' + escapeHtml(data.meta.sources.part61.datedUrl) + '" target="_blank" rel="noopener noreferrer">Dated snapshot</a></div></header>' +
          '<aside class="definitions-disclosure"><strong>Source status:</strong> ' + escapeHtml(data.meta.disclosure) + '<span>Reviewed ' + escapeHtml(data.meta.reviewedAt) + ' · snapshot through ' + escapeHtml(data.meta.currentThrough) + '</span></aside>' +
          '<details class="definitions-provenance"><summary>Snapshot provenance and integrity</summary><div><p><strong>Data version:</strong> <code>' + escapeHtml(data.meta.version) + '</code></p><p><strong>Title 14 status:</strong> latest amended ' + escapeHtml(data.meta.title14.latestAmendedOn) + '; latest issue ' + escapeHtml(data.meta.title14.latestIssueDate) + '; up to date as of ' + escapeHtml(data.meta.title14.upToDateAsOf) + '.</p><p><strong>§61.1 XML SHA-256:</strong> <code>' + escapeHtml(data.meta.sources.part61.sha256) + '</code></p><p><strong>§1.1 XML SHA-256:</strong> <code>' + escapeHtml(data.meta.sources.part1.sha256) + '</code></p><p><a href="' + escapeHtml(data.meta.sources.part61.apiUrl) + '" target="_blank" rel="noopener noreferrer">Dated §61.1 API provenance</a> · <a href="' + escapeHtml(data.meta.sources.part1.apiUrl) + '" target="_blank" rel="noopener noreferrer">Dated §1.1 API provenance</a></p></div></details>' +
          '<section class="definitions-applicability"><details><summary class="no-cfr-autolink">§61.1(a) — What Part 61 prescribes</summary><div class="definition-official-text">' + formatOfficialText(data.applicability.officialText) + "</div></details></section>" +
          '<section class="definitions-controls" aria-label="Definition search and filters">' +
            '<label for="definitionsSearchInput"><span>Search definitions</span><input id="definitionsSearchInput" type="search" autocomplete="off" value="' + escapeHtml(state.query) + '" placeholder="Term, alias, official text, or keyword"></label>' +
            (state.query ? '<button type="button" class="definitions-clear" data-definitions-clear>Clear</button>' : "") +
          "</section>" +
          '<div class="definitions-topic-filters" role="group" aria-label="Filter definitions by topic">' + topics.map(function (topic) {
            return '<button type="button" data-definition-topic="' + escapeHtml(topic.id) + '" aria-pressed="' + String(state.topic === topic.id) + '" class="' + (state.topic === topic.id ? "is-active" : "") + '">' + escapeHtml(topic.label) + "</button>";
          }).join("") + "</div>" +
          '<div class="definitions-letter-filters" role="group" aria-label="Filter definitions alphabetically">' + letters.map(function (letter) {
            return '<button type="button" data-definition-letter="' + escapeHtml(letter) + '" aria-pressed="' + String(state.letter === letter) + '" class="' + (state.letter === letter ? "is-active" : "") + '">' + escapeHtml(letter === "all" ? "All" : letter) + "</button>";
          }).join("") + "</div>" +
          '<p class="definitions-result-count" aria-live="polite">' + results.length + " of " + entries.length + " definitions</p>" +
          '<div class="definitions-workspace"><nav class="definitions-list" aria-label="Definition results">' +
            (results.length ? results.map(function (entry) { return renderDefinitionCard(entry, entry.id === state.term); }).join("") : '<p class="definitions-empty">No definitions match. Clear a filter or try a broader term.</p>') +
          "</nav>" + renderDetail(selected, data, curation) + "</div>" +
          '<section class="definitions-decisions" aria-labelledby="definitionsDecisionsTitle"><div class="definitions-section-heading"><p class="definitions-eyebrow">Instructor planning</p><h2 id="definitionsDecisionsTitle">Decision guides</h2><p>These guides preserve key rule operators but the conclusions are editorial planning aids, not CFR text.</p></div>' + renderDecisions(curation) + "</section>" +
          '<p class="definitions-copy-status" role="status" aria-live="polite">' + escapeHtml(copyStatus) + "</p>" +
        "</div>";
    }

    function setState(next, shouldNotify) {
      const update = next || {};
      if (Object.prototype.hasOwnProperty.call(update, "query")) state.query = String(update.query || "");
      if (Object.prototype.hasOwnProperty.call(update, "term")) state.term = entryMap.has(update.term) ? update.term : "";
      if (Object.prototype.hasOwnProperty.call(update, "topic")) state.topic = update.topic || "all";
      if (Object.prototype.hasOwnProperty.call(update, "letter")) state.letter = update.letter || "all";
      render();
      if (shouldNotify !== false) notify();
    }

    root.addEventListener("input", function (event) {
      if (event.target && event.target.id === "definitionsSearchInput") {
        const cursor = event.target.selectionStart;
        setState({ query: event.target.value, term: "" });
        const input = root.querySelector("#definitionsSearchInput");
        if (input) {
          input.focus();
          if (typeof input.setSelectionRange === "function") input.setSelectionRange(cursor, cursor);
        }
      }
    });

    root.addEventListener("click", function (event) {
      const open = event.target.closest("[data-definition-open]");
      if (open) {
        setState({ term: open.getAttribute("data-definition-open") });
        const detail = root.querySelector("[data-definition-detail]");
        if (detail) detail.focus({ preventScroll: true });
        return;
      }
      const topic = event.target.closest("[data-definition-topic]");
      if (topic) {
        setState({ topic: topic.getAttribute("data-definition-topic"), term: "" });
        return;
      }
      const letter = event.target.closest("[data-definition-letter]");
      if (letter) {
        setState({ letter: letter.getAttribute("data-definition-letter"), term: "" });
        return;
      }
      if (event.target.closest("[data-definitions-clear]")) {
        setState({ query: "", term: "", topic: "all", letter: "all" });
        const input = root.querySelector("#definitionsSearchInput");
        if (input) input.focus();
        return;
      }
      const copy = event.target.closest("[data-definition-copy]");
      if (copy) {
        const entry = entryMap.get(state.term);
        const value = copy.getAttribute("data-definition-copy") === "citation"
          ? (entry ? entry.term + " — " + entry.citation + " (snapshot through " + data.meta.currentThrough + ")" : "")
          : currentLink();
        if (value && navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(value).then(function () {
            copyStatus = "Copied to clipboard.";
            render();
          }).catch(function () {
            copyStatus = "Copy failed. Select and copy the address manually.";
            render();
          });
        }
      }
    });

    render();
    return {
      update: function (next) { setState(next, false); },
      setState,
      focusSearch: function () {
        const input = root.querySelector("#definitionsSearchInput");
        if (input) input.focus();
      },
      getState: function () { return Object.assign({}, state); },
      entries
    };
  }

  return { normalize, buildEntries, scoreEntry, searchEntries, create };
});
