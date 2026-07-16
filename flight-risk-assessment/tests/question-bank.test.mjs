import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";

const require = createRequire(import.meta.url);
const BANK = require("../questions.js");
const RISK = require("../risk-model.js");

const {
  SECTIONS,
  CONTEXT_OPTIONS,
  FACTORS,
  PERSONAL_MINIMUM_FIELDS,
  createDefaultContext,
  normalizeContext,
  createBlankMinimums,
  createBlankFlight
} = BANK;

test("quick FRAT has exactly 12 core PAVE factors and three conditionals", () => {
  assert.equal(FACTORS.length, 15);
  assert.equal(FACTORS.filter((factor) => factor.core).length, 12);
  assert.equal(FACTORS.filter((factor) => !factor.core).length, 3);
  assert.deepEqual(SECTIONS.map((section) => section.id), [
    "pilot", "aircraft", "environment", "external"
  ]);

  const ids = new Set(FACTORS.map((factor) => factor.id));
  assert.equal(ids.size, FACTORS.length);
  for (const factor of FACTORS) {
    assert.ok(SECTIONS.some((section) => section.id === factor.section));
    assert.ok(factor.label.length > 5);
    assert.ok(factor.prompt.length > 10);
  }
});

test("default VFR path has 12 factors and the reachable maximum has 14", () => {
  const defaultContext = createDefaultContext();
  assert.equal(defaultContext.role, "with_instructor");
  assert.equal(RISK.applicableFactors(defaultContext, FACTORS).length, 12);

  const worstCase = {
    certificate: "student",
    role: "student_solo",
    rules: "ifr",
    dayNight: "night"
  };
  const applicable = RISK.applicableFactors(worstCase, FACTORS);
  assert.equal(applicable.length, 14);
  assert.deepEqual(
    applicable.filter((factor) => !factor.core).map((factor) => factor.id).sort(),
    ["night_readiness", "student_solo_readiness"]
  );
});

test("context normalization prevents ambiguous or impossible student-solo combinations", () => {
  assert.deepEqual(normalizeContext({ certificate: "student", role: "acting_pic", rules: "vfr", dayNight: "day" }), {
    certificate: "student", role: "with_instructor", rules: "vfr", dayNight: "day"
  });
  assert.deepEqual(normalizeContext({ certificate: "student", role: "student_solo", rules: "ifr", dayNight: "night" }), {
    certificate: "student", role: "student_solo", rules: "vfr", dayNight: "night"
  });
  assert.equal(normalizeContext({ certificate: "private", role: "student_solo" }).role, "acting_pic");
});

test("certificate changes context only and never changes risk-factor count", () => {
  const base = { role: "acting_pic", rules: "vfr", dayNight: "day" };
  for (const certificate of CONTEXT_OPTIONS.certificate) {
    const factors = RISK.applicableFactors({ ...base, certificate: certificate.value }, FACTORS);
    assert.equal(factors.length, 12);
  }
});

test("personal minimums are blank and student-solo visibility floors are explicit", () => {
  const minimums = createBlankMinimums();
  assert.equal(Object.keys(minimums).length, PERSONAL_MINIMUM_FIELDS.length);
  assert.ok(Object.values(minimums).every((value) => value === ""));
  assert.ok(PERSONAL_MINIMUM_FIELDS.every((field) => !("defaultValue" in field)));

  const dayVisibility = PERSONAL_MINIMUM_FIELDS.find((field) => field.id === "vfr_day_visibility_sm");
  const nightVisibility = PERSONAL_MINIMUM_FIELDS.find((field) => field.id === "vfr_night_visibility_sm");
  assert.equal(dayVisibility.studentSoloFloor, 3);
  assert.equal(nightVisibility.studentSoloFloor, 5);
});

test("per-flight answers begin blank and are separate from context and minimums", () => {
  const flight = createBlankFlight();
  assert.deepEqual(flight.answers, {});
  assert.equal(Object.prototype.hasOwnProperty.call(flight, "context"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(flight, "minimums"), false);
});

test("required primary-source links and no-preset language are present", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const app = await readFile(new URL("../app.js", import.meta.url), "utf8");
  const combined = `${html}\n${app}`;
  const requiredUrls = [
    "https://www.faa.gov/general/flight-risk-assessment-tool-frat-faa-safety-team",
    "https://www.faa.gov/sites/faa.gov/files/training_testing/training/fits/guidance/personal%20minimums%20checklist.pdf",
    "https://www.faa.gov/sites/faa.gov/files/2022-01/Personal%20Minimums.pdf",
    "https://www.faa.gov/sites/faa.gov/files/2022-06/risk_management_handbook_2A.pdf",
    "https://www.ecfr.gov/current/title-14/chapter-I/subchapter-D/part-61/subpart-C/section-61.87",
    "https://www.ecfr.gov/current/title-14/chapter-I/subchapter-D/part-61/subpart-C/section-61.89"
  ];
  for (const url of requiredUrls) {
    assert.ok(combined.includes(url), `missing ${url}`);
  }
  assert.match(combined, /framework, not universal certificate-tier numeric recommendations/i);
});
