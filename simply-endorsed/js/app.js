"use strict";

(() => {
  const APP_META = window.APP_META || {};
  const AC_VERSION_LABEL = APP_META.acVersion || "AC 61-65";
  const ENDORSEMENTS = Array.isArray(window.ENDORSEMENTS) ? window.ENDORSEMENTS.slice() : [];
  const BROWSE_STRUCTURE = Array.isArray(window.BROWSE_STRUCTURE)
    ? window.BROWSE_STRUCTURE.slice()
    : [];

  const CATEGORY_DEFS = [
    {
      id: "all",
      label: "All Endorsements",
      description: "Search the full " + AC_VERSION_LABEL + " endorsement library or open a category for a narrower view.",
    },
    {
      id: "practical-test-prereqs",
      label: "Practical Test Prerequisites",
      description: "Eligibility and deficiency-review endorsements used around practical tests.",
    },
    {
      id: "student-pilot",
      label: "Student Pilot",
      description: "Pre-solo, solo renewal, solo XC, and student-only endorsements.",
    },
    {
      id: "sport-pilot",
      label: "Sport Pilot",
      description: "Sport pilot knowledge, practical test, and aircraft or operations endorsements.",
    },
    {
      id: "recreational-pilot",
      label: "Recreational Pilot",
      description: "Recreational pilot operating limitations, practical test, and solo endorsements.",
    },
    {
      id: "private-pilot",
      label: "Private Pilot",
      description: "Private pilot knowledge and practical-test endorsements plus common checkride bundles.",
    },
    {
      id: "commercial-pilot",
      label: "Commercial Pilot",
      description: "Commercial pilot knowledge and practical-test endorsements plus common checkride bundles.",
    },
    {
      id: "atp",
      label: "ATP",
      description: "ATP Certification Training Program and restricted ATP endorsements.",
    },
    {
      id: "instrument-rating",
      label: "Instrument Rating",
      description: "Instrument knowledge and practical-test endorsements.",
    },
    {
      id: "flight-instructor",
      label: "Flight Instructor",
      description: "FOI, FIA, CFI, CFII, and related instructor endorsements.",
    },
    {
      id: "sport-pilot-instructor",
      label: "Sport Pilot Instructor",
      description: "Knowledge, practical test, and training endorsements for sport pilot instructors.",
    },
    {
      id: "additional-recurrent",
      label: "Additional / Recurrent",
      description: "Flight review, IPC, aircraft endorsements, retests, add-ons, and other recurrent items.",
    },
    {
      id: "robinson-sfar73",
      label: "Robinson SFAR 73",
      description: "R22 and R44 SFAR 73 training, awareness, and proficiency endorsements.",
    },
    {
      id: "specialty-operations",
      label: "Specialty Operations",
      description: "NVG, EFVS, and simplified flight controls endorsements.",
    },
  ];

  const CATEGORY_THEMES = {
    all: {
      accent: "#475569",
      soft: "#f0f1f3",
      line: "#d1d5da",
      ink: "#313b4a",
    },
    "practical-test-prereqs": {
      accent: "#4f46e5",
      soft: "#f1f0fd",
      line: "#d3d1f9",
      ink: "#1d13be",
    },
    "student-pilot": {
      accent: "#f59e0b",
      soft: "#fef7eb",
      line: "#fde7c2",
      ink: "#b37000",
    },
    "sport-pilot": {
      accent: "#16a34a",
      soft: "#ecf8f1",
      line: "#c5e8d2",
      ink: "#0b7633",
    },
    "recreational-pilot": {
      accent: "#65a30d",
      soft: "#f3f8ec",
      line: "#d9e8c3",
      ink: "#477605",
    },
    "private-pilot": {
      accent: "#0ea5e9",
      soft: "#ecf8fd",
      line: "#c3e9fa",
      ink: "#0476a9",
    },
    "commercial-pilot": {
      accent: "#ca8a04",
      soft: "#fbf6eb",
      line: "#f2e2c0",
      ink: "#906200",
    },
    atp: {
      accent: "#1f2937",
      soft: "#edeeef",
      line: "#c7cacd",
      ink: "#151d27",
    },
    "instrument-rating": {
      accent: "#64748b",
      soft: "#f3f4f6",
      line: "#d8dce2",
      ink: "#455162",
    },
    "flight-instructor": {
      accent: "#dc2626",
      soft: "#fceeee",
      line: "#f6c9c9",
      ink: "#a11414",
    },
    "sport-pilot-instructor": {
      accent: "#ea580c",
      soft: "#fdf2ec",
      line: "#fad5c2",
      ink: "#aa3c02",
    },
    "additional-recurrent": {
      accent: "#0d9488",
      soft: "#ecf6f5",
      line: "#c3e4e1",
      ink: "#056b62",
    },
    "robinson-sfar73": {
      accent: "#db2777",
      soft: "#fceef4",
      line: "#f6c9dd",
      ink: "#a01553",
    },
    "specialty-operations": {
      accent: "#7c3aed",
      soft: "#f5effe",
      line: "#decefb",
      ink: "#4f0ac4",
    },
  };

  const TAG_PRIORITY = [
    "checkride",
    "practical test",
    "knowledge test",
    "solo",
    "cross country",
    "night",
    "instrument",
    "flight review",
    "ipc",
    "airspace",
    "spin",
    "tailwheel",
    "tsa",
  ];

  const CATEGORY_MAP = new Map(CATEGORY_DEFS.map((item) => [item.id, item]));
  const BROWSE_MAP = new Map(BROWSE_STRUCTURE.map((item) => [item.categoryId, item]));
  const ENDORSEMENT_MAP = new Map(ENDORSEMENTS.map((item) => [item.id, item]));
  const FEATURED_SUBCATEGORIES = BROWSE_STRUCTURE.flatMap((entry) => (
    Array.isArray(entry.subcategories)
      ? entry.subcategories
        .filter((subcategory) => subcategory.featured === true)
        .map((subcategory) => ({
          categoryId: entry.categoryId,
          subcategoryId: subcategory.id,
          subcategory,
        }))
      : []
  ));

  const TASK_MODES = [
    {
      id: "first-solo-today",
      label: "First solo today",
      helper: "Student pilot solo package",
      categoryId: "student-pilot",
      subcategoryId: "first-solo",
    },
    {
      id: "private-checkride",
      label: "Private checkride",
      helper: "Initial airplane checkride bundle",
      categoryId: "private-pilot",
      subcategoryId: "private-airplane-initial-checkride-bundle",
    },
    {
      id: "instrument-checkride",
      label: "Instrument checkride",
      helper: "Instrument bundle plus practical-test prereqs",
      categoryId: "instrument-rating",
      subcategoryId: "instrument-checkride-bundle",
    },
    {
      id: "flight-review",
      label: "Flight review",
      helper: "Flight review and WINGS signoffs",
      categoryId: "additional-recurrent",
      subcategoryId: "flight-review-and-wings",
    },
    {
      id: "tailwheel",
      label: "Tailwheel",
      helper: "Jump straight to the aircraft endorsement group",
      categoryId: "additional-recurrent",
      subcategoryId: "aircraft-endorsements",
    },
    {
      id: "retest-after-disapproval",
      label: "Retest after disapproval",
      helper: "Find the retraining signoff fast",
      categoryId: "additional-recurrent",
      subcategoryId: "retest-after-disapproval",
    },
  ];

  const DEFAULT_THEME_COLOR = "#ffffff";
  const SIDEBAR_THEME_COLOR = "#c1c3c7";

  const STORAGE_KEYS = {
    favorites: "simply-endorsed:favorites",
    recentEndorsements: "simply-endorsed:recent-endorsements",
    recentSearches: "simply-endorsed:recent-searches",
  };

  const MAX_RECENTS = 8;
  const MAX_RECENT_SEARCHES = 8;
  const MAX_SUGGESTIONS = 7;

  const FILTER_GROUPS = [
    {
      id: "issuer",
      label: "Signer",
      options: [
        { id: "all", label: "Any" },
        { id: "standard-cfi", label: "Standard CFI" },
        { id: "special", label: "Special issuer" },
      ],
    },
    {
      id: "validity",
      label: "Validity",
      options: [
        { id: "all", label: "Any" },
        { id: "time-limit", label: "Time limit" },
        { id: "per-flight", label: "Per-flight" },
      ],
    },
  ];

  const SEARCH_SYNONYMS = {
    bfr: "flight review",
    "checkride signoff": "practical test recommendation",
    "checkride endorsement": "practical test recommendation",
    "add on": "additional category class",
    addon: "additional category class",
    "add-on": "additional category class",
    hp: "high performance",
    hpa: "high performance",
    ipc: "instrument proficiency check",
    aktr: "knowledge test deficiency review",
    "8710": "practical test recommendation",
  };

  const ISSUER_LABELS = {
    "standard-cfi": "Standard CFI signoff",
    "examiner-only": "Examiner only",
    "dpe-or-asi-only": "DPE or ASI only",
    "approved-institution": "Approved institution",
    "non-instructor": "Qualified non-instructor",
  };

  const SIGNATURE_DISPLAY = {
    "standard-cfi": "/s/ [date] J. J. Jones 987654321CFI RE 12-31-2026",
    "examiner-only": "Issued by examiner at the practical test.",
    "dpe-or-asi-only": "Issued by a DPE or FAA ASI only.",
    "approved-institution": "Issued by an authorized academic institution only.",
    "non-instructor": "May be issued by a qualified non-instructor when the rule allows it.",
  };

  const EXPIRATION_LABELS = {
    "90-calendar-days": "90 days",
    "2-calendar-months": "2 months",
    none: "",
  };

  function loadStoredArray(key) {
    try {
      const value = window.localStorage.getItem(key);
      const parsed = value ? JSON.parse(value) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function saveStoredArray(key, values) {
    try {
      window.localStorage.setItem(key, JSON.stringify(values));
    } catch (error) {
      // Ignore storage write failures so the app still works in private mode.
    }
  }

  const state = {
    query: "",
    category: "all",
    subcategory: null,
    includeSupplemental: false,
    filterPopoverOpen: false,
    descriptionExpanded: false,
    selectionUiKey: "",
    expandedIds: new Set(),
    openCategory: null,
    sidebarOpen: false,
    view: "browse",
    filters: {
      issuer: "all",
      validity: "all",
    },
    favorites: loadStoredArray(STORAGE_KEYS.favorites),
    recentEndorsements: loadStoredArray(STORAGE_KEYS.recentEndorsements),
    recentSearches: loadStoredArray(STORAGE_KEYS.recentSearches),
  };

  const dom = {
    clearSearchBtn: document.getElementById("clearSearchBtn"),
    footerGuidanceBtn: document.getElementById("footerGuidanceBtn"),
    searchInput: document.getElementById("searchInput"),
    searchSuggestions: document.getElementById("searchSuggestions"),
    categoryNav: document.getElementById("categoryNav"),
    endorsementList: document.getElementById("endorsementList"),
    resultsSummary: document.getElementById("resultsSummary"),
    selectionSummary: document.getElementById("selectionSummary"),
    selectionBreadcrumbs: document.getElementById("selectionBreadcrumbs"),
    selectionTitle: document.getElementById("selectionTitle"),
    selectionDescription: document.getElementById("selectionDescription"),
    selectionMeta: document.getElementById("selectionMeta"),
    filtersToggle: document.getElementById("filtersToggle"),
    activeFiltersBar: document.getElementById("activeFiltersBar"),
    filterPopover: document.getElementById("filterPopover"),
    scopeControls: document.getElementById("scopeControls"),
    bundleBar: document.getElementById("bundleBar"),
    featuredStrip: document.getElementById("featuredStrip"),
    footerMeta: document.getElementById("footerMeta"),
    filterRail: document.getElementById("filterRail"),
    sidebarToggleBtn: document.getElementById("sidebarToggleBtn"),
    sidebarBackdrop: document.getElementById("sidebarBackdrop"),
    themeColorMeta: document.getElementById("themeColorMeta"),
    railCloseBtn: document.getElementById("railCloseBtn"),
    topbarGuidanceBtn: document.getElementById("topbarGuidanceBtn"),
    guidanceView: document.getElementById("guidanceView"),
    statusRow: document.querySelector(".status-row"),
    resultsToolbar: document.getElementById("resultsToolbar"),
  };

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function normalizeText(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function dedupeStrings(values) {
    const seen = new Set();
    return values.filter((value) => {
      const normalized = String(value || "").trim();
      if (!normalized || seen.has(normalized)) {
        return false;
      }
      seen.add(normalized);
      return true;
    });
  }

  function setStoredArray(key, values, maxItems) {
    const nextValues = dedupeStrings(values).slice(0, maxItems);
    saveStoredArray(key, nextValues);
    return nextValues;
  }

  function pushStoredValue(key, currentValues, value, maxItems) {
    const normalized = String(value || "").trim();
    if (!normalized) {
      return currentValues.slice();
    }
    return setStoredArray(key, [normalized].concat(currentValues), maxItems);
  }

  function getPdfPageUrl(pageNumber) {
    if (!APP_META.sourceUrl) {
      return "";
    }

    const normalized = String(pageNumber || "").trim();
    if (!normalized) {
      return APP_META.sourceUrl;
    }

    return /^\d+$/.test(normalized)
      ? APP_META.sourceUrl + "#page=" + encodeURIComponent(normalized)
      : APP_META.sourceUrl;
  }

  function getSourceLinkLabel(pageNumber) {
    const normalized = String(pageNumber || "").trim();
    if (/^\d+$/.test(normalized)) {
      return "Open FAA PDF to page " + normalized;
    }
    return normalized
      ? "Open FAA PDF (source page " + normalized + ")"
      : "Open FAA PDF";
  }

  function getExpirationPlainText(expiration) {
    if (expiration === "90-calendar-days") {
      return "Valid for 90 calendar days from the date of the endorsement.";
    }
    if (expiration === "2-calendar-months") {
      return "Valid for 2 calendar months from the date of the endorsement.";
    }
    return "No built-in expiration in the model endorsement text.";
  }

  function getUsageCaution(item) {
    if (item.perFlight) {
      return "Required for each individual flight, not as a one-time signoff.";
    }
    if (item.whoIssues === "examiner-only" || item.whoIssues === "dpe-or-asi-only") {
      return "Do not plan this as a standard instructor signoff; the signer is limited by rule.";
    }
    if (item.whoIssues === "approved-institution") {
      return "This endorsement comes from an approved institution, not a typical instructor workflow.";
    }
    if (item.whoIssues === "non-instructor") {
      return "Confirm the rule path before using this because a qualified non-instructor may issue it.";
    }
    return "";
  }

  function getSpecialIssuerLabel(item) {
    if (item.whoIssues === "standard-cfi") {
      return "Standard CFI";
    }
    return ISSUER_LABELS[item.whoIssues] || "Special issuer";
  }

  function updateFavorites(nextValues) {
    state.favorites = setStoredArray(STORAGE_KEYS.favorites, nextValues, ENDORSEMENTS.length);
  }

  function recordRecentEndorsement(endorsementId) {
    state.recentEndorsements = pushStoredValue(
      STORAGE_KEYS.recentEndorsements,
      state.recentEndorsements,
      endorsementId,
      MAX_RECENTS,
    );
  }

  function recordRecentSearch(query) {
    const normalized = String(query || "").trim();
    if (!normalized) {
      return;
    }
    state.recentSearches = pushStoredValue(
      STORAGE_KEYS.recentSearches,
      state.recentSearches,
      normalized,
      MAX_RECENT_SEARCHES,
    );
  }

  function toggleFavorite(endorsementId) {
    if (!endorsementId) {
      return;
    }

    if (state.favorites.includes(endorsementId)) {
      updateFavorites(state.favorites.filter((id) => id !== endorsementId));
      return;
    }

    updateFavorites([endorsementId].concat(state.favorites));
  }

  function getCategoryTheme(categoryId) {
    return CATEGORY_THEMES[categoryId] || CATEGORY_THEMES.all;
  }

  function getCategoryThemeStyle(categoryId) {
    const theme = getCategoryTheme(categoryId);
    return (
      ' style="--category-accent: ' + theme.accent + "; " +
      "--category-soft: " + theme.soft + "; " +
      "--category-line: " + theme.line + "; " +
      "--category-ink: " + theme.ink + ';"'
    );
  }

  function applyCategoryTheme(element, categoryId) {
    if (!element) {
      return;
    }

    const theme = getCategoryTheme(categoryId);
    element.style.setProperty("--category-accent", theme.accent);
    element.style.setProperty("--category-soft", theme.soft);
    element.style.setProperty("--category-line", theme.line);
    element.style.setProperty("--category-ink", theme.ink);
  }

  function renderMetaItem(value, classNames) {
    const classes = ["meta-item"];
    if (classNames) {
      classes.push(classNames);
    }
    return '<span class="' + classes.join(" ") + '">' + escapeHtml(value) + "</span>";
  }

  function renderWarnMetaItem(value) {
    return (
      '<span class="chip-warn">' +
      '<span class="warn-icon" aria-hidden="true"></span>' +
      '<span>' + escapeHtml(value) + "</span>" +
      "</span>"
    );
  }

  function renderDetailMetaPill(label, value) {
    return (
      '<span class="detail-meta-pill">' +
      '<span class="detail-meta-pill-label">' + escapeHtml(label) + "</span>" +
      '<span class="detail-meta-pill-value">' + escapeHtml(value) + "</span>" +
      "</span>"
    );
  }

  function getValidityDisplayValue(item) {
    if (item.perFlight) {
      return "Each flight";
    }
    if (item.expiration === "90-calendar-days") {
      return "90 days";
    }
    if (item.expiration === "2-calendar-months") {
      return "2 months";
    }
    return "No set expiration";
  }

  function debounce(fn, delay) {
    let timeoutId = null;
    return function debounced() {
      const args = arguments;
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => fn.apply(null, args), delay);
    };
  }

  function syncSearchInput() {
    if (dom.searchInput) {
      dom.searchInput.value = state.query;
    }
    if (dom.clearSearchBtn) {
      dom.clearSearchBtn.hidden = state.query === "";
    }
  }

  function setSearchQuery(value) {
    state.query = String(value || "");
    syncSearchInput();
  }

  function clearSearch() {
    setSearchQuery("");
  }

  function resetExpandedCards() {
    state.expandedIds = new Set();
  }

  function getUrlState() {
    const params = new URLSearchParams(window.location.search);
    return {
      view: params.get("view") || "browse",
      category: params.get("category") || "all",
      subcategory: params.get("subcategory") || null,
      query: params.get("q") || "",
      includeSupplemental: params.get("bundle") === "full",
      expandedIds: (params.get("expanded") || "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
      issuerFilter: params.get("issuer") || "all",
      validityFilter: params.get("validity") || "all",
    };
  }

  function applyUrlState() {
    const nextState = getUrlState();

    state.view = nextState.view === "guidance" ? "guidance" : "browse";
    state.category = CATEGORY_MAP.has(nextState.category) ? nextState.category : "all";
    state.subcategory = nextState.subcategory;
    state.query = nextState.query;
    state.includeSupplemental = nextState.includeSupplemental;
    state.openCategory = state.category === "all" ? null : state.category;
    state.filters.issuer = FILTER_GROUPS[0].options.some((option) => option.id === nextState.issuerFilter)
      ? nextState.issuerFilter
      : "all";
    state.filters.validity = FILTER_GROUPS[1].options.some((option) => option.id === nextState.validityFilter)
      ? nextState.validityFilter
      : "all";
    state.expandedIds = new Set(nextState.expandedIds.filter((id) => ENDORSEMENT_MAP.has(id)));

    if (state.view !== "guidance") {
      const entry = getCategoryEntry(state.category);
      if (state.category === "all") {
        state.subcategory = null;
      } else if (state.subcategory) {
        const subcategories = entry && Array.isArray(entry.subcategories) ? entry.subcategories : [];
        if (!subcategories.some((item) => item.id === state.subcategory)) {
          state.subcategory = null;
        }
      }
    } else {
      state.category = "all";
      state.subcategory = null;
      state.includeSupplemental = false;
      state.query = "";
    }

    syncSearchInput();
  }

  function syncUrlState() {
    const params = new URLSearchParams();

    if (state.view === "guidance") {
      params.set("view", "guidance");
    }

    if (state.category !== "all") {
      params.set("category", state.category);
    }

    if (state.subcategory) {
      params.set("subcategory", state.subcategory);
    }

    if (state.query) {
      params.set("q", state.query);
    }

    if (state.includeSupplemental) {
      params.set("bundle", "full");
    }

    if (state.filters.issuer !== "all") {
      params.set("issuer", state.filters.issuer);
    }

    if (state.filters.validity !== "all") {
      params.set("validity", state.filters.validity);
    }

    if (state.expandedIds.size) {
      params.set("expanded", Array.from(state.expandedIds).join(","));
    }

    const queryString = params.toString();
    const nextUrl = window.location.pathname + (queryString ? "?" + queryString : "") + window.location.hash;
    window.history.replaceState(null, "", nextUrl);
  }

  function getCardExplanation(item) {
    return item.cardExplanation || item.explanation || "";
  }

  function getAcRef(item) {
    if (item && typeof item.acRef === "string" && item.acRef.trim()) {
      return item.acRef;
    }
    if (item && item.id) {
      return AC_VERSION_LABEL + ", " + item.id;
    }
    return AC_VERSION_LABEL;
  }

  function getCfrSearchPhrases(cfrValue) {
    const clean = String(cfrValue || "").replace(/^§\s*/, "").trim();
    if (!clean) {
      return [];
    }
    return [
      clean,
      "14 CFR " + clean,
      "section " + clean,
    ];
  }

  function buildSearchIndex(item) {
    const cfrPhrases = Array.isArray(item.cfr)
      ? item.cfr.flatMap((value) => [value].concat(getCfrSearchPhrases(value)))
      : [];
    return normalizeText(
      [
        item.id,
        item.title,
        getCardExplanation(item),
        item.explanation,
        item.verbatimText,
        getAcRef(item),
        cfrPhrases.join(" "),
        Array.isArray(item.aliases) ? item.aliases.join(" ") : "",
        Array.isArray(item.tags) ? item.tags.join(" ") : "",
        getSpecialIssuerLabel(item),
        getExpirationPlainText(item.expiration),
        item.perFlight ? "per flight every flight" : "",
      ].join(" "),
    );
  }

  function getExpandedQueryVariants(query) {
    const normalized = normalizeText(query);
    if (!normalized) {
      return [];
    }

    const variants = [normalized];
    const synonym = SEARCH_SYNONYMS[normalized];
    if (synonym) {
      variants.push(normalizeText(synonym));
    }

    Object.keys(SEARCH_SYNONYMS).forEach((key) => {
      if (normalized.indexOf(key) !== -1) {
        variants.push(normalizeText(normalized.replace(key, SEARCH_SYNONYMS[key])));
      }
    });

    const cfrMatch = normalized.match(/(?:14 cfr |section )?(\d+\s+\d+[a-z]?(?:\s+[a-z0-9]+)*)/);
    if (cfrMatch && cfrMatch[1]) {
      variants.push(normalizeText(cfrMatch[1]));
    }

    return dedupeStrings(variants);
  }

  function itemMatchesQuery(item, query) {
    const variants = getExpandedQueryVariants(query);
    if (!variants.length) {
      return true;
    }

    if (!item._searchIndex) {
      item._searchIndex = buildSearchIndex(item);
    }

    return variants.some((variant) => variant && item._searchIndex.indexOf(variant) !== -1);
  }

  function getMatchReasons(item, query) {
    const variants = getExpandedQueryVariants(query);
    if (!variants.length) {
      return [];
    }

    const fields = [
      { label: "ID", value: item.id },
      { label: "title", value: item.title },
      { label: "summary", value: getCardExplanation(item) },
      { label: "CFR", value: Array.isArray(item.cfr) ? item.cfr.join(" ") : "" },
      { label: "alias", value: Array.isArray(item.aliases) ? item.aliases.join(" ") : "" },
      { label: "tag", value: Array.isArray(item.tags) ? item.tags.join(" ") : "" },
      { label: "issuer", value: getSpecialIssuerLabel(item) },
    ];

    return fields
      .filter((field) => variants.some((variant) => normalizeText(field.value).indexOf(variant) !== -1))
      .map((field) => field.label)
      .filter((label, index, labels) => labels.indexOf(label) === index);
  }

  function getMatchScore(item, query) {
    const variants = getExpandedQueryVariants(query);
    const rawQuery = normalizeText(query);
    if (!variants.length) {
      return 0;
    }

    const fields = {
      id: normalizeText(item.id),
      title: normalizeText(item.title),
      summary: normalizeText(getCardExplanation(item)),
      explanation: normalizeText(item.explanation),
      verbatim: normalizeText(item.verbatimText),
      cfr: normalizeText(Array.isArray(item.cfr) ? item.cfr.join(" ") : ""),
      aliases: normalizeText(Array.isArray(item.aliases) ? item.aliases.join(" ") : ""),
      tags: normalizeText(Array.isArray(item.tags) ? item.tags.join(" ") : ""),
    };

    let score = 0;

    if (rawQuery) {
      if (fields.id === rawQuery) {
        score = Math.max(score, 240);
      }
      if (fields.aliases.indexOf(rawQuery) !== -1) {
        score = Math.max(score, 225);
      }
      if (fields.title.indexOf(rawQuery) !== -1) {
        score = Math.max(score, 210);
      }
    }

    variants.forEach((variant) => {
      if (!variant) {
        return;
      }

      if (fields.id === variant) {
        score = Math.max(score, 220);
      }
      if (fields.title === variant) {
        score = Math.max(score, 200);
      }
      if (fields.aliases.indexOf(variant) !== -1) {
        score = Math.max(score, 180);
      }
      if (fields.title.indexOf(variant) !== -1) {
        score = Math.max(score, 170);
      }
      if (fields.tags.indexOf(variant) !== -1) {
        score = Math.max(score, 145);
      }
      if (fields.summary.indexOf(variant) !== -1) {
        score = Math.max(score, 130);
      }
      if (fields.cfr.indexOf(variant) !== -1) {
        score = Math.max(score, 120);
      }
      if (fields.explanation.indexOf(variant) !== -1) {
        score = Math.max(score, 100);
      }
      if (fields.verbatim.indexOf(variant) !== -1) {
        score = Math.max(score, 70);
      }
    });

    return score;
  }

  function getTagPriority(tag) {
    const normalizedTag = normalizeText(tag);
    const index = TAG_PRIORITY.findIndex((priority) => normalizedTag.indexOf(priority) !== -1);
    return index === -1 ? TAG_PRIORITY.length : index;
  }

  function tagRepeatsCategory(normalizedTag, categoryLabel) {
    const tagTokens = normalizedTag.split(" ").filter(Boolean);
    const categoryTokens = categoryLabel.split(" ").filter(Boolean);

    if (!tagTokens.length || !categoryTokens.length) {
      return false;
    }

    const overlapCount = tagTokens.filter((token) => categoryTokens.includes(token)).length;
    return overlapCount === tagTokens.length || (overlapCount / tagTokens.length) >= 0.66;
  }

  function getDisplayTags(item) {
    const category = CATEGORY_MAP.get(item.category);
    const categoryLabel = normalizeText(category ? category.label : "");

    return (Array.isArray(item.tags) ? item.tags : [])
      .map((tag) => String(tag || "").trim())
      .filter(Boolean)
      .filter((tag, index, tags) => (
        tags.findIndex((candidate) => normalizeText(candidate) === normalizeText(tag)) === index
      ))
      .filter((tag) => {
        const normalizedTag = normalizeText(tag);

        if (!normalizedTag || !categoryLabel) {
          return Boolean(normalizedTag);
        }

        return (
          normalizedTag !== categoryLabel &&
          normalizedTag.indexOf(categoryLabel) === -1 &&
          categoryLabel.indexOf(normalizedTag) === -1 &&
          !tagRepeatsCategory(normalizedTag, categoryLabel)
        );
      })
      .sort((left, right) => {
        const leftPriority = getTagPriority(left);
        const rightPriority = getTagPriority(right);

        if (leftPriority !== rightPriority) {
          return leftPriority - rightPriority;
        }

        return left.localeCompare(right);
      })
      .slice(0, 2);
  }

  function getVisibleCategoryCounts() {
    const counts = { all: 0 };

    CATEGORY_DEFS.forEach((category) => {
      counts[category.id] = 0;
    });

    ENDORSEMENTS.forEach((item) => {
      if (!itemMatchesQuery(item, state.query) || !itemMatchesFilters(item)) {
        return;
      }

      counts.all += 1;
      counts[item.category] = (counts[item.category] || 0) + 1;
    });

    return counts;
  }

  function getCategoryEntry(categoryId) {
    return BROWSE_MAP.get(categoryId) || null;
  }

  function getSelectedSubcategory() {
    if (!state.subcategory || state.category === "all") {
      return null;
    }
    const entry = getCategoryEntry(state.category);
    if (!entry) {
      return null;
    }
    return entry.subcategories.find((item) => item.id === state.subcategory) || null;
  }

  function getSubcategoryContentRenderer(subcategory) {
    return subcategory && typeof subcategory.contentRenderer === "string"
      ? subcategory.contentRenderer
      : null;
  }

  function getPreSoloContent() {
    return window.PRE_SOLO_CONTENT || null;
  }

  function getPreSoloPrerequisiteCount() {
    const content = getPreSoloContent();
    return content && Array.isArray(content.prerequisites) ? content.prerequisites.length : 0;
  }

  function getItemNoun(subcategory) {
    return getSubcategoryContentRenderer(subcategory) === "pre-solo"
      ? "prerequisite"
      : "endorsement";
  }

  function formatItemCount(count, subcategory) {
    const noun = getItemNoun(subcategory);
    return String(count) + " " + noun + (count === 1 ? "" : "s");
  }

  function getBundleCount(subcategory) {
    if (!subcategory) {
      return 0;
    }

    if (getSubcategoryContentRenderer(subcategory) === "pre-solo") {
      return getPreSoloPrerequisiteCount();
    }

    const ids = new Set(Array.isArray(subcategory.primaryIds) ? subcategory.primaryIds : []);
    if (Array.isArray(subcategory.supplementalIds)) {
      subcategory.supplementalIds.forEach((id) => ids.add(id));
    }
    return ids.size;
  }

  function focusSelectionSummary() {
    if (dom.selectionSummary && typeof dom.selectionSummary.focus === "function") {
      dom.selectionSummary.focus({ preventScroll: true });
    }
  }

  function getStickyScrollOffset() {
    const topbar = document.querySelector(".topbar-sticky");
    const topbarHeight = topbar ? topbar.getBoundingClientRect().height : 0;
    return Math.ceil(topbarHeight + 20);
  }

  function scrollToTarget(target) {
    if (!target) {
      return;
    }

    const top = Math.max(
      0,
      target.getBoundingClientRect().top + window.scrollY - getStickyScrollOffset(),
    );
    window.scrollTo({ top, behavior: "smooth" });
  }

  function queueScrollToTarget(target) {
    if (!target) {
      return;
    }

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        scrollToTarget(target);
      });
    });
  }

  function scrollToPageTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function queueScrollToPageTop() {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        scrollToPageTop();
      });
    });
  }

  function activateAllEndorsements(options = {}) {
    if (!options.preserveQuery) {
      clearSearch();
    }

    state.view = "browse";
    state.category = "all";
    state.subcategory = null;
    state.includeSupplemental = false;
    resetExpandedCards();
    state.openCategory = null;

    if (options.closeSidebar !== false) {
      closeSidebar({ returnFocus: false });
    }

    refresh();

    if (options.scroll !== false) {
      window.requestAnimationFrame(() => {
        focusSelectionSummary();
      });
      queueScrollToPageTop();
    }
  }

  function activateCategory(categoryId, options = {}) {
    if (!categoryId || categoryId === "all") {
      activateAllEndorsements(options);
      return;
    }

    if (!options.preserveQuery) {
      clearSearch();
    }

    state.view = "browse";
    state.category = categoryId;
    state.subcategory = null;
    state.includeSupplemental = false;
    resetExpandedCards();
    state.openCategory = categoryId;

    if (options.closeSidebar !== false) {
      closeSidebar({ returnFocus: false });
    }

    refresh();

    if (options.scroll !== false) {
      window.requestAnimationFrame(() => {
        focusSelectionSummary();
      });
      queueScrollToPageTop();
    }
  }

  function activateSubcategory(categoryId, subcategoryId, options = {}) {
    if (!categoryId || !subcategoryId) {
      return;
    }

    if (!options.preserveQuery) {
      clearSearch();
    }

    state.view = "browse";
    state.category = categoryId;
    state.subcategory = subcategoryId;
    state.includeSupplemental = false;
    resetExpandedCards();
    state.openCategory = categoryId;

    if (options.closeSidebar !== false) {
      closeSidebar({ returnFocus: false });
    }

    refresh();

    if (options.scroll !== false) {
      window.requestAnimationFrame(() => {
        focusSelectionSummary();
      });
      queueScrollToPageTop();
    }
  }

  function activateGuidance(options = {}) {
    if (!options.preserveQuery) {
      clearSearch();
    }

    state.view = "guidance";
    state.category = "all";
    state.subcategory = null;
    resetExpandedCards();

    if (options.closeSidebar !== false) {
      closeSidebar({ returnFocus: false });
    }

    document.title = "Teaching & Guidance \u2013 Simply Endorsed";
    refresh();

    if (options.scroll !== false) {
      queueScrollToPageTop();
    }
  }

  function getBundleIds(subcategory) {
    if (!subcategory) {
      return null;
    }

    const ids = subcategory.primaryIds.slice();
    if (state.includeSupplemental && Array.isArray(subcategory.supplementalIds)) {
      subcategory.supplementalIds.forEach((id) => {
        if (!ids.includes(id)) {
          ids.push(id);
        }
      });
    }
    return ids;
  }

  function itemMatchesFilters(item) {
    if (state.filters.issuer === "standard-cfi" && item.whoIssues !== "standard-cfi") {
      return false;
    }

    if (state.filters.issuer === "special" && item.whoIssues === "standard-cfi") {
      return false;
    }

    if (state.filters.validity === "time-limit" && item.expiration === "none") {
      return false;
    }

    if (state.filters.validity === "per-flight" && !item.perFlight) {
      return false;
    }

    return true;
  }

  function getScopedEndorsements() {
    const selectedSubcategory = getSelectedSubcategory();
    if (selectedSubcategory) {
      return getBundleIds(selectedSubcategory)
        .map((id) => ENDORSEMENT_MAP.get(id))
        .filter(Boolean);
    }

    const scoped = ENDORSEMENTS
      .filter((item) => state.category === "all" || item.category === state.category)
      .sort((left, right) => left.order - right.order);

    return scoped;
  }

  function getSearchMatchedEndorsements() {
    const query = state.query;
    const matched = getScopedEndorsements().filter((item) => itemMatchesQuery(item, query));

    if (!query) {
      return matched;
    }

    return matched.sort((left, right) => (
      getMatchScore(right, query) - getMatchScore(left, query) ||
      left.order - right.order
    ));
  }

  function getVisibleEndorsements() {
    return getSearchMatchedEndorsements().filter(itemMatchesFilters);
  }

  function validateData() {
    const errors = [];
    const warnings = [];
    const ids = new Set();
    const requiredEndorsementFields = [
      "id",
      "order",
      "title",
      "category",
      "cfr",
      "sourcePage",
      "explanation",
      "verbatimText",
      "whoIssues",
      "expiration",
      "perFlight",
      "aliases",
      "tags",
    ];

    if (ENDORSEMENTS.length !== 96) {
      warnings.push("Expected 96 endorsements, found " + ENDORSEMENTS.length + ".");
    }

    ENDORSEMENTS.forEach((item, index) => {
      requiredEndorsementFields.forEach((field) => {
        if (typeof item[field] === "undefined") {
          errors.push("Endorsement at index " + index + " is missing field " + field + ".");
        }
      });
      if (ids.has(item.id)) {
        errors.push("Duplicate endorsement id " + item.id + ".");
      }
      ids.add(item.id);
      if (!Array.isArray(item.cfr)) {
        errors.push(item.id + " has non-array cfr.");
      }
      if (!Array.isArray(item.aliases)) {
        errors.push(item.id + " has non-array aliases.");
      }
      if (!Array.isArray(item.tags)) {
        errors.push(item.id + " has non-array tags.");
      }
      if (
        typeof item.cardExplanation !== "undefined" &&
        typeof item.cardExplanation !== "string"
      ) {
        errors.push(item.id + " has non-string cardExplanation.");
      }
      if (typeof item.cardExplanation === "undefined") {
        warnings.push(
          item.id + " is missing cardExplanation; condensed cards will fall back to explanation.",
        );
      }
    });

    if (errors.length) {
      console.error("[Simply Endorsed] Validation errors:", errors);
    }
    if (warnings.length) {
      console.warn("[Simply Endorsed] Validation warnings:", warnings);
    }
  }

  function validateBrowseStructure() {
    const errors = [];
    const warnings = [];
    const seenSubcategories = new Set();

    if (!BROWSE_STRUCTURE.length) {
      errors.push("BROWSE_STRUCTURE is missing or empty.");
    }

    BROWSE_STRUCTURE.forEach((entry, entryIndex) => {
      if (!entry || !entry.categoryId) {
        errors.push("Browse structure entry " + entryIndex + " is missing categoryId.");
        return;
      }
      if (!CATEGORY_MAP.has(entry.categoryId) || entry.categoryId === "all") {
        errors.push("Browse structure references unknown category " + entry.categoryId + ".");
      }
      if (!Array.isArray(entry.subcategories)) {
        errors.push("Browse structure category " + entry.categoryId + " has non-array subcategories.");
        return;
      }

      entry.subcategories.forEach((subcategory, subIndex) => {
        ["id", "label", "description", "primaryIds"].forEach((field) => {
          if (typeof subcategory[field] === "undefined") {
            errors.push(
              "Subcategory " +
              entry.categoryId +
              " at index " +
              subIndex +
              " is missing field " +
              field +
              ".",
            );
          }
        });

        if (seenSubcategories.has(subcategory.id)) {
          errors.push("Duplicate subcategory id " + subcategory.id + ".");
        }
        seenSubcategories.add(subcategory.id);

        if (!Array.isArray(subcategory.primaryIds)) {
          errors.push("Subcategory " + subcategory.id + " must define primaryIds as an array.");
        } else if (!subcategory.primaryIds.length && !getSubcategoryContentRenderer(subcategory)) {
          errors.push("Subcategory " + subcategory.id + " must include at least one primary id.");
        } else {
          subcategory.primaryIds.forEach((id) => {
            if (!ENDORSEMENT_MAP.has(id)) {
              errors.push("Subcategory " + subcategory.id + " references unknown primary id " + id + ".");
            }
          });
        }

        if (Array.isArray(subcategory.supplementalIds)) {
          subcategory.supplementalIds.forEach((id) => {
            if (!ENDORSEMENT_MAP.has(id)) {
              errors.push("Subcategory " + subcategory.id + " references unknown supplemental id " + id + ".");
            }
          });
        }
      });
    });

    CATEGORY_DEFS.forEach((category) => {
      if (category.id !== "all" && !BROWSE_MAP.has(category.id)) {
        warnings.push("No browse entry found for category " + category.id + ".");
      }
    });

    if (errors.length) {
      console.error("[Simply Endorsed] Browse validation errors:", errors);
    }
    if (warnings.length) {
      console.warn("[Simply Endorsed] Browse validation warnings:", warnings);
    }
  }

  function renderMeta() {
    if (dom.footerMeta) {
      const docLink = APP_META.documentPageUrl
        ? '<a href="' + escapeHtml(APP_META.documentPageUrl) + '" target="_blank" rel="noopener noreferrer">FAA document page</a>'
        : "";
      const pdfLink = APP_META.sourceUrl
        ? '<a href="' + escapeHtml(APP_META.sourceUrl) + '" target="_blank" rel="noopener noreferrer">official PDF</a>'
        : "";
      const parts = [escapeHtml(APP_META.display || "Source metadata unavailable")];
      if (docLink) {
        parts.push(docLink);
      }
      if (pdfLink) {
        parts.push(pdfLink);
      }
      dom.footerMeta.innerHTML = parts.join(" | ");
    }
  }

  function renderCategoryNav() {
    if (!dom.categoryNav) {
      return;
    }

    const counts = getVisibleCategoryCounts();
    const hasDynamicRailState = Boolean(state.query) || hasActiveFilters();
    const allActive = state.category === "all" && !state.subcategory && state.view !== "guidance";

    const allButton =
      '<button type="button" class="all-button' +
      (allActive ? " is-active" : "") +
      (counts.all === 0 ? " is-empty" : "") +
      '" data-action="all">' +
      "<span>All Endorsements</span>" +
      '<span class="category-count">' + escapeHtml(String(counts.all || 0)) + "</span>" +
      "</button>";

    const groups = CATEGORY_DEFS
      .filter((category) => category.id !== "all")
      .map((category) => {
        const entry = getCategoryEntry(category.id);
        const subcategories = entry && Array.isArray(entry.subcategories) ? entry.subcategories : [];
        const isOpen = state.openCategory === category.id;
        const isActive = state.category === category.id;
        const isCategoryActive = isActive && !state.subcategory;
        const visibleCount = counts[category.id] || 0;
        const groupId = "subcategories-" + category.id;
        const matchDot = hasDynamicRailState && visibleCount > 0
          ? '<span class="match-dot" aria-hidden="true"></span>'
          : "";

        const subcategoryMarkup =
          '<div id="' +
          escapeHtml(groupId) +
          '" class="subcategory-list"' +
          (isOpen ? "" : " hidden") +
          ">" +
          '<button type="button" class="view-category-link' +
          (isCategoryActive ? " is-active" : "") +
          '" data-action="view-category" data-category="' +
          escapeHtml(category.id) +
          '">' +
          "View all " +
          escapeHtml(category.label) +
          "</button>" +
          subcategories.map((subcategory) => {
            const isPreSoloSub = subcategory.id === "pre-solo";
            const isSubActive = isActive && state.subcategory === subcategory.id;
            const startHereBadge = isPreSoloSub
              ? '<span class="start-here-badge" aria-hidden="true">Start here</span>'
              : "";
            return (
              '<button type="button" class="subcategory-link' +
              (isSubActive ? " is-active" : "") +
              '" data-action="subcategory" data-category="' +
              escapeHtml(category.id) +
              '" data-subcategory="' +
              escapeHtml(subcategory.id) +
              '">' +
              escapeHtml(subcategory.label) +
              startHereBadge +
              "</button>"
            );
          }).join("") +
          "</div>";

        return (
          '<section class="nav-group' +
          (isActive ? " is-active" : "") +
          (isCategoryActive ? " is-view-active" : "") +
          (isOpen ? " is-open" : "") +
          (visibleCount === 0 ? " is-empty" : "") +
          '"' +
          getCategoryThemeStyle(category.id) +
          ">" +
          '<button type="button" class="category-button" data-action="toggle-category" data-category="' +
          escapeHtml(category.id) +
          '" aria-expanded="' +
          String(isOpen) +
          '" aria-controls="' +
          escapeHtml(groupId) +
          '">' +
          '<span class="category-label-wrap">' +
          '<span class="category-swatch" aria-hidden="true"></span>' +
          '<span class="category-label">' + escapeHtml(category.label) + "</span>" +
          matchDot +
          '<span class="category-count">' + escapeHtml(String(visibleCount)) + "</span>" +
          "</span>" +
          '<span class="category-caret" aria-hidden="true">' +
          (isOpen ? "▾" : "›") +
          "</span>" +
          "</button>" +
          subcategoryMarkup +
          "</section>"
        );
      })
      .join("");

    const guidanceActive = state.view === "guidance";
    const guidanceButton =
      '<div class="rail-divider" aria-hidden="true"></div>' +
      '<button type="button" class="all-button guidance-nav-btn' +
      (guidanceActive ? " is-active" : "") +
      '" data-action="activate-guidance">' +
      "<span>Teaching &amp; Guidance</span>" +
      "</button>";

    dom.categoryNav.innerHTML = allButton + groups + guidanceButton;
  }

  function renderSelectionBreadcrumbs(category, subcategory) {
    if (!dom.selectionBreadcrumbs) {
      return;
    }

    const crumbs = [];
    if (state.category === "all" && !subcategory) {
      crumbs.push('<span class="breadcrumb-current" aria-current="page">All Endorsements</span>');
    } else {
      crumbs.push('<button type="button" class="breadcrumb-button" data-action="all">All Endorsements</button>');
    }

    if (state.category !== "all") {
      if (subcategory) {
        crumbs.push(
          '<button type="button" class="breadcrumb-button" data-action="view-category" data-category="' +
          escapeHtml(category.id) +
          '">' +
          escapeHtml(category.label) +
          "</button>",
        );
        crumbs.push('<span class="breadcrumb-current" aria-current="page">' + escapeHtml(subcategory.label) + "</span>");
      } else {
        crumbs.push('<span class="breadcrumb-current" aria-current="page">' + escapeHtml(category.label) + "</span>");
      }
    }

    dom.selectionBreadcrumbs.innerHTML = crumbs.join('<span class="breadcrumb-separator" aria-hidden="true">›</span>');
  }

  function hasActiveFilters() {
    return state.filters.issuer !== "all" || state.filters.validity !== "all";
  }

  function getActiveFilterCount() {
    return getActiveFilterChips().length;
  }

  function hasApplicableFilters() {
    return state.view !== "guidance" && FILTER_GROUPS.some((group) => Array.isArray(group.options) && group.options.length);
  }

  function syncSelectionUiState() {
    const nextKey = state.view + ":" + state.category + ":" + (state.subcategory || "");
    if (state.selectionUiKey === nextKey) {
      return;
    }

    state.selectionUiKey = nextKey;
    state.filterPopoverOpen = false;
    state.descriptionExpanded = false;
  }

  function getFilterGroup(groupId) {
    return FILTER_GROUPS.find((group) => group.id === groupId) || null;
  }

  function getFilterOption(groupId, optionId) {
    const group = getFilterGroup(groupId);
    if (!group) {
      return null;
    }
    return group.options.find((option) => option.id === optionId) || null;
  }

  function getActiveFilterChips() {
    return FILTER_GROUPS.flatMap((group) => {
      const value = state.filters[group.id];
      if (!value || value === "all") {
        return [];
      }

      const option = getFilterOption(group.id, value);
      if (!option) {
        return [];
      }

      return [{
        groupId: group.id,
        groupLabel: group.label,
        optionLabel: option.label,
      }];
    });
  }

  function getFilteredOutCount() {
    return Math.max(0, getSearchMatchedEndorsements().length - getVisibleEndorsements().length);
  }

  function clearAllSearchAndFilters() {
    clearSearch();
    state.filters.issuer = "all";
    state.filters.validity = "all";
  }

  function renderSelectionDescription(text) {
    if (!dom.selectionDescription) {
      return;
    }

    const safeText = String(text || "");
    dom.selectionDescription.dataset.fullText = safeText;
    dom.selectionDescription.classList.toggle("is-expanded", state.descriptionExpanded);
    dom.selectionDescription.innerHTML =
      '<span class="selection-description-copy">' +
      escapeHtml(safeText) +
      "</span>" +
      '<button type="button" class="inline-action selection-description-toggle" data-action="toggle-description" hidden>' +
      (state.descriptionExpanded ? "Less" : "More") +
      "</button>";

    syncSelectionDescriptionToggle();
  }

  function syncSelectionDescriptionToggle() {
    if (!dom.selectionDescription) {
      return;
    }

    const copy = dom.selectionDescription.querySelector(".selection-description-copy");
    const toggle = dom.selectionDescription.querySelector(".selection-description-toggle");
    if (!copy || !toggle) {
      return;
    }

    dom.selectionDescription.classList.toggle("is-expanded", state.descriptionExpanded);

    if (!window.matchMedia("(max-width: 720px)").matches) {
      dom.selectionDescription.classList.remove("can-expand");
      toggle.hidden = true;
      return;
    }

    const wasExpanded = state.descriptionExpanded;
    if (wasExpanded) {
      dom.selectionDescription.classList.remove("is-expanded");
    }

    const hasOverflow = copy.scrollHeight > copy.clientHeight + 1;

    if (wasExpanded) {
      dom.selectionDescription.classList.add("is-expanded");
    }

    dom.selectionDescription.classList.toggle("can-expand", hasOverflow);
    toggle.hidden = !hasOverflow;
    toggle.textContent = state.descriptionExpanded ? "Less" : "More";
  }

  function renderFiltersToggle() {
    if (!dom.filtersToggle) {
      return;
    }

    const canRenderFilters = hasApplicableFilters();
    const activeCount = getActiveFilterCount();
    const countLabel = dom.filtersToggle.querySelector(".filters-toggle-count");

    dom.filtersToggle.hidden = !canRenderFilters;
    dom.filtersToggle.setAttribute("aria-expanded", canRenderFilters && state.filterPopoverOpen ? "true" : "false");

    if (countLabel) {
      countLabel.hidden = activeCount === 0;
      countLabel.textContent = activeCount ? "(" + activeCount + ")" : "";
    }

    if (dom.filterPopover) {
      dom.filterPopover.hidden = !canRenderFilters || !state.filterPopoverOpen;
    }
  }

  function closeFilterPopover() {
    if (!state.filterPopoverOpen) {
      return;
    }

    state.filterPopoverOpen = false;
    renderFiltersToggle();
  }

  function renderSelectionMeta() {
    if (!dom.selectionMeta) {
      return;
    }

    const subcategory = getSelectedSubcategory();
    const renderer = getSubcategoryContentRenderer(subcategory);
    const visibleCount = renderer === "pre-solo"
      ? getPreSoloPrerequisiteCount()
      : getVisibleEndorsements().length;
    const items = ['<span class="selection-meta-item">' + escapeHtml(formatItemCount(visibleCount, subcategory)) + "</span>"];

    if (state.category === "all") {
      items.push(
        '<span class="selection-meta-item">' +
        escapeHtml(String(CATEGORY_DEFS.filter((category) => category.id !== "all").length) + " browse categories") +
        "</span>",
      );
    }

    if (subcategory) {
      items.push(
        '<span class="selection-meta-item">' +
        escapeHtml(String(getBundleCount(subcategory)) + " in this path") +
        "</span>",
      );
    }

    if (state.includeSupplemental && subcategory) {
      items.push('<span class="selection-meta-item">Showing full bundle</span>');
    }

    dom.selectionMeta.innerHTML = items.join("");
  }

  function renderActiveFiltersBar() {
    if (!dom.activeFiltersBar) {
      return;
    }

    if (state.view === "guidance") {
      dom.activeFiltersBar.innerHTML = "";
      return;
    }

    const activeFilters = getActiveFilterChips();
    const hiddenCount = getFilteredOutCount();
    const hasClearAll = Boolean(state.query || activeFilters.length);

    if (!hasClearAll) {
      dom.activeFiltersBar.innerHTML = "";
      return;
    }

    const chips = activeFilters.map((filter) => (
      '<button type="button" class="active-filter-chip" data-clear-filter-group="' +
      escapeHtml(filter.groupId) +
      '" aria-label="' +
      escapeHtml("Remove " + filter.groupLabel + " filter: " + filter.optionLabel) +
      '">' +
      '<span class="active-filter-label">' +
      escapeHtml(filter.groupLabel + ": " + filter.optionLabel) +
      "</span>" +
      '<span class="active-filter-remove" aria-hidden="true">×</span>' +
      "</button>"
    ));

    chips.push(
      '<button type="button" class="active-filter-chip active-filter-chip--clear" data-action="clear-all" aria-label="Clear search and filters">' +
      '<span class="active-filter-remove" aria-hidden="true">×</span>' +
      '<span class="active-filter-label">Clear all</span>' +
      "</button>",
    );

    dom.activeFiltersBar.innerHTML =
      '<div class="active-filter-chip-row">' + chips.join("") + "</div>" +
      (hiddenCount > 0
        ? '<span class="active-filter-feedback">' +
          escapeHtml(String(hiddenCount) + " endorsement" + (hiddenCount === 1 ? "" : "s") + " hidden by filters") +
          "</span>"
        : "");
  }

  function renderScopeControls() {
    if (!dom.scopeControls) {
      return;
    }

    if (state.view === "guidance") {
      dom.scopeControls.innerHTML = "";
      return;
    }

    dom.scopeControls.innerHTML = FILTER_GROUPS.map((group) => (
      '<div class="scope-filter-group">' +
      '<span class="scope-filter-label">' + escapeHtml(group.label) + "</span>" +
      '<div class="scope-filter-options">' +
      group.options.map((option) => (
        '<button type="button" class="scope-filter-button' +
        (state.filters[group.id] === option.id ? " is-active" : "") +
        '" data-filter-group="' +
        escapeHtml(group.id) +
        '" data-filter-value="' +
        escapeHtml(option.id) +
        '">' +
        escapeHtml(option.label) +
        "</button>"
      )).join("") +
      "</div>" +
      "</div>"
    )).join("");
  }

  function renderResultsToolbar() {
    if (!dom.resultsToolbar) {
      return;
    }

    if (state.view === "guidance") {
      dom.resultsToolbar.innerHTML = "";
      return;
    }

    const visible = getVisibleEndorsements();
    if (!(visible.length > 1 && visible.length <= 12)) {
      dom.resultsToolbar.innerHTML = "";
      return;
    }

    const allExpanded = visible.every((item) => state.expandedIds.has(item.id));
    dom.resultsToolbar.innerHTML =
      '<button type="button" class="selection-reset" data-action="' +
      (allExpanded ? "collapse-all" : "expand-all") +
      '">' +
      (allExpanded ? "Collapse all" : "Expand all") +
      "</button>";
  }

  function renderSelectionSummary() {
    const category = CATEGORY_MAP.get(state.category) || CATEGORY_MAP.get("all");
    const subcategory = getSelectedSubcategory();
    const renderer = getSubcategoryContentRenderer(subcategory);
    const themeCategoryId = category && category.id ? category.id : "all";
    let descriptionText = category.description;

    syncSelectionUiState();

    applyCategoryTheme(dom.selectionSummary, themeCategoryId);

    renderSelectionBreadcrumbs(category, subcategory);

    if (dom.selectionTitle) {
      dom.selectionTitle.innerHTML =
        '<span class="selection-title-wrap">' +
        '<span class="category-dot" aria-hidden="true"></span>' +
        "<span>" + escapeHtml(subcategory ? subcategory.label : category.label) + "</span>" +
        "</span>";
    }

    if (subcategory) {
      if (renderer === "pre-solo") {
        const preSoloContent = getPreSoloContent();
        descriptionText = preSoloContent && preSoloContent.intro
          ? preSoloContent.intro
          : subcategory.description;
      } else {
        descriptionText = subcategory.note
          ? subcategory.description + " " + subcategory.note
          : subcategory.description;
      }
    }

    renderSelectionDescription(descriptionText);
    renderSelectionMeta();
    renderActiveFiltersBar();
    renderScopeControls();
    renderFiltersToggle();
    renderBundleBar(subcategory);
  }

  function renderBundleBar(subcategory) {
    if (!dom.bundleBar) {
      return;
    }

    if (
      !subcategory ||
      getSubcategoryContentRenderer(subcategory) ||
      !Array.isArray(subcategory.supplementalIds) ||
      !subcategory.supplementalIds.length
    ) {
      dom.bundleBar.hidden = true;
      dom.bundleBar.innerHTML = "";
      return;
    }

    const supplementalRef = "[" + subcategory.supplementalIds.join(", ") + "]";

    dom.bundleBar.hidden = false;
    dom.bundleBar.innerHTML =
      '<span class="bundle-strip-ref mono">' + escapeHtml(supplementalRef) + "</span>" +
      '<span class="bundle-strip-separator bundle-strip-separator-note" aria-hidden="true">·</span>' +
      '<span class="bundle-strip-note">' + escapeHtml(subcategory.supplementalLabel || "Also commonly included") + "</span>" +
      '<span class="bundle-strip-separator" aria-hidden="true">·</span>' +
      '<button type="button" class="bundle-strip-toggle" data-action="toggle-supplemental">' +
      '<span>' + escapeHtml(state.includeSupplemental ? "Show path only" : "Show full bundle") + "</span>" +
      '<span class="bundle-strip-arrow" aria-hidden="true">›</span>' +
      "</button>";
  }

  function copyTextToClipboard(text, button, successLabel) {
    if (!text || !button) {
      return;
    }

    const prior = button.textContent;
    const showCopied = () => {
      button.textContent = successLabel || "Copied";
      button.setAttribute("aria-live", "polite");
      window.setTimeout(() => {
        button.textContent = prior;
      }, 1200);
    };

    const fallbackCopy = () => {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "readonly");
      textarea.style.position = "absolute";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        showCopied();
      } catch (error) {
        // Fallback selection still leaves the text available if execCommand is blocked.
      }
      document.body.removeChild(textarea);
    };

    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      navigator.clipboard.writeText(text).then(showCopied).catch(fallbackCopy);
      return;
    }

    fallbackCopy();
  }

  function openEndorsementById(endorsementId, options = {}) {
    const item = ENDORSEMENT_MAP.get(endorsementId);
    if (!item) {
      return;
    }

    const alreadyVisible = getVisibleEndorsements().some((candidate) => candidate.id === endorsementId);

    if (!alreadyVisible) {
      state.view = "browse";
      state.category = item.category;
      state.subcategory = null;
      state.includeSupplemental = false;
      state.openCategory = item.category;
      if (!itemMatchesFilters(item)) {
        state.filters.issuer = "all";
        state.filters.validity = "all";
      }
      if (!options.preserveQuery) {
        clearSearch();
      }
    }

    state.expandedIds.add(endorsementId);
    recordRecentEndorsement(endorsementId);
    refresh();

    const target = dom.endorsementList
      ? dom.endorsementList.querySelector('[data-endorsement-id="' + CSS.escape(endorsementId) + '"]')
      : null;
    queueScrollToTarget(target || dom.selectionSummary);
  }

  function getRelatedEndorsements(item) {
    const currentSubcategory = getSelectedSubcategory();
    const related = [];
    const seen = new Set([item.id]);

    if (currentSubcategory) {
      getBundleIds(currentSubcategory).forEach((id) => {
        if (!seen.has(id) && ENDORSEMENT_MAP.has(id)) {
          seen.add(id);
          related.push(ENDORSEMENT_MAP.get(id));
        }
      });
    }

    const baseTags = new Set(
      (Array.isArray(item.tags) ? item.tags : [])
        .map((tag) => normalizeText(tag))
        .filter(Boolean),
    );

    ENDORSEMENTS
      .filter((candidate) => candidate.id !== item.id && !seen.has(candidate.id))
      .map((candidate) => {
        const sharedTags = (Array.isArray(candidate.tags) ? candidate.tags : [])
          .map((tag) => normalizeText(tag))
          .filter((tag) => baseTags.has(tag)).length;
        const sameCategory = candidate.category === item.category ? 1 : 0;
        return {
          candidate,
          score: sharedTags * 3 + sameCategory,
        };
      })
      .filter((entry) => entry.score > 0)
      .sort((left, right) => right.score - left.score || left.candidate.order - right.candidate.order)
      .slice(0, 4)
      .forEach((entry) => {
        seen.add(entry.candidate.id);
        related.push(entry.candidate);
      });

    return related.slice(0, 4);
  }

  function getSearchSuggestions() {
    const query = state.query.trim();
    const suggestions = [];

    if (!query) {
      return state.recentSearches.slice(0, MAX_SUGGESTIONS).map((value) => ({
        type: "recent-search",
        label: value,
        query: value,
      }));
    }

    state.recentSearches
      .filter((value) => normalizeText(value).indexOf(normalizeText(query)) !== -1)
      .slice(0, 2)
      .forEach((value) => {
        suggestions.push({
          type: "search",
          label: value,
          meta: "Recent search",
          query: value,
        });
      });

    ENDORSEMENTS
      .filter((item) => itemMatchesQuery(item, query))
      .sort((left, right) => (
        getMatchScore(right, query) - getMatchScore(left, query) ||
        left.order - right.order
      ))
      .slice(0, MAX_SUGGESTIONS)
      .forEach((item) => {
        suggestions.push({
          type: "endorsement",
          label: item.id + " — " + item.title,
          meta: getMatchReasons(item, query).slice(0, 2).join(" · ") || getSpecialIssuerLabel(item),
          endorsementId: item.id,
        });
      });

    return suggestions.slice(0, MAX_SUGGESTIONS);
  }

  function renderSearchSuggestions() {
    if (!dom.searchSuggestions) {
      return;
    }

    if (!state.query && document.activeElement !== dom.searchInput) {
      dom.searchSuggestions.innerHTML = "";
      return;
    }

    const suggestions = getSearchSuggestions();
    if (!suggestions.length) {
      dom.searchSuggestions.innerHTML = "";
      return;
    }

    if (!state.query) {
      dom.searchSuggestions.innerHTML =
        '<div class="search-chip-row">' +
        suggestions.map((suggestion) => (
          '<button type="button" class="search-chip" data-suggestion-query="' + escapeHtml(suggestion.query) + '">' +
          escapeHtml(suggestion.label) +
          "</button>"
        )).join("") +
        "</div>";
      return;
    }

    dom.searchSuggestions.innerHTML =
      '<div class="search-suggestion-row">' +
      suggestions.map((suggestion) => (
        '<button type="button" class="search-suggestion" ' +
        (suggestion.type === "endorsement"
          ? 'data-open-id="' + escapeHtml(suggestion.endorsementId) + '"'
          : 'data-suggestion-query="' + escapeHtml(suggestion.query) + '"') +
        ">" +
        '<span class="search-suggestion-label">' + escapeHtml(suggestion.label) + "</span>" +
        '<span class="search-suggestion-meta">' + escapeHtml(suggestion.meta) + "</span>" +
        "</button>"
      )).join("") +
      "</div>";
  }

  function renderResultsSummary(visibleCount, scopeCount) {
    if (!dom.resultsSummary) {
      return;
    }

    const subcategory = getSelectedSubcategory();
    const renderer = getSubcategoryContentRenderer(subcategory);
    const searchApplies = Boolean(state.query) && renderer !== "pre-solo";
    const parts = [
      formatItemCount(visibleCount, subcategory) + (visibleCount === 1 ? " matches" : " match") + " your selection",
    ];

    if (searchApplies && scopeCount !== visibleCount) {
      parts.push("from " + formatItemCount(scopeCount, subcategory));
    }
    if (state.includeSupplemental && subcategory) {
      parts.push("full bundle");
    }
    if (hasActiveFilters()) {
      parts.push("filters active");
    }
    if (searchApplies) {
      parts.push('search "' + state.query + '"');
    }

    dom.resultsSummary.textContent = parts.join(" · ");
  }

  function renderEndorsementCard(item) {
    const expanded = state.expandedIds.has(item.id);
    const isFavorite = state.favorites.includes(item.id);
    const metaItems = [];
    const cardExplanation = getCardExplanation(item);
    const cardSummary = cardExplanation
      ? '<p class="card-explanation">' + escapeHtml(cardExplanation) + "</p>"
      : "";
    const detailTags = Array.isArray(item.tags) ? item.tags.filter(Boolean) : [];
    const matchReasons = state.query ? getMatchReasons(item, state.query) : [];
    const caution = getUsageCaution(item);
    const relatedItems = getRelatedEndorsements(item);
    const sourcePageUrl = getPdfPageUrl(item.sourcePage);
    const referenceItems = [];
    const expandedRelated = expanded && relatedItems.length
      ? (
        '<div class="expanded-related">' +
        '<span class="detail-inline-label">Related endorsements</span>' +
        '<div class="related-row">' +
        relatedItems.map((related) => (
          '<button type="button" class="related-chip" data-open-id="' + escapeHtml(related.id) + '">' +
          '<span class="mono">' + escapeHtml(related.id) + "</span>" +
          '<span>' + escapeHtml(related.title) + "</span>" +
          "</button>"
        )).join("") +
        "</div>" +
        "</div>"
      )
      : "";

    if (EXPIRATION_LABELS[item.expiration]) {
      metaItems.push(renderWarnMetaItem("Time limit " + EXPIRATION_LABELS[item.expiration]));
    }
    if (item.perFlight) {
      metaItems.push(renderWarnMetaItem("Every XC flight"));
    }
    if (item.whoIssues !== "standard-cfi") {
      metaItems.push(renderMetaItem(getSpecialIssuerLabel(item)));
    }
    if (Array.isArray(item.cfr) && item.cfr.length) {
      metaItems.push(renderMetaItem(item.cfr.join(" | "), "mono"));
    }
    metaItems.push(renderMetaItem("Page " + item.sourcePage, "mono"));

    if (Array.isArray(item.cfr) && item.cfr.length) {
      referenceItems.push(
        '<span class="reference-item">' +
        '<span class="reference-label">CFR</span>' +
        '<span class="mono">' + escapeHtml(item.cfr.join(" | ")) + "</span>" +
        "</span>"
      );
    }
    referenceItems.push(
      '<span class="reference-item">' +
      '<span class="reference-label">Source</span>' +
      '<span>' + escapeHtml(getAcRef(item)) + " · Page " + escapeHtml(item.sourcePage) + "</span>" +
      "</span>"
    );
    if (detailTags.length) {
      referenceItems.push(
        '<span class="reference-item">' +
        '<span class="reference-label">Tags</span>' +
        '<span>' + escapeHtml(detailTags.join(" | ")) + "</span>" +
        "</span>"
      );
    }

    const details = expanded
      ? (
        '<div class="endorsement-details">' +
        '<div class="detail-meta-strip">' +
        renderDetailMetaPill("Signer", getSpecialIssuerLabel(item)) +
        renderDetailMetaPill("Validity", getValidityDisplayValue(item)) +
        "</div>" +
        (
          caution
            ? '<section class="detail-callout" aria-label="Usage caution">' +
              '<span class="detail-callout-label">Use caution</span>' +
              "<p>" + escapeHtml(caution) + "</p>" +
              "</section>"
            : ""
        ) +
        '<section class="detail-section detail-section-wide faa-text-section">' +
        '<div class="faa-text-shell">' +
        '<div class="faa-text-toolbar">' +
        "<h4>FAA model text</h4>" +
        '<div class="faa-text-actions">' +
        '<button type="button" class="inline-action" data-copy-id="' + escapeHtml(item.id) + '">Copy FAA model text</button>' +
        (
          sourcePageUrl
            ? '<a class="inline-action detail-link" href="' + escapeHtml(sourcePageUrl) + '" target="_blank" rel="noopener noreferrer">Open FAA PDF</a>'
            : ""
        ) +
        "</div>" +
        "</div>" +
        '<pre class="verbatim-block mono" data-verbatim-id="' + escapeHtml(item.id) + '">' + escapeHtml(item.verbatimText) + "</pre>" +
        "</div>" +
        "</section>" +
        (
          item.explanation
            ? '<section class="detail-section expanded-explanation">' +
              "<h4>Why This Matters</h4>" +
              "<p>" + escapeHtml(item.explanation).replace(/\n/g, "<br>") + "</p>" +
              "</section>"
            : ""
        ) +
        '<section class="reference-strip" aria-label="Reference details">' + referenceItems.join("") + "</section>" +
        "</div>"
      )
      : "";

    return (
      '<article class="endorsement-card" data-endorsement-id="' +
      escapeHtml(item.id) +
      '"' +
      getCategoryThemeStyle(item.category) +
      ">" +
      '<div class="endorsement-head">' +
      '<div class="endorsement-id-row">' +
      '<span class="category-dot" aria-hidden="true"></span>' +
      '<span class="endorsement-id mono">' + escapeHtml(item.id) + "</span>" +
      "</div>" +
      '<div class="card-head-actions">' +
      '<button type="button" class="save-toggle' + (isFavorite ? " is-active" : "") + '" data-favorite-id="' + escapeHtml(item.id) + '" aria-pressed="' + String(isFavorite) + '" aria-label="' + escapeHtml(isFavorite ? "Remove from saved endorsements" : "Save endorsement") + '">' +
      '<span aria-hidden="true">' + (isFavorite ? "★" : "☆") + "</span>" +
      '<span class="save-toggle-label">' + (isFavorite ? "Saved" : "Save") + "</span>" +
      "</button>" +
      '<button type="button" class="detail-toggle" data-toggle-id="' + escapeHtml(item.id) + '" aria-expanded="' + String(expanded) + '">' +
      '<span>' + (expanded ? "Hide details" : "View details") + "</span>" +
      '<span class="detail-toggle-caret" aria-hidden="true">' + (expanded ? "−" : "›") + "</span>" +
      "</button>" +
      "</div>" +
      "</div>" +
      "<h2>" + escapeHtml(item.title) + "</h2>" +
      cardSummary +
      expandedRelated +
      '<div class="meta-line">' + metaItems.join("") + "</div>" +
      (
        matchReasons.length
          ? '<p class="match-reasons">Matched on ' + escapeHtml(matchReasons.join(" · ")) + "</p>"
          : ""
      ) +
      details +
      "</article>"
    );
  }

  function renderBundleSections(primaryItems, supplementalItems, supplementalLabel) {
    const sectionA = 
      '<div class="bundle-section-label"><h3>Primary endorsements</h3></div>' +
      primaryItems.map((item) => renderEndorsementCard(item)).join("");
      
    const sectionBNote = supplementalLabel
      ? '<p class="bundle-section-note">' + escapeHtml(supplementalLabel) + "</p>"
      : "";
    const sectionB = 
      '<div class="bundle-section-label is-supplemental"><h3>Also commonly included</h3>' + sectionBNote + '</div>' +
      supplementalItems.map((item) => renderEndorsementCard(item)).join("");
      
    return sectionA + sectionB;
  }

  function renderFeaturedStrip() {
    if (!dom.featuredStrip) {
      return;
    }

    const strip = dom.featuredStrip;
    const favoriteItems = state.favorites
      .map((id) => ENDORSEMENT_MAP.get(id))
      .filter(Boolean)
      .slice(0, 4);
    const recentItems = state.recentEndorsements
      .map((id) => ENDORSEMENT_MAP.get(id))
      .filter(Boolean)
      .slice(0, 4);

    if (state.category !== "all" || state.query !== "") {
      strip.hidden = true;
      return;
    }

    if (!FEATURED_SUBCATEGORIES.length && !favoriteItems.length && !recentItems.length) {
      strip.hidden = true;
      strip.innerHTML = "";
      return;
    }

    strip.hidden = false;
    strip.innerHTML =
      '<div class="featured-intro">' +
      '<p class="featured-strip-label">Instructor Quick Starts</p>' +
      "<h3>Common paths instructors reach for.</h3>" +
      "</div>" +
      '<div class="task-mode-grid">' +
      TASK_MODES.map((mode) => {
        const category = CATEGORY_MAP.get(mode.categoryId) || {};
        const categoryLabel = category.label || mode.categoryId;
        const entry = getCategoryEntry(mode.categoryId);
        const subcategory = entry && Array.isArray(entry.subcategories)
          ? entry.subcategories.find((item) => item.id === mode.subcategoryId)
          : null;
        return (
          '<button type="button" class="task-mode-card" data-featured-category="' +
          escapeHtml(mode.categoryId) +
          '" data-featured-subcategory="' +
          escapeHtml(mode.subcategoryId) +
          '"' +
          getCategoryThemeStyle(mode.categoryId) +
          ">" +
          '<span class="task-mode-swatch" aria-hidden="true"></span>' +
          '<span class="task-mode-title">' + escapeHtml(mode.label) + "</span>" +
          '<span class="task-mode-meta">' +
          escapeHtml(categoryLabel + (subcategory ? " · " + getBundleCount(subcategory) + " endorsements" : "")) +
          "</span>" +
          "</button>"
        );
      }).join("") +
      "</div>" +
      '<div class="featured-grid">' +
      FEATURED_SUBCATEGORIES.map((item) => {
        const category = CATEGORY_MAP.get(item.categoryId) || {};
        const categoryLabel = category.label || item.categoryId;
        return (
          '<button type="button" class="featured-card" data-featured-category="' +
          escapeHtml(item.categoryId) +
          '" data-featured-subcategory="' +
          escapeHtml(item.subcategoryId) +
          '"' +
          getCategoryThemeStyle(item.categoryId) +
          ">" +
          '<span class="featured-card-swatch" aria-hidden="true"></span>' +
          '<span class="featured-card-title">' + escapeHtml(item.subcategory.label) + "</span>" +
          '<span class="featured-card-meta">' + escapeHtml(categoryLabel + " · " + getBundleCount(item.subcategory) + " endorsements") + "</span>" +
          "</button>"
        );
      }).join("") +
      "</div>" +
      (
        favoriteItems.length
          ? '<div class="quick-access-panel">' +
            "<h4>Saved endorsements</h4>" +
            '<div class="quick-access-row">' +
            favoriteItems.map((item) => (
              '<button type="button" class="quick-access-chip" data-open-id="' + escapeHtml(item.id) + '">' +
              '<span class="mono">' + escapeHtml(item.id) + "</span>" +
              '<span>' + escapeHtml(item.title) + "</span>" +
              "</button>"
            )).join("") +
            "</div>" +
            "</div>"
          : ""
      ) +
      (
        recentItems.length
          ? '<div class="quick-access-panel">' +
            "<h4>Recent endorsements</h4>" +
            '<div class="quick-access-row">' +
            recentItems.map((item) => (
              '<button type="button" class="quick-access-chip" data-open-id="' + escapeHtml(item.id) + '">' +
              '<span class="mono">' + escapeHtml(item.id) + "</span>" +
              '<span>' + escapeHtml(item.title) + "</span>" +
              "</button>"
            )).join("") +
            "</div>" +
            "</div>"
          : ""
      );
  }

  function renderEndorsements() {
    if (!dom.endorsementList) {
      return;
    }

    const subcategory = getSelectedSubcategory();
    const renderer = getSubcategoryContentRenderer(subcategory);

    if (renderer === "pre-solo") {
      const content = getPreSoloContent();
      const count = getPreSoloPrerequisiteCount();
      renderResultsSummary(count, count);
      dom.endorsementList.innerHTML = renderPreSoloContent(content);
      return;
    }

    const scoped = getScopedEndorsements();
    const searched = getSearchMatchedEndorsements();
    const visible = getVisibleEndorsements();
    renderResultsSummary(visible.length, state.query ? searched.length : scoped.length);

    if (!visible.length) {
      const emptyHint = subcategory && !state.includeSupplemental && Array.isArray(subcategory.supplementalIds) && subcategory.supplementalIds.length
        ? "Try Show full bundle or clear the search."
        : hasActiveFilters()
          ? "Try clearing one of the active filters or use a broader keyword."
          : "Try a broader keyword or switch to a different category.";

      let additionalButton = "";
      if (state.query !== "" && state.category !== "all") {
        additionalButton = '<button type="button" data-action="search-all" data-query="' + escapeHtml(state.query) + '">Search all endorsements for "' + escapeHtml(state.query) + '"</button>';
      }

      dom.endorsementList.innerHTML =
        '<article class="placeholder-card empty-state">' +
        "<h2>No endorsements match this view</h2>" +
        "<p>" + escapeHtml(emptyHint) + "</p>" +
        additionalButton +
        "</article>";
      return;
    }

    if (state.includeSupplemental && subcategory && Array.isArray(subcategory.supplementalIds) && subcategory.supplementalIds.length) {
      const primaryItems = visible.filter((item) => subcategory.primaryIds.includes(item.id));
      const supplementalItems = visible.filter((item) => subcategory.supplementalIds.includes(item.id) && !subcategory.primaryIds.includes(item.id));
      dom.endorsementList.innerHTML = renderBundleSections(primaryItems, supplementalItems, subcategory.supplementalLabel || "");
    } else {
      dom.endorsementList.innerHTML = visible.map((item) => renderEndorsementCard(item)).join("");
    }
  }

  function refresh() {
    const isGuidance = state.view === "guidance";
    if (!isGuidance) document.title = "Simply Endorsed";

    if (isGuidance) {
      state.filterPopoverOpen = false;
      state.descriptionExpanded = false;
      state.selectionUiKey = "";
      if (dom.resultsToolbar) {
        dom.resultsToolbar.innerHTML = "";
      }
      if (dom.filtersToggle) {
        dom.filtersToggle.hidden = true;
        dom.filtersToggle.setAttribute("aria-expanded", "false");
      }
      if (dom.filterPopover) {
        dom.filterPopover.hidden = true;
      }
    }

    if (dom.selectionSummary) dom.selectionSummary.hidden = isGuidance;
    if (dom.statusRow) dom.statusRow.hidden = isGuidance;
    if (dom.endorsementList) dom.endorsementList.hidden = isGuidance;
    if (dom.featuredStrip) dom.featuredStrip.hidden = true;

    renderCategoryNav();
    renderSearchSuggestions();

    if (!isGuidance) {
      renderFeaturedStrip();
      renderSelectionSummary();
      renderEndorsements();
      renderResultsToolbar();
    }

    if (dom.topbarGuidanceBtn) {
      dom.topbarGuidanceBtn.classList.toggle("is-active", isGuidance);
    }
    if (dom.footerGuidanceBtn) {
      dom.footerGuidanceBtn.classList.toggle("is-active", isGuidance);
    }

    renderGuidanceView();
    syncUrlState();
  }

  function renderGuidanceContentBlock(block) {
    var h = escapeHtml;
    if (block.type === "p") {
      return "<p>" + h(block.value) + "</p>";
    }
    if (block.type === "h3") {
      return "<h3>" + h(block.value) + "</h3>";
    }
    if (block.type === "ul") {
      return (
        "<ul>" +
        block.value.map(function (item) { return "<li>" + h(item) + "</li>"; }).join("") +
        "</ul>"
      );
    }
    if (block.type === "ol") {
      return (
        "<ol>" +
        block.value.map(function (item) { return "<li>" + h(item) + "</li>"; }).join("") +
        "</ol>"
      );
    }
    return "";
  }

  function renderGuidanceView() {
    if (!dom.guidanceView) return;

    if (state.view !== "guidance") {
      dom.guidanceView.hidden = true;
      return;
    }

    dom.guidanceView.hidden = false;

    if (typeof GUIDANCE_SECTIONS === "undefined") {
      dom.guidanceView.innerHTML = "<p>Guidance content unavailable.</p>";
      return;
    }

    var tocItems = GUIDANCE_SECTIONS.map(function (section) {
      return (
        '<li><a class="guidance-toc-link" href="#gs-' +
        escapeHtml(section.id) +
        '">' +
        escapeHtml(section.title) +
        "</a></li>"
      );
    }).join("");

    var cards = GUIDANCE_SECTIONS.map(function (section) {
      var bodyId = "gs-" + escapeHtml(section.id);
      var bodyHtml = section.content.map(renderGuidanceContentBlock).join("");
      return (
        '<div class="guidance-card" id="' + escapeHtml(section.id) + '">' +
        '<button type="button" class="guidance-toggle" aria-expanded="false" aria-controls="' + bodyId + '">' +
        "<span>" + escapeHtml(section.title) + "</span>" +
        '<span class="detail-toggle-caret" aria-hidden="true">+</span>' +
        "</button>" +
        '<div id="' + bodyId + '" class="guidance-body" hidden>' +
        bodyHtml +
        "</div>" +
        "</div>"
      );
    }).join("");

    dom.guidanceView.innerHTML =
      '<div class="guidance-header">' +
      '<p class="guidance-eyebrow">Instructor Resource</p>' +
      "<h2>Teaching &amp; Guidance</h2>" +
      '<p class="guidance-description">A structured reference for CFI lesson II.K &mdash; Endorsements &amp; Logbook Entries. Select a section to expand.</p>' +
      "</div>" +
      '<nav class="guidance-toc" aria-label="Section navigation">' +
      "<ul>" + tocItems + "</ul>" +
      "</nav>" +
      '<div class="guidance-cards">' + cards + "</div>";
  }

  function renderPreSoloPrerequisiteCard(item) {
    var h = escapeHtml;
    var refs = Array.isArray(item.refs) ? item.refs.join(" | ") : "";
    return (
      '<article class="endorsement-card endorsement-card--prerequisite"' +
      getCategoryThemeStyle("student-pilot") +
      ">" +
      '<div class="endorsement-head">' +
      '<div class="endorsement-id-row">' +
      '<span class="category-dot" aria-hidden="true"></span>' +
      '<span class="endorsement-id mono">' + h(item.id) + "</span>" +
      '<span class="pre-solo-badge">Prerequisite</span>' +
      "</div>" +
      "</div>" +
      "<h2>" + h(item.title) + "</h2>" +
      '<p class="prereq-description">' + h(item.description) + "</p>" +
      '<div class="meta-line">' +
      '<span class="meta-item">Student Pilot</span>' +
      '<span class="meta-item mono">' + h(refs) + "</span>" +
      "</div>" +
      "</article>"
    );
  }

  function renderPreSoloPrerequisiteCards(items) {
    if (!Array.isArray(items) || !items.length) {
      return "";
    }

    return (
      '<div class="endorsement-list pre-solo-card-list">' +
      items.map(renderPreSoloPrerequisiteCard).join("") +
      "</div>"
    );
  }

  function renderPreSoloContent(content) {
    if (!content) {
      return (
        '<article class="placeholder-card empty-state">' +
        "<h2>Pre-solo content unavailable</h2>" +
        "<p>The Student Pilot / Pre-Solo prerequisites could not be loaded.</p>" +
        "</article>"
      );
    }

    return (
      '<div class="pre-solo-body">' +
      renderPreSoloPrerequisiteCards(content.prerequisites) +
      renderAccordionSections(content.accordionSections) +
      "</div>"
    );
  }

  function renderAccordionBodyBlocks(blocks) {
    var h = escapeHtml;
    return blocks.map(function(block) {
      if (block.type === "h4") {
        return '<h4 class="prereq-accordion-h4">' + h(block.value) + '</h4>';
      }
      return renderGuidanceContentBlock(block);
    }).join("");
  }

  function renderAccordionSections(sections) {
    var h = escapeHtml;
    var sectionsHtml = sections.map(function(section) {
      var bodyHtml;
      if (section.type === "resources") {
        var linksHtml = section.links.map(function(link) {
          return (
            '<li><a class="pre-solo-resource-link" href="' + h(link.url) + '" target="_blank" rel="noopener noreferrer">' +
            h(link.label) + ' \u2197</a></li>'
          );
        }).join("");
        var regsHtml = section.regs.map(function(reg) {
          return '<li>' + h(reg) + '</li>';
        }).join("");
        bodyHtml =
          '<ul class="pre-solo-link-list">' + linksHtml + '</ul>' +
          '<h4 class="prereq-accordion-h4">Applicable Regulations &amp; Guidance</h4>' +
          '<ul>' + regsHtml + '</ul>';
      } else {
        bodyHtml = renderAccordionBodyBlocks(section.blocks);
      }
      return (
        '<details class="prereq-accordion">' +
        '<summary class="prereq-accordion-summary">' + h(section.heading) + '</summary>' +
        '<div class="prereq-accordion-body">' + bodyHtml + '</div>' +
        '</details>'
      );
    }).join("");
    return '<div class="prereq-accordions">' + sectionsHtml + '</div>';
  }

  function handleCopy(endorsementId, button) {
    const endorsement = ENDORSEMENT_MAP.get(endorsementId);
    if (!endorsement || !button) {
      return;
    }
    recordRecentEndorsement(endorsementId);
    copyTextToClipboard(endorsement.verbatimText, button, "Copied");
  }

  function isMobileLayout() {
    return window.innerWidth < 900;
  }

  function syncSidebarAccessibility() {
    if (!dom.filterRail) {
      return;
    }

    if (isMobileLayout()) {
      dom.filterRail.setAttribute("aria-hidden", String(!state.sidebarOpen));
      dom.filterRail.inert = !state.sidebarOpen;
      return;
    }

    dom.filterRail.removeAttribute("aria-hidden");
    dom.filterRail.inert = false;
  }

  function syncThemeColor() {
    if (!dom.themeColorMeta) {
      return;
    }

    dom.themeColorMeta.setAttribute(
      "content",
      state.sidebarOpen ? SIDEBAR_THEME_COLOR : DEFAULT_THEME_COLOR,
    );
  }

  function setSidebarOpen(isOpen, options = {}) {
    state.sidebarOpen = Boolean(isOpen);
    document.body.classList.toggle("is-sidebar-open", state.sidebarOpen);
    syncThemeColor();

    if (dom.filterRail) {
      dom.filterRail.classList.toggle("is-open", state.sidebarOpen);
    }

    if (dom.sidebarToggleBtn) {
      dom.sidebarToggleBtn.setAttribute("aria-expanded", String(state.sidebarOpen));
    }

    if (dom.sidebarBackdrop) {
      dom.sidebarBackdrop.hidden = !state.sidebarOpen;
    }

    syncSidebarAccessibility();

    if (isOpen) {
      window.requestAnimationFrame(() => {
        const closeBtn = dom.filterRail && dom.filterRail.querySelector('.rail-close');
        if (closeBtn) closeBtn.focus();
      });
    } else if (options.returnFocus !== false) {
      window.requestAnimationFrame(() => {
        if (dom.sidebarToggleBtn) dom.sidebarToggleBtn.focus();
      });
    }
  }

  function closeSidebar(options = {}) {
    if (state.sidebarOpen) {
      setSidebarOpen(false, options);
    }
  }

  function isTypingField(target) {
    if (!target) {
      return false;
    }

    const tagName = target.tagName ? target.tagName.toLowerCase() : "";
    return tagName === "input" || tagName === "textarea" || target.isContentEditable;
  }

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator) || window.location.protocol === "file:") {
      return;
    }

    navigator.serviceWorker.register("./sw.js").catch(() => {
      // Ignore registration failures in local or constrained environments.
    });
  }

  function attachEvents() {
    if (dom.searchInput) {
      dom.searchInput.addEventListener("input", debounce((event) => {
        setSearchQuery(event.target.value || "");
        resetExpandedCards();
        refresh();
      }, 150));

      dom.searchInput.addEventListener("focus", () => {
        renderSearchSuggestions();
      });

      dom.searchInput.addEventListener("blur", () => {
        window.setTimeout(() => {
          renderSearchSuggestions();
        }, 120);
      });

      dom.searchInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && String(event.target.value || "").trim().length >= 2) {
          recordRecentSearch(event.target.value || "");
          renderSearchSuggestions();
        }
      });
    }

    if (dom.clearSearchBtn) {
      dom.clearSearchBtn.addEventListener("click", () => {
        clearSearch();
        refresh();
        if (dom.searchInput) {
          dom.searchInput.focus();
        }
      });
    }

    if (dom.topbarGuidanceBtn) {
      dom.topbarGuidanceBtn.addEventListener("click", () => {
        activateGuidance({ closeSidebar: false });
      });
    }

    if (dom.footerGuidanceBtn) {
      dom.footerGuidanceBtn.addEventListener("click", () => {
        activateGuidance({ closeSidebar: false });
      });
    }

    if (dom.searchSuggestions) {
      dom.searchSuggestions.addEventListener("click", (event) => {
        const searchButton = event.target.closest("[data-suggestion-query]");
        if (searchButton) {
          const value = searchButton.getAttribute("data-suggestion-query") || "";
          setSearchQuery(value);
          recordRecentSearch(value);
          resetExpandedCards();
          refresh();
          return;
        }

        const openButton = event.target.closest("[data-open-id]");
        if (openButton) {
          openEndorsementById(openButton.getAttribute("data-open-id"));
        }
      });
    }

    if (dom.sidebarToggleBtn) {
      dom.sidebarToggleBtn.addEventListener("click", () => {
        setSidebarOpen(!state.sidebarOpen);
      });
    }

    if (dom.railCloseBtn) {
      dom.railCloseBtn.addEventListener("click", () => {
        closeSidebar();
      });
    }

    if (dom.sidebarBackdrop) {
      dom.sidebarBackdrop.addEventListener("click", closeSidebar);
    }

    if (dom.categoryNav) {
      dom.categoryNav.addEventListener("click", (event) => {
        const button = event.target.closest("[data-action]");
        if (!button) {
          return;
        }

        const action = button.getAttribute("data-action");
        if (action === "all") {
          activateAllEndorsements();
          return;
        }

        if (action === "toggle-category") {
          const categoryId = button.getAttribute("data-category") || "all";
          state.openCategory = state.openCategory === categoryId ? null : categoryId;
          renderCategoryNav();
          return;
        }

        if (action === "view-category") {
          activateCategory(button.getAttribute("data-category") || "all");
          return;
        }

        if (action === "subcategory") {
          activateSubcategory(
            button.getAttribute("data-category") || "all",
            button.getAttribute("data-subcategory"),
          );
          return;
        }

        if (action === "activate-guidance") {
          activateGuidance();
        }
      });
    }

    if (dom.selectionSummary) {
      dom.selectionSummary.addEventListener("click", (event) => {
        const filterChip = event.target.closest("[data-clear-filter-group]");
        if (filterChip) {
          const groupId = filterChip.getAttribute("data-clear-filter-group");
          if (groupId && Object.prototype.hasOwnProperty.call(state.filters, groupId)) {
            state.filters[groupId] = "all";
            resetExpandedCards();
            refresh();
          }
          return;
        }

        const button = event.target.closest("[data-action]");
        if (!button) {
          return;
        }

        const action = button.getAttribute("data-action");
        if (action === "toggle-description") {
          state.descriptionExpanded = !state.descriptionExpanded;
          renderSelectionDescription(dom.selectionDescription ? dom.selectionDescription.dataset.fullText : "");
          return;
        }

        if (action === "all") {
          activateAllEndorsements();
          return;
        }

        if (action === "view-category") {
          activateCategory(button.getAttribute("data-category") || "all");
          return;
        }

        if (action === "clear-all") {
          clearAllSearchAndFilters();
          resetExpandedCards();
          refresh();
          if (dom.searchInput) {
            dom.searchInput.focus();
          }
          return;
        }
      });
    }

    if (dom.filtersToggle) {
      dom.filtersToggle.addEventListener("click", () => {
        state.filterPopoverOpen = !state.filterPopoverOpen;
        renderFiltersToggle();
      });
    }

    if (dom.scopeControls) {
      dom.scopeControls.addEventListener("click", (event) => {
        const button = event.target.closest("[data-filter-group]");
        if (!button) {
          return;
        }

        const groupId = button.getAttribute("data-filter-group");
        const value = button.getAttribute("data-filter-value");
        if (!groupId || !value || !state.filters.hasOwnProperty(groupId)) {
          return;
        }

        state.filters[groupId] = value;
        resetExpandedCards();
        refresh();
      });
    }

    if (dom.resultsToolbar) {
      dom.resultsToolbar.addEventListener("click", (event) => {
        const button = event.target.closest("[data-action]");
        if (!button) {
          return;
        }

        const action = button.getAttribute("data-action");
        if (action === "expand-all") {
          state.expandedIds = new Set(getVisibleEndorsements().map((item) => item.id));
          refresh();
          return;
        }

        if (action === "collapse-all") {
          resetExpandedCards();
          refresh();
        }
      });
    }

    if (dom.bundleBar) {
      dom.bundleBar.addEventListener("click", (event) => {
        const button = event.target.closest('[data-action="toggle-supplemental"]');
        if (!button) {
          return;
        }
        state.includeSupplemental = !state.includeSupplemental;
        resetExpandedCards();
        refresh();
      });
    }

    if (dom.endorsementList) {
      dom.endorsementList.addEventListener("click", (event) => {
        const toggleButton = event.target.closest("[data-toggle-id]");
        if (toggleButton) {
          const id = toggleButton.getAttribute("data-toggle-id");
          if (state.expandedIds.has(id)) {
            state.expandedIds.delete(id);
          } else {
            state.expandedIds.add(id);
            recordRecentEndorsement(id);
          }
          refresh();
          return;
        }

        const copyButton = event.target.closest("[data-copy-id]");
        if (copyButton) {
          handleCopy(copyButton.getAttribute("data-copy-id"), copyButton);
          return;
        }

        const favoriteButton = event.target.closest("[data-favorite-id]");
        if (favoriteButton) {
          toggleFavorite(favoriteButton.getAttribute("data-favorite-id"));
          refresh();
          return;
        }

        const openButton = event.target.closest("[data-open-id]");
        if (openButton) {
          openEndorsementById(openButton.getAttribute("data-open-id"));
          return;
        }

        const searchAllBtn = event.target.closest('[data-action="search-all"]');
        if (searchAllBtn) {
          activateAllEndorsements({ preserveQuery: true, closeSidebar: false });
          return;
        }
      });
    }

    if (dom.featuredStrip) {
      dom.featuredStrip.addEventListener("click", (event) => {
        const openButton = event.target.closest("[data-open-id]");
        if (openButton) {
          openEndorsementById(openButton.getAttribute("data-open-id"));
          return;
        }

        const button = event.target.closest("[data-featured-subcategory]");
        if (!button) {
          return;
        }

        activateSubcategory(
          button.getAttribute("data-featured-category"),
          button.getAttribute("data-featured-subcategory"),
          { closeSidebar: false },
        );
      });
    }

    if (dom.guidanceView) {
      dom.guidanceView.addEventListener("click", (event) => {
        const toggle = event.target.closest(".guidance-toggle");
        if (toggle) {
          const expanded = toggle.getAttribute("aria-expanded") === "true";
          const bodyId = toggle.getAttribute("aria-controls");
          const body = bodyId ? document.getElementById(bodyId) : null;
          const caret = toggle.querySelector(".detail-toggle-caret");

          toggle.setAttribute("aria-expanded", String(!expanded));
          if (body) body.hidden = expanded;
          if (caret) caret.textContent = expanded ? "+" : "\u2013";
          return;
        }

        const tocLink = event.target.closest(".guidance-toc-link");
        if (tocLink) {
          event.preventDefault();
          const targetId = tocLink.getAttribute("href").replace("#gs-", "");
          const card = dom.guidanceView.querySelector("#" + CSS.escape(targetId));
          if (card) {
            const toggle2 = card.querySelector(".guidance-toggle");
            const bodyId2 = toggle2 && toggle2.getAttribute("aria-controls");
            const body2 = bodyId2 ? document.getElementById(bodyId2) : null;
            const caret2 = toggle2 && toggle2.querySelector(".detail-toggle-caret");
            if (toggle2 && body2 && body2.hidden) {
              toggle2.setAttribute("aria-expanded", "true");
              body2.hidden = false;
              if (caret2) caret2.textContent = "\u2013";
            }
            scrollToTarget(card);
          }
        }
      });
    }

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        if (state.filterPopoverOpen) {
          closeFilterPopover();
          return;
        }
        closeSidebar();
        return;
      }

      if (event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey && !isTypingField(event.target)) {
        event.preventDefault();
        if (dom.searchInput) {
          dom.searchInput.focus();
          dom.searchInput.select();
        }
        return;
      }

      if (event.key.toLowerCase() === "g" && !event.metaKey && !event.ctrlKey && !event.altKey && !isTypingField(event.target)) {
        event.preventDefault();
        activateGuidance({ closeSidebar: false });
        return;
      }

      if (event.key.toLowerCase() === "e" && !event.metaKey && !event.ctrlKey && !event.altKey && !isTypingField(event.target)) {
        const visible = getVisibleEndorsements();
        if (visible.length > 1 && visible.length <= 12) {
          event.preventDefault();
          const allExpanded = visible.every((item) => state.expandedIds.has(item.id));
          state.expandedIds = allExpanded ? new Set() : new Set(visible.map((item) => item.id));
          refresh();
        }
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth >= 900) {
        closeSidebar();
      }
      syncSidebarAccessibility();
      syncSelectionDescriptionToggle();
    });

    window.addEventListener("popstate", () => {
      applyUrlState();
      refresh();
    });
  }

  function boot() {
    validateData();
    validateBrowseStructure();
    applyUrlState();
    renderMeta();
    syncSearchInput();
    refresh();
    syncSidebarAccessibility();
    syncThemeColor();
    attachEvents();
    registerServiceWorker();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
