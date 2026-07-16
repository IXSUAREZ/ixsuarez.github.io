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
    HIGH: "HIGH",
    STOP: "STOP"
  });

  var LIKELIHOODS = Object.freeze({
    PROBABLE: "PROBABLE",
    OCCASIONAL: "OCCASIONAL",
    REMOTE: "REMOTE",
    IMPROBABLE: "IMPROBABLE"
  });

  var SEVERITIES = Object.freeze({
    CATASTROPHIC: "CATASTROPHIC",
    CRITICAL: "CRITICAL",
    MARGINAL: "MARGINAL",
    NEGLIGIBLE: "NEGLIGIBLE"
  });

  // FAA-H-8083-2A, Figure 4-1 / Figure B-3. Product labels map
  // FAA High -> STOP, Serious -> HIGH, Medium -> MODERATE, Low -> LOW.
  var RISK_MATRIX = Object.freeze({
    PROBABLE: Object.freeze({
      CATASTROPHIC: LEVELS.STOP,
      CRITICAL: LEVELS.STOP,
      MARGINAL: LEVELS.HIGH,
      NEGLIGIBLE: LEVELS.MODERATE
    }),
    OCCASIONAL: Object.freeze({
      CATASTROPHIC: LEVELS.STOP,
      CRITICAL: LEVELS.HIGH,
      MARGINAL: LEVELS.MODERATE,
      NEGLIGIBLE: LEVELS.MODERATE
    }),
    REMOTE: Object.freeze({
      CATASTROPHIC: LEVELS.HIGH,
      CRITICAL: LEVELS.MODERATE,
      MARGINAL: LEVELS.MODERATE,
      NEGLIGIBLE: LEVELS.LOW
    }),
    IMPROBABLE: Object.freeze({
      CATASTROPHIC: LEVELS.MODERATE,
      CRITICAL: LEVELS.MODERATE,
      MARGINAL: LEVELS.LOW,
      NEGLIGIBLE: LEVELS.LOW
    })
  });

  var LEVEL_RANK = Object.freeze({
    LOW: 0,
    MODERATE: 1,
    HIGH: 2,
    STOP: 3
  });

  var LEVEL_LABELS = Object.freeze({
    INCOMPLETE: "Incomplete",
    LOW: "Low",
    MODERATE: "Moderate",
    HIGH: "High - Mitigation Required",
    STOP: "Stop - Current Plan Is No-Go"
  });

  var EXPLICIT_HARD_STOP_IDS = Object.freeze({
    known_legal_compliance: "The current plan is known not to meet an applicable legal requirement.",
    pilot_qualified_current: "The intended pilot is not qualified/current for the planned operation.",
    required_currency_endorsements: "A required currency item or endorsement is not satisfied.",
    airworthy_status: "The aircraft is not airworthy for the planned flight.",
    afm_poh_within_limits: "The plan exceeds an AFM/POH limitation.",
    required_equipment_status: "Required equipment is unavailable or inoperative.",
    weight_balance_within_limits: "Weight or center of gravity is outside approved limits.",
    performance_within_available: "Required takeoff or landing performance exceeds what is available.",
    fuel_reserve_legal: "The fuel plan does not meet an applicable required reserve.",
    student_solo_within_limits: "The student-solo plan is outside a current endorsement or instructor limitation.",
    ifr_pic_eligibility: "The intended PIC is not eligible/current for the planned IFR operation.",
    ifr_aircraft_suitable: "The aircraft is not suitable/equipped for the planned IFR operation.",
    vfr_conditions_legal: "The VFR plan does not meet applicable operating requirements.",
    ifr_plan_legal: "The IFR plan does not meet an applicable operating requirement.",
    approach_minima_legal: "The planned approach is known not to meet applicable requirements.",
    airport_route_available: "The planned airport, runway, airspace, or route is unavailable or prohibited."
  });

  var IMSAFE_IDS = Object.freeze([
    "imsafe_illness",
    "imsafe_medication",
    "imsafe_stress",
    "imsafe_alcohol",
    "imsafe_fatigue",
    "imsafe_emotion"
  ]);

  function normalizedKey(value) {
    return String(value == null ? "" : value).trim().toUpperCase();
  }

  function matrixLevel(likelihood, severity) {
    if (likelihood == null || severity == null || likelihood === "" || severity === "") {
      return null;
    }

    var likelihoodKey = normalizedKey(likelihood);
    var severityKey = normalizedKey(severity);
    var likelihoodRow = RISK_MATRIX[likelihoodKey];

    if (!likelihoodRow || !Object.prototype.hasOwnProperty.call(likelihoodRow, severityKey)) {
      throw new RangeError("Unknown FAA risk-matrix value: " + likelihood + " x " + severity);
    }

    return likelihoodRow[severityKey];
  }

  function levelLabel(level) {
    return LEVEL_LABELS[normalizedKey(level)] || "Unknown";
  }

  function normalizeQuestionBank(questionBank) {
    if (Array.isArray(questionBank)) {
      return questionBank;
    }

    if (questionBank && Array.isArray(questionBank.QUESTIONS)) {
      return questionBank.QUESTIONS;
    }

    return [];
  }

  function getPath(object, path) {
    if (!object || !path) {
      return undefined;
    }

    return String(path).split(".").reduce(function (current, segment) {
      return current == null ? undefined : current[segment];
    }, object);
  }

  function questionIndex(questions) {
    return questions.reduce(function (index, question) {
      index[question.id] = question;
      return index;
    }, Object.create(null));
  }

  function questionValue(state, question) {
    if (!question) {
      return undefined;
    }

    if (state && state.answers && Object.prototype.hasOwnProperty.call(state.answers, question.id)) {
      return state.answers[question.id];
    }

    return question.path ? getPath(state, question.path) : undefined;
  }

  function valueForCondition(state, condition, index) {
    if (condition.questionId) {
      return questionValue(state, index[condition.questionId]);
    }

    return getPath(state, condition.path);
  }

  function conditionMatches(state, condition, index) {
    var value = valueForCondition(state, condition, index);

    if (Object.prototype.hasOwnProperty.call(condition, "equals")) {
      return value === condition.equals;
    }

    if (Object.prototype.hasOwnProperty.call(condition, "notEquals")) {
      return value !== condition.notEquals;
    }

    if (Array.isArray(condition.in)) {
      return condition.in.indexOf(value) !== -1;
    }

    if (Array.isArray(condition.notIn)) {
      return condition.notIn.indexOf(value) === -1;
    }

    if (condition.truthy) {
      return Boolean(value);
    }

    if (condition.falsy) {
      return !value;
    }

    return true;
  }

  function isQuestionApplicable(state, question, index) {
    var all = question.appliesWhen || [];
    var any = question.appliesAny || [];

    if (!all.every(function (condition) {
      return conditionMatches(state, condition, index);
    })) {
      return false;
    }

    if (any.length && !any.some(function (condition) {
      return conditionMatches(state, condition, index);
    })) {
      return false;
    }

    return true;
  }

  function applicableQuestions(state, questionBank) {
    var questions = normalizeQuestionBank(questionBank);
    var index = questionIndex(questions);

    return questions.filter(function (question) {
      return isQuestionApplicable(state || {}, question, index);
    });
  }

  function isBlank(value) {
    return value == null ||
      (typeof value === "string" && value.trim() === "") ||
      (typeof value === "number" && !Number.isFinite(value));
  }

  function numericAnswerIsValid(question, value) {
    if (!question || question.type !== "number") {
      return true;
    }
    if (isBlank(value)) {
      return false;
    }

    var number = Number(value);
    if (!Number.isFinite(number)) {
      return false;
    }

    if (question.min != null && number < Number(question.min)) {
      return false;
    }
    if (question.max != null && number > Number(question.max)) {
      return false;
    }

    var step = Number(question.stepValue || 1);
    if (Number.isFinite(step) && step > 0) {
      var base = question.min != null ? Number(question.min) : 0;
      var increments = (number - base) / step;
      var tolerance = 1e-7 * Math.max(1, Math.abs(increments));
      if (Math.abs(increments - Math.round(increments)) > tolerance) {
        return false;
      }
    }

    return true;
  }

  function isCriticalMissing(question, value) {
    if (isBlank(value)) {
      return Boolean(question.required && question.critical !== false);
    }

    if (question.type === "number" && !numericAnswerIsValid(question, value)) {
      return Boolean(question.required && question.critical !== false);
    }

    var incompleteValues = question.incompleteValues || [];
    return Boolean(
      question.required &&
      question.critical !== false &&
      incompleteValues.indexOf(value) !== -1
    );
  }

  function higherLevel(first, second) {
    if (!first) {
      return second;
    }
    if (!second) {
      return first;
    }
    return LEVEL_RANK[second] > LEVEL_RANK[first] ? second : first;
  }

  function ruleHazard(question, answer, rule, order) {
    var likelihood = normalizedKey(rule.likelihood);
    var severity = normalizedKey(rule.severity);
    var level = matrixLevel(likelihood, severity);

    if (rule.minimumLevel) {
      level = higherLevel(level, normalizedKey(rule.minimumLevel));
    }

    if (rule.hardStop) {
      level = LEVELS.STOP;
    }

    return {
      id: question.id,
      questionId: question.id,
      label: question.label,
      pave: question.pave || null,
      level: level,
      likelihood: likelihood,
      severity: severity,
      hardStop: Boolean(rule.hardStop),
      reason: rule.reason || question.help || question.label,
      answer: answer,
      order: order
    };
  }

  function comparisonHazard(question, answer, limit, breached, order) {
    var rule = breached ? question.comparison.onBreach : question.comparison.onWithin;

    if (!rule && !breached) {
      rule = {
        likelihood: LIKELIHOODS.IMPROBABLE,
        severity: SEVERITIES.NEGLIGIBLE,
        reason: "The entered condition is within the saved personal limit."
      };
    }

    if (!rule) {
      return null;
    }

    var hazard = ruleHazard(question, answer, rule, order);
    hazard.limitQuestionId = question.comparison.limitQuestionId;
    hazard.limit = limit;
    hazard.personalLimitBreach = breached;
    return hazard;
  }

  function evaluateQuestion(state, question, index, order) {
    var answer = questionValue(state, question);

    if (isBlank(answer)) {
      return null;
    }

    if (question.type === "number" && !numericAnswerIsValid(question, answer)) {
      return null;
    }

    if (question.comparison) {
      var limitQuestion = index[question.comparison.limitQuestionId];
      var limit = questionValue(state, limitQuestion);
      var actualNumber = Number(answer);
      var limitNumber = Number(limit);

      if (!limitQuestion ||
          !numericAnswerIsValid(limitQuestion, limit) ||
          !Number.isFinite(actualNumber) ||
          !Number.isFinite(limitNumber)) {
        return null;
      }

      var breached = question.comparison.mode === "minimum"
        ? actualNumber < limitNumber
        : actualNumber > limitNumber;

      return comparisonHazard(question, actualNumber, limitNumber, breached, order);
    }

    if (question.riskByValue) {
      var rule = question.riskByValue[String(answer)];
      return rule ? ruleHazard(question, answer, rule, order) : null;
    }

    return null;
  }

  function applyExplicitHardStop(hazard, questionId, answer) {
    var reason = EXPLICIT_HARD_STOP_IDS[questionId];
    var unsafe = answer === "no" || answer === false || answer === "outside" || answer === "unavailable";

    if (!reason || !unsafe) {
      return hazard;
    }

    if (!hazard) {
      return {
        id: questionId,
        questionId: questionId,
        label: questionId,
        pave: null,
        level: LEVELS.STOP,
        likelihood: LIKELIHOODS.PROBABLE,
        severity: SEVERITIES.CATASTROPHIC,
        hardStop: true,
        reason: reason,
        answer: answer,
        order: Number.MAX_SAFE_INTEGER
      };
    }

    hazard.level = LEVELS.STOP;
    hazard.hardStop = true;
    hazard.reason = reason;
    return hazard;
  }

  function overrideHazard(id, label, reason, order) {
    return {
      id: id,
      questionId: id,
      label: label,
      pave: "PILOT",
      level: LEVELS.STOP,
      likelihood: LIKELIHOODS.PROBABLE,
      severity: SEVERITIES.CATASTROPHIC,
      hardStop: true,
      reason: reason,
      answer: false,
      order: order
    };
  }

  function derivedOverrides(state, index, existingHazards) {
    var overrides = [];
    var rules = questionValue(state, index.flight_rules);
    var intendedPic = questionValue(state, index.intended_pic);
    var instrumentRating = questionValue(state, index.instrument_rating);
    var certificate = questionValue(state, index.certificate_level);
    var studentSolo = questionValue(state, index.student_solo);
    var soloWithinLimits = questionValue(state, index.student_solo_within_limits);

    if (rules === "IFR" && intendedPic !== false && instrumentRating === false) {
      overrides.push(overrideHazard(
        "ifr_rating_override",
        "Instrument rating required for intended PIC role",
        "The intended PIC reports no instrument rating for the planned IFR operation.",
        -3
      ));
    }

    if (certificate === "student" && studentSolo === true && soloWithinLimits === "no") {
      overrides.push(overrideHazard(
        "student_solo_override",
        "Student solo endorsement or limitation",
        EXPLICIT_HARD_STOP_IDS.student_solo_within_limits,
        -2
      ));
    }

    IMSAFE_IDS.forEach(function (id, offset) {
      if (questionValue(state, index[id]) === "not_fit") {
        var alreadyPresent = existingHazards.some(function (hazard) {
          return hazard.id === id && hazard.level === LEVELS.STOP;
        });

        if (!alreadyPresent) {
          overrides.push(overrideHazard(
            id + "_override",
            "IMSAFE not-fit condition",
            "The pilot marked an IMSAFE condition as not fit for flight.",
            -1 + offset / 100
          ));
        }
      }
    });

    return overrides;
  }

  function compareHazards(first, second) {
    var levelDifference = LEVEL_RANK[second.level] - LEVEL_RANK[first.level];
    if (levelDifference) {
      return levelDifference;
    }
    return first.order - second.order;
  }

  function riskVector(input) {
    var hazards = Array.isArray(input) ? input : (input && input.hazards) || [];
    var vector = {
      STOP: 0,
      HIGH: 0,
      MODERATE: 0,
      LOW: 0,
      total: 0
    };

    hazards.forEach(function (hazard) {
      if (Object.prototype.hasOwnProperty.call(LEVEL_RANK, hazard.level)) {
        vector[hazard.level] += 1;
        vector.total += 1;
      }
    });

    return vector;
  }

  function assessAssessment(state, questionBank) {
    var questions = normalizeQuestionBank(questionBank);
    var index = questionIndex(questions);
    var applicable = applicableQuestions(state || {}, questions);
    var missingCritical = [];
    var answeredCount = 0;
    var hazards = [];

    applicable.forEach(function (question, order) {
      var answer = questionValue(state || {}, question);
      var blank = isBlank(answer);
      var invalidNumeric = question.type === "number" && !blank && !numericAnswerIsValid(question, answer);
      var incomplete = isCriticalMissing(question, answer);

      if (!blank && !incomplete) {
        answeredCount += 1;
      }

      if (incomplete) {
        missingCritical.push({
          id: question.id,
          label: question.label,
          reason: invalidNumeric
            ? "Enter a number within the allowed range and increment."
            : blank
            ? "Required safety information is missing."
            : "This answer leaves required safety information unresolved."
        });
      }

      var hazard = evaluateQuestion(state || {}, question, index, order);
      hazard = applyExplicitHardStop(hazard, question.id, answer);
      if (hazard) {
        hazards.push(hazard);
      }
    });

    hazards = hazards.concat(derivedOverrides(state || {}, index, hazards));
    hazards.sort(compareHazards);

    var complete = missingCritical.length === 0;
    var highestHazard = hazards.length ? hazards[0] : null;
    var overall = complete
      ? (highestHazard ? highestHazard.level : LEVELS.LOW)
      : LEVELS.INCOMPLETE;

    return {
      overall: overall,
      complete: complete,
      answeredCount: answeredCount,
      applicableCount: applicable.length,
      vector: riskVector(hazards),
      hazards: hazards.map(function (hazard) {
        var copy = Object.assign({}, hazard);
        delete copy.order;
        return copy;
      }),
      highestHazard: highestHazard ? (function () {
        var copy = Object.assign({}, highestHazard);
        delete copy.order;
        return copy;
      })() : null,
      missingCritical: missingCritical
    };
  }

  return Object.freeze({
    LEVELS: LEVELS,
    LIKELIHOODS: LIKELIHOODS,
    SEVERITIES: SEVERITIES,
    RISK_MATRIX: RISK_MATRIX,
    matrixLevel: matrixLevel,
    numericAnswerIsValid: numericAnswerIsValid,
    applicableQuestions: applicableQuestions,
    assessAssessment: assessAssessment,
    riskVector: riskVector,
    levelLabel: levelLabel
  });
});
