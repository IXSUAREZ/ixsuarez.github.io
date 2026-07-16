(function () {
  "use strict";

  var QUESTION_BANK = window.FRAT_QUESTIONS;
  var RISK = window.FRAT_RISK;

  if (!QUESTION_BANK || !RISK) {
    document.body.innerHTML = "<p class=\"noscript-message\">The assessment could not load. Refresh the page or try again later.</p>";
    return;
  }

  var STORAGE_KEY = "suarez-cfi-frat-draft-v1";
  var IS_DEMO = new URLSearchParams(window.location.search).get("demo") === "high";
  var QUESTION_INDEX = QUESTION_BANK.QUESTIONS.reduce(function (index, question) {
    index[question.id] = question;
    return index;
  }, Object.create(null));

  var STEP_COPY = {
    profile: {
      label: "Profile",
      title: "Build your flight profile",
      description: "Set the operation, pilot context, and experience that apply to this flight."
    },
    pilot: {
      label: "Pilot",
      title: "Check pilot readiness",
      description: "Review eligibility, proficiency, recency, and IMSAFE before evaluating the airplane or weather."
    },
    aircraft: {
      label: "Aircraft",
      title: "Confirm the aircraft and margins",
      description: "Check airworthiness, equipment, loading, performance, fuel, and the limits that apply to this airplane."
    },
    environment: {
      label: "Environment",
      title: "Environment",
      description: "Enter forecast conditions for your route and compare them with your written personal minimums."
    },
    external: {
      label: "External pressures",
      title: "Make pressure visible",
      description: "Identify schedule, passenger, workload, and continuation pressures before they distort the decision."
    },
    review: {
      label: "Review",
      title: "Review the whole flight",
      description: "Use the risk vector and top drivers to change the plan, discuss the flight, or make a no-go decision."
    }
  };

  var GROUP_META = {
    profile_operation: {
      title: "Operation",
      description: "Describe the specific flight you are assessing."
    },
    pilot_readiness: {
      title: "Eligibility and proficiency",
      description: "Currency is the floor; proficiency and familiarity still matter."
    },
    pilot_imsafe: {
      title: "IMSAFE",
      description: "Assess fitness without recording medical diagnoses, medications, or personal details."
    },
    pilot_limits: {
      title: "Personal minimums",
      description: "Written limits should be set before the pressure of a specific flight."
    },
    pilot_ifr: {
      title: "IFR readiness",
      description: "These questions apply to the intended PIC for this IFR operation."
    },
    aircraft_ready: {
      title: "Airworthiness and performance",
      description: "Confirm the actual aircraft, loading, equipment, and operating limitations."
    },
    aircraft_margin: {
      title: "Fuel and runway margins",
      description: "Compare the plan with written personal margins after completing the real calculations."
    },
    aircraft_specific: {
      title: "Operation-specific equipment",
      description: "Additional equipment questions appear for night and IFR operations."
    },
    environment_info: {
      title: "Current information",
      description: "Use official, current weather, NOTAM, airport, runway, airspace, and route information."
    },
    environment_weather: {
      title: "Weather hazards",
      description: "Identify trends and hazards that can compress your options or margins."
    },
    environment_route: {
      title: "Route and airports",
      description: "Review terrain, runway conditions, airport familiarity, and diversion options."
    },
    environment_wind: {
      title: "Wind limits",
      description: "Compare forecast or observed values with the limits you wrote before this flight."
    },
    environment_night: {
      title: "Night environment",
      description: "Night-specific visual and lighting factors."
    },
    environment_lighting: {
      title: "Lighting and visual aids",
      description: "Confirm the airport lighting, approach aids, and visual guidance needed for this plan."
    },
    environment_vfr: {
      title: "VFR conditions and escape options",
      description: "Legal VFR is not the same as comfortable VFR; use your written ceiling and visibility minimums."
    },
    environment_ifr: {
      title: "IFR plan and approach margins",
      description: "Check the route, alternate, approach, and personal margins for the expected conditions."
    },
    external_pressure: {
      title: "Pressure",
      description: "Name the forces that could make delaying, diverting, or cancelling feel harder."
    },
    external_options: {
      title: "Options and workload",
      description: "Build practical alternatives and clear roles before the flight begins."
    },
    additional: {
      title: "Additional factors",
      description: "Complete the remaining factors that apply to this flight."
    }
  };

  var els = {
    stepper: document.getElementById("stepper"),
    stepEyebrow: document.getElementById("stepEyebrow"),
    stepTitle: document.getElementById("stepTitle"),
    stepDescription: document.getElementById("stepDescription"),
    stepFields: document.getElementById("stepFields"),
    formErrors: document.getElementById("formErrors"),
    credentialNote: document.getElementById("credentialNote"),
    backButton: document.getElementById("backButton"),
    nextButton: document.getElementById("nextButton"),
    riskPanel: document.getElementById("riskPanel"),
    overallRisk: document.getElementById("overallRisk"),
    overallRiskIcon: document.getElementById("overallRiskIcon"),
    overallRiskLabel: document.getElementById("overallRiskLabel"),
    overallRiskGuidance: document.getElementById("overallRiskGuidance"),
    riskVector: document.getElementById("riskVector"),
    riskMatrix: document.getElementById("riskMatrix"),
    progressLabel: document.getElementById("progressLabel"),
    progressTrack: document.getElementById("progressTrack"),
    progressFill: document.getElementById("progressFill"),
    driverList: document.getElementById("driverList"),
    mitigationsButton: document.getElementById("mitigationsButton"),
    saveButton: document.getElementById("saveButton"),
    resetButton: document.getElementById("resetButton"),
    draftStatus: document.getElementById("draftStatus"),
    mitigationDialog: document.getElementById("mitigationDialog"),
    mitigationList: document.getElementById("mitigationList"),
    reassessButton: document.getElementById("reassessButton"),
    riskHelpButton: document.getElementById("riskHelpButton"),
    riskHelpDialog: document.getElementById("riskHelpDialog"),
    mobileRiskBar: document.getElementById("mobileRiskBar"),
    toast: document.getElementById("toast"),
    certificateLevel: document.getElementById("certificateLevel"),
    ratingStatus: document.getElementById("ratingStatus"),
    totalPicHours: document.getElementById("totalPicHours"),
    recentHours: document.getElementById("recentHours"),
    assessmentMain: document.getElementById("assessmentMain")
  };

  var state = IS_DEMO ? createDemoAssessment() : loadAssessment();
  var currentStep = Math.max(0, Math.min(
    QUESTION_BANK.STEPS.length - 1,
    Number(state.ui && state.ui.currentStep) || 0
  ));
  var result = null;
  var saveTimer = null;
  var toastTimer = null;

  ensureState();
  if (IS_DEMO) {
    els.draftStatus.textContent = "Preview scenario";
    els.saveButton.disabled = true;
    els.saveButton.setAttribute("aria-label", "Preview mode does not change your saved draft");
  } else if (hasStoredDraft()) {
    els.draftStatus.textContent = "Saved on this device";
  }
  bindEvents();
  render();

  function createInitialAssessment() {
    var initial = QUESTION_BANK.createDefaultAssessment("student");
    initial.profile.qualificationSelection = "none";
    initial.operation.rules = "VFR";
    initial.operation.studentSolo = null;
    initial.operation.trainingFlight = null;
    initial.operation.passengers = null;
    initial.operation.approachPlanned = null;
    initial.experience = {
      totalPIC: 0,
      recent90: 0
    };
    initial.ui = {
      currentStep: 0
    };
    return initial;
  }

  function ensureState() {
    state = state && typeof state === "object" ? state : createInitialAssessment();
    state.profile = state.profile || {};
    state.profile.ratings = state.profile.ratings || {};
    state.profile.roles = state.profile.roles || {};
    if (!state.profile.qualificationSelection) {
      state.profile.qualificationSelection = deriveQualificationSelection(
        Boolean(state.profile.ratings.instrument),
        Boolean(state.profile.roles.cfi)
      );
    }
    state.operation = state.operation || {};
    state.answers = state.answers || {};
    state.experience = state.experience || { totalPIC: 0, recent90: 0 };
    state.mitigationHistory = state.mitigationHistory || [];
    state.ui = state.ui || { currentStep: currentStep || 0 };
  }

  function loadAssessment() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        var parsed = JSON.parse(saved);
        if (parsed && parsed.version === 1) {
          return parsed;
        }
      }
    } catch (error) {
      console.warn("Unable to restore local FRAT draft.", error);
    }
    return createInitialAssessment();
  }

  function hasStoredDraft() {
    try {
      return Boolean(localStorage.getItem(STORAGE_KEY));
    } catch (error) {
      return false;
    }
  }

  function createDemoAssessment() {
    var demo = createInitialAssessment();
    demo.operation.rules = "VFR";
    demo.operation.dayNight = "day";
    demo.operation.intendedPIC = true;
    demo.operation.studentSolo = false;
    demo.operation.trainingFlight = true;
    demo.operation.passengers = false;
    demo.operation.approachPlanned = false;
    demo.experience.totalPIC = 42;
    demo.experience.recent90 = 9;
    demo.ui.currentStep = 3;

    for (var pass = 0; pass < 4; pass += 1) {
      RISK.applicableQuestions(demo, QUESTION_BANK.QUESTIONS).forEach(function (question) {
        if (!isBlank(questionValue(demo, question))) {
          return;
        }

        if (question.type === "boolean") {
          var trueByDefault = [
            "intended_pic",
            "training_flight"
          ].indexOf(question.id) !== -1;
          setQuestionValue(demo, question, trueByDefault);
          return;
        }

        if (question.type === "number") {
          setQuestionValue(demo, question, 10);
          return;
        }

        if (question.options) {
          var safeOption = question.options.find(function (candidate) {
            var rule = question.riskByValue && question.riskByValue[String(candidate.value)];
            if (!rule || rule.hardStop) {
              return false;
            }
            return RISK.matrixLevel(rule.likelihood, rule.severity) === RISK.LEVELS.LOW;
          });
          setQuestionValue(demo, question, safeOption ? safeOption.value : question.options[0].value);
        }
      });
    }

    setDemoValue(demo, "personal_fuel_reserve_minutes", 45);
    setDemoValue(demo, "planned_fuel_reserve_minutes", 60);
    setDemoValue(demo, "personal_runway_minimum_ft", 2500);
    setDemoValue(demo, "available_runway_length_ft", 5000);
    setDemoValue(demo, "personal_surface_wind_max_kt", 20);
    setDemoValue(demo, "forecast_surface_wind_max_kt", 12);
    setDemoValue(demo, "personal_gust_spread_max_kt", 10);
    setDemoValue(demo, "forecast_gust_spread_max_kt", 5);
    setDemoValue(demo, "personal_crosswind_max_kt", 8);
    setDemoValue(demo, "forecast_crosswind_max_kt", 11);
    setDemoValue(demo, "personal_vfr_ceiling_min_ft", 3000);
    setDemoValue(demo, "forecast_vfr_ceiling_min_ft", 3500);
    setDemoValue(demo, "personal_vfr_visibility_min_sm", 6);
    setDemoValue(demo, "forecast_vfr_visibility_min_sm", 8);
    setDemoValue(demo, "schedule_pressure", "manageable");
    setDemoValue(demo, "airport_familiarity", "reviewed");
    return demo;
  }

  function setDemoValue(target, id, value) {
    if (QUESTION_INDEX[id]) {
      setQuestionValue(target, QUESTION_INDEX[id], value);
    }
  }

  function bindEvents() {
    document.querySelectorAll("input[name=\"flightRules\"]").forEach(function (radio) {
      radio.addEventListener("change", function () {
        if (!radio.checked) {
          return;
        }
        setQuestionValue(state, QUESTION_INDEX.flight_rules, radio.value.toUpperCase());
        if (radio.value === "vfr") {
          setQuestionValue(state, QUESTION_INDEX.approach_planned, false);
        }
        stateChanged();
      });
    });

    els.certificateLevel.addEventListener("change", function () {
      setQuestionValue(state, QUESTION_INDEX.certificate_level, els.certificateLevel.value);
      normalizeCredentialCombination();
      stateChanged();
    });

    els.ratingStatus.addEventListener("change", function () {
      applyRatingSelection(els.ratingStatus.value);
      stateChanged();
    });

    els.totalPicHours.addEventListener("input", function () {
      state.experience.totalPIC = numberOrZero(els.totalPicHours.value);
      updateExperienceSummary();
      scheduleSave();
    });

    els.recentHours.addEventListener("input", function () {
      state.experience.recent90 = numberOrZero(els.recentHours.value);
      updateExperienceSummary();
      scheduleSave();
    });

    els.stepFields.addEventListener("change", function (event) {
      var control = event.target.closest("[data-question-id]");
      if (!control) {
        return;
      }
      var question = QUESTION_INDEX[control.dataset.questionId];
      if (!question) {
        return;
      }
      setQuestionValue(state, question, parseControlValue(control, question));
      clearErrors();
      stateChanged();
    });

    els.stepFields.addEventListener("input", function (event) {
      var control = event.target.closest("input[type=\"number\"][data-question-id]");
      if (!control) {
        return;
      }
      var question = QUESTION_INDEX[control.dataset.questionId];
      if (!question) {
        return;
      }

      setQuestionValue(state, question, parseControlValue(control, question));
      result = RISK.assessAssessment(state, QUESTION_BANK.QUESTIONS);
      if (control.value !== "" && !control.checkValidity()) {
        control.setAttribute("aria-invalid", "true");
      } else {
        control.removeAttribute("aria-invalid");
      }
      clearErrors();
      renderRiskPicture();
      refreshComparisonCard(control);
      scheduleSave();
    });

    els.stepFields.addEventListener("click", function (event) {
      var action = event.target.closest("[data-review-action]");
      if (!action) {
        return;
      }
      if (action.dataset.reviewAction === "print") {
        window.print();
      } else if (action.dataset.reviewAction === "copy") {
        copySummary();
      } else if (action.dataset.reviewAction === "missing") {
        goToFirstMissing();
      } else if (action.dataset.reviewAction === "mitigate") {
        openMitigations();
      }
    });

    els.backButton.addEventListener("click", function () {
      navigateTo(currentStep - 1, false);
    });

    els.nextButton.addEventListener("click", function () {
      if (!validateCurrentStep()) {
        return;
      }
      navigateTo(currentStep + 1, false);
    });

    els.stepper.addEventListener("click", function (event) {
      var button = event.target.closest("[data-step-index]");
      if (button) {
        navigateTo(Number(button.dataset.stepIndex), false);
      }
    });

    els.saveButton.addEventListener("click", function () {
      saveAssessment(true);
    });

    els.resetButton.addEventListener("click", resetAssessment);
    els.mitigationsButton.addEventListener("click", openMitigations);
    els.reassessButton.addEventListener("click", applyMitigationChanges);
    els.riskHelpButton.addEventListener("click", function () {
      els.riskHelpDialog.showModal();
    });

    els.mobileRiskBar.addEventListener("click", function () {
      els.riskPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    document.querySelectorAll("[data-close-dialog]").forEach(function (button) {
      button.addEventListener("click", function () {
        var dialog = document.getElementById(button.dataset.closeDialog);
        if (dialog) {
          dialog.close();
        }
      });
    });

    [els.mitigationDialog, els.riskHelpDialog].forEach(function (dialog) {
      dialog.addEventListener("click", function (event) {
        if (event.target === dialog) {
          dialog.close();
        }
      });
    });
  }

  function render() {
    ensureState();
    result = RISK.assessAssessment(state, QUESTION_BANK.QUESTIONS);
    syncHeaderControls();
    renderStepper();
    renderCurrentStep();
    renderRiskPicture();
  }

  function syncHeaderControls() {
    var rules = questionValue(state, QUESTION_INDEX.flight_rules) || "VFR";
    document.querySelectorAll("input[name=\"flightRules\"]").forEach(function (radio) {
      radio.checked = radio.value.toUpperCase() === rules;
    });

    var certificate = questionValue(state, QUESTION_INDEX.certificate_level) || "student";
    els.certificateLevel.value = certificate;

    var instrument = Boolean(questionValue(state, QUESTION_INDEX.instrument_rating));
    var cfi = Boolean(questionValue(state, QUESTION_INDEX.cfi_role));
    var selection = state.profile.qualificationSelection;
    var selectionFlags = qualificationFlags(selection);
    if (!selectionFlags || selectionFlags.instrument !== instrument || selectionFlags.cfi !== cfi) {
      selection = deriveQualificationSelection(instrument, cfi);
      state.profile.qualificationSelection = selection;
    }
    els.ratingStatus.value = selection;

    var cfiEligible = certificate === "commercial" || certificate === "atp";
    var instrumentEligible = certificate !== "student";
    setOptionDisabled(els.ratingStatus, "instrument", !instrumentEligible);
    setOptionDisabled(els.ratingStatus, "cfi", !cfiEligible);
    setOptionDisabled(els.ratingStatus, "cfi_instrument", !cfiEligible);
    setOptionDisabled(els.ratingStatus, "cfii", !cfiEligible);

    els.totalPicHours.value = numberOrZero(state.experience.totalPIC);
    els.recentHours.value = numberOrZero(state.experience.recent90);
  }

  function setOptionDisabled(select, value, disabled) {
    var option = Array.from(select.options).find(function (candidate) {
      return candidate.value === value;
    });
    if (option) {
      option.disabled = disabled;
    }
  }

  function qualificationFlags(value) {
    var flags = {
      none: { instrument: false, cfi: false },
      instrument: { instrument: true, cfi: false },
      cfi: { instrument: false, cfi: true },
      cfi_instrument: { instrument: true, cfi: true },
      cfii: { instrument: true, cfi: true }
    };
    return flags[value] || null;
  }

  function deriveQualificationSelection(instrument, cfi) {
    if (instrument && cfi) {
      return "cfi_instrument";
    }
    if (cfi) {
      return "cfi";
    }
    return instrument ? "instrument" : "none";
  }

  function normalizeCredentialCombination() {
    var certificate = questionValue(state, QUESTION_INDEX.certificate_level);
    var instrument = Boolean(questionValue(state, QUESTION_INDEX.instrument_rating));
    var cfi = Boolean(questionValue(state, QUESTION_INDEX.cfi_role));

    if (certificate === "student") {
      setQuestionValue(state, QUESTION_INDEX.instrument_rating, false);
      setQuestionValue(state, QUESTION_INDEX.cfi_role, false);
      state.profile.qualificationSelection = "none";
      if (instrument || cfi) {
        showToast("Student profile selected; rating and instructor-role flags were cleared.");
      }
    } else if (certificate === "private" && cfi) {
      setQuestionValue(state, QUESTION_INDEX.cfi_role, false);
      state.profile.qualificationSelection = instrument ? "instrument" : "none";
      showToast("CFI is recorded as an instructor role and requires a commercial or ATP profile here.");
    } else if (certificate === "atp" && !instrument) {
      setQuestionValue(state, QUESTION_INDEX.instrument_rating, true);
      state.profile.qualificationSelection = cfi ? "cfi_instrument" : "instrument";
    } else {
      var currentFlags = qualificationFlags(state.profile.qualificationSelection);
      if (!currentFlags || currentFlags.instrument !== instrument || currentFlags.cfi !== cfi) {
        state.profile.qualificationSelection = deriveQualificationSelection(instrument, cfi);
      }
    }
  }

  function applyRatingSelection(value) {
    var selectedFlags = qualificationFlags(value) || qualificationFlags("none");
    var wantsInstrument = selectedFlags.instrument;
    var wantsCfi = selectedFlags.cfi;
    var certificate = questionValue(state, QUESTION_INDEX.certificate_level);
    var cfiEligible = certificate === "commercial" || certificate === "atp";
    var normalizedSelection = value;

    if (certificate === "student" && value !== "none") {
      wantsInstrument = false;
      wantsCfi = false;
      normalizedSelection = "none";
      showToast("Use None for a student profile; instrument training is captured in the flight details.");
    }

    if (wantsCfi && !cfiEligible) {
      wantsCfi = false;
      normalizedSelection = wantsInstrument ? "instrument" : "none";
      showToast("Choose a commercial or ATP profile before selecting a CFI role.");
    }

    if (certificate === "atp" && !wantsInstrument) {
      wantsInstrument = true;
      normalizedSelection = wantsCfi ? "cfi_instrument" : "instrument";
      showToast("ATP selected; instrument qualification remains part of this profile.");
    }

    setQuestionValue(state, QUESTION_INDEX.instrument_rating, wantsInstrument);
    setQuestionValue(state, QUESTION_INDEX.cfi_role, wantsCfi);
    state.profile.qualificationSelection = normalizedSelection;
  }

  function renderStepper() {
    els.stepper.innerHTML = QUESTION_BANK.STEPS.map(function (step, index) {
      var copy = STEP_COPY[step.id];
      var complete = stepIsComplete(step.id);
      var current = index === currentStep;
      var circleContent = complete
        ? "<span class=\"material-symbols-rounded\" aria-hidden=\"true\">check</span>"
        : String(index + 1);
      return [
        "<button class=\"stepper-item",
        complete ? " is-complete" : "",
        "\" type=\"button\" data-step-index=\"", index, "\"",
        current ? " aria-current=\"step\"" : "",
        " aria-label=\"", escapeHtml(copy.label), complete ? ", complete" : "", "\">",
        "<span class=\"stepper-number\">", circleContent, "</span>",
        "<span class=\"stepper-label\">", escapeHtml(copy.label), "</span>",
        "</button>"
      ].join("");
    }).join("");

    window.requestAnimationFrame(function () {
      var active = els.stepper.querySelector("[aria-current=\"step\"]");
      if (active && window.innerWidth <= 760) {
        active.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    });
  }

  function stepIsComplete(stepId) {
    if (stepId === "review") {
      return result.complete && currentStep === QUESTION_BANK.STEPS.length - 1;
    }
    var applicableIds = RISK.applicableQuestions(state, QUESTION_BANK.QUESTIONS)
      .filter(function (question) { return question.step === stepId; })
      .map(function (question) { return question.id; });
    return applicableIds.length > 0 && !result.missingCritical.some(function (missing) {
      return applicableIds.indexOf(missing.id) !== -1;
    });
  }

  function renderCurrentStep() {
    var step = QUESTION_BANK.STEPS[currentStep];
    var copy = STEP_COPY[step.id];
    els.stepEyebrow.textContent = "Step " + (currentStep + 1) + " of " + QUESTION_BANK.STEPS.length;
    els.stepTitle.textContent = copy.title;
    els.stepDescription.textContent = copy.description;
    els.backButton.disabled = currentStep === 0;
    els.nextButton.hidden = currentStep === QUESTION_BANK.STEPS.length - 1;
    els.nextButton.innerHTML = [
      currentStep === QUESTION_BANK.STEPS.length - 2 ? "Review result" : "Continue",
      "<span class=\"material-symbols-rounded\" aria-hidden=\"true\">arrow_forward</span>"
    ].join("");
    els.credentialNote.hidden = step.id === "review";

    if (step.id === "review") {
      els.stepFields.innerHTML = renderReview();
      return;
    }

    var applicable = RISK.applicableQuestions(state, QUESTION_BANK.QUESTIONS)
      .filter(function (question) { return question.step === step.id; });

    if (step.id === "profile") {
      applicable = applicable.filter(function (question) {
        return ["certificate_level", "instrument_rating", "cfi_role", "flight_rules"].indexOf(question.id) === -1;
      });
    }

    var grouped = groupQuestions(step.id, applicable);
    var content = step.id === "profile" ? renderProfileSummary() : "";
    content += grouped.map(renderQuestionGroup).join("");
    els.stepFields.innerHTML = content || "<p>No additional questions apply to this profile.</p>";
  }

  function renderProfileSummary() {
    var certificate = selectedOptionText(els.certificateLevel);
    var rating = selectedOptionText(els.ratingStatus);
    var rules = questionValue(state, QUESTION_INDEX.flight_rules) || "VFR";
    return [
      "<section class=\"profile-summary-card\" aria-label=\"Selected flight profile\">",
      "<div><span class=\"material-symbols-rounded\" aria-hidden=\"true\">flight_takeoff</span>",
      "<p><strong>", escapeHtml(rules), "</strong><span>Flight rules</span></p></div>",
      "<div><span class=\"material-symbols-rounded\" aria-hidden=\"true\">person</span>",
      "<p><strong>", escapeHtml(certificate), "</strong><span>Certificate</span></p></div>",
      "<div><span class=\"material-symbols-rounded\" aria-hidden=\"true\">workspace_premium</span>",
      "<p><strong>", escapeHtml(rating), "</strong><span>Rating / role</span></p></div>",
      "<div><span class=\"material-symbols-rounded\" aria-hidden=\"true\">schedule</span>",
      "<p><strong data-experience-summary>", numberOrZero(state.experience.totalPIC), " / ", numberOrZero(state.experience.recent90), " hrs</strong><span>Total PIC / last 90 days</span></p></div>",
      "<p class=\"profile-summary-note\">Use the controls above to change this context. Hours are shown for instructor discussion; they do not earn automatic risk credit.</p>",
      "</section>"
    ].join("");
  }

  function updateExperienceSummary() {
    var summary = els.stepFields.querySelector("[data-experience-summary]");
    if (summary) {
      summary.textContent = numberOrZero(state.experience.totalPIC) + " / " +
        numberOrZero(state.experience.recent90) + " hrs";
    }
  }

  function groupQuestions(stepId, questions) {
    var groups = [];
    var byKey = Object.create(null);

    questions.forEach(function (question) {
      var key = groupKey(stepId, question.id);
      if (!byKey[key]) {
        byKey[key] = {
          key: key,
          questions: []
        };
        groups.push(byKey[key]);
      }
      byKey[key].questions.push(question);
    });

    return groups;
  }

  function groupKey(stepId, id) {
    if (stepId === "profile") {
      return "profile_operation";
    }
    if (stepId === "pilot") {
      if (id.indexOf("imsafe_") === 0) {
        return "pilot_imsafe";
      }
      if (id === "personal_minimums_established") {
        return "pilot_limits";
      }
      if (id.indexOf("ifr_") === 0) {
        return "pilot_ifr";
      }
      return "pilot_readiness";
    }
    if (stepId === "aircraft") {
      if (id.indexOf("personal_") === 0 || id.indexOf("planned_") === 0 || id === "available_runway_length_ft") {
        return "aircraft_margin";
      }
      if (id.indexOf("night_") === 0 || id.indexOf("ifr_") === 0) {
        return "aircraft_specific";
      }
      return "aircraft_ready";
    }
    if (stepId === "environment") {
      if (["weather_briefing_status", "notam_status", "airport_route_available"].indexOf(id) !== -1) {
        return "environment_info";
      }
      if (["forecast_trend", "thunderstorm_exposure", "icing_plan_status", "turbulence_windshear_status"].indexOf(id) !== -1) {
        return "environment_weather";
      }
      if (id.indexOf("surface_wind") !== -1 || id.indexOf("gust_spread") !== -1 || id.indexOf("crosswind") !== -1) {
        return "environment_wind";
      }
      if (id.indexOf("night_") === 0) {
        return "environment_night";
      }
      if (id === "airport_lighting_aids") {
        return "environment_lighting";
      }
      if (id.indexOf("vfr_") === 0 || id.indexOf("personal_vfr_") === 0 || id.indexOf("forecast_vfr_") === 0) {
        return "environment_vfr";
      }
      if (
        id.indexOf("ifr_") === 0 ||
        id.indexOf("approach_") === 0 ||
        id.indexOf("personal_ifr_") === 0 ||
        id.indexOf("forecast_ifr_") === 0 ||
        id.indexOf("missed_approach") === 0
      ) {
        return "environment_ifr";
      }
      return "environment_route";
    }
    if (stepId === "external") {
      return ["schedule_pressure", "passenger_pressure"].indexOf(id) !== -1
        ? "external_pressure"
        : "external_options";
    }
    return "additional";
  }

  function renderQuestionGroup(group) {
    var meta = GROUP_META[group.key] || GROUP_META.additional;
    var comparisonLimitIds = group.questions.reduce(function (ids, question) {
      if (question.comparison) {
        ids.push(question.comparison.limitQuestionId);
      }
      return ids;
    }, []);

    var fields = group.questions.map(function (question) {
      if (comparisonLimitIds.indexOf(question.id) !== -1) {
        return "";
      }
      return question.comparison
        ? renderComparisonQuestion(question, QUESTION_INDEX[question.comparison.limitQuestionId])
        : renderQuestion(question);
    }).join("");

    if (!fields) {
      return "";
    }

    return [
      "<section class=\"question-section\" aria-labelledby=\"group-", escapeHtml(group.key), "\">",
      "<header class=\"question-section-heading\">",
      "<div><h2 id=\"group-", escapeHtml(group.key), "\">", escapeHtml(meta.title), "</h2>",
      "<p>", escapeHtml(meta.description), "</p></div>",
      "<span>", group.questions.length, " factor", group.questions.length === 1 ? "" : "s", "</span>",
      "</header>",
      "<div class=\"question-section-fields\">", fields, "</div>",
      "</section>"
    ].join("");
  }

  function renderQuestion(question) {
    var hazard = findHazard(question.id);
    var level = hazard ? hazard.level.toLowerCase() : "";
    var riskClass = level === "stop" ? " is-stop" : level === "high" ? " is-danger" : level === "moderate" ? " is-warning" : "";
    return [
      "<article class=\"field-card", riskClass, "\" data-field-id=\"", escapeHtml(question.id), "\">",
      "<span class=\"field-icon material-symbols-rounded\" aria-hidden=\"true\">", fieldIcon(question), "</span>",
      "<div class=\"field-copy\"><h3>", escapeHtml(question.label), question.required ? " <span class=\"required-mark\" aria-hidden=\"true\">*</span>" : "", "</h3>",
      question.help ? "<p>" + escapeHtml(question.help) + "</p>" : "",
      question.source ? "<span class=\"field-source\">" + escapeHtml(question.source) + "</span>" : "",
      "</div>",
      "<div class=\"control-wrap\">", renderControl(question), "</div>",
      "</article>"
    ].join("");
  }

  function renderControl(question) {
    var value = questionValue(state, question);
    var id = "question-" + question.id;

    if (question.type === "boolean") {
      return [
        "<span class=\"control-label\">Select one</span>",
        "<div class=\"choice-grid\" role=\"radiogroup\" aria-label=\"", escapeHtml(question.label), "\">",
        renderBooleanChoice(question, true, "Yes", value),
        renderBooleanChoice(question, false, "No", value),
        "</div>"
      ].join("");
    }

    if (question.type === "number") {
      var invalidNumber = !isBlank(value) && !RISK.numericAnswerIsValid(question, value);
      return [
        "<label class=\"control-label\" for=\"", id, "\">Enter value</label>",
        "<div class=\"input-with-unit\">",
        "<input id=\"", id, "\" data-question-id=\"", escapeHtml(question.id), "\" type=\"number\"",
        " value=\"", value == null ? "" : escapeHtml(value), "\"",
        question.min != null ? " min=\"" + escapeHtml(question.min) + "\"" : "",
        question.max != null ? " max=\"" + escapeHtml(question.max) + "\"" : "",
        invalidNumber ? " aria-invalid=\"true\"" : "",
        " step=\"", escapeHtml(question.stepValue || 1), "\" inputmode=\"", escapeHtml(question.inputMode || "decimal"), "\">",
        question.unit ? "<span class=\"input-unit\">" + escapeHtml(shortUnit(question.unit)) + "</span>" : "",
        "</div>"
      ].join("");
    }

    return [
      "<label class=\"control-label\" for=\"", id, "\">Select one</label>",
      "<select id=\"", id, "\" data-question-id=\"", escapeHtml(question.id), "\">",
      "<option value=\"\">Select an answer…</option>",
      (question.options || []).map(function (option) {
        return "<option value=\"" + escapeHtml(option.value) + "\"" +
          (String(value) === String(option.value) ? " selected" : "") + ">" +
          escapeHtml(option.label) + "</option>";
      }).join(""),
      "</select>"
    ].join("");
  }

  function renderBooleanChoice(question, candidate, label, currentValue) {
    return [
      "<label class=\"choice-card\">",
      "<input data-question-id=\"", escapeHtml(question.id), "\" type=\"radio\" name=\"question-", escapeHtml(question.id),
      "\" value=\"", candidate ? "true" : "false", "\"",
      currentValue === candidate ? " checked" : "",
      ">",
      "<span>", label, "</span>",
      "</label>"
    ].join("");
  }

  function renderComparisonQuestion(actualQuestion, limitQuestion) {
    var hazard = findHazard(actualQuestion.id);
    var level = hazard ? hazard.level.toLowerCase() : "";
    var actualValue = questionValue(state, actualQuestion);
    var limitValue = questionValue(state, limitQuestion);
    var valuesEntered = !isBlank(actualValue) && !isBlank(limitValue);
    var completeValues = valuesEntered &&
      RISK.numericAnswerIsValid(actualQuestion, actualValue) &&
      RISK.numericAnswerIsValid(limitQuestion, limitValue);
    var breached = Boolean(hazard && hazard.personalLimitBreach);
    var statusLabel = "Enter both values";
    var statusDescription = "The tool will compare the plan with your written limit.";

    if (valuesEntered && !completeValues) {
      statusLabel = "Check value";
      statusDescription = "Use numbers within the allowed range and increment.";
    } else if (completeValues && breached) {
      statusLabel = actualQuestion.comparison.mode === "minimum" ? "Below minimum" : "Exceeds limit";
      statusDescription = hazard.reason;
    } else if (completeValues) {
      statusLabel = "Within limit";
      statusDescription = "The entered condition is within the written personal limit.";
    }

    var riskClass = level === "stop" ? " is-stop" : level === "high" ? " is-danger" : level === "moderate" ? " is-warning" : "";
    return [
      "<article class=\"comparison-card", riskClass, "\" data-field-id=\"", escapeHtml(actualQuestion.id), "\">",
      "<span class=\"field-icon material-symbols-rounded\" aria-hidden=\"true\">", fieldIcon(actualQuestion), "</span>",
      "<div class=\"field-copy\"><h3>", escapeHtml(actualQuestion.label), " <span class=\"required-mark\" aria-hidden=\"true\">*</span></h3>",
      actualQuestion.help ? "<p>" + escapeHtml(actualQuestion.help) + "</p>" : "",
      "</div>",
      renderComparisonInput(actualQuestion, actualValue, "Planned / forecast"),
      "<span class=\"comparison-arrow material-symbols-rounded\" aria-hidden=\"true\">chevron_right</span>",
      "<div class=\"comparison-value is-limit\">",
      renderComparisonInput(limitQuestion, limitValue, "Your written " + (actualQuestion.comparison.mode === "minimum" ? "minimum" : "limit")),
      "</div>",
      "<div class=\"comparison-status\" data-level=\"", level || "incomplete", "\">",
      "<span class=\"status-dot\" aria-hidden=\"true\">", valuesEntered && !completeValues ? "!" : completeValues ? breached ? "!" : "✓" : "…", "</span>",
      "<div><strong>", escapeHtml(statusLabel), "</strong><p>", escapeHtml(statusDescription), "</p></div>",
      "</div>",
      "</article>"
    ].join("");
  }

  function renderComparisonInput(question, value, label) {
    var invalidNumber = !isBlank(value) && !RISK.numericAnswerIsValid(question, value);
    return [
      "<div class=\"comparison-value\">",
      "<label class=\"control-label\" for=\"question-", escapeHtml(question.id), "\">", escapeHtml(label), "</label>",
      "<div class=\"input-with-unit\">",
      "<input id=\"question-", escapeHtml(question.id), "\" data-question-id=\"", escapeHtml(question.id), "\" type=\"number\"",
      " value=\"", value == null ? "" : escapeHtml(value), "\"",
      question.min != null ? " min=\"" + escapeHtml(question.min) + "\"" : "",
      question.max != null ? " max=\"" + escapeHtml(question.max) + "\"" : "",
      invalidNumber ? " aria-invalid=\"true\"" : "",
      " step=\"", escapeHtml(question.stepValue || 1), "\" inputmode=\"", escapeHtml(question.inputMode || "decimal"), "\">",
      question.unit ? "<span class=\"input-unit\">" + escapeHtml(shortUnit(question.unit)) + "</span>" : "",
      "</div></div>"
    ].join("");
  }

  function refreshComparisonCard(control) {
    var card = control.closest(".comparison-card");
    if (!card) {
      return;
    }

    var actualQuestion = QUESTION_INDEX[card.dataset.fieldId];
    var limitQuestion = actualQuestion && QUESTION_INDEX[actualQuestion.comparison.limitQuestionId];
    if (!actualQuestion || !limitQuestion) {
      return;
    }

    var actualValue = questionValue(state, actualQuestion);
    var limitValue = questionValue(state, limitQuestion);
    var valuesEntered = !isBlank(actualValue) && !isBlank(limitValue);
    var completeValues = valuesEntered &&
      RISK.numericAnswerIsValid(actualQuestion, actualValue) &&
      RISK.numericAnswerIsValid(limitQuestion, limitValue);
    var hazard = findHazard(actualQuestion.id);
    var breached = Boolean(hazard && hazard.personalLimitBreach);
    var level = hazard ? hazard.level.toLowerCase() : "";
    var label = "Enter both values";
    var description = "The tool will compare the plan with your written limit.";
    var dot = "…";

    if (valuesEntered && !completeValues) {
      label = "Check value";
      description = "Use numbers within the allowed range and increment.";
      dot = "!";
    } else if (completeValues && breached) {
      label = actualQuestion.comparison.mode === "minimum" ? "Below minimum" : "Exceeds limit";
      description = hazard.reason;
      dot = "!";
    } else if (completeValues) {
      label = "Within limit";
      description = "The entered condition is within the written personal limit.";
      dot = "✓";
    }

    card.classList.toggle("is-stop", level === "stop");
    card.classList.toggle("is-danger", level === "high");
    card.classList.toggle("is-warning", level === "moderate");
    var status = card.querySelector(".comparison-status");
    if (status) {
      status.dataset.level = level || "incomplete";
      status.querySelector(".status-dot").textContent = dot;
      status.querySelector("strong").textContent = label;
      status.querySelector("p").textContent = description;
    }
  }

  function renderReview() {
    var level = result.overall.toLowerCase();
    var topHazards = result.hazards.filter(function (hazard) {
      return hazard.level !== RISK.LEVELS.LOW;
    }).slice(0, 8);
    var profileLine = [
      questionValue(state, QUESTION_INDEX.flight_rules) || "Rules not selected",
      optionLabel(QUESTION_INDEX.certificate_level, questionValue(state, QUESTION_INDEX.certificate_level)) || "Certificate not selected",
      selectedOptionText(els.ratingStatus)
    ].join(" · ");

    var missingMarkup = result.missingCritical.length
      ? [
        "<article class=\"review-card is-wide review-card-alert\"><h2>Still incomplete</h2>",
        "<p>", result.missingCritical.length, " applicable safety-critical answer", result.missingCritical.length === 1 ? " is" : "s are", " unresolved.</p>",
        "<ul class=\"review-list\">",
        result.missingCritical.slice(0, 6).map(function (missing) {
          return "<li>" + escapeHtml(missing.label) + "</li>";
        }).join(""),
        result.missingCritical.length > 6 ? "<li>And " + (result.missingCritical.length - 6) + " more…</li>" : "",
        "</ul><button class=\"button button-secondary\" type=\"button\" data-review-action=\"missing\">Go to first missing answer</button></article>"
      ].join("")
      : "";

    var hazardsMarkup = topHazards.length
      ? "<ol class=\"review-list\">" + topHazards.map(function (hazard) {
        return "<li><strong>" + escapeHtml(displayLevel(hazard.level)) + ":</strong> " + escapeHtml(hazard.reason) + "</li>";
      }).join("") + "</ol>"
      : "<p>No elevated factors are currently identified. Continue full planning and monitor for change.</p>";

    var historyMarkup = state.mitigationHistory.length
      ? "<ul class=\"review-list\">" + state.mitigationHistory.map(function (entry) {
        var definition = QUESTION_BANK.MITIGATIONS.find(function (item) { return item.id === entry.id; });
        return "<li>" + escapeHtml(definition ? definition.label : entry.id) + " — " + entry.fields.length + " input" + (entry.fields.length === 1 ? "" : "s") + " changed</li>";
      }).join("") + "</ul>"
      : "<p>No mitigations have been recorded. Acknowledging a hazard alone does not reduce it.</p>";

    return [
      "<div class=\"review-summary\">",
      "<article class=\"review-card review-outcome\" data-level=\"", level, "\">",
      "<span class=\"material-symbols-rounded review-outcome-icon\" aria-hidden=\"true\">", riskIcon(result.overall), "</span>",
      "<div><p class=\"step-eyebrow\">Overall result</p><h2>", escapeHtml(displayLevel(result.overall)), "</h2>",
      "<p>", escapeHtml(guidanceFor(result.overall)), "</p></div></article>",
      "<article class=\"review-card\"><h2>Flight profile</h2><p>", escapeHtml(profileLine), "</p>",
      "<p>", numberOrZero(state.experience.totalPIC), " total PIC hours · ", numberOrZero(state.experience.recent90), " hours in the last 90 days</p></article>",
      missingMarkup,
      "<article class=\"review-card is-wide\"><h2>Highest unresolved factors</h2>", hazardsMarkup, "</article>",
      "<article class=\"review-card\"><h2>Risk vector</h2>",
      "<p>", result.vector.STOP, " Stop · ", result.vector.HIGH, " High · ", result.vector.MODERATE, " Moderate · ", result.vector.LOW, " Low</p>",
      "<p>The highest factor controls the result; lower factors do not offset it.</p></article>",
      "<article class=\"review-card\"><h2>Mitigation history</h2>", historyMarkup, "</article>",
      "<article class=\"review-card is-wide\"><h2>Take the next safe action</h2>",
      "<p>Change the plan and rescore, discuss the assessment with an instructor or appropriate decision-maker, or make a no-go decision. Recheck changing conditions before departure.</p>",
      "<div class=\"review-action-grid\">",
      "<button class=\"button button-primary\" type=\"button\" data-review-action=\"mitigate\"><span class=\"material-symbols-rounded\" aria-hidden=\"true\">tune</span>Review mitigations</button>",
      "<button class=\"button button-secondary\" type=\"button\" data-review-action=\"copy\"><span class=\"material-symbols-rounded\" aria-hidden=\"true\">content_copy</span>Copy summary</button>",
      "<button class=\"button button-secondary\" type=\"button\" data-review-action=\"print\"><span class=\"material-symbols-rounded\" aria-hidden=\"true\">print</span>Print / save as PDF</button>",
      "</div></article>",
      "</div>"
    ].join("");
  }

  function renderRiskPicture() {
    var level = result.overall.toLowerCase();
    els.overallRisk.dataset.level = level;
    els.overallRiskIcon.textContent = riskIcon(result.overall);
    els.overallRiskLabel.textContent = displayLevel(result.overall);
    els.overallRiskGuidance.textContent = guidanceFor(result.overall);

    ["STOP", "HIGH", "MODERATE", "LOW"].forEach(function (vectorLevel) {
      var vectorElement = els.riskVector.querySelector("[data-vector=\"" + vectorLevel.toLowerCase() + "\"]");
      if (vectorElement) {
        vectorElement.textContent = result.vector[vectorLevel] + " " + vectorLevel.toLowerCase();
      }
    });

    renderMatrix();

    var percent = result.applicableCount
      ? Math.round((result.answeredCount / result.applicableCount) * 100)
      : 0;
    els.progressLabel.textContent = result.answeredCount + " of " + result.applicableCount + " answered";
    els.progressTrack.setAttribute("aria-valuenow", String(percent));
    els.progressFill.style.width = percent + "%";

    var drivers = result.hazards.filter(function (hazard) {
      return hazard.level !== RISK.LEVELS.LOW;
    }).slice(0, 2);

    if (drivers.length) {
      els.driverList.innerHTML = drivers.map(function (hazard) {
        return "<li data-level=\"" + hazard.level.toLowerCase() + "\">" + escapeHtml(hazard.reason) + "</li>";
      }).join("");
    } else {
      els.driverList.innerHTML = "<li class=\"driver-empty\">" +
        (result.complete
          ? "No elevated factors are currently identified. Keep monitoring for changes."
          : "Answer questions to identify the factors driving this flight's risk.") +
        "</li>";
    }

    els.mitigationsButton.disabled = !result.hazards.some(function (hazard) {
      return hazard.level !== RISK.LEVELS.LOW;
    });

    els.mobileRiskBar.dataset.level = level;
    els.mobileRiskBar.querySelector(".mobile-risk-state .material-symbols-rounded").textContent = riskIcon(result.overall);
    els.mobileRiskBar.querySelector(".mobile-risk-state strong").textContent = displayLevel(result.overall);
    els.mobileRiskBar.querySelector(".mobile-risk-progress").textContent = result.answeredCount + " of " + result.applicableCount;
  }

  function renderMatrix() {
    var likelihoods = ["PROBABLE", "OCCASIONAL", "REMOTE", "IMPROBABLE"];
    var severities = ["CATASTROPHIC", "CRITICAL", "MARGINAL", "NEGLIGIBLE"];
    var shortSeverity = {
      CATASTROPHIC: "Catast.",
      CRITICAL: "Critical",
      MARGINAL: "Marginal",
      NEGLIGIBLE: "Neglig."
    };
    var shortLikelihood = {
      PROBABLE: "Probable",
      OCCASIONAL: "Occasional",
      REMOTE: "Remote",
      IMPROBABLE: "Improbable"
    };
    var active = result.highestHazard;
    var html = "<span class=\"matrix-label\" aria-hidden=\"true\"></span>";

    severities.forEach(function (severity) {
      html += "<span class=\"matrix-label\">" + shortSeverity[severity] + "</span>";
    });

    likelihoods.forEach(function (likelihood) {
      html += "<span class=\"matrix-label matrix-row-label\">" + shortLikelihood[likelihood] + "</span>";
      severities.forEach(function (severity) {
        var cellLevel = RISK.RISK_MATRIX[likelihood][severity];
        var isActive = active && active.likelihood === likelihood && active.severity === severity;
        html += [
          "<span class=\"matrix-cell", isActive ? " is-active" : "", "\" data-level=\"", cellLevel.toLowerCase(), "\"",
          isActive ? " data-active-label=\"" + escapeHtml(displayLevel(active.level).replace(" risk", "")) + "\"" : "",
          " aria-label=\"", shortLikelihood[likelihood], " and ", shortSeverity[severity], ": ", displayLevel(cellLevel),
          isActive ? ", highest current factor" : "", "\">",
          "",
          "</span>"
        ].join("");
      });
    });
    els.riskMatrix.innerHTML = html;
  }

  function openMitigations() {
    renderMitigationDialog();
    els.mitigationDialog.showModal();
  }

  function renderMitigationDialog() {
    var applicableIds = RISK.applicableQuestions(state, QUESTION_BANK.QUESTIONS).map(function (question) {
      return question.id;
    });
    var elevatedIds = result.hazards.filter(function (hazard) {
      return hazard.level !== RISK.LEVELS.LOW;
    }).map(function (hazard) {
      return hazard.questionId;
    });

    var items = QUESTION_BANK.MITIGATIONS.map(function (mitigation) {
      var relevantIds = mitigation.allowedFields.filter(function (id) {
        return elevatedIds.indexOf(id) !== -1 && applicableIds.indexOf(id) !== -1 && QUESTION_INDEX[id];
      });
      if (!relevantIds.length) {
        return "";
      }

      return [
        "<article class=\"mitigation-item\">",
        "<h3>", escapeHtml(mitigation.label), "</h3>",
        "<p>", escapeHtml(mitigation.description), "</p>",
        "<p class=\"mitigation-verification\"><span class=\"material-symbols-rounded\" aria-hidden=\"true\">fact_check</span> Enter a verified value only after the flight plan or condition actually changes.</p>",
        "<div class=\"mitigation-actions\">",
        relevantIds.map(function (id) {
          return renderMitigationInput(mitigation, QUESTION_INDEX[id]);
        }).join(""),
        "</div></article>"
      ].join("");
    }).filter(Boolean);

    els.mitigationList.innerHTML = items.length
      ? items.join("")
      : "<p class=\"mitigation-empty\">No direct input-changing mitigation is mapped to the current elevated factors. Return to the relevant step, change or remove the underlying condition, and reassess.</p>";
    els.reassessButton.disabled = !items.length;
  }

  function renderMitigationInput(mitigation, question) {
    var currentValue = questionValue(state, question);
    var common = [
      " data-mitigation-input=\"true\"",
      " data-mitigation-id=\"", escapeHtml(mitigation.id), "\"",
      " data-question-id=\"", escapeHtml(question.id), "\"",
      " data-original-value=\"", escapeHtml(currentValue == null ? "" : currentValue), "\""
    ].join("");

    var control;
    if (question.type === "number") {
      control = "<input type=\"number\"" + common +
        " value=\"" + escapeHtml(currentValue == null ? "" : currentValue) + "\"" +
        (question.min != null ? " min=\"" + escapeHtml(question.min) + "\"" : "") +
        (question.max != null ? " max=\"" + escapeHtml(question.max) + "\"" : "") +
        " step=\"" + escapeHtml(question.stepValue || 1) + "\">";
    } else if (question.type === "boolean") {
      control = [
        "<select", common, ">",
        "<option value=\"\">Select verified value…</option>",
        "<option value=\"true\"", currentValue === true ? " selected" : "", ">Yes</option>",
        "<option value=\"false\"", currentValue === false ? " selected" : "", ">No</option>",
        "</select>"
      ].join("");
    } else {
      control = [
        "<select", common, ">",
        "<option value=\"\">Select verified value…</option>",
        (question.options || []).map(function (option) {
          return "<option value=\"" + escapeHtml(option.value) + "\"" +
            (String(currentValue) === String(option.value) ? " selected" : "") + ">" +
            escapeHtml(option.label) + "</option>";
        }).join(""),
        "</select>"
      ].join("");
    }

    return [
      "<label class=\"mitigation-field\"><span>", escapeHtml(question.label), "</span>",
      control,
      question.unit ? "<small>" + escapeHtml(question.unit) + "</small>" : "",
      "</label>"
    ].join("");
  }

  function applyMitigationChanges() {
    var changesByMitigation = Object.create(null);
    var mitigationControls = Array.from(els.mitigationList.querySelectorAll("[data-mitigation-input]"));
    var invalidControl = mitigationControls.find(function (control) {
      return control.value !== "" && !control.checkValidity();
    });

    if (invalidControl) {
      showToast("Enter a mitigation value within the allowed range and increment.");
      invalidControl.focus();
      invalidControl.reportValidity();
      return;
    }

    mitigationControls.forEach(function (control) {
      var original = control.dataset.originalValue;
      var raw = control.value;
      if (raw === "" || String(raw) === String(original)) {
        return;
      }
      var question = QUESTION_INDEX[control.dataset.questionId];
      var parsed = parseControlValue(control, question);
      changesByMitigation[control.dataset.mitigationId] =
        changesByMitigation[control.dataset.mitigationId] || {};
      changesByMitigation[control.dataset.mitigationId][question.id] = parsed;
    });

    var changedFields = 0;
    Object.keys(changesByMitigation).forEach(function (mitigationId) {
      var mitigation = QUESTION_BANK.MITIGATIONS.find(function (candidate) {
        return candidate.id === mitigationId;
      });
      if (mitigation) {
        changedFields += Object.keys(changesByMitigation[mitigationId]).length;
        state = mitigation.apply(state, changesByMitigation[mitigationId]);
      }
    });

    if (!changedFields) {
      showToast("Enter at least one verified change to reassess.");
      return;
    }

    ensureState();
    els.mitigationDialog.close();
    stateChanged();
    showToast(changedFields + " assessment input" + (changedFields === 1 ? " was" : "s were") + " changed and rescored.");
  }

  function validateCurrentStep() {
    var step = QUESTION_BANK.STEPS[currentStep];
    if (step.id === "review") {
      return true;
    }
    var applicableIds = RISK.applicableQuestions(state, QUESTION_BANK.QUESTIONS)
      .filter(function (question) { return question.step === step.id; })
      .map(function (question) { return question.id; });
    var missing = result.missingCritical.filter(function (item) {
      return applicableIds.indexOf(item.id) !== -1;
    });
    var invalidControls = Array.from(els.stepFields.querySelectorAll("[data-question-id]")).filter(function (control) {
      return typeof control.checkValidity === "function" && !control.checkValidity();
    });

    invalidControls.forEach(function (control) {
      var id = control.dataset.questionId;
      if (applicableIds.indexOf(id) !== -1 && !missing.some(function (item) { return item.id === id; })) {
        missing.push({
          id: id,
          label: QUESTION_INDEX[id] ? QUESTION_INDEX[id].label : "Numeric value",
          reason: "Enter a number within the allowed range and increment."
        });
      }
    });

    if (!missing.length) {
      clearErrors();
      return true;
    }

    els.formErrors.hidden = false;
    els.formErrors.innerHTML = [
      "<strong>Finish this step before continuing.</strong> ",
      missing.length, " safety-critical answer", missing.length === 1 ? " is" : "s are", " still missing, unresolved, or invalid.",
      "<ul>",
      missing.slice(0, 4).map(function (item) {
        return "<li>" + escapeHtml(item.label) + " — " + escapeHtml(item.reason) + "</li>";
      }).join(""),
      "</ul>"
    ].join("");
    els.formErrors.focus();

    var firstControl = els.stepFields.querySelector("[data-question-id=\"" + cssEscape(missing[0].id) + "\"]");
    if (firstControl) {
      window.setTimeout(function () {
        firstControl.focus();
        if (!firstControl.checkValidity()) {
          firstControl.reportValidity();
        }
      }, 80);
    }
    return false;
  }

  function navigateTo(index, shouldValidate) {
    var target = Math.max(0, Math.min(QUESTION_BANK.STEPS.length - 1, index));
    if (target === currentStep) {
      return;
    }
    if (shouldValidate && !validateCurrentStep()) {
      return;
    }
    currentStep = target;
    state.ui.currentStep = currentStep;
    clearErrors();
    scheduleSave();
    render();
    els.assessmentMain.scrollIntoView({ behavior: "smooth", block: "start" });
    els.assessmentMain.focus({ preventScroll: true });
  }

  function goToFirstMissing() {
    if (!result.missingCritical.length) {
      return;
    }
    var question = QUESTION_INDEX[result.missingCritical[0].id];
    var index = QUESTION_BANK.STEPS.findIndex(function (step) {
      return step.id === question.step;
    });
    navigateTo(index, false);
    window.setTimeout(function () {
      var control = els.stepFields.querySelector("[data-question-id=\"" + cssEscape(question.id) + "\"]");
      if (control) {
        control.focus();
      }
    }, 120);
  }

  function stateChanged() {
    scheduleSave();
    render();
  }

  function scheduleSave() {
    if (IS_DEMO) {
      els.draftStatus.textContent = "Preview scenario";
      return;
    }
    window.clearTimeout(saveTimer);
    els.draftStatus.textContent = "Saving locally…";
    saveTimer = window.setTimeout(function () {
      saveAssessment(false);
    }, 280);
  }

  function saveAssessment(showConfirmation) {
    if (IS_DEMO) {
      els.draftStatus.textContent = "Preview scenario";
      if (showConfirmation) {
        showToast("Preview mode does not change your saved draft.");
      }
      return;
    }
    try {
      state.ui.currentStep = currentStep;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      els.draftStatus.textContent = "Saved on this device";
      if (showConfirmation) {
        showToast("Draft saved locally on this device.");
      }
    } catch (error) {
      els.draftStatus.textContent = "Draft not saved";
      showToast("This browser could not save the draft.");
      console.warn("Unable to save local FRAT draft.", error);
    }
  }

  function resetAssessment() {
    if (!window.confirm("Start a new assessment? This clears the saved draft on this device.")) {
      return;
    }
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn("Unable to clear local FRAT draft.", error);
    }
    state = createInitialAssessment();
    currentStep = 0;
    clearErrors();
    render();
    showToast("A new assessment is ready.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function copySummary() {
    var summary = buildPlainTextSummary();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(summary).then(function () {
        showToast("Assessment summary copied.");
      }).catch(function () {
        fallbackCopy(summary);
      });
    } else {
      fallbackCopy(summary);
    }
  }

  function fallbackCopy(text) {
    var area = document.createElement("textarea");
    var copied = false;
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    try {
      copied = document.execCommand("copy");
    } catch (error) {
      copied = false;
    }
    area.remove();
    showToast(copied
      ? "Assessment summary copied."
      : "Copy was blocked by this browser. Use Print / save as PDF instead.");
  }

  function buildPlainTextSummary() {
    var lines = [
      "SUAREZ CFI FLIGHT RISK ASSESSMENT",
      "Result: " + displayLevel(result.overall),
      "Profile: " + (questionValue(state, QUESTION_INDEX.flight_rules) || "Unselected") +
        " · " + (optionLabel(QUESTION_INDEX.certificate_level, questionValue(state, QUESTION_INDEX.certificate_level)) || "Unselected") +
        " · " + selectedOptionText(els.ratingStatus),
      "Experience context: " + numberOrZero(state.experience.totalPIC) + " total PIC hours; " +
        numberOrZero(state.experience.recent90) + " hours in the last 90 days",
      "Progress: " + result.answeredCount + " of " + result.applicableCount + " applicable factors answered",
      "Risk vector: " + result.vector.STOP + " Stop · " + result.vector.HIGH + " High · " +
        result.vector.MODERATE + " Moderate · " + result.vector.LOW + " Low",
      "",
      "TOP UNRESOLVED FACTORS"
    ];

    var elevated = result.hazards.filter(function (hazard) {
      return hazard.level !== RISK.LEVELS.LOW;
    }).slice(0, 10);
    if (elevated.length) {
      elevated.forEach(function (hazard, index) {
        lines.push((index + 1) + ". " + displayLevel(hazard.level) + " — " + hazard.reason);
      });
    } else {
      lines.push("No elevated factors currently identified.");
    }

    if (result.missingCritical.length) {
      lines.push("", "INCOMPLETE ANSWERS");
      result.missingCritical.slice(0, 12).forEach(function (missing) {
        lines.push("- " + missing.label);
      });
    }

    lines.push(
      "",
      "The highest unresolved hazard sets the result; low answers never cancel a higher hazard.",
      "Training aid only. Recheck official weather, NOTAMs, regulations, AFM/POH, aircraft performance, and current conditions.",
      "Generated with suarezcfi.com/flight-risk-assessment/"
    );
    return lines.join("\n");
  }

  function clearErrors() {
    els.formErrors.hidden = true;
    els.formErrors.innerHTML = "";
  }

  function showToast(message) {
    window.clearTimeout(toastTimer);
    els.toast.textContent = message;
    els.toast.hidden = false;
    toastTimer = window.setTimeout(function () {
      els.toast.hidden = true;
    }, 3600);
  }

  function findHazard(questionId) {
    return result && result.hazards.find(function (hazard) {
      return hazard.questionId === questionId;
    });
  }

  function questionValue(target, question) {
    if (!question) {
      return undefined;
    }
    if (target.answers && Object.prototype.hasOwnProperty.call(target.answers, question.id)) {
      return target.answers[question.id];
    }
    return question.path ? getPath(target, question.path) : undefined;
  }

  function setQuestionValue(target, question, value) {
    target.answers = target.answers || {};
    if (value == null || value === "") {
      delete target.answers[question.id];
      if (question.path) {
        setPath(target, question.path, null);
      }
      return;
    }
    target.answers[question.id] = value;
    if (question.path) {
      setPath(target, question.path, value);
    }
  }

  function getPath(object, path) {
    return String(path).split(".").reduce(function (current, segment) {
      return current == null ? undefined : current[segment];
    }, object);
  }

  function setPath(object, path, value) {
    var segments = String(path).split(".");
    var current = object;
    segments.slice(0, -1).forEach(function (segment) {
      current[segment] = current[segment] || {};
      current = current[segment];
    });
    current[segments[segments.length - 1]] = value;
  }

  function parseControlValue(control, question) {
    if (question.type === "boolean") {
      return control.value === "true";
    }
    if (question.type === "number") {
      return control.value === "" ? null : Number(control.value);
    }
    return control.value;
  }

  function optionLabel(question, value) {
    var option = question && question.options && question.options.find(function (candidate) {
      return String(candidate.value) === String(value);
    });
    return option ? option.label : "";
  }

  function selectedOptionText(select) {
    return select && select.selectedIndex >= 0 ? select.options[select.selectedIndex].text : "";
  }

  function numberOrZero(value) {
    var number = Number(value);
    return Number.isFinite(number) && number >= 0 ? number : 0;
  }

  function isBlank(value) {
    return value == null || value === "" || (typeof value === "number" && !Number.isFinite(value));
  }

  function shortUnit(unit) {
    var units = {
      "minutes": "min",
      "feet": "ft",
      "feet AGL": "ft AGL",
      "knots": "kt",
      "statute miles": "SM"
    };
    return units[unit] || unit;
  }

  function fieldIcon(question) {
    var id = question.id;
    if (id.indexOf("imsafe") === 0 || /illness|medication|fatigue|emotion|stress|alcohol/.test(id)) {
      return "health_and_safety";
    }
    if (/weather|ceiling|cloud|thunder|icing|turbulence|visibility/.test(id)) {
      return "cloud";
    }
    if (/wind|gust|crosswind/.test(id)) {
      return "air";
    }
    if (/runway|airport|route|terrain|alternate|diversion|approach/.test(id)) {
      return "route";
    }
    if (/fuel/.test(id)) {
      return "local_gas_station";
    }
    if (/aircraft|airworthy|equipment|afm|poh|weight|performance|avionics/.test(id)) {
      return "flight";
    }
    if (/night|lighting/.test(id)) {
      return "dark_mode";
    }
    if (/pressure|schedule|passenger|transport|time_buffer/.test(id)) {
      return "schedule";
    }
    if (/current|qualified|endorsement|proficiency|familiarity|certificate|rating|cfi|pic/.test(id)) {
      return "person_check";
    }
    return "checklist";
  }

  function displayLevel(level) {
    var labels = {
      INCOMPLETE: "Incomplete",
      LOW: "Low risk",
      MODERATE: "Moderate risk",
      HIGH: "High risk",
      STOP: "Stop — no-go"
    };
    return labels[level] || "Incomplete";
  }

  function guidanceFor(level) {
    var guidance = {
      INCOMPLETE: "Answer every applicable safety-critical question before relying on the result.",
      LOW: "Continue full planning and monitor for change. Low never means safe.",
      MODERATE: "Mitigate where practical and reassess before departure.",
      HIGH: "Do not depart on this assessment. Change the plan and rescore.",
      STOP: "The current plan is a no-go until the underlying condition is removed."
    };
    return guidance[level] || guidance.INCOMPLETE;
  }

  function riskIcon(level) {
    var icons = {
      INCOMPLETE: "pending",
      LOW: "verified",
      MODERATE: "error",
      HIGH: "warning",
      STOP: "gpp_bad"
    };
    return icons[level] || "pending";
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function cssEscape(value) {
    if (window.CSS && window.CSS.escape) {
      return window.CSS.escape(value);
    }
    return String(value).replace(/["\\]/g, "\\$&");
  }
})();
