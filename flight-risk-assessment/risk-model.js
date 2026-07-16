(function (root, factory) {
  "use strict";

  var api = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.FRAT_RISK = api;
  }
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  var LEVELS = Object.freeze({
    INCOMPLETE: "INCOMPLETE",
    LOW: "LOW",
    MODERATE: "MODERATE",
    STOP: "STOP"
  });

  var ANSWER_LEVEL = Object.freeze({
    good: LEVELS.LOW,
    concern: LEVELS.MODERATE,
    stop: LEVELS.STOP,
    unknown: LEVELS.INCOMPLETE
  });

  var LEVEL_RANK = Object.freeze({
    INCOMPLETE: 0,
    LOW: 1,
    MODERATE: 2,
    STOP: 3
  });

  function normalizeContext(input) {
    var source = input && input.context ? input.context : (input || {});
    var context = Object.assign({}, source);

    // Student solo is a VFR operation. Normalize this invariant at the model
    // boundary so direct callers cannot accidentally apply the IFR branch.
    if (context.role === "student_solo" && context.rules === "ifr") {
      context.rules = "vfr";
    }

    return context;
  }

  function conditionMatches(context, condition) {
    return context[condition.field] === condition.equals;
  }

  function isApplicable(contextInput, factor) {
    var context = normalizeContext(contextInput);
    var all = factor.appliesWhen || [];
    return all.every(function (condition) {
      return conditionMatches(context, condition);
    });
  }

  function applicableFactors(context, factorBank) {
    return (factorBank || []).filter(function (factor) {
      return isApplicable(context, factor);
    });
  }

  function answerLevel(value) {
    return ANSWER_LEVEL[String(value)] || LEVELS.INCOMPLETE;
  }

  function answerIsRecognized(value) {
    return Object.prototype.hasOwnProperty.call(ANSWER_LEVEL, String(value));
  }

  function factorReason(factor, answer) {
    if (answer === "stop") {
      return factor.stopLabel || "The current condition is not acceptable.";
    }
    if (answer === "concern") {
      return factor.concernLabel || "This factor needs review and mitigation.";
    }
    if (answer === "unknown") {
      return factor.unknownLabel || "This factor still needs verification.";
    }
    return factor.goodLabel || "Confirmed.";
  }

  function assessAssessment(state, factorBank) {
    var context = normalizeContext(state);
    var answers = state && state.answers ? state.answers : {};
    var applicable = applicableFactors(context, factorBank);
    var factors = applicable.map(function (factor, order) {
      var answer = Object.prototype.hasOwnProperty.call(answers, factor.id)
        ? answers[factor.id]
        : null;
      var recognized = answerIsRecognized(answer);
      var level = answerLevel(answer);
      return {
        id: factor.id,
        label: factor.label,
        section: factor.section,
        answer: answer,
        level: level,
        unresolved: !recognized || answer === "unknown",
        reason: !recognized
          ? "Answer this factor before relying on the assessment."
          : factorReason(factor, answer),
        order: order
      };
    });

    var stopFactors = factors.filter(function (item) { return item.level === LEVELS.STOP; });
    var moderateFactors = factors.filter(function (item) { return item.level === LEVELS.MODERATE; });
    var unresolvedFactors = factors.filter(function (item) { return item.unresolved; });
    var resolvedCount = factors.length - unresolvedFactors.length;
    var overall;

    // A known no-go condition must remain visible even if other factors are
    // unanswered. Otherwise, unresolved information blocks a completed result.
    if (stopFactors.length) {
      overall = LEVELS.STOP;
    } else if (unresolvedFactors.length) {
      overall = LEVELS.INCOMPLETE;
    } else if (moderateFactors.length) {
      overall = LEVELS.MODERATE;
    } else {
      overall = LEVELS.LOW;
    }

    var concerns = stopFactors.concat(moderateFactors, unresolvedFactors).sort(function (first, second) {
      var rank = LEVEL_RANK[second.level] - LEVEL_RANK[first.level];
      return rank || first.order - second.order;
    });

    return {
      overall: overall,
      complete: unresolvedFactors.length === 0,
      applicableCount: factors.length,
      answeredCount: resolvedCount,
      factors: factors.map(stripOrder),
      concerns: concerns.map(stripOrder),
      stopCount: stopFactors.length,
      moderateCount: moderateFactors.length,
      incompleteCount: unresolvedFactors.length
    };
  }

  function stripOrder(item) {
    var copy = Object.assign({}, item);
    delete copy.order;
    return copy;
  }

  function levelLabel(level) {
    var labels = {};
    labels[LEVELS.INCOMPLETE] = "Incomplete";
    labels[LEVELS.LOW] = "Low — continue planning";
    labels[LEVELS.MODERATE] = "Review required";
    labels[LEVELS.STOP] = "Stop — no-go on current plan";
    return labels[level] || "Unknown";
  }

  function guidanceFor(level) {
    if (level === LEVELS.STOP) {
      return "Do not depart on the current plan. Change or remove the condition, confirm the new facts, and reassess.";
    }
    if (level === LEVELS.MODERATE) {
      return "Review the concerns, change the plan where practical, consult an instructor or appropriate decision-maker, and reassess.";
    }
    if (level === LEVELS.LOW) {
      return "No elevated factors were identified. Continue required planning and monitor changes. Low never means safe and does not make the PIC decision.";
    }
    return "Verify every applicable factor before relying on the result.";
  }

  return Object.freeze({
    LEVELS: LEVELS,
    ANSWER_LEVEL: ANSWER_LEVEL,
    applicableFactors: applicableFactors,
    assessAssessment: assessAssessment,
    answerLevel: answerLevel,
    levelLabel: levelLabel,
    guidanceFor: guidanceFor
  });
});
