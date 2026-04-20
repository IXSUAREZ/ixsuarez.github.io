"use strict";

/* eslint-disable */
const APP_META = window.APP_META || {};
const AC_VERSION_LABEL = APP_META.acVersion || "AC 61-65";
const AC_REFERENCE_TITLE = `${AC_VERSION_LABEL} – Certification: Pilots and Flight and Ground Instructors`;
const A14_REFERENCE = `${AC_VERSION_LABEL}, A.14`;

const GUIDANCE_SECTIONS = [
  {
    id: "objectives",
    title: "1. Lesson Objectives & Key Elements",
    content: [
      { type: "h3", value: "References" },
      {
        type: "ul",
        value: [
          "14 CFR Part 61",
          AC_REFERENCE_TITLE,
          "AC 61-98 – Currency Requirements and Guidance for the Flight Review and Instrument Proficiency Check",
          "AC 61-83 – Flight Instructor Refresher Course",
          "AC 61-91 – WINGS Pilot Proficiency Program",
          "FAA Order 8900.1 (FSIMS)",
        ],
      },
      { type: "h3", value: "Objective" },
      {
        type: "p",
        value:
          "The learner should develop knowledge of the elements related to logbook entries and endorsements as required by the appropriate Airman Certification Standards (ACS).",
      },
      { type: "h3", value: "Key Elements" },
      {
        type: "ol",
        value: [
          "AC 61-65",
          "Endorsements",
          "Required Records",
          "Logbook Entries",
          "Student Pilot Certificate Endorsements",
          "Preparation of a Practical Test Recommendation",
          "Additional Ratings",
          "Reapplying for a Practical Test",
          "Time Limits",
          "Flight Review Endorsements",
          "Flight Instructor Responsibilities",
          "Maintaining Your CFI Certificate",
        ],
      },
      { type: "h3", value: "Lesson Schedule" },
      {
        type: "ol",
        value: [
          "Discuss objectives",
          "Review material",
          "Development",
          "Conclusion",
        ],
      },
      { type: "h3", value: "Instructor & Student Actions" },
      {
        type: "ul",
        value: [
          "Instructor: Discuss lesson objectives, present lecture, ask and answer questions, assign homework",
          "Student: Participate in discussion, take notes, ask and respond to questions",
        ],
      },
      { type: "h3", value: "Completion Standards" },
      {
        type: "p",
        value:
          "The learner understands what is necessary in their logbooks, what is required for student pilot certificates and preparing a learner for a practical test, and the requirements for flight review endorsements and flight instructor records.",
      },
    ],
  },
  {
    id: "logbook",
    title: "2. Logbook Entries & Required Records",
    content: [
      { type: "h3", value: "Instructor Logbook Signing Requirement (FAR 61.51)" },
      {
        type: "p",
        value:
          "A flight instructor must sign the logbook of each person to whom they have given flight or ground training. Required elements of a logbook entry under FAR 61.51:",
      },
      {
        type: "ul",
        value: [
          "Date",
          "Aircraft identification",
          "Aircraft make and model",
          "Type of experience (Solo, PIC, etc.)",
          "Total flight time",
          "Flight conditions (Day, Night, Instrument, etc.)",
          "Location of departure and arrival",
          "Name of safety pilot, if required",
        ],
      },
      { type: "h3", value: "Recordkeeping Requirements (FAR 61.189)" },
      {
        type: "p",
        value:
          "An instructor must maintain a record in a logbook or separate document containing:",
      },
      {
        type: "ul",
        value: [
          "Name of each person endorsed for solo flight privileges, and the date of the endorsement",
          "Name of each person endorsed for a knowledge or practical test, with the kind of test, date, and results",
        ],
      },
      { type: "p", value: "These records must be retained for at least 3 years." },
      { type: "h3", value: "Unsatisfactory Performance" },
      {
        type: "p",
        value:
          "No logbook entry reflecting unsatisfactory performance on a flight review or instrument proficiency check is required. However, a logbook entry for the instruction given should still be made.",
      },
    ],
  },
  {
    id: "student-endorsements",
    title: "3. Student Pilot Certificate Endorsements",
    content: [
      { type: "h3", value: "Pre-Solo Endorsements" },
      {
        type: "ul",
        value: [
          "Pre-solo aeronautical knowledge – FAR 61.87(b), AC 61-65 A.3",
          "Pre-solo flight training – FAR 61.87(c)(1)&(2), AC 61-65 A.4",
          "Pre-solo flight training at night – FAR 61.87(o), AC 61-65 A.5",
        ],
      },
      { type: "h3", value: "Solo Flight Endorsements" },
      {
        type: "ul",
        value: [
          "Solo flight (first 90-day period) – FAR 61.87(n), AC 61-65 A.6 — endorsement for the specific make & model by the instructor who gave the training within the preceding 90 days",
          "Solo flight (each additional 90-day period) – FAR 61.87(p), AC 61-65 A.7",
          "Solo takeoffs and landings at another airport within 25 NM – FAR 61.93(b)(1), AC 61-65 A.8",
        ],
      },
      { type: "h3", value: "Cross-Country Endorsements" },
      {
        type: "ul",
        value: [
          "Solo cross-country training (category-specific) – FAR 61.93(c)(1)&(2), AC 61-65 A.9",
          "Solo cross-country flight planning (make & model-specific) – FAR 61.93(c)(3), AC 61-65 A.10 — required for each individual cross-country flight",
          "Repeated solo cross-country flights not more than 50 NM from departure – FAR 61.93(b)(2), AC 61-65 A.11",
        ],
      },
      { type: "h3", value: "Class B Airspace Endorsements" },
      {
        type: "ul",
        value: [
          "Solo flight in Class B airspace – FAR 61.95(a), AC 61-65 A.12",
          "Solo flight to/from/at a Class B airport – FAR 61.95(b) & FAR 91.131(b)(1), AC 61-65 A.13",
        ],
      },
      { type: "h3", value: "TSA U.S. Citizenship Endorsement" },
      {
        type: "p",
        value:
          "The instructor must keep a copy of the documents used to provide proof of citizenship for 5 years, or make the following endorsement:",
      },
      {
        type: "ul",
        value: [
          "AC 61-65 A.14 – Endorsement of U.S. Citizenship recommended by the TSA: 49 CFR 1552.3(h)",
        ],
      },
      { type: "h3", value: "Special Federal Aviation Regulations (SFARs)" },
      {
        type: "p",
        value:
          "SFARs are temporary regulations issued by the FAA that apply to specific people and aircraft, often with an expiration date that can be amended, extended, or rescinded.",
      },
      {
        type: "ul",
        value: [
          "SFAR 73 – Robinson R-22/R-44 Special Training & Experience Requirements (not applicable to airplanes, but sample endorsements appear in AC 61-65)",
          "SFAR 100-2 – Relief for U.S. Military/Civilians assigned outside the U.S. in support of Armed Forces operations",
          "Part 91 SFARs generally prohibit flight in specific regions (e.g., Damascus, Somalia, Pyongyang, Tehran)",
        ],
      },
      {
        type: "p",
        value:
          "Review applicable SFARs whenever endorsing a student operating under special regulatory conditions.",
      },
    ],
  },
  {
    id: "practical-test",
    title: "4. Practical Test Preparation & Recommendation",
    content: [
      { type: "h3", value: "Prerequisites Endorsement — AC 61-65 A.1" },
      {
        type: "p",
        value:
          "Except as provided by FAR 61.39, each applicant must receive an endorsement from an authorized instructor certifying that the applicant received and logged the required flight time and training in preparation for the practical test within 2 calendar months preceding the month of application, and is prepared for the test.",
      },
      { type: "h3", value: "Knowledge-Test Deficiency Review — AC 61-65 A.2" },
      {
        type: "p",
        value:
          "The instructor must endorse the applicant after reviewing areas of deficiency identified on the Airman Knowledge Test Report. This confirms the applicant has satisfactory knowledge of those subject areas. It is sometimes combined with the A.1 endorsement (e.g., AC 61-65 A.44 for instrument rating).",
      },
      { type: "h3", value: "Example: Single-Engine Private Pilot Endorsements" },
      {
        type: "ol",
        value: [
          "AC 61-65 A.1 – Prerequisites for a Practical Test: FAR 61.39(a)(6)(i)&(ii)",
          "AC 61-65 A.2 – Review of Deficiencies Identified on Airman Knowledge Test: FAR 61.39(a)(6)(iii)",
          "AC 61-65 A.36 – Aeronautical Knowledge Test: FAR 61.35(a)(1), 61.103(d), 61.105",
          "AC 61-65 A.37 – Flight Proficiency/Practical Test: FAR 61.103(f), 61.107(b), 61.109",
        ],
      },
      { type: "h3", value: "IACRA vs. Paper Application" },
      {
        type: "p",
        value:
          "The instructor and student must complete the IACRA rating application online at iacra.faa.gov, or complete and sign Form 8710-1 for the examiner at the practical test. Most examiners now prefer IACRA.",
      },
      { type: "h3", value: "Medical Requirements" },
      {
        type: "p",
        value:
          "Except in certain instances, the applicant must hold at least a current third-class medical certificate (FAR 61.23(a)(3)(iii)).",
      },
    ],
  },
  {
    id: "additional-ratings",
    title: "5. Additional Ratings & Retesting",
    content: [
      { type: "h3", value: "Additional Class Rating — FAR 61.63(c)" },
      {
        type: "p",
        value:
          "For an additional class rating (e.g., adding multiengine to a single-engine private pilot certificate), the applicant needs:",
      },
      {
        type: "ul",
        value: [
          "AC 61-65 A.78 – Additional Aircraft Category or Class Rating (other than ATP): FAR 61.63(c)",
          "AC 61-65 A.1 – Practical test endorsement",
          "Other endorsements as required (e.g., A.72 for complex aircraft if applicable)",
        ],
      },
      {
        type: "p",
        value:
          "No knowledge test is required provided the applicant already holds a rating at the same certificate level. No need to meet the time requirements applicable to the initial class rating.",
      },
      { type: "h3", value: "Additional Category Rating — FAR 61.63(b)" },
      {
        type: "p",
        value:
          "Complete all applicable aeronautical experience and training, then receive endorsements A.78 + A.1 (plus others as required) and pass the practical test.",
      },
      {
        type: "h3",
        value: "Example: Single-Engine Private Pilot Adding Multiengine Rating",
      },
      {
        type: "ol",
        value: [
          "AC 61-65 A.1 – Prerequisite for a Practical Test: FAR 61.39(a)(6)(i)&(ii)",
          "AC 61-65 A.78 – Additional Aircraft Category or Class Rating (other than ATP): FAR 61.63(c)",
          "AC 61-65 A.72 – To act as PIC in a complex aircraft: FAR 61.31(e) (if applicable)",
        ],
      },
      { type: "h3", value: "Solo Flight Without Appropriate Category/Class — FAR 61.31(d)(2)" },
      {
        type: "p",
        value:
          "If a pilot does not hold the appropriate category/class rating, they must have received the required training. Endorsement: AC 61-65 A.76 – Solo PIC when the pilot does not hold the appropriate category/class.",
      },
      {
        type: "h3",
        value: "Retesting After Disapproval — FAR 61.43(f) & 61.49",
      },
      {
        type: "ul",
        value: [
          "A practical test, whether satisfactory or not, uses up the endorsement for that test",
          "The applicant must receive additional instruction and a new endorsement before retesting: AC 61-65 A.77 – Retesting after failure of a knowledge or practical test: FAR 61.49",
          "An instructor recommendation (IACRA or 8710) is required for every retest",
          "The applicant may receive credit for Areas of Operation already passed if the remainder is completed within 60 calendar days after discontinuation",
        ],
      },
      { type: "h3", value: "After a Letter of Discontinuance" },
      {
        type: "ul",
        value: [
          "No additional endorsements required",
          "Credit is given for areas already passed if the test is completed within 60 calendar days",
          "After 60 calendar days, the entire practical test must be re-accomplished",
        ],
      },
    ],
  },
  {
    id: "time-limits",
    title: "6. Time Limits: 60 Calendar Days vs. 2 Calendar Months",
    content: [
      { type: "h3", value: "60 Calendar-Day Limit — FAR 61.43(e)-(f)" },
      {
        type: "p",
        value: "A practical test may be discontinued for four reasons:",
      },
      {
        type: "ol",
        value: [
          "Failing one or more areas of operation",
          "Inclement weather",
          "Airworthiness concerns",
          "Safety of flight concern",
        ],
      },
      {
        type: "p",
        value:
          "If discontinued, the applicant receives credit for areas already passed. The remainder of the test must be completed within 60 calendar days (FAR 61.43(f)(1)). After 60 calendar days, all areas must be re-tested from the beginning.",
      },
      { type: "h3", value: "2 Calendar-Month Limit — FAR 61.39(g)-(h)" },
      {
        type: "p",
        value:
          "If all increments of a practical test are not completed on the same date — whether due to discontinuance or because the test was planned in increments — all remaining increments must be completed within 2 calendar months (FAR 61.39(g)). After 2 calendar months, the entire test must be re-accomplished (FAR 61.39(h)).",
      },
      { type: "h3", value: "Key Distinction" },
      {
        type: "p",
        value:
          "These two time limits are separate. The 60-day limit governs credit for passed areas after discontinuance; the 2-calendar-month limit governs completion of a test conducted in planned increments. Neither is related to the 90-day endorsement window for student solo flights.",
      },
    ],
  },
  {
    id: "flight-review",
    title: "7. Flight Review & Instrument Proficiency Check Endorsements",
    content: [
      { type: "h3", value: "Flight Review Completion — AC 61-65 A.69" },
      {
        type: "p",
        value:
          "After satisfactory completion of a flight review, the instructor must endorse the pilot's logbook per FAR 61.56(a)&(c). No entry reflecting unsatisfactory performance is required, but instruction given should be recorded.",
      },
      {
        type: "h3",
        value: "Instrument Proficiency Check (IPC) — AC 61-65 A.71",
      },
      {
        type: "p",
        value:
          "A CFII is required to conduct an IPC for instrument-rated pilots. After satisfactory completion, endorse the pilot's logbook per FAR 61.57(d). As with the flight review, no unsatisfactory-performance entry is required, but log the instruction given.",
      },
    ],
  },
  {
    id: "instructor-responsibilities",
    title: "8. Flight Instructor Responsibilities",
    content: [
      { type: "h3", value: "Recordkeeping — FAR 61.189" },
      {
        type: "p",
        value:
          "An instructor must maintain a logbook or separate document containing:",
      },
      {
        type: "ul",
        value: [
          "Name of each person endorsed for solo flight privileges, and the date of the endorsement",
          "Name of each person endorsed for a knowledge or practical test, with the kind of test, date, and results",
        ],
      },
      { type: "p", value: "Records must be retained for at least 3 years." },
      { type: "h3", value: "Limitations & Expiration Dates" },
      {
        type: "p",
        value:
          "Failure to ensure proper endorsements is a serious performance deficiency. Depending on the situation, the FAA could hold the instructor accountable. Required limitations and expiration dates exist for safety — ensure proper endorsements and confirm the learner understands them.",
      },
      {
        type: "h3",
        value:
          "Training Initial Flight Instructor Applicants (Effective December 1, 2024)",
      },
      { type: "p", value: "Ground training options — the trainer must have:" },
      {
        type: "ul",
        value: [
          "Held the appropriate instructor certificate for 24+ months and given 40+ hours of ground training, OR",
          "Held the appropriate instructor certificate and given 100+ hours of ground training in an FAA-approved course",
        ],
      },
      { type: "p", value: "Flight training options — the trainer must have:" },
      {
        type: "ul",
        value: [
          "Held a flight instructor certificate for at least 24 months and given at least 200 hours of flight training, OR",
          "Maintained an 80% practical test pass rate for at least 5 applicants in the last 24 months, OR",
          "Provided 200 hours of flight training and completed a Flight Instructor Enhanced Qualification Training Program (FIEQTP) under Part 141 — per FAR 61.95(h)(3) and AC 61-145",
        ],
      },
    ],
  },
  {
    id: "cfi-certificate",
    title: "9. Maintaining Your CFI Certificate & WINGS Program",
    content: [
      {
        type: "h3",
        value: "Duration of Certificates (Effective December 1, 2024)",
      },
      {
        type: "ul",
        value: [
          "Certificates issued before December 1, 2024 expire 24 calendar months from the month issued, renewed, or reinstated (Exception: FAR 61.197(b))",
          "Certificates issued on or after December 1, 2024 are issued without an expiration date",
        ],
      },
      {
        type: "h3",
        value: "Recent Experience Requirements — FAR 61.197",
      },
      {
        type: "p",
        value:
          "Within the previous 24 calendar months, satisfy one of the following:",
      },
      {
        type: "ol",
        value: [
          "Pass a practical test for one of the ratings listed on the instructor certificate, or for an additional flight instructor rating",
          "Submit documentation showing endorsement of 5+ applicants for a checkride with an 80%+ first-attempt pass rate (a Gold Seal certificate may be applied for/renewed at the same time)",
          "Serve as a company check pilot or check airman, chief flight instructor, Part 121 or 135 instructor, or similar evaluative position within the past 24 calendar months",
          "Complete an approved flight instructor refresher course within the past 3 calendar months (see AC 61-83)",
          "Pass a military instructor pilot or pilot examiner proficiency check in an aircraft within the past 24 calendar months",
          "Complete an FAA-sponsored pilot proficiency program (WINGS) — see requirements below",
        ],
      },
      { type: "h3", value: "WINGS Program Requirements — AC 61-91" },
      {
        type: "ul",
        value: [
          "Hold a current flight instructor certificate",
          "Complete at least 1 phase of an FAA-sponsored pilot proficiency program in the last 12 months",
          "Evaluate and endorse 15 flight activities (at least 5 pilots) under the pilot proficiency program",
        ],
      },
      {
        type: "h3",
        value: "Reinstatement of Flight Instructor Privileges — FAR 61.199 (Effective December 1, 2024)",
      },
      { type: "p", value: "If a certificate has expired:" },
      {
        type: "ul",
        value: [
          "Within 3 calendar months of expiration: Privileges can be reinstated via an approved FIRC (Flight Instructor Refresher Course). No instructional privileges during this reinstatement period.",
          "After 3 calendar months: Must pass an instructor practical test for one of the ratings on the expired certificate, a practical test for an additional flight instructor rating, or a military instructor pilot/pilot examiner proficiency check",
        ],
      },
      { type: "h3", value: "Documentation" },
      {
        type: "p",
        value:
          "Submit an Airman Certificate and/or Rating Application (Form 8710-1 or 8710-11) to validate recent experience.",
      },
    ],
  },
  {
    id: "conclusion",
    title: "10. Conclusion & Verification",
    content: [
      {
        type: "p",
        value:
          "Understanding logbook requirements and endorsement procedures is essential for every flight instructor. Proper records protect both student and instructor — ensuring training is documented, certificates remain valid, and the FAA's requirements are met.",
      },
      {
        type: "p",
        value:
          `Before endorsing a student or recommending an applicant for a practical test, verify that all required training has been completed, appropriate time limits are satisfied, and endorsement language matches current ${AC_VERSION_LABEL} model text.`,
      },
      { type: "h3", value: "Important Reminder" },
      {
        type: "p",
        value:
          "This site is a reference aid. Always verify endorsement applicability against the pilot's specific context, current FARs, and current FAA guidance — including the latest edition of AC 61-65.",
      },
      { type: "h3", value: "Official References" },
      {
        type: "ul",
        value: [
          AC_REFERENCE_TITLE,
          "AC 61-98 – Currency Requirements and Guidance for the Flight Review and IPC",
          "AC 61-83 – Flight Instructor Refresher Course",
          "AC 61-91 – WINGS Pilot Proficiency Program",
          "FAA Order 8900.1 (FSIMS)",
        ],
      },
    ],
  },
];

/* ── Student Pilot Prerequisites content ── */
window.PRE_SOLO_CONTENT = {
  intro: "Before most airplane students can exercise PIC solo privileges, they need a student pilot certificate, required medical qualification, and the pre-solo training endorsements. Dual instruction may begin before these are fully in place.",

  prerequisites: [
    {
      id: "T",
      title: "TSA citizenship / eligibility verification",
      description: `Flight training providers must handle TSA citizenship or eligibility verification when applicable. If the logbook-endorsement method is used, ${AC_VERSION_LABEL} A.14 provides commonly used language.`,
      refs: [
        "49 CFR \u00a7 1552.15(c)",
        A14_REFERENCE,
      ],
    },
    {
      id: "I",
      title: "Student pilot certificate application",
      description: "Apply through IACRA or an acceptable paper process with an authorized person such as a CFI, DPE, ACR, or FSDO representative. It is not an IACRA-only process.",
      refs: [
        "14 CFR \u00a7 61.83",
        "14 CFR \u00a7 61.85",
      ],
    },
    {
      id: "M",
      title: "Medical certificate / qualifying medical status",
      description: "For most private-path airplane students, solo requires at least a third-class medical or another qualifying medical basis that fits the operation being conducted.",
      refs: [
        "14 CFR \u00a7 61.3(c)",
        "14 CFR \u00a7 61.23",
      ],
    },
  ],

  accordionSections: [
    {
      id: "tsa",
      heading: "TSA Citizenship / Eligibility",
      blocks: [
        {
          type: "p",
          value: "TSA citizenship or eligibility verification is a training-provider compliance item and is separate from the FAA student pilot certificate and separate from medical qualification.",
        },
        { type: "h4", value: "Key Points" },
        {
          type: "ul",
          value: [
            "Training providers must follow applicable TSA citizenship or eligibility verification procedures before providing covered flight training",
            `If the provider uses the logbook-endorsement method for U.S. citizenship verification, ${AC_VERSION_LABEL} A.14 contains commonly used endorsement language`,
            "This step does not replace the student pilot certificate and does not replace the required medical qualification",
          ],
        },
      ],
    },
    {
      id: "cert",
      heading: "Student Pilot Certificate",
      blocks: [
        {
          type: "p",
          value: "A student pilot certificate is required before solo flight, but it is not required to begin dual flight instruction.",
        },
        { type: "h4", value: "Eligibility" },
        {
          type: "ul",
          value: [
            "Minimum age 16 for airplane (14 for glider or balloon)",
            "Must be able to read, speak, write, and understand English",
          ],
        },
        { type: "h4", value: "Application Process" },
        {
          type: "ul",
          value: [
            "Application may be made through IACRA (iacra.faa.gov) or by paper in a form acceptable to the Administrator \u2014 14 CFR 61.85 does not limit the method to IACRA only",
            "An authorized person (CFI, DPE, ACR, or FSDO representative) verifies identity and processes or forwards the application as required",
            "The FAA does not charge a fee when the certificate is processed through a FSDO; a school, examiner, or other processing entity may charge its own fee",
          ],
        },
        { type: "h4", value: "Certificate Issuance & Duration" },
        {
          type: "ul",
          value: [
            "The permanent certificate is mailed; a temporary student pilot certificate may become available in the applicant's IACRA console after processing",
            "Student pilot certificates issued after April 1, 2016 no longer expire in the old 24/36-month way \u2014 they are generally surrendered when upgrading to a higher certificate",
            "Solo endorsements are placed in the logbook, not printed on the student pilot certificate itself",
          ],
        },
        { type: "h4", value: "Documents to Carry on Solo Flight" },
        {
          type: "ul",
          value: [
            "Student pilot certificate",
            "Photo identification",
            "Medical certificate or other qualifying documentation as applicable",
          ],
        },
      ],
    },
    {
      id: "medical",
      heading: "Medical Certificate",
      blocks: [
        {
          type: "p",
          value: "A separate medical qualification is generally required before solo flight for the normal airplane/private training path. The student pilot certificate and medical qualification are separate requirements and should not be confused.",
        },
        {
          type: "ul",
          value: [
            "Third-class medical is the typical requirement for most student pilots training toward private or recreational airplane privileges",
            "Medical class depends on the privileges being exercised \u2014 not simply the highest certificate a pilot may someday hold",
            "Commercial privileges generally require at least a second-class medical when those privileges are exercised",
            "ATP PIC privileges generally require a first-class medical when those privileges are exercised",
            "Some students may qualify under exceptions or different pathways (sport pilot, glider/balloon, certain 61.113(i) operations)",
          ],
        },
        { type: "h4", value: "How to Obtain a Medical" },
        {
          type: "ol",
          value: [
            "Complete the MedXPress application online before your appointment",
            "Schedule an exam with an FAA-designated Aviation Medical Examiner (AME)",
            "Obtain the medical early \u2014 do not let it delay solo training",
          ],
        },
      ],
    },
    {
      id: "timeline",
      heading: "Solo Timeline",
      blocks: [
        {
          type: "ol",
          value: [
            "Start dual instruction",
            "Apply for the student pilot certificate",
            "Complete TSA citizenship/eligibility verification if applicable",
            "Obtain the required medical qualification",
            "Complete pre-solo aeronautical knowledge test and flight training",
            "Receive the appropriate solo endorsements",
            "Exercise solo privileges only when all required elements are satisfied",
          ],
        },
        {
          type: "p",
          value: "Solo privileges may be exercised only when these prerequisites and applicable endorsements are satisfied.",
        },
      ],
    },
    {
      id: "resources",
      heading: "Resources & Regulations",
      type: "resources",
      links: [
        { label: "IACRA \u2014 Integrated Airmen Certification and Rating Application", url: "https://iacra.faa.gov" },
        { label: "FAA Medical Certification", url: "https://www.faa.gov/pilots/medical_certification" },
        { label: "MedXPress \u2014 FAA Medical Application", url: "https://medxpress.faa.gov" },
        { label: "Find an Aviation Medical Examiner (AME)", url: "https://designee.faa.gov/designees/designeeLocator" },
      ],
      regs: [
        "14 CFR 61.3 \u2014 Required documents",
        "14 CFR 61.19 \u2014 Duration of pilot certificates",
        "14 CFR 61.23 \u2014 Medical certificates: requirement and duration",
        "14 CFR 61.83 \u2014 Eligibility requirements: student pilots",
        "14 CFR 61.85 \u2014 Application",
        "14 CFR 61.87 \u2014 Solo requirements for student pilots",
        "14 CFR 61.93 \u2014 Solo cross-country flight requirements",
        "14 CFR 61.95 \u2014 Operations in Class B airspace and at airports in Class B airspace",
        "49 CFR 1552.7 \u2014 Flight school security awareness training",
        "49 CFR 1552.15(c) \u2014 Citizenship verification",
        AC_REFERENCE_TITLE,
      ],
    },
  ],
};
