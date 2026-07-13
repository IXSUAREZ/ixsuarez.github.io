(function (root, factory) {
  "use strict";
  const data = factory();
  if (typeof module === "object" && module.exports) module.exports = data;
  root.RegulatoryDefinitionsData = data;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const meta = {
    version: "2026-07-10.1",
    currentThrough: "2026-07-10",
    retrievedAt: "2026-07-13",
    reviewedAt: "2026-07-13",
    disclosure: "The eCFR is authoritative but unofficial. This reference is a reviewed snapshot and is not represented as current after July 10, 2026.",
    title14: {
      latestAmendedOn: "2026-07-06",
      latestIssueDate: "2026-07-07",
      upToDateAsOf: "2026-07-10"
    },
    sources: {
      part61: {
        section: "14 CFR § 61.1",
        currentUrl: "https://www.ecfr.gov/current/title-14/part-61/section-61.1",
        datedUrl: "https://www.ecfr.gov/on/2026-07-10/title-14/part-61/section-61.1",
        apiUrl: "https://www.ecfr.gov/api/versioner/v1/full/2026-07-10/title-14.xml?part=61&section=61.1",
        sha256: "d86193cf6b6e631ba3b40ecc208887a57d148c76b8d7dc2e6bb26509b12e2f62"
      },
      part1: {
        section: "14 CFR § 1.1",
        currentUrl: "https://www.ecfr.gov/current/title-14/part-1/section-1.1",
        datedUrl: "https://www.ecfr.gov/on/2026-07-10/title-14/part-1/section-1.1",
        apiUrl: "https://www.ecfr.gov/api/versioner/v1/full/2026-07-10/title-14.xml?part=1&section=1.1",
        sha256: "d7ebd7540215ee3873e0f18c44625ef413d67c567cc40f44299f37f14758472b"
      }
    }
  };

  const applicability = {
    id: "part-61-applicability",
    sourcePart: "61.1",
    citation: "14 CFR § 61.1(a)",
    officialText: "(a) Except as provided in parts 107 and 194 of this chapter, this part prescribes:\n(1) The requirements for issuing pilot, flight instructor, and ground instructor certificates and ratings; the conditions under which those certificates and ratings are necessary; and the privileges and limitations of those certificates and ratings.\n(2) The requirements for issuing pilot, flight instructor, and ground instructor authorizations; the conditions under which those authorizations are necessary; and the privileges and limitations of those authorizations.\n(3) The requirements for issuing pilot, flight instructor, and ground instructor certificates and ratings for persons who have taken courses approved by the Administrator under other parts of this chapter."
  };

  const part61Definitions = [
    ["accredited", "Accredited", "Accredited has the same meaning as defined by the Department of Education in 34 CFR 600.2."],
    ["aeronautical-experience", "Aeronautical experience", "Aeronautical experience means pilot time obtained in an aircraft, flight simulator, or flight training device for meeting the appropriate training and flight time requirements for an airman certificate, rating, flight review, or recency of flight experience requirements of this part."],
    ["authorized-instructor", "Authorized instructor", "Authorized instructor means—\n(i) A person who holds a ground instructor certificate issued under part 61 of this chapter and is in compliance with § 61.217, when conducting ground training in accordance with the privileges and limitations of his or her ground instructor certificate;\n(ii) A person who holds a flight instructor certificate issued under part 61 of this chapter and is in compliance with § 61.197, when conducting ground training or flight training in accordance with the privileges and limitations of his or her flight instructor certificate; or\n(iii) A person authorized by the Administrator to provide ground training or flight training under part 61, 121, 135, or 142 of this chapter when conducting ground training or flight training in accordance with that authority."],
    ["aviation-training-device", "Aviation training device", "Aviation training device means a training device, other than a full flight simulator or flight training device, that has been evaluated, qualified, and approved by the Administrator."],
    ["complex-airplane", "Complex airplane", "Complex airplane means an airplane that has a retractable landing gear, flaps, and a controllable pitch propeller, including airplanes equipped with an engine control system consisting of a digital computer and associated accessories for controlling the engine and propeller, such as a full authority digital engine control; or, in the case of a seaplane, flaps and a controllable pitch propeller, including seaplanes equipped with an engine control system consisting of a digital computer and associated accessories for controlling the engine and propeller, such as a full authority digital engine control."],
    ["cross-country-time", "Cross-country time", "Cross-country time means—\n(i) Except as provided in paragraphs (ii) through (vii) of this definition, time acquired during flight—\n(A) Conducted by a person who holds a pilot certificate;\n(B) Conducted in an aircraft;\n(C) That includes a landing at a point other than the point of departure; and\n(D) That involves the use of dead reckoning, pilotage, electronic navigation aids, radio aids, or other navigation systems to navigate to the landing point.\n(ii) For the purpose of meeting the aeronautical experience requirements (except for a rotorcraft category rating), for a private pilot certificate (except for a powered parachute category rating), a commercial pilot certificate, or an instrument rating, or for the purpose of exercising recreational pilot privileges (except in a rotorcraft) under § 61.101 (c), time acquired during a flight—\n(A) Conducted in an appropriate aircraft;\n(B) That includes a point of landing that was at least a straight-line distance of more than 50 nautical miles from the original point of departure; and\n(C) That involves the use of dead reckoning, pilotage, electronic navigation aids, radio aids, or other navigation systems to navigate to the landing point.\n(iii) For the purpose of meeting the aeronautical experience requirements for a sport pilot certificate (except for powered parachute privileges), time acquired during a flight conducted in an appropriate aircraft that—\n(A) Includes a point of landing at least a straight line distance of more than 25 nautical miles from the original point of departure; and\n(B) Involves, as applicable, the use of dead reckoning; pilotage; electronic navigation aids; radio aids; or other navigation systems to navigate to the landing point.\n(iv) For the purpose of meeting the aeronautical experience requirements for a sport pilot certificate with powered parachute privileges or a private pilot certificate with a powered parachute category rating, time acquired during a flight conducted in an appropriate aircraft that—\n(A) Includes a point of landing at least a straight line distance of more than 15 nautical miles from the original point of departure; and\n(B) Involves, as applicable, the use of dead reckoning; pilotage; electronic navigation aids; radio aids; or other navigation systems to navigate to the landing point.\n(v) For the purpose of meeting the aeronautical experience requirements for any pilot certificate with a rotorcraft category rating or an instrument-helicopter rating, or for the purpose of exercising recreational pilot privileges, in a rotorcraft, under § 61.101(c), time acquired during a flight—\n(A) Conducted in an appropriate aircraft;\n(B) That includes a point of landing that was at least a straight-line distance of more than 25 nautical miles from the original point of departure; and\n(C) That involves the use of dead reckoning, pilotage, electronic navigation aids, radio aids, or other navigation systems to navigate to the landing point.\n(vi) For the purpose of meeting the aeronautical experience requirements for an airline transport pilot certificate (except with a rotorcraft category rating), time acquired during a flight—\n(A) Conducted in an appropriate aircraft;\n(B) That is at least a straight-line distance of more than 50 nautical miles from the original point of departure; and\n(C) That involves the use of dead reckoning, pilotage, electronic navigation aids, radio aids, or other navigation systems.\n(vii) For a military pilot who qualifies for a commercial pilot certificate (except with a rotorcraft category rating) under § 61.73 of this part, time acquired during a flight—\n(A) Conducted in an appropriate aircraft;\n(B) That is at least a straight-line distance of more than 50 nautical miles from the original point of departure; and\n(C) That involves the use of dead reckoning, pilotage, electronic navigation aids, radio aids, or other navigation systems."],
    ["examiner", "Examiner", "Examiner means any person who is authorized by the Administrator to conduct a pilot proficiency test or a practical test for an airman certificate or rating issued under this part, or a person who is authorized to conduct a knowledge test under this part."],
    ["flight-training", "Flight training", "Flight training means that training, other than ground training, received from an authorized instructor in flight in an aircraft."],
    ["ground-training", "Ground training", "Ground training means that training, other than flight training, received from an authorized instructor."],
    ["institution-of-higher-education", "Institution of higher education", "Institution of higher education has the same meaning as defined by the Department of Education in 34 CFR 600.4."],
    ["instrument-approach", "Instrument approach", "Instrument approach means an approach procedure defined in part 97 of this chapter."],
    ["instrument-training", "Instrument training", "Instrument training means that time in which instrument training is received from an authorized instructor under actual or simulated instrument conditions."],
    ["knowledge-test", "Knowledge test", "Knowledge test means a test on the aeronautical knowledge areas required for an airman certificate or rating that can be administered in written form or by a computer."],
    ["nationally-recognized-accrediting-agency", "Nationally recognized accrediting agency", "Nationally recognized accrediting agency has the same meaning as defined by the Department of Education in 34 CFR 600.2."],
    ["night-vision-goggles", "Night vision goggles", "Night vision goggles means an appliance worn by a pilot that enhances the pilot's ability to maintain visual surface reference at night."],
    ["night-vision-goggle-operation", "Night vision goggle operation", "Night vision goggle operation means the portion of a flight that occurs during the time period from 1 hour after sunset to 1 hour before sunrise where the pilot maintains visual surface reference using night vision goggles in an aircraft that is approved for such an operation."],
    ["passenger", "Passenger", "Passenger means any person on board an aircraft other than a crewmember, FAA personnel, manufacturer personnel required for type certification, or a person receiving or providing flight training, checking, or testing as authorized by this part."],
    ["pilot-time", "Pilot time", "Pilot time means that time in which a person—\n(i) Serves as a required pilot flight crewmember;\n(ii) Receives training from an authorized instructor in an aircraft, full flight simulator, flight training device, or aviation training device;\n(iii) Gives training as an authorized instructor in an aircraft, full flight simulator, flight training device, or aviation training device; or\n(iv) Serves as second in command in operations conducted in accordance with § 135.99(c) of this chapter when a second pilot is not required under the type certification of the aircraft or the regulations under which the flight is being conducted, provided the requirements in § 61.159(c) are satisfied."],
    ["practical-test", "Practical test", "Practical test means a test on the areas of operations for an airman certificate, rating, or authorization that is conducted by having the applicant respond to questions and demonstrate maneuvers in flight, in a flight simulator, or in a flight training device."],
    ["set-of-aircraft", "Set of aircraft", "Set of aircraft means aircraft that share similar performance characteristics, such as similar airspeed and altitude operating envelopes, similar handling characteristics, and the same number and type of propulsion systems."],
    ["student-pilot-seeking-a-sport-pilot-certificate", "Student pilot seeking a sport pilot certificate", "Student pilot seeking a sport pilot certificate means a person who has received an endorsement—\n(i) To exercise student pilot privileges from a certificated flight instructor with a sport pilot rating; or\n(ii) That includes a limitation for the operation of an aircraft specified in § 61.89(c) issued by a certificated flight instructor with other than a sport pilot rating."],
    ["technically-advanced-airplane-taa", "Technically advanced airplane (TAA)", "Technically advanced airplane (TAA) means an airplane equipped with an electronically advanced avionics system."],
    ["training-time", "Training time", "Training time means training received—\n(i) In flight from an authorized instructor;\n(ii) On the ground from an authorized instructor; or\n(iii) In a flight simulator or flight training device from an authorized instructor."]
  ].map(function (entry, index) {
    return { id: entry[0], order: index + 1, term: entry[1], officialText: entry[2], citation: "14 CFR § 61.1", sourcePart: "61.1" };
  });

  const part1Definitions = [
    ["aircraft", "Aircraft", "Aircraft means a device that is used or intended to be used for flight in the air."],
    ["category", "Category", "Category:\n(1) As used with respect to the certification, ratings, privileges, and limitations of airmen, means a broad classification of aircraft. Examples include: airplane; rotorcraft; glider; and lighter-than-air; and\n(2) As used with respect to the certification of aircraft, means a grouping of aircraft based upon intended use or operating limitations. Examples include: transport, normal, utility, acrobatic, limited, restricted, and provisional."],
    ["class", "Class", "Class:\n(1) As used with respect to the certification, ratings, privileges, and limitations of airmen, means a classification of aircraft within a category having similar operating characteristics. Examples include: single engine; multiengine; land; water; gyroplane; helicopter; airship; and free balloon; and\n(2) As used with respect to the certification of aircraft, means a broad grouping of aircraft having similar characteristics of propulsion, flight, or landing. Examples include: airplane; rotorcraft; glider; balloon; landplane; and seaplane."],
    ["crewmember", "Crewmember", "Crewmember means a person assigned to perform duty in an aircraft during flight time."],
    ["flight-time", "Flight time", "Flight time means:\n(1) Pilot time that commences when an aircraft moves under its own power for the purpose of flight and ends when the aircraft comes to rest after landing; or\n(2) For a glider without self-launch capability, pilot time that commences when the glider is towed for the purpose of flight and ends when the glider comes to rest after landing."],
    ["flight-training-device-ftd", "Flight training device (FTD)", "Flight training device (FTD) means a replica of aircraft instruments, equipment, panels, and controls in an open flight deck area or an enclosed aircraft cockpit replica. It includes the equipment and computer programs necessary to represent aircraft (or set of aircraft) operations in ground and flight conditions having the full range of capabilities of the systems installed in the device as described in part 60 of this chapter and the qualification performance standard (QPS) for a specific FTD qualification level."],
    ["full-flight-simulator-ffs", "Full flight simulator (FFS)", "Full flight simulator (FFS) means a replica of a specific type; or make, model, and series aircraft cockpit. It includes the assemblage of equipment and computer programs necessary to represent aircraft operations in ground and flight conditions, a visual system providing an out-of-the-cockpit view, a system that provides cues at least equivalent to those of a three-degree-of-freedom motion system, and has the full range of capabilities of the systems installed in the device as described in part 60 of this chapter and the qualification performance standards (QPS) for a specific FFS qualification level."],
    ["night", "Night", "Night means the time between the end of evening civil twilight and the beginning of morning civil twilight, as published in the Air Almanac, converted to local time."],
    ["pilot-in-command", "Pilot in command", "Pilot in command means the person who:\n(1) Has final authority and responsibility for the operation and safety of the flight;\n(2) Has been designated as pilot in command before or during the flight; and\n(3) Holds the appropriate category, class, and type rating, if appropriate, for the conduct of the flight."],
    ["second-in-command", "Second in command", "Second in command means a pilot who is designated to be second in command of an aircraft during flight time."]
  ].map(function (entry, index) {
    return { id: entry[0], order: index + 1, term: entry[1], officialText: entry[2], citation: "14 CFR § 1.1", sourcePart: "1.1" };
  });

  return { meta, applicability, part61Definitions, part1Definitions, definitions: part61Definitions.concat(part1Definitions) };
});
