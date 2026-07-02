(function (root, factory) {
  "use strict";
  const data = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = data;
  }
  root.Part61RulesData = data;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const REVIEW_DATE = "2026-06-30";
  const DEFAULT_RATES = {
    aircraftWet: 185,
    instructor: 45,
    dual: 230,
    solo: 185
  };

  const LINKS = {
    part61: "https://www.ecfr.gov/current/title-14/part-61",
    cfr6131: "https://www.ecfr.gov/current/title-14/part-61/section-61.31",
    cfr6139: "https://www.ecfr.gov/current/title-14/part-61/section-61.39",
    cfr6163: "https://www.ecfr.gov/current/title-14/part-61/section-61.63",
    cfr6165: "https://www.ecfr.gov/current/title-14/part-61/section-61.65",
    cfr6173: "https://www.ecfr.gov/current/title-14/part-61/section-61.73",
    cfr61109: "https://www.ecfr.gov/current/title-14/part-61/section-61.109",
    cfr61129: "https://www.ecfr.gov/current/title-14/part-61/section-61.129",
    cfr61313: "https://www.ecfr.gov/current/title-14/part-61/section-61.313",
    ac6165k: "https://www.faa.gov/documentLibrary/media/Advisory_Circular/AC_61-65K.pdf",
    domingo2018: "https://www.faa.gov/media/11046",
    acs: "https://www.faa.gov/training_testing/testing/acs"
  };

  const CREDENTIAL_OPTIONS = [
    { id: "student", label: "Student Pilot" },
    { id: "sport-asel", label: "Sport Pilot - ASEL" },
    { id: "private-asel", label: "Private Pilot - ASEL" },
    { id: "private-rotor-helicopter", label: "Private Pilot - Rotorcraft Helicopter" },
    { id: "instrument-airplane", label: "Instrument Rating - Airplane" },
    { id: "commercial-asel", label: "Commercial Pilot - ASEL" },
    { id: "commercial-amel", label: "Commercial Pilot - AMEL" },
    { id: "commercial-rotor-helicopter", label: "Commercial Pilot - Rotorcraft Helicopter" },
    { id: "military-pilot", label: "Military Pilot" },
    { id: "cfi-airplane", label: "Flight Instructor - Airplane" },
    { id: "cfii-airplane", label: "Instrument Instructor - Airplane" }
  ];

  const TARGET_OPTIONS = [
    { id: "sport-asel", label: "Sport Pilot - ASEL" },
    { id: "private-asel", label: "Private Pilot - ASEL" },
    { id: "instrument-airplane", label: "Instrument Rating - Airplane" },
    { id: "commercial-asel", label: "Commercial Pilot - ASEL" },
    { id: "commercial-asel-add-class", label: "Commercial ASEL Added Class under 61.63(c)" }
  ];

  const FIELD_GROUPS = [
    {
      title: "Core time",
      fields: [
        ["totalTime", "Total Time"],
        ["poweredTime", "Powered Time"],
        ["airplaneTime", "Airplane"],
        ["aselTime", "ASEL"],
        ["amelTime", "AMEL"],
        ["helicopterTime", "Helicopter"]
      ]
    },
    {
      title: "PIC and cross-country",
      fields: [
        ["picTotal", "PIC Total"],
        ["picAirplane", "PIC Airplane"],
        ["picAsel", "PIC ASEL"],
        ["picHelicopter", "PIC Helicopter"],
        ["xcPicTotal", "XC PIC Total"],
        ["xcPicAirplane", "XC PIC Airplane"]
      ]
    },
    {
      title: "Training and event buckets",
      fields: [
        ["instrumentTime", "Instrument All"],
        ["instrumentAirplane", "Instrument Airplane"],
        ["cfiiAirplane", "CFII-Airplane Instrument"],
        ["nightTime", "Night"],
        ["dualAsel", "Dual ASEL"],
        ["soloAsel", "Solo ASEL"],
        ["commercialTrainingAsel", "Commercial Training ASEL"],
        ["soloPdpicAsel", "Solo/PDPIC ASEL"],
        ["complexTaaTurbine", "Complex/TAA/Turbine"],
        ["prepRecent", "Recent Prep"]
      ]
    }
  ];

  const EVENT_OPTIONS = [
    { id: "privateDualXc", label: "Private dual XC complete" },
    { id: "privateNight", label: "Private night dual complete" },
    { id: "privateNightXc", label: "Private night XC >100 NM complete" },
    { id: "privateNightLandings", label: "10 night full-stop landings complete" },
    { id: "privateInstrument", label: "Private 3 hr instrument complete" },
    { id: "privatePrep", label: "Private recent prep complete" },
    { id: "privateSoloXc", label: "5 hr solo XC complete" },
    { id: "privateSoloLongXc", label: "150 NM solo XC complete" },
    { id: "privateToweredSolo", label: "3 towered solo landings complete" },
    { id: "instrumentIfrXc", label: "Instrument IFR XC complete" },
    { id: "commercialInstrument", label: "Commercial 10 hr instrument complete" },
    { id: "commercialComplexTaa", label: "Commercial complex/TAA/turbine complete" },
    { id: "commercialDayXc", label: "Commercial day XC complete" },
    { id: "commercialNightXc", label: "Commercial night XC complete" },
    { id: "commercialPrep", label: "Commercial recent prep complete" },
    { id: "commercialLongXc", label: "Commercial 300 NM solo/PDPIC XC complete" },
    { id: "commercialNightTowered", label: "Commercial night towered event complete" }
  ];

  const ENDORSEMENTS = {
    practical: { item: "A.1", title: "Practical test prerequisites", cfr: "61.39" },
    aktr: { item: "A.2", title: "AKTR deficiency review", cfr: "61.39" },
    soloNoClass: { item: "A.76", title: "Certificated-pilot solo without category/class rating", cfr: "61.31(d)(2)" },
    additionalRating: { item: "A.78", title: "Additional aircraft category or class rating", cfr: "61.63(b)/(c)" },
    privateKnowledge: { item: "A.36", title: "Private pilot knowledge test", cfr: "61.35/61.103" },
    privatePractical: { item: "A.37", title: "Private pilot practical test", cfr: "61.103/61.107/61.109" },
    commercialKnowledge: { item: "A.38", title: "Commercial pilot knowledge test", cfr: "61.123/61.125" },
    commercialPractical: { item: "A.39", title: "Commercial pilot practical test", cfr: "61.123/61.127/61.129" },
    instrumentKnowledge: { item: "A.42", title: "Instrument rating knowledge test", cfr: "61.65" },
    instrumentPractical: { item: "A.43/A.44", title: "Instrument rating practical test", cfr: "61.65" },
    complex: { item: "A.72", title: "Complex airplane PIC", cfr: "61.31(e)" },
    highPerformance: { item: "A.73", title: "High-performance airplane PIC", cfr: "61.31(f)" },
    highAltitude: { item: "A.74", title: "High-altitude pressurized aircraft PIC", cfr: "61.31(g)" },
    tailwheel: { item: "A.75", title: "Tailwheel airplane PIC", cfr: "61.31(i)" }
  };

  const REQUIREMENTS = {
    "sport-asel": [
      ["61.313", "20 hours total flight time", 20, "totalTime", "parent", "Broad parent row."],
      ["61.313", "15 hours dual ASEL", 15, "dualAsel", "parent", "Must be ASEL dual."],
      ["61.313", "5 hours solo ASEL", 5, "soloAsel", "parent", "Must be ASEL solo."],
      ["61.313", "2 hours dual cross-country", 2, null, "event", "Fits inside dual if flown."],
      ["61.313", "10 full-stop takeoffs and landings", null, null, "event", "Event only unless more time needed."],
      ["61.313", "Solo XC 75 NM with required points", null, null, "event", "Fits inside solo if flown."],
      ["61.313", "2 hours prep in preceding 2 calendar months", 2, "prepRecent", "event", "Can fit inside dual."]
    ],
    "private-asel": [
      ["61.109(a)", "40 hours total flight time", 40, "totalTime", "parent", "Broad parent row; prior helicopter may credit if valid."],
      ["61.109(a)", "20 hours dual single-engine airplane", 20, "dualAsel", "parent", "Domingo 2018: must be single-engine airplane."],
      ["61.109(a)(1)", "3 hours dual XC in single-engine airplane", 3, null, "event", "Can fit inside 20 dual."],
      ["61.109(a)(2)", "3 hours night dual in single-engine airplane", 3, null, "event", "Can fit inside 20 dual."],
      ["61.109(a)(2)(i)", "Night XC over 100 NM", null, null, "event", "Event inside night dual."],
      ["61.109(a)(2)(ii)", "10 night takeoffs and full-stop landings", null, null, "event", "Event inside night dual."],
      ["61.109(a)(3)", "3 hours instrument training in single-engine airplane", 3, null, "event", "Can fit inside 20 dual."],
      ["61.109(a)(4)", "3 hours prep in preceding 2 calendar months", 3, null, "event", "Can fit inside 20 dual."],
      ["61.109(a)(5)", "10 hours solo single-engine airplane", 10, "soloAsel", "parent", "Domingo 2018: must be single-engine airplane."],
      ["61.109(a)(5)(i)", "5 hours solo XC", 5, null, "event", "Can fit inside 10 solo."],
      ["61.109(a)(5)(ii)", "150 NM solo XC, 3 points, one 50 NM leg", null, null, "event", "Event inside solo XC."],
      ["61.109(a)(5)(iii)", "3 towered full-stop solo takeoffs/landings", null, null, "event", "Event inside solo."]
    ],
    "instrument-airplane": [
      ["61.65(a)(1)", "Private/concurrent airplane rating gate", null, null, "gate", "Must hold or pursue airplane rating."],
      ["61.65(d)(1)", "50 hours XC PIC", 50, "xcPicTotal", "parent", "Broad XC PIC if valid."],
      ["61.65(d)(1)", "10 hours XC PIC in airplanes", 10, "xcPicAirplane", "parent", "Airplane-specific."],
      ["61.65(d)(2)", "40 hours actual/simulated instrument", 40, "instrumentTime", "parent", "Broad instrument if valid."],
      ["61.65(d)(2)", "15 hours instrument training in airplane", 15, "cfiiAirplane", "parent", "CFII-airplane training."],
      ["61.65(d)(2)(i)", "3 hours recent airplane instrument training", 3, null, "event", "Can fit inside 15 CFII-airplane."],
      ["61.65(d)(2)(ii)", "IFR XC with CFII-airplane", null, null, "event", "250 NM, approaches, 3 kinds."]
    ],
    "commercial-asel": [
      ["61.129(a)", "250 hours total flight time as pilot", 250, "totalTime", "parent", "Broad parent row."],
      ["61.129(a)(1)", "100 hours powered aircraft", 100, "poweredTime", "parent", "Broad powered time if valid."],
      ["61.129(a)(1)", "50 hours airplanes", 50, "airplaneTime", "parent", "Airplane-specific."],
      ["61.129(a)(2)", "100 hours PIC", 100, "picTotal", "parent", "Broad PIC if valid."],
      ["61.129(a)(2)(i)", "50 hours PIC in airplanes", 50, "picAirplane", "parent", "Airplane-specific."],
      ["61.129(a)(2)(ii)", "50 hours PIC XC", 50, "xcPicTotal", "parent", "Broad XC PIC if valid."],
      ["61.129(a)(2)(ii)", "10 hours PIC XC in airplanes", 10, "xcPicAirplane", "parent", "Airplane-specific."],
      ["61.129(a)(3)", "20 hours commercial training", 20, "commercialTrainingAsel", "parent", "Commercial training parent row."],
      ["61.129(a)(3)(i)", "10 hours instrument training incl 5 ASEL", 10, null, "event", "Can fit inside 20 training."],
      ["61.129(a)(3)(ii)", "10 hours complex/TAA/turbine airplane", 10, "complexTaaTurbine", "event", "Can fit inside 20 training."],
      ["61.129(a)(3)(iii)", "2-hour day XC over 100 NM", 2, null, "event", "Can fit inside 20 training."],
      ["61.129(a)(3)(iv)", "2-hour night XC over 100 NM", 2, null, "event", "Can fit inside 20 training."],
      ["61.129(a)(3)(v)", "3 hours prep in preceding 2 calendar months", 3, null, "event", "Can fit inside 20 training."],
      ["61.129(a)(4)", "10 hours solo/PDPIC ASEL", 10, "soloPdpicAsel", "parent", "Separate from dual/training unless PDPIC rule path applies."],
      ["61.129(a)(4)(i)", "300 NM XC, 3 points, one point 250 NM from departure", null, null, "event", "Can fit inside 10 solo/PDPIC."],
      ["61.129(a)(4)(ii)", "5 night VFR hours plus 10 towered takeoffs/landings", 5, null, "event", "Can fit inside 10 solo/PDPIC."]
    ]
  };

  return {
    REVIEW_DATE,
    DEFAULT_RATES,
    LINKS,
    CREDENTIAL_OPTIONS,
    TARGET_OPTIONS,
    FIELD_GROUPS,
    EVENT_OPTIONS,
    ENDORSEMENTS,
    REQUIREMENTS
  };
});
