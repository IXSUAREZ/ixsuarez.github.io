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

  var SECTIONS = Object.freeze([
    Object.freeze({ id: "pilot", label: "Pilot", short: "P" }),
    Object.freeze({ id: "aircraft", label: "Aircraft", short: "A" }),
    Object.freeze({ id: "environment", label: "enVironment", short: "V" }),
    Object.freeze({ id: "external", label: "External pressures", short: "E" })
  ]);

  var CONTEXT_OPTIONS = Object.freeze({
    certificate: Object.freeze([
      Object.freeze({ value: "student", label: "Student" }),
      Object.freeze({ value: "private", label: "Private" }),
      Object.freeze({ value: "commercial", label: "Commercial" }),
      Object.freeze({ value: "atp", label: "ATP" })
    ]),
    role: Object.freeze([
      Object.freeze({ value: "acting_pic", label: "Acting PIC" }),
      Object.freeze({ value: "with_instructor", label: "With instructor" }),
      Object.freeze({ value: "student_solo", label: "Student solo" })
    ]),
    rules: Object.freeze([
      Object.freeze({ value: "vfr", label: "VFR" }),
      Object.freeze({ value: "ifr", label: "IFR" })
    ]),
    dayNight: Object.freeze([
      Object.freeze({ value: "day", label: "Day" }),
      Object.freeze({ value: "night", label: "Night" })
    ])
  });

  var ANSWERS = Object.freeze({
    GOOD: "good",
    CONCERN: "concern",
    STOP: "stop",
    UNKNOWN: "unknown"
  });

  function applies(field, equals) {
    return Object.freeze({ field: field, equals: equals });
  }

  function factor(config) {
    return Object.freeze(Object.assign({
      core: true,
      options: Object.freeze([
        Object.freeze({ value: ANSWERS.GOOD, label: "Confirmed" }),
        Object.freeze({ value: ANSWERS.CONCERN, label: "Concern" }),
        Object.freeze({ value: ANSWERS.STOP, label: "Not acceptable" }),
        Object.freeze({ value: ANSWERS.UNKNOWN, label: "Verify" })
      ])
    }, config));
  }

  var FACTORS = Object.freeze([
    factor({
      id: "pilot_legal_authorized",
      section: "pilot",
      label: "Legal and authorized for this flight",
      prompt: "Required certificates, ratings, currency, endorsements, and operating permissions are confirmed.",
      goodLabel: "Confirmed",
      concernLabel: "Needs review",
      stopLabel: "Not legal / authorized",
      unknownLabel: "Verify"
    }),
    factor({
      id: "pilot_imsafe",
      section: "pilot",
      label: "IMSAFE fitness",
      prompt: "Illness, medication, stress, alcohol, fatigue, eating, and emotion are acceptable for the planned workload.",
      goodLabel: "Fit",
      concernLabel: "Concern",
      stopLabel: "Not fit",
      unknownLabel: "Unsure"
    }),
    factor({
      id: "pilot_proficiency",
      section: "pilot",
      label: "Proficient for the conditions",
      prompt: "Recent experience, make/model familiarity, and avionics proficiency match this flight.",
      goodLabel: "Proficient",
      concernLabel: "Limited",
      stopLabel: "Not proficient",
      unknownLabel: "Unsure"
    }),
    factor({
      id: "student_solo_readiness",
      section: "pilot",
      label: "Student-solo authorization and limits",
      prompt: "The solo endorsement is current for this make/model and the flight stays within every instructor limitation.",
      core: false,
      appliesWhen: Object.freeze([applies("role", "student_solo")]),
      goodLabel: "Confirmed",
      concernLabel: "Ask instructor",
      stopLabel: "Outside limits",
      unknownLabel: "Verify"
    }),
    factor({
      id: "ifr_readiness",
      section: "pilot",
      label: "IFR readiness",
      prompt: "The pilot, aircraft, route, fuel, alternate, and procedures are legal, current, and proficient for the expected IFR conditions.",
      core: false,
      appliesWhen: Object.freeze([applies("rules", "ifr")]),
      goodLabel: "Ready",
      concernLabel: "Needs review",
      stopLabel: "Not ready",
      unknownLabel: "Verify"
    }),
    factor({
      id: "aircraft_airworthy_equipped",
      section: "aircraft",
      label: "Airworthy and equipped",
      prompt: "Inspections, discrepancies, required equipment, documents, and operating limitations are resolved for this flight.",
      goodLabel: "Confirmed",
      concernLabel: "Question",
      stopLabel: "Not airworthy / equipped",
      unknownLabel: "Verify"
    }),
    factor({
      id: "aircraft_performance_margin",
      section: "aircraft",
      label: "Weight, balance, and performance margin",
      prompt: "Actual loading and AFM/POH calculations provide an acceptable takeoff, climb, and landing margin.",
      goodLabel: "Margin confirmed",
      concernLabel: "Thin margin",
      stopLabel: "Outside limits",
      unknownLabel: "Calculate"
    }),
    factor({
      id: "aircraft_fuel_plan",
      section: "aircraft",
      label: "Fuel plan and reserve",
      prompt: "Usable fuel, required reserve, saved personal reserve, and diversion fuel are confirmed.",
      goodLabel: "Confirmed",
      concernLabel: "Thin margin",
      stopLabel: "Insufficient",
      unknownLabel: "Calculate"
    }),
    factor({
      id: "environment_current_information",
      section: "environment",
      label: "Current briefing and flight information",
      prompt: "Weather, NOTAMs, TFRs, runway/airport status, airspace, and route information are current for the whole flight.",
      goodLabel: "Current",
      concernLabel: "Needs update",
      stopLabel: "Unavailable / prohibited",
      unknownLabel: "Obtain / verify"
    }),
    factor({
      id: "environment_inside_limits",
      section: "environment",
      label: "Inside every applicable limit",
      prompt: "The plan is inside regulations, AFM/POH limits, instructor/operator constraints, and written personal minimums.",
      goodLabel: "Inside limits",
      concernLabel: "Near a limit",
      stopLabel: "Outside a limit",
      unknownLabel: "Compare"
    }),
    factor({
      id: "environment_significant_hazards",
      section: "environment",
      label: "Significant hazards are acceptable",
      prompt: "Convection, icing, turbulence, wind shear, terrain, obstacles, runway condition, and density altitude are addressed.",
      goodLabel: "No material concern",
      concernLabel: "Hazard present",
      stopLabel: "Unacceptable exposure",
      unknownLabel: "Evaluate"
    }),
    factor({
      id: "environment_escape_plan",
      section: "environment",
      label: "Escape and diversion plan",
      prompt: "Specific triggers and practical options exist to delay, turn around, land, divert, or cancel.",
      goodLabel: "Plan ready",
      concernLabel: "Options limited",
      stopLabel: "No practical option",
      unknownLabel: "Build plan"
    }),
    factor({
      id: "night_readiness",
      section: "environment",
      label: "Night readiness",
      prompt: "Night proficiency, lighting, visual references, terrain clearance, equipment, and emergency options are acceptable.",
      core: false,
      appliesWhen: Object.freeze([applies("dayNight", "night")]),
      goodLabel: "Ready",
      concernLabel: "Limited",
      stopLabel: "Not ready",
      unknownLabel: "Verify"
    }),
    factor({
      id: "external_pressure",
      section: "external",
      label: "External pressure is controlled",
      prompt: "Schedule, passenger, cost, completion, and get-home pressure are not distorting the decision.",
      goodLabel: "Controlled",
      concernLabel: "Pressure present",
      stopLabel: "Decision distorted",
      unknownLabel: "Pause / assess"
    }),
    factor({
      id: "external_flexibility",
      section: "external",
      label: "The plan can change",
      prompt: "Time, transportation, lodging, fuel-stop, and communication alternatives are practical and accepted.",
      goodLabel: "Flexible",
      concernLabel: "Limited",
      stopLabel: "No workable alternative",
      unknownLabel: "Arrange options"
    })
  ]);

  var PERSONAL_MINIMUM_FIELDS = Object.freeze([
    Object.freeze({ id: "vfr_day_ceiling_ft", label: "Day VFR ceiling", unit: "ft AGL", step: 100 }),
    Object.freeze({ id: "vfr_day_visibility_sm", label: "Day VFR visibility", unit: "SM", step: 0.5, studentSoloFloor: 3 }),
    Object.freeze({ id: "vfr_night_ceiling_ft", label: "Night VFR ceiling", unit: "ft AGL", step: 100 }),
    Object.freeze({ id: "vfr_night_visibility_sm", label: "Night VFR visibility", unit: "SM", step: 0.5, studentSoloFloor: 5 }),
    Object.freeze({ id: "steady_wind_max_kt", label: "Maximum steady wind", unit: "kt", step: 1 }),
    Object.freeze({ id: "crosswind_max_kt", label: "Maximum crosswind", unit: "kt", step: 1 }),
    Object.freeze({ id: "gust_spread_max_kt", label: "Maximum gust spread", unit: "kt", step: 1 }),
    Object.freeze({ id: "fuel_day_min", label: "Day fuel reserve", unit: "min", step: 5 }),
    Object.freeze({ id: "fuel_night_min", label: "Night fuel reserve", unit: "min", step: 5 }),
    Object.freeze({ id: "ifr_ceiling_margin_ft", label: "IFR ceiling margin above approach minimum", unit: "ft", step: 100 }),
    Object.freeze({ id: "ifr_visibility_margin_sm", label: "IFR visibility margin above approach minimum", unit: "SM", step: 0.25 })
  ]);

  function createDefaultContext() {
    return {
      certificate: "student",
      role: "with_instructor",
      rules: "vfr",
      dayNight: "day"
    };
  }

  function normalizeContext(input) {
    var source = input && typeof input === "object" ? input : {};
    var context = Object.assign(createDefaultContext(), source);
    var certificates = CONTEXT_OPTIONS.certificate.map(function (option) { return option.value; });
    var roles = CONTEXT_OPTIONS.role.map(function (option) { return option.value; });
    var rules = CONTEXT_OPTIONS.rules.map(function (option) { return option.value; });
    var times = CONTEXT_OPTIONS.dayNight.map(function (option) { return option.value; });

    if (certificates.indexOf(context.certificate) === -1) { context.certificate = "student"; }
    if (roles.indexOf(context.role) === -1) { context.role = "with_instructor"; }
    if (rules.indexOf(context.rules) === -1) { context.rules = "vfr"; }
    if (times.indexOf(context.dayNight) === -1) { context.dayNight = "day"; }

    if (context.certificate === "student" && context.role === "acting_pic") {
      context.role = "with_instructor";
    }
    if (context.certificate !== "student" && context.role === "student_solo") {
      context.role = "acting_pic";
    }
    if (context.role === "student_solo") {
      context.rules = "vfr";
    }
    return context;
  }

  function createBlankMinimums() {
    return PERSONAL_MINIMUM_FIELDS.reduce(function (values, field) {
      values[field.id] = "";
      return values;
    }, {});
  }

  function createBlankFlight() {
    return { version: 2, answers: {}, updatedAt: null };
  }

  return Object.freeze({
    SECTIONS: SECTIONS,
    CONTEXT_OPTIONS: CONTEXT_OPTIONS,
    ANSWERS: ANSWERS,
    FACTORS: FACTORS,
    PERSONAL_MINIMUM_FIELDS: PERSONAL_MINIMUM_FIELDS,
    createDefaultContext: createDefaultContext,
    normalizeContext: normalizeContext,
    createBlankMinimums: createBlankMinimums,
    createBlankFlight: createBlankFlight
  });
});
