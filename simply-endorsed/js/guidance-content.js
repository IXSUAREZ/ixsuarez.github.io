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

/* ── Teaching Mode: Student Journey Stages ── */
window.JOURNEY_STAGES = [
  {
    id: "enrollment",
    label: "Enrollment",
    phase: "pre-solo",
    endorsements: [],
    regulation: "14 CFR §§ 61.83, 61.85, 61.23, 49 CFR § 1552.15(c)",
    description: "Before training begins, the student needs a student pilot certificate, qualifying medical, and TSA citizenship/eligibility verification. Dual instruction may start before these are fully in place.",
    timeLimit: null,
    gotchas: [
      "TSA verification is a training-provider compliance item — separate from the student pilot certificate and medical",
      "Student pilot certificates no longer expire (rule change) — but medical and endorsements still do",
      "IACRA or paper process accepted; CFI, DPE, ACR, or FSDO rep may act as authorized person",
    ],
    notes: [
      { label: "TSA Citizenship", id: "A.14", note: "If using the logbook-endorsement method for U.S. citizenship, " + AC_VERSION_LABEL + " A.14 provides the language" },
    ],
  },
  {
    id: "pre-solo-ground",
    label: "Pre-Solo Ground",
    phase: "pre-solo",
    endorsements: [
      { id: "A.3", label: "Pre-solo aeronautical knowledge" },
      { id: "A.4", label: "Pre-solo flight training" },
    ],
    regulation: "14 CFR § 61.87(b), § 61.87(c)(1)&(2)",
    description: "Before the first solo, the student must pass a knowledge test on all 14 subject areas in FAR 61.87(b) (A.3) and receive flight training in the maneuvers and procedures of FAR 61.87(c) (A.4). Both endorsements must be in the logbook before solo.",
    timeLimit: null,
    gotchas: [
      "All 14 knowledge areas in 61.87(b) must be covered — not a subset",
      "A.3 (ground) and A.4 (flight) are two separate endorsements — both required before solo",
      "Must be given by an authorized instructor",
      "The instructor who gives the flight training must also sign the A.6 solo endorsement",
    ],
    notes: [],
  },
  {
    id: "pre-solo-flight",
    label: "Pre-Solo Night (if applicable)",
    phase: "pre-solo",
    endorsements: [
      { id: "A.5", label: "Pre-solo flight training at night" },
    ],
    regulation: "14 CFR § 61.87(o)",
    description: "If the student will fly solo at night, the instructor must give specific night flight training at the airport where the solo will occur. The A.5 endorsement expires 90 calendar days from when the night training was received.",
    timeLimit: "90 calendar days from date of night training",
    gotchas: [
      "A.5 is only required if the student will solo at night — not required for daytime solo",
      "Training must be at the specific airport where night solo will occur",
      "A.5 expires 90 days from the training date — not the endorsement date",
      "A.5 is in addition to A.3 and A.4, not a replacement for either",
    ],
    notes: [],
  },
  {
    id: "first-solo",
    label: "First Solo",
    phase: "solo",
    endorsements: [
      { id: "A.3", label: "Pre-solo aeronautical knowledge" },
      { id: "A.4", label: "Pre-solo flight training" },
      { id: "A.6", label: "Solo flight (first 90-calendar-day period)" },
    ],
    regulation: "14 CFR § 61.87(b), § 61.87(c)(1)&(2), § 61.87(n)",
    description: "Before the student's first solo, all three endorsements must be in the logbook: A.3 (pre-solo knowledge test), A.4 (pre-solo flight training), and A.6 (solo authorization for a specific make and model). The A.6 opens a 90-day solo window and may only be issued by the instructor who gave the training.",
    timeLimit: "90 calendar days from date of A.6 endorsement",
    gotchas: [
      "All three endorsements — A.3, A.4, and A.6 — must be in the logbook before first solo",
      "Specific make AND model must be in A.6 — not just 'Cessna' but 'Cessna 172S'",
      "Only the instructor who provided the training may issue the A.6 (first solo)",
      "After 90 days, the student cannot act as PIC without a new A.7 endorsement",
      "The 90-day clock starts on the date of the A.6 endorsement, not the date of first flight",
    ],
    notes: [],
  },
  {
    id: "solo-renewal",
    label: "Solo Renewal",
    phase: "solo",
    endorsements: [
      { id: "A.7", label: "Solo flight (each additional 90-calendar-day period)" },
    ],
    regulation: "14 CFR § 61.87(p)",
    description: "Each time the 90-day solo window expires, an authorized instructor must review the student and issue a new A.7 endorsement to authorize another 90-day period. Unlike A.6, any authorized CFI may issue A.7 renewals.",
    timeLimit: "90 calendar days from date of endorsement",
    gotchas: [
      "Any authorized CFI may issue A.7 renewals — doesn't have to be the original instructor",
      "The instructor must actually review the student before endorsing — not a rubber stamp",
      "Each renewal opens a new 90-day window — not an extension of the original",
      "Student cannot fly solo PIC after the A.6 (or previous A.7) expires, even briefly",
    ],
    notes: [],
  },
  {
    id: "local-solo",
    label: "Local Solo Ops",
    phase: "solo",
    endorsements: [
      { id: "A.8", label: "Solo takeoffs and landings at another airport within 25 NM" },
    ],
    regulation: "14 CFR § 61.93(b)(1)",
    description: "To fly to another specific airport within 25 NM, the student needs an A.8 endorsement naming that airport. This is separate from the cross-country authorization.",
    timeLimit: null,
    gotchas: [
      "Each airport must be specifically named in the endorsement",
      "25 NM radius from the originating airport",
      "This is NOT the same as a cross-country endorsement",
    ],
    notes: [],
  },
  {
    id: "xc-training",
    label: "XC Training",
    phase: "cross-country",
    endorsements: [
      { id: "A.9", label: "Solo cross-country flight (category authorization)" },
      { id: "A.10", label: "Solo cross-country flight (per-flight planning review)" },
    ],
    regulation: "14 CFR § 61.93(c)(1)&(2), § 61.93(c)(3)",
    description: "Two endorsements are required for solo cross-country flights. A.9 is the one-time category authorization confirming the student received XC training. A.10 must be issued before each individual solo XC flight after reviewing the specific flight plan, weather, and route.",
    timeLimit: null,
    gotchas: [
      "A.9 is the general XC training authorization — it does not approve any specific flight",
      "A.10 is required before EVERY individual solo XC flight — no blanket authorization",
      "A.10 review must occur before each flight — must check weather, NOTAMs, route, fuel",
      "Category-specific — A.9 covers airplanes; different category would need a new endorsement",
      "A.11 may replace per-flight A.10 for repeated short-range XC routes (within 50 NM)",
    ],
    notes: [],
  },
  {
    id: "xc-per-flight",
    label: "XC Per-Flight",
    phase: "cross-country",
    endorsements: [
      { id: "A.10", label: "Solo cross-country flight planning (per individual flight)" },
    ],
    regulation: "14 CFR § 61.93(c)(3)",
    description: "Before each solo cross-country flight, the student must present their flight plan to an authorized instructor, who reviews it and endorses the student's logbook for that specific flight.",
    timeLimit: null,
    gotchas: [
      "A.10 is required before EVERY individual solo XC flight — no blanket authorization",
      "Must review weather, NOTAMs, route, alternates, fuel — the whole plan",
      "The review must occur before each flight, not at the beginning of the week",
      "Exception: A.11 may replace per-flight endorsements for repeated short-range XC flights",
    ],
    notes: [],
  },
  {
    id: "xc-repeated",
    label: "Repeated Short XC",
    phase: "cross-country",
    endorsements: [
      { id: "A.11", label: "Repeated solo cross-country flights not more than 50 NM" },
    ],
    regulation: "14 CFR § 61.93(b)(2)",
    description: "For repeated solo flights to the same destination within 50 NM (e.g., a practice XC route), an instructor may issue a single A.11 endorsement covering multiple flights rather than requiring A.10 before each one.",
    timeLimit: null,
    gotchas: [
      "Route must not exceed 50 NM from departure airport",
      "This replaces the per-flight A.10 only for these specific repeated flights",
      "Still requires A.9 general XC authorization",
    ],
    notes: [],
  },
  {
    id: "class-b",
    label: "Class B (if req.)",
    phase: "cross-country",
    endorsements: [
      { id: "A.12", label: "Solo flight in Class B airspace" },
      { id: "A.13", label: "Solo flight to/from/at a Class B airport" },
    ],
    regulation: "14 CFR § 61.95(a), § 61.95(b), § 91.131(b)(1)",
    description: "If the student's training requires flight in or to a Class B airport, specific endorsements are required. A.12 covers general Class B airspace; A.13 covers the specific Class B airport.",
    timeLimit: null,
    gotchas: [
      "Not all students need this — only required if their training involves Class B airspace",
      "A.12 (airspace) and A.13 (airport) are two distinct endorsements",
      "The DPE will ask about these even if not applicable to your students — know the requirement",
    ],
    notes: [],
  },
  {
    id: "knowledge-test",
    label: "Knowledge Test",
    phase: "checkride",
    endorsements: [
      { id: "A.36", label: "Aeronautical knowledge test — Private Pilot (ASEL)" },
    ],
    regulation: "14 CFR § 61.35(a)(1), § 61.103(d), § 61.105",
    description: "Before sitting for the FAA written knowledge test, the applicant must be endorsed by an authorized instructor certifying they received the required ground training or completed a home-study course. For private pilot airplane: A.36. The specific endorsement number varies by certificate level.",
    timeLimit: null,
    gotchas: [
      "A.36 is the Private Pilot example — commercial (A.38), instrument (A.42), CFI (A.46) each have their own endorsement",
      "A knowledge test result is valid for 24 calendar months for use at a practical test",
      "The endorsement must be in the logbook before the applicant sits for the written test",
      "A separate A.2 endorsement is required after the test to address any missed areas",
    ],
    notes: [],
  },
  {
    id: "checkride-prep",
    label: "Checkride Bundle",
    phase: "checkride",
    endorsements: [
      { id: "A.36", label: "Aeronautical knowledge test — Private Pilot (ASEL)" },
      { id: "A.2", label: "Review of deficiencies identified on airman knowledge test" },
      { id: "A.37", label: "Flight proficiency / practical test — Private Pilot (ASEL)" },
      { id: "A.1", label: "Prerequisites for practical test" },
    ],
    regulation: "14 CFR § 61.39(a)(6)",
    description: "The complete private pilot checkride endorsement package (ASEL example) requires four endorsements: A.36 (knowledge test prep, issued before the written), A.2 (knowledge test deficiency review, issued after the written), A.37 (flight proficiency, issued before the practical test), and A.1 (prerequisites, issued within 2 calendar months of the practical test).",
    timeLimit: "A.1 must be issued within 2 calendar months preceding the month of application",
    gotchas: [
      "A.36 comes first — must be in logbook before the applicant sits for the knowledge test",
      "A.2 must be issued AFTER the knowledge test report is received, and BEFORE the checkride",
      "A.37 (PPL) confirms flight proficiency — this is the certificate-specific endorsement",
      "A.1 is the 'prerequisites' endorsement — it expires if not used within 2 calendar months",
      "Every practical test attempt — pass or fail — uses up the A.1; a new one is required for any retest",
      "IACRA is preferred; most DPEs now require it. Paper 8710-1 is still accepted",
      "Applicant must hold at least a current third-class medical (FAR 61.23) in most cases",
    ],
    notes: [],
  },
];

/* ── Teaching Mode: Scenario Cards ── */
window.SCENARIO_CARDS = [
  {
    id: "failed-area",
    title: "Student failed one or more areas of operation on the checkride",
    tag: "Retesting",
    regulation: "14 CFR §§ 61.43(f), 61.49",
    steps: [
      "The practical test is complete — the attempt uses up the A.1 endorsement regardless of outcome",
      "The DPE issues a Notice of Disapproval (or unsatisfactory area notation if partial)",
      "The student must receive additional training in the failed area(s)",
      "The instructor must issue a new A.77 endorsement (retesting after failure) confirming training was given",
      "A new A.1 (prerequisites) endorsement is also required — within 2 calendar months of the new application",
      "Re-submit IACRA (or new 8710-1) before the retest",
      "If the retest is for specific failed areas only, it must be completed within 60 calendar days of the original test date to retain credit for passed areas",
    ],
    endorsements: [
      { id: "A.77", label: "Retesting after failure of a knowledge or practical test" },
      { id: "A.1", label: "Prerequisites for practical test (new endorsement required)" },
    ],
    timeLimit: "60 calendar days from the original test date to complete remainder and retain credit for passed areas",
    pitfalls: [
      "Students often don't realize a new A.1 AND A.77 are both required — not just A.77",
      "The 60-day clock runs from the original test date, not the date of disapproval paperwork",
      "After 60 calendar days, ALL areas must be re-tested from scratch",
    ],
  },
  {
    id: "discontinuance",
    title: "DPE issued a Letter of Discontinuance (weather, aircraft, safety of flight)",
    tag: "Retesting",
    regulation: "14 CFR §§ 61.43(e)-(f)",
    steps: [
      "The DPE issues a Letter of Discontinuance — this is NOT a failure",
      "The applicant retains credit for areas of operation already passed",
      "No new A.77 endorsement is required (discontinuance is not a failure)",
      "The existing A.1 must still be valid (within 2 calendar months) for the continuation",
      "The remainder of the test must be completed within 60 calendar days of the original start date",
      "The same DPE is not required for the continuation — any qualified DPE may complete it",
    ],
    endorsements: [],
    timeLimit: "60 calendar days from the original test date to complete the remainder",
    pitfalls: [
      "After 60 calendar days, all areas must be re-tested — the Letter of Discontinuance credit expires",
      "If the A.1 endorsement also expires (2-month limit), a new one must be issued before continuing",
      "Discontinuance ≠ Failure — no A.77 needed, no new A.1 unless the 2-month window expired",
    ],
  },
  {
    id: "add-multiengine",
    title: "Pilot wants to add a multiengine class rating to existing single-engine private certificate",
    tag: "Additional Ratings",
    regulation: "14 CFR § 61.63(c)",
    steps: [
      "Adding a class rating within the same category — FAR 61.63(c) applies",
      "No knowledge test required (applicant already holds private certificate at the same level)",
      "No need to meet the flight-time requirements for an initial class rating",
      "Provide required flight training in the multiengine airplane",
      "Issue A.78 (additional aircraft category/class rating) and A.1 (practical test prerequisites)",
      "If the multiengine airplane is complex, also issue A.72 (complex aircraft endorsement)",
      "Complete IACRA or 8710-1 and schedule the practical test",
    ],
    endorsements: [
      { id: "A.1", label: "Prerequisites for practical test" },
      { id: "A.78", label: "Additional aircraft category or class rating (other than ATP)" },
      { id: "A.72", label: "To act as PIC in a complex aircraft (if applicable)" },
    ],
    timeLimit: "A.1 must be within 2 calendar months preceding the month of application",
    pitfalls: [
      "Forgetting A.72 if the multiengine training aircraft is also complex (retractable gear + controllable prop + flaps)",
      "No knowledge test ≠ no preparation — the oral still covers all applicable ACS areas",
      "CFII required if adding instrument privileges concurrently",
    ],
  },
  {
    id: "sixty-day-expired",
    title: "60 calendar days have passed since the Letter of Discontinuance or partial failure",
    tag: "Time Limits",
    regulation: "14 CFR § 61.43(f)(1)",
    steps: [
      "Once 60 calendar days pass from the original test date, all credit for passed areas of operation is lost",
      "The applicant must re-accomplish the entire practical test",
      "A new A.1 endorsement is required (within 2 calendar months of the new application)",
      "If the original test ended in failure, a new A.77 is also required after additional training",
      "Re-submit IACRA or 8710-1 before the new attempt",
    ],
    endorsements: [
      { id: "A.1", label: "Prerequisites for practical test (new endorsement)" },
      { id: "A.77", label: "Retesting after failure (if original was a failure, not discontinuance)" },
    ],
    timeLimit: null,
    pitfalls: [
      "The 60-day window closes at midnight on the 60th calendar day — not 60 business days",
      "Even if the student passed 9 of 10 areas, after 60 days everything resets",
      "The 60-day limit and the 2-calendar-month A.1 expiration are separate — both must be checked",
    ],
  },
  {
    id: "flight-review",
    title: "Pilot needs a biennial flight review (BFR)",
    tag: "Recurrent",
    regulation: "14 CFR § 61.56(a)&(c)",
    steps: [
      "Any authorized CFI may conduct a flight review — instrument rating or additional ratings not required",
      "Minimum: 1 hour of flight training + 1 hour of ground training",
      "Ground must include review of 14 CFR Part 91 rules and regs",
      "Flight must include maneuvers and procedures that the instructor deems necessary",
      "If satisfactorily completed: endorse the pilot's logbook with A.69",
      "If not completed satisfactorily: no entry noting unsatisfactory performance is required; however, log the instruction given in your records",
    ],
    endorsements: [
      { id: "A.69", label: "Flight review completion" },
    ],
    timeLimit: "Required within the preceding 24 calendar months (per FAR 61.56)",
    pitfalls: [
      "No logbook entry for 'failed flight review' is required — and making one could be harmful to the pilot",
      "The instructor must still log the instruction given in their own records (FAR 61.189)",
      "A practical test or proficiency check for any certificate/rating also satisfies the flight review requirement",
    ],
  },
  {
    id: "ipc",
    title: "Instrument-rated pilot needs an Instrument Proficiency Check (IPC)",
    tag: "Recurrent",
    regulation: "14 CFR § 61.57(d)",
    steps: [
      "An IPC requires a CFII (Certificated Flight Instructor – Instrument) — a standard CFI cannot conduct one",
      "May be conducted in aircraft or an approved FTD/ATD",
      "Must include the tasks and maneuvers in the Instrument Rating ACS or the instrument section of the applicable PTS",
      "If satisfactorily completed: endorse the pilot's logbook with A.71",
      "If not completed: no unsatisfactory-performance entry required; log instruction given in your records",
    ],
    endorsements: [
      { id: "A.71", label: "Instrument proficiency check completion" },
    ],
    timeLimit: "Required when instrument currency (6 approaches, holds, tracking, interception in preceding 6 calendar months) has lapsed",
    pitfalls: [
      "A standard CFI (not CFII) cannot conduct an IPC",
      "An IPC is different from instrument currency — currency is self-conducted; an IPC resets it after a lapse",
      "No unsatisfactory-performance entry required — same rule as the flight review",
    ],
  },
  {
    id: "solo-wrong-category",
    title: "Student or pilot wants to solo an aircraft in a category/class they don't hold",
    tag: "Special",
    regulation: "14 CFR § 61.31(d)(2)",
    steps: [
      "FAR 61.31(d)(2) allows solo flight without the appropriate category/class rating if training has been received",
      "The instructor must have given the required training for that category/class",
      "Issue A.76 endorsement (Solo PIC when pilot does not hold appropriate category/class rating)",
      "Log the endorsement in the student's logbook and in your instructor records",
    ],
    endorsements: [
      { id: "A.76", label: "Solo PIC when pilot does not hold appropriate category/class" },
    ],
    timeLimit: null,
    pitfalls: [
      "A.76 does not grant a rating — it is a limited endorsement allowing solo for training purposes only",
      "The instructor must be authorized to give training in that category/class",
      "This also applies to students training for an additional rating (e.g., helicopter, glider, multiengine)",
    ],
  },
  {
    id: "planned-increments",
    title: "Practical test was planned in increments and not completed on the same date",
    tag: "Time Limits",
    regulation: "14 CFR § 61.39(g)-(h)",
    steps: [
      "Some examiners conduct practical tests in planned increments (e.g., oral one day, flight another day)",
      "FAR 61.39(g) requires all increments to be completed within 2 calendar months of the date the first increment was completed",
      "If not completed within 2 calendar months, the entire test must be re-accomplished (FAR 61.39(h))",
      "A new A.1 endorsement is required before any re-accomplishment",
    ],
    endorsements: [
      { id: "A.1", label: "Prerequisites for practical test (new endorsement if re-accomplishing)" },
    ],
    timeLimit: "2 calendar months from the date the first increment was completed",
    pitfalls: [
      "This 2-month limit is SEPARATE from the 60-day discontinuance credit window",
      "The 2-month limit applies even if there was no failure or discontinuance — it applies to planned multi-day tests",
      "'2 calendar months' means through the last day of the month that is 2 months later — e.g., test started March 15 → must complete by May 31",
    ],
  },
];

/* ── Teaching Mode: Quick Reference Data ── */
window.QUICK_REF_DATA = {

  timeLimits: [
    {
      limit: "90 Calendar Days",
      appliesTo: "Student pilot solo privileges (A.6 first solo, A.7 renewals)",
      governingFAR: "14 CFR § 61.87(n), § 61.87(p)",
      resetsWhen: "New A.7 solo renewal endorsement issued after instructor review",
      color: "student-pilot",
    },
    {
      limit: "2 Calendar Months",
      appliesTo: "A.1 'Prerequisites' endorsement — must be issued within 2 calendar months preceding month of practical test application",
      governingFAR: "14 CFR § 61.39(a)(6)",
      resetsWhen: "New A.1 issued by authorized instructor before each application",
      color: "practical-test-prereqs",
    },
    {
      limit: "2 Calendar Months",
      appliesTo: "Completion of a practical test conducted in planned increments",
      governingFAR: "14 CFR § 61.39(g)-(h)",
      resetsWhen: "Must re-accomplish entire test if not completed; new A.1 required",
      color: "practical-test-prereqs",
    },
    {
      limit: "60 Calendar Days",
      appliesTo: "Credit for passed areas after discontinuance or partial failure",
      governingFAR: "14 CFR § 61.43(f)(1)",
      resetsWhen: "Credit expires after 60 days; entire test must be re-accomplished",
      color: "additional-recurrent",
    },
    {
      limit: "24 Calendar Months",
      appliesTo: "Flight review requirement for all pilots exercising PIC privileges",
      governingFAR: "14 CFR § 61.56",
      resetsWhen: "Completion of a flight review (A.69) or successful practical test/proficiency check",
      color: "additional-recurrent",
    },
    {
      limit: "3 Years (36 months)",
      appliesTo: "CFI recordkeeping — endorsement records must be retained",
      governingFAR: "14 CFR § 61.189",
      resetsWhen: "Continuous requirement — records must be kept for at least 3 years from date of endorsement",
      color: "flight-instructor",
    },
  ],

  logbookChecklist: [
    "Date of the flight",
    "Aircraft identification (N-number or registration)",
    "Aircraft make and model",
    "Type of experience (Solo, PIC, SIC, Dual, etc.)",
    "Total flight time for the entry",
    "Flight conditions (Day, Night, Instrument, Simulated Instrument)",
    "Location of departure and arrival airports",
    "Name of safety pilot, if a safety pilot was required",
  ],

  acFarTable: [
    { acRef: "A.1", far: "§ 61.39(a)(6)(i)&(ii)", use: "Prerequisites for practical test", expiration: "2 calendar months" },
    { acRef: "A.2", far: "§ 61.39(a)(6)(iii)", use: "Review of deficiencies on knowledge test report", expiration: "None" },
    { acRef: "A.3", far: "§ 61.87(b)", use: "Pre-solo aeronautical knowledge", expiration: "None" },
    { acRef: "A.4", far: "§ 61.87(c)(1)&(2)", use: "Pre-solo flight training", expiration: "None" },
    { acRef: "A.5", far: "§ 61.87(o)", use: "Pre-solo flight training at night", expiration: "None" },
    { acRef: "A.6", far: "§ 61.87(n)", use: "Solo flight – first 90-day period", expiration: "90 calendar days" },
    { acRef: "A.7", far: "§ 61.87(p)", use: "Solo flight – each additional 90-day period", expiration: "90 calendar days" },
    { acRef: "A.8", far: "§ 61.93(b)(1)", use: "Solo takeoffs/landings at another airport within 25 NM", expiration: "None" },
    { acRef: "A.9", far: "§ 61.93(c)(1)&(2)", use: "Solo XC training (category-specific authorization)", expiration: "None" },
    { acRef: "A.10", far: "§ 61.93(c)(3)", use: "Solo XC flight planning – per individual flight", expiration: "Per flight" },
    { acRef: "A.11", far: "§ 61.93(b)(2)", use: "Repeated solo XC flights ≤ 50 NM from departure", expiration: "None" },
    { acRef: "A.12", far: "§ 61.95(a)", use: "Solo flight in Class B airspace", expiration: "None" },
    { acRef: "A.13", far: "§ 61.95(b), § 91.131(b)(1)", use: "Solo flight to/from/at a Class B airport", expiration: "None" },
    { acRef: "A.14", far: "49 CFR § 1552.3(h)", use: "TSA U.S. citizenship endorsement", expiration: "None" },
    { acRef: "A.36", far: "§ 61.35(a)(1), 61.103(d), 61.105", use: "Aeronautical knowledge test (Private Pilot)", expiration: "None" },
    { acRef: "A.37", far: "§ 61.103(f), 61.107(b), 61.109", use: "Flight proficiency/practical test (Private Pilot)", expiration: "None" },
    { acRef: "A.69", far: "§ 61.56(a)&(c)", use: "Flight review completion", expiration: "None" },
    { acRef: "A.71", far: "§ 61.57(d)", use: "Instrument proficiency check (IPC) completion", expiration: "None" },
    { acRef: "A.72", far: "§ 61.31(e)", use: "Complex aircraft PIC endorsement", expiration: "None" },
    { acRef: "A.76", far: "§ 61.31(d)(2)", use: "Solo PIC without appropriate category/class rating", expiration: "None" },
    { acRef: "A.77", far: "§ 61.49", use: "Retesting after failure of knowledge or practical test", expiration: "None" },
    { acRef: "A.78", far: "§ 61.63(c)", use: "Additional aircraft category or class rating (other than ATP)", expiration: "None" },
  ],

  sfarList: [
    { id: "SFAR 73", title: "Robinson R-22 / R-44 Special Training & Experience Requirements", note: "Not applicable to fixed-wing airplanes, but sample endorsements appear in " + AC_VERSION_LABEL + ". Review when endorsing students training in Robinson helicopters." },
    { id: "SFAR 100-2", title: "Relief for U.S. Military and Civilians Assigned Outside the U.S.", note: "Provides relief for military personnel and DoD civilians supporting Armed Forces operations who cannot meet standard currency requirements while deployed." },
    { id: "Part 91 Regional SFARs", title: "Prohibited Flight Regions", note: "Part 91 SFARs generally prohibit flight in specific regions (e.g., Damascus, Pyongyang, Tehran, Somalia airspace). Review applicable SFARs when endorsing students operating internationally." },
  ],
};

/* ── Teaching Mode: CFI Career Data ── */
window.CFI_CAREER_DATA = {

  prePostDec2024: {
    before: "Certificates issued before December 1, 2024 expire 24 calendar months from the month issued, renewed, or reinstated (Exception: FAR 61.197(b)). Renewal is required every 2 years.",
    after: "Certificates issued on or after December 1, 2024 are issued without an expiration date. However, instructors must still satisfy recent experience requirements every 24 calendar months to maintain instructional privileges.",
  },

  renewalPathways: [
    {
      id: "checkride",
      title: "Pass a Practical Test",
      timeFrame: "Within previous 24 calendar months",
      description: "Pass a practical test for one of the ratings listed on your instructor certificate, or for an additional flight instructor rating.",
      notes: "Most direct path — also adds or upgrades your ratings.",
      icon: "checkride",
    },
    {
      id: "pass-rate",
      title: "80% Pass Rate — 5+ Applicants",
      timeFrame: "Within previous 24 calendar months",
      description: "Submit documentation showing you endorsed 5 or more applicants for a practical test and achieved an 80% or better first-attempt pass rate.",
      notes: "Qualifying for a Gold Seal certificate may be done simultaneously.",
      icon: "gold-seal",
    },
    {
      id: "evaluator",
      title: "Evaluative Position",
      timeFrame: "Within previous 24 calendar months",
      description: "Serve in an evaluative or instructional oversight role: company check pilot, check airman, chief flight instructor, Part 121 or 135 instructor, or similar qualified position.",
      notes: "Must hold the position and conduct evaluations during that 24-month window.",
      icon: "evaluator",
    },
    {
      id: "firc",
      title: "Approved FIRC",
      timeFrame: "Within previous 3 calendar months",
      description: "Complete a Flight Instructor Refresher Course (FIRC) that meets the standards of AC 61-83.",
      notes: "Shorter window than other pathways — 3 months, not 24. Plan accordingly.",
      icon: "firc",
    },
    {
      id: "military",
      title: "Military Proficiency Check",
      timeFrame: "Within previous 24 calendar months",
      description: "Pass a military instructor pilot or pilot examiner proficiency check in an aircraft within the preceding 24 calendar months.",
      notes: "Applies to military instructor pilots maintaining both FAA and military credentials.",
      icon: "military",
    },
    {
      id: "wings",
      title: "FAA WINGS Program",
      timeFrame: "1 Phase completed within previous 12 months; 15 activities evaluated",
      description: "Complete an FAA-sponsored pilot proficiency program (WINGS) meeting all three conditions: hold a current CFI, complete at least 1 phase in the last 12 months, and evaluate and endorse 15 flight activities for at least 5 different pilots.",
      notes: "See AC 61-91 for full WINGS program details. All three conditions must be met simultaneously.",
      icon: "wings",
    },
  ],

  reinstatement: {
    within3Months: {
      heading: "Expired ≤ 3 Calendar Months",
      path: "An expired certificate may be reinstated via an approved FIRC (Flight Instructor Refresher Course) that meets AC 61-83 standards.",
      note: "No instructional privileges may be exercised during this reinstatement period — until the application is submitted and the certificate is reinstated.",
    },
    after3Months: {
      heading: "Expired > 3 Calendar Months",
      path: "Must pass a practical test for one of the ratings on the expired certificate, a practical test for an additional flight instructor rating, or a military instructor pilot/pilot examiner proficiency check.",
      note: "A FIRC alone is not sufficient after the 3-month window closes. A full practical test is required.",
    },
    documentation: "Submit an Airman Certificate and/or Rating Application (Form 8710-1 or 8710-11) to validate recent experience or reinstate privileges.",
  },

  initialCfiTrainer: {
    groundOptions: [
      "Held the appropriate instructor certificate for 24+ months AND given 40+ hours of ground training, OR",
      "Held the appropriate instructor certificate AND given 100+ hours of ground training in an FAA-approved course",
    ],
    flightOptions: [
      "Held a flight instructor certificate for at least 24 months AND given at least 200 hours of flight training, OR",
      "Maintained an 80%+ practical test pass rate for at least 5 applicants in the last 24 months, OR",
      "Provided 200 hours of flight training AND completed a Flight Instructor Enhanced Qualification Training Program (FIEQTP) under Part 141 — per FAR 61.95(h)(3) and AC 61-145",
    ],
    effectiveDate: "December 1, 2024",
  },
};

/* ── Teaching Mode: DPE Prep Flashcards ── */
window.FLASHCARD_DECK = [
  {
    id: "fc-01",
    category: "Student Endorsements",
    question: "What are the three pre-solo endorsements a student must have before their first solo flight?",
    answer: "A.3 — Pre-solo aeronautical knowledge (FAR 61.87(b)), A.4 — Pre-solo flight training (FAR 61.87(c)), and A.5 — Pre-solo flight training at night (FAR 61.87(o)) if night solo is planned. All must be in the logbook before the first solo.",
  },
  {
    id: "fc-02",
    category: "Student Endorsements",
    question: "How long is a first solo endorsement (A.6) valid, and who may issue it?",
    answer: "90 calendar days from the date of the endorsement (FAR 61.87(n)). The instructor who gave the training must issue the A.6 first solo endorsement. The endorsement must list the specific make and model of aircraft.",
  },
  {
    id: "fc-03",
    category: "Student Endorsements",
    question: "Your student's 90-day solo endorsement expired yesterday. What must you do before they fly solo again?",
    answer: "Review the student and issue a new A.7 endorsement (solo flight — each additional 90-day period, FAR 61.87(p)). Any authorized CFI may issue A.7 renewals — it does not have to be the original instructor.",
  },
  {
    id: "fc-04",
    category: "Student Endorsements",
    question: "What endorsement is required before each individual solo cross-country flight, and what must the instructor review?",
    answer: "A.10 — Solo cross-country flight planning (FAR 61.93(c)(3)). Before each flight, the instructor must review: the route, weather, NOTAMs, fuel requirements, and alternates. It cannot be issued in advance for future flights.",
  },
  {
    id: "fc-05",
    category: "Logbook Entries",
    question: "What are the 8 required elements of a logbook entry under FAR 61.51?",
    answer: "(1) Date, (2) Aircraft identification (N-number), (3) Aircraft make and model, (4) Type of experience (Solo, PIC, Dual, etc.), (5) Total flight time, (6) Flight conditions (Day, Night, Instrument, Simulated Instrument), (7) Departure and arrival locations, (8) Name of safety pilot, if required.",
  },
  {
    id: "fc-06",
    category: "Logbook Entries",
    question: "How long must a CFI retain records of endorsements, and what records are required?",
    answer: "At least 3 years (FAR 61.189). Required records: (1) name of each person endorsed for solo flight and the date of endorsement, (2) name of each person endorsed for a knowledge or practical test, the kind of test, date, and results.",
  },
  {
    id: "fc-07",
    category: "Practical Test",
    question: "Within what time frame must the A.1 (prerequisites for practical test) endorsement be issued?",
    answer: "Within 2 calendar months preceding the month of application (FAR 61.39(a)(6)). For example, if the checkride is in May, the A.1 must have been issued in March, April, or May.",
  },
  {
    id: "fc-08",
    category: "Practical Test",
    question: "Your student fails the knowledge test. What must you do before they can take the practical test?",
    answer: "Review all areas of deficiency identified on the Airman Knowledge Test Report, then issue an A.2 endorsement (review of deficiencies, FAR 61.39(a)(6)(iii)) confirming the student now has satisfactory knowledge in those areas. The A.2 is required before every practical test.",
  },
  {
    id: "fc-09",
    category: "Retesting",
    question: "Your student fails one area of operation on the checkride. What endorsements are needed before the retest, and what time limit applies?",
    answer: "Both A.77 (retesting after failure, after additional training, FAR 61.49) AND a new A.1 (prerequisites, within 2 calendar months). To retain credit for passed areas, the remainder must be completed within 60 calendar days of the original test date (FAR 61.43(f)).",
  },
  {
    id: "fc-10",
    category: "Retesting",
    question: "What is the difference between the 60-calendar-day limit and the 2-calendar-month limit?",
    answer: "60 calendar days (FAR 61.43(f)): governs credit retention for passed areas after discontinuance or partial failure — after 60 days, all areas must be re-tested. 2 calendar months (FAR 61.39(g)): governs completion of a practical test conducted in planned increments — if not done in 2 months, entire test must be re-accomplished. Neither is related to the 90-day solo window.",
  },
  {
    id: "fc-11",
    category: "Recurrent",
    question: "A pilot's flight review has lapsed. Who can conduct it, what are the minimums, and what endorsement is given?",
    answer: "Any authorized CFI. Minimum: 1 hour of ground training (reviewing Part 91) and 1 hour of flight training. After satisfactory completion: A.69 endorsement in the pilot's logbook (FAR 61.56(a)&(c)). No unsatisfactory-performance entry is required if the review is not completed, but log the instruction given.",
  },
  {
    id: "fc-12",
    category: "Recurrent",
    question: "Who can conduct an IPC, and what endorsement is given?",
    answer: "Only a CFII (Certificated Flight Instructor – Instrument) — a standard CFI cannot conduct an IPC. After satisfactory completion: A.71 in the pilot's logbook (FAR 61.57(d)). As with the flight review, no unsatisfactory-performance entry is required, but log the instruction.",
  },
  {
    id: "fc-13",
    category: "CFI Career",
    question: "Name the 6 ways a CFI can satisfy the recent experience requirement to maintain instructional privileges.",
    answer: "(1) Pass a practical test for a rating on the certificate or additional instructor rating. (2) Document 5+ applicants endorsed for checkride with 80%+ first-attempt pass rate. (3) Hold an evaluative position (check pilot, chief instructor, Part 121/135 instructor). (4) Complete an approved FIRC (within 3 calendar months). (5) Pass a military instructor/examiner proficiency check. (6) Complete the FAA WINGS program. All must be within the previous 24 calendar months (FIRC: 3 months).",
  },
  {
    id: "fc-14",
    category: "CFI Career",
    question: "Your CFI certificate expired 2 months ago. How do you reinstate it?",
    answer: "Within 3 calendar months of expiration: complete an approved FIRC (AC 61-83). No instructional privileges may be exercised during this period — submit the application first. Then reinstatement is processed. You may NOT instruct while expired even if the FIRC is done.",
  },
  {
    id: "fc-15",
    category: "CFI Career",
    question: "Your CFI certificate expired 5 months ago. What must you do to reinstate it?",
    answer: "After 3 calendar months of expiration, a FIRC alone is insufficient. You must pass a practical test for one of the ratings on your expired certificate, a practical test for an additional instructor rating, or a military instructor pilot/pilot examiner proficiency check (FAR 61.199, effective December 1, 2024).",
  },
];
