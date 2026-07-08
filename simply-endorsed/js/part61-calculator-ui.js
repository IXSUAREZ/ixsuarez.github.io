(function () {
  "use strict";

  const RULES = window.Part61RulesData;
  const CORE = window.Part61CalculatorCore;
  const GEN = window.Part61ScenarioGenerator;
  const U = window.SimplyEndorsedUtils;
  const rootEl = document.getElementById("part61CalculatorView");

  if (!RULES || !CORE || !GEN || !U || !rootEl) {
    return;
  }

  const escapeHtml = U.escapeHtml;

  const LEDGER_FILTERS = {
    ALL: "all",
    REMAINING: "remaining",
    EVENTS: "events",
    ENDORSEMENTS: "endorsements",
    PAPERWORK: "paperwork"
  };

  const RESULTS_TABS = ["plan", "endorsements", "ledger", "rules"];
  const DRAFT_STORAGE_KEY = "simply-endorsed:part61-scenario";
  const SHARE_PARAM = "s";
  const FLAG_KEYS = ["militaryExperience", "militaryOnly", "faaCommercialAmel", "priorFaa"];

  function part61Id(id) {
    return "part61" + id.charAt(0).toUpperCase() + id.slice(1);
  }

  function byId(id) {
    return rootEl.querySelector("#" + part61Id(id));
  }

  function qs(selector) {
    return rootEl.querySelector(selector);
  }

  function qsa(selector) {
    return Array.from(rootEl.querySelectorAll(selector));
  }

  const state = {
    activeStep: 1,
    credentials: [],
    targets: [],
    rates: {
      aircraftWet: RULES.DEFAULT_RATES.aircraftWet,
      instructor: RULES.DEFAULT_RATES.instructor
    },
    validationAttempted: false,
    activeFilter: LEDGER_FILTERS.ALL,
    resultsTab: "plan",
    dirty: false,
    result: null
  };

  const ids = {
    credentialSearch: byId("credentialSearch"),
    credentialOptions: byId("credentialOptions"),
    selectedCredentials: byId("selectedCredentials"),
    experienceFields: byId("experienceFields"),
    eventChecklist: byId("eventChecklist"),
    targetStages: byId("targetStages"),
    aircraftWetRate: byId("aircraftWetRate"),
    instructorRate: byId("instructorRate"),
    rateSummary: byId("rateSummary"),
    validationMessage: byId("validationMessage"),
    addStageBtn: byId("addStageBtn"),
    calculateBtn: byId("calculateBtn"),
    randomSampleBtn: byId("randomSampleBtn"),
    clearBtn: byId("clearBtn"),
    copyBtn: byId("copyBtn"),
    shareBtn: byId("shareBtn"),
    printBtn: byId("printBtn"),
    copyCfiBtn: byId("copyCfiBtn"),
    copyChecklistBtn: byId("copyChecklistBtn"),
    reviewShare: byId("reviewShare"),
    clearEventsBtn: byId("clearEventsBtn"),
    inputCompleteness: byId("inputCompleteness"),
    heroBanner: byId("heroBanner"),
    auditDashboard: byId("auditDashboard"),
    readoutDetails: byId("readoutDetails"),
    cfiReadout: byId("cfiReadout"),
    resultTitle: byId("resultTitle"),
    sourceReview: byId("sourceReview"),
    staleBanner: byId("staleBanner"),
    draftNotice: byId("draftNotice"),
    mobileBar: byId("mobileBar"),
    mobileCompleteness: byId("mobileCompleteness"),
    mobileCalculateBtn: byId("mobileCalculateBtn"),
    results: byId("results"),
    verdict: byId("verdict"),
    summary: byId("summary"),
    combinedSummary: byId("combinedSummary"),
    counts: byId("counts"),
    ledger: byId("ledger"),
    training: byId("training"),
    gates: byId("gates"),
    endorsements: byId("endorsements"),
    unknowns: byId("unknowns"),
    links: byId("links")
  };

  function credentialLabel(id) {
    const found = RULES.CREDENTIAL_OPTIONS.find((item) => item.id === id);
    return found ? found.label : id;
  }

  function linkifyCfrText(value, options) {
    if (window.CfrLinks && typeof window.CfrLinks.linkifyCfrText === "function") {
      return window.CfrLinks.linkifyCfrText(value, options);
    }
    return escapeHtml(value ?? "");
  }

  function linkifyMultilineCfrText(value, options) {
    return linkifyCfrText(value, options).replace(/\n/g, "<br>");
  }

  // Presentation formatter: passes "UNKNOWN" and other strings through.
  // Distinct from the core's money(), which does numeric rounding - do not merge.
  function money(value) {
    if (typeof value === "number") {
      return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
    }
    return value || "UNKNOWN";
  }

  function parseRate(value) {
    if (value === "" || value === null || value === undefined) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
  }

  function currentRates() {
    const aircraftWet = parseRate(ids.aircraftWetRate.value);
    const instructor = parseRate(ids.instructorRate.value);
    const wet = aircraftWet ?? RULES.DEFAULT_RATES.aircraftWet;
    const instructorRate = instructor ?? RULES.DEFAULT_RATES.instructor;
    return {
      aircraftWet: wet,
      instructor: instructorRate,
      dual: wet + instructorRate,
      solo: wet
    };
  }

  function updateRateSummary() {
    const rates = currentRates();
    const zeroRate = parseRate(ids.aircraftWetRate.value) === 0 || parseRate(ids.instructorRate.value) === 0;
    ids.rateSummary.innerHTML = `
      <span>Dual rate: ${money(rates.dual)}/hr</span>
      <span>Solo/PDPIC/time-building: ${money(rates.solo)}/hr</span>
      ${zeroRate ? `<span class="part61-rate-warning">Rate is $0/hr - cost estimates will be understated.</span>` : ""}
    `;
    updateRailProgress();
  }

  // Presentation formatter: passes "UNKNOWN" through. Do not merge with core fmtHours().
  function hours(value) {
    if (typeof value === "number") return `${value.toFixed(1)} hr`;
    return value || "UNKNOWN";
  }

  function flatFieldList() {
    return RULES.FIELD_GROUPS.flatMap((group) => group.fields.map(([key, label]) => ({ key, label, group: group.title })));
  }

  function groupSlug(value) {
    return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function experienceCompletion() {
    const fields = flatFieldList();
    const filled = fields.filter((field) => {
      const input = qs(`[data-experience="${field.key}"]`);
      return input && input.value.trim() !== "";
    });
    return {
      total: fields.length,
      filled: filled.length,
      groups: RULES.FIELD_GROUPS.map((group) => {
        const groupFields = group.fields.map(([key, label]) => ({ key, label }));
        const groupFilled = groupFields.filter((field) => {
          const input = qs(`[data-experience="${field.key}"]`);
          return input && input.value.trim() !== "";
        });
        return {
          title: group.title,
          total: groupFields.length,
          filled: groupFilled.length,
          missing: groupFields.filter((field) => !groupFilled.some((filledField) => filledField.key === field.key))
        };
      })
    };
  }

  function updateInputCompleteness() {
    const stats = experienceCompletion();
    ids.inputCompleteness.textContent = `Input completeness: ${stats.filled}/${stats.total} hour fields complete`;
    const hoursBadge = qs("#part61HoursCompleteness");
    if (hoursBadge) {
      const allComplete = stats.filled === stats.total;
      hoursBadge.textContent = `${stats.filled}/${stats.total}`;
      hoursBadge.classList.toggle("complete", allComplete);
      hoursBadge.classList.toggle("incomplete", !allComplete);
      hoursBadge.setAttribute("aria-label", `Hour fields: ${stats.filled} of ${stats.total} complete`);
    }
    stats.groups.forEach((group) => {
      const badge = qs(`[data-group-completion="${groupSlug(group.title)}"]`);
      if (!badge) return;
      const complete = group.filled === group.total;
      badge.textContent = `${group.filled}/${group.total}`;
      badge.classList.toggle("complete", complete);
      badge.classList.toggle("incomplete", !complete);
      badge.setAttribute("aria-label", `${group.title}: ${group.filled} of ${group.total} fields complete`);
    });
    updateRailProgress();
    updateMobileBar(stats);
  }

  function numericValue(value) {
    return typeof value === "number" && Number.isFinite(value) ? value : null;
  }

  function dashboardMetric(label, value, tone) {
    return `
      <div class="dashboard-card dashboard-${tone || "slate"}">
        <span>${escapeHtml(label)}</span>
        <b>${linkifyCfrText(value)}</b>
      </div>
    `;
  }

  function stageTitles(result) {
    return result.audits.map((audit) => audit.title).join(" -> ");
  }

  function blockerList(result) {
    return result.audits.flatMap((audit) => audit.unknowns.map((item) => `${audit.title}: ${item}`));
  }

  function firstNextAction(result) {
    const blockers = blockerList(result);
    if (blockers.length) return "Resolve blockers before relying on the math.";
    const firstBlock = result.audits.flatMap((audit) => audit.trainingPlan)[0];
    if (firstBlock) return `Start with ${firstBlock.block}.`;
    return "Complete endorsements, gates, and practical-test readiness.";
  }

  function cfiReadoutText(result) {
    if (!result) return "No audit generated yet.";
    return result.audits.map((audit, index) => {
      const endorsements = audit.endorsements.map((item) => item.item).join(", ");
      return [
        `Stage ${index + 1}: ${audit.title}`,
        `Route: ${audit.verdict}`,
        `Raw sum: ${audit.summary.rawRequirementSum}; optimized minimum: ${audit.summary.optimizedCombinedTotal}; estimated cost: ${money(audit.summary.estimatedTotalCost)}.`,
        `Key point: raw is not the flight plan; compatible requirements are combined into the optimized blocks.`,
        `Endorsement anchors: ${endorsements || "none listed"}.`
      ].join(" ")
    }).join("\n\n");
  }

  function studentChecklistText(result) {
    if (!result) return "No audit generated yet.";
    const lines = [];
    lines.push(`Path: ${stageTitles(result)}`);
    lines.push(`Optimized total: ${hours(result.combined.optimizedHours)}; estimated cost: ${money(result.combined.estimatedCost)}.`);
    lines.push("");
    lines.push("Training blocks:");
    result.audits.flatMap((audit) => audit.trainingPlan.map((block) => ({ audit, block }))).forEach(({ audit, block }) => {
      lines.push(`- ${audit.title}: ${block.block}, ${hours(block.hours)}, ${block.mode}, ${block.cfrRows}, ${money(block.cost)}.`);
    });
    lines.push("");
    lines.push("Endorsements:");
    result.audits.flatMap((audit) => audit.endorsements.map((item) => ({ audit, item }))).forEach(({ audit, item }) => {
      lines.push(`- ${audit.title}: ${item.item} ${item.endorsement}; basis ${item.cfrBasis}.`);
    });
    lines.push("");
    lines.push("Documents / exams / gates:");
    result.audits.flatMap((audit) => audit.gates.map((gate) => ({ audit, gate }))).forEach(({ audit, gate }) => {
      lines.push(`- ${audit.title}: ${gate.gate}; ${gate.required}; ${gate.whenNeeded}.`);
    });
    return lines.join("\n");
  }

  function missingFieldsByGroup(inputs) {
    const inputSet = new Set(inputs);
    return RULES.FIELD_GROUPS.map((group) => {
      const missing = group.fields
        .map(([key, label]) => {
          const input = qs(`[data-experience="${key}"]`);
          return inputSet.has(input) ? label : null;
        })
        .filter(Boolean);
      return { title: group.title, missing };
    }).filter((group) => group.missing.length);
  }

  function renderCredentialOptions() {
    const query = ids.credentialSearch.value.trim().toLowerCase();
    const options = RULES.CREDENTIAL_OPTIONS
      .filter((item) => !query || item.label.toLowerCase().includes(query) || item.id.includes(query))
      .map((item) => {
        const selected = state.credentials.includes(item.id);
        return `<button type="button" class="option-button ${selected ? "selected" : ""}" data-credential="${escapeHtml(item.id)}" aria-pressed="${selected ? "true" : "false"}">${escapeHtml(item.label)}</button>`;
      })
      .join("");
    ids.credentialOptions.innerHTML = options || `<div class="empty-state">No matching credential.</div>`;
  }

  function renderSelectedCredentials() {
    ids.selectedCredentials.innerHTML = state.credentials.length
      ? state.credentials.map((id) => `
          <span class="chip">
            ${escapeHtml(credentialLabel(id))}
            <button type="button" aria-label="Remove ${escapeHtml(credentialLabel(id))}" data-remove-credential="${escapeHtml(id)}">x</button>
          </span>
        `).join("")
      : `<span class="empty-state">No credentials selected.</span>`;
  }

  function renderExperienceFields() {
    ids.experienceFields.innerHTML = RULES.FIELD_GROUPS.map((group) => {
      const slug = groupSlug(group.title);
      return `
      <div class="field-group" data-group-slug="${escapeHtml(slug)}">
        <div class="field-group-heading">
          <h3>${escapeHtml(group.title)}</h3>
          <div class="field-group-actions">
            <button type="button" class="part61-text-button" data-fill-zero-group="${escapeHtml(slug)}">Fill blanks with 0</button>
            <span class="group-completion" data-group-completion="${escapeHtml(slug)}">0/${group.fields.length}</span>
          </div>
        </div>
        <div class="field-grid">
          ${group.fields.map(([key, label, hint]) => `
            <div class="number-field">
              <label for="part61Exp-${escapeHtml(key)}">${escapeHtml(label)}</label>
              <div class="part61-zero-input-row">
                <input id="part61Exp-${escapeHtml(key)}" type="number" min="0" step="0.1" inputmode="decimal" data-experience="${escapeHtml(key)}" data-group-slug="${escapeHtml(slug)}" placeholder="UNKNOWN"${hint ? ` aria-describedby="part61Hint-${escapeHtml(key)}"` : ""}>
                <button type="button" class="part61-zero-field-button" data-fill-zero-field="${escapeHtml(key)}" aria-label="Set ${escapeHtml(label)} to 0 hours" title="Set to 0">0</button>
              </div>
              ${hint ? `<small class="part61-field-hint" id="part61Hint-${escapeHtml(key)}">${escapeHtml(hint)}</small>` : ""}
            </div>
          `).join("")}
        </div>
      </div>
    `;
    }).join("");
  }

  function eventGroupIsRelevant(group) {
    return group.targets.some((target) => state.targets.includes(target));
  }

  function renderEvents() {
    const current = {};
    qsa("[data-event]").forEach((input) => {
      current[input.dataset.event] = input.checked;
    });
    const groups = RULES.EVENT_GROUPS
      .map((group) => ({
        ...group,
        events: RULES.EVENT_OPTIONS.filter((event) => event.group === group.id)
      }))
      .sort((a, b) => Number(eventGroupIsRelevant(b)) - Number(eventGroupIsRelevant(a)));
    ids.eventChecklist.innerHTML = groups.map((group) => {
      const relevant = eventGroupIsRelevant(group);
      const checked = group.events.filter((event) => current[event.id]).length;
      return `
        <details class="part61-event-group" data-event-group="${escapeHtml(group.id)}" ${relevant ? "open" : ""}>
          <summary>
            <span>${escapeHtml(group.label)}${relevant ? "" : " (not in target path)"}</span>
            <span class="group-completion" data-event-group-count="${escapeHtml(group.id)}">${checked}/${group.events.length}</span>
          </summary>
          <div class="part61-event-grid">
            ${group.events.map((event) => `
              <label class="check-row">
                <input type="checkbox" data-event="${escapeHtml(event.id)}" ${current[event.id] ? "checked" : ""}>
                <span>${escapeHtml(event.label)}</span>
              </label>
            `).join("")}
          </div>
        </details>
      `;
    }).join("");
  }

  function updateEventGroupCounts() {
    RULES.EVENT_GROUPS.forEach((group) => {
      const badge = qs(`[data-event-group-count="${group.id}"]`);
      if (!badge) return;
      const events = RULES.EVENT_OPTIONS.filter((event) => event.group === group.id);
      const checked = events.filter((event) => {
        const input = qs(`[data-event="${event.id}"]`);
        return input && input.checked;
      }).length;
      badge.textContent = `${checked}/${events.length}`;
    });
  }

  function renderStages() {
    ids.targetStages.innerHTML = state.targets.map((target, index) => `
      <div class="stage-row">
        <span class="stage-number">${index + 1}</span>
        <select data-stage-index="${index}" aria-label="Stage ${index + 1}">
          ${RULES.TARGET_OPTIONS.map((option) => `<option value="${escapeHtml(option.id)}" ${option.id === target ? "selected" : ""}>${escapeHtml(option.label)}</option>`).join("")}
        </select>
        <button type="button" class="icon-button" data-remove-stage="${index}" aria-label="Remove stage ${index + 1}">x</button>
      </div>
    `).join("");
  }

  function setExperience(values) {
    qsa("[data-experience]").forEach((input) => {
      input.value = values[input.dataset.experience] ?? "";
      setInvalid(input, false);
    });
    updateInputCompleteness();
  }

  function setEvents(values) {
    qsa("[data-event]").forEach((input) => {
      input.checked = Boolean(values[input.dataset.event]);
    });
    updateEventGroupCounts();
  }

  function setFlags(values) {
    FLAG_KEYS.forEach((key) => {
      byId(key).checked = Boolean(values[key]);
    });
  }

  function setRates(values) {
    ids.aircraftWetRate.value = values.aircraftWet ?? RULES.DEFAULT_RATES.aircraftWet;
    ids.instructorRate.value = values.instructor ?? RULES.DEFAULT_RATES.instructor;
    state.rates = {
      aircraftWet: Number(ids.aircraftWetRate.value),
      instructor: Number(ids.instructorRate.value)
    };
    setInvalid(ids.aircraftWetRate, false);
    setInvalid(ids.instructorRate, false);
    updateRateSummary();
  }

  function setInvalid(input, invalid) {
    input.classList.toggle("is-invalid", invalid);
    input.setAttribute("aria-invalid", invalid ? "true" : "false");
    const wrapper = input.closest(".number-field, .part61-number-field");
    if (wrapper) wrapper.classList.toggle("field-invalid", invalid);
  }

  function fieldIsVisible(input) {
    // Prefer layout-based check (real browser)
    if (input.offsetParent !== null) return true;
    if (input.getClientRects && input.getClientRects().length > 0) return true;
    // Fallback for headless/jsdom: check if the field or any ancestor is hidden or display:none
    let el = input;
    while (el && el !== document) {
      if (el.classList && el.classList.contains("part61-panel")) {
        el = el.parentElement;
        continue;
      }
      if (el.hidden || el.style.display === "none" || (el.classList && el.classList.contains("hidden"))) return false;
      el = el.parentElement;
    }
    return true;
  }

  function fillBlanksWithZero(slug) {
    qsa("[data-experience]").forEach((input) => {
      if (slug && input.dataset.groupSlug !== slug) return;
      if (input.value.trim() === "") {
        input.value = "0";
        setInvalid(input, false);
      }
    });
    updateInputCompleteness();
    if (state.validationAttempted) validateRequiredInputs(false);
    markDirty();
    queueDraftSave();
  }

  function fillFieldWithZero(input) {
    if (!input) return;
    input.value = "0";
    setInvalid(input, false);
    updateInputCompleteness();
    if (state.validationAttempted) validateRequiredInputs(false);
    updateMobileBar();
    markDirty();
    queueDraftSave();
  }

  function validateRequiredInputs(focusFirst) {
    const missingExperience = [];
    const invalidRates = [];
    qsa("[data-experience]").forEach((input) => {
      const missing = input.value.trim() === "";
      setInvalid(input, missing);
      if (missing) missingExperience.push(input);
    });
    qsa("[data-rate]").forEach((input) => {
      // Always validate rates regardless of panel visibility — rates are a prerequisite
      const invalid = parseRate(input.value) === null;
      setInvalid(input, invalid);
      if (invalid) invalidRates.push(input);
    });

    const noTargets = !state.targets || state.targets.length === 0;
    const invalid = missingExperience.length || invalidRates.length || noTargets;
    if (invalid) {
      const parts = [];
      if (noTargets) {
        parts.push(`<p>No target stages added. Go to Step 4 and add at least one training target.</p>`);
      }
      if (missingExperience.length) {
        const groups = missingFieldsByGroup(missingExperience);
        parts.push(`
          <p>Missing hour fields - enter 0 when a bucket does not apply:</p>
          <ul>
            ${groups.map((group) => `
              <li>
                <button type="button" class="part61-validation-jump" data-jump-group="${escapeHtml(groupSlug(group.title))}">${escapeHtml(group.title)}</button>
                ${escapeHtml(group.missing.join(", "))}
              </li>
            `).join("")}
          </ul>
          <button type="button" class="part61-button part61-button-small" data-fill-zero-all>Fill all blanks with 0</button>
        `);
      }
      if (invalidRates.length) {
        parts.push(`<p>Missing Cost Assumptions: enter non-negative wet and instructor rates.</p>`);
      }
      ids.validationMessage.innerHTML = parts.join("");
      ids.validationMessage.hidden = false;
      updateInputCompleteness();
      if (focusFirst && !noTargets) {
        const first = missingExperience[0] || invalidRates[0];
        if (first) {
          first.scrollIntoView({ behavior: "smooth", block: "center" });
          first.focus({ preventScroll: true });
        }
      }
      return false;
    }
    ids.validationMessage.innerHTML = "";
    ids.validationMessage.hidden = true;
    updateInputCompleteness();
    return true;
  }

  function clearValidation() {
    qsa("[data-experience], [data-rate]").forEach((input) => setInvalid(input, false));
    ids.validationMessage.innerHTML = "";
    ids.validationMessage.hidden = true;
    updateInputCompleteness();
  }

  function collectFlags() {
    const flags = {};
    FLAG_KEYS.forEach((key) => {
      flags[key] = byId(key).checked;
    });
    return flags;
  }

  function collectInput() {
    const experience = {};
    qsa("[data-experience]").forEach((input) => {
      experience[input.dataset.experience] = input.value;
    });

    const events = {};
    qsa("[data-event]").forEach((input) => {
      events[input.dataset.event] = input.checked;
    });

    return {
      credentials: state.credentials.slice(),
      flags: collectFlags(),
      rates: currentRates(),
      experience,
      events,
      targets: state.targets.slice()
    };
  }

  /* ---------- Step rail ---------- */

  let railSpySuppressedUntil = 0;

  function setActiveRailItem(hash) {
    qsa(".part61-rail-item").forEach((item) => {
      item.classList.toggle("active", item.getAttribute("href") === hash);
    });
  }

  function railStepStates() {
    const completion = experienceCompletion();
    const wet = parseRate(ids.aircraftWetRate.value);
    const instructor = parseRate(ids.instructorRate.value);
    return {
      current: state.credentials.length > 0,
      costs: wet !== null && instructor !== null && wet > 0 && instructor > 0,
      experience: completion.filled === completion.total,
      target: state.targets.length > 0,
      results: Boolean(state.result)
    };
  }

  function updateRailProgress() {
    const states = railStepStates();
    qsa("[data-rail-status]").forEach((dot) => {
      const done = Boolean(states[dot.dataset.railStatus]);
      dot.classList.toggle("done", done);
      const item = dot.closest(".part61-rail-item");
      if (item) item.classList.toggle("is-complete", done);
    });
  }

  function updateMobileBar(stats) {
    if (!ids.mobileBar) return;
    const completion = stats || experienceCompletion();
    ids.mobileCompleteness.textContent = `${completion.filled}/${completion.total} hour fields`;
    ids.mobileBar.classList.toggle("is-alert", !ids.validationMessage.hidden);
  }

  function updateResponsiveLayout() {
    const isMobile = window.innerWidth <= 900;
    const resultsPane = ids.results;
    if (!resultsPane) return;

    if (isMobile) {
      if (state.activeStep === 5) {
        resultsPane.hidden = false;
        resultsPane.style.display = "";
        resultsPane.classList.remove("hidden");
        resultsPane.classList.add("mobile-stacked");
      } else {
        resultsPane.hidden = true;
        resultsPane.style.display = "none";
        resultsPane.classList.add("hidden");
        resultsPane.classList.remove("mobile-stacked");
      }
    } else {
      resultsPane.hidden = false;
      resultsPane.style.display = "";
      resultsPane.classList.remove("hidden");
      resultsPane.classList.remove("mobile-stacked");
    }
  }

  function setStep(step) {
    step = Math.max(1, Math.min(5, step));
    state.activeStep = step;

    const workbench = qs(".part61-workbench");
    if (workbench && workbench.getAttribute("data-active-step") !== String(step)) {
      workbench.setAttribute("data-active-step", String(step));
    }

    const panels = qsa(".part61-panel");
    panels.forEach((panel) => {
      const stepNum = parseInt(panel.getAttribute("data-step") || panel.dataset.step, 10);
      if (stepNum === step) {
        panel.hidden = false;
        panel.style.display = "";
        panel.classList.remove("hidden");
      } else {
        panel.hidden = true;
        panel.style.display = "none";
        panel.classList.add("hidden");
      }
    });

    const backBtns = qsa("#part61BackBtn, .part61-back-btn");
    const nextBtns = qsa("#part61NextBtn, .part61-next-btn");

    backBtns.forEach((btn) => {
      if (step === 1) {
        btn.hidden = true;
        btn.style.display = "none";
        btn.classList.add("hidden");
        btn.disabled = true;
      } else {
        btn.hidden = false;
        btn.style.display = "";
        btn.classList.remove("hidden");
        btn.disabled = false;
      }
    });

    nextBtns.forEach((btn) => {
      if (step === 5) {
        btn.hidden = true;
        btn.style.display = "none";
        btn.classList.add("hidden");
        btn.disabled = true;
      } else {
        btn.hidden = false;
        btn.style.display = "";
        btn.classList.remove("hidden");
        btn.disabled = false;
      }
    });

    const railItems = qsa("nav.part61-step-rail .part61-rail-item");
    railItems.forEach((item, index) => {
      const isActive = (index + 1) === step;
      item.classList.toggle("active", isActive);
      item.classList.toggle("is-active", isActive);
      if (isActive) {
        item.setAttribute("aria-current", "step");
      } else {
        item.removeAttribute("aria-current");
      }
    });

    if (workbench) {
      workbench.scrollTop = 0;
    }
    window.scrollTo({ top: 0 });

    updateResponsiveLayout();
  }

  function initStepRail() {
    const items = qsa("nav.part61-step-rail .part61-rail-item");
    items.forEach((item, index) => {
      item.addEventListener("click", (event) => {
        event.preventDefault();
        setStep(index + 1);
      });
    });
  }

  /* ---------- Results rendering ---------- */

  function renderSummary(audits) {
    ids.summary.innerHTML = audits.map((audit) => `
      <div class="summary-block">
        <h4>${linkifyCfrText(audit.title)}</h4>
        <div class="summary-grid">
          <div class="metric metric-raw"><span>Raw Requirement Sum</span><b>${hours(audit.summary.rawRequirementSum)}</b></div>
          <div class="metric metric-optimized"><span>Optimized Combined Total</span><b>${hours(audit.summary.optimizedCombinedTotal)}</b></div>
          <div class="metric metric-dual"><span>Dual Cost</span><b>${money(audit.summary.dualCost)}</b></div>
          <div class="metric metric-solo"><span>Solo/PDPIC Cost</span><b>${money(audit.summary.soloCost)}</b></div>
          <div class="metric metric-cost"><span>Estimated Total Cost</span><b>${money(audit.summary.estimatedTotalCost)}</b></div>
        </div>
      </div>
    `).join("");
  }

  function renderCombined(result) {
    const rates = result.combined.rates || currentRates();
    const notes = result.combined.notes && result.combined.notes.length
      ? `<ul class="list-box">${result.combined.notes.map((note) => `<li>${linkifyCfrText(note)}</li>`).join("")}</ul>`
      : "";
    const combinedHtml = `
      <p><b>Rates used:</b> wet ${money(rates.aircraftWet)}/hr, instructor ${money(rates.instructor)}/hr, dual ${money(rates.dual)}/hr.</p>
      <p><b>Combined optimized planning total:</b> ${hours(result.combined.optimizedHours)}. <b>Combined estimated cost:</b> ${money(result.combined.estimatedCost)}.</p>
      ${notes}
    `;
    ids.combinedSummary.innerHTML = combinedHtml;
    // Mirror to alias element (for test compatibility / external access)
    const aliasEl = document.getElementById("combinedSummary");
    if (aliasEl && aliasEl !== ids.combinedSummary) aliasEl.innerHTML = combinedHtml;
  }

  function sumIfKnown(values) {
    if (!values.every((value) => typeof value === "number")) return "UNKNOWN";
    return values.reduce((sum, value) => sum + value, 0);
  }

  function renderHero(result) {
    const blockers = blockerList(result);
    const rawTotal = sumIfKnown(result.audits.map((audit) => numericValue(audit.summary.rawRequirementSum)));
    const optimized = result.combined.optimizedHours;
    const cost = result.combined.estimatedCost;
    const savings = typeof rawTotal === "number" && typeof optimized === "number"
      ? Math.max(0, rawTotal - optimized)
      : null;
    const ready = !blockers.length;
    ids.heroBanner.hidden = false;
    ids.heroBanner.className = `part61-hero-banner ${ready ? "is-ready" : "is-blocked"}`;
    ids.heroBanner.innerHTML = ready
      ? `<span class="part61-hero-icon" aria-hidden="true">&#10003;</span><div><b>Draft plan ready.</b> ${linkifyCfrText(firstNextAction(result))}</div>`
      : `<span class="part61-hero-icon" aria-hidden="true">&#9650;</span><div><b>Needs ${blockers.length} input${blockers.length === 1 ? "" : "s"} resolved.</b> See Unknowns under the Rules &amp; Sources tab before relying on the math.</div>`;
    ids.auditDashboard.innerHTML = [
      dashboardMetric("Optimized Hours", hours(optimized), optimized === "UNKNOWN" ? "red" : "green"),
      dashboardMetric("Estimated Cost", money(cost), cost === "UNKNOWN" ? "red" : "amber"),
      dashboardMetric("Savings vs Raw Sum", savings !== null ? `${savings.toFixed(1)} hr` : "Depends on missing inputs", savings !== null ? "blue" : "slate")
    ].join("");
    const firstVerdict = result.audits[0] ? result.audits[0].verdict : "No route generated.";
    ids.cfiReadout.innerHTML = linkifyMultilineCfrText(`${firstVerdict}\n\n${cfiReadoutText(result)}`);

    const reviewCostEl = qs("#part61ReviewCost");
    const reviewHoursEl = qs("#part61ReviewHours");
    const reviewStatusEl = qs("#part61ReviewStatus");
    if (reviewCostEl) reviewCostEl.textContent = money(cost);
    if (reviewHoursEl) reviewHoursEl.textContent = hours(optimized);
    if (reviewStatusEl) reviewStatusEl.textContent = ready ? "Ready" : `${blockers.length} Blocked`;
  }

  function renderCounts(audits) {
    const countRows = audits.map((audit) => {
      const rows = audit.rows.filter((row) => row.kind !== "total");
      const satisfied = rows.filter((row) => row.status === "satisfied").length;
      const remaining = rows.filter((row) => row.status === "remaining").length;
      const missing = rows.filter((row) => row.status === "missing").length;
      const broad = rows.filter((row) => row.bucketType === "broad").slice(0, 4);
      const guardrails = rows.filter((row) => {
        const text = `${row.why} ${row.overlapLogic}`.toLowerCase();
        return text.includes("does not") || text.includes("no fixed") || text.includes("domingo") || text.includes("not satisfy");
      }).slice(0, 4);
      return `
        <article class="counts-card">
          <h4>${linkifyCfrText(audit.title)}</h4>
          <div class="counts-stats">
            <span class="status-pill status-complete">${satisfied} satisfied</span>
            <span class="status-pill status-remaining">${remaining} remaining</span>
            <span class="status-pill status-missing">${missing} missing</span>
          </div>
          <div class="counts-columns">
            <div>
              <b>What can count</b>
              <ul>${(broad.length ? broad : rows.slice(0, 3)).map((row) => `<li>${linkifyCfrText(row.requirement)}: ${linkifyCfrText(row.why)}</li>`).join("")}</ul>
            </div>
            <div>
              <b>What does not / guardrails</b>
              <ul>${(guardrails.length ? guardrails : rows.filter((row) => row.status !== "satisfied").slice(0, 3)).map((row) => `<li>${linkifyCfrText(row.requirement)}: ${linkifyCfrText(row.overlapLogic || row.why)}</li>`).join("")}</ul>
            </div>
          </div>
        </article>
      `;
    });
    ids.counts.innerHTML = countRows.join("");
  }

  function table(columns, rows, totalClass) {
    if (!rows || !rows.length) return `<div class="empty-state">No rows generated.</div>`;
    return `
      <div class="table-wrap">
        <table>
          <thead>
            <tr>${columns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join("")}</tr>
          </thead>
          <tbody>
            ${rows.map((row) => `
              <tr class="${rowClass(row, totalClass)}">
                ${columns.map((column) => `<td class="${cellClass(row, column.key)}" data-label="${escapeHtml(column.label)}">${formatCell(row[column.key], column.key, row)}</td>`).join("")}
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function rowClass(row, totalClass) {
    const classes = [];
    if (row.kind) classes.push(`row-kind-${row.kind}`);
    if (row.bucketType) classes.push(`row-bucket-${row.bucketType}`);
    if (row.status) classes.push(`row-status-${row.status}`);
    if (totalClass && row.kind === "total") classes.push("total-row");
    return classes.join(" ");
  }

  function cellClass(row, key) {
    if (key !== "remaining") return "";
    const value = row.remaining;
    if (value === "UNKNOWN" || value === "Not logged" || value === "Pending") return "status-cell status-missing";
    if (value === 0 || value === "0" || value === "Complete") return "status-cell status-complete";
    if (typeof value === "number" && value > 0) return "status-cell status-remaining";
    return "";
  }

  function tagsForRow(row) {
    const requirement = String(row.requirement || row.block || row.flightType || row.mode || "").toLowerCase();
    const tags = [];
    if (row.bucketType === "broad") tags.push("Broad Credit");
    if (row.bucketType === "paperwork") tags.push("Paperwork");
    if (row.kind === "event") tags.push("Event");
    if (row.kind === "gate") tags.push("Gate");
    if (String(row.cfr || "").includes("RAW REQUIREMENT SUM")) tags.push("Raw");
    if (String(row.cfr || "").includes("OPTIMIZED COMBINED TOTAL")) tags.push("Optimized");
    if (row.bucketType === "dual" || requirement.includes("dual")) tags.push("Dual");
    if (row.bucketType === "solo" || requirement.includes("solo/pdpic") || requirement.includes("solo")) tags.push("Solo/PDPIC");
    if (requirement.includes("time building") || requirement.includes("hour building")) tags.push("Time Building");
    return Array.from(new Set(tags)).slice(0, 3);
  }

  function tagMarkup(row) {
    const tags = tagsForRow(row);
    return tags.length ? `<span class="tag-row">${tags.map((tag) => `<span class="data-tag tag-${tag.toLowerCase().replace(/[^a-z0-9]+/g, "-")}">${escapeHtml(tag)}</span>`).join("")}</span>` : "";
  }

  const CATEGORY_THEMES = {
    all: { accent: "#475569", soft: "#f0f1f3", line: "#d1d5da", ink: "#313b4a" },
    "practical-test-prereqs": { accent: "#4f46e5", soft: "#f1f0fd", line: "#d3d1f9", ink: "#1d13be" },
    "student-pilot": { accent: "#f59e0b", soft: "#fef7eb", line: "#fde7c2", ink: "#b37000" },
    "sport-pilot": { accent: "#16a34a", soft: "#ecf8f1", line: "#c5e8d2", ink: "#0b7633" },
    "recreational-pilot": { accent: "#65a30d", soft: "#f3f8ec", line: "#d9e8c3", ink: "#477605" },
    "private-pilot": { accent: "#0ea5e9", soft: "#ecf8fd", line: "#c3e9fa", ink: "#0476a9" },
    "commercial-pilot": { accent: "#ca8a04", soft: "#fbf6eb", line: "#f2e2c0", ink: "#906200" },
    atp: { accent: "#1f2937", soft: "#edeeef", line: "#c7cacd", ink: "#151d27" },
    "instrument-rating": { accent: "#64748b", soft: "#f3f4f6", line: "#d8dce2", ink: "#455162" },
    "flight-instructor": { accent: "#dc2626", soft: "#fceeee", line: "#f6c9c9", ink: "#a11414" },
    "sport-pilot-instructor": { accent: "#ea580c", soft: "#fdf2ec", line: "#fad5c2", ink: "#aa3c02" },
    "additional-recurrent": { accent: "#0d9488", soft: "#ecf6f5", line: "#c3e4e1", ink: "#056b62" },
    "robinson-sfar73": { accent: "#db2777", soft: "#fceef4", line: "#f6c9dd", ink: "#a01553" },
    "specialty-operations": { accent: "#7c3aed", soft: "#f5effe", line: "#decefb", ink: "#4f0ac4" }
  };

  function findCategoryIdForEndorsement(endorsementId) {
    if (!window.BROWSE_STRUCTURE) return "all";
    const lowerId = String(endorsementId).toLowerCase();
    for (const cat of window.BROWSE_STRUCTURE) {
      if (!cat.subcategories) continue;
      for (const sub of cat.subcategories) {
        const primary = Array.isArray(sub.primaryIds) ? sub.primaryIds : [];
        const supp = Array.isArray(sub.supplementalIds) ? sub.supplementalIds : [];
        if (primary.some(id => String(id).toLowerCase() === lowerId) || 
            supp.some(id => String(id).toLowerCase() === lowerId)) {
          return cat.categoryId;
        }
      }
    }
    return "all";
  }

  function getContrastTextColor(hexColor) {
    const normalized = String(hexColor || "").trim().replace(/^#/, "");
    if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
      return "#ffffff";
    }
    const red = parseInt(normalized.slice(0, 2), 16);
    const green = parseInt(normalized.slice(2, 4), 16);
    const blue = parseInt(normalized.slice(4, 6), 16);
    const luminance = ((0.299 * red) + (0.587 * green) + (0.114 * blue)) / 255;
    return luminance > 0.62 ? "#172133" : "#ffffff";
  }

  function formatCell(value, key, row) {
    const tags = key === "requirement" || key === "block" ? tagMarkup(row) : "";
    const linkKeys = new Set(["cfr", "cfrBasis", "source", "cfrRows"]);
    if (key === "item" && value) {
      const catId = findCategoryIdForEndorsement(value);
      const theme = CATEGORY_THEMES[catId] || CATEGORY_THEMES.all;
      const bg = theme.accent;
      const text = getContrastTextColor(bg);
      return `<span class="part61-endorsement-badge" style="background:${bg}; color:${text}; font-family:var(--mono); font-weight:800; font-size:0.8rem; padding:3px 10px; border-radius:12px; display:inline-block; letter-spacing:0.02em; box-shadow:0 2px 4px rgba(15,23,42,0.06); text-align:center; min-width:50px;">${escapeHtml(value)}</span>`;
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      return `${escapeHtml(String(value))}${tags}`;
    }
    if (value === "UNKNOWN") {
      return `<span class="status-unknown">UNKNOWN</span>${tags}`;
    }
    if (value === "Complete" || value === 0 || value === "0") {
      return `<span class="status-good">${escapeHtml(value)}</span>${tags}`;
    }
    if (linkKeys.has(key)) {
      return `${linkifyCfrText(value ?? "", { linkBare: true })}${tags}`;
    }
    return `${linkifyCfrText(value ?? "")}${tags}`;
  }

  function updateFilterButtons() {
    qsa("[data-filter]").forEach((button) => {
      const active = button.dataset.filter === state.activeFilter;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function ledgerRowsForFilter(audit) {
    if (state.activeFilter === LEDGER_FILTERS.REMAINING) {
      return audit.rows.filter((row) => row.status === "remaining" || row.status === "missing" || row.kind === "total");
    }
    if (state.activeFilter === LEDGER_FILTERS.EVENTS) return audit.events;
    return audit.rows;
  }

  function renderLedger(audits) {
    updateFilterButtons();
    if (state.activeFilter === LEDGER_FILTERS.ENDORSEMENTS) {
      ids.ledger.innerHTML = table([
        { key: "stage", label: "Stage" },
        { key: "item", label: "AC Item" },
        { key: "endorsement", label: "Endorsement" },
        { key: "useWhen", label: "Use When" },
        { key: "cfrBasis", label: "CFR Basis" },
        { key: "required", label: "Required?" },
        { key: "whoSigns", label: "Who Signs" },
        { key: "notes", label: "Notes" }
      ], endorsementRows(audits));
      return;
    }
    if (state.activeFilter === LEDGER_FILTERS.PAPERWORK) {
      ids.ledger.innerHTML = table([
        { key: "stage", label: "Stage" },
        { key: "gate", label: "Gate" },
        { key: "source", label: "Source" },
        { key: "required", label: "Required?" },
        { key: "whenNeeded", label: "When Needed" },
        { key: "whoHandles", label: "Who Handles" },
        { key: "notes", label: "Notes" }
      ], gateRows(audits));
      return;
    }
    ids.ledger.innerHTML = audits.map((audit) => `
      <h4>${linkifyCfrText(audit.title)}</h4>
      ${table([
        { key: "cfr", label: "CFR" },
        { key: "requirement", label: "Requirement" },
        { key: "required", label: "Required" },
        { key: "has", label: "Pilot Has" },
        { key: "credit", label: "Credit" },
        { key: "remaining", label: "Remaining" },
        { key: "why", label: "Why" },
        { key: "overlapLogic", label: "Overlap Logic" }
      ], ledgerRowsForFilter(audit), true)}
    `).join("");
  }

  function renderTraining(audits) {
    const rows = audits.flatMap((audit) => audit.trainingPlan.map((block) => ({ stage: audit.title, ...block, cost: money(block.cost) })));
    ids.training.innerHTML = table([
      { key: "stage", label: "Stage" },
      { key: "block", label: "Block" },
      { key: "flightType", label: "Flight Type" },
      { key: "hours", label: "Hours" },
      { key: "mode", label: "Dual/Solo/PDPIC" },
      { key: "cfrRows", label: "CFR Rows Satisfied" },
      { key: "events", label: "Required Events" },
      { key: "cost", label: "Cost" },
      { key: "notes", label: "Notes" }
    ], rows);
  }

  function renderGates(audits) {
    ids.gates.innerHTML = table([
      { key: "stage", label: "Stage" },
      { key: "gate", label: "Gate" },
      { key: "source", label: "Source" },
      { key: "required", label: "Required?" },
      { key: "whenNeeded", label: "When Needed" },
      { key: "whoHandles", label: "Who Handles" },
      { key: "notes", label: "Notes" }
    ], gateRows(audits));
  }

  function gateRows(audits) {
    const seen = new Set();
    return audits.flatMap((audit) => audit.gates.map((gate) => ({ stage: audit.title, ...gate, kind: "gate", bucketType: "paperwork" })))
      .filter((gate) => {
        const key = `${gate.stage}-${gate.gate}-${gate.source}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }

  function renderEndorsements(audits) {
    ids.endorsements.innerHTML = table([
      { key: "stage", label: "Stage" },
      { key: "item", label: "AC Item" },
      { key: "endorsement", label: "Endorsement" },
      { key: "useWhen", label: "Use When" },
      { key: "cfrBasis", label: "CFR Basis" },
      { key: "required", label: "Required?" },
      { key: "whoSigns", label: "Who Signs" },
      { key: "notes", label: "Notes" }
    ], endorsementRows(audits));
  }

  function endorsementRows(audits) {
    return audits.flatMap((audit) => audit.endorsements.map((endorsement) => ({
      stage: audit.title,
      ...endorsement,
      kind: "gate",
      bucketType: "paperwork"
    })));
  }

  function renderUnknowns(audits) {
    const unknowns = audits.flatMap((audit) => audit.unknowns.map((item) => `${audit.title}: ${item}`));
    ids.unknowns.innerHTML = unknowns.length
      ? `<ul class="list-box">${unknowns.map((item) => `<li>${linkifyCfrText(item)}</li>`).join("")}</ul>`
      : `<div class="empty-state status-good">No blocking unknowns for the generated math.</div>`;
  }

  function renderLinks(audits) {
    const map = new Map();
    audits.flatMap((audit) => audit.links).forEach((link) => map.set(link.url, link));
    ids.links.innerHTML = `<ul class="list-box">${Array.from(map.values()).map((link) => `<li><a href="${escapeHtml(link.url)}" target="_blank" rel="noreferrer">${escapeHtml(link.label)}</a></li>`).join("")}</ul>`;
  }

  /* ---------- Results tabs ---------- */

  function setResultsTab(tab, focusTab) {
    if (!RESULTS_TABS.includes(tab)) tab = "plan";
    state.resultsTab = tab;
    qsa("[data-results-tab]").forEach((button) => {
      const active = button.dataset.resultsTab === tab;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", active ? "true" : "false");
      button.setAttribute("tabindex", active ? "0" : "-1");
      if (active && focusTab) button.focus();
    });
    qsa(".part61-results-tabpanel").forEach((panel) => {
      panel.hidden = panel.dataset.resultsPanel !== tab;
    });
  }

  /* ---------- Stale-results banner ---------- */

  function markDirty() {
    if (!state.result || state.dirty) return;
    state.dirty = true;
    updateStaleBanner();
  }

  function updateStaleBanner() {
    const show = Boolean(state.result && state.dirty);
    ids.staleBanner.hidden = !show;
    if (show) {
      ids.staleBanner.innerHTML = `
        <span>Inputs changed since this audit was generated.</span>
        <button type="button" class="part61-button part61-button-primary part61-button-small" data-recalculate>Recalculate</button>
      `;
    } else {
      ids.staleBanner.innerHTML = "";
    }
  }

  /* ---------- Calculate ---------- */

  function flashHero() {
    const section = qs(".part61-dashboard-section");
    if (!section) return;
    section.classList.remove("is-fresh");
    void section.offsetWidth;
    section.classList.add("is-fresh");
    window.setTimeout(() => section.classList.remove("is-fresh"), 1400);
  }

  function updateResultPresence() {
    const workbench = qs(".part61-workbench");
    if (workbench) workbench.classList.toggle("has-result", Boolean(state.result));
  }

  function renderCalculationError() {
    ids.heroBanner.hidden = false;
    ids.heroBanner.className = "part61-hero-banner is-blocked";
    ids.heroBanner.innerHTML = `<span class="part61-hero-icon" aria-hidden="true">&#10005;</span><div><b>Something went wrong generating this audit.</b> Your inputs are preserved - adjust them and try again.</div>`;
    ids.resultTitle.textContent = "Audit failed";
  }

  function calculateAndRender() {
    state.validationAttempted = true;
    if (!validateRequiredInputs(true)) return;
    let result;
    try {
      result = CORE.calculateAudit(collectInput());
    } catch (error) {
      console.error("Part 61 audit failed", error);
      renderCalculationError();
      return;
    }
    state.result = result;
    state.dirty = false;
    updateResultPresence();
    const mq = typeof window.matchMedia === "function";
    state.activeFilter = (mq ? window.matchMedia("(max-width: 640px)").matches : window.innerWidth <= 640)
      ? LEDGER_FILTERS.REMAINING
      : LEDGER_FILTERS.ALL;
    renderResults(state.result);
    updateStaleBanner();
    updateRailProgress();
    if (mq ? window.matchMedia("(max-width: 1100px)").matches : window.innerWidth <= 1100) {
      U.queueScrollToTarget(ids.results);
    }
    flashHero();
    setStep(5);
  }

  function renderResults(result) {
    const audits = result.audits;
    ids.resultTitle.innerHTML = audits.map((audit) => linkifyCfrText(audit.title)).join(" -> ");
    ids.sourceReview.textContent = `Source review date: ${result.sourceReviewDate}`;
    updateInputCompleteness();
    renderHero(result);
    ids.verdict.innerHTML = audits.map((audit, index) => `<p><b>Stage ${index + 1}: ${linkifyCfrText(audit.title)}.</b> ${linkifyCfrText(audit.verdict, { linkBare: true })}</p>`).join("");
    renderSummary(audits);
    renderCombined(result);
    renderTraining(audits);
    renderEndorsements(audits);
    renderGates(audits);
    renderLedger(audits);
    renderCounts(audits);
    renderUnknowns(audits);
    renderLinks(audits);
    setResultsTab(state.resultsTab);
    if (ids.readoutDetails) ids.readoutDetails.open = false;
  }

  /* ---------- Scenarios, drafts, and sharing ---------- */

  function hydrateScenario(scenario) {
    state.credentials = Array.isArray(scenario.credentials) ? scenario.credentials.slice() : [];
    state.targets = Array.isArray(scenario.targets) && scenario.targets.length
      ? scenario.targets.slice()
      : ["private-asel"];
    ids.credentialSearch.value = "";
    setFlags(scenario.flags || {});
    setExperience(scenario.experience || {});
    setRates(scenario.rates || {});
    renderEvents();
    setEvents(scenario.events || {});
    clearValidation();
    rerenderStaticControls();
  }

  function applyScenario(scenario) {
    hydrateScenario(scenario);
    queueDraftSave();
    calculateAndRender();
  }

  function loadRandomSample() {
    if (!GEN || typeof GEN.generateRandomScenario !== "function") return;
    applyScenario(GEN.generateRandomScenario());
  }

  function scenarioSnapshot() {
    const experience = {};
    qsa("[data-experience]").forEach((input) => {
      experience[input.dataset.experience] = input.value;
    });
    const events = {};
    qsa("[data-event]").forEach((input) => {
      events[input.dataset.event] = input.checked;
    });
    return {
      version: 1,
      savedAt: new Date().toISOString(),
      credentials: state.credentials.slice(),
      targets: state.targets.slice(),
      flags: collectFlags(),
      rates: {
        aircraftWet: ids.aircraftWetRate.value,
        instructor: ids.instructorRate.value
      },
      experience,
      events
    };
  }

  function persistScenario() {
    U.saveStoredJson(DRAFT_STORAGE_KEY, scenarioSnapshot());
  }

  const queueDraftSave = U.debounce(persistScenario, 400);

  function showDraftNotice(savedAt) {
    const when = savedAt ? new Date(savedAt) : null;
    const label = when && !Number.isNaN(when.getTime()) ? when.toLocaleString() : "an earlier session";
    ids.draftNotice.innerHTML = `
      <span>Restored your draft from ${escapeHtml(label)}.</span>
      <button type="button" class="part61-text-button" data-dismiss-draft>Start fresh</button>
    `;
    ids.draftNotice.hidden = false;
  }

  function restoreDraft() {
    const draft = U.loadStoredJson(DRAFT_STORAGE_KEY);
    if (!draft || draft.version !== 1) return false;
    hydrateScenario(draft);
    showDraftNotice(draft.savedAt);
    return true;
  }

  function encodeScenario() {
    const snap = scenarioSnapshot();
    const flagBits = FLAG_KEYS.map((key) => (snap.flags[key] ? "1" : "0")).join("");
    const fieldKeys = flatFieldList().map((field) => field.key);
    const hoursCsv = fieldKeys.map((key) => snap.experience[key] ?? "").join(",");
    const eventBits = RULES.EVENT_OPTIONS.map((event) => (snap.events[event.id] ? "1" : "0")).join("");
    return [
      "v1",
      snap.credentials.join(","),
      snap.targets.join(","),
      flagBits,
      `${snap.rates.aircraftWet},${snap.rates.instructor}`,
      hoursCsv,
      eventBits
    ].join("~");
  }

  function decodeScenario(encoded) {
    try {
      const parts = String(encoded).split("~");
      if (parts[0] !== "v1" || parts.length < 7) return null;
      const [, credsCsv, targetsCsv, flagBits, ratesCsv, hoursCsv, eventBits] = parts;
      const validCredentials = new Set(RULES.CREDENTIAL_OPTIONS.map((option) => option.id));
      const validTargets = new Set(RULES.TARGET_OPTIONS.map((option) => option.id));
      const credentials = credsCsv ? credsCsv.split(",").filter((id) => validCredentials.has(id)) : [];
      const targets = targetsCsv ? targetsCsv.split(",").filter((id) => validTargets.has(id)) : [];
      const flags = {};
      FLAG_KEYS.forEach((key, index) => {
        flags[key] = flagBits.charAt(index) === "1";
      });
      const [aircraftWet, instructor] = ratesCsv.split(",");
      const fieldKeys = flatFieldList().map((field) => field.key);
      const hoursValues = hoursCsv.split(",");
      const experience = {};
      fieldKeys.forEach((key, index) => {
        experience[key] = hoursValues[index] ?? "";
      });
      const events = {};
      RULES.EVENT_OPTIONS.forEach((event, index) => {
        events[event.id] = eventBits.charAt(index) === "1";
      });
      return {
        credentials,
        targets: targets.length ? targets : ["private-asel"],
        flags,
        rates: { aircraftWet, instructor },
        experience,
        events
      };
    } catch (error) {
      return null;
    }
  }

  function consumeShareParam() {
    let params;
    try {
      params = new URLSearchParams(window.location.search);
    } catch (error) {
      return false;
    }
    const encoded = params.get(SHARE_PARAM);
    if (!encoded) return false;
    const scenario = decodeScenario(encoded);
    if (!scenario) return false;
    hydrateScenario(scenario);
    params.delete(SHARE_PARAM);
    const query = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${query ? "?" + query : ""}${window.location.hash}`);
    // setTimeout, not requestAnimationFrame: rAF never fires in background tabs,
    // and the timeout also guarantees app.js has unhidden the calculator view.
    window.setTimeout(() => calculateAndRender(), 0);
    return true;
  }

  function copyShareLink() {
    const url = new URL(window.location.href);
    url.search = "";
    url.searchParams.set("view", "calculator");
    url.searchParams.set(SHARE_PARAM, encodeScenario());
    U.copyTextToClipboard(url.toString(), ids.shareBtn, "Link copied");
  }

  /* ---------- Clear and reports ---------- */

  function clearAll() {
    state.credentials = [];
    state.targets = ["private-asel"];
    state.validationAttempted = false;
    state.result = null;
    state.dirty = false;
    updateResultPresence();
    state.activeFilter = LEDGER_FILTERS.ALL;
    state.resultsTab = "plan";
    ids.credentialSearch.value = "";
    setFlags({});
    setExperience({});
    setRates({
      aircraftWet: RULES.DEFAULT_RATES.aircraftWet,
      instructor: RULES.DEFAULT_RATES.instructor
    });
    renderEvents();
    setEvents({});
    clearValidation();
    rerenderStaticControls();
    U.clearStoredValue(DRAFT_STORAGE_KEY);
    ids.draftNotice.hidden = true;
    ids.draftNotice.innerHTML = "";
    updateStaleBanner();
    ids.resultTitle.textContent = "Ready for a scenario";
    ids.inputCompleteness.textContent = `Input completeness: 0/${flatFieldList().length} hour fields complete`;
    ids.heroBanner.hidden = true;
    ids.heroBanner.innerHTML = "";
    ids.auditDashboard.innerHTML = "";
    ids.cfiReadout.textContent = "Select the pilot's current credentials, enter known hours, choose the target path, then calculate.";
    ids.verdict.textContent = "Select the pilot's current credentials, enter known hours, choose the target path, then calculate.";
    ["summary", "combinedSummary", "counts", "ledger", "training", "gates", "endorsements", "unknowns", "links"].forEach((key) => {
      ids[key].innerHTML = "";
    });
    setResultsTab("plan");
    if (ids.readoutDetails) ids.readoutDetails.open = false;
    updateRailProgress();

    const reviewCostEl = qs("#part61ReviewCost");
    const reviewHoursEl = qs("#part61ReviewHours");
    const reviewStatusEl = qs("#part61ReviewStatus");
    if (reviewCostEl) reviewCostEl.textContent = "$0.00";
    if (reviewHoursEl) reviewHoursEl.textContent = "0.0 hrs";
    if (reviewStatusEl) reviewStatusEl.textContent = "Ready";

    setStep(1);
  }

  function reportText() {
    if (!state.result) return "No report generated yet.";
    const rates = state.result.combined.rates || currentRates();
    const headerLines = [
      `Rates used: wet ${money(rates.aircraftWet)}/hr; instructor ${money(rates.instructor)}/hr; dual ${money(rates.dual)}/hr; solo/PDPIC/time-building ${money(rates.solo)}/hr.`,
      "Validation assumption: zeros mean not applicable or none logged; blanks are not accepted in the browser UI."
    ];
    if (state.dirty) {
      headerLines.push("NOTE: Inputs changed after this audit was generated; recalculate before relying on it.");
    }
    const header = headerLines.join("\n");
    return `${header}\n\nCFI READOUT\n${cfiReadoutText(state.result)}\n\nFULL AUDIT\n${state.result.audits.map((audit, index) => {
      const rows = audit.rows.map((row) => `${row.cfr} | ${row.requirement} | remaining ${row.remaining} | ${row.why}`).join("\n");
      const endorsements = audit.endorsements.map((item) => `${item.item} | ${item.endorsement} | ${item.cfrBasis}`).join("\n");
      return [
        `Stage ${index + 1}: ${audit.title}`,
        `Verdict: ${audit.verdict}`,
        `Raw Requirement Sum: ${audit.summary.rawRequirementSum}`,
        `Optimized Combined Total: ${audit.summary.optimizedCombinedTotal}`,
        `Estimated Total Cost: ${audit.summary.estimatedTotalCost}`,
        "Part 61 Ledger:",
        rows,
        "Endorsements:",
        endorsements
      ].join("\n");
    }).join("\n\n")}`;
  }

  function copyReport() {
    U.copyTextToClipboard(reportText(), ids.copyBtn);
  }

  function copyCfiReadout() {
    U.copyTextToClipboard(cfiReadoutText(state.result), ids.copyCfiBtn);
  }

  function copyStudentChecklist() {
    U.copyTextToClipboard(studentChecklistText(state.result), ids.copyChecklistBtn);
  }

  function rerenderStaticControls() {
    renderCredentialOptions();
    renderSelectedCredentials();
    renderStages();
    updateRailProgress();
  }

  /* ---------- Events ---------- */

  function bindEvents() {
    ids.credentialSearch.addEventListener("input", renderCredentialOptions);
    ids.credentialOptions.addEventListener("click", (event) => {
      const button = event.target.closest("[data-credential]");
      if (!button) return;
      const value = button.dataset.credential;
      if (state.credentials.includes(value)) {
        state.credentials = state.credentials.filter((item) => item !== value);
      } else {
        state.credentials.push(value);
      }
      rerenderStaticControls();
      markDirty();
      queueDraftSave();
    });

    ids.selectedCredentials.addEventListener("click", (event) => {
      const button = event.target.closest("[data-remove-credential]");
      if (!button) return;
      state.credentials = state.credentials.filter((item) => item !== button.dataset.removeCredential);
      rerenderStaticControls();
      markDirty();
      queueDraftSave();
    });

    ids.targetStages.addEventListener("change", (event) => {
      const select = event.target.closest("[data-stage-index]");
      if (!select) return;
      state.targets[Number(select.dataset.stageIndex)] = select.value;
      renderEvents();
      updateRailProgress();
    });

    ids.targetStages.addEventListener("click", (event) => {
      const button = event.target.closest("[data-remove-stage]");
      if (!button) return;
      state.targets.splice(Number(button.dataset.removeStage), 1);
      if (!state.targets.length) state.targets.push("private-asel");
      renderStages();
      renderEvents();
      updateRailProgress();
      markDirty();
      queueDraftSave();
    });

    ids.addStageBtn.addEventListener("click", () => {
      state.targets.push("commercial-asel");
      renderStages();
      renderEvents();
      updateRailProgress();
      markDirty();
      queueDraftSave();
    });

    ids.calculateBtn.addEventListener("click", calculateAndRender);
    if (ids.mobileCalculateBtn) {
      ids.mobileCalculateBtn.addEventListener("click", calculateAndRender);
    }

    const handleFieldInput = U.debounce((target) => {
      if (target.matches("[data-rate]")) updateRateSummary();
      if (target.matches("[data-experience]")) updateInputCompleteness();
      if (state.validationAttempted) validateRequiredInputs(false);
      updateMobileBar();
    }, 150);

    rootEl.addEventListener("input", (event) => {
      if (!event.target.matches("[data-experience], [data-rate]")) return;
      if (event.target.matches("[data-experience]") && event.target.value.trim() !== "") {
        setInvalid(event.target, false);
      }
      markDirty();
      queueDraftSave();
      handleFieldInput(event.target);
    });

    // Inline "visited and left blank" validation, without waiting for Calculate.
    ids.experienceFields.addEventListener("blur", (event) => {
      const input = event.target;
      if (!input.matches || !input.matches("[data-experience]")) return;
      if (input.value.trim() === "") setInvalid(input, true);
    }, true);

    ids.experienceFields.addEventListener("click", (event) => {
      const fieldButton = event.target.closest("[data-fill-zero-field]");
      if (fieldButton) {
        const field = fieldButton.closest(".number-field");
        const input = field ? field.querySelector("[data-experience]") : null;
        fillFieldWithZero(input);
        return;
      }
      const button = event.target.closest("[data-fill-zero-group]");
      if (!button) return;
      fillBlanksWithZero(button.dataset.fillZeroGroup);
    });

    ids.validationMessage.addEventListener("click", (event) => {
      if (event.target.closest("[data-fill-zero-all]")) {
        fillBlanksWithZero(null);
        return;
      }
      const jump = event.target.closest("[data-jump-group]");
      if (!jump) return;
      const slug = jump.dataset.jumpGroup;
      const badge = qs(`[data-group-completion="${slug}"]`);
      const groupEl = badge ? badge.closest(".field-group") : null;
      if (groupEl) U.scrollToTarget(groupEl);
      const firstBlank = qsa(`[data-experience][data-group-slug="${slug}"]`).find((input) => input.value.trim() === "");
      if (firstBlank) firstBlank.focus({ preventScroll: true });
    });

    // Flags, event checkboxes, and stage selects mark the audit stale and autosave.
    rootEl.addEventListener("change", (event) => {
      if (!event.target.matches('input[type="checkbox"], select')) return;
      if (event.target.matches("[data-event]")) updateEventGroupCounts();
      markDirty();
      queueDraftSave();
    });

    ids.staleBanner.addEventListener("click", (event) => {
      if (!event.target.closest("[data-recalculate]")) return;
      calculateAndRender();
    });

    ids.draftNotice.addEventListener("click", (event) => {
      if (!event.target.closest("[data-dismiss-draft]")) return;
      clearAll();
    });

    ids.randomSampleBtn.addEventListener("click", loadRandomSample);
    ids.clearBtn.addEventListener("click", clearAll);
    ids.copyBtn.addEventListener("click", copyReport);
    if (ids.shareBtn) ids.shareBtn.addEventListener("click", copyShareLink);
    ids.copyCfiBtn.addEventListener("click", (event) => {
      // The button lives inside the readout <summary>; do not toggle it.
      event.preventDefault();
      event.stopPropagation();
      copyCfiReadout();
    });
    ids.copyChecklistBtn.addEventListener("click", copyStudentChecklist);
    ids.printBtn.addEventListener("click", () => window.print());
    ids.clearEventsBtn.addEventListener("click", () => {
      setEvents({});
      markDirty();
      queueDraftSave();
    });

    qsa("[data-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        state.activeFilter = button.dataset.filter;
        if (state.result) renderLedger(state.result.audits);
      });
    });

    const tabRow = qs(".part61-results-tabs");
    if (tabRow) {
      tabRow.addEventListener("click", (event) => {
        const button = event.target.closest("[data-results-tab]");
        if (button) setResultsTab(button.dataset.resultsTab);
      });
      tabRow.addEventListener("keydown", (event) => {
        if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
        event.preventDefault();
        const index = RESULTS_TABS.indexOf(state.resultsTab);
        const next = event.key === "ArrowRight"
          ? (index + 1) % RESULTS_TABS.length
          : (index - 1 + RESULTS_TABS.length) % RESULTS_TABS.length;
        setResultsTab(RESULTS_TABS[next], true);
      });
    }

    window.addEventListener("beforeprint", () => {
      qsa(".part61-results-tabpanel").forEach((panel) => {
        panel.hidden = false;
      });
      if (ids.readoutDetails) ids.readoutDetails.open = true;
    });
    window.addEventListener("afterprint", () => {
      setResultsTab(state.resultsTab);
    });

    // Event delegation for Next/Back buttons
    rootEl.addEventListener("click", (event) => {
      const nextBtn = event.target.closest("#part61NextBtn, .part61-next-btn");
      if (nextBtn) {
        const workbench = qs(".part61-workbench");
        const currentStep = workbench ? parseInt(workbench.getAttribute("data-active-step"), 10) || state.activeStep : state.activeStep;
        setStep(currentStep + 1);
        return;
      }
      const backBtn = event.target.closest("#part61BackBtn, .part61-back-btn");
      if (backBtn) {
        const workbench = qs(".part61-workbench");
        const currentStep = workbench ? parseInt(workbench.getAttribute("data-active-step"), 10) || state.activeStep : state.activeStep;
        setStep(currentStep - 1);
        return;
      }
    });

    // Window resize event hook
    window.addEventListener("resize", updateResponsiveLayout);

    // Also bind event listeners to the header and results panel copies if they exist in the DOM
    const headerClearBtn = rootEl.querySelector("#part61HeaderClearBtn");
    if (headerClearBtn) headerClearBtn.addEventListener("click", clearAll);

    const headerCopyBtn = rootEl.querySelector("#part61HeaderCopyBtn");
    if (headerCopyBtn) headerCopyBtn.addEventListener("click", copyReport);

    const headerShareBtn = rootEl.querySelector("#part61HeaderShareBtn");
    if (headerShareBtn) headerShareBtn.addEventListener("click", copyShareLink);

    const headerPrintBtn = rootEl.querySelector("#part61HeaderPrintBtn");
    if (headerPrintBtn) headerPrintBtn.addEventListener("click", () => window.print());

    const copyChecklistResultsBtn = rootEl.querySelector("#part61CopyChecklistResultsBtn");
    if (copyChecklistResultsBtn) copyChecklistResultsBtn.addEventListener("click", copyStudentChecklist);

    const copyCfiResultsBtn = rootEl.querySelector("#part61CopyCfiResultsBtn");
    if (copyCfiResultsBtn) {
      copyCfiResultsBtn.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        copyCfiReadout();
      });
    }

    const editInputsBtn = rootEl.querySelector("#part61EditInputsBtn");
    if (editInputsBtn) editInputsBtn.addEventListener("click", () => setStep(4));
  }

  function init() {
    renderExperienceFields();
    renderEvents();
    setRates(state.rates);
    rerenderStaticControls();
    const restored = consumeShareParam() || restoreDraft();
    if (!restored) {
      updateEventGroupCounts();
    }
    bindEvents();
    initStepRail();
    updateInputCompleteness();
    updateRailProgress();

    // Intercept workbench setAttribute to trigger setStep synchronously
    // This allows tests and external code to set data-active-step directly.
    const workbench = qs(".part61-workbench");
    if (workbench) {
      const origSetAttr = workbench.setAttribute.bind(workbench);
      workbench.setAttribute = function (name, value) {
        if (name === "data-active-step") {
          let step = parseInt(value, 10);
          if (isNaN(step) || step < 1 || step > 5) {
            step = state.activeStep;
          }
          origSetAttr(name, String(step));
          if (step !== state.activeStep) {
            setStep(step);
          }
        } else {
          origSetAttr(name, value);
        }
      };
    }

    updateResultPresence();
    setStep(restored ? 5 : 1);

    ids.sourceReview.textContent = `Source review date: ${RULES.REVIEW_DATE}`;
  }

  init();
})();
