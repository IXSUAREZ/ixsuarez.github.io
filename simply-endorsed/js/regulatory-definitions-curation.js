(function (root, factory) {
  "use strict";
  const data = factory();
  if (typeof module === "object" && module.exports) module.exports = data;
  root.RegulatoryDefinitionsCuration = data;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const topics = [
    { id: "all", label: "All topics" },
    { id: "time-logging", label: "Time & logging" },
    { id: "instruction", label: "Instruction" },
    { id: "aircraft", label: "Aircraft & devices" },
    { id: "testing", label: "Testing" },
    { id: "operations", label: "Operations" }
  ];

  const terms = {
    "aeronautical-experience": {
      aliases: ["experience requirements", "aeronautical requirements"],
      keywords: ["certificate", "rating", "flight review", "recency"],
      topics: ["time-logging"],
      explanation: "A purpose-specific subset of pilot time used to satisfy Part 61 experience, review, or recency requirements."
    },
    "authorized-instructor": {
      aliases: ["who can instruct", "authorized CFI", "ground instructor"],
      keywords: ["CFI", "GI", "privileges", "limitations", "61.197", "61.217"],
      topics: ["instruction"],
      explanation: "The authorization depends on the certificate or Administrator authority, current compliance, and the scope of the privileges being exercised."
    },
    "aviation-training-device": {
      aliases: ["ATD", "AATD", "BATD"],
      keywords: ["simulator", "training device", "approved"],
      topics: ["aircraft", "instruction"],
      explanation: "An FAA-evaluated training device that is not itself a full flight simulator or flight training device."
    },
    "complex-airplane": {
      aliases: ["complex aircraft", "retractable gear airplane", "complex endorsement"],
      keywords: ["retractable landing gear", "flaps", "controllable pitch propeller", "FADEC", "seaplane", "61.31(e)", "one-time endorsement"],
      topics: ["aircraft"],
      explanation: "Complex status is equipment-defined. A technically advanced airplane is a separate concept and is not automatically complex."
    },
    "cross-country-time": {
      aliases: ["XC", "XC time", "cross country", "50 NM", "25 NM", "15 NM"],
      keywords: ["landing", "straight-line distance", "private", "commercial", "instrument", "sport", "rotorcraft", "ATP", "military"],
      topics: ["time-logging", "operations"],
      explanation: "The applicable branch depends on why the time is being counted and on certificate/category context; one distance rule does not govern every use."
    },
    "flight-training": {
      aliases: ["dual received", "flight instruction"],
      keywords: ["aircraft", "authorized instructor", "in flight"],
      topics: ["instruction", "time-logging"],
      explanation: "Part 61 flight training is received from an authorized instructor in flight in an aircraft."
    },
    "ground-training": {
      aliases: ["ground instruction", "ground school"],
      keywords: ["authorized instructor"],
      topics: ["instruction"],
      explanation: "Ground training is instruction received from an authorized instructor that is not flight training."
    },
    "instrument-training": {
      aliases: ["instrument instruction", "CFII time"],
      keywords: ["actual instrument", "simulated instrument", "authorized instructor"],
      topics: ["instruction", "time-logging"],
      explanation: "Instrument training requires receipt of training from an authorized instructor under actual or simulated instrument conditions."
    },
    "night-vision-goggle-operation": {
      aliases: ["NVG operation", "NVGO"],
      keywords: ["one hour after sunset", "one hour before sunrise", "surface reference"],
      topics: ["operations"],
      explanation: "The NVG-operation window in §61.1 is not the same period as the general §1.1 definition of night."
    },
    passenger: {
      aliases: ["who is a passenger"],
      keywords: ["crewmember", "FAA personnel", "training", "checking", "testing"],
      topics: ["operations"],
      explanation: "The definition excludes specified occupants, including a person receiving or providing authorized training, checking, or testing."
    },
    "pilot-time": {
      aliases: ["loggable pilot time", "pilot hours"],
      keywords: ["required crewmember", "training received", "training given", "SIC PDPIC"],
      topics: ["time-logging"],
      explanation: "Pilot time is the umbrella defined in §61.1; a specific logging rule still controls whether and how an entry may be recorded."
    },
    "practical-test": {
      aliases: ["checkride", "oral and flight test"],
      keywords: ["areas of operation", "maneuvers", "simulator", "flight training device"],
      topics: ["testing"],
      explanation: "The regulatory definition includes questions and demonstration of maneuvers in an authorized test environment."
    },
    "technically-advanced-airplane-taa": {
      aliases: ["TAA", "technically advanced aircraft", "glass cockpit airplane", "commercial TAA"],
      keywords: ["electronically advanced avionics system", "61.129(j)", "PFD", "MFD", "moving map", "two-axis autopilot", "continuously visible"],
      topics: ["aircraft"],
      explanation: "TAA is defined by electronically advanced avionics and is distinct from the equipment test for a complex airplane."
    },
    "training-time": {
      aliases: ["instruction time", "training hours"],
      keywords: ["flight", "ground", "simulator", "training device", "authorized instructor"],
      topics: ["instruction", "time-logging"],
      explanation: "Training time includes authorized instruction in flight, on the ground, or in a qualifying simulator or flight training device."
    },
    aircraft: {
      aliases: ["what is an aircraft"],
      keywords: ["device", "flight in the air"],
      topics: ["aircraft"],
      explanation: "The chapter-wide definition is intentionally broad and turns on use or intended use for flight in the air."
    },
    category: {
      aliases: ["aircraft category", "airman category", "airplane rotorcraft glider"],
      keywords: ["certification", "ratings", "privileges", "limitations"],
      topics: ["aircraft"],
      explanation: "For airman certification, category is the broad level such as airplane or rotorcraft; the same word has a different aircraft-certification meaning."
    },
    class: {
      aliases: ["aircraft class", "airman class", "single engine land", "ASEL", "AMEL"],
      keywords: ["category", "operating characteristics", "land", "water", "helicopter"],
      topics: ["aircraft"],
      explanation: "For airman certification, class sits within a category, such as single-engine land within airplane."
    },
    crewmember: {
      aliases: ["crew member"],
      keywords: ["assigned duty", "flight time"],
      topics: ["operations", "time-logging"],
      explanation: "Crewmember status depends on assignment to duty in the aircraft during flight time."
    },
    "flight-time": {
      aliases: ["block time", "aircraft time", "hobbs time"],
      keywords: ["moves under own power", "purpose of flight", "comes to rest", "glider"],
      topics: ["time-logging"],
      explanation: "The chapter-wide start/stop definition is not simply a meter reading; the aircraft movement must be for the purpose of flight."
    },
    "flight-training-device-ftd": {
      aliases: ["FTD", "flight training device", "training device"],
      keywords: ["part 60", "QPS", "cockpit replica"],
      topics: ["aircraft", "instruction"],
      explanation: "An FTD is a qualified aircraft cockpit or flight-deck replica governed by Part 60 and its qualification standard."
    },
    "full-flight-simulator-ffs": {
      aliases: ["flight simulator", "FFS", "full flight simulator", "simulator"],
      keywords: ["motion", "visual system", "part 60", "QPS"],
      topics: ["aircraft", "instruction"],
      explanation: "A full flight simulator is the Part 60 device with a cockpit replica, outside visual system, and qualifying motion cues."
    },
    night: {
      aliases: ["FAA night", "civil twilight", "night time"],
      keywords: ["evening civil twilight", "morning civil twilight", "Air Almanac"],
      topics: ["operations", "time-logging"],
      explanation: "This definition governs the term night, but separate rules can use different sunset/sunrise windows for specific privileges or equipment."
    },
    "pilot-in-command": {
      aliases: ["PIC", "acting PIC", "pilot in command"],
      keywords: ["final authority", "responsibility", "designated", "category", "class", "type rating"],
      topics: ["operations", "time-logging"],
      explanation: "This §1.1 definition identifies the person acting as PIC. Logging PIC time is governed separately by §61.51."
    },
    "second-in-command": {
      aliases: ["SIC", "copilot", "second in command"],
      keywords: ["designated", "flight time"],
      topics: ["operations", "time-logging"],
      explanation: "Designation as SIC is distinct from whether SIC is required and whether the time may be logged under a specific rule."
    }
  };

  const decisions = [
    {
      id: "time-relationships",
      title: "Flight time, pilot time, and training time",
      summary: "Start with the defined bucket, then apply the specific logging and credit rule for the purpose at hand.",
      definitionIds: ["flight-time", "pilot-time", "training-time", "flight-training", "ground-training"],
      branches: [
        { when: "Aircraft movement", operator: "for the purpose of flight", conclusion: "Use the §1.1 flight-time start/stop definition; a meter alone does not decide the entry." },
        { when: "Pilot role or instruction", operator: "serves / receives / gives", conclusion: "Test the §61.1 pilot-time branches, then the applicable §61.51 logging rule." },
        { when: "Training credit", operator: "received from an authorized instructor", conclusion: "Identify flight, ground, simulator, or FTD training and verify the rule permits that device and credit." }
      ],
      sources: ["14 CFR §§ 1.1, 61.1, 61.51"]
    },
    {
      id: "acting-vs-logging-pic",
      title: "Acting as PIC versus logging PIC",
      summary: "The person with final authority under §1.1 and the person permitted to log PIC under §61.51 are related questions, not interchangeable labels.",
      definitionIds: ["pilot-in-command", "pilot-time", "category", "class"],
      branches: [
        { when: "Who is acting as PIC?", operator: "final authority and responsibility / designated / holds the appropriate ratings", conclusion: "Apply the three-part §1.1 definition to identify the acting PIC." },
        { when: "Who may log PIC?", operator: "only for that flight time during which", conclusion: "Apply the applicable §61.51(e) path; do not infer logging authority solely from who acted as PIC." },
        { when: "Training flight", operator: "receives training / gives training", conclusion: "Student and instructor entries may arise from different logging provisions even though only one person acts as PIC." }
      ],
      sources: ["14 CFR §§ 1.1, 61.1, 61.51(e)"]
    },
    {
      id: "cross-country-purpose",
      title: "Cross-country purpose, category, and distance",
      summary: "Choose the purpose branch before applying a distance threshold. The general landing-away definition and aeronautical-experience branches are not interchangeable.",
      definitionIds: ["cross-country-time", "aeronautical-experience", "category", "class"],
      branches: [
        { when: "General cross-country time", operator: "Except as provided in paragraphs (ii) through (vii)", conclusion: "Use §61.1(b) cross-country paragraph (i): certificate, aircraft, landing away, and navigation elements." },
        { when: "Private/commercial/instrument aeronautical experience, non-rotorcraft", operator: "includes a point of landing that was at least a straight-line distance of more than 50 nautical miles from the original point of departure", conclusion: "Use paragraph (ii), including an appropriate aircraft and a landing beyond the stated straight-line distance." },
        { when: "Sport pilot, except powered parachute", operator: "Includes a point of landing at least a straight line distance of more than 25 nautical miles from the original point of departure", conclusion: "Use paragraph (iii) and preserve the rule's full threshold wording when briefing or auditing." },
        { when: "Powered parachute path", operator: "Includes a point of landing at least a straight line distance of more than 15 nautical miles from the original point of departure", conclusion: "Use paragraph (iv) for the specified sport/private powered-parachute purposes." },
        { when: "Rotorcraft or instrument-helicopter path", operator: "includes a point of landing that was at least a straight-line distance of more than 25 nautical miles from the original point of departure", conclusion: "Use paragraph (v), including the appropriate-aircraft and landing requirements." },
        { when: "ATP or qualifying military path", operator: "is at least a straight-line distance of more than 50 nautical miles from the original point of departure", conclusion: "Use paragraph (vi) or (vii); these branches do not require a landing in their text." }
      ],
      sources: ["14 CFR § 61.1(b), definition of Cross-country time"]
    },
    {
      id: "instrument-time-vs-training",
      title: "Instrument time versus instrument training",
      summary: "Instrument conditions describe the operation; instrument training additionally requires instruction from an authorized instructor.",
      definitionIds: ["instrument-training", "authorized-instructor", "training-time"],
      branches: [
        { when: "Actual or simulated instrument conditions", operator: "under actual or simulated instrument conditions", conclusion: "Evaluate the applicable §61.51 instrument-time logging provision." },
        { when: "Instrument training credit", operator: "received from an authorized instructor", conclusion: "Verify instructor authority, training context, and the certificate/rating rule that permits the credit." }
      ],
      sources: ["14 CFR §§ 61.1, 61.51(g), and the applicable aeronautical-experience section"]
    },
    {
      id: "authorized-instructor-scope",
      title: "Authorized-instructor scope",
      summary: "Holding an instructor credential is only one element; the person must be compliant and acting within that credential or other FAA authority.",
      definitionIds: ["authorized-instructor", "flight-training", "ground-training", "instrument-training"],
      branches: [
        { when: "Ground instructor", operator: "in compliance with § 61.217 / in accordance with the privileges and limitations", conclusion: "Confirm recent-experience compliance and the ground-instructor certificate's permitted scope." },
        { when: "Flight instructor", operator: "in compliance with § 61.197 / in accordance with the privileges and limitations", conclusion: "Confirm recent-experience status plus certificate category, class, instrument, and any rule-specific limitations." },
        { when: "Other Administrator authority", operator: "under part 61, 121, 135, or 142 / in accordance with that authority", conclusion: "Review the particular authorization; do not treat it as unrestricted Part 61 CFI authority." }
      ],
      sources: ["14 CFR § 61.1(b), definition of Authorized instructor"]
    },
    {
      id: "complex-vs-taa",
      title: "Complex airplane versus TAA",
      summary: "These are separate equipment definitions. An airplane can satisfy one, both, or neither definition.",
      definitionIds: ["complex-airplane", "technically-advanced-airplane-taa"],
      branches: [
        { when: "Complex airplane", operator: "retractable landing gear, flaps, and a controllable pitch propeller", conclusion: "Apply every listed equipment element and the seaplane alternative exactly as written. For acting as PIC, separately apply §61.31(e)'s training and one-time logbook-endorsement rule, including its exceptions." },
        { when: "Technically advanced airplane", operator: "equipped with an electronically advanced avionics system", conclusion: "For commercial airplane single-engine credit, separately confirm §61.129(a)(3)(ii) and §61.129(j): an installed electronic PFD, an electronic MFD with a GPS moving map and aircraft position, and a two-axis autopilot integrated with navigation and heading guidance. The required PFD and MFD display elements must be continuously visible." }
      ],
      sources: ["14 CFR §§ 61.1(b), 61.31(e), 61.129(a)(3)(ii), and 61.129(j)"]
    }
  ];

  return {
    editorialLabel: "Instructor planning explanation — not CFR text",
    conclusionLabel: "Instructor planning conclusion — not CFR text",
    topics,
    terms,
    decisions
  };
});
