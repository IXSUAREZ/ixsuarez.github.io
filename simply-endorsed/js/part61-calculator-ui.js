(function () {
  "use strict";

  const RULES = window.Part61RulesData;
  const CORE = window.Part61CalculatorCore;
  const rootEl = document.getElementById("part61CalculatorView");

  if (!RULES || !CORE || !rootEl) {
    return;
  }

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
    credentials: ["commercial-rotor-helicopter"],
    targets: ["private-asel", "commercial-asel"],
    rates: {
      aircraftWet: RULES.DEFAULT_RATES.aircraftWet,
      instructor: RULES.DEFAULT_RATES.instructor
    },
    validationAttempted: false,
    activeFilter: "all",
    lastSampleIndex: null,
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
    loadExampleBtn: byId("loadExampleBtn"),
    randomSampleBtn: byId("randomSampleBtn"),
    clearBtn: byId("clearBtn"),
    copyBtn: byId("copyBtn"),
    printBtn: byId("printBtn"),
    copyCfiBtn: byId("copyCfiBtn"),
    copyChecklistBtn: byId("copyChecklistBtn"),
    clearEventsBtn: byId("clearEventsBtn"),
    inputCompleteness: byId("inputCompleteness"),
    auditDashboard: byId("auditDashboard"),
    cfiReadout: byId("cfiReadout"),
    resultTitle: byId("resultTitle"),
    sourceReview: byId("sourceReview"),
    verdict: byId("verdict"),
    summary: byId("summary"),
    combinedSummary: byId("combinedSummary"),
    counts: byId("counts"),
    overlapMap: byId("overlapMap"),
    ledger: byId("ledger"),
    events: byId("events"),
    training: byId("training"),
    gates: byId("gates"),
    endorsements: byId("endorsements"),
    unknowns: byId("unknowns"),
    links: byId("links"),
    ledgerDetails: byId("ledgerDetails")
  };

  const ROTORCRAFT_EXAMPLE = {
    name: "Rotorcraft commercial to Private ASEL then Commercial ASEL",
    credentials: ["commercial-rotor-helicopter"],
    targets: ["private-asel", "commercial-asel"],
    flags: {
      militaryExperience: false,
      militaryOnly: false,
      faaCommercialAmel: false,
      priorFaa: true
    },
    rates: {
      aircraftWet: RULES.DEFAULT_RATES.aircraftWet,
      instructor: RULES.DEFAULT_RATES.instructor
    },
    experience: {
      totalTime: 150,
      poweredTime: 150,
      airplaneTime: 0,
      aselTime: 0,
      amelTime: 0,
      helicopterTime: 150,
      picTotal: 100,
      picAirplane: 0,
      picAsel: 0,
      picHelicopter: 100,
      xcPicTotal: 50,
      xcPicAirplane: 0,
      instrumentTime: 40,
      instrumentAirplane: 0,
      cfiiAirplane: 0,
      nightTime: 10,
      dualAsel: 0,
      soloAsel: 0,
      commercialTrainingAsel: 0,
      soloPdpicAsel: 0,
      complexTaaTurbine: 0,
      prepRecent: 0
    },
    events: {}
  };

  const SAMPLE_SCENARIOS = [
    ROTORCRAFT_EXAMPLE,
    {
      name: "FAA Commercial AMEL to Commercial ASEL added class",
      credentials: ["commercial-amel"],
      targets: ["commercial-asel-add-class"],
      flags: {
        militaryExperience: false,
        militaryOnly: false,
        faaCommercialAmel: true,
        priorFaa: true
      },
      rates: {
        aircraftWet: 205,
        instructor: 65
      },
      experience: {
        totalTime: 310,
        poweredTime: 310,
        airplaneTime: 310,
        aselTime: 40,
        amelTime: 120,
        helicopterTime: 0,
        picTotal: 180,
        picAirplane: 180,
        picAsel: 30,
        picHelicopter: 0,
        xcPicTotal: 85,
        xcPicAirplane: 85,
        instrumentTime: 55,
        instrumentAirplane: 55,
        cfiiAirplane: 0,
        nightTime: 22,
        dualAsel: 8,
        soloAsel: 12,
        commercialTrainingAsel: 0,
        soloPdpicAsel: 0,
        complexTaaTurbine: 15,
        prepRecent: 0
      },
      events: {}
    },
    {
      name: "Private ASEL partial Commercial ASEL progress",
      credentials: ["private-asel"],
      targets: ["commercial-asel"],
      flags: {
        militaryExperience: false,
        militaryOnly: false,
        faaCommercialAmel: false,
        priorFaa: true
      },
      rates: {
        aircraftWet: 195,
        instructor: 55
      },
      experience: {
        totalTime: 185,
        poweredTime: 185,
        airplaneTime: 172,
        aselTime: 172,
        amelTime: 0,
        helicopterTime: 0,
        picTotal: 92,
        picAirplane: 88,
        picAsel: 88,
        picHelicopter: 0,
        xcPicTotal: 42,
        xcPicAirplane: 36,
        instrumentTime: 28,
        instrumentAirplane: 22,
        cfiiAirplane: 0,
        nightTime: 14,
        dualAsel: 48,
        soloAsel: 54,
        commercialTrainingAsel: 8,
        soloPdpicAsel: 3,
        complexTaaTurbine: 4,
        prepRecent: 1
      },
      events: {
        commercialDayXc: true,
        commercialComplexTaa: false,
        commercialInstrument: false,
        commercialLongXc: false,
        commercialNightTowered: false,
        commercialNightXc: false,
        commercialPrep: false
      }
    },
    {
      name: "Military-only B-52 style 61.73 gate",
      credentials: ["military-pilot"],
      targets: ["commercial-asel-add-class"],
      flags: {
        militaryExperience: true,
        militaryOnly: true,
        faaCommercialAmel: false,
        priorFaa: false
      },
      rates: {
        aircraftWet: 185,
        instructor: 45
      },
      experience: {
        totalTime: 1800,
        poweredTime: 1800,
        airplaneTime: 0,
        aselTime: 0,
        amelTime: 0,
        helicopterTime: 0,
        picTotal: 900,
        picAirplane: 0,
        picAsel: 0,
        picHelicopter: 0,
        xcPicTotal: 500,
        xcPicAirplane: 0,
        instrumentTime: 350,
        instrumentAirplane: 0,
        cfiiAirplane: 0,
        nightTime: 220,
        dualAsel: 0,
        soloAsel: 0,
        commercialTrainingAsel: 0,
        soloPdpicAsel: 0,
        complexTaaTurbine: 0,
        prepRecent: 0
      },
      events: {}
    }
  ];

  function credentialLabel(id) {
    const found = RULES.CREDENTIAL_OPTIONS.find((item) => item.id === id);
    return found ? found.label : id;
  }

  function targetLabel(id) {
    const found = RULES.TARGET_OPTIONS.find((item) => item.id === id);
    return found ? found.label : id;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function linkifyCfrText(value, options) {
    if (window.CfrLinks && typeof window.CfrLinks.linkifyCfrText === "function") {
      return window.CfrLinks.linkifyCfrText(value, options);
    }
    return escapeHtml(value ?? "");
  }

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
    ids.rateSummary.innerHTML = `
      <span>Dual rate: ${money(rates.dual)}/hr</span>
      <span>Solo/PDPIC/time-building: ${money(rates.solo)}/hr</span>
    `;
  }

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
    stats.groups.forEach((group) => {
      const badge = qs(`[data-group-completion="${groupSlug(group.title)}"]`);
      if (!badge) return;
      const complete = group.filled === group.total;
      badge.textContent = `${group.filled}/${group.total}`;
      badge.classList.toggle("complete", complete);
      badge.classList.toggle("incomplete", !complete);
      badge.setAttribute("aria-label", `${group.title}: ${group.filled} of ${group.total} fields complete`);
    });
  }

  function numericValue(value) {
    return typeof value === "number" && Number.isFinite(value) ? value : null;
  }

  function dashboardMetric(label, value, tone) {
    return `
      <div class="dashboard-card dashboard-${tone || "slate"}">
        <span>${escapeHtml(label)}</span>
        <b>${escapeHtml(value)}</b>
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
        return `<button type="button" class="option-button ${selected ? "selected" : ""}" data-credential="${escapeHtml(item.id)}">${escapeHtml(item.label)}</button>`;
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
    ids.experienceFields.innerHTML = RULES.FIELD_GROUPS.map((group) => `
      <div class="field-group">
        <div class="field-group-heading">
          <h3>${escapeHtml(group.title)}</h3>
          <span class="group-completion" data-group-completion="${escapeHtml(groupSlug(group.title))}">0/${group.fields.length}</span>
        </div>
        <div class="field-grid">
          ${group.fields.map(([key, label]) => `
            <label class="number-field">
              <span>${escapeHtml(label)}</span>
              <input type="number" min="0" step="0.1" inputmode="decimal" data-experience="${escapeHtml(key)}" placeholder="UNKNOWN">
            </label>
          `).join("")}
        </div>
      </div>
    `).join("");
  }

  function renderEvents() {
    ids.eventChecklist.innerHTML = RULES.EVENT_OPTIONS.map((event) => `
      <label class="check-row">
        <input type="checkbox" data-event="${escapeHtml(event.id)}">
        <span>${escapeHtml(event.label)}</span>
      </label>
    `).join("");
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
  }

  function setFlags(values) {
    ["militaryExperience", "militaryOnly", "faaCommercialAmel", "priorFaa"].forEach((key) => {
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
    return Boolean(input.offsetParent || input.getClientRects().length);
  }

  function validateRequiredInputs(focusFirst) {
    const missingExperience = [];
    const invalidRates = [];
    qsa("[data-experience]").forEach((input) => {
      if (!fieldIsVisible(input)) return;
      const missing = input.value.trim() === "";
      setInvalid(input, missing);
      if (missing) missingExperience.push(input);
    });
    qsa("[data-rate]").forEach((input) => {
      if (!fieldIsVisible(input)) return;
      const invalid = parseRate(input.value) === null;
      setInvalid(input, invalid);
      if (invalid) invalidRates.push(input);
    });

    const invalid = missingExperience.length || invalidRates.length;
    if (invalid) {
      const messages = [];
      if (missingExperience.length) {
        const groups = missingFieldsByGroup(missingExperience)
          .map((group) => `${group.title}: ${group.missing.join(", ")}`)
          .join("; ");
        messages.push(`Missing Flight Experience: ${groups}. Use 0 if not applicable or none logged.`);
      }
      if (invalidRates.length) {
        messages.push("Missing Cost Assumptions: enter non-negative wet and instructor rates.");
      }
      ids.validationMessage.textContent = messages.join(" ");
      ids.validationMessage.hidden = false;
      updateInputCompleteness();
      if (focusFirst) {
        const first = missingExperience[0] || invalidRates[0];
        first.scrollIntoView({ behavior: "smooth", block: "center" });
        first.focus({ preventScroll: true });
      }
      return false;
    }
    ids.validationMessage.textContent = "";
    ids.validationMessage.hidden = true;
    updateInputCompleteness();
    return true;
  }

  function clearValidation() {
    qsa("[data-experience], [data-rate]").forEach((input) => setInvalid(input, false));
    ids.validationMessage.textContent = "";
    ids.validationMessage.hidden = true;
    updateInputCompleteness();
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
      flags: {
        militaryExperience: byId("militaryExperience").checked,
        militaryOnly: byId("militaryOnly").checked,
        faaCommercialAmel: byId("faaCommercialAmel").checked,
        priorFaa: byId("priorFaa").checked
      },
      rates: currentRates(),
      experience,
      events,
      targets: state.targets.slice()
    };
  }

  function renderSummary(audits) {
    ids.summary.innerHTML = audits.map((audit) => `
      <div class="summary-block">
        <h4>${escapeHtml(audit.title)}</h4>
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
      ? `<ul class="list-box">${result.combined.notes.map((note) => `<li>${escapeHtml(note)}</li>`).join("")}</ul>`
      : "";
    ids.combinedSummary.innerHTML = `
      <p><b>Rates used:</b> wet ${money(rates.aircraftWet)}/hr, instructor ${money(rates.instructor)}/hr, dual ${money(rates.dual)}/hr.</p>
      <p><b>Combined optimized planning total:</b> ${hours(result.combined.optimizedHours)}. <b>Combined estimated cost:</b> ${money(result.combined.estimatedCost)}.</p>
      ${notes}
    `;
  }

  function sumIfKnown(values) {
    if (!values.every((value) => typeof value === "number")) return "UNKNOWN";
    return values.reduce((sum, value) => sum + value, 0);
  }

  function renderAuditDashboard(result) {
    const blockers = blockerList(result);
    const rawTotal = sumIfKnown(result.audits.map((audit) => numericValue(audit.summary.rawRequirementSum)));
    const optimized = result.combined.optimizedHours;
    const cost = result.combined.estimatedCost;
    const firstVerdict = result.audits[0] ? result.audits[0].verdict : "No route generated.";
    const routeTone = blockers.length ? "red" : "green";
    ids.auditDashboard.innerHTML = [
      dashboardMetric("Verdict", blockers.length ? "Needs missing inputs" : "Draft ready", routeTone),
      dashboardMetric("Legal Route", stageTitles(result) || "UNKNOWN", "slate"),
      dashboardMetric("Raw Sum", hours(rawTotal), "amber"),
      dashboardMetric("Optimized Total", hours(optimized), optimized === "UNKNOWN" ? "red" : "green"),
      dashboardMetric("Estimated Cost", money(cost), cost === "UNKNOWN" ? "red" : "amber"),
      dashboardMetric("Blockers", blockers.length ? `${blockers.length} item(s)` : "None", blockers.length ? "red" : "green"),
      dashboardMetric("Next Action", firstNextAction(result), blockers.length ? "red" : "blue"),
      dashboardMetric("Source Review", result.sourceReviewDate, "slate")
    ].join("");
    ids.cfiReadout.textContent = `${firstVerdict}\n\n${cfiReadoutText(result)}`;
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
          <h4>${escapeHtml(audit.title)}</h4>
          <div class="counts-stats">
            <span class="status-pill status-complete">${satisfied} satisfied</span>
            <span class="status-pill status-remaining">${remaining} remaining</span>
            <span class="status-pill status-missing">${missing} missing</span>
          </div>
          <div class="counts-columns">
            <div>
              <b>What can count</b>
              <ul>${(broad.length ? broad : rows.slice(0, 3)).map((row) => `<li>${escapeHtml(row.requirement)}: ${escapeHtml(row.why)}</li>`).join("")}</ul>
            </div>
            <div>
              <b>What does not / guardrails</b>
              <ul>${(guardrails.length ? guardrails : rows.filter((row) => row.status !== "satisfied").slice(0, 3)).map((row) => `<li>${escapeHtml(row.requirement)}: ${escapeHtml(row.overlapLogic || row.why)}</li>`).join("")}</ul>
            </div>
          </div>
        </article>
      `;
    });
    ids.counts.innerHTML = countRows.join("");
  }

  function chipListFromText(text, tone) {
    return String(text || "")
      .split(/,\s*|\s+-\s+|;/)
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 6)
      .map((item) => `<span class="data-tag tag-${escapeHtml(tone || "broad")}">${escapeHtml(item)}</span>`)
      .join("");
  }

  function renderOverlapMap(result) {
    ids.overlapMap.innerHTML = result.audits.map((audit) => {
      const raw = numericValue(audit.summary.rawRequirementSum);
      const optimized = numericValue(audit.summary.optimizedCombinedTotal);
      const max = raw || optimized || 1;
      const optimizedPct = optimized ? Math.max(8, Math.min(100, (optimized / max) * 100)) : 0;
      const saved = raw !== null && optimized !== null ? Math.max(0, raw - optimized) : "UNKNOWN";
      const blocks = audit.trainingPlan.length ? audit.trainingPlan.map((block) => `
        <div class="overlap-block block-${escapeHtml(block.blockType || "broad")}">
          <div>
            <b>${escapeHtml(block.block)}</b>
            <span>${escapeHtml(block.mode)} | ${hours(block.hours)} | ${money(block.cost)}</span>
          </div>
          <div class="chip-line">${chipListFromText(block.cfrRows, block.blockType || "broad")}</div>
        </div>
      `).join("") : `<div class="empty-state">No fixed flight-hour blocks. Use the proficiency formula and gates.</div>`;
      return `
        <article class="overlap-card">
          <div class="overlap-head">
            <h4>${escapeHtml(audit.title)}</h4>
            <span>${raw !== null && optimized !== null ? `${saved.toFixed(1)} hr combined away from raw sum` : "Overlap depends on missing inputs or proficiency"}</span>
          </div>
          <div class="overlap-bars" aria-label="Raw versus optimized hours for ${escapeHtml(audit.title)}">
            <div class="bar-row raw"><span>Raw</span><div><i style="width:100%"></i></div><b>${hours(audit.summary.rawRequirementSum)}</b></div>
            <div class="bar-row optimized"><span>Optimized</span><div><i style="width:${optimizedPct}%"></i></div><b>${hours(audit.summary.optimizedCombinedTotal)}</b></div>
          </div>
          <div class="overlap-blocks">${blocks}</div>
        </article>
      `;
    }).join("");
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
                ${columns.map((column) => `<td class="${cellClass(row, column.key)}">${formatCell(row[column.key], column.key, row)}</td>`).join("")}
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

  function formatCell(value, key, row) {
    const tags = key === "requirement" || key === "block" ? tagMarkup(row) : "";
    const linkKeys = new Set(["cfr", "cfrBasis", "source", "cfrRows"]);
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
    return `${escapeHtml(value ?? "")}${tags}`;
  }

  function updateFilterButtons() {
    qsa("[data-filter]").forEach((button) => {
      const active = button.dataset.filter === state.activeFilter;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function ledgerRowsForFilter(audit) {
    if (state.activeFilter === "remaining") {
      return audit.rows.filter((row) => row.status === "remaining" || row.status === "missing" || row.kind === "total");
    }
    if (state.activeFilter === "events") return audit.events;
    return audit.rows;
  }

  function renderLedger(audits) {
    updateFilterButtons();
    if (state.activeFilter === "endorsements") {
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
    if (state.activeFilter === "paperwork") {
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
      <h4>${escapeHtml(audit.title)}</h4>
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

  function renderEventsTable(audits) {
    const rows = audits.flatMap((audit) => audit.events.map((event) => ({ stage: audit.title, ...event })));
    ids.events.innerHTML = table([
      { key: "stage", label: "Stage" },
      { key: "cfr", label: "CFR" },
      { key: "requirement", label: "Required Event" },
      { key: "remaining", label: "Remaining" },
      { key: "overlapLogic", label: "Overlap Logic" }
    ], rows);
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
      ? `<ul class="list-box">${unknowns.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
      : `<div class="empty-state status-good">No blocking unknowns for the generated math.</div>`;
  }

  function renderLinks(audits) {
    const map = new Map();
    audits.flatMap((audit) => audit.links).forEach((link) => map.set(link.url, link));
    ids.links.innerHTML = `<ul class="list-box">${Array.from(map.values()).map((link) => `<li><a href="${escapeHtml(link.url)}" target="_blank" rel="noreferrer">${escapeHtml(link.label)}</a></li>`).join("")}</ul>`;
  }

  function calculateAndRender() {
    state.validationAttempted = true;
    if (!validateRequiredInputs(true)) return;
    state.result = CORE.calculateAudit(collectInput());
    state.activeFilter = "all";
    renderResults(state.result);
  }

  function renderResults(result) {
    const audits = result.audits;
    ids.resultTitle.textContent = audits.map((audit) => audit.title).join(" -> ");
    ids.sourceReview.textContent = `Source review date: ${result.sourceReviewDate}`;
    updateInputCompleteness();
    renderAuditDashboard(result);
    ids.verdict.innerHTML = audits.map((audit, index) => `<p><b>Stage ${index + 1}: ${escapeHtml(audit.title)}.</b> ${linkifyCfrText(audit.verdict, { linkBare: true })}</p>`).join("");
    renderSummary(audits);
    renderCombined(result);
    renderCounts(audits);
    renderOverlapMap(result);
    renderLedger(audits);
    renderEventsTable(audits);
    renderTraining(audits);
    renderGates(audits);
    renderEndorsements(audits);
    renderUnknowns(audits);
    renderLinks(audits);
    ids.ledgerDetails.open = false;
  }

  function applyScenario(scenario) {
    state.credentials = scenario.credentials.slice();
    state.targets = scenario.targets.slice();
    ids.credentialSearch.value = "";
    setFlags(scenario.flags);
    setExperience(scenario.experience);
    setRates(scenario.rates);
    setEvents(scenario.events || {});
    clearValidation();
    rerenderStaticControls();
    calculateAndRender();
  }

  function loadExample() {
    applyScenario(ROTORCRAFT_EXAMPLE);
  }

  function loadRandomSample() {
    let nextIndex = Math.floor(Math.random() * SAMPLE_SCENARIOS.length);
    if (SAMPLE_SCENARIOS.length > 1 && nextIndex === state.lastSampleIndex) {
      nextIndex = (nextIndex + 1) % SAMPLE_SCENARIOS.length;
    }
    state.lastSampleIndex = nextIndex;
    applyScenario(SAMPLE_SCENARIOS[nextIndex]);
  }

  function clearAll() {
    state.credentials = [];
    state.targets = ["private-asel"];
    state.validationAttempted = false;
    state.result = null;
    state.lastSampleIndex = null;
    ids.credentialSearch.value = "";
    setFlags({});
    setExperience({});
    setRates({
      aircraftWet: RULES.DEFAULT_RATES.aircraftWet,
      instructor: RULES.DEFAULT_RATES.instructor
    });
    setEvents({});
    clearValidation();
    rerenderStaticControls();
    state.activeFilter = "all";
    ids.resultTitle.textContent = "Ready for a scenario";
    ids.inputCompleteness.textContent = `Input completeness: 0/${flatFieldList().length} hour fields complete`;
    ids.auditDashboard.innerHTML = "";
    ids.cfiReadout.textContent = "Select the pilot's current credentials, enter known hours, choose the target path, then calculate.";
    ids.verdict.textContent = "Select the pilot's current credentials, enter known hours, choose the target path, then calculate.";
    ["summary", "combinedSummary", "counts", "overlapMap", "ledger", "events", "training", "gates", "endorsements", "unknowns", "links"].forEach((key) => {
      ids[key].innerHTML = "";
    });
    ids.ledgerDetails.open = false;
  }

  function reportText() {
    if (!state.result) return "No report generated yet.";
    const rates = state.result.combined.rates || currentRates();
    const header = [
      `Rates used: wet ${money(rates.aircraftWet)}/hr; instructor ${money(rates.instructor)}/hr; dual ${money(rates.dual)}/hr; solo/PDPIC/time-building ${money(rates.solo)}/hr.`,
      "Validation assumption: zeros mean not applicable or none logged; blanks are not accepted in the browser UI."
    ].join("\n");
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

  async function copyTextToClipboard(text, button, resetLabel) {
    try {
      await navigator.clipboard.writeText(text);
      button.textContent = "Copied";
      setTimeout(() => { button.textContent = resetLabel; }, 1200);
    } catch (error) {
      const area = document.createElement("textarea");
      area.value = text;
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
      button.textContent = "Copied";
      setTimeout(() => { button.textContent = resetLabel; }, 1200);
    }
  }

  function copyReport() {
    copyTextToClipboard(reportText(), ids.copyBtn, "Copy Report");
  }

  function copyCfiReadout() {
    copyTextToClipboard(cfiReadoutText(state.result), ids.copyCfiBtn, "Copy CFI Readout");
  }

  function copyStudentChecklist() {
    copyTextToClipboard(studentChecklistText(state.result), ids.copyChecklistBtn, "Copy Student Checklist");
  }

  function rerenderStaticControls() {
    renderCredentialOptions();
    renderSelectedCredentials();
    renderStages();
  }

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
    });

    ids.selectedCredentials.addEventListener("click", (event) => {
      const button = event.target.closest("[data-remove-credential]");
      if (!button) return;
      state.credentials = state.credentials.filter((item) => item !== button.dataset.removeCredential);
      rerenderStaticControls();
    });

    ids.targetStages.addEventListener("change", (event) => {
      const select = event.target.closest("[data-stage-index]");
      if (!select) return;
      state.targets[Number(select.dataset.stageIndex)] = select.value;
    });

    ids.targetStages.addEventListener("click", (event) => {
      const button = event.target.closest("[data-remove-stage]");
      if (!button) return;
      state.targets.splice(Number(button.dataset.removeStage), 1);
      if (!state.targets.length) state.targets.push("private-asel");
      renderStages();
    });

    ids.addStageBtn.addEventListener("click", () => {
      state.targets.push("commercial-asel");
      renderStages();
    });

    ids.calculateBtn.addEventListener("click", calculateAndRender);
    rootEl.addEventListener("input", (event) => {
      if (event.target.matches("[data-experience], [data-rate]")) {
        if (event.target.matches("[data-rate]")) updateRateSummary();
        if (event.target.matches("[data-experience]")) updateInputCompleteness();
        if (state.validationAttempted) validateRequiredInputs(false);
      }
    });
    ids.loadExampleBtn.addEventListener("click", loadExample);
    ids.randomSampleBtn.addEventListener("click", loadRandomSample);
    ids.clearBtn.addEventListener("click", clearAll);
    ids.copyBtn.addEventListener("click", copyReport);
    ids.copyCfiBtn.addEventListener("click", copyCfiReadout);
    ids.copyChecklistBtn.addEventListener("click", copyStudentChecklist);
    ids.printBtn.addEventListener("click", () => window.print());
    ids.clearEventsBtn.addEventListener("click", () => setEvents({}));
    qsa("[data-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        state.activeFilter = button.dataset.filter;
        if (state.result) renderLedger(state.result.audits);
      });
    });
  }

  function init() {
    renderExperienceFields();
    renderEvents();
    setRates(state.rates);
    rerenderStaticControls();
    bindEvents();
    updateInputCompleteness();
    ids.sourceReview.textContent = `Source review date: ${RULES.REVIEW_DATE}`;
  }

  init();
})();
