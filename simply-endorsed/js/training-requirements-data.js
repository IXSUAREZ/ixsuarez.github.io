(() => {
  "use strict";

  const SOURCE_REVIEW_DATE = "2026-07-06";
  const REVIEW_NOTE = "Verify the current eCFR text, ACS, aircraft category/class, and local DPE expectations before using this as a real signoff checklist.";

  const card = (data) => ({
    sourceReviewDate: SOURCE_REVIEW_DATE,
    reviewNote: REVIEW_NOTE,
    ...data
  });

  window.TRAINING_REQUIREMENT_CARDS = {
    sourceReviewDate: SOURCE_REVIEW_DATE,
    categoryCards: {
      "practical-test-prereqs": card({
        title: "Practical-test readiness requirements",
        summary: "These endorsements are not a training stage by themselves; they document that the applicant has met the applicable certificate/rating requirements and is ready for the practical test.",
        requirements: [
          {
            label: "Recent preparation",
            text: "The practical-test recommendation requires logged preparation within the required recent window before the application.",
            refs: ["14 CFR § 61.39(a)(6)(i) and (ii)", "AC 61-65K A.1"]
          },
          {
            label: "AKTR review",
            text: "If the applicant has knowledge-test deficiencies, the instructor must review those areas and endorse satisfactory knowledge.",
            refs: ["14 CFR § 61.39(a)(6)(iii)", "AC 61-65K A.2"]
          }
        ],
        relatedEndorsements: ["A.1", "A.2"]
      }),
      "student-pilot": card({
        title: "Student pilot and solo requirements",
        summary: "Student-pilot solo privileges are built from eligibility, documents, medical status when required, TSA verification when applicable, and the specific solo endorsements for the operation.",
        requirements: [
          {
            label: "Student pilot eligibility",
            text: "Confirm student pilot eligibility and certificate application before solo; dual training may begin before every solo prerequisite is complete.",
            refs: ["14 CFR § 61.83", "14 CFR § 61.85"]
          },
          {
            label: "Medical or qualifying status",
            text: "Most airplane students on the private/recreational path need the required medical qualification before solo.",
            refs: ["14 CFR § 61.3(c)", "14 CFR § 61.23"]
          },
          {
            label: "Solo training and authorization",
            text: "Pre-solo knowledge, flight training, and 90-day solo authority come from the applicable paragraphs of 14 CFR § 61.87.",
            refs: ["14 CFR § 61.87(b)", "14 CFR § 61.87(c)", "14 CFR § 61.87(n)", "14 CFR § 61.87(p)"]
          },
          {
            label: "Expanded student operations",
            text: "Nearby-airport, solo cross-country, and Class B operations require separate training and endorsement paths.",
            refs: ["14 CFR § 61.93", "14 CFR § 61.95"]
          },
          {
            label: "TSA verification",
            text: "Flight training providers must handle citizenship or eligibility verification when applicable.",
            refs: ["49 CFR § 1552.15(c)", "AC 61-65K A.14"]
          }
        ],
        relatedEndorsements: ["A.3", "A.4", "A.6", "A.9", "A.10", "A.14"]
      }),
      "sport-pilot": card({
        title: "Sport pilot requirement snapshot",
        summary: "Sport pilot requirements depend on category/class and privilege sought. For ASEL, the app tracks the common minimum-hour structure already used by the calculator.",
        requirements: [
          {
            label: "Knowledge and proficiency",
            text: "Sport applicants need the applicable knowledge, proficiency, and practical-test preparation for the aircraft category/class sought.",
            refs: ["14 CFR § 61.309", "14 CFR § 61.311"]
          },
          {
            label: "ASEL hour minimums",
            text: "For sport pilot ASEL, plan around 20 hours total, including 15 hours dual ASEL and 5 hours solo ASEL, plus required cross-country, landing, and recent-prep events.",
            refs: ["14 CFR § 61.313"]
          },
          {
            label: "Added privileges",
            text: "Towered airspace, faster light-sport aircraft, night, retractable gear, and controllable-pitch propeller privileges have separate rule paths.",
            refs: ["14 CFR § 61.325", "14 CFR § 61.327", "14 CFR § 61.329", "14 CFR § 61.331"]
          }
        ],
        relatedEndorsements: ["A.17", "A.20", "A.21", "A.22", "A.23", "A.24", "A.25"]
      }),
      "recreational-pilot": card({
        title: "Recreational pilot requirement snapshot",
        summary: "Recreational pilot endorsements mostly support operating-limit relief, practical-test readiness, and supervised solo for additional ratings.",
        requirements: [
          {
            label: "Eligibility and knowledge",
            text: "Recreational applicants need the applicable eligibility, knowledge, and aeronautical experience requirements before practical-test endorsement.",
            refs: ["14 CFR § 61.96", "14 CFR § 61.97", "14 CFR § 61.98", "14 CFR § 61.99"]
          },
          {
            label: "Operating limitations",
            text: "The common recreational-pilot endorsements here remove or adjust specific operating limits such as distance, airspace, and recent PIC conditions.",
            refs: ["14 CFR § 61.101"]
          }
        ],
        relatedEndorsements: ["A.29", "A.30", "A.31", "A.32", "A.35"]
      }),
      "private-pilot": card({
        title: "Private pilot requirement snapshot",
        summary: "Private pilot endorsement bundles prove the applicant met the certificate eligibility, knowledge, flight proficiency, and aeronautical experience rules for the rating sought.",
        requirements: [
          {
            label: "Eligibility and knowledge",
            text: "Confirm age, language, knowledge areas, and test preparation for the applicable private pilot rating.",
            refs: ["14 CFR § 61.103", "14 CFR § 61.105"]
          },
          {
            label: "Flight proficiency",
            text: "The applicant must receive and log training on the applicable areas of operation for the category/class rating sought.",
            refs: ["14 CFR § 61.107"]
          },
          {
            label: "ASEL experience minimums",
            text: "For private pilot ASEL, plan around 40 hours total, including 20 hours dual single-engine airplane and 10 hours solo single-engine airplane, plus the required XC, night, instrument, recent-prep, and towered-airport events.",
            refs: ["14 CFR § 61.109(a)"]
          }
        ],
        relatedEndorsements: ["A.36", "A.37", "A.1", "A.2"]
      }),
      "commercial-pilot": card({
        title: "Commercial pilot requirement snapshot",
        summary: "Commercial pilot endorsements document that the applicant meets the commercial eligibility, knowledge, proficiency, and aeronautical-experience rules for the rating sought.",
        requirements: [
          {
            label: "Eligibility and knowledge",
            text: "Confirm age, language, knowledge areas, and applicable commercial knowledge-test readiness.",
            refs: ["14 CFR § 61.123", "14 CFR § 61.125"]
          },
          {
            label: "Flight proficiency",
            text: "Commercial applicants must receive and log training on the applicable areas of operation for the aircraft category/class.",
            refs: ["14 CFR § 61.127"]
          },
          {
            label: "ASEL experience minimums",
            text: "For commercial pilot ASEL, plan around 250 hours total, 100 powered, 50 airplane, 100 PIC, 50 PIC XC, 20 commercial training, and 10 solo/PDPIC ASEL, plus the required instrument, complex/TAA/turbine, XC, night, and recent-prep events.",
            refs: ["14 CFR § 61.129(a)"]
          }
        ],
        relatedEndorsements: ["A.38", "A.39", "A.1", "A.2"]
      }),
      "atp": card({
        title: "ATP and restricted ATP snapshot",
        summary: "ATP endorsements in AC 61-65K support ATP CTP completion and restricted ATP paths; the underlying qualification analysis depends heavily on category, class, age, total time, and training history.",
        requirements: [
          {
            label: "ATP eligibility",
            text: "Review the ATP eligibility, knowledge, and aeronautical experience rules before treating ATP endorsement text as sufficient.",
            refs: ["14 CFR § 61.153", "14 CFR § 61.159"]
          },
          {
            label: "ATP CTP",
            text: "ATP CTP completion is a prerequisite for certain ATP airplane multiengine knowledge-test paths.",
            refs: ["14 CFR § 61.156"]
          },
          {
            label: "Restricted ATP",
            text: "Restricted ATP eligibility depends on the qualifying pathway and must be checked against the specific paragraph.",
            refs: ["14 CFR § 61.160"]
          }
        ],
        relatedEndorsements: ["A.40", "A.41"]
      }),
      "instrument-rating": card({
        title: "Instrument rating requirement snapshot",
        summary: "Instrument rating endorsements pair the knowledge-test path with the practical-test readiness path and the aeronautical experience required by 14 CFR § 61.65.",
        requirements: [
          {
            label: "Eligibility and knowledge",
            text: "Confirm the instrument rating eligibility, knowledge areas, and knowledge-test readiness before the checkride bundle.",
            refs: ["14 CFR § 61.65(a)", "14 CFR § 61.65(b)"]
          },
          {
            label: "Airplane experience minimums",
            text: "For instrument airplane, plan around 50 hours XC PIC, including 10 in airplanes, and 40 hours actual/simulated instrument, including 15 hours with an authorized instructor for the instrument-airplane rating.",
            refs: ["14 CFR § 61.65(d)"]
          },
          {
            label: "IFR XC and recent prep",
            text: "The airplane path includes recent instrument training and the required IFR cross-country with approaches and navigation-system tasks.",
            refs: ["14 CFR § 61.65(d)(2)(i)", "14 CFR § 61.65(d)(2)(ii)"]
          }
        ],
        relatedEndorsements: ["A.42", "A.43", "A.44", "A.1", "A.2"]
      }),
      "flight-instructor": card({
        title: "Flight instructor requirement snapshot",
        summary: "Flight instructor endorsements support FOI, instructor knowledge, practical-test readiness, spin training, and category/class-specific instructor privileges.",
        requirements: [
          {
            label: "Eligibility and knowledge",
            text: "Confirm flight instructor eligibility, fundamentals of instruction, aeronautical knowledge, and applicable knowledge-test paths.",
            refs: ["14 CFR § 61.183", "14 CFR § 61.185"]
          },
          {
            label: "Instructor proficiency",
            text: "Instructor applicants must receive and log training on the applicable instructor areas of operation and demonstrate instructional proficiency.",
            refs: ["14 CFR § 61.187"]
          },
          {
            label: "Instructor limitations",
            text: "Review CFI limitations before training initial instructor applicants or endorsing specialized operations.",
            refs: ["14 CFR § 61.195"]
          }
        ],
        relatedEndorsements: ["A.45", "A.46", "A.47", "A.48", "A.49"]
      }),
      "sport-pilot-instructor": card({
        title: "Sport pilot instructor requirement snapshot",
        summary: "Sport pilot instructor endorsements cover FOI, aeronautical knowledge, proficiency checks, practical-test readiness, and privilege-specific instructor training.",
        requirements: [
          {
            label: "Tests and knowledge",
            text: "Confirm the applicable sport pilot instructor tests, knowledge areas, and endorsement path.",
            refs: ["14 CFR § 61.405", "14 CFR § 61.407"]
          },
          {
            label: "Proficiency and experience",
            text: "Sport pilot instructor applicants must meet the applicable proficiency and aeronautical-experience rules for the privileges sought.",
            refs: ["14 CFR § 61.409", "14 CFR § 61.411", "14 CFR § 61.419"]
          },
          {
            label: "Instrument-reference training",
            text: "Certain sport pilot instructor privileges involving instrument-reference instruction require the specific training rule.",
            refs: ["14 CFR § 61.412"]
          }
        ],
        relatedEndorsements: ["A.51", "A.52", "A.53", "A.54", "A.57"]
      }),
      "additional-recurrent": card({
        title: "Additional, recurrent, and add-on requirement snapshot",
        summary: "This category mixes recurrent checks, aircraft endorsements, additional ratings, retests, glider/tow operations, and other special cases. Read the specific endorsement card and the underlying rule together.",
        requirements: [
          {
            label: "Recurrent proficiency",
            text: "Flight reviews and instrument proficiency checks are recurrent-proficiency events, not certificate checkrides.",
            refs: ["14 CFR § 61.56", "14 CFR § 61.57(d)"]
          },
          {
            label: "Aircraft endorsements",
            text: "Complex, high-performance, high-altitude, tailwheel, and solo-without-category/class privileges each have their own aircraft-specific rule path.",
            refs: ["14 CFR § 61.31"]
          },
          {
            label: "Add-ons and retests",
            text: "Additional ratings and retests use separate rules from initial certificate hour minimums.",
            refs: ["14 CFR § 61.63", "14 CFR § 61.49"]
          },
          {
            label: "Glider/tow operations",
            text: "Tow and glider operations require the applicable training, experience, and endorsement checks.",
            refs: ["14 CFR § 61.69"]
          }
        ],
        relatedEndorsements: ["A.59", "A.61", "A.72", "A.73", "A.75", "A.77", "A.78"]
      }),
      "robinson-sfar73": card({
        title: "Robinson SFAR 73 snapshot",
        summary: "Robinson R-22/R-44 endorsements come from SFAR 73 and are additional to the normal Part 61 certificate, rating, flight review, and training rules.",
        requirements: [
          {
            label: "Applicability",
            text: "Confirm whether the operation involves R-22 or R-44 manipulation, PIC, instruction, or flight review duties covered by SFAR 73.",
            refs: ["14 CFR Part 61 SFAR 73", "AC 61-65K A.84-A.92"]
          },
          {
            label: "Awareness, experience, and proficiency",
            text: "SFAR 73 separates awareness training, aeronautical experience, flight training, and flight-review/proficiency requirements.",
            refs: ["14 CFR Part 61 SFAR 73 section 2"]
          }
        ],
        relatedEndorsements: ["A.84", "A.85", "A.86", "A.89", "A.92"]
      }),
      "specialty-operations": card({
        title: "Specialty operations snapshot",
        summary: "NVG, EFVS, and simplified flight controls endorsements support narrow privileges. They should be paired with the aircraft, operation, and instructor-qualification rule text.",
        requirements: [
          {
            label: "NVG and EFVS",
            text: "Night vision goggle and enhanced flight vision system endorsements use specialized operating and training rules.",
            refs: ["14 CFR § 61.31(k)", "14 CFR § 61.31(l)", "14 CFR § 61.45(h)(1)"]
          },
          {
            label: "Powered-lift instrument and simplified controls",
            text: "Specialty entries in this category include powered-lift instrument and simplified-flight-controls instructor limitations.",
            refs: ["14 CFR § 61.66", "14 CFR § 61.195(n)"]
          }
        ],
        relatedEndorsements: ["A.93", "A.94", "A.95", "A.96"]
      })
    },
    subcategoryCards: {
      "student-pilot/pre-solo": card({
        title: "Pre-solo readiness checklist",
        summary: "Pre-solo does not have a federal minimum-hour number. The instructor must verify eligibility, documents, medical status when required, knowledge, and flight proficiency before solo.",
        requirements: [
          {
            label: "Knowledge test",
            text: "The student must demonstrate satisfactory aeronautical knowledge for the make and model before solo.",
            refs: ["14 CFR § 61.87(b)", "AC 61-65K A.3"]
          },
          {
            label: "Flight proficiency",
            text: "The student must receive and log the required pre-solo flight training and show satisfactory proficiency and safety.",
            refs: ["14 CFR § 61.87(c)", "AC 61-65K A.4"]
          },
          {
            label: "Solo authorization",
            text: "The first solo authorization is make/model-specific and valid for 90 calendar days.",
            refs: ["14 CFR § 61.87(n)", "AC 61-65K A.6"]
          }
        ],
        relatedEndorsements: ["A.3", "A.4", "A.6", "A.14"]
      }),
      "student-pilot/first-solo": card({
        title: "First solo package",
        summary: "Before first solo, the usual airplane package is pre-solo knowledge, pre-solo flight training, and the initial 90-day solo authorization.",
        requirements: [
          {
            label: "Required endorsements",
            text: "A.3, A.4, and A.6 should be in place before the student acts as PIC on the first solo flight.",
            refs: ["14 CFR § 61.87(b)", "14 CFR § 61.87(c)", "14 CFR § 61.87(n)"]
          },
          {
            label: "90-day window",
            text: "The initial solo authorization is limited to the specific make/model and expires after 90 calendar days.",
            refs: ["14 CFR § 61.87(n)", "AC 61-65K A.6"]
          }
        ],
        relatedEndorsements: ["A.3", "A.4", "A.6"]
      }),
      "student-pilot/initial-solo-xc": card({
        title: "Initial solo cross-country package",
        summary: "Solo cross-country requires both the broader category training endorsement and the per-flight planning review for the specific route.",
        requirements: [
          {
            label: "Category training",
            text: "The student needs solo cross-country training and proficiency for the aircraft category before solo XC operations.",
            refs: ["14 CFR § 61.93(c)(1) and (2)", "AC 61-65K A.9"]
          },
          {
            label: "Each flight",
            text: "The instructor must review the planning and endorse each individual solo cross-country flight.",
            refs: ["14 CFR § 61.93(c)(3)", "AC 61-65K A.10"]
          }
        ],
        relatedEndorsements: ["A.9", "A.10"]
      }),
      "sport-pilot/sport-practical-test-package": card({
        title: "Sport pilot practical-test path",
        summary: "For the common ASEL sport path, verify the sport knowledge/proficiency requirements and the 20-hour ASEL experience structure before practical-test endorsement.",
        requirements: [
          {
            label: "ASEL minimums",
            text: "Sport ASEL normally includes 20 hours total, 15 hours dual ASEL, 5 hours solo ASEL, and required XC, landing, and recent-prep events.",
            refs: ["14 CFR § 61.313"]
          },
          {
            label: "Test readiness",
            text: "Practical-test endorsement should be paired with the applicable knowledge and proficiency endorsements.",
            refs: ["14 CFR § 61.309", "14 CFR § 61.311", "AC 61-65K A.20-A.22"]
          }
        ],
        relatedEndorsements: ["A.20", "A.21", "A.22"]
      }),
      "private-pilot/private-airplane-initial-checkride-bundle": card({
        title: "Private ASEL checkride minimums",
        summary: "Use this as a quick Part 61 ASEL minimums snapshot before issuing the private practical-test endorsement.",
        requirements: [
          {
            label: "Total, dual, and solo",
            text: "Private ASEL requires at least 40 hours total, including 20 hours dual single-engine airplane and 10 hours solo single-engine airplane.",
            refs: ["14 CFR § 61.109(a)"]
          },
          {
            label: "Dual events",
            text: "The dual bucket includes 3 hours XC, 3 hours night with required night events, 3 hours instrument, and 3 hours recent practical-test prep.",
            refs: ["14 CFR § 61.109(a)(1)", "14 CFR § 61.109(a)(2)", "14 CFR § 61.109(a)(3)", "14 CFR § 61.109(a)(4)"]
          },
          {
            label: "Solo events",
            text: "The solo bucket includes 5 hours solo XC, the 150 NM solo XC, and 3 full-stop towered takeoffs and landings.",
            refs: ["14 CFR § 61.109(a)(5)"]
          }
        ],
        relatedEndorsements: ["A.36", "A.37", "A.1", "A.2"]
      }),
      "commercial-pilot/commercial-airplane-initial-checkride-bundle": card({
        title: "Commercial ASEL checkride minimums",
        summary: "Use this as a quick Part 61 ASEL commercial minimums snapshot before issuing the commercial practical-test endorsement.",
        requirements: [
          {
            label: "Broad time",
            text: "Commercial ASEL requires at least 250 hours total as pilot, including 100 powered, 50 airplane, 100 PIC, 50 PIC airplane, and 50 PIC XC with 10 in airplanes.",
            refs: ["14 CFR § 61.129(a)(1)", "14 CFR § 61.129(a)(2)"]
          },
          {
            label: "Training block",
            text: "The 20-hour commercial training block includes instrument, complex/TAA/turbine, day XC, night XC, and recent-prep items.",
            refs: ["14 CFR § 61.129(a)(3)"]
          },
          {
            label: "Solo or PDPIC block",
            text: "The 10-hour solo/PDPIC ASEL block includes the 300 NM XC and 5 hours night VFR with 10 towered takeoffs and landings.",
            refs: ["14 CFR § 61.129(a)(4)"]
          }
        ],
        relatedEndorsements: ["A.38", "A.39", "A.1", "A.2"]
      }),
      "commercial-pilot/commercial-airplane-add-on-bundle": card({
        title: "Commercial airplane add-on snapshot",
        summary: "For an additional category/class at the same certificate level, focus on the additional-rating rule, proficiency, and any aircraft endorsement needed for the checkride aircraft.",
        requirements: [
          {
            label: "Additional rating",
            text: "Additional aircraft category/class ratings use the applicable 14 CFR § 61.63 pathway rather than simply repeating the initial-rating hour table.",
            refs: ["14 CFR § 61.63(b)", "14 CFR § 61.63(c)", "AC 61-65K A.78"]
          },
          {
            label: "Practical-test readiness",
            text: "Use the practical-test prerequisite endorsement and any aircraft-specific endorsements required for the aircraft used.",
            refs: ["14 CFR § 61.39", "14 CFR § 61.31"]
          }
        ],
        relatedEndorsements: ["A.78", "A.1", "A.72"]
      }),
      "commercial-pilot/commercial-amel-add-on-checkride-bundle": card({
        title: "Commercial AMEL add-on snapshot",
        summary: "For AMEL add-ons, verify the 61.63 route, multiengine proficiency, practical-test readiness, and aircraft qualification. Do not assume the ASEL hour table alone answers the add-on.",
        requirements: [
          {
            label: "Additional class",
            text: "Additional class ratings use 14 CFR § 61.63(c) when the applicant already holds the same certificate level.",
            refs: ["14 CFR § 61.63(c)", "AC 61-65K A.78"]
          },
          {
            label: "Readiness and aircraft",
            text: "The applicant still needs practical-test readiness and any aircraft-specific training or endorsement required for the aircraft used.",
            refs: ["14 CFR § 61.39", "14 CFR § 61.31"]
          }
        ],
        relatedEndorsements: ["A.78", "A.1"]
      }),
      "instrument-rating/instrument-checkride-bundle": card({
        title: "Instrument airplane checkride minimums",
        summary: "Use this as the quick instrument-airplane minimums snapshot before issuing the instrument practical-test endorsement.",
        requirements: [
          {
            label: "Cross-country PIC",
            text: "Instrument airplane requires 50 hours cross-country PIC, including 10 hours in airplanes.",
            refs: ["14 CFR § 61.65(d)(1)"]
          },
          {
            label: "Instrument time",
            text: "Plan around 40 hours actual or simulated instrument time, including 15 hours of instrument training from an authorized instructor for the instrument-airplane rating.",
            refs: ["14 CFR § 61.65(d)(2)"]
          },
          {
            label: "Recent training and IFR XC",
            text: "The airplane path includes recent instrument training and the required IFR XC with approaches and navigation-system work.",
            refs: ["14 CFR § 61.65(d)(2)(i)", "14 CFR § 61.65(d)(2)(ii)"]
          }
        ],
        relatedEndorsements: ["A.42", "A.43", "A.44", "A.1", "A.2"]
      }),
      "flight-instructor/cfi-initial-checkride-bundle": card({
        title: "CFI initial checkride snapshot",
        summary: "CFI initial readiness combines FOI, instructor knowledge, instructor proficiency, practical-test readiness, and the spin-training endorsement when applicable.",
        requirements: [
          {
            label: "Eligibility and knowledge",
            text: "Confirm 14 CFR § 61.183 eligibility and 14 CFR § 61.185 knowledge before treating the practical-test bundle as complete.",
            refs: ["14 CFR § 61.183", "14 CFR § 61.185"]
          },
          {
            label: "Flight instructor proficiency",
            text: "The applicant must receive and log training on the applicable instructor areas of operation.",
            refs: ["14 CFR § 61.187"]
          },
          {
            label: "Spin training",
            text: "CFI airplane and glider applicants need the applicable spin-training endorsement unless an exception applies.",
            refs: ["14 CFR § 61.183(i)(1)", "AC 61-65K A.49"]
          }
        ],
        relatedEndorsements: ["A.45", "A.46", "A.47", "A.49", "A.1", "A.2"]
      }),
      "additional-recurrent/flight-review-and-wings": card({
        title: "Flight review and WINGS snapshot",
        summary: "A flight review is a recurrent proficiency event. WINGS completion can substitute when the rule conditions are met.",
        requirements: [
          {
            label: "Flight review",
            text: "A flight review requires at least the minimum ground and flight review content and a satisfactory completion endorsement.",
            refs: ["14 CFR § 61.56(a)", "14 CFR § 61.56(c)", "AC 61-65K A.59"]
          },
          {
            label: "WINGS substitution",
            text: "A pilot proficiency award under WINGS can satisfy the flight review requirement when it meets the rule.",
            refs: ["14 CFR § 61.56(e)", "AC 61-65K A.60"]
          }
        ],
        relatedEndorsements: ["A.59", "A.60"]
      }),
      "additional-recurrent/instrument-proficiency-check": card({
        title: "IPC snapshot",
        summary: "The IPC restores instrument currency under the instrument recent-experience rule. It is not the same as an instrument-rating practical-test endorsement.",
        requirements: [
          {
            label: "IPC completion",
            text: "Use the IPC completion endorsement after the pilot satisfactorily completes the instrument proficiency check.",
            refs: ["14 CFR § 61.57(d)", "AC 61-65K A.61"]
          }
        ],
        relatedEndorsements: ["A.61"]
      }),
      "additional-recurrent/aircraft-endorsements": card({
        title: "Aircraft endorsement snapshot",
        summary: "Aircraft endorsements are privilege-specific training signoffs. They usually do not create a certificate/rating by themselves.",
        requirements: [
          {
            label: "Complex, high performance, high altitude, tailwheel",
            text: "Each aircraft endorsement has its own training and logbook endorsement requirement before acting as PIC under that rule.",
            refs: ["14 CFR § 61.31(e)", "14 CFR § 61.31(f)", "14 CFR § 61.31(g)", "14 CFR § 61.31(i)"]
          }
        ],
        relatedEndorsements: ["A.72", "A.73", "A.74", "A.75"]
      })
    }
  };
})();
