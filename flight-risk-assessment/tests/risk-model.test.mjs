import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const RISK = require("../risk-model.js");
const BANK = require("../questions.js");

const {
  LEVELS,
  LIKELIHOODS,
  SEVERITIES,
  RISK_MATRIX,
  matrixLevel,
  assessAssessment,
  riskVector,
  levelLabel
} = RISK;

function questionsById(...ids) {
  const wanted = new Set(ids.flat());
  return BANK.QUESTIONS.filter((question) => wanted.has(question.id));
}

test("FAA likelihood x severity matrix is complete and exact", () => {
  const expected = {
    PROBABLE: {
      CATASTROPHIC: LEVELS.STOP,
      CRITICAL: LEVELS.STOP,
      MARGINAL: LEVELS.HIGH,
      NEGLIGIBLE: LEVELS.MODERATE
    },
    OCCASIONAL: {
      CATASTROPHIC: LEVELS.STOP,
      CRITICAL: LEVELS.HIGH,
      MARGINAL: LEVELS.MODERATE,
      NEGLIGIBLE: LEVELS.MODERATE
    },
    REMOTE: {
      CATASTROPHIC: LEVELS.HIGH,
      CRITICAL: LEVELS.MODERATE,
      MARGINAL: LEVELS.MODERATE,
      NEGLIGIBLE: LEVELS.LOW
    },
    IMPROBABLE: {
      CATASTROPHIC: LEVELS.MODERATE,
      CRITICAL: LEVELS.MODERATE,
      MARGINAL: LEVELS.LOW,
      NEGLIGIBLE: LEVELS.LOW
    }
  };

  assert.deepEqual(RISK_MATRIX, expected);

  for (const [likelihood, row] of Object.entries(expected)) {
    for (const [severity, level] of Object.entries(row)) {
      assert.equal(matrixLevel(likelihood, severity), level);
      assert.equal(matrixLevel(likelihood.toLowerCase(), severity.toLowerCase()), level);
    }
  }

  assert.equal(matrixLevel(null, SEVERITIES.CRITICAL), null);
  assert.throws(() => matrixLevel("sometimes", "critical"), RangeError);
});

test("highest unresolved hazard controls overall and low factors never offset STOP", () => {
  const lowRule = {
    likelihood: LIKELIHOODS.IMPROBABLE,
    severity: SEVERITIES.NEGLIGIBLE,
    reason: "low"
  };
  const bank = Array.from({ length: 30 }, (_, index) => ({
    id: `low_${index}`,
    label: `Low ${index}`,
    required: true,
    critical: true,
    riskByValue: { safe: lowRule }
  }));

  bank.push({
    id: "single_stop",
    label: "Single stop",
    required: true,
    critical: true,
    riskByValue: {
      unsafe: {
        likelihood: LIKELIHOODS.PROBABLE,
        severity: SEVERITIES.CATASTROPHIC,
        hardStop: true,
        reason: "stop"
      }
    }
  });

  const answers = Object.fromEntries(bank.map((question) => [
    question.id,
    question.id === "single_stop" ? "unsafe" : "safe"
  ]));
  const result = assessAssessment({ answers }, bank);

  assert.equal(result.complete, true);
  assert.equal(result.overall, LEVELS.STOP);
  assert.equal(result.highestHazard.id, "single_stop");
  assert.deepEqual(result.vector, { STOP: 1, HIGH: 0, MODERATE: 0, LOW: 30, total: 31 });
  assert.equal(result.hazards[0].level, LEVELS.STOP);
});

test("missing or unresolved critical information yields INCOMPLETE", () => {
  const bank = [{
    id: "critical_input",
    label: "Critical input",
    required: true,
    critical: true,
    incompleteValues: ["unknown"]
  }];

  let result = assessAssessment({ answers: {} }, bank);
  assert.equal(result.overall, LEVELS.INCOMPLETE);
  assert.equal(result.complete, false);
  assert.equal(result.answeredCount, 0);
  assert.deepEqual(result.missingCritical.map((item) => item.id), ["critical_input"]);

  result = assessAssessment({ answers: { critical_input: "unknown" } }, bank);
  assert.equal(result.overall, LEVELS.INCOMPLETE);
  assert.equal(result.answeredCount, 0);
  assert.match(result.missingCritical[0].reason, /unresolved/i);
});

test("IFR eligibility is a hard stop and an instrument rating never grants risk credit", () => {
  const bank = questionsById(
    "certificate_level",
    "instrument_rating",
    "intended_pic",
    "flight_rules",
    "ifr_pic_eligibility"
  );
  const state = BANK.createDefaultAssessment("private");
  state.operation.intendedPIC = true;
  state.operation.rules = "IFR";
  state.profile.ratings.instrument = false;
  state.answers.ifr_pic_eligibility = "no";

  let result = assessAssessment(state, bank);
  assert.equal(result.complete, true);
  assert.equal(result.overall, LEVELS.STOP);
  assert.ok(result.hazards.some((hazard) => hazard.id === "ifr_rating_override"));

  state.profile.ratings.instrument = true;
  state.answers.ifr_pic_eligibility = "yes";
  result = assessAssessment(state, bank);
  assert.equal(result.complete, true);
  assert.equal(result.overall, LEVELS.LOW);
  assert.equal(result.vector.LOW, 1, "rating itself does not add a compensating low factor");
});

test("student solo outside a current endorsement or instructor limitation is STOP", () => {
  const bank = questionsById(
    "certificate_level",
    "student_solo",
    "student_solo_within_limits"
  );
  const state = BANK.createDefaultAssessment("student");
  state.operation.studentSolo = true;
  state.answers.student_solo_within_limits = "no";

  const result = assessAssessment(state, bank);
  assert.equal(result.complete, true);
  assert.equal(result.overall, LEVELS.STOP);
  assert.equal(result.highestHazard.level, LEVELS.STOP);
  assert.match(result.highestHazard.reason, /student-solo|student solo/i);
});

test("personal-minimum breach is HIGH, not a universal invented threshold", () => {
  const bank = questionsById("personal_crosswind_max_kt", "forecast_crosswind_max_kt");
  const state = BANK.createDefaultAssessment("private");
  state.answers.personal_crosswind_max_kt = 10;
  state.answers.forecast_crosswind_max_kt = 12;

  let result = assessAssessment(state, bank);
  assert.equal(result.complete, true);
  assert.equal(result.overall, LEVELS.HIGH);
  assert.equal(result.highestHazard.personalLimitBreach, true);
  assert.equal(result.highestHazard.limit, 10);

  state.answers.forecast_crosswind_max_kt = 10;
  result = assessAssessment(state, bank);
  assert.equal(result.overall, LEVELS.LOW);
  assert.equal(result.highestHazard.personalLimitBreach, false);
});

test("invalid numeric inputs remain unresolved and can never produce a false Low result", () => {
  const crosswindBank = questionsById("personal_crosswind_max_kt", "forecast_crosswind_max_kt");
  const state = BANK.createDefaultAssessment("private");
  state.answers.personal_crosswind_max_kt = 8;
  state.answers.forecast_crosswind_max_kt = -1;

  let result = assessAssessment(state, crosswindBank);
  assert.equal(result.complete, false);
  assert.equal(result.overall, LEVELS.INCOMPLETE);
  assert.deepEqual(result.missingCritical.map((item) => item.id), ["forecast_crosswind_max_kt"]);
  assert.equal(result.hazards.some((hazard) => hazard.id === "forecast_crosswind_max_kt"), false);

  state.answers.personal_crosswind_max_kt = -1;
  state.answers.forecast_crosswind_max_kt = 7;
  result = assessAssessment(state, crosswindBank);
  assert.equal(result.overall, LEVELS.INCOMPLETE);
  assert.ok(result.missingCritical.some((item) => item.id === "personal_crosswind_max_kt"));
  assert.equal(result.hazards.some((hazard) => hazard.id === "forecast_crosswind_max_kt"), false);

  const visibilityBank = questionsById(
    "flight_rules",
    "personal_vfr_visibility_min_sm",
    "forecast_vfr_visibility_min_sm"
  );
  state.operation.rules = "VFR";
  state.answers.personal_vfr_visibility_min_sm = 5;
  state.answers.forecast_vfr_visibility_min_sm = 6.1;
  result = assessAssessment(state, visibilityBank);
  assert.equal(result.overall, LEVELS.INCOMPLETE, "values outside the 0.25 SM increment remain unresolved");
  assert.ok(result.missingCritical.some((item) => item.id === "forecast_vfr_visibility_min_sm"));
});

test("mitigation earns credit only when it updates a real, allow-listed input", () => {
  const bank = questionsById("personal_fuel_reserve_minutes", "planned_fuel_reserve_minutes");
  const state = BANK.createDefaultAssessment("private");
  state.answers.personal_fuel_reserve_minutes = 60;
  state.answers.planned_fuel_reserve_minutes = 30;
  state.notes = "I will probably stop for fuel.";

  let result = assessAssessment(state, bank);
  assert.equal(result.overall, LEVELS.HIGH, "free text does not change risk");

  const mitigation = BANK.MITIGATIONS.find((item) => item.id === "fuel_stop_or_add_reserve");
  const notesOnly = mitigation.apply(state, { notes: "Fuel stop" });
  result = assessAssessment(notesOnly, bank);
  assert.equal(result.overall, LEVELS.HIGH, "non-allow-listed notes earn no credit");
  assert.equal(notesOnly.mitigationHistory.length, 0);

  const updated = mitigation.apply(state, { planned_fuel_reserve_minutes: 75 });
  result = assessAssessment(updated, bank);
  assert.equal(result.overall, LEVELS.LOW);
  assert.deepEqual(updated.mitigationHistory[0].fields, ["planned_fuel_reserve_minutes"]);
});

test("riskVector and levelLabel provide stable presentation helpers", () => {
  const vector = riskVector([
    { level: LEVELS.STOP },
    { level: LEVELS.HIGH },
    { level: LEVELS.HIGH },
    { level: LEVELS.MODERATE },
    { level: LEVELS.LOW },
    { level: LEVELS.INCOMPLETE }
  ]);

  assert.deepEqual(vector, { STOP: 1, HIGH: 2, MODERATE: 1, LOW: 1, total: 5 });
  assert.equal(levelLabel(LEVELS.INCOMPLETE), "Incomplete");
  assert.match(levelLabel(LEVELS.HIGH), /Mitigation Required/);
  assert.equal(levelLabel("not-a-level"), "Unknown");
});
