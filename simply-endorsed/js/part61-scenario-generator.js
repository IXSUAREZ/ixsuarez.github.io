(function (root, factory) {
  "use strict";
  const rules = typeof module === "object" && module.exports
    ? require("./part61-rules-data")
    : root.Part61RulesData;
  const api = factory(rules);
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  root.Part61ScenarioGenerator = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (RULES) {
  "use strict";

  const STUDY_SCENARIOS = RULES.STUDY_SCENARIOS || RULES.SAMPLE_SCENARIOS || [];

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function generateRandomScenario() {
    if (!STUDY_SCENARIOS.length) {
      throw new Error("No Part 61 study scenarios are configured.");
    }
    const index = Math.floor(Math.random() * STUDY_SCENARIOS.length);
    return clone(STUDY_SCENARIOS[index]);
  }

  return {
    STUDY_SCENARIOS,
    generateRandomScenario
  };
});
