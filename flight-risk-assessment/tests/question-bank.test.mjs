import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const BANK = require("../questions.js");
const { applicableQuestions } = require("../risk-model.js");

const { STEPS, PROFILE_PRESETS, QUESTIONS, MITIGATIONS, createDefaultAssessment } = BANK;

function idsFor(state) {
  return new Set(applicableQuestions(state, QUESTIONS).map((question) => question.id));
}

test("question bank is large, unique, structured, and spans all PAVE areas", () => {
  assert.ok(QUESTIONS.length >= 28);
  assert.equal(new Set(QUESTIONS.map((question) => question.id)).size, QUESTIONS.length);
  assert.deepEqual(STEPS.map((step) => step.id), [
    "profile", "pilot", "aircraft", "environment", "external", "review"
  ]);

  const paveAreas = new Set(QUESTIONS.map((question) => question.pave));
  for (const area of ["PILOT", "AIRCRAFT", "ENVIRONMENT", "EXTERNAL"]) {
    assert.ok(paveAreas.has(area), `missing ${area}`);
  }

  for (const question of QUESTIONS) {
    assert.match(question.id, /^[a-z0-9_]+$/);
    assert.equal(typeof question.label, "string");
    assert.ok(question.label.length > 5);
    assert.ok(["profile", "pilot", "aircraft", "environment", "external"].includes(question.step));
    assert.ok(["select", "boolean", "number"].includes(question.type));
    if (question.type === "select") {
      assert.ok(Array.isArray(question.options) && question.options.length >= 2);
    }
  }
});

test("certificate presets keep instrument rating and CFI role separate", () => {
  assert.deepEqual(PROFILE_PRESETS.map((preset) => preset.id), [
    "student", "private", "instrument-rated", "commercial", "cfi", "atp"
  ]);

  const validCertificateGrades = new Set(["student", "private", "commercial", "atp"]);
  for (const preset of PROFILE_PRESETS) {
    assert.ok(validCertificateGrades.has(preset.patch.certificate));
    assert.equal(typeof preset.patch.instrument, "boolean");
    assert.equal(typeof preset.patch.cfi, "boolean");
  }

  const instrument = PROFILE_PRESETS.find((preset) => preset.id === "instrument-rated");
  assert.equal(instrument.patch.certificate, "private");
  assert.equal(instrument.patch.instrument, true);
  assert.equal(instrument.patch.cfi, false);

  const cfi = PROFILE_PRESETS.find((preset) => preset.id === "cfi");
  assert.equal(cfi.patch.certificate, "commercial");
  assert.equal(cfi.patch.instrument, true);
  assert.equal(cfi.patch.cfi, true);
});

test("default assessment preserves certificate, rating, role, and operation separation", () => {
  const blank = createDefaultAssessment();
  assert.equal(blank.profile.certificate, null);
  assert.equal(blank.profile.ratings.instrument, null);
  assert.equal(blank.profile.roles.cfi, null);
  assert.equal(blank.operation.rules, null);
  assert.deepEqual(blank.answers, {});

  const cfi = createDefaultAssessment("cfi");
  assert.equal(cfi.profile.certificate, "commercial");
  assert.equal(cfi.profile.ratings.instrument, true);
  assert.equal(cfi.profile.roles.cfi, true);

  const atp = createDefaultAssessment("atp");
  assert.equal(atp.profile.certificate, "atp");
  assert.equal(atp.profile.ratings.instrument, true);
  assert.equal(atp.profile.roles.cfi, false);
});

test("VFR and IFR applicability branches are deterministic", () => {
  const vfr = createDefaultAssessment("private");
  vfr.operation.intendedPIC = true;
  vfr.operation.rules = "VFR";
  vfr.operation.dayNight = "day";
  let ids = idsFor(vfr);

  assert.ok(ids.has("vfr_conditions_legal"));
  assert.ok(ids.has("personal_vfr_ceiling_min_ft"));
  assert.ok(ids.has("vfr_escape_plan"));
  assert.ok(!ids.has("ifr_pic_eligibility"));
  assert.ok(!ids.has("ifr_plan_legal"));
  assert.ok(!ids.has("approach_minima_legal"));
  assert.ok(ids.size >= 28, "a normal VFR assessment should cover at least 28 questions");

  const ifr = createDefaultAssessment("instrument-rated");
  ifr.operation.intendedPIC = true;
  ifr.operation.rules = "IFR";
  ifr.operation.dayNight = "day";
  ifr.operation.approachPlanned = false;
  ids = idsFor(ifr);

  assert.ok(ids.has("ifr_pic_eligibility"));
  assert.ok(ids.has("ifr_aircraft_suitable"));
  assert.ok(ids.has("ifr_plan_legal"));
  assert.ok(!ids.has("vfr_conditions_legal"));
  assert.ok(!ids.has("personal_vfr_ceiling_min_ft"));
  assert.ok(!ids.has("approach_minima_legal"));

  ifr.operation.approachPlanned = true;
  ids = idsFor(ifr);
  assert.ok(ids.has("approach_minima_legal"));
  assert.ok(ids.has("personal_ifr_ceiling_margin_ft"));
  assert.ok(ids.has("forecast_ifr_visibility_margin_sm"));
  assert.ok(ids.has("missed_approach_diversion_plan"));
  assert.ok(ids.size >= 28, "a normal IFR approach assessment should cover at least 28 questions");
});

test("night, student-solo, passenger, training, and CFI questions branch independently", () => {
  const student = createDefaultAssessment("student");
  student.operation.intendedPIC = true;
  student.operation.rules = "VFR";
  student.operation.dayNight = "night";
  student.operation.studentSolo = true;
  let ids = idsFor(student);

  assert.ok(ids.has("student_solo"));
  assert.ok(ids.has("student_solo_within_limits"));
  assert.ok(ids.has("recent_night_proficiency"));
  assert.ok(ids.has("night_visual_environment"));
  assert.ok(!ids.has("cfi_qualified_for_flight"));

  const cfi = createDefaultAssessment("cfi");
  cfi.operation.intendedPIC = true;
  cfi.operation.rules = "VFR";
  cfi.operation.dayNight = "day";
  cfi.operation.trainingFlight = true;
  ids = idsFor(cfi);

  assert.ok(ids.has("cfi_qualified_for_flight"));
  assert.ok(ids.has("crew_roles_clear"));
  assert.ok(!ids.has("student_solo_within_limits"));

  const privatePassenger = createDefaultAssessment("private");
  privatePassenger.operation.intendedPIC = true;
  privatePassenger.operation.rules = "VFR";
  privatePassenger.operation.dayNight = "day";
  privatePassenger.operation.passengers = true;
  ids = idsFor(privatePassenger);
  assert.ok(ids.has("crew_roles_clear"));
  assert.ok(ids.has("passenger_pressure"));

  privatePassenger.operation.passengers = false;
  ids = idsFor(privatePassenger);
  assert.ok(!ids.has("crew_roles_clear"));
  assert.ok(!ids.has("passenger_pressure"));
});

test("question bank uses concrete inputs and user/CFI/AFM/POH comparisons instead of universal thresholds", () => {
  const comparisons = QUESTIONS.filter((question) => question.comparison);
  assert.ok(comparisons.length >= 8);

  for (const question of comparisons) {
    assert.equal(question.type, "number");
    assert.ok(question.comparison.limitQuestionId);
    assert.ok(["minimum", "maximum"].includes(question.comparison.mode));
    const limit = QUESTIONS.find((candidate) => candidate.id === question.comparison.limitQuestionId);
    assert.ok(limit, `missing limit question for ${question.id}`);
    assert.equal(limit.type, "number");
    assert.equal(Object.prototype.hasOwnProperty.call(limit, "defaultValue"), false);
  }

  const crosswind = QUESTIONS.find((question) => question.id === "forecast_crosswind_max_kt");
  assert.equal(crosswind.comparison.limitQuestionId, "personal_crosswind_max_kt");

  const imsafe = QUESTIONS.filter((question) => question.id.startsWith("imsafe_"));
  assert.equal(imsafe.length, 6);
  assert.ok(imsafe.every((question) => question.type === "select"));
  assert.ok(imsafe.every((question) => !question.options.some((item) => typeof item.value === "string" && item.value.length > 20)));
});

test("mitigation definitions update only allow-listed real fields", () => {
  assert.ok(MITIGATIONS.length >= 6);
  const state = createDefaultAssessment("private");
  state.answers.forecast_crosswind_max_kt = 15;
  state.notes = "original note";

  const weather = MITIGATIONS.find((item) => item.id === "delay_for_weather");
  const next = weather.apply(state, {
    forecast_crosswind_max_kt: 8,
    personal_crosswind_max_kt: 20,
    notes: "free text should be ignored"
  });

  assert.equal(next.answers.forecast_crosswind_max_kt, 8);
  assert.equal(next.answers.personal_crosswind_max_kt, undefined);
  assert.equal(next.notes, "original note");
  assert.deepEqual(next.mitigationHistory[0].fields, ["forecast_crosswind_max_kt"]);
  assert.equal(state.answers.forecast_crosswind_max_kt, 15, "mitigation returns a new state");

  const reduceLoad = MITIGATIONS.find((item) => item.id === "reduce_load_recalculate");
  assert.ok(!reduceLoad.allowedFields.includes("available_runway_length_ft"),
    "reducing load cannot increase the usable runway length");
});
