(function (root, factory) {
  "use strict";
  const rules = typeof module === "object" && module.exports
    ? require("./part61-rules-data")
    : root.Part61RulesData;
  const core = typeof module === "object" && module.exports
    ? require("./part61-calculator-core")
    : root.Part61CalculatorCore;
  const api = factory(rules, core);
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  root.Part61ScenarioGenerator = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (RULES, CORE) {
  "use strict";

  const SAMPLE_RATE = 0.12;
  const ADD_CLASS_TARGETS = [
    "private-asel-add-class",
    "private-amel-add-class",
    "commercial-asel-add-class",
    "commercial-amel-add-class"
  ];
  const PATH_WEIGHTS = [
    ["class-add", 35],
    ["level-change", 15],
    ["category-add", 12],
    ["initial", 12],
    ["class-level-change", 8],
    ["instrument-rating", 8],
    ["sport-add", 4],
    ["sport-cfi", 4],
    ["military", 2]
  ];
  const SCENARIO_FOCUS_WEIGHTS = [
    ["general", 55],
    ["multi-engine", 28],
    ["rotor-helicopter", 17]
  ];
  const ROTOR_HELICOPTER_TEMPLATES = [
    { pathType: "category-add", credentials: ["private-rotor-helicopter"], targets: ["private-asel"] },
    { pathType: "category-add", credentials: ["commercial-rotor-helicopter"], targets: ["commercial-asel"] },
    { pathType: "category-add", credentials: ["commercial-rotor-helicopter"], targets: ["private-asel", "commercial-asel"] }
  ];
  const MULTI_ENGINE_TEMPLATES = [
    { pathType: "class-add", credentials: ["private-asel"], targets: ["private-amel-add-class"] },
    { pathType: "class-add", credentials: ["commercial-asel"], targets: ["commercial-amel-add-class"] },
    { pathType: "level-change", credentials: ["private-amel"], targets: ["commercial-amel"] },
    { pathType: "class-level-change", credentials: ["private-asel"], targets: ["commercial-amel"] },
    { pathType: "class-add", credentials: ["commercial-amel"], targets: ["commercial-asel-add-class"], flags: { faaCommercialAmel: true } }
  ];
  const TIER_WEIGHTS = [
    ["starting", 20],
    ["partial", 45],
    ["qualified", 35]
  ];
  const TIER_EVENT_PROBABILITY = {
    starting: 0.2,
    partial: 0.55,
    qualified: 0.85
  };
  const FLAVOR_CREDENTIALS = ["student", "instrument-airplane", "cfi-airplane", "cfii-airplane"];
  const MILITARY_AIRCRAFT = ["B-52", "C-17", "F-16", "UH-60", "T-38", "KC-135"];

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function targetIds() {
    return new Set((RULES.TARGET_OPTIONS || []).map((option) => option.id));
  }

  function fieldKeys() {
    return (RULES.FIELD_GROUPS || []).flatMap((group) => group.fields.map((field) => field[0]));
  }

  function optionLabel(list, id) {
    const found = (list || []).find((option) => option.id === id);
    return found ? found.label : id;
  }

  function credentialLabel(id) {
    return optionLabel(RULES.CREDENTIAL_OPTIONS, id);
  }

  function targetLabel(id) {
    return optionLabel(RULES.TARGET_OPTIONS, id);
  }

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function randInt(min, max) {
    return Math.round(rand(min, max));
  }

  function round(value) {
    return Number(Number(value || 0).toFixed(1));
  }

  function chance(probability) {
    return Math.random() < probability;
  }

  function choose(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function weightedPick(entries) {
    const total = entries.reduce((sum, entry) => sum + entry[1], 0);
    let cursor = Math.random() * total;
    for (const [value, weight] of entries) {
      cursor -= weight;
      if (cursor <= 0) return value;
    }
    return entries[entries.length - 1][0];
  }

  function defaultFlags() {
    return {
      militaryExperience: false,
      militaryOnly: false,
      faaCommercialAmel: false,
      priorFaa: true
    };
  }

  function jitterRates(base) {
    const source = base || RULES.DEFAULT_RATES || { aircraftWet: 185, instructor: 45 };
    return {
      aircraftWet: randInt(source.aircraftWet * 0.88, source.aircraftWet * 1.12),
      instructor: randInt(source.instructor * 0.85, source.instructor * 1.15)
    };
  }

  function emptyExperience() {
    const experience = {};
    fieldKeys().forEach((key) => {
      experience[key] = 0;
    });
    return experience;
  }

  function tierScale(tier) {
    if (tier === "starting") return rand(0.12, 0.45);
    if (tier === "partial") return rand(0.48, 0.88);
    return rand(1.0, 1.25);
  }

  function minProgress(minimum, tier, floor) {
    return round(Math.max(floor || 0, minimum * tierScale(tier)));
  }

  function maybeAddFlavor(credentials) {
    if (credentials.includes("military-pilot") || !chance(0.28)) return credentials;
    if (!credentials.some((id) => RULES.CATEGORY_CLASS && RULES.CATEGORY_CLASS[id])) return credentials;
    const addition = choose(FLAVOR_CREDENTIALS);
    if (credentials.includes(addition)) return credentials;
    return credentials.concat(addition);
  }

  function finalizeExperience(values) {
    const exp = emptyExperience();
    Object.keys(values || {}).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(exp, key)) {
        exp[key] = Math.max(0, Number(values[key]) || 0);
      }
    });

    exp.aselTime = Math.max(exp.aselTime, exp.dualAsel, exp.soloAsel, exp.commercialTrainingAsel, exp.soloPdpicAsel, exp.picAsel);
    exp.amelTime = Math.max(exp.amelTime, exp.commercialTrainingAmel, exp.soloPdpicAmel);
    exp.picAirplane = Math.max(exp.picAirplane, exp.picAsel, exp.xcPicAirplane);
    exp.xcPicTotal = Math.max(exp.xcPicTotal, exp.xcPicAirplane);
    exp.picTotal = Math.max(exp.picTotal, exp.picAirplane, exp.picHelicopter, exp.xcPicTotal);
    exp.instrumentAirplane = Math.max(exp.instrumentAirplane, exp.cfiiAirplane);
    exp.instrumentTime = Math.max(exp.instrumentTime, exp.instrumentAirplane);
    exp.airplaneTime = Math.max(
      exp.airplaneTime,
      exp.aselTime,
      exp.amelTime,
      exp.picAirplane,
      exp.instrumentAirplane,
      exp.complexTaaTurbine
    );
    exp.poweredTime = Math.max(exp.poweredTime, exp.airplaneTime, exp.helicopterTime);
    exp.totalTime = Math.max(exp.totalTime, exp.poweredTime, exp.picTotal, exp.instrumentTime, exp.nightTime);

    Object.keys(exp).forEach((key) => {
      exp[key] = round(exp[key]);
    });
    return exp;
  }

  function applyAselProgress(exp, targetId, tier, minimumFloor) {
    const minimums = {
      "sport-asel": { total: 20, dual: 15, solo: 5 },
      "recreational-asel": { total: 30, dual: 15, solo: 3 },
      "private-asel": { total: 40, dual: 20, solo: 10 },
      "commercial-asel": { total: 250, dual: 20, solo: 10, powered: 100, airplane: 50, pic: 100, picAirplane: 50, xc: 50, xcAirplane: 10, complex: 10 }
    };
    const mins = minimums[targetId] || minimums["private-asel"];
    exp.totalTime = minProgress(mins.total, tier, minimumFloor || 0);
    exp.poweredTime = minProgress(mins.powered || mins.total, tier, Math.min(exp.totalTime, minimumFloor || 0));
    exp.airplaneTime = minProgress(mins.airplane || mins.total, tier, Math.min(exp.totalTime, minimumFloor || 0));
    exp.aselTime = minProgress(mins.airplane || mins.total, tier, Math.min(exp.totalTime, minimumFloor || 0));
    exp.dualAsel = minProgress(mins.dual || 0, tier, 0);
    exp.soloAsel = minProgress(mins.solo || 0, tier, 0);
    exp.picTotal = minProgress(mins.pic || mins.solo || 0, tier, 0);
    exp.picAirplane = minProgress(mins.picAirplane || mins.solo || 0, tier, 0);
    exp.picAsel = minProgress(mins.picAirplane || mins.solo || 0, tier, 0);
    exp.xcPicTotal = minProgress(mins.xc || 5, tier, 0);
    exp.xcPicAirplane = minProgress(mins.xcAirplane || 3, tier, 0);
    exp.instrumentTime = minProgress(targetId === "commercial-asel" ? 40 : 3, tier, 0);
    exp.instrumentAirplane = minProgress(targetId === "commercial-asel" ? 15 : 3, tier, 0);
    exp.cfiiAirplane = minProgress(targetId === "commercial-asel" ? 8 : 0, tier, 0);
    exp.nightTime = minProgress(targetId === "commercial-asel" ? 20 : 5, tier, 0);
    exp.commercialTrainingAsel = minProgress(mins.dual && targetId === "commercial-asel" ? 20 : 0, tier, 0);
    exp.soloPdpicAsel = minProgress(targetId === "commercial-asel" ? 10 : 0, tier, 0);
    exp.complexTaaTurbine = minProgress(mins.complex || 0, tier, 0);
    exp.prepRecent = minProgress(targetId === "commercial-asel" ? 3 : 2, tier, 0);
  }

  function applyCommercialAmelProgress(exp, tier, minimumFloor) {
    const floor = minimumFloor || 0;
    exp.totalTime = Math.max(exp.totalTime, minProgress(250, tier, floor));
    exp.poweredTime = Math.max(exp.poweredTime, minProgress(100, tier, Math.min(exp.totalTime, floor)));
    exp.airplaneTime = Math.max(exp.airplaneTime, minProgress(50, tier, 10));
    exp.amelTime = Math.max(exp.amelTime, minProgress(50, tier, 6));
    exp.picTotal = Math.max(exp.picTotal, minProgress(100, tier, 20));
    exp.picAirplane = Math.max(exp.picAirplane, minProgress(50, tier, 5));
    exp.xcPicTotal = Math.max(exp.xcPicTotal, minProgress(50, tier, 8));
    exp.xcPicAirplane = Math.max(exp.xcPicAirplane, minProgress(10, tier, 0));
    exp.instrumentTime = Math.max(exp.instrumentTime, minProgress(40, tier, 5));
    exp.instrumentAirplane = Math.max(exp.instrumentAirplane, minProgress(15, tier, 3));
    exp.nightTime = Math.max(exp.nightTime, minProgress(20, tier, 3));
    exp.commercialTrainingAmel = Math.max(exp.commercialTrainingAmel, minProgress(20, tier, 0));
    exp.soloPdpicAmel = Math.max(exp.soloPdpicAmel, minProgress(10, tier, 0));
    exp.complexTaaTurbine = Math.max(exp.complexTaaTurbine, minProgress(10, tier, 0));
  }

  function applyHeldCredential(exp, credential, tier) {
    if (credential === "sport-asel") {
      applyAselProgress(exp, "sport-asel", "qualified", 20);
      exp.totalTime = Math.max(exp.totalTime, randInt(25, tier === "qualified" ? 95 : 55));
    } else if (credential === "recreational-asel") {
      applyAselProgress(exp, "recreational-asel", "qualified", 30);
      exp.totalTime = Math.max(exp.totalTime, randInt(35, tier === "qualified" ? 120 : 75));
    } else if (credential === "private-asel") {
      applyAselProgress(exp, "private-asel", "qualified", 40);
      exp.totalTime = Math.max(exp.totalTime, randInt(55, tier === "qualified" ? 210 : 140));
      exp.picTotal = Math.max(exp.picTotal, randInt(25, 95));
      exp.xcPicTotal = Math.max(exp.xcPicTotal, randInt(8, 45));
    } else if (credential === "private-amel") {
      exp.totalTime = randInt(70, tier === "qualified" ? 230 : 165);
      exp.poweredTime = exp.totalTime;
      exp.airplaneTime = exp.totalTime;
      exp.amelTime = randInt(35, Math.max(45, exp.totalTime - 20));
      exp.aselTime = randInt(5, 45);
      exp.picTotal = randInt(25, Math.max(35, exp.totalTime * 0.55));
      exp.picAirplane = exp.picTotal;
      exp.xcPicTotal = randInt(8, 50);
      exp.xcPicAirplane = randInt(5, Math.max(8, exp.xcPicTotal));
      exp.instrumentTime = randInt(5, 35);
      exp.instrumentAirplane = randInt(3, Math.max(5, exp.instrumentTime));
      exp.nightTime = randInt(3, 25);
    } else if (credential === "commercial-asel") {
      applyAselProgress(exp, "commercial-asel", "qualified", 250);
      exp.totalTime = Math.max(exp.totalTime, randInt(260, tier === "qualified" ? 560 : 380));
      exp.picTotal = Math.max(exp.picTotal, randInt(120, 260));
      exp.xcPicTotal = Math.max(exp.xcPicTotal, randInt(55, 140));
    } else if (credential === "commercial-amel") {
      exp.totalTime = randInt(280, tier === "qualified" ? 620 : 430);
      exp.poweredTime = exp.totalTime;
      exp.airplaneTime = exp.totalTime;
      exp.amelTime = randInt(95, Math.max(120, exp.totalTime - 120));
      exp.aselTime = randInt(25, 110);
      exp.picTotal = randInt(110, Math.max(130, exp.totalTime * 0.65));
      exp.picAirplane = exp.picTotal;
      exp.picAsel = randInt(20, Math.min(90, exp.picAirplane));
      exp.xcPicTotal = randInt(55, 150);
      exp.xcPicAirplane = randInt(20, Math.max(25, exp.xcPicTotal));
      exp.instrumentTime = randInt(40, 90);
      exp.instrumentAirplane = randInt(25, Math.max(35, exp.instrumentTime));
      exp.nightTime = randInt(15, 50);
      exp.commercialTrainingAmel = randInt(20, 55);
      exp.soloPdpicAmel = randInt(10, 35);
      exp.complexTaaTurbine = randInt(10, 35);
    } else if (credential === "private-rotor-helicopter" || credential === "commercial-rotor-helicopter") {
      const commercial = credential === "commercial-rotor-helicopter";
      exp.totalTime = commercial ? randInt(165, 360) : randInt(60, 170);
      exp.poweredTime = exp.totalTime;
      exp.helicopterTime = commercial ? randInt(140, exp.totalTime) : randInt(45, exp.totalTime);
      exp.picTotal = commercial ? randInt(100, Math.max(110, exp.totalTime * 0.75)) : randInt(25, Math.max(35, exp.totalTime * 0.6));
      exp.picHelicopter = exp.picTotal;
      exp.xcPicTotal = commercial ? randInt(50, 120) : randInt(10, 45);
      exp.instrumentTime = commercial ? randInt(25, 70) : randInt(5, 35);
      exp.nightTime = commercial ? randInt(15, 45) : randInt(4, 25);
    } else if (credential === "sport-ppc") {
      exp.totalTime = randInt(25, 85);
      exp.poweredTime = exp.totalTime;
      exp.picTotal = randInt(8, 45);
      exp.xcPicTotal = randInt(2, 20);
    }
  }

  function experienceFor(template, pathType, tier) {
    const exp = emptyExperience();
    const primaryCredential = template.credentials.find((id) => RULES.CATEGORY_CLASS && RULES.CATEGORY_CLASS[id]) || template.credentials[0];
    const firstTarget = template.targets[0];

    if (pathType === "military") {
      return finalizeExperience({
        totalTime: randInt(1200, 3200),
        poweredTime: randInt(1200, 3200),
        airplaneTime: chance(0.7) ? randInt(250, 1500) : 0,
        aselTime: chance(0.45) ? randInt(20, 180) : 0,
        amelTime: chance(0.55) ? randInt(40, 450) : 0,
        helicopterTime: chance(0.25) ? randInt(40, 600) : 0,
        picTotal: randInt(600, 1600),
        picAirplane: chance(0.7) ? randInt(150, 900) : 0,
        picAsel: chance(0.4) ? randInt(10, 100) : 0,
        picHelicopter: chance(0.2) ? randInt(25, 350) : 0,
        xcPicTotal: randInt(250, 900),
        xcPicAirplane: chance(0.7) ? randInt(90, 600) : 0,
        instrumentTime: randInt(220, 650),
        instrumentAirplane: chance(0.7) ? randInt(100, 450) : 0,
        cfiiAirplane: 0,
        nightTime: randInt(120, 420)
      });
    }

    if (primaryCredential) {
      applyHeldCredential(exp, primaryCredential, tier);
    }

    if (pathType === "initial") {
      applyAselProgress(exp, firstTarget, tier, 0);
    } else if (pathType === "level-change") {
      if (firstTarget === "commercial-amel") {
        applyCommercialAmelProgress(exp, tier, primaryCredential === "private-amel" ? 70 : 40);
      } else {
        applyAselProgress(exp, firstTarget, tier, primaryCredential === "sport-asel" ? 20 : primaryCredential === "recreational-asel" ? 30 : 40);
      }
    } else if (pathType === "class-level-change") {
      if (firstTarget === "commercial-amel") {
        applyCommercialAmelProgress(exp, tier, 40);
      } else {
        applyHeldCredential(exp, "private-amel", tier);
        exp.aselTime = Math.max(exp.aselTime, minProgress(50, tier, 5));
        exp.dualAsel = Math.max(exp.dualAsel, minProgress(20, tier, 2));
        exp.commercialTrainingAsel = minProgress(20, tier, 0);
        exp.soloPdpicAsel = minProgress(10, tier, 0);
        exp.complexTaaTurbine = minProgress(10, tier, 0);
        exp.picAsel = Math.max(exp.picAsel, minProgress(50, tier, 0));
        exp.picAirplane = Math.max(exp.picAirplane, exp.picAsel);
        exp.xcPicAirplane = Math.max(exp.xcPicAirplane, minProgress(10, tier, 0));
        exp.xcPicTotal = Math.max(exp.xcPicTotal, minProgress(50, tier, 10));
        exp.totalTime = Math.max(exp.totalTime, minProgress(250, tier, 80));
      }
    } else if (pathType === "category-add") {
      const target = firstTarget === "commercial-asel" ? "commercial-asel" : "private-asel";
      const airplaneSeed = tier === "starting" ? randInt(0, 12) : tier === "partial" ? randInt(15, 60) : randInt(70, 155);
      exp.airplaneTime = Math.max(exp.airplaneTime, airplaneSeed);
      exp.aselTime = Math.max(exp.aselTime, airplaneSeed);
      exp.dualAsel = Math.max(exp.dualAsel, target === "commercial-asel" ? minProgress(20, tier, 0) : minProgress(20, tier, 0));
      exp.soloAsel = Math.max(exp.soloAsel, target === "commercial-asel" ? randInt(0, 12) : minProgress(10, tier, 0));
      if (target === "commercial-asel") {
        exp.commercialTrainingAsel = minProgress(20, tier, 0);
        exp.soloPdpicAsel = minProgress(10, tier, 0);
        exp.complexTaaTurbine = minProgress(10, tier, 0);
        exp.picAirplane = Math.max(exp.picAirplane, minProgress(50, tier, 0));
        exp.picAsel = exp.picAirplane;
        exp.xcPicAirplane = Math.max(exp.xcPicAirplane, minProgress(10, tier, 0));
      }
    } else if (pathType === "instrument-rating") {
      exp.xcPicTotal = Math.max(exp.xcPicTotal, minProgress(50, tier, primaryCredential === "commercial-asel" ? 50 : 8));
      exp.xcPicAirplane = Math.max(exp.xcPicAirplane, minProgress(10, tier, 3));
      exp.instrumentTime = Math.max(exp.instrumentTime, minProgress(40, tier, 3));
      exp.instrumentAirplane = Math.max(exp.instrumentAirplane, minProgress(20, tier, 2));
      exp.cfiiAirplane = Math.max(exp.cfiiAirplane, minProgress(15, tier, 0));
    } else if (pathType === "sport-add") {
      exp.aselTime = Math.max(exp.aselTime, randInt(0, 25));
      exp.dualAsel = Math.max(exp.dualAsel, randInt(0, 12));
      exp.soloAsel = Math.max(exp.soloAsel, randInt(0, 8));
    } else if (pathType === "sport-cfi") {
      exp.totalTime = minProgress(150, tier, 35);
      exp.poweredTime = exp.totalTime;
      exp.airplaneTime = Math.max(exp.airplaneTime, minProgress(80, tier, 20));
      exp.aselTime = Math.max(exp.aselTime, minProgress(50, tier, 15));
      exp.picAsel = Math.max(exp.picAsel, minProgress(10, tier, 3));
      exp.picAirplane = Math.max(exp.picAirplane, exp.picAsel);
      exp.picTotal = Math.max(exp.picTotal, exp.picAirplane);
      exp.xcPicTotal = Math.max(exp.xcPicTotal, minProgress(25, tier, 2));
    }

    if (pathType === "class-add") {
      if (firstTarget.includes("asel")) {
        exp.aselTime = Math.max(exp.aselTime, randInt(10, 60));
        exp.dualAsel = Math.max(exp.dualAsel, randInt(4, 18));
        exp.soloAsel = Math.max(exp.soloAsel, randInt(0, 12));
        exp.picAsel = Math.max(exp.picAsel, randInt(0, Math.max(1, Math.min(30, exp.aselTime))));
      }
      if (firstTarget.includes("amel")) {
        exp.amelTime = Math.max(exp.amelTime, randInt(6, 40));
        exp.commercialTrainingAmel = firstTarget.includes("commercial") ? randInt(0, 8) : 0;
        exp.soloPdpicAmel = firstTarget.includes("commercial") ? randInt(0, 4) : 0;
      }
    }

    return finalizeExperience(exp);
  }

  function eventsFor(targets, tier) {
    const probability = TIER_EVENT_PROBABILITY[tier] || 0.55;
    const relevantGroups = new Set(
      (RULES.EVENT_GROUPS || [])
        .filter((group) => group.targets.some((target) => targets.includes(target)))
        .map((group) => group.id)
    );
    const events = {};
    (RULES.EVENT_OPTIONS || []).forEach((event) => {
      events[event.id] = relevantGroups.has(event.group) ? chance(probability) : false;
    });
    return events;
  }

  function scenarioName(pathType, template) {
    const held = credentialLabel(template.credentials[0] || "student");
    const target = targetLabel(template.targets[0]);
    if (pathType === "class-add") {
      return `${held} adding ${target.replace(" Added Class under 61.63(c)", "")} under 61.63(c)`;
    }
    if (pathType === "level-change") {
      return `${held} stepping up to ${target}`;
    }
    if (pathType === "category-add") {
      return `${held} adding airplane category toward ${target}`;
    }
    if (pathType === "class-level-change") {
      return `${held} changing class while stepping up to ${target}`;
    }
    if (pathType === "instrument-rating") {
      return `${held} adding the Instrument Airplane rating`;
    }
    if (pathType === "sport-add") {
      return `${held} adding a sport category or class`;
    }
    if (pathType === "sport-cfi") {
      return `${held} pursuing Sport Pilot Flight Instructor`;
    }
    if (pathType === "military") {
      return `${choose(MILITARY_AIRCRAFT)} military records to ${target}`;
    }
    return `${held} initial path to ${target}`;
  }

  function templatesFor(pathType) {
    if (pathType === "class-add") {
      return [
        { credentials: ["private-amel"], targets: ["private-asel-add-class"] },
        { credentials: ["private-asel"], targets: ["private-amel-add-class"] },
        { credentials: ["commercial-amel"], targets: ["commercial-asel-add-class"], flags: { faaCommercialAmel: chance(0.5) } },
        { credentials: ["commercial-asel"], targets: ["commercial-amel-add-class"] }
      ];
    }
    if (pathType === "level-change") {
      return [
        { credentials: ["sport-asel"], targets: ["recreational-asel"] },
        { credentials: ["recreational-asel"], targets: ["private-asel"] },
        { credentials: ["private-asel"], targets: ["commercial-asel"] }
      ];
    }
    if (pathType === "class-level-change") {
      return [
        { credentials: ["private-amel"], targets: ["commercial-asel"] }
      ];
    }
    if (pathType === "category-add") {
      return [
        { credentials: ["private-rotor-helicopter"], targets: ["private-asel"] },
        { credentials: ["commercial-rotor-helicopter"], targets: ["commercial-asel"] },
        { credentials: ["commercial-rotor-helicopter"], targets: ["private-asel", "commercial-asel"] },
        { credentials: ["sport-ppc"], targets: ["sport-asel"] }
      ];
    }
    if (pathType === "initial") {
      return [
        { credentials: [], targets: ["private-asel"] },
        { credentials: ["student"], targets: ["private-asel"] },
        { credentials: ["student"], targets: ["sport-asel"] },
        { credentials: [], targets: ["recreational-asel"] }
      ];
    }
    if (pathType === "instrument-rating") {
      return [
        { credentials: ["private-asel"], targets: ["instrument-airplane"] },
        { credentials: ["commercial-asel"], targets: ["instrument-airplane"] }
      ];
    }
    if (pathType === "sport-add") {
      return [
        { credentials: ["sport-asel"], targets: ["sport-add-category-class"] },
        { credentials: ["sport-ppc"], targets: ["sport-add-category-class"] }
      ];
    }
    if (pathType === "sport-cfi") {
      return [
        { credentials: ["sport-asel"], targets: ["sport-cfi"] },
        { credentials: ["private-asel"], targets: ["sport-cfi"] }
      ];
    }
    return ADD_CLASS_TARGETS.map((target) => ({
      credentials: ["military-pilot"],
      targets: [target],
      flags: {
        militaryExperience: true,
        militaryOnly: true,
        faaCommercialAmel: false,
        priorFaa: false
      }
    }));
  }

  function templatesForFocus(focus) {
    if (focus === "rotor-helicopter") return ROTOR_HELICOPTER_TEMPLATES;
    if (focus === "multi-engine") return MULTI_ENGINE_TEMPLATES;
    return null;
  }

  function buildScenario(pathType, forcedTemplate) {
    const tier = weightedPick(TIER_WEIGHTS);
    const availableTargets = targetIds();
    const sourceTemplates = forcedTemplate ? [forcedTemplate] : templatesFor(pathType);
    const candidates = sourceTemplates.filter((template) => template.targets.every((target) => availableTargets.has(target)));
    const template = clone(choose(candidates.length ? candidates : templatesFor("class-add")));
    const intendedPathType = template.pathType || pathType;
    const flags = Object.assign(defaultFlags(), template.flags || {});
    if (template.credentials.includes("military-pilot")) {
      flags.militaryExperience = true;
      flags.militaryOnly = true;
      flags.faaCommercialAmel = false;
      flags.priorFaa = false;
    }
    const credentials = template.credentials.includes("military-pilot")
      ? template.credentials.slice()
      : maybeAddFlavor(template.credentials.slice());
    const scenarioTemplate = Object.assign({}, template, { credentials });
    return {
      name: scenarioName(intendedPathType, scenarioTemplate),
      credentials,
      targets: template.targets.slice(),
      flags,
      rates: jitterRates(),
      experience: experienceFor(template, intendedPathType, tier),
      events: eventsFor(template.targets, tier)
    };
  }

  function pathTypeFor(scenario) {
    if (!CORE || typeof CORE.classifyPath !== "function") return null;
    if (!scenario || !Array.isArray(scenario.targets) || !scenario.targets.length) return null;
    return CORE.classifyPath(scenario, scenario.targets[0]).pathType;
  }

  function hasUnsupportedAudit(scenario) {
    if (!CORE || typeof CORE.calculateAudit !== "function") return false;
    const audit = CORE.calculateAudit(scenario);
    return audit.audits.some((item) => String(item.verdict || "").includes("not implemented"));
  }

  function validScenario(scenario, intendedPathType) {
    try {
      if (!scenario || !Array.isArray(scenario.targets) || !scenario.targets.length) return false;
      const availableTargets = targetIds();
      if (!scenario.targets.every((target) => availableTargets.has(target))) return false;
      const hasMilitaryCredential = scenario.credentials && scenario.credentials.includes("military-pilot");
      if (hasMilitaryCredential && !(scenario.flags && scenario.flags.militaryOnly && scenario.flags.militaryExperience && scenario.flags.priorFaa === false)) {
        return false;
      }
      if (intendedPathType && pathTypeFor(scenario) !== intendedPathType) return false;
      return !hasUnsupportedAudit(scenario);
    } catch (error) {
      return false;
    }
  }

  function sampleScenario() {
    const samples = RULES.SAMPLE_SCENARIOS || [];
    if (!samples.length) return null;
    const scenario = clone(choose(samples));
    scenario.rates = jitterRates(scenario.rates);
    return validScenario(scenario) ? scenario : null;
  }

  function fallbackScenario() {
    const classAddSample = (RULES.SAMPLE_SCENARIOS || []).find((scenario) => pathTypeFor(scenario) === "class-add");
    if (classAddSample) {
      const scenario = clone(classAddSample);
      scenario.rates = jitterRates(scenario.rates);
      if (validScenario(scenario, "class-add")) return scenario;
    }
    const scenario = buildScenario("class-add");
    return validScenario(scenario, "class-add") ? scenario : {
      name: "Private AMEL adding Private ASEL under 61.63(c)",
      credentials: ["private-amel"],
      targets: ["private-asel-add-class"],
      flags: defaultFlags(),
      rates: jitterRates(),
      experience: finalizeExperience({ totalTime: 120, poweredTime: 120, airplaneTime: 120, aselTime: 20, amelTime: 90, picTotal: 70, picAirplane: 70, xcPicTotal: 25, xcPicAirplane: 25, instrumentTime: 15, instrumentAirplane: 15, nightTime: 10, dualAsel: 8, soloAsel: 4 }),
      events: eventsFor(["private-asel-add-class"], "partial")
    };
  }

  function generateRandomScenario() {
    if (chance(SAMPLE_RATE)) {
      const sample = sampleScenario();
      if (sample) return sample;
    }

    for (let attempt = 0; attempt < 10; attempt += 1) {
      const focus = weightedPick(SCENARIO_FOCUS_WEIGHTS);
      const focusedTemplates = templatesForFocus(focus);
      const focusedTemplate = focusedTemplates ? choose(focusedTemplates) : null;
      const pathType = focusedTemplate ? focusedTemplate.pathType : weightedPick(PATH_WEIGHTS);
      const scenario = buildScenario(pathType, focusedTemplate);
      if (validScenario(scenario, pathType)) return scenario;
    }

    return fallbackScenario();
  }

  return {
    generateRandomScenario
  };
});
