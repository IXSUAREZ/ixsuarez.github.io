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
    cfr6151: "https://www.ecfr.gov/current/title-14/part-61/section-61.51",
    cfr6163: "https://www.ecfr.gov/current/title-14/part-61/section-61.63",
    cfr6165: "https://www.ecfr.gov/current/title-14/part-61/section-61.65",
    cfr6173: "https://www.ecfr.gov/current/title-14/part-61/section-61.73",
    cfr6199: "https://www.ecfr.gov/current/title-14/part-61/section-61.99",
    cfr61109: "https://www.ecfr.gov/current/title-14/part-61/section-61.109",
    cfr61129: "https://www.ecfr.gov/current/title-14/part-61/section-61.129",
    cfr61313: "https://www.ecfr.gov/current/title-14/part-61/section-61.313",
    cfr61321: "https://www.ecfr.gov/current/title-14/part-61/section-61.321",
    cfr61411: "https://www.ecfr.gov/current/title-14/part-61/section-61.411",
    ac6165k: "https://www.faa.gov/documentLibrary/media/Advisory_Circular/AC_61-65K.pdf",
    domingo2018: "https://www.faa.gov/media/11046",
    acs: "https://www.faa.gov/training_testing/testing/acs"
  };

  // Category/class/level taxonomy for the path classifier. Keyed by credential
  // and target id. "powered" drives the 61.63(b)(4) power-to-power knowledge-test
  // exception. Ids intentionally absent (student, instrument-airplane, cfi-airplane,
  // cfii-airplane, military-pilot) do not contribute a category/class rating.
  const CATEGORY_CLASS = {
    "sport-asel": { category: "airplane", klass: "asel", level: "sport", powered: true },
    "sport-ppc": { category: "powered-parachute", klass: "land", level: "sport", powered: true },
    "recreational-asel": { category: "airplane", klass: "asel", level: "recreational", powered: true },
    "private-asel": { category: "airplane", klass: "asel", level: "private", powered: true },
    "private-amel": { category: "airplane", klass: "amel", level: "private", powered: true },
    "private-rotor-helicopter": { category: "rotorcraft", klass: "helicopter", level: "private", powered: true },
    "commercial-asel": { category: "airplane", klass: "asel", level: "commercial", powered: true },
    "commercial-amel": { category: "airplane", klass: "amel", level: "commercial", powered: true },
    "commercial-rotor-helicopter": { category: "rotorcraft", klass: "helicopter", level: "commercial", powered: true },
    // Dedicated add-class targets earn an airplane class at the noted level.
    "commercial-asel-add-class": { category: "airplane", klass: "asel", level: "commercial", powered: true },
    "private-asel-add-class": { category: "airplane", klass: "asel", level: "private", powered: true },
    "commercial-amel-add-class": { category: "airplane", klass: "amel", level: "commercial", powered: true },
    "private-amel-add-class": { category: "airplane", klass: "amel", level: "private", powered: true },
    "private-ases-add-class": { category: "airplane", klass: "ases", level: "private", powered: true },
    "commercial-ases-add-class": { category: "airplane", klass: "ases", level: "commercial", powered: true }
  };

  const LEVEL_ORDER = { student: 0, sport: 1, recreational: 2, private: 3, commercial: 4, atp: 5 };

  const CREDENTIAL_OPTIONS = [
    { id: "student", label: "Student Pilot" },
    { id: "sport-asel", label: "Sport Pilot - ASEL" },
    { id: "sport-ppc", label: "Sport Pilot - Powered Parachute" },
    { id: "recreational-asel", label: "Recreational Pilot - ASEL" },
    { id: "private-asel", label: "Private Pilot - ASEL" },
    { id: "private-amel", label: "Private Pilot - AMEL" },
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
    { id: "recreational-asel", label: "Recreational Pilot - ASEL" },
    { id: "private-asel", label: "Private Pilot - ASEL" },
    { id: "private-amel", label: "Private Pilot - AMEL" },
    { id: "private-asel-add-class", label: "Private ASEL Added Class under 61.63(c)" },
    { id: "private-amel-add-class", label: "Private AMEL Added Class under 61.63(c)" },
    { id: "private-ases-add-class", label: "Private ASES Added Class under 61.63(c)" },
    { id: "private-rotor-helicopter", label: "Private Pilot - Rotorcraft Helicopter" },
    { id: "instrument-airplane", label: "Instrument Rating - Airplane" },
    { id: "commercial-asel", label: "Commercial Pilot - ASEL" },
    { id: "commercial-amel", label: "Commercial Pilot - AMEL" },
    { id: "commercial-asel-add-class", label: "Commercial ASEL Added Class under 61.63(c)" },
    { id: "commercial-amel-add-class", label: "Commercial AMEL Added Class under 61.63(c)" },
    { id: "commercial-ases-add-class", label: "Commercial ASES Added Class under 61.63(c)" },
    { id: "commercial-rotor-helicopter", label: "Commercial Pilot - Rotorcraft Helicopter" },
    { id: "sport-add-category-class", label: "Sport Pilot Add Category/Class under 61.321" },
    { id: "sport-cfi", label: "Sport Pilot Flight Instructor under 61.411" }
  ];

  // Field tuples are [key, label, hint]. The hint is UI-only helper text;
  // the calculator core reads input.experience[key] directly and never sees it.
  const FIELD_GROUPS = [
    {
      title: "Core time",
      fields: [
        ["totalTime", "Total Time", "All logged flight time in any aircraft."],
        ["poweredTime", "Powered Time", "Time in powered aircraft; feeds 61.129(a)(1)."],
        ["airplaneTime", "Airplane", "Time in airplanes of any class."],
        ["aselTime", "ASEL", "Airplane single-engine land time."],
        ["amelTime", "AMEL", "Airplane multiengine land time."],
        ["helicopterTime", "Helicopter", "Rotorcraft helicopter time."]
      ]
    },
    {
      title: "PIC and cross-country",
      fields: [
        ["picTotal", "PIC Total", "Pilot-in-command time in any aircraft."],
        ["picAirplane", "PIC Airplane", "PIC time in airplanes."],
        ["picAsel", "PIC ASEL", "PIC time in single-engine airplanes."],
        ["picHelicopter", "PIC Helicopter", "PIC time in helicopters."],
        ["xcPicTotal", "XC PIC Total", "Cross-country PIC time in any aircraft."],
        ["xcPicAirplane", "XC PIC Airplane", "Cross-country PIC time in airplanes."]
      ]
    },
    {
      title: "Instrument and night",
      fields: [
        ["instrumentTime", "Instrument All", "Actual or simulated instrument time in any aircraft."],
        ["instrumentAirplane", "Instrument Airplane", "Instrument time logged in airplanes."],
        ["cfiiAirplane", "CFII-Airplane Instrument", "Instrument training received from a CFII in an airplane."],
        ["nightTime", "Night", "Night flight time."]
      ]
    },
    {
      title: "Training and checkride prep",
      fields: [
        ["dualAsel", "Dual ASEL", "Dual instruction received in single-engine airplanes."],
        ["soloAsel", "Solo ASEL", "Solo time in single-engine airplanes."],
        ["dualAmel", "Dual AMEL", "Dual instruction received in multiengine airplanes."],
        ["soloAmel", "Solo AMEL", "Solo time in multiengine airplanes."],
        ["dualHelicopter", "Dual Helicopter", "Dual instruction received in helicopters."],
        ["soloHelicopter", "Solo Helicopter", "Solo time in helicopters."],
        ["commercialTrainingAsel", "Commercial Training ASEL", "61.129(a)(3) commercial training received in ASEL."],
        ["soloPdpicAsel", "Solo/PDPIC ASEL", "61.129(a)(4) solo or performing-duties-of-PIC time in ASEL."],
        ["complexTaaTurbine", "Complex/TAA/Turbine", "Time in complex, TAA, or turbine-powered airplanes."],
        ["prepRecent", "Recent Prep", "Checkride prep received within the 2 calendar months before the test."],
        // Appended at the end to preserve positional share-link encoding (flatFieldList order).
        ["commercialTrainingAmel", "Commercial Training AMEL", "61.129(b)(3) commercial training received in a multiengine airplane."],
        ["soloPdpicAmel", "Solo/PDPIC AMEL", "61.129(b)(4) solo or performing-duties-of-PIC time in a multiengine airplane."],
        ["commercialTrainingHelicopter", "Commercial Training Helicopter", "61.129(c)(3) commercial training received in a helicopter."],
        ["soloPdpicHelicopter", "Solo/PDPIC Helicopter", "61.129(c)(4) solo or performing-duties-of-PIC time in a helicopter."]
      ]
    }
  ];

  const EVENT_GROUPS = [
    { id: "private", label: "Private Pilot events", targets: ["sport-asel", "private-asel", "private-amel", "private-rotor-helicopter"] },
    { id: "instrument", label: "Instrument Rating events", targets: ["instrument-airplane"] },
    { id: "commercial", label: "Commercial Pilot events", targets: ["commercial-asel", "commercial-asel-add-class", "commercial-amel", "commercial-amel-add-class", "commercial-rotor-helicopter"] }
  ];

  const EVENT_OPTIONS = [
    { id: "privateDualXc", label: "Private dual XC complete", group: "private" },
    { id: "privateNight", label: "Private night dual complete", group: "private" },
    { id: "privateNightXc", label: "Private night XC >100 NM complete", group: "private" },
    { id: "privateNightLandings", label: "10 night full-stop landings complete", group: "private" },
    { id: "privateInstrument", label: "Private 3 hr instrument complete", group: "private" },
    { id: "privatePrep", label: "Private recent prep complete", group: "private" },
    { id: "privateSoloXc", label: "5 hr solo XC complete", group: "private" },
    { id: "privateSoloLongXc", label: "150 NM solo XC complete", group: "private" },
    { id: "privateToweredSolo", label: "3 towered solo landings complete", group: "private" },
    { id: "instrumentIfrXc", label: "Instrument IFR XC complete", group: "instrument" },
    { id: "commercialInstrument", label: "Commercial 10 hr instrument complete", group: "commercial" },
    { id: "commercialComplexTaa", label: "Commercial complex/TAA/turbine complete", group: "commercial" },
    { id: "commercialDayXc", label: "Commercial day XC complete", group: "commercial" },
    { id: "commercialNightXc", label: "Commercial night XC complete", group: "commercial" },
    { id: "commercialPrep", label: "Commercial recent prep complete", group: "commercial" },
    { id: "commercialLongXc", label: "Commercial 300 NM solo/PDPIC XC complete", group: "commercial" },
    { id: "commercialNightTowered", label: "Commercial night towered event complete", group: "commercial" }
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
    tailwheel: { item: "A.75", title: "Tailwheel airplane PIC", cfr: "61.31(i)" },
    recreationalKnowledge: { item: "61.96/61.97", title: "Recreational pilot knowledge test", cfr: "61.35/61.96/61.97" },
    recreationalPractical: { item: "61.98/61.99", title: "Recreational pilot practical test", cfr: "61.96/61.98/61.99" },
    sportProficiency: { item: "61.321", title: "Sport pilot additional category/class proficiency", cfr: "61.321(a)" },
    sportKnowledge: { item: "61.307(a)", title: "Sport pilot knowledge test", cfr: "61.307(a)/61.309" },
    sportPractical: { item: "61.307(b)", title: "Sport pilot practical test", cfr: "61.307(b)/61.311/61.313" },
    sportCfiKnowledge: { item: "61.405", title: "Sport flight instructor knowledge tests", cfr: "61.405(a)" },
    sportCfiSpin: { item: "61.405(b)", title: "Sport CFI spin training proficiency", cfr: "61.405(b)(1)(ii)" },
    sportCfiProficiency: { item: "61.409", title: "Sport flight instructor flight proficiency", cfr: "61.409" }
  };

  const SAMPLE_SCENARIOS = [
    {
      name: "Rotorcraft commercial to Private ASEL then Commercial ASEL",
      credentials: ["commercial-rotor-helicopter"],
      targets: ["private-asel", "commercial-asel"],
      flags: {
        militaryExperience: false,
        militaryOnly: false,
        faaCommercialAmel: false,
        priorFaa: true
      },
      rates: {
        aircraftWet: DEFAULT_RATES.aircraftWet,
        instructor: DEFAULT_RATES.instructor
      },
      experience: {
        totalTime: 150,
        poweredTime: 150,
        airplaneTime: 0,
        aselTime: 0,
        amelTime: 0,
        helicopterTime: 150,
        picTotal: 100,
        picAirplane: 0,
        picAsel: 0,
        picHelicopter: 100,
        xcPicTotal: 50,
        xcPicAirplane: 0,
        instrumentTime: 40,
        instrumentAirplane: 0,
        cfiiAirplane: 0,
        nightTime: 10,
        dualAsel: 0,
        soloAsel: 0,
        commercialTrainingAsel: 0,
        soloPdpicAsel: 0,
        complexTaaTurbine: 0,
        prepRecent: 0,
        commercialTrainingAmel: 0,
        soloPdpicAmel: 0
      },
      events: {}
    },
    {
      name: "FAA Commercial AMEL to Commercial ASEL added class",
      credentials: ["commercial-amel"],
      targets: ["commercial-asel-add-class"],
      flags: {
        militaryExperience: false,
        militaryOnly: false,
        faaCommercialAmel: true,
        priorFaa: true
      },
      rates: {
        aircraftWet: 205,
        instructor: 65
      },
      experience: {
        totalTime: 310,
        poweredTime: 310,
        airplaneTime: 310,
        aselTime: 40,
        amelTime: 120,
        helicopterTime: 0,
        picTotal: 180,
        picAirplane: 180,
        picAsel: 30,
        picHelicopter: 0,
        xcPicTotal: 85,
        xcPicAirplane: 85,
        instrumentTime: 55,
        instrumentAirplane: 55,
        cfiiAirplane: 0,
        nightTime: 22,
        dualAsel: 8,
        soloAsel: 12,
        commercialTrainingAsel: 0,
        soloPdpicAsel: 0,
        complexTaaTurbine: 15,
        prepRecent: 0,
        commercialTrainingAmel: 0,
        soloPdpicAmel: 0
      },
      events: {}
    },
    {
      name: "Private ASEL partial Commercial ASEL progress",
      credentials: ["private-asel"],
      targets: ["commercial-asel"],
      flags: {
        militaryExperience: false,
        militaryOnly: false,
        faaCommercialAmel: false,
        priorFaa: true
      },
      rates: {
        aircraftWet: 195,
        instructor: 55
      },
      experience: {
        totalTime: 185,
        poweredTime: 185,
        airplaneTime: 172,
        aselTime: 172,
        amelTime: 0,
        helicopterTime: 0,
        picTotal: 92,
        picAirplane: 88,
        picAsel: 88,
        picHelicopter: 0,
        xcPicTotal: 42,
        xcPicAirplane: 36,
        instrumentTime: 28,
        instrumentAirplane: 22,
        cfiiAirplane: 0,
        nightTime: 14,
        dualAsel: 48,
        soloAsel: 54,
        commercialTrainingAsel: 8,
        soloPdpicAsel: 3,
        complexTaaTurbine: 4,
        prepRecent: 1,
        commercialTrainingAmel: 0,
        soloPdpicAmel: 0
      },
      events: {
        commercialDayXc: true,
        commercialComplexTaa: false,
        commercialInstrument: false,
        commercialLongXc: false,
        commercialNightTowered: false,
        commercialNightXc: false,
        commercialPrep: false
      }
    },
    {
      name: "Military-only B-52 style 61.73 gate",
      credentials: ["military-pilot"],
      targets: ["commercial-asel-add-class"],
      flags: {
        militaryExperience: true,
        militaryOnly: true,
        faaCommercialAmel: false,
        priorFaa: false
      },
      rates: {
        aircraftWet: 185,
        instructor: 45
      },
      experience: {
        totalTime: 1800,
        poweredTime: 1800,
        airplaneTime: 0,
        aselTime: 0,
        amelTime: 0,
        helicopterTime: 0,
        picTotal: 900,
        picAirplane: 0,
        picAsel: 0,
        picHelicopter: 0,
        xcPicTotal: 500,
        xcPicAirplane: 0,
        instrumentTime: 350,
        instrumentAirplane: 0,
        cfiiAirplane: 0,
        nightTime: 220,
        dualAsel: 0,
        soloAsel: 0,
        commercialTrainingAsel: 0,
        soloPdpicAsel: 0,
        complexTaaTurbine: 0,
        prepRecent: 0,
        commercialTrainingAmel: 0,
        soloPdpicAmel: 0
      },
      events: {}
    }
  ];

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
    "recreational-asel": [
      ["61.99(a)", "30 hours total flight time", 30, "totalTime", "parent", "Recreational ASEL broad parent."],
      ["61.99(a)(1)", "15 hours dual ASEL", 15, "dualAsel", "parent", "Must be ASEL dual per 61.98(b)."],
      ["61.99(a)(2)", "3 hours solo ASEL", 3, "soloAsel", "parent", "Must be ASEL solo."],
      ["61.99(a)(1)", "2 hours dual en route to an airport over 25 NM", 2, null, "event", "Fits inside 15 dual if flown."],
      ["61.99(a)(1)", "3 hours prep in preceding 2 calendar months", 3, null, "event", "Fits inside 15 dual."],
      ["61.99(a)(2)", "3 solo takeoffs and landings at a towered airport", null, null, "event", "Fits inside 3 solo if flown."]
    ],
    "sport-cfi": [
      ["61.411(a)", "150 hours total flight time as pilot", 150, "totalTime", "parent", "Sport CFI broad parent."],
      ["61.411(a)(1)", "50 hours single-engine land airplane", 50, "aselTime", "parent", "Category/class specific."],
      ["61.411(a)(2)", "25 hours cross-country", 25, "xcPicTotal", "parent", "Cross-country time."],
      ["61.411(a)(3)", "10 hours PIC in single-engine land airplane", 10, "picAsel", "parent", "PIC in the SEL light-sport category/class."]
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
    ],
    "commercial-amel": [
      ["61.129(b)", "250 hours total flight time as pilot", 250, "totalTime", "parent", "Broad parent row."],
      ["61.129(b)(1)", "100 hours powered aircraft", 100, "poweredTime", "parent", "Broad powered time if valid."],
      ["61.129(b)(1)", "50 hours airplanes", 50, "airplaneTime", "parent", "Airplane-specific."],
      ["61.129(b)(2)", "100 hours PIC", 100, "picTotal", "parent", "Broad PIC if valid."],
      ["61.129(b)(2)(i)", "50 hours PIC in airplanes", 50, "picAirplane", "parent", "Airplane-specific."],
      ["61.129(b)(2)(ii)", "50 hours PIC XC", 50, "xcPicTotal", "parent", "Broad XC PIC if valid."],
      ["61.129(b)(2)(ii)", "10 hours PIC XC in airplanes", 10, "xcPicAirplane", "parent", "Airplane-specific."],
      ["61.129(b)(3)", "20 hours commercial training in a multiengine airplane", 20, "commercialTrainingAmel", "parent", "Commercial training parent row (multiengine)."],
      ["61.129(b)(3)(i)", "10 hours instrument training incl 5 in a multiengine airplane", 10, null, "event", "Can fit inside 20 training."],
      ["61.129(b)(3)(ii)", "10 hours multiengine complex/TAA/turbine airplane", 10, "complexTaaTurbine", "event", "Must be a multiengine airplane. Can fit inside 20 training."],
      ["61.129(b)(3)(iii)", "2-hour day XC over 100 NM in a multiengine airplane", 2, null, "event", "Can fit inside 20 training."],
      ["61.129(b)(3)(iv)", "2-hour night XC over 100 NM in a multiengine airplane", 2, null, "event", "Can fit inside 20 training."],
      ["61.129(b)(3)(v)", "3 hours prep in a multiengine airplane in preceding 2 calendar months", 3, null, "event", "Can fit inside 20 training."],
      ["61.129(b)(4)", "10 hours solo/PDPIC in a multiengine airplane", 10, "soloPdpicAmel", "parent", "Solo or performing duties of PIC in a multiengine airplane."],
      ["61.129(b)(4)(i)", "300 NM XC, 3 points, one point 250 NM from departure", null, null, "event", "Can fit inside 10 solo/PDPIC."],
      ["61.129(b)(4)(ii)", "5 night VFR hours plus 10 towered takeoffs/landings", 5, null, "event", "Can fit inside 10 solo/PDPIC."]
    ]
  };

  const PROFICIENCY_DEFAULTS = {
    "private-asel-add-class": 5,
    "private-amel-add-class": 10,
    "private-ases-add-class": 5,
    "commercial-asel-add-class": 5,
    "commercial-amel-add-class": 10,
    "commercial-ases-add-class": 5,
    "sport-add-category-class": 5
  };

  function isProficiencyTarget(id) {
    return id in PROFICIENCY_DEFAULTS;
  }

  return {
    REVIEW_DATE,
    DEFAULT_RATES,
    LINKS,
    CATEGORY_CLASS,
    LEVEL_ORDER,
    CREDENTIAL_OPTIONS,
    TARGET_OPTIONS,
    FIELD_GROUPS,
    EVENT_GROUPS,
    EVENT_OPTIONS,
    ENDORSEMENTS,
    SAMPLE_SCENARIOS,
    REQUIREMENTS,
    PROFICIENCY_DEFAULTS,
    isProficiencyTarget
  };
});
