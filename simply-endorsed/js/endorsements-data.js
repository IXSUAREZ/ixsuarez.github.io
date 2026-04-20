(() => {
  "use strict";

  window.APP_META = {
    "acVersion": "AC 61-65K",
    "dateIssued": "2025-11-14",
    "display": "AC 61-65K (issued 11/14/2025)",
    "sourceUrl": "https://www.faa.gov/documentLibrary/media/Advisory_Circular/AC_61-65K.pdf",
    "documentPageUrl": "https://www.faa.gov/regulations_policies/advisory_circulars/index.cfm/go/document.information/documentID/1044476"
  };

  window.ENDORSEMENTS = [
    {
      "id": "A.1",
      "order": 1,
      "title": "Prerequisites for practical test",
      "cfr": [
        "14 CFR \u00a7 61.39(a)(6)(i) and (ii)"
      ],
      "sourcePage": "A-7",
      "verbatimText": "I certify that [First name, MI, Last name] has received and logged training time within 2 calendar months preceding the month of application in preparation for the practical test and they are prepared for the required practical test for the issuance of [applicable] certificate.",
      "category": "practical-test-prereqs",
      "explanation": "\u2022\tConfirms the applicant\u2019s checkride prep is recent, not stale.\n\u2022\tHelps ensure oral knowledge and flight skills are still current on test day.\n\u2022\tShows the instructor believes the applicant is truly ready to be evaluated.",
      "whoIssues": "standard-cfi",
      "expiration": "2-calendar-months",
      "perFlight": false,
      "aliases": [
        "a.1",
        "prerequisites for practical test"
      ],
      "tags": [
        "checkride",
        "practical test prereqs"
      ],
      "cardExplanation": "Confirms the applicant got checkride prep within the last 2 calendar months and is ready for the practical test."
    },
    {
      "id": "A.2",
      "order": 2,
      "title": "Review of deficiencies identified on airman knowledge test",
      "cfr": [
        "14 CFR \u00a7 61.39(a)(6)(iii), as required"
      ],
      "sourcePage": "A-7",
      "verbatimText": "I certify that [First name, MI, Last name] has demonstrated satisfactory knowledge of the subject areas in which they were deficient on the [applicable] airman knowledge test.",
      "category": "practical-test-prereqs",
      "explanation": "\u2022\tMakes sure missed written-test topics were reviewed before the checkride.\n\u2022\tHelps fix weak areas like airspace, weather, or regulations before testing.\n\u2022\tReduces the chance the same knowledge gaps show up during the oral.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.2",
        "review of deficiencies identified on airman knowledge test"
      ],
      "tags": [
        "knowledge test",
        "practical test prereqs"
      ],
      "cardExplanation": "Shows the instructor reviewed the missed knowledge-test areas listed on the Airman Knowledge Test Report."
    },
    {
      "id": "A.3",
      "order": 3,
      "title": "Pre-solo aeronautical knowledge",
      "cfr": [
        "14 CFR \u00a7 61.87(b)"
      ],
      "sourcePage": "A-7",
      "verbatimText": "I certify that [First name, MI, Last name] has satisfactorily completed the pre-solo knowledge test of 14 CFR \u00a7 61.87(b) for the [make and model (M/M)] aircraft.",
      "category": "student-pilot",
      "explanation": "\u2022\tProves the student understands the aircraft, rules, and local procedures before flying alone.\n\u2022\tHelps confirm the student knows emergency actions and operating limits.\n\u2022\tPrevents a first solo from happening before the student has the needed knowledge base.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.3",
        "pre-solo aeronautical knowledge"
      ],
      "tags": [
        "solo",
        "student pilot"
      ],
      "cardExplanation": "Used before first solo to confirm the student passed the required pre-solo knowledge test for that make and model."
    },
    {
      "id": "A.4",
      "order": 4,
      "title": "Pre-solo flight training",
      "cfr": [
        "14 CFR \u00a7 61.87(c)(1) and (2)"
      ],
      "sourcePage": "A-8",
      "verbatimText": "I certify that [First name, MI, Last name] has received and logged pre-solo flight training for the maneuvers and procedures that are appropriate to the [M/M] aircraft. I have determined they have demonstrated satisfactory proficiency and safety on the maneuvers and procedures required by 14 CFR \u00a7 61.87 in this or similar make and model of aircraft to be flown.",
      "category": "student-pilot",
      "explanation": "\u2022\tShows the student can safely control the airplane without the instructor onboard.\n\u2022\tConfirms the student can handle takeoffs, landings, go-arounds, and pattern work.\n\u2022\tGives the instructor a documented basis for allowing solo flight.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.4",
        "pre-solo flight training"
      ],
      "tags": [
        "solo",
        "student pilot"
      ],
      "cardExplanation": "Shows the student received the required pre-solo flight training and is proficient in that make and model."
    },
    {
      "id": "A.5",
      "order": 5,
      "title": "Pre-solo flight training at night",
      "cfr": [
        "14 CFR \u00a7 61.87(o)"
      ],
      "sourcePage": "A-8",
      "verbatimText": "Flight training must be received within the 90-calendar-day period preceding the date of the flight. I certify that [First name, MI, Last name] has received flight training at night on night flying procedures that include takeoffs, approaches, landings, and go-arounds at night at the [airport name] airport where the solo flight will be conducted; navigation training at night in the vicinity of the [airport name] airport where the solo flight will be conducted. This endorsement expires 90 calendar days from the date the flight training at night was received.",
      "category": "student-pilot",
      "explanation": "\u2022\tNight flying is harder because of reduced visual cues and common illusions.\n\u2022\tHelps ensure the student knows runway lighting, night procedures, and night judgment.\n\u2022\tThe 90-day limit keeps that night training recent.",
      "whoIssues": "standard-cfi",
      "expiration": "90-calendar-days",
      "perFlight": false,
      "aliases": [
        "a.5",
        "night solo",
        "pre-solo flight training at night"
      ],
      "tags": [
        "solo",
        "student pilot"
      ],
      "cardExplanation": "Required before a student solos at night. Covers night procedures at that airport and expires 90 calendar days after the night training."
    },
    {
      "id": "A.6",
      "order": 6,
      "title": "Solo flight (first 90-calendar-day period)",
      "cfr": [
        "14 CFR \u00a7 61.87(n)"
      ],
      "sourcePage": "A-8",
      "verbatimText": "I certify that [First name, MI, Last name] has received the required training to qualify for solo flying. I have determined they meet the applicable requirements of 14 CFR \u00a7 61.87(n) and are proficient to make solo flights in [M/M].",
      "category": "student-pilot",
      "explanation": "\u2022\tThis is the student\u2019s main legal authority for first solo flight.\n\u2022\tLimits the solo to the specific make and model the student was trained in.\n\u2022\tThe 90-day limit forces regular instructor oversight.",
      "whoIssues": "standard-cfi",
      "expiration": "90-calendar-days",
      "perFlight": false,
      "aliases": [
        "a.6",
        "solo flight (first 90-calendar-day period)"
      ],
      "tags": [
        "solo",
        "student pilot"
      ],
      "cardExplanation": "Authorizes the student\u2019s first solo flights in a specific make and model. Must be given by the instructor who trained the student and expires in 90 calendar days."
    },
    {
      "id": "A.7",
      "order": 7,
      "title": "Solo flight (each additional 90-calendar-day period)",
      "cfr": [
        "14 CFR \u00a7 61.87(p)"
      ],
      "sourcePage": "A-8",
      "verbatimText": "I certify that [First name, MI, Last name] has received the required training to qualify for solo flying. I have determined that they meet the applicable requirements of 14 CFR \u00a7 61.87(p) and are proficient to make solo flights in [M/M].",
      "category": "student-pilot",
      "explanation": "\u2022\tPrevents solo privileges from continuing indefinitely without review.\n\u2022\tLets the instructor recheck the student\u2019s skill, judgment, and consistency.\n\u2022\tHelps catch rust or bad habits before more solo flying.",
      "whoIssues": "standard-cfi",
      "expiration": "90-calendar-days",
      "perFlight": false,
      "aliases": [
        "a.7",
        "solo flight (each additional 90-calendar-day period)"
      ],
      "tags": [
        "solo",
        "student pilot"
      ],
      "cardExplanation": "Renews solo flight authority for another 90 calendar days after the first solo period ends."
    },
    {
      "id": "A.8",
      "order": 8,
      "title": "Solo takeoffs and landings at another airport within 25 nautical miles (NM)",
      "cfr": [
        "14 CFR \u00a7 61.93(b)(1)"
      ],
      "sourcePage": "A-8",
      "verbatimText": "I certify that [First name, MI, Last name] has received the required training of 14 CFR \u00a7 61.93(b)(1). I have determined that they are proficient to practice solo takeoffs and landings at [airport name]. The takeoffs and landings at [airport name] are subject to the following conditions: [List any applicable conditions or limitations.]",
      "category": "student-pilot",
      "explanation": "\u2022\tAllows another nearby airport only after instructor approval.\n\u2022\tHelps account for different runways, traffic, radio workload, and layouts.\n\u2022\tKeeps the student from expanding solo operations without supervision.",
      "whoIssues": "standard-cfi",
      "expiration": "90-calendar-days",
      "perFlight": false,
      "aliases": [
        "25 nm solo",
        "a.8",
        "solo takeoffs and landings at another airport within 25 nautical miles (nm)",
        "solo to another airport"
      ],
      "tags": [
        "solo",
        "student pilot"
      ],
      "cardExplanation": "Allows solo takeoffs and landings at another airport within 25 NM. Expires in 90 calendar days."
    },
    {
      "id": "A.9",
      "order": 9,
      "title": "Solo cross-country flight",
      "cfr": [
        "14 CFR \u00a7 61.93(c)(1) and (2)"
      ],
      "sourcePage": "A-8",
      "verbatimText": "I certify that [First name, MI, Last name] has received the required solo cross-country training. I find they have met the applicable requirements of 14 CFR \u00a7 61.93 and are proficient to make solo cross-country flights in a [M/M] aircraft, [aircraft category].",
      "category": "student-pilot",
      "explanation": "\u2022\tConfirms the student got the training needed before leaving the local area alone.\n\u2022\tCovers more than flying skill, including planning, navigation, weather, and fuel.\n\u2022\tEstablishes the student is ready for solo XC operations in that aircraft.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.9",
        "solo cross country flight",
        "solo cross-country flight"
      ],
      "tags": [
        "solo",
        "solo xc",
        "student pilot"
      ],
      "cardExplanation": "Gives the student the initial solo cross-country endorsement package for that category, make, and model."
    },
    {
      "id": "A.10",
      "order": 10,
      "title": "Solo cross-country flight",
      "cfr": [
        "14 CFR \u00a7 61.93(c)(3)"
      ],
      "sourcePage": "A-8",
      "verbatimText": "I have reviewed the cross-country planning of [First name, MI, Last name]. I find the planning and preparation to be correct to make the solo flight from [origination airport] to [origination airport] via [route of flight] with landings at [names of the airports] in a [M/M] aircraft on [date]. [List any applicable conditions or limitations.]",
      "category": "student-pilot",
      "explanation": "\u2022\tRequires instructor review for each specific solo XC flight.\n\u2022\tLets the instructor check route, weather, fuel, performance, and decision-making.\n\u2022\tPrevents a student from launching on an unsafe or poorly planned trip.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": true,
      "aliases": [
        "a.10",
        "per flight solo xc",
        "solo cross country flight",
        "solo cross-country flight",
        "solo xc planning"
      ],
      "tags": [
        "solo",
        "solo xc",
        "student pilot"
      ],
      "cardExplanation": "Shows the instructor reviewed and approved planning for a specific solo cross-country flight. Required before each solo XC flight."
    },
    {
      "id": "A.11",
      "order": 11,
      "title": "Repeated solo cross-country flights not more than 50 NM from the point of departure",
      "cfr": [
        "14 CFR \u00a7 61.93(b)(2)"
      ],
      "sourcePage": "A-9",
      "verbatimText": "I certify that [First name, MI, Last name] has received the required training in both directions between and at both [airport names]. I have determined that they are proficient of 14 CFR \u00a7 61.93(b)(2) to conduct repeated solo cross-country flights over that route, subject to the following conditions: [List any applicable conditions or limitations.]",
      "category": "student-pilot",
      "explanation": "\u2022\tMakes repeated short solo routes easier to authorize and manage.\n\u2022\tKeeps the route limited and familiar rather than open-ended.\n\u2022\tWorks well for repeated training flights between known airports.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.11",
        "repeated solo cross country flights not more than 50 nm from the point of departure",
        "repeated solo cross-country flights not more than 50 nm from the point of departure"
      ],
      "tags": [
        "solo",
        "solo xc",
        "student pilot"
      ],
      "cardExplanation": "Approves repeated solo cross-country flights on a specific route within 50 NM of the departure point."
    },
    {
      "id": "A.12",
      "order": 12,
      "title": "Solo flight in Class B airspace",
      "cfr": [
        "14 CFR \u00a7 61.95(a)"
      ],
      "sourcePage": "A-9",
      "verbatimText": "I certify that [First name, MI, Last name] has received the required training of 14 CFR \u00a7 61.95(a). I have determined they are proficient to conduct solo flights in [name of Class B] airspace. [List any applicable conditions or limitations.]",
      "category": "student-pilot",
      "explanation": "\u2022\tClass B is high-workload airspace with heavy traffic and tighter ATC expectations.\n\u2022\tConfirms the student received special training for that environment.\n\u2022\tThe 90-day limit keeps that approval current.",
      "whoIssues": "standard-cfi",
      "expiration": "90-calendar-days",
      "perFlight": false,
      "aliases": [
        "a.12",
        "class b",
        "class b solo",
        "solo flight in class b airspace"
      ],
      "tags": [
        "solo",
        "student pilot"
      ],
      "cardExplanation": "Allows a student to solo in Class B airspace after required training and proficiency. Expires in 90 calendar days."
    },
    {
      "id": "A.13",
      "order": 13,
      "title": "Solo flight to, from, or at an airport located in Class B airspace",
      "cfr": [
        "14 CFR \u00a7\u00a7 61.95(b) and 91.131(b)(1)"
      ],
      "sourcePage": "A-9",
      "verbatimText": "I certify that [First name, MI, Last name] has received the required training of 14 CFR \u00a7 61.95(b)(1). I have determined that they are proficient to conduct solo flight operations at [name of airport]. [List any applicable conditions or limitations.]",
      "category": "student-pilot",
      "explanation": "\u2022\tA Class B airport can be more demanding than just entering Class B airspace.\n\u2022\tHelps ensure the student can handle taxi complexity, sequencing, and faster traffic.\n\u2022\tPrevents solo operations at major airports without specific approval.",
      "whoIssues": "standard-cfi",
      "expiration": "90-calendar-days",
      "perFlight": false,
      "aliases": [
        "a.13",
        "class b",
        "class b airport solo",
        "solo flight to, from, or at an airport located in class b airspace"
      ],
      "tags": [
        "solo",
        "student pilot"
      ],
      "cardExplanation": "Allows a student to solo to, from, or at a Class B airport. Expires in 90 calendar days."
    },
    {
      "id": "A.14",
      "order": 14,
      "title": "Endorsement of U.S. citizenship recommended by the Transportation Security Administration (TSA)",
      "cfr": [
        "Title 49 of the Code of Federal Regulations (49 CFR) \u00a7 1552.15(c)"
      ],
      "sourcePage": "A-9",
      "verbatimText": "The flight instructor must keep a copy of the documents used to provide proof of citizenship for 5 years or make the following endorsement in the student\u2019s logbook and the instructor\u2019s logbook or other record used to record flight student endorsements with the following: I certify that [First name, MI, Last name] has presented me a [type of document presented, such as a U.S. birth certificate or U.S. passport, and the relevant control or sequential number on the document, if any] establishing that they are a U.S. citizen or national in accordance with 49 CFR \u00a7 1552.7(a).",
      "category": "student-pilot",
      "explanation": "\u2022\tDocuments that citizenship verification was completed when using the endorsement method.\n\u2022\tHelps the instructor show compliance with TSA flight training security requirements.\n\u2022\tProtects both instructor and student if records are later reviewed.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.14",
        "citizenship endorsement",
        "endorsement of u.s. citizenship recommended by the transportation security administration (tsa)",
        "endorsement of us citizenship recommended by the transportation security administration (tsa)",
        "tsa citizenship"
      ],
      "tags": [
        "student pilot"
      ],
      "cardExplanation": "Records the TSA-recommended citizenship endorsement when the instructor uses the endorsement method instead of keeping document copies."
    },
    {
      "id": "A.15",
      "order": 15,
      "title": "Solo flight in Class B, C, and D airspace",
      "cfr": [
        "14 CFR \u00a7 61.94(a)"
      ],
      "sourcePage": "A-9",
      "verbatimText": "I certify that [First name, MI, Last name] has received the required training of 14 CFR \u00a7 61.94(a). I have determined they are proficient to conduct solo flights in [name of Class B, C, or D] airspace and authorized to operate to, from, through, and at [name of airport]. [List any applicable conditions or limitations.]",
      "category": "student-pilot",
      "explanation": "\u2022\tControlled airspace adds traffic, radio work, and sequencing demands.\n\u2022\tConfirms a sport or recreational student was specifically trained for that environment.\n\u2022\tThe 90-day limit requires recent review of those skills.",
      "whoIssues": "standard-cfi",
      "expiration": "90-calendar-days",
      "perFlight": false,
      "aliases": [
        "a.15",
        "class b",
        "solo flight in class b, c, and d airspace"
      ],
      "tags": [
        "solo",
        "student pilot"
      ],
      "cardExplanation": "Allows a sport or recreational student to solo in Class B, C, or D airspace. Expires in 90 calendar days."
    },
    {
      "id": "A.16",
      "order": 16,
      "title": "Solo flight to, from, or at an airport located in Class B, C, or D airspace or at an airport having an operational control tower",
      "cfr": [
        "14 CFR \u00a7\u00a7 61.94(a) and 91.131(b)(1)"
      ],
      "sourcePage": "A-10",
      "verbatimText": "I certify that [First name, MI, Last name] has received the required training of 14 CFR \u00a7 61.94(a)(1). I have determined that they are proficient to conduct solo flight operations at [name of airport located in Class B, C, or D airspace or an airport having an operational control tower]. [List any applicable conditions or limitations.]",
      "category": "student-pilot",
      "explanation": "\u2022\tTowered airport operations require accurate communication and instruction compliance.\n\u2022\tHelps ensure the student can handle taxi, hold short, runway entries, and pattern flow.\n\u2022\tReduces the risk of confusion in busy airport environments.",
      "whoIssues": "standard-cfi",
      "expiration": "90-calendar-days",
      "perFlight": false,
      "aliases": [
        "a.16",
        "class b",
        "solo flight to, from, or at an airport located in class b, c, or d airspace or at an airport having an operational control tower",
        "towered airport solo"
      ],
      "tags": [
        "solo",
        "student pilot"
      ],
      "cardExplanation": "Allows a sport or recreational student to solo to, from, or at a towered airport or an airport in Class B, C, or D airspace. Expires in 90 calendar days."
    },
    {
      "id": "A.17",
      "order": 17,
      "title": "Aeronautical knowledge test",
      "cfr": [
        "14 CFR \u00a7\u00a7 61.35(a)(1) and 61.309"
      ],
      "sourcePage": "A-10",
      "verbatimText": "I certify that [First name, MI, Last name] has received the required aeronautical knowledge training of 14 CFR \u00a7 61.309. I have determined that they are prepared for the [name of] knowledge test.",
      "category": "sport-pilot",
      "explanation": "\u2022\tShows the applicant was prepared before taking the written test.\n\u2022\tHelps prevent poor test attempts based on weak or incomplete study.\n\u2022\tCreates a record that required ground prep was completed.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.17",
        "aeronautical knowledge test"
      ],
      "tags": [
        "knowledge test",
        "sport pilot"
      ],
      "cardExplanation": "Shows the required ground training or review is complete and the applicant is ready for the knowledge test."
    },
    {
      "id": "A.18",
      "order": 18,
      "title": "Taking flight proficiency check for different category or class of aircraft",
      "cfr": [
        "14 CFR \u00a7\u00a7 61.309 and 61.311"
      ],
      "sourcePage": "A-10",
      "verbatimText": "I certify that [First name, MI, Last name] has received the required training in accordance with 14 CFR \u00a7\u00a7 61.309 and 61.311 and have determined that they are prepared for the [name of] proficiency check. /s/ [date] S. P. (Instructor name) 987654321 RE 12-31-2026 Note: Cannot be provided to applicants seeking an airplane or helicopter privilege. Must accomplish a practical test, 14 CFR \u00a7 61.321(b).",
      "category": "sport-pilot",
      "explanation": "\u2022\tConfirms the pilot is ready to be evaluated for a new category or class.\n\u2022\tRecognizes that moving to a different category or class can involve major differences.\n\u2022\tHelps ensure the pilot does not test before receiving the needed training.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.18",
        "taking flight proficiency check for different category or class of aircraft"
      ],
      "tags": [
        "checkride",
        "sport pilot"
      ],
      "cardExplanation": "Shows the applicant has the required training and proficiency to take a flight proficiency check for a different category or class."
    },
    {
      "id": "A.19",
      "order": 19,
      "title": "Passing flight proficiency check for different category or class of aircraft",
      "cfr": [
        "14 CFR \u00a7\u00a7 61.309 and 61.311"
      ],
      "sourcePage": "A-10",
      "verbatimText": "I certify that [First name, MI, Last name] has met the requirements of 14 CFR \u00a7\u00a7 61.309 and 61.311, and I have determined them proficient to act as pilot in command of [category and class of] aircraft. /s/ [date] S. P. (Instructor name) 987654321 RE 12-31-2026 Note: Cannot be provided to applicants seeking an airplane or helicopter privilege. Must accomplish a practical test, 14 CFR \u00a7 61.321(b).",
      "category": "sport-pilot",
      "explanation": "\u2022\tRecords that the pilot completed the required training and proficiency for that added privilege.\n\u2022\tCreates a clear qualification record, not just informal familiarization.\n\u2022\tSupports the FAA basis for granting the new privilege.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.19",
        "passing flight proficiency check for different category or class of aircraft"
      ],
      "tags": [
        "checkride",
        "sport pilot"
      ],
      "cardExplanation": "Shows the applicant completed the required training and proficiency for passing the flight proficiency check for a different category or class."
    },
    {
      "id": "A.20",
      "order": 20,
      "title": "Taking sport pilot practical test",
      "cfr": [
        "14 CFR \u00a7\u00a7 61.309, 61.311, and 61.313"
      ],
      "sourcePage": "A-10",
      "verbatimText": "I certify that [First name, MI, Last name] has received the training required in accordance with 14 CFR \u00a7\u00a7 61.309 and 61.311 and met the aeronautical experience requirements of 14 CFR \u00a7 61.313. I have determined that they are prepared for the [type of] practical test. Note: The endorsement for a practical test is required in addition to the 14 CFR \u00a7 61.39 endorsements provided in endorsements 1 and 2 (see paragraphs A.1 and A.2).",
      "category": "sport-pilot",
      "explanation": "\u2022\tShows the applicant was trained to practical-test level, not just basic familiarity.\n\u2022\tActs as the instructor\u2019s formal recommendation to test.\n\u2022\tHelps the examiner receive a prepared applicant.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.20",
        "taking sport pilot practical test"
      ],
      "tags": [
        "checkride",
        "sport pilot"
      ],
      "cardExplanation": "Shows the applicant has the required training and proficiency to take the sport pilot practical test."
    },
    {
      "id": "A.21",
      "order": 21,
      "title": "Passing a sport pilot practical test",
      "cfr": [
        "14 CFR \u00a7\u00a7 61.309, 61.311, and 61.313"
      ],
      "sourcePage": "A-11",
      "verbatimText": "This endorsement is required by 14 CFR \u00a7 61.317 and is issued by an examiner. I certify that [First name, MI, Last name] has met the requirements of 14 CFR \u00a7\u00a7 61.309, 61.311, and 61.313, and I have determined them proficient to act as pilot in command of [category and class of] aircraft. /s/ [date] Examiner 987654321 RE 12-31-2026",
      "category": "sport-pilot",
      "explanation": "\u2022\tDocuments that the required training and proficiency standard were met.\n\u2022\tSupports the certification record after successful testing.\n\u2022\tShows the outcome is tied to documented preparation, not just test-day performance.",
      "whoIssues": "examiner-only",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.21",
        "passing a sport pilot practical test"
      ],
      "tags": [
        "checkride",
        "sport pilot"
      ],
      "cardExplanation": "Shows the applicant completed the required training and proficiency for passing the sport pilot practical test."
    },
    {
      "id": "A.22",
      "order": 22,
      "title": "Passing a sport pilot practical test with a simplified flight controls limitation",
      "cfr": [
        "14 CFR \u00a7 61.45(g)(4)(ii)"
      ],
      "sourcePage": "A-11",
      "verbatimText": "This endorsement is required by 14 CFR \u00a7 61.45 and is issued by an examiner. I certify that [First name, MI, Last name] has successfully completed the practical test in [category/class/model] with simplified flight controls designation and is authorized to act as pilot in command in [aircraft category/class] limited to [aircraft model] with simplified flight controls designation. /s/ [date] Examiner 987654321 RE 12-31-2026",
      "category": "sport-pilot",
      "explanation": "\u2022\tConnects the qualification to the specific aircraft/control configuration used.\n\u2022\tHelps match the pilot\u2019s privilege to the proper limitation or authorization.\n\u2022\tEnsures the paperwork reflects the actual basis of qualification.",
      "whoIssues": "examiner-only",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.22",
        "passing a sport pilot practical test with a simplified flight controls limitation"
      ],
      "tags": [
        "checkride",
        "sport pilot"
      ],
      "cardExplanation": "Shows the applicant completed the required training and proficiency for passing a sport pilot practical test with a simplified flight controls limitation."
    },
    {
      "id": "A.23",
      "order": 23,
      "title": "Class B, C, or D airspace; at an airport located in Class B, C, or D airspace; or to, from, through, or at an airport having an operational control tower",
      "cfr": [
        "14 CFR \u00a7 61.325"
      ],
      "sourcePage": "A-11",
      "verbatimText": "I certify that [First name, MI, Last name] has received the required training of 14 CFR \u00a7 61.325. I have determined they are proficient to conduct operations in Class B, C, or D airspace; at an airport located in Class B, C, or D airspace; or to, from, through, or at an airport having an operational control tower.",
      "category": "sport-pilot",
      "explanation": "\u2022\tShows the pilot was trained for more complex airspace and airport operations.\n\u2022\tCovers communication, sequencing, and traffic-management demands.\n\u2022\tPrevents higher-workload operations without specific training.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.23",
        "class b",
        "class b, c, or d airspace; at an airport located in class b, c, or d airspace; or to, from, through, or at an airport having an operational control tower"
      ],
      "tags": [
        "sport pilot"
      ],
      "cardExplanation": "Documents the required training, qualification, or authorization for those airspace or airport privileges."
    },
    {
      "id": "A.24",
      "order": 24,
      "title": "Aircraft that has a maximum speed in level flight with maximum continuous power (V H) less than or equal to 87 Knots Calibrated Airspeed (KCAS)",
      "cfr": [
        "14 CFR \u00a7 61.327"
      ],
      "sourcePage": "A-11",
      "verbatimText": "I certify that [First name, MI, Last name] has received the required training in accordance with 14 CFR \u00a7 61.327(a) in a [M/M] aircraft. I have determined them proficient to act as pilot in command of an aircraft that has a V H less than or equal to 87 KCAS.",
      "category": "sport-pilot",
      "explanation": "\u2022\tSeparates lower-performance aircraft from faster ones.\n\u2022\tRecognizes that slower airplanes usually allow more time for planning and correction.\n\u2022\tHelps tie training and privilege level to aircraft performance.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.24",
        "aircraft that has a maximum speed in level flight with maximum continuous power (v h) less than or equal to 87 knots calibrated airspeed (kcas)"
      ],
      "tags": [
        "sport pilot"
      ],
      "cardExplanation": "Documents the required training, qualification, or authorization for aircraft with VH of 87 KCAS or less."
    },
    {
      "id": "A.25",
      "order": 25,
      "title": "Aircraft that has a VH greater than 87 KCAS",
      "cfr": [
        "14 CFR \u00a7 61.327"
      ],
      "sourcePage": "A-11",
      "verbatimText": "I certify that [First name, MI, Last name] has received the required training in accordance with 14 CFR \u00a7 61.327(b) in a [M/M] aircraft. I have determined them proficient to act as pilot in command of an aircraft that has a V H greater than 87 KCAS.",
      "category": "sport-pilot",
      "explanation": "\u2022\tFaster aircraft increase workload and reduce reaction time.\n\u2022\tPilots need stronger energy management and earlier planning in higher-speed airplanes.\n\u2022\tHelps prevent pilots from treating faster aircraft like basic trainers.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.25",
        "aircraft that has a vh greater than 87 kcas"
      ],
      "tags": [
        "sport pilot"
      ],
      "cardExplanation": "Documents the required training, qualification, or authorization for aircraft with VH above 87 KCAS."
    },
    {
      "id": "A.26",
      "order": 26,
      "title": "Flight training at night",
      "cfr": [
        "14 CFR \u00a7 61.329"
      ],
      "sourcePage": "A-12",
      "verbatimText": "I certify that [First Name, MI, Last Name], [grade of pilot certificate], [certificate number], has received the required training at night in a [category and class] aircraft. I have determined they meet all of the requirements of 14 CFR \u00a7 61.329(a) and are proficient to operate as a sport pilot at night.",
      "category": "sport-pilot",
      "explanation": "\u2022\tNight flying includes different risks than daytime flying.\n\u2022\tHelps cover illusions, reduced visual references, and lighting systems.\n\u2022\tBuilds safer judgment for night departures, arrivals, and navigation.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.26",
        "flight training at night"
      ],
      "tags": [
        "sport pilot"
      ],
      "cardExplanation": "Documents the required training, qualification, or authorization for night flight training."
    },
    {
      "id": "A.27",
      "order": 27,
      "title": "To act as pilot in command (PIC) in an aircraft with retractable landing gear",
      "cfr": [
        "14 CFR \u00a7 61.331(a)"
      ],
      "sourcePage": "A-12",
      "verbatimText": "I certify that [First Name, MI, Last Name], [certificate number], has received the required training of 14 CFR \u00a7 61.331(a) in an aircraft with retractable landing gear. I have determined that they are proficient in the operation of an aircraft with retractable landing gear when exercising their sport pilot privileges.",
      "category": "sport-pilot",
      "explanation": "\u2022\tRetractable gear adds systems management and checklist discipline.\n\u2022\tHelps prevent common and costly errors like gear-up landings.\n\u2022\tConfirms the pilot can manage the added complexity safely.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.27",
        "to act as pilot in command (pic) in an aircraft with retractable landing gear"
      ],
      "tags": [
        "sport pilot"
      ],
      "cardExplanation": "Documents the required training and proficiency to act as PIC in an aircraft with retractable landing gear."
    },
    {
      "id": "A.28",
      "order": 28,
      "title": "To act as PIC in an airplane with a manual controllable pitch propeller",
      "cfr": [
        "14 CFR \u00a7 61.331(b)"
      ],
      "sourcePage": "A-12",
      "verbatimText": "I certify that [First Name, MI, Last Name], [certificate number], has received the required training of 14 CFR \u00a7 61.331(b) in an airplane with a controllable pitch propeller. I have determined that they are proficient in the operation of an airplane with a controllable pitch propeller when exercising their sport pilot privileges.",
      "category": "sport-pilot",
      "explanation": "\u2022\tManual propeller control changes engine and performance management.\n\u2022\tThe pilot must understand how settings affect climb, cruise, and descent.\n\u2022\tPrevents misuse by pilots trained only in fixed-pitch trainers.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.28",
        "to act as pic in an airplane with a manual controllable pitch propeller"
      ],
      "tags": [
        "sport pilot"
      ],
      "cardExplanation": "Documents the required training and proficiency to act as PIC in an airplane with a manual controllable pitch propeller."
    },
    {
      "id": "A.29",
      "order": 29,
      "title": "Aeronautical knowledge test",
      "cfr": [
        "14 CFR \u00a7\u00a7 61.35(a)(1), 61.96(b)(3), and 61.97(b)"
      ],
      "sourcePage": "A-12",
      "verbatimText": "I certify that [First name, MI, Last name] has received the required training of 14 CFR \u00a7 61.97(b). I have determined that they are prepared for the [name of] knowledge test.",
      "category": "recreational-pilot",
      "explanation": "\u2022\tCreates a record that the applicant was academically prepared before testing.\n\u2022\tHelps ensure the written exam measures learning, not guesswork.\n\u2022\tSupports instructor accountability for ground preparation.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.29",
        "aeronautical knowledge test"
      ],
      "tags": [
        "knowledge test",
        "recreational pilot"
      ],
      "cardExplanation": "Shows the required ground training or review is complete and the applicant is ready for the knowledge test."
    },
    {
      "id": "A.30",
      "order": 30,
      "title": "Flight proficiency/practical test",
      "cfr": [
        "14 CFR \u00a7\u00a7 61.96(b)(5), 61.98(a) and (b), and 61.99"
      ],
      "sourcePage": "A-12",
      "verbatimText": "The endorsement for a practical test is required in addition to the 14 CFR \u00a7 61.39 endorsements provided in paragraphs A.1 and A.2. I certify that [First name, MI, Last name] has received the required training of 14 CFR \u00a7\u00a7 61.98(b) and 61.99. I have determined that they are prepared for the [name of] practical test.",
      "category": "recreational-pilot",
      "explanation": "\u2022\tServes as the instructor\u2019s formal statement that the applicant is ready to test.\n\u2022\tHelps screen out applicants with unresolved skill or judgment problems.\n\u2022\tSupports the integrity of the practical-test process.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.30",
        "flight proficiency/practical test"
      ],
      "tags": [
        "checkride",
        "recreational pilot"
      ],
      "cardExplanation": "Shows the applicant has the required training and proficiency for the flight proficiency or practical test."
    },
    {
      "id": "A.31",
      "order": 31,
      "title": "Recreational pilot to operate within 50 NM of the airport where training was received",
      "cfr": [
        "14 CFR \u00a7 61.101(b)"
      ],
      "sourcePage": "A-12",
      "verbatimText": "I certify that [First name, MI, Last name] has received the required training of 14 CFR \u00a7 61.101(b). I have determined that they are competent to operate at the [name of airport].",
      "category": "recreational-pilot",
      "explanation": "\u2022\tKeeps the pilot\u2019s operating area tied to a familiar training environment.\n\u2022\tRecognizes that local knowledge matters for a limited-privilege pilot.\n\u2022\tPrevents routine operation beyond the area the pilot was trained for.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.31",
        "recreational pilot to operate within 50 nm of the airport where training was received"
      ],
      "tags": [
        "recreational pilot"
      ],
      "cardExplanation": "Documents the required training, qualification, or authorization for a recreational pilot to operate within 50 NM of the training airport."
    },
    {
      "id": "A.32",
      "order": 32,
      "title": "Recreational pilot to act as PIC on a flight that exceeds 50 NM of the departure airport",
      "cfr": [
        "14 CFR \u00a7 61.101(c)"
      ],
      "sourcePage": "A-13",
      "verbatimText": "I certify that [First name, MI, Last name] has received the required cross-country training of 14 CFR \u00a7 61.101(c). I have determined that they are proficient in cross-country flying of 14 CFR part 61 subpart E.",
      "category": "recreational-pilot",
      "explanation": "\u2022\tGoing farther requires stronger navigation, weather, and diversion planning.\n\u2022\tConfirms the pilot got training beyond basic local-area use.\n\u2022\tHelps manage the added risk of unfamiliar airports and longer routes.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.32",
        "recreational pilot to act as pic on a flight that exceeds 50 nm of the departure airport"
      ],
      "tags": [
        "recreational pilot"
      ],
      "cardExplanation": "Documents the required training, qualification, or authorization for a recreational pilot to act as PIC beyond 50 NM from departure."
    },
    {
      "id": "A.33",
      "order": 33,
      "title": "Recreational pilot with less than 400 flight hours and no logged PIC time within the preceding 180 calendar days",
      "cfr": [
        "14 CFR \u00a7 61.101(g)"
      ],
      "sourcePage": "A-13",
      "verbatimText": "I certify that [First name, MI, Last name] has received the required 180-day recurrent training of 14 CFR \u00a7 61.101(g) in a [M/M] aircraft. I have determined them proficient to act as pilot in command of that aircraft.",
      "category": "recreational-pilot",
      "explanation": "\u2022\tLow total time plus low recent time can raise risk significantly.\n\u2022\tHelps refresh skill and judgment before acting on pilot privileges again.\n\u2022\tAdds oversight when rust may be a major factor.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.33",
        "recreational pilot with less than 400 flight hours and no logged pic time within the preceding 180 calendar days"
      ],
      "tags": [
        "recreational pilot"
      ],
      "cardExplanation": "Documents the required training, qualification, or authorization for this recreational pilot situation."
    },
    {
      "id": "A.34",
      "order": 34,
      "title": "Recreational pilot to conduct solo flights for the purpose of obtaining an additional certificate or rating while under the supervision of an authorized flight instructor",
      "cfr": [
        "14 CFR \u00a7 61.101(j)"
      ],
      "sourcePage": "A-13",
      "verbatimText": "I certify that [First name, MI, Last name] has received the required training of 14 CFR \u00a7 61.87 in a [M/M] aircraft. I have determined they are prepared to conduct a solo flight on [date] under the following conditions: [List all conditions which require endorsement (e.g., flight which requires communication with air traffic control (ATC), flight in an aircraft for which the pilot does not hold a category/class rating, etc.).]",
      "category": "recreational-pilot",
      "explanation": "\u2022\tAllows needed solo experience while still keeping the operation supervised.\n\u2022\tSupports training toward a new certificate or rating without assuming full qualification.\n\u2022\tGives structure and limits during a transition phase.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.34",
        "recreational pilot to conduct solo flights for the purpose of obtaining an additional certificate or rating while under the supervision of an authorized flight instructor"
      ],
      "tags": [
        "recreational pilot",
        "solo"
      ],
      "cardExplanation": "Allows a recreational pilot to make supervised solo flights while working toward an additional certificate or rating."
    },
    {
      "id": "A.35",
      "order": 35,
      "title": "Class B, C, or D airspace; at an airport located in Class B, C, or D airspace; or to, from, through, or at an airport having an operational control tower",
      "cfr": [
        "14 CFR \u00a7 61.101(d)"
      ],
      "sourcePage": "A-13",
      "verbatimText": "I certify that [First name, MI, Last name] has received the required training of 14 CFR \u00a7 61.101(d). I have determined they are proficient to conduct operations in Class B, C, or D airspace; at an airport located in Class B, C, or D airspace; or to, from, through, or at an airport having an operational control tower.",
      "category": "recreational-pilot",
      "explanation": "\u2022\tRequires specific preparation before entering more demanding airspace or towered airports.\n\u2022\tFocuses on communication, sequencing, and traffic awareness.\n\u2022\tHelps keep limited-privilege pilots out of complex environments unless trained.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.35",
        "class b",
        "class b, c, or d airspace; at an airport located in class b, c, or d airspace; or to, from, through, or at an airport having an operational control tower"
      ],
      "tags": [
        "recreational pilot"
      ],
      "cardExplanation": "Documents the required training, qualification, or authorization for those airspace or airport privileges."
    },
    {
      "id": "A.36",
      "order": 36,
      "title": "Aeronautical knowledge test",
      "cfr": [
        "14 CFR \u00a7\u00a7 61.35(a)(1), 61.103(d), and 61.105"
      ],
      "sourcePage": "A-13",
      "verbatimText": "I certify that [First name, MI, Last name] has received the required training in accordance with 14 CFR \u00a7 61.105. I have determined they are prepared for the [name of] knowledge test.",
      "category": "private-pilot",
      "explanation": "\u2022\tConfirms the applicant completed required ground prep before testing.\n\u2022\tHelps improve test readiness and consistency.\n\u2022\tProvides a documented training record for that test path.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.36",
        "aeronautical knowledge test"
      ],
      "tags": [
        "knowledge test",
        "private pilot"
      ],
      "cardExplanation": "Shows the applicant completed the required ground training or review and is ready for the knowledge test."
    },
    {
      "id": "A.37",
      "order": 37,
      "title": "Flight proficiency/practical test",
      "cfr": [
        "14 CFR \u00a7\u00a7 61.103(f), 61.107(b), and 61.109"
      ],
      "sourcePage": "A-14",
      "verbatimText": "The endorsement for a practical test is required in addition to the 14 CFR \u00a7 61.39 endorsements provided in paragraphs A.1 and A.2. I certify that [First name, MI, Last name] has received the required training in accordance with 14 CFR \u00a7\u00a7 61.107 and 61.109. I have determined they are prepared for the [name of] practical test.",
      "category": "private-pilot",
      "explanation": "\u2022\tShows the applicant reached test-level proficiency, not just lesson completion.\n\u2022\tSupports the instructor\u2019s decision to recommend the applicant.\n\u2022\tHelps protect the practical-test process from premature applicants.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.37",
        "flight proficiency/practical test"
      ],
      "tags": [
        "checkride",
        "private pilot"
      ],
      "cardExplanation": "Shows the applicant completed the required training and is proficient for the flight proficiency or practical test."
    },
    {
      "id": "A.38",
      "order": 38,
      "title": "Aeronautical knowledge test",
      "cfr": [
        "14 CFR \u00a7\u00a7 61.35(a)(1), 61.123(c), and 61.125"
      ],
      "sourcePage": "A-14",
      "verbatimText": "I certify that [First name, MI, Last name] has received the required training of 14 CFR \u00a7 61.125. I have determined that they are prepared for the [name of] knowledge test.",
      "category": "commercial-pilot",
      "explanation": "\u2022\tProvides the same check on academic readiness for another certificate or rating path.\n\u2022\tHelps ensure the applicant has the required knowledge foundation.\n\u2022\tKeeps training records complete and consistent.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.38",
        "aeronautical knowledge test"
      ],
      "tags": [
        "commercial pilot",
        "knowledge test"
      ],
      "cardExplanation": "Shows the applicant completed the required ground training or review and is ready for the knowledge test."
    },
    {
      "id": "A.39",
      "order": 39,
      "title": "Flight proficiency/practical test",
      "cfr": [
        "14 CFR \u00a7\u00a7 61.123(e), 61.127, and 61.129"
      ],
      "sourcePage": "A-14",
      "verbatimText": "The endorsement for a practical test is required in addition to the 14 CFR \u00a7 61.39 endorsements provided in paragraphs A.1 and A.2. I certify that [First name, MI, Last name] has received the required training of 14 CFR \u00a7\u00a7 61.127 and 61.129. I have determined that they are prepared for the [name of] practical test.",
      "category": "commercial-pilot",
      "explanation": "\u2022\tDocuments readiness for evaluation under that certificate or rating path.\n\u2022\tShows the applicant was screened by an instructor before testing.\n\u2022\tHelps align training completion with FAA evaluation standards.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.39",
        "flight proficiency/practical test"
      ],
      "tags": [
        "checkride",
        "commercial pilot"
      ],
      "cardExplanation": "Shows the applicant completed the required training and is proficient for the flight proficiency or practical test."
    },
    {
      "id": "A.40",
      "order": 40,
      "title": "Restricted privileges ATP Certificate, Airplane Multiengine Land (AMEL) rating",
      "cfr": [
        "14 CFR \u00a7 61.160"
      ],
      "sourcePage": "A-14",
      "verbatimText": "This certifying statement can only be provided by an authorized institution of higher education in accordance with its Letter of Authorization (LOA). Refer to AC 61-139, Institution of Higher Education\u2019s Application for Authority to Certify its Graduates for an Airline Transport Pilot Certificate with Reduced Aeronautical Experience. The [insert institution\u2019s name] certifies that the recipient of this degree has successfully completed all of the aviation coursework requirements of 14 CFR \u00a7 61.160[(b), (c), or (d)] and therefore meets the academic eligibility requirements of 14 CFR \u00a7 61.160[(b), (c), or (d)].",
      "category": "atp",
      "explanation": "\u2022\tRestricted ATP pathways have strict eligibility rules that must be documented.\n\u2022\tConnects the applicant to the correct ATP route and standard.\n\u2022\tHelps ensure the certificate is issued under the proper authority and basis.",
      "whoIssues": "approved-institution",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.40",
        "r-atp",
        "restricted atp",
        "restricted privileges atp certificate, airplane multiengine land (amel) rating"
      ],
      "tags": [
        "atp"
      ],
      "cardExplanation": "Documents the required training, qualification, or authorization for a restricted-privileges ATP AMEL certificate."
    },
    {
      "id": "A.41",
      "order": 41,
      "title": "ATP Certification Training Program (CTP)",
      "cfr": [
        "14 CFR \u00a7 61.153(e)"
      ],
      "sourcePage": "A-14",
      "verbatimText": "This endorsement is only provided by an approved training provider of an ATP CTP and is found on the graduation certificate a pilot receives following completion of that training in accordance with 14 CFR \u00a7 61.156. Refer to AC 61-138, Airline Transport Pilot Certification Training Program. The applicant named above has successfully completed the Airline Transport Pilot Certification Training Program as required by 14 CFR \u00a7 61.156, and therefore has met the prerequisite required by 14 CFR \u00a7 61.35(a)(2) for the Airline Transport Pilot Multiengine Airplane Knowledge Test.",
      "category": "atp",
      "explanation": "\u2022\tATP-level operations require knowledge beyond typical GA training.\n\u2022\tCovers advanced topics like high-altitude operations, systems, and transport-style concepts.\n\u2022\tCreates a common baseline before ATP written testing.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.41",
        "atp certification training program (ctp)",
        "atp ctp"
      ],
      "tags": [
        "atp"
      ],
      "cardExplanation": "Documents completion of the required ATP Certification Training Program."
    },
    {
      "id": "A.42",
      "order": 42,
      "title": "Aeronautical knowledge test",
      "cfr": [
        "14 CFR \u00a7\u00a7 61.35(a)(1) and 61.65(a) and (b)"
      ],
      "sourcePage": "A-15",
      "verbatimText": "I certify that [First name, MI, Last name] has received the required training of 14 CFR \u00a7 61.65(b). I have determined that they are prepared for the Instrument\u2013[airplane, helicopter, or powered-lift] knowledge test.",
      "category": "instrument-rating",
      "explanation": "\u2022\tConfirms the applicant was prepared for the ATP-level written exam.\n\u2022\tSupports testing in more advanced subject areas than lower certificates require.\n\u2022\tHelps ensure the applicant did not skip formal academic preparation.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.42",
        "aeronautical knowledge test"
      ],
      "tags": [
        "instrument rating",
        "knowledge test"
      ],
      "cardExplanation": "Shows the applicant completed the required ground training or review and is ready for the knowledge test."
    },
    {
      "id": "A.43",
      "order": 43,
      "title": "Flight proficiency/practical test",
      "cfr": [
        "14 CFR \u00a7 61.65(a)(6)"
      ],
      "sourcePage": "A-15",
      "verbatimText": "I certify that [First name, MI, Last name] has received the required training of 14 CFR \u00a7 61.65(c) and (d). I have determined they are prepared for the Instrument\u2013[airplane, helicopter, or powered-lift] practical test.",
      "category": "instrument-rating",
      "explanation": "\u2022\tDocuments readiness for ATP-level evaluation.\n\u2022\tSupports the applicant\u2019s eligibility for one of the highest certification levels.\n\u2022\tHelps show the applicant was trained to a polished, professional standard.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.43",
        "flight proficiency/practical test"
      ],
      "tags": [
        "checkride",
        "instrument rating"
      ],
      "cardExplanation": "Shows the applicant completed the required training and is proficient for the flight proficiency or practical test."
    },
    {
      "id": "A.44",
      "order": 44,
      "title": "Prerequisites for instrument practical tests",
      "cfr": [
        "14 CFR \u00a7 61.39(a)"
      ],
      "sourcePage": "A-15",
      "verbatimText": "I certify that [First name, MI, Last name] has received and logged the required flight time/training of 14 CFR \u00a7 61.39(a) in preparation for the practical test within 2 calendar months preceding the date of the test and has satisfactory knowledge of the subject areas in which they were shown to be deficient by the FAA Airman Knowledge Test Report. I have determined they are prepared for the Instrument\u2013[airplane, helicopter, or powered-lift] practical test.",
      "category": "instrument-rating",
      "explanation": "\u2022\tInstrument flying depends on precise procedures and solid judgment.\n\u2022\tCombines recent checkride prep with review of written-test weak areas.\n\u2022\tThe 2-calendar-month limit keeps instrument skills and knowledge fresh.",
      "whoIssues": "standard-cfi",
      "expiration": "2-calendar-months",
      "perFlight": false,
      "aliases": [
        "a.44",
        "prerequisites for instrument practical tests"
      ],
      "tags": [
        "checkride",
        "instrument rating"
      ],
      "cardExplanation": "Combines the instrument practical-test recommendation with review of knowledge-test deficiencies. Valid for 2 calendar months."
    },
    {
      "id": "A.45",
      "order": 45,
      "title": "Fundamentals of instructing knowledge test",
      "cfr": [
        "14 CFR \u00a7 61.183(d)"
      ],
      "sourcePage": "A-15",
      "verbatimText": "I certify that [First name, MI, Last name] has received the required fundamentals of instruction training of 14 CFR \u00a7 61.185(a)(1). I have determined that they are prepared for the Fundamentals of Instructing knowledge test.",
      "category": "flight-instructor",
      "explanation": "\u2022\tGood flying skill does not automatically mean good teaching skill.\n\u2022\tFOI builds the foundation for how instructors teach, evaluate, and correct errors.\n\u2022\tHelps future instructors understand how students learn.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.45",
        "fundamentals of instructing knowledge test"
      ],
      "tags": [
        "flight instructor",
        "knowledge test"
      ],
      "cardExplanation": "Shows the applicant completed the required ground training or review and is ready for the FOI knowledge test."
    },
    {
      "id": "A.46",
      "order": 46,
      "title": "Flight instructor aeronautical knowledge test",
      "cfr": [
        "14 CFR \u00a7 61.183(f)"
      ],
      "sourcePage": "A-15",
      "verbatimText": "I certify that [First name, MI, Last name] has received the required training of 14 CFR \u00a7 61.185(a)[(2) or (3) (as appropriate to the flight instructor rating sought)]. I have determined that they are prepared for the [name of] knowledge test.",
      "category": "flight-instructor",
      "explanation": "\u2022\tA flight instructor must explain material clearly, not just know it personally.\n\u2022\tConfirms the applicant is prepared for the instructor-level knowledge exam.\n\u2022\tSupports safe teaching of regulations, systems, procedures, and aerodynamics.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.46",
        "flight instructor aeronautical knowledge test"
      ],
      "tags": [
        "flight instructor",
        "knowledge test"
      ],
      "cardExplanation": "Shows the applicant completed the required ground training or review and is ready for the flight instructor knowledge test."
    },
    {
      "id": "A.47",
      "order": 47,
      "title": "Flight instructor ground and flight proficiency/practical test",
      "cfr": [
        "14 CFR \u00a7 61.183(g)"
      ],
      "sourcePage": "A-15",
      "verbatimText": "I certify that [First name, MI, Last name] has received the required training of 14 CFR \u00a7 61.187(b). I have determined that they are prepared for the certificated flight instructor \u2013 [aircraft category and class] practical test. Note: The endorsement for a practical test is required in addition to the 14 CFR \u00a7 61.39 endorsements provided in endorsements 1 and 2 (see paragraphs A.1 and A.2).",
      "category": "flight-instructor",
      "explanation": "\u2022\tThis is about readiness to teach as well as fly.\n\u2022\tThe applicant must demonstrate instruction skill, analysis, and professional judgment.\n\u2022\tHelps ensure future students are trained by someone who can both do and teach.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.47",
        "flight instructor ground and flight proficiency/practical test"
      ],
      "tags": [
        "checkride",
        "flight instructor"
      ],
      "cardExplanation": "Shows the applicant completed the required training and is proficient for the flight instructor practical test."
    },
    {
      "id": "A.48",
      "order": 48,
      "title": "Flight instructor certificate with instrument\u2013(category/class) rating/practical test",
      "cfr": [
        "14 CFR \u00a7\u00a7 61.183(g) and 61.187(a) and (b)(7)"
      ],
      "sourcePage": "A-16",
      "verbatimText": "The endorsement for a practical test is required in addition to the 14 CFR \u00a7 61.39 endorsements provided in endorsements 1 and 2 (see paragraphs A.1 and A.2). I certify that [First name, MI, Last name] has received the required certificated flight instructor - instrument training of 14 CFR \u00a7 61.187(b)(7). I have determined they are prepared for the certificated flight instructor - instrument\u2013[airplane, helicopter, or powered-lift] practical test.",
      "category": "flight-instructor",
      "explanation": "\u2022\tInstrument instruction requires a very high standard of precision.\n\u2022\tThe instructor must teach approaches, holds, scan, procedures, and regulations accurately.\n\u2022\tHelps protect students in one of the least forgiving training environments.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.48",
        "flight instructor certificate with instrument\u2013(category/class) rating/practical test"
      ],
      "tags": [
        "checkride",
        "flight instructor"
      ],
      "cardExplanation": "Shows the applicant completed the required training and is proficient for the CFII practical test in that category/class."
    },
    {
      "id": "A.49",
      "order": 49,
      "title": "Spin training",
      "cfr": [
        "14 CFR \u00a7 61.183(i)(1)"
      ],
      "sourcePage": "A-16",
      "verbatimText": "The spin training endorsement is only required of flight instructor airplane and flight instructor glider applicants. I certify that [First name, MI, Last name] has received the required training of 14 CFR \u00a7 61.183(i) in [an airplane, a glider]. I have determined that they are competent and possess instructional proficiency in stall awareness, spin entry, spins, and spin recovery procedures.",
      "category": "flight-instructor",
      "explanation": "\u2022\tFlight instructors teach stalls and loss-of-control awareness.\n\u2022\tSpin training helps them recognize, prevent, and explain spin-related risks.\n\u2022\tSupports safer instruction in stall and upset topics.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.49",
        "spin training"
      ],
      "tags": [
        "flight instructor"
      ],
      "cardExplanation": "Documents the required spin training for the applicable flight instructor applicant."
    },
    {
      "id": "A.50",
      "order": 50,
      "title": "Helicopter Touchdown Autorotation",
      "cfr": [
        "FAA-S-8081-7, Flight Instructor Practical Test Standards for Rotorcraft Category Gyroplane Rating"
      ],
      "sourcePage": "A-16",
      "verbatimText": "I certify that [First name, MI, Last name] has received training in straight-in autorotations in a single engine helicopter and autorotation with turns in a single engine helicopter to include touchdown. I have determined that they are competent in instructional knowledge relating to the elements, common errors, performance, and correction of common errors related to straight-in autorotations in a single engine helicopter and autorotation with turns in a single engine helicopter.",
      "category": "flight-instructor",
      "explanation": "\u2022\tAutorotation is a critical emergency procedure in helicopters.\n\u2022\tTouchdown autorotation requires precise energy and rotor management through landing.\n\u2022\tBuilds skill for one of the most important power-loss responses in rotorcraft.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.50",
        "helicopter touchdown autorotation",
        "touchdown autorotation"
      ],
      "tags": [
        "flight instructor"
      ],
      "cardExplanation": "Documents the required training, qualification, or authorization for helicopter touchdown autorotation."
    },
    {
      "id": "A.51",
      "order": 51,
      "title": "Fundamentals of instructing knowledge test",
      "cfr": [
        "14 CFR \u00a7 61.405(a)(1)"
      ],
      "sourcePage": "A-16",
      "verbatimText": "I certify that [First name, MI, Last name] has received the required training in accordance with 14 CFR \u00a7 61.405(a)(1). I have determined that they are prepared for the Fundamentals of Instructing knowledge test.",
      "category": "sport-pilot-instructor",
      "explanation": "\u2022\tTeaching skill still requires formal understanding of how people learn.\n\u2022\tHelps future instructors organize lessons, communicate clearly, and correct errors.\n\u2022\tSupports safer and more effective instruction.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.51",
        "fundamentals of instructing knowledge test"
      ],
      "tags": [
        "knowledge test",
        "sport pilot instructor"
      ],
      "cardExplanation": "Shows the applicant completed the required ground training or review and is ready for the FOI knowledge test."
    },
    {
      "id": "A.52",
      "order": 52,
      "title": "Sport pilot flight instructor aeronautical knowledge test",
      "cfr": [
        "14 CFR \u00a7\u00a7 61.35(a)(1) and 61.405(a)"
      ],
      "sourcePage": "A-16",
      "verbatimText": "I certify that [First name, MI, Last name] has received the required training of 14 CFR \u00a7 61.405(a)(2). I have determined that they are prepared for the [name of the knowledge test].",
      "category": "sport-pilot-instructor",
      "explanation": "\u2022\tSport pilot instructors still carry real instructional responsibility.\n\u2022\tConfirms readiness in regulations, privileges, limitations, and teaching knowledge.\n\u2022\tPrevents the assumption that simpler aircraft mean simpler teaching standards.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.52",
        "sport pilot flight instructor aeronautical knowledge test"
      ],
      "tags": [
        "knowledge test",
        "sport pilot instructor"
      ],
      "cardExplanation": "Shows the applicant completed the required ground training or review and is ready for the sport pilot flight instructor knowledge test."
    },
    {
      "id": "A.53",
      "order": 53,
      "title": "Flight instructor with a sport pilot rating flight proficiency check for additional category/class",
      "cfr": [
        "14 CFR \u00a7\u00a7 61.409 and 61.419"
      ],
      "sourcePage": "A-17",
      "verbatimText": "I certify that [First name, MI, Last name] has received the required training in accordance with 14 CFR \u00a7\u00a7 61.409 and 61.419 and have determined that they are prepared for a proficiency check for the flight instructor with a sport pilot rating in a [aircraft category and class]. Note: Cannot be provided to applicants seeking an airplane or helicopter privilege. Must successfully accomplish a practical test per 14 CFR \u00a7 61.419(e).",
      "category": "sport-pilot-instructor",
      "explanation": "\u2022\tAn added category or class changes what the instructor may teach.\n\u2022\tConfirms training and readiness for that expanded authority.\n\u2022\tPrevents automatic carryover of teaching privileges without qualification.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.53",
        "flight instructor with a sport pilot rating flight proficiency check for additional category/class"
      ],
      "tags": [
        "checkride",
        "sport pilot instructor"
      ],
      "cardExplanation": "Shows the applicant completed the required training and is proficient for the additional category/class flight proficiency check."
    },
    {
      "id": "A.54",
      "order": 54,
      "title": "Flight instructor with a sport pilot rating proficiency check completion endorsement for additional category or class privilege",
      "cfr": [
        "14 CFR \u00a7\u00a7 61.409 and 61.419"
      ],
      "sourcePage": "A-17",
      "verbatimText": "I certify that [First name, MI, Last name] has successfully completed a proficiency check in accordance with 14 CFR \u00a7\u00a7 61.409 and 61.419. I have determined that they are proficient and authorized for the additional [aircraft category and class] flight instructor privilege. Note: Not applicable to the airplane or helicopter privilege. Must successfully accomplish a practical test per 14 CFR \u00a7 61.419(e).",
      "category": "sport-pilot-instructor",
      "explanation": "\u2022\tCreates a record that the added privilege was successfully completed.\n\u2022\tDistinguishes between starting training and actually qualifying.\n\u2022\tSupports proper documentation of expanded instructional authority.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.54",
        "flight instructor with a sport pilot rating proficiency check completion endorsement for additional category or class privilege"
      ],
      "tags": [
        "sport pilot instructor"
      ],
      "cardExplanation": "Shows the applicant completed the required training and proficiency for the added category or class privilege."
    },
    {
      "id": "A.55",
      "order": 55,
      "title": "Flight instructor with a sport pilot rating practical test endorsement",
      "cfr": [
        "14 CFR \u00a7\u00a7 61.409 and 61.411"
      ],
      "sourcePage": "A-17",
      "verbatimText": "An endorsement is required in addition to the 14 CFR \u00a7 61.39 endorsements provided in paragraphs A.1 and A.2. I certify that [First name, MI, Last name] has received the required training of 14 CFR \u00a7 61.409 and met the aeronautical experience requirements of 14 CFR \u00a7 61.411. I have determined that they are prepared for the flight instructor with a sport pilot rating practical test in a [aircraft category and class]. /s/ [date] S. P. [Instructor name] 987654321 RE 12-31-2026",
      "category": "sport-pilot-instructor",
      "explanation": "\u2022\tShows the applicant reached practical-test readiness for that instructor certificate.\n\u2022\tServes as the recommending instructor\u2019s formal approval to test.\n\u2022\tHelps ensure the examiner receives a qualified applicant.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.55",
        "flight instructor with a sport pilot rating practical test endorsement"
      ],
      "tags": [
        "checkride",
        "sport pilot instructor"
      ],
      "cardExplanation": "Shows the applicant completed the required training and is proficient for the practical test."
    },
    {
      "id": "A.56",
      "order": 56,
      "title": "Flight instructor with a sport pilot rating practical test completion endorsement",
      "cfr": [
        "14 CFR \u00a7\u00a7 61.409 and 61.411"
      ],
      "sourcePage": "A-17",
      "verbatimText": "This endorsement is required by 14 CFR \u00a7 61.417 and is issued by an authorized evaluator. I certify that [First name, MI, Last name] has met the requirements in accordance with 14 CFR \u00a7\u00a7 61.409 and 61.411 and successfully completed the practical test. I have determined that they are proficient and authorized for the [aircraft category and class] flight instructor privilege. /s/ [date] S. P. [Examiner name] 987654321 RE 12-31-2026",
      "category": "sport-pilot-instructor",
      "explanation": "\u2022\tDocuments that the training and proficiency tied to the test were completed.\n\u2022\tSupports the certification record for the new authority granted.\n\u2022\tConfirms the applicant moved beyond training into qualification.",
      "whoIssues": "examiner-only",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.56",
        "flight instructor with a sport pilot rating practical test completion endorsement"
      ],
      "tags": [
        "checkride",
        "sport pilot instructor"
      ],
      "cardExplanation": "Shows the applicant completed the required training and proficiency for the practical test."
    },
    {
      "id": "A.57",
      "order": 57,
      "title": "Flight instructor with a sport pilot rating to train sport pilots on flight by reference to instruments",
      "cfr": [
        "14 CFR \u00a7 61.412"
      ],
      "sourcePage": "A-17",
      "verbatimText": "This endorsement from an instructor certificated under 14 CFR part 61 subpart H to a flight instructor with a sport pilot rating (14 CFR part 61 subpart K) authorizes the 14 CFR part 61 subpart K instructor to train sport pilot candidates on control and maneuvering an airplane solely by reference to the instruments. I certify that I have given [First name, MI, Last name] 3 hours of flight training and 1 hour of ground instruction specific to providing flight training on control and maneuvering an airplane solely by reference to the instruments in accordance with 14 CFR \u00a7 61.412. I have determined that they are proficient and authorized to provide training on control and maneuvering an airplane solely by reference to the flight instruments to this instructor\u2019s sport pilot candidate, who intends to operate an aircraft with a V H greater than 87 KCAS on a cross-country flight. /s/ [date] Subpart H Instructor 987654321 RE 12-31-2026",
      "category": "sport-pilot-instructor",
      "explanation": "\u2022\tEven limited instrument-reference training can be safety-critical.\n\u2022\tHelps ensure the instructor can teach unusual attitude and reference-to-instruments skills correctly.\n\u2022\tPrevents unsafe habits from forming in students.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.57",
        "flight instructor with a sport pilot rating to train sport pilots on flight by reference to instruments"
      ],
      "tags": [
        "sport pilot instructor"
      ],
      "cardExplanation": "Documents the required training, qualification, or authorization to teach sport pilots instrument-reference flight."
    },
    {
      "id": "A.58",
      "order": 58,
      "title": "Spin training",
      "cfr": [
        "14 CFR \u00a7 61.405(b)(1)(ii)"
      ],
      "sourcePage": "A-18",
      "verbatimText": "This spin training endorsement is only required for flight instructor airplane and flight instructor glider applicants. I certify that [First name, MI, Last name] has received the required training of 14 CFR \u00a7 61.405(b)(1)(ii). I have determined that they are competent and possess instructional proficiency in stall awareness, spin entry, spins, and spin recovery procedures.",
      "category": "sport-pilot-instructor",
      "explanation": "\u2022\tGives the applicable instructor candidate a deeper understanding of stall/spin risk.\n\u2022\tSupports safer teaching of loss-of-control prevention topics.\n\u2022\tHelps instructors recognize and address dangerous student habits early.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.58",
        "spin training"
      ],
      "tags": [
        "sport pilot instructor"
      ],
      "cardExplanation": "Documents the required spin training for the applicable flight instructor applicant."
    },
    {
      "id": "A.59",
      "order": 59,
      "title": "Ground instructor who does not meet the recent experience requirements",
      "cfr": [
        "14 CFR \u00a7 61.217(d)"
      ],
      "sourcePage": "A-18",
      "verbatimText": "This endorsement is issued by an authorized instructor (ground or flight) as defined in 14 CFR \u00a7 61.1(b). I certify that [First name, MI, Last name] has demonstrated knowledge in the subject areas prescribed for a [basic, advanced, instrument] ground instructor under 14 CFR \u00a7 61.213(a)(3) and (a)(4), as appropriate.",
      "category": "additional-recurrent",
      "explanation": "\u2022\tTeaching skill and knowledge can fade when not used.\n\u2022\tHelps restore confidence that the instructor is current enough to teach again.\n\u2022\tProtects students from outdated or rusty instruction.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.59",
        "ground instructor who does not meet the recent experience requirements"
      ],
      "tags": [
        "additional recurrent"
      ],
      "cardExplanation": "Documents the required training, qualification, or authorization for a ground instructor who does not meet recent experience requirements."
    },
    {
      "id": "A.60",
      "order": 60,
      "title": "R-22/R-44 ground training",
      "cfr": [
        "SFAR 73, section 2(a)(1) or (2)"
      ],
      "sourcePage": "A-18",
      "verbatimText": "I certify that [First name, MI, Last name, Pilot Certificate No. ] has received the ground training required by SFAR 73, section 2(a)(3)(i)\u2013(v).",
      "category": "robinson-sfar73",
      "explanation": "\u2022\tRobinson helicopters have special handling concerns and SFAR-specific requirements.\n\u2022\tHelps cover safety-critical topics like rotor RPM, low-G hazards, and model-specific limits.\n\u2022\tBuilds the knowledge needed before operating those aircraft.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.60",
        "r-22/r-44 ground training"
      ],
      "tags": [
        "robinson",
        "robinson sfar73"
      ],
      "cardExplanation": "Documents the required ground training for the R-22 or R-44."
    },
    {
      "id": "A.61",
      "order": 61,
      "title": "R-22 solo endorsement",
      "cfr": [
        "SFAR 73, section 2(b)(3)"
      ],
      "sourcePage": "A-18",
      "verbatimText": "I certify that [First name, MI, Last name, Pilot Certificate No. ] meets the experience requirements of SFAR 73, section 2(b)(3) and has been given training specified by SFAR 73, section 2(b)(3)(i)\u2013(iv). They have been found proficient to solo the R-22 helicopter.",
      "category": "robinson-sfar73",
      "explanation": "\u2022\tSolo in an R-22 requires more than general helicopter training.\n\u2022\tConfirms the student was trained specifically in that model before flying alone.\n\u2022\tSupports safer solo use in an aircraft with special requirements.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.61",
        "r-22 solo endorsement"
      ],
      "tags": [
        "robinson",
        "robinson sfar73",
        "solo"
      ],
      "cardExplanation": "Allows solo flight in an R-22 after the required training and proficiency."
    },
    {
      "id": "A.62",
      "order": 62,
      "title": "R-22 PIC endorsement",
      "cfr": [
        "SFAR 73, section 2(b)(1)(ii)"
      ],
      "sourcePage": "A-19",
      "verbatimText": "I certify that [First name, MI, Last name, Pilot Certificate No. ] has been given training specified by SFAR 73, section 2(b)(1)(ii)(A)\u2013(D) for Robinson R-22 helicopters and is proficient to act as pilot in command. An annual flight review must be completed by [date 12 calendar months after date of this endorsement] unless the requirements of SFAR 73, section 2(b)(1)(i) are met.",
      "category": "robinson-sfar73",
      "explanation": "\u2022\tActing as PIC in an R-22 requires model-specific qualification.\n\u2022\tHelps ensure the pilot understands the aircraft\u2019s special risks and handling.\n\u2022\tPrevents pilots from relying only on general rotorcraft experience.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.62",
        "r-22 pic endorsement"
      ],
      "tags": [
        "robinson",
        "robinson sfar73"
      ],
      "cardExplanation": "Documents the required training and proficiency to act as PIC in an R-22."
    },
    {
      "id": "A.63",
      "order": 63,
      "title": "R-22 flight instructor endorsement",
      "cfr": [
        "SFAR 73, section 2(b)(5)(iv)"
      ],
      "sourcePage": "A-19",
      "verbatimText": "This endorsement may only be issued by an FAA aviation safety inspector (ASI) or authorized designated examiner per SFAR 73, section 2(b)(5)(iv). I certify that [First name, MI, Last name], holder of CFI Certificate No. [ ], meets the experience requirements and has completed the flight training specified by SFAR 73, section 2(b)(5)(i)\u2013(ii) and (iii)(A)\u2013(D), and has demonstrated an ability to provide instruction on the general subject areas of SFAR 73, section 2(a)(3) and the flight training identified in SFAR 73, section 2(b)(5)(iii) in a Robinson R-22 helicopter. /s/ [date] J. J. Jones DPE Designation Number, Exp. 12-31-2026; or /s/ [date] I. M. Inspector FAA Aviation Safety Inspector",
      "category": "robinson-sfar73",
      "explanation": "\u2022\tTeaching in an R-22 requires deeper model-specific knowledge and judgment.\n\u2022\tHelps ensure the instructor can train others safely in that aircraft.\n\u2022\tSupports standardization and risk control in Robinson instruction.",
      "whoIssues": "dpe-or-asi-only",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.63",
        "r-22 flight instructor endorsement"
      ],
      "tags": [
        "robinson",
        "robinson sfar73"
      ],
      "cardExplanation": "Documents the required training and qualification to instruct in an R-22."
    },
    {
      "id": "A.64",
      "order": 64,
      "title": "Flight review in an R-22 helicopter",
      "cfr": [
        "SFAR 73, section 2(c)(1) and (3)"
      ],
      "sourcePage": "A-19",
      "verbatimText": "I certify that [First name, MI, Last name, Pilot Certificate No. ] has satisfactorily completed the flight review in an R-22 required by 14 CFR \u00a7 61.56 and SFAR 73, section 2(c)(1) and (3), on [date of flight review].",
      "category": "robinson-sfar73",
      "explanation": "\u2022\tKeeps proficiency tied to the actual model flown.\n\u2022\tHelps refresh handling and safety issues specific to the R-22.\n\u2022\tRecognizes that general helicopter currency may not be enough.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.64",
        "flight review in an r-22 helicopter"
      ],
      "tags": [
        "robinson",
        "robinson sfar73"
      ],
      "cardExplanation": "Documents completion of a flight review in an R-22."
    },
    {
      "id": "A.65",
      "order": 65,
      "title": "R-44 solo endorsement",
      "cfr": [
        "SFAR 73, section 2(b)(4)"
      ],
      "sourcePage": "A-19",
      "verbatimText": "I certify that [First name, MI, Last name, Pilot Certificate No. ] meets the experience requirements of SFAR 73, section 2(b)(4) and has been given training specified by SFAR 73, section 2(b)(4)(i)\u2013(iv). They have been found proficient to solo the R-44 helicopter.",
      "category": "robinson-sfar73",
      "explanation": "\u2022\tConfirms the student received model-specific training before soloing the R-44.\n\u2022\tHelps ensure solo authority matches actual aircraft competence.\n\u2022\tSupports safer solo transition into that helicopter.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.65",
        "r-44 solo endorsement"
      ],
      "tags": [
        "robinson",
        "robinson sfar73",
        "solo"
      ],
      "cardExplanation": "Allows solo flight in an R-44 after the required training and proficiency."
    },
    {
      "id": "A.66",
      "order": 66,
      "title": "R-44 PIC endorsement",
      "cfr": [
        "SFAR 73, section 2(b)(2)(ii)"
      ],
      "sourcePage": "A-19",
      "verbatimText": "I certify that [First name, MI, Last name, Pilot Certificate No. ] has been given training specified by SFAR 73, section 2(b)(2)(ii)(A)\u2013(D) for Robinson R-44 helicopters and is proficient to act as pilot in command. An annual flight review must be completed by [date 12 calendar months after date of this endorsement] unless the requirements of SFAR 73, section 2(b)(2)(i) are met.",
      "category": "robinson-sfar73",
      "explanation": "\u2022\tPIC authority in the R-44 requires training beyond general helicopter skill.\n\u2022\tHelps the pilot understand model-specific procedures and risks.\n\u2022\tProvides a clear record of qualification in that helicopter.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.66",
        "r-44 pic endorsement"
      ],
      "tags": [
        "robinson",
        "robinson sfar73"
      ],
      "cardExplanation": "Documents the required training and proficiency to act as PIC in an R-44."
    },
    {
      "id": "A.67",
      "order": 67,
      "title": "R-44 flight instructor endorsement",
      "cfr": [
        "SFAR 73, section 2(b)(5)(iv)"
      ],
      "sourcePage": "A-19",
      "verbatimText": "This endorsement may only be issued by an FAA ASI or authorized Designated Pilot Examiner (DPE) per SFAR 73, section 2(b)(5)(iv). I certify that [First name, MI, Last name], holder of CFI Certificate No. [ ], meets the experience requirements and has completed the flight training specified by SFAR 73, section 2(b)(5)(i)\u2013(ii) and (iii)(A)\u2013(D), and has demonstrated an ability to provide instruction on the general subject areas of SFAR 73, section 2(a)(3) and the flight training identified in SFAR 73, section 2(b)(5)(iii) in a Robinson R-44 helicopter. /s/ [date] J. J. Jones DPE Designation Number, Exp. 12-31-2026; or /s/ [date] I. M. Inspector FAA Aviation Safety Inspector",
      "category": "robinson-sfar73",
      "explanation": "\u2022\tTeaching in the R-44 requires specific qualification and standardization.\n\u2022\tHelps ensure instructors can teach safe procedures in that aircraft.\n\u2022\tReduces the chance of poor model-specific training being passed on.",
      "whoIssues": "dpe-or-asi-only",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.67",
        "r-44 flight instructor endorsement"
      ],
      "tags": [
        "robinson",
        "robinson sfar73"
      ],
      "cardExplanation": "Documents the required training and qualification to instruct in an R-44."
    },
    {
      "id": "A.68",
      "order": 68,
      "title": "Flight review in an R-44 helicopter",
      "cfr": [
        "SFAR 73, section 2(c)(2) and (3)"
      ],
      "sourcePage": "A-20",
      "verbatimText": "I certify that [First name, MI, Last name, Pilot Certificate No. ] has satisfactorily completed the flight review in an R-44 required by 14 CFR \u00a7 61.56 and SFAR 73, section 2(c)(2) and (3), on [date of flight review].",
      "category": "robinson-sfar73",
      "explanation": "\u2022\tKeeps review and proficiency tied to the model actually operated.\n\u2022\tHelps refresh aircraft-specific handling, procedures, and risk awareness.\n\u2022\tSupports safer continued operation in the R-44.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.68",
        "flight review in an r-44 helicopter"
      ],
      "tags": [
        "robinson",
        "robinson sfar73"
      ],
      "cardExplanation": "Documents completion of a flight review in an R-44."
    },
    {
      "id": "A.69",
      "order": 69,
      "title": "Completion of a flight review",
      "cfr": [
        "14 CFR \u00a7 61.56(a) and (c)"
      ],
      "sourcePage": "A-20",
      "verbatimText": "No logbook entry reflecting unsatisfactory performance on a flight review is required. I certify that [First name, MI, Last name], [grade of pilot certificate], [certificate number], has satisfactorily completed a flight review of 14 CFR \u00a7 61.56(a) on [date].",
      "category": "additional-recurrent",
      "explanation": "\u2022\tThe flight review is the FAA\u2019s basic periodic proficiency checkpoint for most pilots.\n\u2022\tHelps catch drift in skills, procedures, and knowledge before it leads to accidents.\n\u2022\tConfirms the pilot can still safely exercise certificate privileges.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.69",
        "bfr",
        "biennial flight review",
        "completion of a flight review",
        "flight review"
      ],
      "tags": [
        "additional recurrent",
        "recurrent"
      ],
      "cardExplanation": "Shows a flight review is complete and the instructor found the pilot able to safely use certificate privileges."
    },
    {
      "id": "A.70",
      "order": 70,
      "title": "Completion of any phase of an FAA-sponsored Pilot Proficiency Program (WINGS)",
      "cfr": [
        "14 CFR \u00a7 61.56(e)"
      ],
      "sourcePage": "A-20",
      "verbatimText": "I certify that [First name, MI, Last name], [grade of pilot certificate], [certificate number], has satisfactorily completed Level: [Basic/Advanced/Master, as appropriate],",
      "category": "additional-recurrent",
      "explanation": "\u2022\tEncourages ongoing training instead of waiting until the last minute for a flight review.\n\u2022\tOften provides more frequent practice in safety-critical skills.\n\u2022\tRewards continued proficiency development with a flight review substitute.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.70",
        "completion of any phase of an faa-sponsored pilot proficiency program (wings)",
        "wings"
      ],
      "tags": [
        "additional recurrent",
        "recurrent"
      ],
      "cardExplanation": "Documents completion of a qualifying WINGS phase that can substitute for a flight review."
    },
    {
      "id": "A.71",
      "order": 71,
      "title": "Completion of an instrument proficiency check (IPC)",
      "cfr": [
        "14 CFR \u00a7 61.57(d)"
      ],
      "sourcePage": "A-20",
      "verbatimText": "No logbook entry reflecting unsatisfactory performance on an IPC is required. I certify that [First name, MI, Last name], [grade of pilot certificate], [certificate number], has satisfactorily completed the instrument proficiency check of 14 CFR \u00a7 61.57(d) in a [M/M] aircraft on [date].",
      "category": "additional-recurrent",
      "explanation": "\u2022\tInstrument skills are highly perishable when not used regularly.\n\u2022\tAn IPC restores instrument privileges after a lapse in recent experience.\n\u2022\tHelps confirm the pilot can safely return to IFR operations.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.71",
        "completion of an instrument proficiency check (ipc)",
        "instrument proficiency check",
        "ipc"
      ],
      "tags": [
        "additional recurrent",
        "recurrent"
      ],
      "cardExplanation": "Shows an IPC is complete and the CFII found the pilot proficient to resume instrument privileges."
    },
    {
      "id": "A.72",
      "order": 72,
      "title": "To act as PIC in a complex airplane",
      "cfr": [
        "14 CFR \u00a7 61.31(e)"
      ],
      "sourcePage": "A-20",
      "verbatimText": "I certify that [First name, MI, Last name], [grade of pilot certificate], [certificate number], has received the required training of 14 CFR \u00a7 61.31(e) in a [M/M] complex airplane. I have determined that they are proficient in the operation and systems of a complex airplane.",
      "category": "additional-recurrent",
      "explanation": "\u2022\tComplex airplanes add systems workload beyond basic flying.\n\u2022\tThe pilot must manage gear, flaps, and controllable-pitch propeller correctly.\n\u2022\tHelps prevent system-management errors that can become safety issues.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.72",
        "complex",
        "to act as pic in a complex airplane"
      ],
      "tags": [
        "additional recurrent",
        "recurrent"
      ],
      "cardExplanation": "Required before acting as PIC in a complex airplane."
    },
    {
      "id": "A.73",
      "order": 73,
      "title": "To act as PIC in a high-performance airplane",
      "cfr": [
        "14 CFR \u00a7 61.31(f)"
      ],
      "sourcePage": "A-21",
      "verbatimText": "I certify that [First name, MI, Last name], [grade of pilot certificate], [certificate number], has received the required training of 14 CFR \u00a7 61.31(f) in a [M/M] high-performance airplane. I have determined that they are proficient in the operation and systems of a high-performance airplane.",
      "category": "additional-recurrent",
      "explanation": "\u2022\tMore horsepower usually means faster speed, stronger climb, and less time to react.\n\u2022\tTransition training helps pilots avoid getting behind the airplane.\n\u2022\tConfirms the pilot can manage the added performance safely.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.73",
        "high performance",
        "to act as pic in a high-performance airplane"
      ],
      "tags": [
        "additional recurrent",
        "recurrent"
      ],
      "cardExplanation": "Required before acting as PIC in a high-performance airplane."
    },
    {
      "id": "A.74",
      "order": 74,
      "title": "To act as PIC in a pressurized aircraft capable of high-altitude operations",
      "cfr": [
        "14 CFR \u00a7 61.31(g)"
      ],
      "sourcePage": "A-21",
      "verbatimText": "I certify that [First name, MI, Last name], [grade of pilot certificate], [certificate number], has received the required training of 14 CFR \u00a7 61.31(g) in a [M/M] pressurized aircraft. I have determined that they are proficient in the operation and systems of a pressurized aircraft.",
      "category": "additional-recurrent",
      "explanation": "\u2022\tHigh-altitude flying includes oxygen, pressurization, physiology, and emergency-descent issues.\n\u2022\tMistakes at altitude can become life-threatening quickly.\n\u2022\tConfirms the pilot was trained for risks not found in basic low-altitude flying.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.74",
        "high altitude",
        "pressurized",
        "to act as pic in a pressurized aircraft capable of high-altitude operations"
      ],
      "tags": [
        "additional recurrent",
        "recurrent"
      ],
      "cardExplanation": "Required before acting as PIC in a pressurized aircraft capable of high-altitude operations."
    },
    {
      "id": "A.75",
      "order": 75,
      "title": "To act as PIC in a tailwheel airplane",
      "cfr": [
        "14 CFR \u00a7 61.31(i)"
      ],
      "sourcePage": "A-21",
      "verbatimText": "This endorsement may be given in a sport pilot aircraft by a sport pilot instructor or in an airplane by a flight instructor with a rating other than a sport pilot rating. I certify that [First name, MI, Last name], [grade of pilot certificate], [certificate number], has received the required training of 14 CFR \u00a7 61.31(i) in a [M/M] of tailwheel airplane. I have determined that they are proficient in the operation of a tailwheel airplane.",
      "category": "additional-recurrent",
      "explanation": "\u2022\tTailwheel airplanes are less forgiving on takeoff and landing roll.\n\u2022\tSpecific training helps prevent loss of directional control and ground loops.\n\u2022\tConfirms the pilot can handle the airplane\u2019s unique ground behavior.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.75",
        "tailwheel",
        "to act as pic in a tailwheel airplane"
      ],
      "tags": [
        "additional recurrent",
        "recurrent"
      ],
      "cardExplanation": "Required before acting as PIC in a tailwheel airplane."
    },
    {
      "id": "A.76",
      "order": 76,
      "title": "To act as PIC of an aircraft in solo operations when the pilot does not hold an appropriate category/class rating",
      "cfr": [
        "14 CFR \u00a7 61.31(d)(2)"
      ],
      "sourcePage": "A-21",
      "verbatimText": "I certify that [First name, MI, Last name] has received the training as required by 14 CFR \u00a7 61.31(d)(2) to serve as a pilot in command in a [specific category and class] of aircraft. I have determined that they are prepared to solo that [M/M] aircraft. Limitations: [optional].",
      "category": "additional-recurrent",
      "explanation": "\u2022\tCreates a legal path to gain solo experience toward a new rating.\n\u2022\tKeeps those solo operations tied to instructor approval and oversight.\n\u2022\tPrevents unsupervised flying outside the pilot\u2019s current certificate privileges.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.76",
        "solo in unrated aircraft",
        "solo without category class",
        "to act as pic of an aircraft in solo operations when the pilot does not hold an appropriate category/class rating"
      ],
      "tags": [
        "additional recurrent",
        "recurrent",
        "solo"
      ],
      "cardExplanation": "Allows solo operation in an aircraft when the pilot does not yet hold the proper category or class rating."
    },
    {
      "id": "A.77",
      "order": 77,
      "title": "Retesting after failure of a knowledge or practical test",
      "cfr": [
        "14 CFR \u00a7 61.49"
      ],
      "sourcePage": "A-21",
      "verbatimText": "In the case of a failed knowledge test, the instructor may complete the endorsement in the space provided at the bottom of the applicant\u2019s Airman Knowledge Test Report (AKTR). The instructor must sign the block provided for the instructor\u2019s recommendation on the reverse side of FAA Form 8710-1, Airman Certificate and/or Rating Application, for each retake of a practical test. I certify that [First name, MI, Last name] has received the additional [flight and/or ground, as appropriate] training as required by 14 CFR \u00a7 61.49. I have determined that they are proficient to pass the [name of] knowledge/practical test.",
      "category": "additional-recurrent",
      "explanation": "\u2022\tAfter a failure, the FAA wants proof the weak areas were corrected first.\n\u2022\tHelps target added training to the actual deficiencies, not just repeat the test.\n\u2022\tSupports a safer and more meaningful retest.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.77",
        "notice of disapproval",
        "retest",
        "retesting after failure of a knowledge or practical test"
      ],
      "tags": [
        "additional recurrent",
        "checkride",
        "recurrent"
      ],
      "cardExplanation": "Required before retesting after a failed knowledge or practical test. Shows added training in the deficient areas."
    },
    {
      "id": "A.78",
      "order": 78,
      "title": "Additional aircraft category or class rating (other than ATP)",
      "cfr": [
        "14 CFR \u00a7 61.63(b) or (c)"
      ],
      "sourcePage": "A-21",
      "verbatimText": "I certify that [First name, MI, Last name], [grade of pilot certificate], [certificate number], has received the required training for an additional [aircraft category/class rating]. I have determined that they are prepared for the [name of] practical test for the addition of a [name of specific aircraft category/class/type] type rating.",
      "category": "additional-recurrent",
      "explanation": "\u2022\tAdding a category or class means learning new skills, knowledge, or procedures.\n\u2022\tConfirms the pilot was trained specifically for that transition.\n\u2022\tProvides the core endorsement basis for the added rating process.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.78",
        "add on",
        "additional aircraft category or class rating (other than atp)",
        "additional category",
        "additional class",
        "airplane add on",
        "asel to amel",
        "helicopter add on",
        "helicopter to asel"
      ],
      "tags": [
        "add-on",
        "additional recurrent",
        "recurrent",
        "transition"
      ],
      "cardExplanation": "Core endorsement for an added category or class rating other than ATP. Usually paired with the practical test recommendation."
    },
    {
      "id": "A.79",
      "order": 79,
      "title": "Type rating only, already holds the appropriate category or class rating (other than ATP)",
      "cfr": [
        "14 CFR \u00a7 61.63(d)(2)"
      ],
      "sourcePage": "A-22",
      "verbatimText": "I certify that [First name, MI, Last name] has received the required training of 14 CFR \u00a7 61.63(d)(2) for an addition of a [name of] type rating.",
      "category": "additional-recurrent",
      "explanation": "\u2022\tA type rating is aircraft-specific and often tied to more complex airplanes.\n\u2022\tConfirms qualification in that particular aircraft, not just the broader category/class.\n\u2022\tHelps document training in systems and procedures unique to that type.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.79",
        "type rating only, already holds the appropriate category or class rating (other than atp)"
      ],
      "tags": [
        "additional recurrent",
        "recurrent"
      ],
      "cardExplanation": "Documents the required training, qualification, or authorization for a type rating only at a non-ATP level."
    },
    {
      "id": "A.80",
      "order": 80,
      "title": "Type rating concurrently with an additional category or class rating (other than ATP)",
      "cfr": [
        "14 CFR \u00a7 61.63(d)(2)"
      ],
      "sourcePage": "A-22",
      "verbatimText": "I certify that [First name, MI, Last name] has received the required training of 14 CFR \u00a7 61.63(d)(2) for an addition of a [name of specific category/class/type] type rating. I have determined that they are prepared for the [name of] practical test for the addition of a [name of specific aircraft category/class/type] type rating.",
      "category": "additional-recurrent",
      "explanation": "\u2022\tCombines aircraft-specific and broader category/class qualification in one path.\n\u2022\tHelps show both training tracks were properly covered.\n\u2022\tPrevents gaps when two qualifications are pursued together.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.80",
        "type rating concurrently with an additional category or class rating (other than atp)"
      ],
      "tags": [
        "additional recurrent",
        "recurrent"
      ],
      "cardExplanation": "Documents the required training, qualification, or authorization for a type rating taken with an added category or class rating at a non-ATP level."
    },
    {
      "id": "A.81",
      "order": 81,
      "title": "Type rating only, already holds the appropriate category or class rating (at the ATP level)",
      "cfr": [
        "14 CFR \u00a7 61.157(b)(2)"
      ],
      "sourcePage": "A-22",
      "verbatimText": "I certify that [First name, MI, Last name] has received the required training of 14 CFR \u00a7 61.157(b)(2) for an addition of a [name of] type rating.",
      "category": "additional-recurrent",
      "explanation": "\u2022\tATP-level type ratings involve advanced aircraft and strict standards.\n\u2022\tClear documentation is important because the privilege is aircraft-specific and significant.\n\u2022\tSupports qualification in complex transport-style operations.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.81",
        "type rating only, already holds the appropriate category or class rating (at the atp level)"
      ],
      "tags": [
        "additional recurrent",
        "recurrent"
      ],
      "cardExplanation": "Documents the required training, qualification, or authorization for a type rating only at the ATP level."
    },
    {
      "id": "A.82",
      "order": 82,
      "title": "Type rating concurrently with an additional category or class rating (at the ATP level)",
      "cfr": [
        "14 CFR \u00a7 61.157(b)(2)"
      ],
      "sourcePage": "A-22",
      "verbatimText": "I certify that [First name, MI, Last name] has received the required training of 14 CFR \u00a7 61.157(b)(2) for an addition of a [name of the specific category/class/type] type rating.",
      "category": "additional-recurrent",
      "explanation": "\u2022\tThis path combines ATP-level standards with aircraft-specific type qualification.\n\u2022\tHelps show the applicant met both sets of requirements together.\n\u2022\tSupports accurate documentation for a more complex qualification route.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.82",
        "type rating concurrently with an additional category or class rating (at the atp level)"
      ],
      "tags": [
        "additional recurrent",
        "recurrent"
      ],
      "cardExplanation": "Documents the required training, qualification, or authorization for a type rating taken with an added category or class rating at the ATP level."
    },
    {
      "id": "A.83",
      "order": 83,
      "title": "Launch procedures for operating a glider",
      "cfr": [
        "14 CFR \u00a7 61.31(j)"
      ],
      "sourcePage": "A-22",
      "verbatimText": "I certify that [First name, MI, Last name], [grade of pilot certificate], [certificate number], has received the required training in a glider [M/M] for [ground-tow, aerotow, self-launch] procedure. I have determined that they are proficient in [ground-tow, aerotow, self-launch] procedure.",
      "category": "additional-recurrent",
      "explanation": "\u2022\tGlider safety depends heavily on proper launch technique.\n\u2022\tDifferent launch methods create different procedures and hazards.\n\u2022\tConfirms the pilot was trained for the launch method actually used.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.83",
        "launch procedures for operating a glider"
      ],
      "tags": [
        "additional recurrent",
        "recurrent"
      ],
      "cardExplanation": "Documents the required training, qualification, or authorization for glider launch procedures."
    },
    {
      "id": "A.84",
      "order": 84,
      "title": "Glider and unpowered ultralight vehicle towing experience",
      "cfr": [
        "14 CFR \u00a7 61.69(a)(5)"
      ],
      "sourcePage": "A-22",
      "verbatimText": "This endorsement is made by the pilot who is qualified per 14 CFR \u00a7 61.69(c) and (d) and who conducted the flights. This endorsement does not have to be made by a flight instructor. I certify that [First name, MI, Last name], [grade of pilot certificate], [certificate number], has accomplished at least three flights in an aircraft while towing [a glider or unpowered ultralight vehicle, or while simulating towing flight procedures, as applicable]. /s/ [date] J. J. Jones 987654321",
      "category": "additional-recurrent",
      "explanation": "\u2022\tTowing requires specialized skill beyond normal flying.\n\u2022\tThe tow pilot must manage coordination, stability, and emergencies carefully.\n\u2022\tDocuments the experience needed before towing others safely.",
      "whoIssues": "non-instructor",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.84",
        "glider and unpowered ultralight vehicle towing experience",
        "glider tow",
        "tow pilot"
      ],
      "tags": [
        "additional recurrent",
        "recurrent"
      ],
      "cardExplanation": "Documents the towing experience required to tow a glider or unpowered ultralight vehicle. May be issued by a qualified non-instructor pilot."
    },
    {
      "id": "A.85",
      "order": 85,
      "title": "Glider and unpowered ultralight vehicle towing ground and flight",
      "cfr": [
        "14 CFR \u00a7 61.69(a)(3)"
      ],
      "sourcePage": "A-23",
      "verbatimText": "I certify that [First name, MI, Last name], [grade of pilot certificate], [certificate number], has received the required ground and flight training in [a glider or unpowered ultralight vehicle, as applicable]. I have determined that they are proficient in the techniques and procedures essential to the safe towing of [gliders or unpowered vehicles, as applicable], including airspeed limitations, emergency procedures, signals used, and maximum angles of bank.",
      "category": "additional-recurrent",
      "explanation": "\u2022\tTow operations require both procedural knowledge and hands-on skill.\n\u2022\tCovers signals, emergency actions, aircraft performance, and coordination.\n\u2022\tHelps ensure towing is treated as a specialized operation, not ordinary flying.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.85",
        "glider and unpowered ultralight vehicle towing ground and flight",
        "glider tow training"
      ],
      "tags": [
        "additional recurrent",
        "recurrent"
      ],
      "cardExplanation": "Documents the required ground and flight training for towing a glider or unpowered ultralight vehicle."
    },
    {
      "id": "A.86",
      "order": 86,
      "title": "Review of a home-study curriculum",
      "cfr": [
        "14 CFR \u00a7 61.35(a)(1)"
      ],
      "sourcePage": "A-23",
      "verbatimText": "I certify I have reviewed the home-study curriculum of [First name, MI, Last name]. I have determined that they are prepared for the [name of] knowledge test. Note: This endorsement cannot be used for the ATP Airplane Multiengine Knowledge Test.",
      "category": "additional-recurrent",
      "explanation": "\u2022\tSelf-study alone does not prove correct understanding.\n\u2022\tInstructor review helps catch misunderstandings before testing or further qualification.\n\u2022\tSupports better quality control in home-study-based preparation.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.86",
        "home study",
        "review of a home-study curriculum"
      ],
      "tags": [
        "additional recurrent",
        "recurrent"
      ],
      "cardExplanation": "Shows the applicant completed the required review of a home-study curriculum."
    },
    {
      "id": "A.87",
      "order": 87,
      "title": "Aeronautical experience credit\u2014 ultralight vehicles",
      "cfr": [
        "14 CFR \u00a7 61.52"
      ],
      "sourcePage": "A-23",
      "verbatimText": "I certify that I have reviewed the records of [First name, MI, Last name], as required by 14 CFR \u00a7 61.52(c). I have determined that they may use [number of hours] aeronautical experience obtained in an ultralight vehicle to meet the requirements for [certificate/rating/privilege].",
      "category": "additional-recurrent",
      "explanation": "\u2022\tRecognizes relevant prior experience where the rules allow credit.\n\u2022\tHelps avoid unnecessary duplication of training.\n\u2022\tRequires documentation so only appropriate experience is counted.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.87",
        "aeronautical experience credit\u2014 ultralight vehicles"
      ],
      "tags": [
        "additional recurrent",
        "recurrent"
      ],
      "cardExplanation": "Documents the aeronautical experience credit allowed for ultralight vehicle experience."
    },
    {
      "id": "A.88",
      "order": 88,
      "title": "Endorsement required for ground training to act as PIC of an aircraft using night vision goggles (NVG)",
      "cfr": [
        "14 CFR \u00a7 61.31(k)(1)"
      ],
      "sourcePage": "A-23",
      "verbatimText": "This training and endorsement must be given by an authorized instructor, which is one who meets the requirements of 14 CFR \u00a7 61.195(k)(1)\u2013(7). Refer to 14 CFR \u00a7 61.31(k)(3) for exceptions to this required ground training. I certify that [First name, MI, Last name], [grade of pilot certificate], [certificate number], has received the ground training required by 14 CFR \u00a7 61.31(k)(1), (i) through (v) to conduct night vision goggle operations.",
      "category": "specialty-operations",
      "explanation": "\u2022\tNVG operations change visual perception, scanning, and risk factors.\n\u2022\tGround training helps the pilot understand limitations, illusions, and equipment use.\n\u2022\tBuilds knowledge before trying NVG flight operations.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.88",
        "endorsement required for ground training to act as pic of an aircraft using night vision goggles (nvg)",
        "nvg ground"
      ],
      "tags": [
        "specialty operations"
      ],
      "cardExplanation": "Documents the required ground training to act as PIC using NVGs."
    },
    {
      "id": "A.89",
      "order": 89,
      "title": "Endorsement required for flight training and statement of proficiency to act as PIC of an aircraft using NVG",
      "cfr": [
        "14 CFR \u00a7 61.31(k)(2)"
      ],
      "sourcePage": "A-23",
      "verbatimText": "This training and endorsement must be given by an authorized instructor, which is one who meets the requirements of 14 CFR \u00a7 61.195(k)(1)\u2013(7). Refer to 14 CFR \u00a7 61.31(k)(3) for exceptions to this required flight training. I certify that [First name, MI, Last name], [grade of pilot certificate], [certificate number], has received the flight training on night vision goggle operations required by 14 CFR \u00a7 61.31(k)(2), (i) through (iv). I find them proficient in the use of night vision goggles.",
      "category": "specialty-operations",
      "explanation": "\u2022\tClassroom knowledge alone is not enough for NVG use.\n\u2022\tThe pilot must demonstrate real scanning, landing, and obstacle-awareness skill.\n\u2022\tHelps ensure actual proficiency in a specialized operation.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.89",
        "endorsement required for flight training and statement of proficiency to act as pic of an aircraft using nvg",
        "nvg flight"
      ],
      "tags": [
        "specialty operations"
      ],
      "cardExplanation": "Documents the required flight training and proficiency to act as PIC using NVGs."
    },
    {
      "id": "A.90",
      "order": 90,
      "title": "Endorsement required to provide training for NVGOs",
      "cfr": [
        "14 CFR \u00a7 61.195(k)(7)"
      ],
      "sourcePage": "A-24",
      "verbatimText": "\u201cPosition,\u201d as mentioned in the signature block of the endorsement, is a person who is authorized by the FAA to provide that logbook endorsement. Refer to FAA Order 8900.1, Flight Standards Information Management System. I certify that [First name, MI, Last name], holder of CFI Certificate No. [ ], meets the night vision goggle instructor requirements of 14 CFR \u00a7 61.195(k) and is authorized to perform the night vision goggle pilot-in-command qualification and recent flight experience requirements under 14 CFR \u00a7\u00a7 61.31(k) and 61.57(f) and (g). This endorsement does not provide the authority to endorse another flight instructor as a night vision goggle instructor. /s/ [date] I. M. Inspector 987654321CFI RE Date 12-31-24 Position",
      "category": "specialty-operations",
      "explanation": "\u2022\tTeaching NVG operations requires a higher level of competence than simply using NVGs.\n\u2022\tThe instructor must be able to recognize and correct specialized errors.\n\u2022\tProtects students in a high-risk training environment.",
      "whoIssues": "dpe-or-asi-only",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.90",
        "endorsement required to provide training for nvgos",
        "nvg instructor"
      ],
      "tags": [
        "specialty operations"
      ],
      "cardExplanation": "Documents the required qualification to provide NVG operations training."
    },
    {
      "id": "A.91",
      "order": 91,
      "title": "Endorsement for EFVS ground training",
      "cfr": [
        "14 CFR \u00a7 61.66(a)"
      ],
      "sourcePage": "A-24",
      "verbatimText": "I certify that [First name, MI, Last name], [pilot certificate], [certificate number], has satisfactorily completed the ground training required by 14 CFR \u00a7 61.66(a) appropriate to the [appropriate aircraft category] category of aircraft.",
      "category": "specialty-operations",
      "explanation": "\u2022\tEFVS requires both system knowledge and regulatory understanding.\n\u2022\tThe pilot must know what the system can do, what it cannot do, and when it may be used.\n\u2022\tHelps prevent misuse based on misunderstanding the equipment or rules.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.91",
        "efvs ground",
        "endorsement for efvs ground training"
      ],
      "tags": [
        "specialty operations"
      ],
      "cardExplanation": "Documents the required EFVS ground training."
    },
    {
      "id": "A.92",
      "order": 92,
      "title": "Endorsement for EFVS flight training",
      "cfr": [
        "14 CFR \u00a7 61.66(b)"
      ],
      "sourcePage": "A-24",
      "verbatimText": "I certify that [First name, MI, Last name], [pilot certificate], [certificate number], has received the flight training required by 14 CFR \u00a7 61.66(b) and is proficient in the use of EFVS in the [appropriate aircraft category in which the flight training was conducted] category of aircraft for EFVS operations conducted under [14 CFR \u00a7 91.176(a), (b), or both 14 CFR \u00a7 91.176(a) and (b)].",
      "category": "specialty-operations",
      "explanation": "\u2022\tEFVS use in flight requires practice, not just theory.\n\u2022\tHelps the pilot learn scan technique, display use, and transition decisions.\n\u2022\tReduces the risk of fixation or poor interpretation during critical phases of flight.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.92",
        "efvs flight",
        "endorsement for efvs flight training"
      ],
      "tags": [
        "specialty operations"
      ],
      "cardExplanation": "Documents the required EFVS flight training."
    },
    {
      "id": "A.93",
      "order": 93,
      "title": "Endorsement for EFVS ground and flight training",
      "cfr": [
        "14 CFR \u00a7 61.66(a) and (b)"
      ],
      "sourcePage": "A-24",
      "verbatimText": "I certify that [First name, MI, Last name], [pilot certificate], [certificate number], has satisfactorily completed the ground training required by 14 CFR \u00a7 61.66(a) and has received the flight training required by 14 CFR \u00a7 61.66(b) for EFVS operations and is proficient in the use of EFVS in the [appropriate aircraft category in which the ground and flight training was conducted] category of aircraft for EFVS operations conducted under [14 CFR \u00a7 91.176(a), (b), or both 14 CFR \u00a7 91.176(a) and (b)].",
      "category": "specialty-operations",
      "explanation": "\u2022\tDocuments the full EFVS qualification, not just one part of it.\n\u2022\tConfirms the pilot received both rule knowledge and practical training.\n\u2022\tSupports safe and legal EFVS operations.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.93",
        "efvs combined",
        "endorsement for efvs ground and flight training"
      ],
      "tags": [
        "specialty operations"
      ],
      "cardExplanation": "Documents the required EFVS ground and flight training."
    },
    {
      "id": "A.94",
      "order": 94,
      "title": "Endorsement for EFVS supplementary training",
      "cfr": [
        "14 CFR \u00a7 61.66(c)"
      ],
      "sourcePage": "A-24",
      "verbatimText": "I certify that [First name, MI, Last name], [pilot certificate], [certificate number], has satisfactorily completed the required ground and flight training required by 14 CFR \u00a7 61.66(c) for EFVS operations and is proficient in the use of EFVS in the [appropriate aircraft category in which the supplementary ground and flight training was conducted] category of aircraft for EFVS operations conducted under [14 CFR \u00a7 91.176(a), (b), or both 14 CFR \u00a7 91.176(a) and (b)].",
      "category": "specialty-operations",
      "explanation": "\u2022\tAdditional EFVS privileges require added preparation.\n\u2022\tExpanded system use usually brings added complexity and decision-making demands.\n\u2022\tHelps prevent pilots from using EFVS beyond the level they were trained for.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.94",
        "efvs supplemental",
        "endorsement for efvs supplementary training"
      ],
      "tags": [
        "specialty operations"
      ],
      "cardExplanation": "Documents the required EFVS supplementary training."
    },
    {
      "id": "A.95",
      "order": 95,
      "title": "To act as PIC in an aircraft with a simplified flight controls designation",
      "cfr": [
        "14 CFR \u00a7\u00a7 61.31(l) and 61.45(h)(1)"
      ],
      "sourcePage": "A-25",
      "verbatimText": "I certify that [First Name, MI, Last Name], [grade of pilot certificate], [certificate number], has received the required training of 14 CFR \u00a7 61.31(l)(1) in a [M/M] aircraft with simplified flight controls designation. I have determined that [pilot name] is proficient in the operation of an [category and class, M/M] aircraft with simplified flight controls.",
      "category": "specialty-operations",
      "explanation": "\u2022\tEven with simplified controls, the pilot still needs make-and-model-specific training.\n\u2022\tThe pilot must understand the aircraft\u2019s features, limits, and any related restrictions.\n\u2022\tPrevents overconfidence based only on the word \u201csimplified.\u201d",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.95",
        "simplified flight controls",
        "to act as pic in an aircraft with a simplified flight controls designation"
      ],
      "tags": [
        "specialty operations"
      ],
      "cardExplanation": "Documents the required training and qualification to act as PIC in an aircraft with simplified flight controls."
    },
    {
      "id": "A.96",
      "order": 96,
      "title": "Initial cadre training in an aircraft with simplified flight controls",
      "cfr": [
        "14 CFR \u00a7 61.195(n)"
      ],
      "sourcePage": "A-25",
      "verbatimText": "I certify that [First Name, MI, Last Name], [grade of pilot certificate], [certificate number], has received the required training of 14 CFR \u00a7 61.195(n)(2)(ii) in a [M/M] aircraft with simplified flight controls designation. I have determined that [pilot name] is proficient in the operation of an [category and class, M/M] aircraft with simplified flight controls. Signature of Instructor Pilot _________ Print Name _____________ Cert No. _________ Date ______",
      "category": "specialty-operations",
      "explanation": "\u2022\tThe initial cadre becomes the foundation for later standardization and training.\n\u2022\tTheir qualification matters because they help establish safe operating practices in that aircraft.\n\u2022\tSupports future instructor, examiner, and pilot development from a solid base.",
      "whoIssues": "standard-cfi",
      "expiration": "none",
      "perFlight": false,
      "aliases": [
        "a.96",
        "initial cadre training in an aircraft with simplified flight controls",
        "simplified flight controls instructor"
      ],
      "tags": [
        "specialty operations"
      ],
      "cardExplanation": "Documents the required training and qualification for initial cadre training in an aircraft with simplified flight controls."
    }
  ];
})();
