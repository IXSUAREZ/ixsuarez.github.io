(function () {
  "use strict";

  var BANK = window.FRAT_QUESTIONS;
  var RISK = window.FRAT_RISK;

  if (!BANK || !RISK) {
    document.body.innerHTML = "<p class=\"noscript\">The assessment could not load. Refresh and try again.</p>";
    return;
  }

  // Persistent setup and per-flight answers intentionally use separate keys.
  // New flight removes only FLIGHT_STORAGE_KEY.
  var PROFILE_STORAGE_KEY = "suarez-cfi-frat-profile-v2";
  var MINIMUMS_STORAGE_KEY = "suarez-cfi-frat-minimums-v2";
  var FLIGHT_STORAGE_KEY = "suarez-cfi-frat-flight-v2";

  var els = {
    certificateSelect: document.getElementById("certificateSelect"),
    roleSelect: document.getElementById("roleSelect"),
    rulesControl: document.getElementById("rulesControl"),
    dayNightControl: document.getElementById("dayNightControl"),
    factorSections: document.getElementById("factorSections"),
    progressCount: document.getElementById("progressCount"),
    progressTrack: document.getElementById("progressTrack"),
    progressFill: document.getElementById("progressFill"),
    decisionState: document.getElementById("decisionState"),
    decisionTitle: document.getElementById("decisionTitle"),
    decisionGuidance: document.getElementById("decisionGuidance"),
    stopCount: document.getElementById("stopCount"),
    reviewCount: document.getElementById("reviewCount"),
    verifyCount: document.getElementById("verifyCount"),
    concernList: document.getElementById("concernList"),
    copyButton: document.getElementById("copyButton"),
    printButton: document.getElementById("printButton"),
    newFlightButton: document.getElementById("newFlightButton"),
    minimumsButton: document.getElementById("minimumsButton"),
    minimumsDialog: document.getElementById("minimumsDialog"),
    minimumsForm: document.getElementById("minimumsForm"),
    closeMinimumsButton: document.getElementById("closeMinimumsButton"),
    clearMinimumsButton: document.getElementById("clearMinimumsButton"),
    minimumFields: document.getElementById("minimumFields"),
    minimumsError: document.getElementById("minimumsError"),
    studentSoloNote: document.getElementById("studentSoloNote"),
    saveStatus: document.getElementById("saveStatus"),
    assessmentMain: document.getElementById("assessmentMain"),
    toast: document.getElementById("toast")
  };

  var context = BANK.normalizeContext(loadObject(PROFILE_STORAGE_KEY));
  var minimums = Object.assign(BANK.createBlankMinimums(), loadObject(MINIMUMS_STORAGE_KEY));
  var loadedFlight = loadObject(FLIGHT_STORAGE_KEY);
  var flight = BANK.createBlankFlight();
  flight.answers = sanitizeAnswers(loadedFlight && loadedFlight.answers);
  var result = null;
  var toastTimer = null;

  populateContextControls();
  renderMinimumFields();
  bindEvents();
  render();

  function populateContextControls() {
    els.certificateSelect.innerHTML = optionMarkup(BANK.CONTEXT_OPTIONS.certificate);
    els.roleSelect.innerHTML = optionMarkup(BANK.CONTEXT_OPTIONS.role);
    els.rulesControl.innerHTML = segmentedMarkup("flight-rules", BANK.CONTEXT_OPTIONS.rules);
    els.dayNightControl.innerHTML = segmentedMarkup("day-night", BANK.CONTEXT_OPTIONS.dayNight);
  }

  function optionMarkup(options) {
    return options.map(function (option) {
      return "<option value=\"" + escapeHtml(option.value) + "\">" + escapeHtml(option.label) + "</option>";
    }).join("");
  }

  function segmentedMarkup(name, options) {
    return options.map(function (option) {
      return [
        "<label><input type=\"radio\" name=\"", escapeHtml(name), "\" value=\"", escapeHtml(option.value), "\">",
        "<span>", escapeHtml(option.label), "</span></label>"
      ].join("");
    }).join("");
  }

  function bindEvents() {
    els.certificateSelect.addEventListener("change", function () {
      context.certificate = els.certificateSelect.value;
      context = BANK.normalizeContext(context);
      contextChanged();
    });
    els.roleSelect.addEventListener("change", function () {
      context.role = els.roleSelect.value;
      context = BANK.normalizeContext(context);
      contextChanged();
    });
    els.rulesControl.addEventListener("change", function (event) {
      if (event.target.matches("input[type=radio]")) {
        context.rules = event.target.value;
        context = BANK.normalizeContext(context);
        contextChanged();
      }
    });
    els.dayNightControl.addEventListener("change", function (event) {
      if (event.target.matches("input[type=radio]")) {
        context.dayNight = event.target.value;
        context = BANK.normalizeContext(context);
        contextChanged();
      }
    });

    els.factorSections.addEventListener("click", function (event) {
      var button = event.target.closest("[data-factor-id][data-answer]");
      if (!button) {
        return;
      }
      flight.answers[button.dataset.factorId] = button.dataset.answer;
      flight.updatedAt = new Date().toISOString();
      saveFlight();
      render();
    });

    els.minimumsButton.addEventListener("click", openMinimums);
    els.closeMinimumsButton.addEventListener("click", function () { els.minimumsDialog.close(); });
    els.minimumsDialog.addEventListener("click", function (event) {
      if (event.target === els.minimumsDialog) {
        els.minimumsDialog.close();
      }
    });
    els.minimumsForm.addEventListener("submit", saveMinimumsFromDialog);
    els.clearMinimumsButton.addEventListener("click", function () {
      els.minimumFields.querySelectorAll("input").forEach(function (input) { input.value = ""; });
      hideMinimumError();
    });
    els.newFlightButton.addEventListener("click", startNewFlight);
    els.copyButton.addEventListener("click", copySummary);
    els.printButton.addEventListener("click", function () { window.print(); });
  }

  function contextChanged() {
    var hadAnswers = Object.keys(flight.answers).length > 0;
    flight = BANK.createBlankFlight();
    try {
      localStorage.removeItem(FLIGHT_STORAGE_KEY);
    } catch (error) {
      // The context can still change when local storage is unavailable.
    }
    saveObject(PROFILE_STORAGE_KEY, context);
    renderMinimumFields();
    render();
    if (hadAnswers) {
      showToast("Flight context changed. Factor answers were reset for the new plan.");
    }
  }

  function render() {
    syncContextControls();
    result = RISK.assessAssessment({ context: context, answers: flight.answers }, BANK.FACTORS);
    renderFactors();
    renderDecision();
  }

  function syncContextControls() {
    els.certificateSelect.value = context.certificate;
    els.roleSelect.value = context.role;
    Array.from(els.roleSelect.options).forEach(function (option) {
      option.disabled = (context.certificate === "student" && option.value === "acting_pic") ||
        (context.certificate !== "student" && option.value === "student_solo");
    });
    document.querySelectorAll("input[name=flight-rules]").forEach(function (radio) {
      radio.checked = radio.value === context.rules;
      radio.disabled = context.role === "student_solo" && radio.value === "ifr";
    });
    document.querySelectorAll("input[name=day-night]").forEach(function (radio) {
      radio.checked = radio.value === context.dayNight;
    });
  }

  function renderFactors() {
    var applicable = RISK.applicableFactors(context, BANK.FACTORS);
    els.factorSections.innerHTML = BANK.SECTIONS.map(function (section) {
      var factors = applicable.filter(function (factor) { return factor.section === section.id; });
      if (!factors.length) {
        return "";
      }
      return [
        "<section class=\"pave-section\" aria-labelledby=\"pave-", section.id, "\">",
        "<header class=\"pave-heading\"><span class=\"pave-letter\" aria-hidden=\"true\">", section.short, "</span>",
        "<h2 id=\"pave-", section.id, "\">", escapeHtml(section.label), "</h2>",
        "<span>", factors.length, " factor", factors.length === 1 ? "" : "s", "</span></header>",
        "<div class=\"factor-list\">", factors.map(renderFactor).join(""), "</div></section>"
      ].join("");
    }).join("");
  }

  function renderFactor(factor) {
    var answer = Object.prototype.hasOwnProperty.call(flight.answers, factor.id)
      ? flight.answers[factor.id]
      : "";
    var level = answer ? RISK.answerLevel(answer).toLowerCase() : "incomplete";
    var labels = {
      good: factor.goodLabel,
      concern: factor.concernLabel,
      stop: factor.stopLabel,
      unknown: factor.unknownLabel
    };
    var buttons = ["good", "concern", "stop", "unknown"].map(function (value) {
      return [
        "<button class=\"answer-button\" type=\"button\" data-factor-id=\"", factor.id,
        "\" data-answer=\"", value, "\" aria-pressed=\"", answer === value ? "true" : "false", "\">",
        escapeHtml(labels[value]), "</button>"
      ].join("");
    }).join("");
    var minimumMarkup = factor.id === "environment_inside_limits" ? renderMinimumSummary() : "";
    return [
      "<article class=\"factor-card\" data-level=\"", level, "\" data-answered=\"", answer ? "true" : "false", "\">",
      "<div class=\"factor-top\"><div class=\"factor-copy\">",
      factor.core ? "" : "<span class=\"conditional-tag\">Applies to this flight</span>",
      "<h3>", escapeHtml(factor.label), "</h3><p>", escapeHtml(factor.prompt), "</p></div>",
      "<div class=\"answer-grid\" role=\"group\" aria-label=\"", escapeHtml(factor.label), "\">", buttons, "</div></div>",
      minimumMarkup, "</article>"
    ].join("");
  }

  function renderMinimumSummary() {
    var fuelId = context.dayNight === "night" ? "fuel_night_min" : "fuel_day_min";
    var ids = context.rules === "ifr"
      ? ["steady_wind_max_kt", "crosswind_max_kt", "gust_spread_max_kt", fuelId, "ifr_ceiling_margin_ft", "ifr_visibility_margin_sm"]
      : (context.dayNight === "night"
        ? ["vfr_night_ceiling_ft", "vfr_night_visibility_sm", "steady_wind_max_kt", "crosswind_max_kt", "gust_spread_max_kt", fuelId]
        : ["vfr_day_ceiling_ft", "vfr_day_visibility_sm", "steady_wind_max_kt", "crosswind_max_kt", "gust_spread_max_kt", fuelId]);
    var fields = ids.map(function (id) {
      return BANK.PERSONAL_MINIMUM_FIELDS.find(function (field) { return field.id === id; });
    }).filter(Boolean);
    var studentSolo = context.certificate === "student" && context.role === "student_solo";
    return [
      "<div class=\"minimum-summary\"><strong>", studentSolo ? "Saved instructor limits" : "Saved personal minimums", "</strong>",
      "<div class=\"minimum-chips\">",
      fields.map(function (field) {
        var value = minimums[field.id];
        return "<span>" + escapeHtml(shortMinimumLabel(field)) + ": " +
          (isBlank(value) ? "not set" : escapeHtml(value) + " " + escapeHtml(field.unit)) + "</span>";
      }).join(""),
      studentSolo ? "<span>§ 61.89 visibility floor: 3 SM day / 5 SM night</span>" : "",
      "</div></div>"
    ].join("");
  }

  function shortMinimumLabel(field) {
    var labels = {
      vfr_day_ceiling_ft: "Day ceiling",
      vfr_day_visibility_sm: "Day visibility",
      vfr_night_ceiling_ft: "Night ceiling",
      vfr_night_visibility_sm: "Night visibility",
      steady_wind_max_kt: "Steady wind",
      crosswind_max_kt: "Crosswind",
      gust_spread_max_kt: "Gust spread",
      fuel_day_min: "Day fuel",
      fuel_night_min: "Night fuel",
      ifr_ceiling_margin_ft: "IFR ceiling margin",
      ifr_visibility_margin_sm: "IFR visibility margin"
    };
    return labels[field.id] || field.label;
  }

  function renderDecision() {
    var percent = result.applicableCount
      ? Math.round((result.answeredCount / result.applicableCount) * 100)
      : 0;
    els.progressCount.textContent = result.answeredCount + " of " + result.applicableCount;
    els.progressTrack.setAttribute("aria-valuenow", String(percent));
    els.progressFill.style.width = percent + "%";
    els.decisionState.dataset.level = result.overall.toLowerCase();
    els.decisionTitle.textContent = RISK.levelLabel(result.overall);
    els.decisionGuidance.textContent = RISK.guidanceFor(result.overall);
    els.stopCount.textContent = String(result.stopCount);
    els.reviewCount.textContent = String(result.moderateCount);
    els.verifyCount.textContent = String(result.incompleteCount);

    var concerns = result.concerns.slice(0, 4);
    els.concernList.innerHTML = concerns.length
      ? concerns.map(function (item) {
        return "<li><span class=\"concern-level\">" + escapeHtml(concernLevelLabel(item.level)) + ":</span> " +
          escapeHtml(item.label) + " — " + escapeHtml(item.reason) + "</li>";
      }).join("")
      : "<li>No elevated factors identified. Continue required planning and monitor changes.</li>";
  }

  function concernLevelLabel(level) {
    if (level === RISK.LEVELS.STOP) { return "Stop"; }
    if (level === RISK.LEVELS.MODERATE) { return "Review"; }
    return "Verify";
  }

  function renderMinimumFields() {
    var studentSolo = context.certificate === "student" && context.role === "student_solo";
    var fields = BANK.PERSONAL_MINIMUM_FIELDS.filter(function (field) {
      return !studentSolo || !field.id.startsWith("ifr_");
    });
    els.studentSoloNote.hidden = !studentSolo;
    els.minimumFields.innerHTML = fields.map(function (field) {
      var floor = studentSolo && field.studentSoloFloor ? field.studentSoloFloor : 0;
      var label = studentSolo ? "Instructor limit — " + field.label : field.label;
      return [
        "<div class=\"minimum-field\"><label for=\"minimum-", field.id, "\">", escapeHtml(label), "</label>",
        "<div class=\"minimum-input\"><input id=\"minimum-", field.id, "\" name=\"", field.id,
        "\" type=\"number\" min=\"", floor, "\" step=\"", field.step, "\" inputmode=\"decimal\" value=\"",
        isBlank(minimums[field.id]) ? "" : escapeHtml(minimums[field.id]), "\"><span>", escapeHtml(field.unit), "</span></div></div>"
      ].join("");
    }).join("");
  }

  function openMinimums() {
    renderMinimumFields();
    hideMinimumError();
    els.minimumsDialog.showModal();
  }

  function saveMinimumsFromDialog(event) {
    event.preventDefault();
    hideMinimumError();
    var next = BANK.createBlankMinimums();
    var invalid = [];
    var studentSolo = context.certificate === "student" && context.role === "student_solo";

    BANK.PERSONAL_MINIMUM_FIELDS.forEach(function (field) {
      var input = els.minimumsForm.elements[field.id];
      if (!input) {
        next[field.id] = minimums[field.id];
        return;
      }
      var raw = input.value.trim();
      if (!raw) {
        next[field.id] = "";
        return;
      }
      var value = Number(raw);
      var floor = studentSolo && field.studentSoloFloor ? field.studentSoloFloor : 0;
      if (!Number.isFinite(value) || value < floor || !input.checkValidity()) {
        invalid.push(field.label + (floor ? " must be at least " + floor + " " + field.unit + " for student solo" : " is invalid"));
        return;
      }
      next[field.id] = value;
    });

    if (invalid.length) {
      els.minimumsError.hidden = false;
      els.minimumsError.textContent = invalid.join(". ") + ".";
      return;
    }
    minimums = next;
    saveObject(MINIMUMS_STORAGE_KEY, minimums);
    els.minimumsDialog.close();
    render();
    showToast("Personal minimums saved on this device.");
  }

  function hideMinimumError() {
    els.minimumsError.hidden = true;
    els.minimumsError.textContent = "";
  }

  function startNewFlight() {
    if (!window.confirm("Start a new flight? This clears factor answers but keeps your context and saved personal minimums.")) {
      return;
    }
    flight = BANK.createBlankFlight();
    try {
      localStorage.removeItem(FLIGHT_STORAGE_KEY);
      els.saveStatus.textContent = "New flight — setup preserved";
    } catch (error) {
      els.saveStatus.textContent = "New flight ready";
    }
    render();
    els.assessmentMain.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
    showToast("New flight ready. Personal minimums were preserved.");
  }

  function saveFlight() {
    saveObject(FLIGHT_STORAGE_KEY, flight);
  }

  function sanitizeAnswers(input) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
      return {};
    }
    var allowedValues = Object.keys(BANK.ANSWERS).map(function (key) {
      return BANK.ANSWERS[key];
    });
    var allowedIds = BANK.FACTORS.reduce(function (ids, factor) {
      ids[factor.id] = true;
      return ids;
    }, Object.create(null));

    return Object.keys(input).reduce(function (answers, id) {
      if (allowedIds[id] && allowedValues.indexOf(input[id]) !== -1) {
        answers[id] = input[id];
      }
      return answers;
    }, {});
  }

  function buildSummary() {
    var applicable = RISK.applicableFactors(context, BANK.FACTORS);
    var lines = [
      "SUAREZ CFI — Quick Flight Risk Assessment",
      "Created: " + new Date().toLocaleString(),
      "Context: " + contextLabel("certificate", context.certificate) + " · " +
        contextLabel("role", context.role) + " · " + context.rules.toUpperCase() + " · " + titleCase(context.dayNight),
      "Result: " + RISK.levelLabel(result.overall),
      "Progress: " + result.answeredCount + " of " + result.applicableCount + " factors resolved",
      "Guidance: " + RISK.guidanceFor(result.overall),
      "",
      "Factors:"
    ];
    applicable.forEach(function (factor) {
      var answer = flight.answers[factor.id];
      var label = answer ? answerDisplay(factor, answer) : "Unanswered";
      lines.push("- " + factor.label + ": " + label);
    });
    lines.push("", "Mitigation must change or confirm the underlying condition before rescoring.");
    lines.push("Training aid only. Low never means safe and this tool does not make the PIC decision.");
    return lines.join("\n");
  }

  function answerDisplay(factor, answer) {
    var labels = {
      good: factor.goodLabel,
      concern: factor.concernLabel,
      stop: factor.stopLabel,
      unknown: factor.unknownLabel
    };
    return labels[answer] || answer;
  }

  function copySummary() {
    var text = buildSummary();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        showToast("Assessment summary copied.");
      }).catch(function () { fallbackCopy(text); });
      return;
    }
    fallbackCopy(text);
  }

  function fallbackCopy(text) {
    var area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    var copied = false;
    try { copied = document.execCommand("copy"); } catch (error) { copied = false; }
    document.body.removeChild(area);
    showToast(copied ? "Assessment summary copied." : "Copy was blocked. Use Print instead.");
  }

  function contextLabel(field, value) {
    var option = (BANK.CONTEXT_OPTIONS[field] || []).find(function (item) { return item.value === value; });
    return option ? option.label : value;
  }

  function loadObject(key) {
    try {
      var saved = localStorage.getItem(key);
      var parsed = saved ? JSON.parse(saved) : null;
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (error) {
      return {};
    }
  }

  function saveObject(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      els.saveStatus.textContent = "Saved only on this device";
    } catch (error) {
      els.saveStatus.textContent = "This browser could not save";
      showToast("This browser could not save the local draft.");
    }
  }

  function showToast(message) {
    window.clearTimeout(toastTimer);
    els.toast.textContent = message;
    els.toast.hidden = false;
    toastTimer = window.setTimeout(function () { els.toast.hidden = true; }, 2600);
  }

  function isBlank(value) {
    return value == null || String(value).trim() === "";
  }

  function titleCase(value) {
    return String(value).charAt(0).toUpperCase() + String(value).slice(1);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();
