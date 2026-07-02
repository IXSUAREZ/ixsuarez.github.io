(function (root, factory) {
  "use strict";
  const data = typeof module === "object" && module.exports
    ? require("./part61-rules-data")
    : root.Part61RulesData;
  const api = factory(data);
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  root.Part61CalculatorCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (RULES) {
  "use strict";

  const UNKNOWN = "UNKNOWN";

  function isKnown(value) {
    return typeof value === "number" && Number.isFinite(value);
  }

  function asNumber(value) {
    if (value === "" || value === null || value === undefined) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function fmtHours(value) {
    if (typeof value === "string") return value;
    return isKnown(value) ? Number(value.toFixed(1)) : UNKNOWN;
  }

  function money(value) {
    return isKnown(value) ? Math.round(value) : UNKNOWN;
  }

  function ratesFor(input) {
    const aircraftWet = asNumber(input && input.aircraftWet);
    const instructor = asNumber(input && input.instructor);
    const wet = isKnown(aircraftWet) ? aircraftWet : RULES.DEFAULT_RATES.aircraftWet;
    const instructorRate = isKnown(instructor) ? instructor : RULES.DEFAULT_RATES.instructor;
    return {
      aircraftWet: wet,
      instructor: instructorRate,
      dual: wet + instructorRate,
      solo: wet
    };
  }

  function hasCredential(profile, id) {
    return Array.isArray(profile.credentials) && profile.credentials.includes(id);
  }

  function get(profile, key) {
    return asNumber(profile.experience && profile.experience[key]);
  }

  function eventDone(profile, id) {
    return Boolean(profile.events && profile.events[id]);
  }

  function rem(required, has) {
    if (!isKnown(required)) return null;
    if (!isKnown(has)) return UNKNOWN;
    return Math.max(0, required - has);
  }

  function row(cfr, requirement, required, has, credit, remaining, why, overlapLogic, kind) {
    return { cfr, requirement, required: fmtHours(required), has: fmtHours(has), credit: fmtHours(credit), remaining: fmtHours(remaining), why, overlapLogic, kind };
  }

  function eventRow(cfr, requirement, hours, completed, why, overlapLogic) {
    const remaining = completed ? 0 : hours;
    return {
      cfr,
      requirement,
      required: isKnown(hours) ? fmtHours(hours) : "Event",
      has: completed ? "Complete" : "Not logged",
      credit: completed ? "Complete" : "Pending",
      remaining: isKnown(remaining) ? fmtHours(remaining) : "Event",
      why,
      overlapLogic,
      kind: "event"
    };
  }

  function knownSum(values) {
    return values.reduce((sum, value) => sum + (isKnown(value) ? value : 0), 0);
  }

  function hasUnknown(values) {
    return values.some((value) => value === UNKNOWN || value === null || value === undefined || Number.isNaN(value));
  }

  function summarizeRows(rows) {
    return rows
      .filter((item) => item.kind !== "gate")
      .map((item) => item.remaining)
      .filter((value) => typeof value === "number");
  }

  function baseGates(targetLabel) {
    return [
      ["Knowledge test", "Part 61 / target certificate", "If applicable", "Before practical test", "Applicant / instructor", "Confirm whether this target path requires a new knowledge test."],
      ["AKTR deficiencies", "61.39 / AC 61-65K A.2", "If needed", "Before practical test endorsement", "Instructor", "Review missed knowledge areas and endorse if applicable."],
      ["IACRA application", "FAA application process", "Yes", "Before practical test", "Applicant / instructor / DPE", "Use the correct certificate/rating action for " + targetLabel + "."],
      ["Medical / BasicMed eligibility", "Part 61 / operating rules", "As required", "Before acting as required crewmember", "Applicant", "Separate from flight-hour totals."],
      ["TSA / citizenship record", "Flight training security rules", "When applicable", "Before covered training", "Instructor / school", "Keep the verification record with training documents."],
      ["61.39 prerequisites", "14 CFR 61.39 / AC 61-65K A.1", "Yes", "Practical-test signoff", "Instructor", "Training time, readiness, application, and records."],
      ["ACS readiness", "FAA ACS", "Yes", "Before practical test", "Instructor / applicant", "ACS is the test standard, not the experience rule."],
      ["Aircraft documents / airworthiness", "ARROW / AV1ATES / aircraft records", "When using aircraft for checkride", "Before checkride aircraft acceptance", "Applicant / school", "Not Part 61 hours; verify registration, airworthiness certificate, operating limits/POH, weight/balance, inspections."]
    ].map(([gate, source, required, whenNeeded, whoHandles, notes]) => ({ gate, source, required, whenNeeded, whoHandles, notes }));
  }

  function endorsements(keys, requiredNote) {
    return keys.map((key) => {
      const item = RULES.ENDORSEMENTS[key];
      return {
        item: item.item,
        endorsement: item.title,
        useWhen: requiredNote || "When applicable to this target path.",
        cfrBasis: item.cfr,
        required: key === "aktr" ? "If needed" : "Yes",
        whoSigns: "Authorized instructor with appropriate privileges.",
        notes: "Use current AC 61-65 or successor sample wording."
      };
    });
  }

  function sourceLinks(targetId) {
    const links = [
      { label: "14 CFR Part 61", url: RULES.LINKS.part61 },
      { label: "AC 61-65K", url: RULES.LINKS.ac6165k },
      { label: "FAA ACS", url: RULES.LINKS.acs }
    ];
    if (targetId === "private-asel") links.push({ label: "Domingo 2018 Legal Interpretation", url: RULES.LINKS.domingo2018 });
    if (targetId === "private-asel") links.unshift({ label: "14 CFR 61.109", url: RULES.LINKS.cfr61109 });
    if (targetId === "instrument-airplane") links.unshift({ label: "14 CFR 61.65", url: RULES.LINKS.cfr6165 });
    if (targetId === "commercial-asel") links.unshift({ label: "14 CFR 61.129", url: RULES.LINKS.cfr61129 });
    if (targetId === "commercial-asel-add-class") links.unshift({ label: "14 CFR 61.63", url: RULES.LINKS.cfr6163 });
    if (targetId === "sport-asel") links.unshift({ label: "14 CFR 61.313", url: RULES.LINKS.cfr61313 });
    return links;
  }

  function classifyAuditRow(item) {
    const text = [item.kind, item.cfr, item.requirement, item.why, item.overlapLogic].join(" ").toLowerCase();
    const requirement = String(item.requirement || "").toLowerCase();
    let bucketType = "broad";
    if (String(item.cfr || "").includes("RAW REQUIREMENT SUM")) bucketType = "raw";
    else if (String(item.cfr || "").includes("OPTIMIZED COMBINED TOTAL")) bucketType = "optimized";
    else if (item.kind === "event") bucketType = "event";
    else if (item.kind === "gate" || text.includes("gate") || text.includes("paperwork")) bucketType = "paperwork";
    else if (requirement.includes("solo") || requirement.includes("pdpic")) bucketType = "solo";
    else if (requirement.includes("dual") || requirement.includes("training") || requirement.includes("cfii")) bucketType = "dual";

    let status = "remaining";
    if (item.remaining === UNKNOWN || item.has === UNKNOWN || item.credit === UNKNOWN) status = "missing";
    if (item.remaining === 0 || item.remaining === "0" || item.remaining === "Complete") status = "satisfied";
    if (bucketType === "paperwork" && item.remaining === UNKNOWN) status = "paperwork";
    if (bucketType === "raw" || bucketType === "optimized") status = "total";

    let overlapGroup = "broad";
    if (bucketType === "dual") overlapGroup = "dual";
    else if (bucketType === "solo") overlapGroup = "solo";
    else if (bucketType === "paperwork") overlapGroup = "paperwork";
    else if (bucketType === "event") overlapGroup = "event";
    else if (bucketType === "raw" || bucketType === "optimized") overlapGroup = "total";
    return { bucketType, status, overlapGroup };
  }

  function withRowMetadata(item) {
    return { ...item, ...classifyAuditRow(item) };
  }

  function classifyTrainingBlock(block) {
    const text = [block.block, block.flightType, block.mode, block.cfrRows, block.events].join(" ").toLowerCase();
    if (text.includes("dual")) return "dual";
    if (text.includes("solo") || text.includes("pdpic")) return "solo";
    if (text.includes("time building") || text.includes("hour building") || text.includes("pic/solo")) return "building";
    if (text.includes("gate") || text.includes("iacra") || text.includes("paperwork")) return "paperwork";
    return "broad";
  }

  function withTrainingMetadata(block) {
    const blockType = classifyTrainingBlock(block);
    return { ...block, blockType, overlapGroup: blockType };
  }

  function privateAsel(profile) {
    const rates = profile.rates;
    const total = get(profile, "totalTime");
    const dual = get(profile, "dualAsel");
    const solo = get(profile, "soloAsel");
    const totalRem = rem(40, total);
    const dualRem = rem(20, dual);
    const soloRem = rem(10, solo);
    const dualEventMin = Math.max(
      eventDone(profile, "privateDualXc") ? 0 : 3,
      eventDone(profile, "privateNight") ? 0 : 3,
      eventDone(profile, "privateInstrument") ? 0 : 3,
      eventDone(profile, "privatePrep") ? 0 : 3
    );
    const soloEventMin = Math.max(
      eventDone(profile, "privateSoloXc") ? 0 : 5,
      eventDone(profile, "privateToweredSolo") ? 0 : 0
    );
    const rows = [
      row("61.109(a)", "40 hours total flight time", 40, total, total, totalRem, "Broad total time may transfer if loggable and valid.", "Broad parent row.", "parent"),
      row("61.109(a)", "20 hours dual single-engine airplane", 20, dual, dual, dualRem, "Domingo 2018: rotor/helicopter time does not satisfy this ASEL dual bucket.", "Parent dual row; subevents fit inside if flown.", "parent"),
      eventRow("61.109(a)(1)", "3 hours dual XC in single-engine airplane", 3, eventDone(profile, "privateDualXc"), "Airplane-specific event.", "Fits inside the 20 dual parent row."),
      eventRow("61.109(a)(2)", "3 hours night dual in single-engine airplane", 3, eventDone(profile, "privateNight"), "Airplane-specific event.", "Fits inside the 20 dual parent row."),
      eventRow("61.109(a)(2)(i)", "Night XC over 100 NM", null, eventDone(profile, "privateNightXc"), "Night XC event.", "Can overlap dual/night/XC if flown correctly."),
      eventRow("61.109(a)(2)(ii)", "10 night full-stop takeoffs and landings", null, eventDone(profile, "privateNightLandings"), "Night landing event.", "Can overlap night dual."),
      eventRow("61.109(a)(3)", "3 hours instrument training", 3, eventDone(profile, "privateInstrument"), "Airplane-specific event.", "Fits inside 20 dual parent row."),
      eventRow("61.109(a)(4)", "3 hours prep within preceding 2 calendar months", 3, eventDone(profile, "privatePrep"), "Recent prep gate.", "Fits inside 20 dual parent row."),
      row("61.109(a)(5)", "10 hours solo single-engine airplane", 10, solo, solo, soloRem, "Domingo 2018: rotor/helicopter time does not satisfy this ASEL solo bucket.", "Parent solo row; solo events fit inside.", "parent"),
      eventRow("61.109(a)(5)(i)", "5 hours solo XC", 5, eventDone(profile, "privateSoloXc"), "Solo XC event.", "Fits inside 10 solo parent row."),
      eventRow("61.109(a)(5)(ii)", "150 NM solo XC, 3 points, one 50 NM leg", null, eventDone(profile, "privateSoloLongXc"), "Solo XC event.", "Fits inside solo XC block."),
      eventRow("61.109(a)(5)(iii)", "3 towered full-stop solo takeoffs/landings", null, eventDone(profile, "privateToweredSolo"), "Towered-airport event.", "Fits inside 10 solo parent row.")
    ];
    const rawValues = summarizeRows(rows);
    const raw = knownSum(rawValues);
    const dualNeeded = isKnown(dualRem) ? Math.max(dualRem, dualEventMin) : UNKNOWN;
    const soloNeeded = isKnown(soloRem) ? Math.max(soloRem, soloEventMin) : UNKNOWN;
    const optimized = hasUnknown([totalRem, dualNeeded, soloNeeded]) ? UNKNOWN : Math.max(totalRem, dualNeeded + soloNeeded);
    const extraBuilding = isKnown(optimized) && isKnown(dualNeeded) && isKnown(soloNeeded) ? Math.max(0, optimized - dualNeeded - soloNeeded) : UNKNOWN;
    const dualCost = isKnown(dualNeeded) ? dualNeeded * rates.dual : UNKNOWN;
    const soloCost = isKnown(soloNeeded) && isKnown(extraBuilding) ? (soloNeeded + extraBuilding) * rates.solo : UNKNOWN;
    const trainingPlan = isKnown(optimized)
      ? [
        planBlock("Dual ASEL foundation", "Maneuvers, landings, instrument intro", Math.max(0, Math.min(10, dualNeeded)), "Dual", "61.109(a), 61.109(a)(3)", "Basic ASEL proficiency and instrument event", rates.dual),
        planBlock("Dual XC / night", "Cross-country, night, night landings", Math.max(0, Math.min(7, dualNeeded)), "Dual", "61.109(a)(1), 61.109(a)(2)", "Dual XC, night XC, night full-stop landings", rates.dual),
        planBlock("Dual checkride prep", "Practical-test prep", Math.max(0, dualNeeded - Math.min(17, dualNeeded)), "Dual", "61.109(a)(4)", "Recent prep", rates.dual),
        planBlock("Solo local / towered", "Local solo and towered landings", Math.max(0, Math.min(5, soloNeeded)), "Solo", "61.109(a)(5), 61.109(a)(5)(iii)", "Towered full-stop landings", rates.solo),
        planBlock("Solo cross-country", "150 NM solo XC", Math.max(0, soloNeeded - Math.min(5, soloNeeded)), "Solo", "61.109(a)(5)(i)-(ii)", "Solo XC events", rates.solo),
        planBlock("Additional ASEL time building", "Local/XC practice as needed", extraBuilding, "Solo or dual as authorized", "61.109(a)", "Fills any broad total-time gap beyond required dual and solo", rates.solo)
      ].filter((block) => block.hours > 0)
      : [];
    return audit(profile, {
      targetId: "private-asel",
      title: "Private Pilot - ASEL",
      verdict: "Additional category/class route under 61.63(b) plus 61.109(a). Domingo 2018 controls rotorcraft/helicopter credit for the ASEL dual and solo buckets.",
      raw,
      optimized,
      dualCost,
      soloCost,
      rows,
      events: rows.filter((item) => item.kind === "event"),
      trainingPlan,
      endorsements: endorsements(["soloNoClass", "additionalRating", "practical", "aktr", "privateKnowledge", "privatePractical"], "Private ASEL add-on and practical-test readiness."),
      gates: baseGates("Private ASEL"),
      unknowns: unknownsFor([["totalTime", total], ["dualAsel", dual], ["soloAsel", solo]])
    });
  }

  function sportAsel(profile) {
    const rates = profile.rates;
    const total = get(profile, "totalTime");
    const dual = get(profile, "dualAsel");
    const solo = get(profile, "soloAsel");
    const totalRem = rem(20, total);
    const dualRem = rem(15, dual);
    const soloRem = rem(5, solo);
    const rows = [
      row("61.313", "20 hours total flight time", 20, total, total, totalRem, "Sport ASEL broad parent.", "Parent row.", "parent"),
      row("61.313", "15 hours dual ASEL", 15, dual, dual, dualRem, "ASEL dual bucket.", "Parent dual row.", "parent"),
      row("61.313", "5 hours solo ASEL", 5, solo, solo, soloRem, "ASEL solo bucket.", "Parent solo row.", "parent"),
      eventRow("61.313", "Sport ASEL XC, landing, solo XC, and prep events", null, false, "Events must be verified.", "Fit inside dual/solo if planned.")
    ];
    const raw = knownSum(summarizeRows(rows));
    const optimized = hasUnknown([totalRem, dualRem, soloRem]) ? UNKNOWN : Math.max(totalRem, dualRem + soloRem);
    const extraBuilding = isKnown(optimized) && isKnown(dualRem) && isKnown(soloRem) ? Math.max(0, optimized - dualRem - soloRem) : UNKNOWN;
    const dualCost = isKnown(dualRem) ? dualRem * rates.dual : UNKNOWN;
    const soloCost = isKnown(soloRem) && isKnown(extraBuilding) ? (soloRem + extraBuilding) * rates.solo : UNKNOWN;
    return audit(profile, {
      targetId: "sport-asel",
      title: "Sport Pilot - ASEL",
      verdict: "Sport ASEL route under 61.313. This V1 calculator shows the main hour buckets and event checklist.",
      raw,
      optimized,
      dualCost,
      soloCost,
      rows,
      events: rows.filter((item) => item.kind === "event"),
      trainingPlan: isKnown(optimized) ? [
        planBlock("Sport dual", "Dual ASEL training and prep", dualRem, "Dual", "61.313", "Dual XC, landing, prep events", rates.dual),
        planBlock("Sport solo", "Solo ASEL practice and XC", soloRem, "Solo", "61.313", "Solo XC and landing events", rates.solo),
        planBlock("Additional sport ASEL time", "Time building as needed", extraBuilding, "Solo or dual as authorized", "61.313", "Fills any broad total-time gap", rates.solo)
      ].filter((block) => block.hours > 0) : [],
      endorsements: endorsements(["soloNoClass", "practical", "aktr"], "Sport ASEL path when applicable."),
      gates: baseGates("Sport ASEL"),
      unknowns: unknownsFor([["totalTime", total], ["dualAsel", dual], ["soloAsel", solo]])
    });
  }

  function instrumentAirplane(profile) {
    const rates = profile.rates;
    const xcPic = get(profile, "xcPicTotal");
    const xcPicAirplane = get(profile, "xcPicAirplane");
    const inst = get(profile, "instrumentTime");
    const cfii = get(profile, "cfiiAirplane");
    const xcRem = rem(50, xcPic);
    const xcAirplaneRem = rem(10, xcPicAirplane);
    const instRem = rem(40, inst);
    const cfiiRem = rem(15, cfii);
    const cfiiEventMin = eventDone(profile, "instrumentIfrXc") ? 3 : Math.max(3, 0);
    const rows = [
      row("61.65(a)(1)", "Private/concurrent airplane rating gate", null, null, null, null, "Must hold or pursue airplane rating.", "Gate, not hours.", "gate"),
      row("61.65(d)(1)", "50 hours XC PIC", 50, xcPic, xcPic, xcRem, "Broad XC PIC if valid.", "May overlap with airplane XC PIC if same flights qualify.", "parent"),
      row("61.65(d)(1)", "10 hours XC PIC in airplanes", 10, xcPicAirplane, xcPicAirplane, xcAirplaneRem, "Airplane-specific.", "Can sit inside 50 XC PIC if airplane PIC XC.", "parent"),
      row("61.65(d)(2)", "40 hours actual/simulated instrument", 40, inst, inst, instRem, "Instrument bucket.", "May overlap CFII-airplane instrument if logged correctly.", "parent"),
      row("61.65(d)(2)", "15 hours instrument training in airplane", 15, cfii, cfii, cfiiRem, "CFII-airplane bucket.", "Can sit inside 40 instrument.", "parent"),
      eventRow("61.65(d)(2)(i)", "3 recent airplane instrument hours", 3, false, "Recent training event.", "Fits inside CFII-airplane if timed correctly."),
      eventRow("61.65(d)(2)(ii)", "IFR XC with CFII-airplane", null, eventDone(profile, "instrumentIfrXc"), "250 NM route, approaches, 3 kinds.", "Fits inside CFII/instrument time if flown correctly.")
    ];
    const raw = knownSum(summarizeRows(rows));
    const cfiiNeeded = isKnown(cfiiRem) ? Math.max(cfiiRem, cfiiEventMin) : UNKNOWN;
    const optimized = hasUnknown([xcRem, xcAirplaneRem, instRem, cfiiNeeded]) ? UNKNOWN : Math.max(xcRem, xcAirplaneRem, instRem, cfiiNeeded);
    const extraBuilding = isKnown(optimized) && isKnown(cfiiNeeded) ? Math.max(0, optimized - cfiiNeeded) : UNKNOWN;
    const dualCost = isKnown(cfiiNeeded) ? cfiiNeeded * rates.dual : UNKNOWN;
    const soloCost = isKnown(extraBuilding) ? extraBuilding * rates.solo : UNKNOWN;
    return audit(profile, {
      targetId: "instrument-airplane",
      title: "Instrument Rating - Airplane",
      verdict: "Instrument-Airplane audit under 61.65. Keep airplane-specific XC PIC and CFII-airplane training separate.",
      raw,
      optimized,
      dualCost,
      soloCost,
      rows,
      events: rows.filter((item) => item.kind === "event"),
      trainingPlan: isKnown(optimized) ? [
        planBlock("CFII airplane instrument", "Instrument training, recent prep, IFR XC", cfiiNeeded, "Dual", "61.65(d)(2)", "Recent 3 hours and IFR XC as scheduled", rates.dual),
        planBlock("XC PIC / instrument building", "Airplane PIC or instrument practice as needed", extraBuilding, "PIC/solo or dual as appropriate", "61.65(d)(1)-(2)", "Fills broad XC PIC or instrument-time gaps", rates.solo)
      ].filter((block) => block.hours > 0) : [],
      endorsements: endorsements(["instrumentKnowledge", "instrumentPractical", "practical", "aktr"], "Instrument-Airplane practical-test readiness."),
      gates: baseGates("Instrument-Airplane"),
      unknowns: unknownsFor([["xcPicTotal", xcPic], ["xcPicAirplane", xcPicAirplane], ["instrumentTime", inst], ["cfiiAirplane", cfii]])
    });
  }

  function commercialAsel(profile) {
    const rates = profile.rates;
    const total = get(profile, "totalTime");
    const powered = get(profile, "poweredTime");
    const airplane = get(profile, "airplaneTime");
    const pic = get(profile, "picTotal");
    const picAirplane = get(profile, "picAirplane");
    const xc = get(profile, "xcPicTotal");
    const xcAirplane = get(profile, "xcPicAirplane");
    const training = get(profile, "commercialTrainingAsel");
    const complex = get(profile, "complexTaaTurbine");
    const soloPdpic = get(profile, "soloPdpicAsel");
    const totalRem = rem(250, total);
    const poweredRem = rem(100, powered);
    const airplaneRem = rem(50, airplane);
    const picRem = rem(100, pic);
    const picAirplaneRem = rem(50, picAirplane);
    const xcRem = rem(50, xc);
    const xcAirplaneRem = rem(10, xcAirplane);
    const trainingRem = rem(20, training);
    const complexRem = rem(10, complex);
    const soloPdpicRem = rem(10, soloPdpic);
    const trainingEventMin = Math.max(
      eventDone(profile, "commercialInstrument") ? 0 : 10,
      isKnown(complexRem) ? complexRem : 0,
      eventDone(profile, "commercialDayXc") ? 0 : 2,
      eventDone(profile, "commercialNightXc") ? 0 : 2,
      eventDone(profile, "commercialPrep") ? 0 : 3
    );
    const soloEventMin = eventDone(profile, "commercialNightTowered") ? 0 : 5;
    const rows = [
      row("61.129(a)", "250 hours total flight time as pilot", 250, total, total, totalRem, "Broad parent row.", "New ASEL hours may also build total.", "parent"),
      row("61.129(a)(1)", "100 hours powered aircraft", 100, powered, powered, poweredRem, "Broad powered row.", "New ASEL hours may also build powered.", "parent"),
      row("61.129(a)(1)", "50 hours airplanes", 50, airplane, airplane, airplaneRem, "Airplane-specific row.", "New ASEL hours may build airplane time.", "parent"),
      row("61.129(a)(2)", "100 hours PIC", 100, pic, pic, picRem, "Broad PIC row.", "Solo/PDPIC may help if loggable.", "parent"),
      row("61.129(a)(2)(i)", "50 hours PIC in airplanes", 50, picAirplane, picAirplane, picAirplaneRem, "Airplane-specific PIC.", "Solo/PDPIC may help if loggable.", "parent"),
      row("61.129(a)(2)(ii)", "50 hours PIC XC", 50, xc, xc, xcRem, "Broad XC PIC.", "Airplane XC PIC may sit inside this.", "parent"),
      row("61.129(a)(2)(ii)", "10 hours PIC XC in airplanes", 10, xcAirplane, xcAirplane, xcAirplaneRem, "Airplane-specific XC PIC.", "Can sit inside 50 PIC XC.", "parent"),
      row("61.129(a)(3)", "20 hours commercial training", 20, training, training, trainingRem, "Commercial training parent row.", "Training subevents fit inside.", "parent"),
      eventRow("61.129(a)(3)(i)", "10 instrument training incl 5 ASEL", 10, eventDone(profile, "commercialInstrument"), "Training event.", "Fits inside 20 training."),
      row("61.129(a)(3)(ii)", "10 complex/TAA/turbine airplane", 10, complex, complex, complexRem, "Training event.", "Can fit inside 20 training if planned.", "event"),
      eventRow("61.129(a)(3)(iii)", "2-hour day XC over 100 NM", 2, eventDone(profile, "commercialDayXc"), "Training event.", "Fits inside 20 training."),
      eventRow("61.129(a)(3)(iv)", "2-hour night XC over 100 NM", 2, eventDone(profile, "commercialNightXc"), "Training event.", "Fits inside 20 training."),
      eventRow("61.129(a)(3)(v)", "3 hours prep in preceding 2 calendar months", 3, eventDone(profile, "commercialPrep"), "Training event.", "Fits inside 20 training."),
      row("61.129(a)(4)", "10 hours solo/PDPIC ASEL", 10, soloPdpic, soloPdpic, soloPdpicRem, "Solo/PDPIC parent row.", "Separate from dual/training unless PDPIC path supports it.", "parent"),
      eventRow("61.129(a)(4)(i)", "300 NM XC, 3 points, one point 250 NM from departure", null, eventDone(profile, "commercialLongXc"), "Solo/PDPIC event.", "Fits inside 10 solo/PDPIC."),
      eventRow("61.129(a)(4)(ii)", "5 night VFR hours and 10 towered takeoffs/landings", 5, eventDone(profile, "commercialNightTowered"), "Solo/PDPIC event.", "Fits inside 10 solo/PDPIC.")
    ];
    const raw = knownSum(summarizeRows(rows));
    const trainingNeeded = isKnown(trainingRem) ? Math.max(trainingRem, trainingEventMin) : UNKNOWN;
    const soloPdpicNeeded = isKnown(soloPdpicRem) ? Math.max(soloPdpicRem, soloEventMin) : UNKNOWN;
    const optimizedInputs = [totalRem, poweredRem, airplaneRem, picRem, picAirplaneRem, xcRem, xcAirplaneRem, trainingNeeded, soloPdpicNeeded];
    const optimized = hasUnknown(optimizedInputs) ? UNKNOWN : Math.max(totalRem, poweredRem, airplaneRem, picRem, picAirplaneRem, xcRem, xcAirplaneRem, trainingNeeded + soloPdpicNeeded);
    const extraBuilding = isKnown(optimized) && isKnown(trainingNeeded) && isKnown(soloPdpicNeeded) ? Math.max(0, optimized - trainingNeeded - soloPdpicNeeded) : UNKNOWN;
    const dualCost = isKnown(trainingNeeded) ? trainingNeeded * rates.dual : UNKNOWN;
    const soloCost = isKnown(soloPdpicNeeded) && isKnown(extraBuilding) ? (soloPdpicNeeded + extraBuilding) * rates.solo : UNKNOWN;
    const trainingPlan = isKnown(optimized)
      ? [
        planBlock("Commercial training", "Instrument/commercial/TAA as needed", trainingNeeded, "Dual", "61.129(a)(3)", "Instrument, TAA/complex, day/night XC, prep", rates.dual),
        planBlock("Solo/PDPIC ASEL", "Long XC and night towered events", soloPdpicNeeded, "Solo/PDPIC", "61.129(a)(4)", "300 NM XC, night VFR towered", rates.solo),
        planBlock("Airplane/PIC/XC hour building", "ASEL airplane, PIC, or XC building as needed", extraBuilding, "Solo/PDPIC or rental PIC", "61.129(a)(1)-(2)", "Fills broad airplane, PIC, and XC gaps beyond required training blocks", rates.solo)
      ].filter((block) => block.hours > 0)
      : [];
    return audit(profile, {
      targetId: "commercial-asel",
      title: "Commercial Pilot - ASEL",
      verdict: "Commercial ASEL audit under 61.129(a). Broad buckets and airplane-specific buckets are separated; optimized total preserves legal overlap only.",
      raw,
      optimized,
      dualCost,
      soloCost,
      rows,
      events: rows.filter((item) => item.kind === "event"),
      trainingPlan,
      endorsements: endorsements(["commercialKnowledge", "commercialPractical", "practical", "aktr", "complex"], "Commercial ASEL practical-test readiness."),
      gates: baseGates("Commercial ASEL"),
      unknowns: unknownsFor([
        ["totalTime", total],
        ["poweredTime", powered],
        ["airplaneTime", airplane],
        ["picTotal", pic],
        ["picAirplane", picAirplane],
        ["xcPicTotal", xc],
        ["xcPicAirplane", xcAirplane],
        ["commercialTrainingAsel", training],
        ["soloPdpicAsel", soloPdpic]
      ])
    });
  }

  function commercialAselAddClass(profile) {
    const rates = profile.rates;
    const holdsCommercialAmel = hasCredential(profile, "commercial-amel") || Boolean(profile.flags && profile.flags.faaCommercialAmel);
    const militaryOnly = Boolean(profile.flags && profile.flags.militaryOnly);
    const rows = [
      {
        cfr: militaryOnly ? "61.73" : "61.63(c)",
        requirement: militaryOnly ? "Military competence / records review before civilian class credit" : "Additional airplane class rating",
        required: "Train to proficiency",
        has: holdsCommercialAmel ? "FAA Commercial AMEL" : (militaryOnly ? "Military records" : "Not established"),
        credit: holdsCommercialAmel ? "Class-add route" : UNKNOWN,
        remaining: holdsCommercialAmel ? "No fixed FAA hour minimum" : UNKNOWN,
        why: militaryOnly ? "Military-only scenarios route through 61.73 first." : "Same category/new class under 61.63(c).",
        overlapLogic: "Cost is formula-based until proficiency hours are supplied.",
        kind: "parent"
      },
      {
        cfr: "61.39 / ACS",
        requirement: "Practical-test readiness and ACS task proficiency",
        required: "Proficient",
        has: UNKNOWN,
        credit: UNKNOWN,
        remaining: "Train to proficiency",
        why: "ACS is the test standard, not an aeronautical-experience minimum.",
        overlapLogic: "Training flights may cover multiple ACS tasks.",
        kind: "event"
      }
    ];
    const verdict = militaryOnly
      ? "Military/B-52 scenario: check 61.73 and official records first. Do not invent civilian ASEL/AMEL credit from military status."
      : "FAA Commercial AMEL to Commercial ASEL is usually an added airplane class under 61.63(c). No specified FAA training-hour minimum; train to proficiency.";
    return audit(profile, {
      targetId: "commercial-asel-add-class",
      title: "Commercial ASEL Added Class under 61.63(c)",
      verdict,
      raw: UNKNOWN,
      optimized: "Train to proficiency",
      dualCost: `Dual proficiency hours x $${money(rates.dual)}`,
      soloCost: `Solo/PDPIC hours x $${money(rates.solo)} if used`,
      rows,
      events: rows.filter((item) => item.kind === "event"),
      trainingPlan: [
        { block: "ASEL proficiency", flightType: "Commercial maneuvers and ACS tasks", hours: "As needed", mode: "Dual", cfrRows: "61.63(c), ACS", events: "Class-add proficiency", cost: `hours x $${money(rates.dual)}`, notes: "No fixed FAA minimum." },
        { block: "Solo/PDPIC if used", flightType: "Class-add solo/PDPIC practice", hours: "As needed", mode: "Solo/PDPIC", cfrRows: "61.31(d)(2) if solo without class", events: "Instructor-limited solo authorization", cost: `hours x $${money(rates.solo)}`, notes: "Use only if operationally needed." }
      ],
      endorsements: endorsements(["additionalRating", "practical", "aktr", "soloNoClass"], "Commercial ASEL added-class path."),
      gates: baseGates("Commercial ASEL added class"),
      unknowns: holdsCommercialAmel || militaryOnly ? [] : ["Confirm whether the pilot holds an FAA Commercial AMEL rating or only military records."]
    });
  }

  function planBlock(block, flightType, hours, mode, cfrRows, events, rate) {
    const numericHours = isKnown(hours) ? Number(hours.toFixed(1)) : hours;
    return {
      block,
      flightType,
      hours: numericHours,
      mode,
      cfrRows,
      events,
      cost: isKnown(hours) ? money(hours * rate) : UNKNOWN,
      notes: "Combines compatible requirements only."
    };
  }

  function unknownsFor(pairs) {
    return pairs.filter(([, value]) => !isKnown(value)).map(([key]) => `Enter ${key} to finalize the optimized total.`);
  }

  function audit(profile, spec) {
    const dualCost = typeof spec.dualCost === "number" ? money(spec.dualCost) : spec.dualCost;
    const soloCost = typeof spec.soloCost === "number" ? money(spec.soloCost) : spec.soloCost;
    const totalCost = typeof dualCost === "number" && typeof soloCost === "number" ? dualCost + soloCost : UNKNOWN;
    const rows = spec.rows.concat([
      { cfr: "RAW REQUIREMENT SUM", requirement: "Arithmetic visibility only", required: "", has: "", credit: "", remaining: fmtHours(spec.raw), why: "Not the flight plan.", overlapLogic: "Adds visible remaining hour rows.", kind: "total" },
      { cfr: "OPTIMIZED COMBINED TOTAL", requirement: "Legal minimum after allowed overlap", required: "", has: "", credit: "", remaining: fmtHours(spec.optimized), why: "Use this for cost.", overlapLogic: "Combines compatible rows only.", kind: "total" }
    ]).map(withRowMetadata);
    const summary = {
      target: spec.title,
      rawRequirementSum: fmtHours(spec.raw),
      optimizedCombinedTotal: fmtHours(spec.optimized),
      dualCost,
      soloCost,
      estimatedTotalCost: totalCost,
      notes: "Raw is arithmetic visibility only; optimized drives cost."
    };
    return {
      targetId: spec.targetId,
      title: spec.title,
      verdict: spec.verdict,
      summary,
      rows,
      events: spec.events.map(withRowMetadata),
      trainingPlan: spec.trainingPlan.map(withTrainingMetadata),
      gates: spec.gates,
      endorsements: spec.endorsements,
      unknowns: spec.unknowns,
      links: sourceLinks(spec.targetId),
      sourceReviewDate: RULES.REVIEW_DATE
    };
  }

  function applyAuditCarryForward(profile, auditResult) {
    const next = JSON.parse(JSON.stringify(profile));
    next.experience = next.experience || {};
    const optimized = auditResult.summary.optimizedCombinedTotal;
    if (isKnown(optimized)) {
      ["totalTime", "poweredTime", "airplaneTime", "aselTime"].forEach((key) => {
        const current = asNumber(next.experience[key]);
        if (isKnown(current)) next.experience[key] = current + optimized;
      });
    }
    const dualCost = auditResult.summary.dualCost;
    const soloCost = auditResult.summary.soloCost;
    if (auditResult.targetId === "private-asel" && !next.credentials.includes("private-asel")) {
      next.credentials.push("private-asel");
    }
    if (auditResult.targetId === "commercial-asel" && !next.credentials.includes("commercial-asel")) {
      next.credentials.push("commercial-asel");
    }
    next._carryForwardNotes = next._carryForwardNotes || [];
    next._carryForwardNotes.push(`${auditResult.title}: optimized ${optimized}; dual cost ${dualCost}; solo/PDPIC cost ${soloCost}`);
    return next;
  }

  function calculateStage(profile, targetId) {
    if (targetId === "sport-asel") return sportAsel(profile);
    if (targetId === "private-asel") return privateAsel(profile);
    if (targetId === "instrument-airplane") return instrumentAirplane(profile);
    if (targetId === "commercial-asel") return commercialAsel(profile);
    if (targetId === "commercial-asel-add-class") return commercialAselAddClass(profile);
    return unsupported(targetId);
  }

  function unsupported(targetId) {
    return {
      targetId,
      title: targetId,
      verdict: "This target is not implemented in the V1 data set. No rule was invented.",
      summary: { target: targetId, rawRequirementSum: UNKNOWN, optimizedCombinedTotal: UNKNOWN, dualCost: UNKNOWN, soloCost: UNKNOWN, estimatedTotalCost: UNKNOWN, notes: "Unsupported V1 target." },
      rows: [],
      events: [],
      trainingPlan: [],
      gates: [],
      endorsements: [],
      unknowns: [`Add ${targetId} to rules-data.js before using this path.`],
      links: [{ label: "14 CFR Part 61", url: RULES.LINKS.part61 }],
      sourceReviewDate: RULES.REVIEW_DATE
    };
  }

  function calculateAudit(input) {
    const profile = {
      credentials: Array.isArray(input.credentials) ? input.credentials.slice() : [],
      flags: input.flags || {},
      experience: input.experience || {},
      events: input.events || {},
      rates: ratesFor(input.rates || {})
    };
    const stages = Array.isArray(input.targets) && input.targets.length ? input.targets : ["private-asel"];
    let workingProfile = profile;
    const audits = stages.map((stage) => {
      const result = calculateStage(workingProfile, stage);
      workingProfile = applyAuditCarryForward(workingProfile, result);
      return result;
    });
    const combinedKnown = audits.every((item) => isKnown(item.summary.optimizedCombinedTotal));
    const combinedHours = combinedKnown ? audits.reduce((sum, item) => sum + item.summary.optimizedCombinedTotal, 0) : UNKNOWN;
    const combinedCostKnown = audits.every((item) => typeof item.summary.estimatedTotalCost === "number");
    const combinedCost = combinedCostKnown ? audits.reduce((sum, item) => sum + item.summary.estimatedTotalCost, 0) : UNKNOWN;
    return {
      audits,
      combined: {
        optimizedHours: fmtHours(combinedHours),
        estimatedCost: combinedCost,
        rates: profile.rates,
        notes: workingProfile._carryForwardNotes || []
      },
      sourceReviewDate: RULES.REVIEW_DATE
    };
  }

  function calculateOverlapExample(crossCountryHours, dualHours) {
    const xc = asNumber(crossCountryHours);
    const dual = asNumber(dualHours);
    if (!isKnown(xc) || !isKnown(dual)) {
      return {
        rawRequirementSum: UNKNOWN,
        optimizedCombinedTotal: UNKNOWN,
        overlapLogic: "Enter both XC and dual hours."
      };
    }
    return {
      rawRequirementSum: fmtHours(xc + dual),
      optimizedCombinedTotal: fmtHours(Math.max(xc, dual)),
      overlapLogic: "Dual XC can count toward both dual and cross-country when all conditions are met."
    };
  }

  return {
    UNKNOWN,
    isKnown,
    ratesFor,
    classifyAuditRow,
    calculateAudit,
    calculateStage,
    calculateOverlapExample
  };
});
