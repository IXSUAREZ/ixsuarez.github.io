(() => {
  "use strict";

  const SOURCE_REVIEW_DATE = "2026-07-07";
  const REVIEW_NOTE = "Quick-reference summary only. Verify the current eCFR text and any recent rule changes before briefing a student or exercising a privilege.";

  const card = (data) => ({
    sourceReviewDate: SOURCE_REVIEW_DATE,
    reviewNote: REVIEW_NOTE,
    ...data
  });

  window.PRIVILEGES_LIMITATIONS = {
    sourceReviewDate: SOURCE_REVIEW_DATE,
    cards: {
      "student-pilot": card({
        title: "Student pilot privileges & limitations",
        ruleRefs: ["14 CFR § 61.87", "14 CFR § 61.89"],
        summary: "A student pilot's solo privileges come entirely from instructor endorsements. Section 61.87 builds the solo authority; § 61.89 lists what a student may never do even with every endorsement in place.",
        privileges: [
          {
            text: "Solo the specific make and model endorsed, within a current 90-calendar-day solo endorsement.",
            refs: ["14 CFR § 61.87(n)", "14 CFR § 61.87(p)"]
          },
          {
            text: "Log PIC time when the student is the sole occupant of the aircraft.",
            refs: ["14 CFR § 61.51(e)(4)"]
          },
          {
            text: "Fly solo cross-country, to another airport within 25 NM, or in Class B airspace once the specific additional endorsements are given.",
            refs: ["14 CFR § 61.93", "14 CFR § 61.95"]
          }
        ],
        limitations: [
          {
            text: "May not carry passengers, or carry property for compensation or hire.",
            refs: ["14 CFR § 61.89(a)(1)", "14 CFR § 61.89(a)(2)"]
          },
          {
            text: "May not fly for compensation or hire, or in furtherance of a business.",
            refs: ["14 CFR § 61.89(a)(3)", "14 CFR § 61.89(a)(4)"]
          },
          {
            text: "May not fly on an international flight, except limited cases specifically allowed by the rule.",
            refs: ["14 CFR § 61.89(a)(5)"]
          },
          {
            text: "May not fly with flight or surface visibility below 3 SM by day or 5 SM at night, or without visual reference to the surface.",
            refs: ["14 CFR § 61.89(a)(6)", "14 CFR § 61.89(a)(7)"]
          },
          {
            text: "May not fly contrary to any limitation the instructor placed in the logbook endorsement.",
            refs: ["14 CFR § 61.89(a)(8)"]
          },
          {
            text: "Solo cross-country flights need a per-flight planning review endorsement in addition to the standing XC endorsement.",
            refs: ["14 CFR § 61.93(c)", "AC 61-65K A.10"]
          }
        ]
      }),

      "sport-pilot": card({
        title: "Sport pilot privileges & limitations",
        ruleRefs: ["14 CFR § 61.315"],
        summary: "Sport pilots fly light-sport-eligible aircraft with no FAA medical required (valid U.S. driver's license path), but § 61.315(c) carries a long list of operating limits. Several limits can be removed with training and endorsements.",
        privileges: [
          {
            text: "Act as PIC of a light-sport-eligible aircraft and carry one passenger.",
            refs: ["14 CFR § 61.315(a)"]
          },
          {
            text: "Share a flight's operating expenses with the passenger (fuel, oil, airport expenses, or rental only) - the pilot must pay at least half.",
            refs: ["14 CFR § 61.315(b)"]
          },
          {
            text: "Add privileges with endorsements: towered or Class B/C/D operations, and higher-performance light-sport aircraft (Vh above 87 knots).",
            refs: ["14 CFR § 61.325", "14 CFR § 61.327"]
          }
        ],
        limitations: [
          {
            text: "No flight for compensation or hire, in furtherance of a business, or carrying a passenger or property for hire.",
            refs: ["14 CFR § 61.315(c)"]
          },
          {
            text: "No more than one passenger.",
            refs: ["14 CFR § 61.315(c)"]
          },
          {
            text: "Night operations are restricted - check the current § 61.315(c) text and the night-training endorsement path before planning any flight between sunset and sunrise.",
            refs: ["14 CFR § 61.315(c)", "AC 61-65K A.26"]
          },
          {
            text: "No flight in Class A airspace, and no Class B/C/D or towered-field operations without the airspace training endorsement.",
            refs: ["14 CFR § 61.315(c)", "14 CFR § 61.325"]
          },
          {
            text: "No flight above 10,000 ft MSL or 2,000 ft AGL (whichever is higher), with flight visibility below 3 SM, or without visual reference to the surface.",
            refs: ["14 CFR § 61.315(c)"]
          },
          {
            text: "No towing, no flight outside the U.S. without prior authorization, and no operation contrary to aircraft operating limitations or endorsement limits.",
            refs: ["14 CFR § 61.315(c)"]
          }
        ]
      }),

      "recreational-pilot": card({
        title: "Recreational pilot privileges & limitations",
        ruleRefs: ["14 CFR § 61.101"],
        summary: "Recreational pilots operate simple aircraft close to home by default. Most of the endorsements in this category exist to remove a specific § 61.101 operating limit - distance, airspace, or recent-experience conditions.",
        privileges: [
          {
            text: "Act as PIC carrying one passenger, and share operating expenses (fuel, oil, airport expenses, or rental) paying not less than the pro rata share.",
            refs: ["14 CFR § 61.101(a)"]
          },
          {
            text: "Fly beyond 50 NM of the departure airport after receiving the cross-country training and endorsement.",
            refs: ["14 CFR § 61.101(c)"]
          },
          {
            text: "Operate at towered fields and in Class B/C/D airspace after the airspace training and endorsement.",
            refs: ["14 CFR § 61.101(d)"]
          }
        ],
        limitations: [
          {
            text: "Aircraft limits: no aircraft certificated for more than four occupants, more than one powerplant, or a powerplant above 180 horsepower (rotorcraft excepted by rule).",
            refs: ["14 CFR § 61.101(e)"]
          },
          {
            text: "No flight for compensation or hire, in furtherance of a business, or demonstrating aircraft to a buyer.",
            refs: ["14 CFR § 61.101(e)"]
          },
          {
            text: "No flight between sunset and sunrise, above 10,000 ft MSL or 2,000 ft AGL (whichever is higher), with less than 3 SM visibility, or without visual reference to the surface.",
            refs: ["14 CFR § 61.101(e)"]
          },
          {
            text: "No towing, no international flight (limited exceptions), and no acting as a required crewmember where more than one pilot is required.",
            refs: ["14 CFR § 61.101(e)"]
          },
          {
            text: "With fewer than 400 flight hours and no logged PIC time in the preceding 180 days, the pilot must fly under the supervision path until re-endorsed.",
            refs: ["14 CFR § 61.101", "AC 61-65K A.33"]
          }
        ]
      }),

      "private-pilot": card({
        title: "Private pilot privileges & limitations",
        ruleRefs: ["14 CFR § 61.113"],
        summary: "A private pilot may act as PIC and carry passengers, but not for compensation or hire. Section 61.113 then lists exactly seven exceptions - the classic PSCRIPT list every checkride oral touches.",
        privileges: [
          {
            text: "Act as PIC carrying passengers and property, not for compensation or hire.",
            refs: ["14 CFR § 61.113(a)"]
          },
          {
            text: "Share operating expenses with passengers - limited to fuel, oil, airport expenditures, and rental fees, and the pilot may not pay less than the pro rata share.",
            refs: ["14 CFR § 61.113(c)"]
          },
          {
            text: "Fly for charitable, nonprofit, or community events when the flight meets the Part 91 event rules.",
            refs: ["14 CFR § 61.113(d)", "14 CFR § 91.146"]
          },
          {
            text: "Act as PIC under BasicMed instead of holding a medical certificate, when the aircraft and operation qualify.",
            refs: ["14 CFR § 61.113(i)", "14 CFR § 61.23(c)(3)"]
          }
        ],
        limitations: [
          {
            text: "May not act as PIC for compensation or hire, or carry persons or property for compensation or hire, outside the § 61.113 exceptions.",
            refs: ["14 CFR § 61.113(a)"]
          },
          {
            text: "Remember the FAA reads 'compensation' broadly - logged flight time and non-cash benefits can count as compensation under FAA legal interpretations.",
            refs: ["14 CFR § 61.113(a)"]
          }
        ],
        mnemonics: [
          {
            acronym: "PSCRIPT",
            name: "The seven § 61.113 compensation exceptions",
            intro: "A private pilot may not fly for compensation or hire - except:",
            items: [
              {
                letter: "P",
                label: "Pro rata expense sharing",
                text: "Share fuel, oil, airport expenditures, or rental fees with passengers; the pilot pays at least their pro rata share.",
                refs: ["14 CFR § 61.113(c)"]
              },
              {
                letter: "S",
                label: "Salesperson",
                text: "An aircraft salesperson with at least 200 hours may demonstrate an aircraft in flight to a prospective buyer.",
                refs: ["14 CFR § 61.113(f)"]
              },
              {
                letter: "C",
                label: "Charitable, nonprofit, or community event",
                text: "Fly passengers for a qualifying event when the flight meets the § 91.146 conditions.",
                refs: ["14 CFR § 61.113(d)", "14 CFR § 91.146"]
              },
              {
                letter: "R",
                label: "Rescue (search and location)",
                text: "Be reimbursed for operating expenses in search and location operations sanctioned by a local, State, or Federal agency.",
                refs: ["14 CFR § 61.113(e)"]
              },
              {
                letter: "I",
                label: "Incidental to business or employment",
                text: "Fly in connection with a business or job if the flight is only incidental to it and carries no passengers or property for hire.",
                refs: ["14 CFR § 61.113(b)"]
              },
              {
                letter: "P",
                label: "Production flight testing",
                text: "Conduct production flight tests in a light-sport aircraft intended for the light-sport category (rule conditions apply).",
                refs: ["14 CFR § 61.113(h)"]
              },
              {
                letter: "T",
                label: "Tow gliders",
                text: "Tow gliders or unpowered ultralights when qualified under the towing rule.",
                refs: ["14 CFR § 61.113(g)", "14 CFR § 61.69"]
              }
            ]
          }
        ]
      }),

      "commercial-pilot": card({
        title: "Commercial pilot privileges & limitations",
        ruleRefs: ["14 CFR § 61.133", "14 CFR § 119.1(e)"],
        summary: "A commercial certificate lets you be paid to fly - it does not by itself let you sell air transportation. The real teaching point is the line between flying for compensation and holding out, which lives in Part 119.",
        privileges: [
          {
            text: "Act as PIC of an aircraft for compensation or hire, and carry persons or property for compensation or hire, when qualified under the regulations that apply to the operation.",
            refs: ["14 CFR § 61.133(a)"]
          },
          {
            text: "Fly Part 91 commercial operations excepted from air-carrier certification: flight training, ferry and training flights, crop dusting, banner towing, aerial photography and survey, power line and pipeline patrol, and similar aerial work.",
            refs: ["14 CFR § 119.1(e)"]
          },
          {
            text: "Fly nonstop commercial air tours within 25 SM of the departure airport under the Part 91 air-tour rules (LOA required).",
            refs: ["14 CFR § 119.1(e)(2)", "14 CFR § 91.147"]
          }
        ],
        limitations: [
          {
            text: "Airplane commercial pilots without an instrument rating: no carriage of passengers for hire on cross-country flights beyond 50 NM, and none at night. This limitation is printed on the certificate.",
            refs: ["14 CFR § 61.133(b)(1)"]
          },
          {
            text: "No holding out to the public as willing to transport persons or property - common carriage requires an air carrier or operating certificate under Part 119 (Parts 121/135 operations).",
            refs: ["14 CFR Part 119", "14 CFR § 119.5"]
          },
          {
            text: "Giving flight training for compensation still requires a flight instructor certificate - the commercial certificate alone does not authorize instruction.",
            refs: ["14 CFR § 61.3(d)"]
          }
        ]
      }),

      atp: card({
        title: "ATP privileges & limitations",
        ruleRefs: ["14 CFR § 61.167"],
        summary: "The ATP certificate carries all commercial-pilot-with-instrument privileges plus command authority in air carrier operations. Its notable limitation is on instruction given in air transportation service.",
        privileges: [
          {
            text: "Exercise all the privileges of a commercial pilot certificate with an instrument rating.",
            refs: ["14 CFR § 61.167(a)"]
          },
          {
            text: "Act as PIC in operations requiring an ATP certificate, such as Part 121 and applicable Part 135 operations.",
            refs: ["14 CFR § 61.167(a)", "14 CFR § 121.436"]
          },
          {
            text: "Instruct other pilots in air transportation service in aircraft of the category, class, and type for which the ATP is rated, and endorse those pilots' logbooks - no CFI certificate required for that specific instruction.",
            refs: ["14 CFR § 61.167(a)"]
          }
        ],
        limitations: [
          {
            text: "Instruction in air transportation service is capped: no more than 8 hours in any 24-consecutive-hour period and no more than 36 hours in any 7-consecutive-day period.",
            refs: ["14 CFR § 61.167(b)"]
          },
          {
            text: "A restricted-privileges ATP (R-ATP) authorizes serving only as SIC in Part 121 operations; the restriction is removed once the full § 61.159 aeronautical experience is met.",
            refs: ["14 CFR § 61.160", "14 CFR § 61.159"]
          }
        ]
      }),

      "instrument-rating": card({
        title: "Instrument rating privileges & limitations",
        ruleRefs: ["14 CFR § 61.3(e)", "14 CFR § 61.57(c)"],
        summary: "The instrument rating is required for IFR flight, weather below VFR minimums, and Class A airspace - and it unlocks the commercial pilot's night/50-NM passenger limitation. Keeping it usable is a currency game: 6HITS.",
        privileges: [
          {
            text: "Act as PIC under IFR and in weather conditions less than the minimums for VFR flight.",
            refs: ["14 CFR § 61.3(e)"]
          },
          {
            text: "Operate in Class A airspace, where IFR is required.",
            refs: ["14 CFR § 91.135"]
          },
          {
            text: "Accept a Special VFR clearance between sunset and sunrise (instrument-rated pilot and IFR-equipped aircraft required).",
            refs: ["14 CFR § 91.157(b)"]
          },
          {
            text: "For commercial pilots: removes the certificate limitation against carrying passengers for hire at night or on cross-countries beyond 50 NM.",
            refs: ["14 CFR § 61.133(b)(1)"]
          }
        ],
        limitations: [
          {
            text: "IFR currency requires the 6HITS items within the preceding 6 calendar months, flown in the appropriate category of aircraft or an approved simulation device.",
            refs: ["14 CFR § 61.57(c)"]
          },
          {
            text: "If currency lapses, you have 6 more months to regain it with a safety pilot (not as PIC under IFR); after that, an instrument proficiency check is required.",
            refs: ["14 CFR § 61.57(d)", "AC 61-65K A.71"]
          },
          {
            text: "IFR flight also demands the required equipment (GRABCARD) plus current inspections: pitot-static/transponder checks and VOR checks when VOR is used.",
            refs: ["14 CFR § 91.205(d)", "14 CFR § 91.411", "14 CFR § 91.413", "14 CFR § 91.171"]
          }
        ],
        mnemonics: [
          {
            acronym: "6HITS",
            name: "IFR currency in the last 6 calendar months",
            intro: "Within the preceding 6 calendar months, perform and log:",
            items: [
              {
                letter: "6",
                label: "Six instrument approaches",
                text: "Six instrument approaches in the appropriate category of aircraft, or in an approved FFS/FTD/ATD.",
                refs: ["14 CFR § 61.57(c)(1)"]
              },
              {
                letter: "H",
                label: "Holding",
                text: "Holding procedures and tasks.",
                refs: ["14 CFR § 61.57(c)(1)"]
              },
              {
                letter: "I",
                label: "Intercepting",
                text: "Intercepting courses through the use of navigational electronic systems.",
                refs: ["14 CFR § 61.57(c)(1)"]
              },
              {
                letter: "T",
                label: "Tracking",
                text: "Tracking courses through the use of navigational electronic systems.",
                refs: ["14 CFR § 61.57(c)(1)"]
              },
              {
                letter: "S",
                label: "Systems",
                text: "Use of the navigational electronic systems required to intercept and track courses.",
                refs: ["14 CFR § 61.57(c)(1)"]
              }
            ]
          },
          {
            acronym: "GRABCARD",
            name: "Required instruments & equipment for IFR",
            intro: "In addition to VFR day/night equipment, IFR flight requires:",
            items: [
              { letter: "G", label: "Generator or alternator", text: "Generator or alternator of adequate capacity.", refs: ["14 CFR § 91.205(d)"] },
              { letter: "R", label: "Radios", text: "Two-way radio communication and navigation equipment suitable for the route.", refs: ["14 CFR § 91.205(d)"] },
              { letter: "A", label: "Altimeter", text: "Sensitive altimeter adjustable for barometric pressure.", refs: ["14 CFR § 91.205(d)"] },
              { letter: "B", label: "Ball", text: "Slip-skid indicator.", refs: ["14 CFR § 91.205(d)"] },
              { letter: "C", label: "Clock", text: "Clock displaying hours, minutes, and seconds with a sweep-second pointer or digital presentation.", refs: ["14 CFR § 91.205(d)"] },
              { letter: "A", label: "Attitude indicator", text: "Gyroscopic pitch and bank indicator.", refs: ["14 CFR § 91.205(d)"] },
              { letter: "R", label: "Rate of turn", text: "Gyroscopic rate-of-turn indicator.", refs: ["14 CFR § 91.205(d)"] },
              { letter: "D", label: "Directional gyro", text: "Gyroscopic direction indicator.", refs: ["14 CFR § 91.205(d)"] }
            ]
          }
        ]
      }),

      "flight-instructor": card({
        title: "Flight instructor privileges & limitations",
        ruleRefs: ["14 CFR § 61.193", "14 CFR § 61.195"],
        summary: "Section 61.193 grants the authority to train and endorse; § 61.195 fences it in. The limitations are favorite oral-exam material for initial CFI applicants.",
        privileges: [
          {
            text: "Give the training and endorsements required for student, sport, recreational, private, commercial, and instrument applicants, plus flight reviews and practical-test recommendations, within the instructor's ratings.",
            refs: ["14 CFR § 61.193"]
          },
          {
            text: "Conduct instrument proficiency checks and give the instrument training required for certificates and ratings when holding the instrument-instructor rating (CFII).",
            refs: ["14 CFR § 61.193", "14 CFR § 61.195(c)"]
          }
        ],
        limitations: [
          {
            text: "No more than 8 hours of flight training in any 24-consecutive-hour period.",
            refs: ["14 CFR § 61.195(a)"]
          },
          {
            text: "Training may only be given in aircraft for which the instructor holds the category, class, and (if required) type rating on both the pilot certificate and the flight instructor certificate.",
            refs: ["14 CFR § 61.195(b)"]
          },
          {
            text: "Instrument training toward a certificate, rating, or IPC requires the instrument rating on the flight instructor certificate for the applicable category/class.",
            refs: ["14 CFR § 61.195(c)"]
          },
          {
            text: "PIC-required training in a multiengine airplane, helicopter, or powered-lift requires at least 5 hours of PIC time in the specific make and model.",
            refs: ["14 CFR § 61.195(f)"]
          },
          {
            text: "Training an initial CFI applicant requires having held the flight instructor certificate for at least 24 months and having given at least 200 hours of flight training.",
            refs: ["14 CFR § 61.195(h)"]
          },
          {
            text: "Instructor privileges depend on staying current under the renewal/recent-experience rules on a 24-calendar-month cycle.",
            refs: ["14 CFR § 61.197", "14 CFR § 61.199"]
          }
        ]
      }),

      "sport-pilot-instructor": card({
        title: "Sport pilot instructor privileges & limitations",
        ruleRefs: ["14 CFR § 61.413", "14 CFR § 61.415"],
        summary: "A flight instructor with a sport pilot rating trains and endorses within the sport pilot world - light-sport aircraft and sport pilot privileges - under limits that parallel § 61.195.",
        privileges: [
          {
            text: "Give training and endorsements for sport pilot certificates, sport pilot privileges (airspace, faster aircraft), and sport-instructor applicants, within the privileges held.",
            refs: ["14 CFR § 61.413"]
          },
          {
            text: "Give the ground and flight training for the additional endorsements in this category, such as Class B/C/D airspace and Vh-above-87-knots privileges.",
            refs: ["14 CFR § 61.413", "14 CFR § 61.325", "14 CFR § 61.327"]
          }
        ],
        limitations: [
          {
            text: "No more than 8 hours of flight training in any 24-consecutive-hour period.",
            refs: ["14 CFR § 61.415"]
          },
          {
            text: "May only train in aircraft and for privileges the instructor is authorized to exercise, and must meet the specific experience requirements before training for added privileges.",
            refs: ["14 CFR § 61.415", "14 CFR § 61.419"]
          },
          {
            text: "Basic instrument-reference training given to sport pilots does not count toward an instrument rating, and sport instructors must hold the required instrument experience/endorsement to give it.",
            refs: ["14 CFR § 61.415", "AC 61-65K A.57"]
          }
        ]
      }),

      "robinson-sfar73": card({
        title: "SFAR 73 special requirements (R22 / R44)",
        ruleRefs: ["SFAR 73 to 14 CFR Part 61"],
        summary: "SFAR 73 layers special awareness training, experience floors, and instructor requirements on top of normal Part 61 privileges for Robinson R22 and R44 helicopters.",
        privileges: [
          {
            text: "Act as PIC of an R22 or R44 after completing the SFAR 73 awareness training and meeting the applicable experience or endorsement path.",
            refs: ["SFAR 73 to 14 CFR Part 61"]
          },
          {
            text: "The endorsements in this category document the awareness training, flight training, and 12-calendar-month proficiency paths for each model.",
            refs: ["SFAR 73 to 14 CFR Part 61", "AC 61-65K A.60"]
          }
        ],
        limitations: [
          {
            text: "PIC experience floors apply per model (helicopter time plus time in type) unless flying under the supervision/endorsement path with recurring checks.",
            refs: ["SFAR 73 to 14 CFR Part 61"]
          },
          {
            text: "Flight instruction in an R22/R44 requires the instructor to meet SFAR 73's separate, higher experience requirements in the type.",
            refs: ["SFAR 73 to 14 CFR Part 61"]
          }
        ]
      })
    }
  };
})();
