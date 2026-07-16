import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const RISK = require("../risk-model.js");
const BANK = require("../questions.js");

const { LEVELS, assessAssessment, applicableFactors, guidanceFor } = RISK;
const { FACTORS, createDefaultContext } = BANK;

function stateWith(value, context = createDefaultContext()) {
  return {
    context,
    answers: Object.fromEntries(
      applicableFactors(context, FACTORS).map((factor) => [factor.id, value])
    )
  };
}

test("all factor answers begin unresolved and produce Incomplete", () => {
  const result = assessAssessment({ context: createDefaultContext(), answers: {} }, FACTORS);
  assert.equal(result.overall, LEVELS.INCOMPLETE);
  assert.equal(result.complete, false);
  assert.equal(result.applicableCount, 12);
  assert.equal(result.answeredCount, 0);
  assert.equal(result.incompleteCount, 12);
});

test("all confirmed factors produce Low without calling the flight safe", () => {
  const result = assessAssessment(stateWith("good"), FACTORS);
  assert.equal(result.overall, LEVELS.LOW);
  assert.equal(result.complete, true);
  assert.equal(result.answeredCount, 12);
  assert.match(guidanceFor(result.overall), /Low never means safe/i);
  assert.match(guidanceFor(result.overall), /does not make the PIC decision/i);
});

test("a concern produces Review required and low answers never offset it", () => {
  const state = stateWith("good");
  state.answers.pilot_proficiency = "concern";
  const result = assessAssessment(state, FACTORS);
  assert.equal(result.overall, LEVELS.MODERATE);
  assert.equal(result.moderateCount, 1);
  assert.equal(result.concerns[0].id, "pilot_proficiency");
});

test("a known unacceptable answer produces Stop even with unanswered factors", () => {
  const state = { context: createDefaultContext(), answers: { pilot_imsafe: "stop" } };
  const result = assessAssessment(state, FACTORS);
  assert.equal(result.overall, LEVELS.STOP);
  assert.equal(result.stopCount, 1);
  assert.equal(result.complete, false);
  assert.match(guidanceFor(result.overall), /Do not depart/i);
});

test("verify and unknown values remain Incomplete", () => {
  const state = stateWith("good");
  state.answers.environment_current_information = "unknown";
  const result = assessAssessment(state, FACTORS);
  assert.equal(result.overall, LEVELS.INCOMPLETE);
  assert.equal(result.complete, false);
  assert.equal(result.incompleteCount, 1);
  assert.equal(result.concerns[0].id, "environment_current_information");
});

test("legacy or unrecognized persisted values remain fully unresolved", () => {
  const context = createDefaultContext();
  const answers = Object.fromEntries(
    applicableFactors(context, FACTORS).map((factor) => [factor.id, "yes"])
  );
  const result = assessAssessment({ context, answers }, FACTORS);
  assert.equal(result.overall, LEVELS.INCOMPLETE);
  assert.equal(result.complete, false);
  assert.equal(result.answeredCount, 0);
  assert.equal(result.incompleteCount, 12);
});

test("student-solo IFR is normalized to VFR at the direct model boundary", () => {
  const context = {
    certificate: "student",
    role: "student_solo",
    rules: "ifr",
    dayNight: "night"
  };
  const ids = applicableFactors(context, FACTORS).map((factor) => factor.id);
  assert.equal(ids.length, 14);
  assert.ok(ids.includes("student_solo_readiness"));
  assert.ok(ids.includes("night_readiness"));
  assert.ok(!ids.includes("ifr_readiness"));

  const result = assessAssessment(stateWith("good", context), FACTORS);
  assert.equal(result.applicableCount, 14);
  assert.equal(result.overall, LEVELS.LOW);
});

test("conditional factors are ignored when their context does not apply", () => {
  const hiddenState = stateWith("good");
  hiddenState.answers.student_solo_readiness = "stop";
  const hiddenResult = assessAssessment(hiddenState, FACTORS);
  assert.equal(hiddenResult.applicableCount, 12);
  assert.equal(hiddenResult.overall, LEVELS.LOW);
});
