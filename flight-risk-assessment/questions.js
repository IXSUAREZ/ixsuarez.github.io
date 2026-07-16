(function (root, factory) {
  "use strict";

  var api = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.FRAT_QUESTIONS = api;
  }
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  var STEPS = Object.freeze([
    Object.freeze({ id: "profile", label: "Flight & Pilot Profile", pave: null }),
    Object.freeze({ id: "pilot", label: "Pilot", pave: "PILOT" }),
    Object.freeze({ id: "aircraft", label: "Aircraft", pave: "AIRCRAFT" }),
    Object.freeze({ id: "environment", label: "Environment", pave: "ENVIRONMENT" }),
    Object.freeze({ id: "external", label: "External Pressures", pave: "EXTERNAL" }),
    Object.freeze({ id: "review", label: "Mitigate & Review", pave: null })
  ]);

  // Instrument is a rating flag and CFI is an instructor-role flag. Neither is
  // modeled as a mutually exclusive pilot-certificate grade.
  var PROFILE_PRESETS = Object.freeze([
    Object.freeze({
      id: "student",
      label: "Student",
      description: "Student pilot; select solo only when current endorsements and instructor limits apply.",
      patch: Object.freeze({ certificate: "student", instrument: false, cfi: false })
    }),
    Object.freeze({
      id: "private",
      label: "Private",
      description: "Private pilot without assuming an instrument rating.",
      patch: Object.freeze({ certificate: "private", instrument: false, cfi: false })
    }),
    Object.freeze({
      id: "instrument-rated",
      label: "Instrument-rated",
      description: "A pilot-certificate preset plus a separate instrument-rating flag.",
      patch: Object.freeze({ certificate: "private", instrument: true, cfi: false })
    }),
    Object.freeze({
      id: "commercial",
      label: "Commercial",
      description: "Commercial pilot; ratings and operating role remain separate inputs.",
      patch: Object.freeze({ certificate: "commercial", instrument: false, cfi: false })
    }),
    Object.freeze({
      id: "cfi",
      label: "CFI",
      description: "Commercial pilot preset with a separate flight-instructor role flag.",
      patch: Object.freeze({ certificate: "commercial", instrument: true, cfi: true })
    }),
    Object.freeze({
      id: "atp",
      label: "ATP",
      description: "ATP profile; operator procedures still supersede this personal planning aid.",
      patch: Object.freeze({ certificate: "atp", instrument: true, cfi: false })
    })
  ]);

  var SOURCE_RMH = "FAA-H-8083-2A Risk Management Handbook";
  var SOURCE_PAVE = "FAA PAVE Checklist";
  var SOURCE_IMSAFE = "FAA 5P / IMSAFE guidance";

  function option(value, label) {
    return Object.freeze({ value: value, label: label });
  }

  var YES_NO_UNKNOWN = Object.freeze([
    option("yes", "Yes"),
    option("no", "No"),
    option("unknown", "Unknown / not verified")
  ]);

  var LOW_RULE = Object.freeze({
    likelihood: "IMPROBABLE",
    severity: "NEGLIGIBLE",
    reason: "No material hazard was identified by this answer."
  });

  function moderateRule(reason) {
    return Object.freeze({ likelihood: "REMOTE", severity: "CRITICAL", reason: reason });
  }

  function highRule(reason) {
    return Object.freeze({ likelihood: "REMOTE", severity: "CATASTROPHIC", reason: reason });
  }

  function stopRule(reason) {
    return Object.freeze({
      likelihood: "PROBABLE",
      severity: "CATASTROPHIC",
      hardStop: true,
      reason: reason
    });
  }

  function applies(questionId, equals) {
    return Object.freeze({ questionId: questionId, equals: equals });
  }

  function baseQuestion(config) {
    return Object.freeze(Object.assign({
      required: true,
      critical: true,
      source: SOURCE_RMH
    }, config));
  }

  function stopBinary(config) {
    var noReason = config.noReason;
    var result = Object.assign({}, config);
    delete result.noReason;

    return baseQuestion(Object.assign({
      type: "select",
      options: YES_NO_UNKNOWN,
      incompleteValues: Object.freeze(["unknown"]),
      riskByValue: Object.freeze({
        yes: LOW_RULE,
        no: stopRule(noReason)
      })
    }, result));
  }

  function gradedQuestion(config, rules) {
    return baseQuestion(Object.assign({
      type: "select",
      incompleteValues: Object.freeze(["unknown"]),
      riskByValue: Object.freeze(rules)
    }, config));
  }

  function imsafeQuestion(id, label, help) {
    return gradedQuestion({
      id: id,
      step: "pilot",
      pave: "PILOT",
      label: label,
      help: help,
      source: SOURCE_IMSAFE,
      options: Object.freeze([
        option("fit", "Fit - no concern identified"),
        option("concern", "Concern - resolve before flight"),
        option("not_fit", "Not fit for flight"),
        option("unknown", "Unsure")
      ])
    }, {
      fit: LOW_RULE,
      concern: highRule("An unresolved IMSAFE concern requires mitigation before departure."),
      not_fit: stopRule("The pilot marked this IMSAFE condition as not fit for flight.")
    });
  }

  function personalLimitQuestion(config) {
    return baseQuestion(Object.assign({
      type: "number",
      min: 0,
      inputMode: "decimal",
      source: SOURCE_RMH,
      help: "Enter the written pilot/CFI personal limit; no FAA universal value is supplied."
    }, config));
  }

  function actualAgainstLimitQuestion(config) {
    return baseQuestion(Object.assign({
      type: "number",
      min: 0,
      inputMode: "decimal",
      source: SOURCE_RMH,
      comparison: Object.freeze({
        limitQuestionId: config.limitQuestionId,
        mode: config.mode,
        onBreach: highRule(config.breachReason),
        onWithin: LOW_RULE
      })
    }, config, {
      limitQuestionId: undefined,
      mode: undefined,
      breachReason: undefined
    }));
  }

  var QUESTIONS = [];
  function add(question) {
    QUESTIONS.push(question);
  }

  // Flight and pilot profile. Certificate grade, instrument rating, and CFI role
  // are intentionally separate fields.
  add(baseQuestion({
    id: "certificate_level",
    step: "profile",
    pave: "PILOT",
    path: "profile.certificate",
    label: "Pilot certificate level",
    help: "Select the pilot-certificate grade. Instrument rating and CFI role are separate.",
    type: "select",
    options: Object.freeze([
      option("student", "Student"),
      option("private", "Private"),
      option("commercial", "Commercial"),
      option("atp", "ATP")
    ])
  }));

  add(baseQuestion({
    id: "instrument_rating",
    step: "profile",
    pave: "PILOT",
    path: "profile.ratings.instrument",
    label: "Instrument rating held",
    help: "This eligibility flag does not lower personal weather or wind limits.",
    type: "boolean"
  }));

  add(baseQuestion({
    id: "cfi_role",
    step: "profile",
    pave: "PILOT",
    path: "profile.roles.cfi",
    label: "Acting in a flight-instructor role",
    help: "CFI is modeled as a separate role, not as a pilot-certificate grade.",
    type: "boolean"
  }));

  add(baseQuestion({
    id: "intended_pic",
    step: "profile",
    pave: "PILOT",
    path: "operation.intendedPIC",
    label: "You are the intended pilot in command",
    help: "Identify the intended PIC explicitly; do not infer PIC from certificate level.",
    type: "boolean"
  }));

  add(baseQuestion({
    id: "flight_rules",
    step: "profile",
    pave: "ENVIRONMENT",
    path: "operation.rules",
    label: "Planned flight rules",
    type: "select",
    options: Object.freeze([option("VFR", "VFR"), option("IFR", "IFR")])
  }));

  add(baseQuestion({
    id: "day_night",
    step: "profile",
    pave: "ENVIRONMENT",
    path: "operation.dayNight",
    label: "Day or night operation",
    type: "select",
    options: Object.freeze([option("day", "Day"), option("night", "Night")])
  }));

  add(baseQuestion({
    id: "student_solo",
    step: "profile",
    pave: "PILOT",
    path: "operation.studentSolo",
    label: "Student solo flight",
    type: "boolean",
    appliesWhen: Object.freeze([applies("certificate_level", "student")])
  }));

  add(baseQuestion({
    id: "training_flight",
    step: "profile",
    pave: "EXTERNAL",
    path: "operation.trainingFlight",
    label: "Training flight",
    type: "boolean"
  }));

  add(baseQuestion({
    id: "passengers_onboard",
    step: "profile",
    pave: "EXTERNAL",
    path: "operation.passengers",
    label: "Passengers will be on board",
    type: "boolean"
  }));

  add(baseQuestion({
    id: "approach_planned",
    step: "profile",
    pave: "ENVIRONMENT",
    path: "operation.approachPlanned",
    label: "Instrument approach planned or reasonably expected",
    type: "boolean",
    appliesWhen: Object.freeze([applies("flight_rules", "IFR")])
  }));

  // Pilot capability, currency, proficiency, and IMSAFE.
  add(stopBinary({
    id: "known_legal_compliance",
    step: "pilot",
    pave: "PILOT",
    label: "Known legal requirements for this plan are satisfied",
    help: "This is an attestation, not a complete regulatory determination by the tool.",
    noReason: "A known legal requirement is not satisfied."
  }));

  add(stopBinary({
    id: "pilot_qualified_current",
    step: "pilot",
    pave: "PILOT",
    label: "The intended PIC is qualified and current for the planned operation",
    noReason: "The intended PIC is not qualified/current for the operation."
  }));

  add(stopBinary({
    id: "required_currency_endorsements",
    step: "pilot",
    pave: "PILOT",
    label: "All applicable currency items and endorsements are satisfied",
    noReason: "A required currency item or endorsement is not satisfied."
  }));

  add(gradedQuestion({
    id: "recent_flight_proficiency",
    step: "pilot",
    pave: "PILOT",
    label: "Recent proficiency for the planned flight",
    options: Object.freeze([
      option("comfortable", "Current and proficient"),
      option("limited", "Limited recent practice"),
      option("not_proficient", "Not proficient for expected conditions"),
      option("unknown", "Unsure")
    ])
  }, {
    comfortable: LOW_RULE,
    limited: moderateRule("Limited recent practice increases workload and uncertainty."),
    not_proficient: highRule("The pilot reports insufficient proficiency for expected conditions.")
  }));

  add(gradedQuestion({
    id: "make_model_familiarity",
    step: "pilot",
    pave: "PILOT",
    label: "Recent familiarity with this make/model",
    options: Object.freeze([
      option("familiar", "Familiar and recently flown"),
      option("some", "Some experience; limited recency"),
      option("unfamiliar", "Unfamiliar or no recent experience"),
      option("unknown", "Unsure")
    ])
  }, {
    familiar: LOW_RULE,
    some: moderateRule("Limited make/model recency adds workload."),
    unfamiliar: highRule("Unfamiliarity with the aircraft requires mitigation or additional support.")
  }));

  add(gradedQuestion({
    id: "avionics_familiarity",
    step: "pilot",
    pave: "PILOT",
    label: "Familiarity with installed avionics and automation",
    options: Object.freeze([
      option("familiar", "Familiar and proficient"),
      option("some", "Some unfamiliar functions"),
      option("unfamiliar", "Unfamiliar with equipment needed for this flight"),
      option("unknown", "Unsure")
    ])
  }, {
    familiar: LOW_RULE,
    some: moderateRule("Some avionics unfamiliarity may increase workload."),
    unfamiliar: highRule("Required avionics or automation are unfamiliar to the pilot.")
  }));

  add(gradedQuestion({
    id: "recent_night_proficiency",
    step: "pilot",
    pave: "PILOT",
    label: "Recent night-flight proficiency",
    source: "FAA Airplane Flying Handbook, Night Operations",
    appliesWhen: Object.freeze([applies("day_night", "night")]),
    options: Object.freeze([
      option("proficient", "Current and proficient at night"),
      option("limited", "Current but limited recent night experience"),
      option("not_proficient", "Not proficient for planned night conditions"),
      option("unknown", "Unsure")
    ])
  }, {
    proficient: LOW_RULE,
    limited: moderateRule("Limited night recency increases visual and workload risk."),
    not_proficient: highRule("Night proficiency is insufficient for the planned conditions.")
  }));

  add(gradedQuestion({
    id: "recent_instrument_proficiency",
    step: "pilot",
    pave: "PILOT",
    label: "Instrument proficiency for the planned IFR conditions",
    appliesWhen: Object.freeze([applies("flight_rules", "IFR")]),
    options: Object.freeze([
      option("proficient", "Current and proficient"),
      option("limited", "Current with limited recent practice"),
      option("not_proficient", "Not proficient for expected conditions"),
      option("unknown", "Unsure")
    ])
  }, {
    proficient: LOW_RULE,
    limited: moderateRule("Instrument currency alone may not establish proficiency."),
    not_proficient: highRule("Instrument proficiency is insufficient for expected conditions.")
  }));

  add(stopBinary({
    id: "cfi_qualified_for_flight",
    step: "pilot",
    pave: "PILOT",
    label: "Instructor qualifications/currentity match this aircraft and operation",
    noReason: "The instructor role does not meet the needs of the planned flight.",
    appliesWhen: Object.freeze([applies("cfi_role", true)])
  }));

  add(stopBinary({
    id: "student_solo_within_limits",
    step: "pilot",
    pave: "PILOT",
    label: "Student solo is within every current endorsement and instructor limitation",
    noReason: "The student-solo plan is outside a current endorsement or instructor limitation.",
    appliesWhen: Object.freeze([
      applies("certificate_level", "student"),
      applies("student_solo", true)
    ])
  }));

  add(imsafeQuestion("imsafe_illness", "IMSAFE - Illness", "Assess symptoms only; do not enter a diagnosis."));
  add(imsafeQuestion("imsafe_medication", "IMSAFE - Medication", "Assess fitness/uncertainty only; do not enter medication names."));
  add(imsafeQuestion("imsafe_stress", "IMSAFE - Stress", "Consider personal, work, family, and financial stress."));
  add(imsafeQuestion("imsafe_alcohol", "IMSAFE - Alcohol", "Confirm fitness and applicable restrictions without recording consumption details."));
  add(imsafeQuestion("imsafe_fatigue", "IMSAFE - Fatigue", "Assess whether rest is adequate for the planned workload."));
  add(imsafeQuestion("imsafe_emotion", "IMSAFE - Emotion", "Assess whether emotional state could affect judgment or attention."));

  add(gradedQuestion({
    id: "personal_minimums_established",
    step: "pilot",
    pave: "PILOT",
    label: "Written personal minimums are established before this assessment",
    options: YES_NO_UNKNOWN
  }, {
    yes: LOW_RULE,
    no: highRule("Written personal limits should be established outside the pressure of a specific flight.")
  }));

  // Aircraft airworthiness, limitations, payload, performance, fuel, and equipment.
  add(stopBinary({
    id: "airworthy_status",
    step: "aircraft",
    pave: "AIRCRAFT",
    label: "Aircraft is airworthy for the planned flight",
    noReason: "The aircraft is not airworthy for this flight."
  }));

  add(gradedQuestion({
    id: "aircraft_discrepancies",
    step: "aircraft",
    pave: "AIRCRAFT",
    label: "Known aircraft discrepancies",
    options: Object.freeze([
      option("none", "None known"),
      option("resolved", "Resolved or properly addressed"),
      option("unresolved", "Unresolved safety/dispatch concern"),
      option("unknown", "Unknown / not verified")
    ])
  }, {
    none: LOW_RULE,
    resolved: LOW_RULE,
    unresolved: stopRule("An unresolved aircraft discrepancy affects the planned flight.")
  }));

  add(stopBinary({
    id: "afm_poh_within_limits",
    step: "aircraft",
    pave: "AIRCRAFT",
    label: "The plan remains within all applicable AFM/POH limitations",
    help: "A demonstrated value is not automatically treated as a limitation unless the aircraft documents make it one.",
    noReason: "The plan exceeds an applicable AFM/POH limitation."
  }));

  add(stopBinary({
    id: "required_equipment_status",
    step: "aircraft",
    pave: "AIRCRAFT",
    label: "Required and safety-critical equipment is available and operative",
    noReason: "Required equipment is unavailable or inoperative."
  }));

  add(stopBinary({
    id: "weight_balance_within_limits",
    step: "aircraft",
    pave: "AIRCRAFT",
    label: "Weight and balance are calculated and within approved limits",
    noReason: "Weight or center of gravity is outside approved limits."
  }));

  add(stopBinary({
    id: "performance_within_available",
    step: "aircraft",
    pave: "AIRCRAFT",
    label: "Calculated takeoff, climb, and landing performance fit the available conditions",
    help: "Use the applicable AFM/POH data and a pilot-selected safety margin.",
    noReason: "Required performance exceeds what is available."
  }));

  add(stopBinary({
    id: "fuel_reserve_legal",
    step: "aircraft",
    pave: "AIRCRAFT",
    label: "Fuel plan meets every applicable required reserve",
    noReason: "The fuel plan does not meet an applicable required reserve."
  }));

  add(personalLimitQuestion({
    id: "personal_fuel_reserve_minutes",
    step: "aircraft",
    pave: "AIRCRAFT",
    label: "Written personal fuel-reserve minimum",
    unit: "minutes"
  }));

  add(actualAgainstLimitQuestion({
    id: "planned_fuel_reserve_minutes",
    step: "aircraft",
    pave: "AIRCRAFT",
    label: "Planned fuel reserve at landing",
    unit: "minutes",
    limitQuestionId: "personal_fuel_reserve_minutes",
    mode: "minimum",
    breachReason: "Planned reserve is below the pilot's written personal reserve."
  }));

  add(personalLimitQuestion({
    id: "personal_runway_minimum_ft",
    step: "aircraft",
    pave: "AIRCRAFT",
    label: "Written minimum acceptable runway length for this aircraft/condition",
    unit: "feet"
  }));

  add(actualAgainstLimitQuestion({
    id: "available_runway_length_ft",
    step: "aircraft",
    pave: "AIRCRAFT",
    label: "Usable runway length",
    unit: "feet",
    limitQuestionId: "personal_runway_minimum_ft",
    mode: "minimum",
    breachReason: "Usable runway length is below the pilot's written personal minimum."
  }));

  add(stopBinary({
    id: "night_lighting_equipment",
    step: "aircraft",
    pave: "AIRCRAFT",
    label: "Aircraft lighting and equipment required for the night plan are operative",
    noReason: "Required night equipment is unavailable or inoperative.",
    appliesWhen: Object.freeze([applies("day_night", "night")])
  }));

  add(stopBinary({
    id: "ifr_aircraft_suitable",
    step: "aircraft",
    pave: "AIRCRAFT",
    label: "Aircraft is suitable and equipped for the planned IFR operation",
    noReason: "The aircraft is not suitable/equipped for this IFR operation.",
    appliesWhen: Object.freeze([applies("flight_rules", "IFR")])
  }));

  add(gradedQuestion({
    id: "ifr_equipment_familiarity",
    step: "aircraft",
    pave: "AIRCRAFT",
    label: "Required navigation/approach equipment is operative and familiar",
    appliesWhen: Object.freeze([applies("flight_rules", "IFR")]),
    options: Object.freeze([
      option("ready", "Operative and familiar"),
      option("limited", "Operative with limited familiarity"),
      option("not_ready", "Unavailable, inoperative, or unfamiliar for the plan"),
      option("unknown", "Unknown / not verified")
    ])
  }, {
    ready: LOW_RULE,
    limited: moderateRule("Limited equipment familiarity increases single-pilot IFR workload."),
    not_ready: stopRule("Equipment needed for the planned IFR operation is not ready for use.")
  }));

  // Environment: current information, airport/route, weather hazards, and
  // user-entered personal-limit comparisons.
  add(gradedQuestion({
    id: "weather_briefing_status",
    step: "environment",
    pave: "ENVIRONMENT",
    label: "Current weather information covers the full planned flight",
    source: "FAA AIM Chapter 7",
    incompleteValues: Object.freeze(["unknown", "not_checked"]),
    options: Object.freeze([
      option("current", "Current and complete"),
      option("partial", "Partial or needs update"),
      option("not_checked", "Not yet obtained"),
      option("unknown", "Unsure")
    ])
  }, {
    current: LOW_RULE,
    partial: highRule("Partial or stale weather information requires an updated assessment."),
    not_checked: highRule("Current weather information has not been obtained.")
  }));

  add(gradedQuestion({
    id: "notam_status",
    step: "environment",
    pave: "ENVIRONMENT",
    label: "Applicable NOTAM, TFR, airport, runway, and airspace information is current",
    source: SOURCE_PAVE,
    incompleteValues: Object.freeze(["unknown", "not_checked"]),
    options: Object.freeze([
      option("current", "Current and reviewed"),
      option("partial", "Partial or needs update"),
      option("not_checked", "Not yet obtained"),
      option("unknown", "Unsure")
    ])
  }, {
    current: LOW_RULE,
    partial: highRule("Incomplete airport/airspace information requires review."),
    not_checked: highRule("Applicable NOTAM/TFR information has not been reviewed.")
  }));

  add(stopBinary({
    id: "airport_route_available",
    step: "environment",
    pave: "ENVIRONMENT",
    label: "Planned route, airspace, airports, and runways are available and usable",
    noReason: "The current plan uses an unavailable, closed, or prohibited route/facility."
  }));

  add(gradedQuestion({
    id: "forecast_trend",
    step: "environment",
    pave: "ENVIRONMENT",
    label: "Forecast trend during the flight window",
    options: Object.freeze([
      option("improving", "Improving"),
      option("stable", "Stable"),
      option("deteriorating", "Deteriorating"),
      option("uncertain", "Uncertain / conflicting information")
    ]),
    incompleteValues: Object.freeze(["uncertain"])
  }, {
    improving: LOW_RULE,
    stable: LOW_RULE,
    deteriorating: highRule("Deteriorating conditions can compress planned safety margins."),
    uncertain: highRule("Conflicting or uncertain weather information needs resolution.")
  }));

  add(gradedQuestion({
    id: "thunderstorm_exposure",
    step: "environment",
    pave: "ENVIRONMENT",
    label: "Convective weather relative to the route",
    source: "FAA AIM Chapter 7 and FAA-H-8083-2A",
    options: Object.freeze([
      option("none", "None affecting the route"),
      option("isolated_avoidable", "Isolated and avoidable with a clear plan"),
      option("line_or_embedded", "Solid line, embedded, or unavoidable exposure"),
      option("unknown", "Unknown / not verified")
    ])
  }, {
    none: LOW_RULE,
    isolated_avoidable: highRule("Convective activity near the route requires avoidance and reassessment."),
    line_or_embedded: stopRule("A solid line, embedded convection, or unavoidable thunderstorm exposure is a red-risk condition.")
  }));

  add(gradedQuestion({
    id: "icing_plan_status",
    step: "environment",
    pave: "ENVIRONMENT",
    label: "Icing exposure and aircraft/plan suitability",
    options: Object.freeze([
      option("none", "No icing exposure identified"),
      option("avoided", "Possible icing is avoided by route/time/altitude"),
      option("suitable", "Exposure assessed within aircraft approval/capability and pilot limits"),
      option("unsuitable", "Known/forecast exposure with an unsuitable aircraft or plan"),
      option("unknown", "Unknown / not verified")
    ])
  }, {
    none: LOW_RULE,
    avoided: moderateRule("Possible icing remains a condition to monitor after an avoidance plan."),
    suitable: moderateRule("Icing exposure remains a material hazard even with suitable equipment and planning."),
    unsuitable: stopRule("The planned icing exposure is not suitable for the aircraft or plan.")
  }));

  add(gradedQuestion({
    id: "turbulence_windshear_status",
    step: "environment",
    pave: "ENVIRONMENT",
    label: "Turbulence, wind shear, or microburst exposure",
    source: "FAA Aviation Weather Handbook and AIM Chapter 7",
    options: Object.freeze([
      option("none", "No material hazard identified"),
      option("moderate", "Material turbulence or gust/wind-shear concern"),
      option("severe_or_alert", "Severe turbulence or active wind-shear/microburst threat"),
      option("unknown", "Unknown / not verified")
    ])
  }, {
    none: LOW_RULE,
    moderate: highRule("Material turbulence or wind-shear exposure requires mitigation."),
    severe_or_alert: stopRule("Severe turbulence or an active wind-shear/microburst threat is a stop condition for the current plan.")
  }));

  add(gradedQuestion({
    id: "terrain_route_status",
    step: "environment",
    pave: "ENVIRONMENT",
    label: "Terrain, obstacle, and overwater risk along the route",
    source: SOURCE_PAVE,
    options: Object.freeze([
      option("adequate", "Familiar with adequate margins and escape options"),
      option("unfamiliar", "Unfamiliar or remote terrain/overwater segment"),
      option("limited_margin", "Limited terrain/obstacle margin or escape options"),
      option("unknown", "Unknown / not evaluated")
    ])
  }, {
    adequate: LOW_RULE,
    unfamiliar: moderateRule("Unfamiliar or remote terrain increases planning and diversion risk."),
    limited_margin: highRule("Terrain/obstacle margins or escape options are limited.")
  }));

  add(gradedQuestion({
    id: "airport_familiarity",
    step: "environment",
    pave: "ENVIRONMENT",
    label: "Departure, destination, and alternate airport familiarity",
    options: Object.freeze([
      option("familiar", "Familiar"),
      option("reviewed", "Unfamiliar but thoroughly reviewed"),
      option("unfamiliar", "Unfamiliar and not fully reviewed"),
      option("unknown", "Unknown")
    ])
  }, {
    familiar: LOW_RULE,
    reviewed: moderateRule("An unfamiliar airport can add workload despite advance review."),
    unfamiliar: highRule("An unfamiliar airport has not been sufficiently reviewed.")
  }));

  add(gradedQuestion({
    id: "runway_condition",
    step: "environment",
    pave: "ENVIRONMENT",
    label: "Expected runway surface condition",
    options: Object.freeze([
      option("dry", "Dry / normal for planned operation"),
      option("wet", "Wet or reduced braking expected"),
      option("contaminated", "Contaminated or substantially degraded"),
      option("unknown", "Unknown / not verified")
    ])
  }, {
    dry: LOW_RULE,
    wet: moderateRule("Wet or reduced-braking conditions increase landing risk."),
    contaminated: highRule("Contaminated or substantially degraded runway conditions require mitigation.")
  }));

  add(gradedQuestion({
    id: "diversion_options",
    step: "environment",
    pave: "ENVIRONMENT",
    label: "Practical diversion, delay, and alternate options",
    options: Object.freeze([
      option("available", "Multiple practical options"),
      option("limited", "Options are limited"),
      option("none", "No practical escape/diversion option"),
      option("unknown", "Unknown / not evaluated")
    ])
  }, {
    available: LOW_RULE,
    limited: moderateRule("Limited diversion options reduce flexibility."),
    none: highRule("No practical escape or diversion option is available.")
  }));

  add(personalLimitQuestion({
    id: "personal_surface_wind_max_kt",
    step: "environment",
    pave: "ENVIRONMENT",
    label: "Written maximum surface wind",
    unit: "knots"
  }));

  add(actualAgainstLimitQuestion({
    id: "forecast_surface_wind_max_kt",
    step: "environment",
    pave: "ENVIRONMENT",
    label: "Maximum forecast/observed surface wind",
    unit: "knots",
    limitQuestionId: "personal_surface_wind_max_kt",
    mode: "maximum",
    breachReason: "Surface wind exceeds the pilot's written personal maximum."
  }));

  add(personalLimitQuestion({
    id: "personal_gust_spread_max_kt",
    step: "environment",
    pave: "ENVIRONMENT",
    label: "Written maximum gust spread",
    unit: "knots"
  }));

  add(actualAgainstLimitQuestion({
    id: "forecast_gust_spread_max_kt",
    step: "environment",
    pave: "ENVIRONMENT",
    label: "Maximum forecast/observed gust spread",
    unit: "knots",
    limitQuestionId: "personal_gust_spread_max_kt",
    mode: "maximum",
    breachReason: "Gust spread exceeds the pilot's written personal maximum."
  }));

  add(personalLimitQuestion({
    id: "personal_crosswind_max_kt",
    step: "environment",
    pave: "ENVIRONMENT",
    label: "Written maximum crosswind component",
    help: "Enter the pilot/CFI limit. Do not assume certificate level or a demonstrated POH value is a universal safe limit.",
    unit: "knots"
  }));

  add(actualAgainstLimitQuestion({
    id: "forecast_crosswind_max_kt",
    step: "environment",
    pave: "ENVIRONMENT",
    label: "Maximum forecast/observed crosswind component",
    unit: "knots",
    limitQuestionId: "personal_crosswind_max_kt",
    mode: "maximum",
    breachReason: "Crosswind exceeds the pilot's written personal maximum."
  }));

  add(gradedQuestion({
    id: "night_visual_environment",
    step: "environment",
    pave: "ENVIRONMENT",
    label: "Night visual references, lighting, terrain, and emergency options",
    source: "FAA Airplane Flying Handbook, Night Operations",
    appliesWhen: Object.freeze([applies("day_night", "night")]),
    options: Object.freeze([
      option("adequate", "Adequate visual references and options"),
      option("limited", "Sparse lighting or reduced visual references"),
      option("inadequate", "Inadequate outside references or emergency options"),
      option("unknown", "Unknown / not evaluated")
    ])
  }, {
    adequate: LOW_RULE,
    limited: highRule("Sparse lighting or reduced horizon cues materially increase night risk."),
    inadequate: stopRule("Outside references or night emergency options are inadequate for the current plan.")
  }));

  add(gradedQuestion({
    id: "airport_lighting_aids",
    step: "environment",
    pave: "ENVIRONMENT",
    label: "Airport lighting and approach/visual aids are adequate and available",
    appliesAny: Object.freeze([
      applies("day_night", "night"),
      applies("flight_rules", "IFR")
    ]),
    options: Object.freeze([
      option("adequate", "Adequate and available"),
      option("limited", "Limited or some aids unavailable"),
      option("inadequate", "Inadequate for the plan"),
      option("unknown", "Unknown / not verified")
    ])
  }, {
    adequate: LOW_RULE,
    limited: moderateRule("Limited lighting or approach aids add workload and uncertainty."),
    inadequate: highRule("Available lighting or approach aids are inadequate for the current plan.")
  }));

  // VFR-only planning factors and personal weather limits.
  add(stopBinary({
    id: "vfr_conditions_legal",
    step: "environment",
    pave: "ENVIRONMENT",
    label: "The VFR route/airspace conditions meet applicable requirements",
    noReason: "The planned VFR operation does not meet applicable requirements.",
    appliesWhen: Object.freeze([applies("flight_rules", "VFR")])
  }));

  add(gradedQuestion({
    id: "vfr_briefing_recommendation",
    step: "environment",
    pave: "ENVIRONMENT",
    label: "Flight Service VFR recommendation, if issued",
    source: "FAA AIM Chapter 7",
    appliesWhen: Object.freeze([applies("flight_rules", "VFR")]),
    options: Object.freeze([
      option("none", "No VFR-not-recommended statement"),
      option("not_recommended", "VFR flight not recommended"),
      option("not_applicable", "No such recommendation applicable"),
      option("unknown", "Unknown / briefing incomplete")
    ])
  }, {
    none: LOW_RULE,
    not_applicable: LOW_RULE,
    not_recommended: highRule("VFR flight not recommended is advisory but requires mitigation and review before proceeding.")
  }));

  add(personalLimitQuestion({
    id: "personal_vfr_ceiling_min_ft",
    step: "environment",
    pave: "ENVIRONMENT",
    label: "Written minimum VFR ceiling for this day/night and route",
    unit: "feet AGL",
    appliesWhen: Object.freeze([applies("flight_rules", "VFR")])
  }));

  add(actualAgainstLimitQuestion({
    id: "forecast_vfr_ceiling_min_ft",
    step: "environment",
    pave: "ENVIRONMENT",
    label: "Lowest forecast/observed VFR ceiling along the route",
    unit: "feet AGL",
    limitQuestionId: "personal_vfr_ceiling_min_ft",
    mode: "minimum",
    breachReason: "Ceiling is below the pilot's written VFR personal minimum.",
    appliesWhen: Object.freeze([applies("flight_rules", "VFR")])
  }));

  add(personalLimitQuestion({
    id: "personal_vfr_visibility_min_sm",
    step: "environment",
    pave: "ENVIRONMENT",
    label: "Written minimum VFR visibility for this day/night and route",
    unit: "statute miles",
    appliesWhen: Object.freeze([applies("flight_rules", "VFR")])
  }));

  add(actualAgainstLimitQuestion({
    id: "forecast_vfr_visibility_min_sm",
    step: "environment",
    pave: "ENVIRONMENT",
    label: "Lowest forecast/observed VFR visibility along the route",
    unit: "statute miles",
    limitQuestionId: "personal_vfr_visibility_min_sm",
    mode: "minimum",
    breachReason: "Visibility is below the pilot's written VFR personal minimum.",
    appliesWhen: Object.freeze([applies("flight_rules", "VFR")])
  }));

  add(gradedQuestion({
    id: "vfr_escape_plan",
    step: "environment",
    pave: "ENVIRONMENT",
    label: "VFR turn-around, landing, and weather-escape plan",
    appliesWhen: Object.freeze([applies("flight_rules", "VFR")]),
    options: Object.freeze([
      option("clear", "Clear triggers and multiple options"),
      option("limited", "Plan exists but options are limited"),
      option("none", "No practical escape plan"),
      option("unknown", "Unknown / not evaluated")
    ])
  }, {
    clear: LOW_RULE,
    limited: moderateRule("Limited VFR escape options reduce flexibility."),
    none: highRule("The VFR plan lacks a practical weather escape or landing option.")
  }));

  // IFR-only eligibility, plan, alternate, and approach factors.
  add(stopBinary({
    id: "ifr_pic_eligibility",
    step: "pilot",
    pave: "PILOT",
    label: "Intended PIC is appropriately rated, current, and authorized for this IFR plan",
    noReason: "The intended PIC is not eligible/current for the IFR operation.",
    appliesWhen: Object.freeze([
      applies("flight_rules", "IFR"),
      applies("intended_pic", true)
    ])
  }));

  add(stopBinary({
    id: "ifr_plan_legal",
    step: "environment",
    pave: "ENVIRONMENT",
    label: "IFR route, fuel, alternate, and procedure requirements are satisfied",
    noReason: "A known requirement for the IFR plan is not satisfied.",
    appliesWhen: Object.freeze([applies("flight_rules", "IFR")])
  }));

  add(gradedQuestion({
    id: "ifr_destination_alternate",
    step: "environment",
    pave: "ENVIRONMENT",
    label: "Destination and alternate provide practical margins and diversion options",
    appliesWhen: Object.freeze([applies("flight_rules", "IFR")]),
    options: Object.freeze([
      option("adequate", "Adequate margins and options"),
      option("limited", "Legal but limited margins/options"),
      option("inadequate", "Inadequate for the current plan"),
      option("unknown", "Unknown / not evaluated")
    ])
  }, {
    adequate: LOW_RULE,
    limited: highRule("Destination/alternate margins or diversion options are limited."),
    inadequate: stopRule("Destination/alternate planning is inadequate for the current IFR plan.")
  }));

  add(stopBinary({
    id: "approach_minima_legal",
    step: "environment",
    pave: "ENVIRONMENT",
    label: "Planned approach and conditions meet applicable requirements",
    noReason: "The planned approach is known not to meet applicable requirements.",
    appliesWhen: Object.freeze([
      applies("flight_rules", "IFR"),
      applies("approach_planned", true)
    ])
  }));

  add(personalLimitQuestion({
    id: "personal_ifr_ceiling_margin_ft",
    step: "environment",
    pave: "ENVIRONMENT",
    label: "Written personal ceiling margin above the planned approach minimum",
    unit: "feet",
    appliesWhen: Object.freeze([
      applies("flight_rules", "IFR"),
      applies("approach_planned", true)
    ])
  }));

  add(actualAgainstLimitQuestion({
    id: "forecast_ifr_ceiling_margin_ft",
    step: "environment",
    pave: "ENVIRONMENT",
    label: "Forecast ceiling margin above the planned approach minimum",
    unit: "feet",
    limitQuestionId: "personal_ifr_ceiling_margin_ft",
    mode: "minimum",
    breachReason: "Approach ceiling margin is below the pilot's written personal margin.",
    appliesWhen: Object.freeze([
      applies("flight_rules", "IFR"),
      applies("approach_planned", true)
    ])
  }));

  add(personalLimitQuestion({
    id: "personal_ifr_visibility_margin_sm",
    step: "environment",
    pave: "ENVIRONMENT",
    label: "Written personal visibility margin above the planned approach minimum",
    unit: "statute miles",
    stepValue: 0.25,
    appliesWhen: Object.freeze([
      applies("flight_rules", "IFR"),
      applies("approach_planned", true)
    ])
  }));

  add(actualAgainstLimitQuestion({
    id: "forecast_ifr_visibility_margin_sm",
    step: "environment",
    pave: "ENVIRONMENT",
    label: "Forecast visibility margin above the planned approach minimum",
    unit: "statute miles",
    stepValue: 0.25,
    limitQuestionId: "personal_ifr_visibility_margin_sm",
    mode: "minimum",
    breachReason: "Approach visibility margin is below the pilot's written personal margin.",
    appliesWhen: Object.freeze([
      applies("flight_rules", "IFR"),
      applies("approach_planned", true)
    ])
  }));

  add(gradedQuestion({
    id: "missed_approach_diversion_plan",
    step: "environment",
    pave: "ENVIRONMENT",
    label: "Missed-approach and diversion triggers are specific and practical",
    appliesWhen: Object.freeze([
      applies("flight_rules", "IFR"),
      applies("approach_planned", true)
    ]),
    options: Object.freeze([
      option("clear", "Clear triggers and plan"),
      option("limited", "Plan exists but is limited"),
      option("none", "No practical plan"),
      option("unknown", "Unknown / not evaluated")
    ])
  }, {
    clear: LOW_RULE,
    limited: moderateRule("Missed-approach or diversion options are limited."),
    none: highRule("No practical missed-approach/diversion plan is established.")
  }));

  // External pressure, passenger, 5P programming, and alternatives.
  add(gradedQuestion({
    id: "schedule_pressure",
    step: "external",
    pave: "EXTERNAL",
    label: "Schedule or must-arrive pressure",
    source: SOURCE_PAVE,
    options: Object.freeze([
      option("none", "No meaningful schedule pressure"),
      option("manageable", "Pressure exists but alternatives are accepted"),
      option("must_arrive", "Strong must-arrive or get-home pressure"),
      option("unknown", "Unsure")
    ])
  }, {
    none: LOW_RULE,
    manageable: moderateRule("Schedule pressure exists and should remain visible in the decision."),
    must_arrive: highRule("Strong schedule pressure can distort assessment of other hazards.")
  }));

  add(gradedQuestion({
    id: "passenger_pressure",
    step: "external",
    pave: "EXTERNAL",
    label: "Passenger expectations, anxiety, or distraction",
    source: SOURCE_IMSAFE,
    appliesWhen: Object.freeze([applies("passengers_onboard", true)]),
    options: Object.freeze([
      option("none", "No material passenger pressure"),
      option("manageable", "Manageable needs or expectations"),
      option("significant", "Significant pressure or distraction"),
      option("unknown", "Unsure")
    ])
  }, {
    none: LOW_RULE,
    manageable: moderateRule("Passenger needs may add workload."),
    significant: highRule("Passenger pressure or distraction is significant.")
  }));

  add(gradedQuestion({
    id: "alternate_transport",
    step: "external",
    pave: "EXTERNAL",
    label: "Alternative transport, lodging, or delay plan",
    options: Object.freeze([
      option("available", "Practical alternative accepted"),
      option("limited", "Alternative is limited"),
      option("none", "No alternative plan"),
      option("unknown", "Unknown / not considered")
    ])
  }, {
    available: LOW_RULE,
    limited: moderateRule("Limited alternatives can increase pressure to continue."),
    none: highRule("No alternative plan increases pressure to complete the flight.")
  }));

  add(gradedQuestion({
    id: "time_buffer",
    step: "external",
    pave: "EXTERNAL",
    label: "Time buffer for delay, fuel stop, diversion, or cancellation",
    options: Object.freeze([
      option("adequate", "Adequate buffer"),
      option("limited", "Limited buffer"),
      option("none", "No practical buffer"),
      option("unknown", "Unknown")
    ])
  }, {
    adequate: LOW_RULE,
    limited: moderateRule("A limited time buffer can amplify external pressure."),
    none: highRule("No practical time buffer exists for changes to the plan.")
  }));

  add(gradedQuestion({
    id: "crew_roles_clear",
    step: "external",
    pave: "EXTERNAL",
    label: "PIC, instructor, safety-pilot, and passenger roles are explicit",
    appliesAny: Object.freeze([
      applies("passengers_onboard", true),
      applies("cfi_role", true),
      applies("training_flight", true)
    ]),
    options: Object.freeze([
      option("clear", "Roles and transfer of control are clear"),
      option("partial", "Some role ambiguity remains"),
      option("unclear", "PIC/crew roles are unclear"),
      option("unknown", "Unknown")
    ])
  }, {
    clear: LOW_RULE,
    partial: moderateRule("Some crew-role ambiguity remains."),
    unclear: highRule("PIC or crew responsibilities are unclear.")
  }));

  add(gradedQuestion({
    id: "programming_plan",
    step: "external",
    pave: "EXTERNAL",
    label: "5P programming and automation workload is planned before high-workload phases",
    source: SOURCE_IMSAFE,
    options: Object.freeze([
      option("preplanned", "Preplanned and familiar"),
      option("some", "Some in-flight programming expected"),
      option("high", "High or unfamiliar programming workload expected"),
      option("unknown", "Unknown")
    ])
  }, {
    preplanned: LOW_RULE,
    some: moderateRule("In-flight programming may add workload."),
    high: highRule("High or unfamiliar programming workload is expected during critical phases.")
  }));

  QUESTIONS = Object.freeze(QUESTIONS.slice());

  function cloneState(state) {
    return JSON.parse(JSON.stringify(state || createDefaultAssessment()));
  }

  function mitigationDefinition(id, label, description, allowedFields) {
    return Object.freeze({
      id: id,
      label: label,
      description: description,
      allowedFields: Object.freeze(allowedFields.slice()),
      apply: function (state, verifiedUpdates) {
        var next = cloneState(state);
        var appliedFields = [];
        next.answers = next.answers || {};

        Object.keys(verifiedUpdates || {}).forEach(function (field) {
          if (allowedFields.indexOf(field) !== -1 && verifiedUpdates[field] !== undefined) {
            next.answers[field] = verifiedUpdates[field];
            appliedFields.push(field);
          }
        });

        if (appliedFields.length) {
          next.mitigationHistory = next.mitigationHistory || [];
          next.mitigationHistory.push({ id: id, fields: appliedFields });
        }

        return next;
      }
    });
  }

  // Mitigations only change allow-listed, real assessment inputs. Notes and
  // mitigation selections alone are deliberately ignored by the risk engine.
  var MITIGATIONS = Object.freeze([
    mitigationDefinition(
      "delay_for_weather",
      "Delay for updated/better weather",
      "Update the assessment only after obtaining new weather for a changed departure window.",
      [
        "weather_briefing_status", "forecast_trend", "forecast_surface_wind_max_kt",
        "forecast_gust_spread_max_kt", "forecast_crosswind_max_kt",
        "forecast_vfr_ceiling_min_ft", "forecast_vfr_visibility_min_sm",
        "forecast_ifr_ceiling_margin_ft", "forecast_ifr_visibility_margin_sm",
        "thunderstorm_exposure", "icing_plan_status", "turbulence_windshear_status"
      ]
    ),
    mitigationDefinition(
      "reroute_or_change_altitude",
      "Reroute or change altitude",
      "Use verified route/altitude changes that actually alter exposure and diversion options.",
      ["thunderstorm_exposure", "icing_plan_status", "terrain_route_status", "diversion_options", "airport_route_available"]
    ),
    mitigationDefinition(
      "change_aircraft",
      "Use a different suitable aircraft",
      "Re-enter airworthiness, equipment, limitations, performance, and familiarity for the actual replacement aircraft.",
      [
        "airworthy_status", "aircraft_discrepancies", "afm_poh_within_limits",
        "required_equipment_status", "performance_within_available", "ifr_aircraft_suitable",
        "ifr_equipment_familiarity", "make_model_familiarity", "avionics_familiarity"
      ]
    ),
    mitigationDefinition(
      "reduce_load_recalculate",
      "Reduce load and recalculate",
      "Update weight/balance and performance only after a new calculation.",
      ["weight_balance_within_limits", "performance_within_available"]
    ),
    mitigationDefinition(
      "fuel_stop_or_add_reserve",
      "Add a fuel stop or reserve",
      "Update the actual fuel plan and reserve; selecting this mitigation alone earns no credit.",
      ["fuel_reserve_legal", "planned_fuel_reserve_minutes", "diversion_options"]
    ),
    mitigationDefinition(
      "qualified_crew_plan",
      "Change to a qualified crew/PIC plan",
      "Record only an actual role/crew change; this does not waive law, aircraft limits, or personal minimums.",
      ["cfi_qualified_for_flight", "crew_roles_clear", "pilot_qualified_current", "required_currency_endorsements"]
    ),
    mitigationDefinition(
      "remove_external_pressure",
      "Remove external pressure",
      "Change passenger expectations, schedule, time buffer, or alternate transport in the real plan.",
      ["schedule_pressure", "passenger_pressure", "alternate_transport", "time_buffer"]
    )
  ]);

  function createDefaultAssessment(presetId) {
    var preset = PROFILE_PRESETS.find(function (candidate) {
      return candidate.id === presetId;
    });
    var patch = preset ? preset.patch : {};

    return {
      version: 1,
      profile: {
        certificate: Object.prototype.hasOwnProperty.call(patch, "certificate") ? patch.certificate : null,
        ratings: {
          instrument: Object.prototype.hasOwnProperty.call(patch, "instrument") ? patch.instrument : null
        },
        roles: {
          cfi: Object.prototype.hasOwnProperty.call(patch, "cfi") ? patch.cfi : null
        }
      },
      operation: {
        intendedPIC: null,
        rules: null,
        dayNight: null,
        studentSolo: false,
        trainingFlight: false,
        passengers: false,
        approachPlanned: false
      },
      answers: {},
      mitigationHistory: [],
      notes: ""
    };
  }

  return Object.freeze({
    STEPS: STEPS,
    PROFILE_PRESETS: PROFILE_PRESETS,
    QUESTIONS: QUESTIONS,
    MITIGATIONS: MITIGATIONS,
    createDefaultAssessment: createDefaultAssessment
  });
});
