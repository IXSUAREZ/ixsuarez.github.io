/* Shared task definitions. Checklist answers live only in workspace.js memory. */
(() => {
  "use strict";
  const source = window.APP_META.sourceUrl;
  const categories = {
    "practical-test-prereqs": ["Test prerequisites", "#4f46e5"],
    "student-pilot": ["Student pilot", "#b37000"],
    "sport-pilot": ["Sport pilot", "#16803b"],
    "recreational-pilot": ["Recreational pilot", "#527b10"],
    "private-pilot": ["Private pilot", "#087ca7"],
    "commercial-pilot": ["Commercial pilot", "#a27916"],
    atp: ["ATP", "#2563eb"],
    "instrument-rating": ["Instrument rating", "#64748b"],
    "flight-instructor": ["Flight instructor", "#b73333"],
    "sport-pilot-instructor": ["Sport instructor", "#c25a16"],
    "additional-recurrent": ["Recurrent & aircraft", "#087f76"],
    "robinson-sfar73": ["Robinson SFAR 73", "#ba287a"],
    "specialty-operations": ["Specialty operations", "#7c3aed"],
  };
  const facts = {
    firstSolo:
      "Before first solo, review A.3 (knowledge), A.4 (flight training), and A.6 (make/model solo authorization). A.5 is additional for night solo.",
    soloWindow:
      "Under § 61.87(n), the instructor who gave the training endorses the specific make and model; the required training must be within the 90 days preceding the flight.",
    night:
      "A.5 expires 90 calendar days from the night training date. The required night training includes the airport where solo will occur; A.5 supplements current solo authority.",
    tsa: "Before covered flight training, resolve citizenship/nationality verification or the applicable TSA eligibility process. A.14 is the U.S. citizen/national logbook method under 49 CFR § 1552.15(c), not a substitute for the non-U.S. eligibility process.",
    testWindow:
      "A.1 certifies preparation received and logged within the 2 calendar months preceding the month of application, and readiness for the practical test. This is a training recency requirement, not simply a signature age.",
    ipc: "For a CFI conducting an IPC, verify the appropriate instrument instructor rating and aircraft authority. Section 61.57(d) also authorizes specified examiners and other approved persons; A.71 documents satisfactory completion.",
  };
  const item = (
    id,
    action,
    why,
    refs,
    conditional = false,
    endorsement = null,
  ) => ({ id, action, why, refs, conditional, endorsement });
  const intake = [
    item(
      "training-scope",
      "Establish the training goal",
      "Identify current certificate, intended rating, aircraft, and whether this training is covered by TSA requirements.",
      "49 CFR Part 1552; 14 CFR § 61.3",
    ),
    item(
      "tsa-review",
      "Resolve TSA eligibility before covered training",
      facts.tsa,
      "49 CFR §§ 1552.7, 1552.15",
    ),
    item(
      "citizenship-record",
      "Complete the applicable citizenship record",
      "For a U.S. citizen/national, use the permitted evidence-retention method or A.14 in both student and instructor records. Otherwise follow the applicable TSA eligibility process.",
      "49 CFR § 1552.15(c); AC 61-65K A.14",
      true,
      "A.14",
    ),
    item(
      "certificate",
      "Review certificate eligibility and application",
      "A student pilot certificate is needed before student solo, not before every dual lesson. Review age, language and application requirements for the intended certificate.",
      "14 CFR §§ 61.83, 61.85",
    ),
    item(
      "medical",
      "Resolve medical or other qualifying status",
      "Determine the medical qualification required for this pilot and operation; resolve it before solo when required.",
      "14 CFR §§ 61.3(c), 61.23",
      true,
    ),
    item(
      "records",
      "Set up training and instructor records",
      "Agree how training, endorsements and instructor records will be documented. Keep personal documents in your approved record system, outside this temporary checklist.",
      "14 CFR §§ 61.51, 61.189",
    ),
  ];
  const paths = window.BROWSE_STRUCTURE.flatMap((cat) =>
    cat.subcategories.map((p) => ({ ...p, category: cat.categoryId })),
  );
  const conditionalReason = (id, p) => {
    if (id === "A.76")
      return "Required before solo when the certificated pilot lacks the category/class rating for that aircraft; verify § 61.31(d)(2) and any applicable exceptions.";
    if (id === "A.49")
      return "Required for instructor airplane and glider applicants. Verify the applicable rating and whether a new spin endorsement is needed for this applicant; do not apply it to every instructor category or add-on.";
    if (["A.18", "A.19", "A.53", "A.54"].includes(id))
      return "Sport proficiency-check path only where permitted. Airplane/helicopter additions may require a practical test instead; check § 61.321 / § 61.419 and the FAA note.";
    if (["A.17", "A.29", "A.36", "A.38", "A.42"].includes(id))
      return "Review the applicable knowledge-test training completion evidence. An authorized instructor endorsement is one permitted method; an accepted course completion document may satisfy the prerequisite.";
    if (["A.45", "A.46", "A.51", "A.52"].includes(id))
      return "Verify the required training and applicable knowledge-test exemptions. These training endorsements are distinct from test-center authorization; instructor knowledge tests generally do not require evidence of training to sit the initial test (AC 61-65K § 9.2).";
    if (id === "A.1" && p.id === "instrument-checkride-bundle")
      return "A.44 combines instrument practical-test prerequisites and deficiency review. Check whether a separate A.1 is needed for the application; avoid duplicating equivalent documentation.";
    if (id === "A.14")
      return "Only for the U.S. citizenship/nationality logbook-record method; other TSA processes differ.";
    if (id === "A.2")
      return "Review reported knowledge-test deficiencies when applicable to this test.";
    if (["A.21", "A.22", "A.56"].includes(id))
      return "Examiner-issued or alternative outcome: verify the role and exact test outcome before marking reviewed.";
    if (
      [
        "additional-recurrent",
        "robinson-sfar73",
        "specialty-operations",
      ].includes(p.category) &&
      ![
        "instrument-proficiency-check",
        "solo-without-category-class",
        "retest-after-disapproval",
        "additional-category-or-class",
      ].includes(p.id)
    )
      return "Select the applicable operation, aircraft, qualification or alternative. These entries are not all required together.";
    if ((p.supplementalIds || []).includes(id) && id !== "A.1")
      return "Verify applicability, exemptions and any previously completed knowledge or training prerequisite for this applicant.";
    return null;
  };
  function task(pathId) {
    if (pathId === "new-student")
      return {
        id: pathId,
        label: "New student",
        category: "student-pilot",
        description:
          "Prepare for training, then resolve the prerequisites for solo.",
        items: [
          ...intake
            .filter((i) => !i.conditional)
            .map((i) => ({ ...i, section: "Prerequisites" })),
          ...intake
            .filter((i) => i.conditional)
            .map((i) => ({ ...i, section: "Conditional items" })),
          item(
            "review",
            "Review the next training milestone",
            "Checking these items records your review; it does not grant solo authority or issue an endorsement.",
            "14 CFR §§ 61.87, 61.189",
          ),
        ],
        group: "New student",
      };
    const p = paths.find((x) => x.id === pathId);
    if (!p) return null;
    const training = window.TRAINING_REQUIREMENT_CARDS;
    const card =
      training.subcategoryCards[p.category + "/" + p.id] ||
      training.categoryCards[p.category];
    let prerequisites = (card?.requirements || []).map((r, i) =>
      item("req-" + i, r.label, r.text, r.refs.join("; ")),
    );
    let ids = [
      ...new Set([...(p.primaryIds || []), ...(p.supplementalIds || [])]),
    ];
    if (
      [
        "first-solo",
        "night-solo",
        "solo-renewal",
        "initial-solo-xc",
        "repeated-solo-xc-50nm",
        "another-airport-within-25nm",
        "class-b-solo",
        "bcd-towered-solo",
      ].includes(pathId)
    ) {
      prerequisites = [
        item(
          "solo-documents",
          "Confirm eligibility, certificate and medical status",
          "Check the pilot’s documents and applicable student limitations before this solo operation.",
          "14 CFR §§ 61.3, 61.23, 61.83, 61.89",
        ),
        item(
          "tsa-review",
          "Confirm training-provider TSA review",
          facts.tsa,
          "49 CFR §§ 1552.7, 1552.15",
        ),
      ];
      if (pathId === "first-solo") ids = ["A.3", "A.4", "A.6", "A.5"];
      if (pathId === "night-solo") ids = ["A.3", "A.4", "A.5", "A.6", "A.7"];
      if (pathId !== "first-solo")
        prerequisites.push(
          item(
            "current-solo",
            "Verify the underlying solo authority",
            "Confirm A.3/A.4 and current make/model solo authorization; the route or airspace endorsement alone does not authorize solo.",
            "14 CFR §§ 61.87, 61.93, 61.95",
            false,
            "A.6",
          ),
        );
    }
    if (pathId === "pre-solo") prerequisites = [...intake, ...prerequisites];
    if (pathId === "instrument-checkride-bundle") ids.push("A.42");
    if (/add-on|additional-category-or-class/.test(pathId)) ids.push("A.76");
    if (pathId === "retest-after-disapproval") ids.push("A.1");
    prerequisites.push(
      item(
        "authority",
        "Verify instructor or examiner authority",
        "Review certificate ratings, privileges, recent experience and operation-specific restrictions. Coordinate examiner-only or approved-provider records with the authorized issuer.",
        "14 CFR §§ 61.193, 61.195, 61.197; AC 61-65K",
      ),
    );
    ids = [...new Set(ids)];
    const endorsements = ids.map((id) => {
      const e = window.ENDORSEMENTS.find((x) => x.id === id);
      let why = conditionalReason(id, p);
      if (pathId === "first-solo" && id === "A.5")
        why = "Required if night solo is planned. " + facts.night;
      if (pathId === "night-solo" && ["A.6", "A.7"].includes(id))
        why =
          "Verify current make/model solo authority: A.6 for the first period or A.7 for an additional period.";
      if (pathId === "retest-after-disapproval" && id === "A.1")
        why =
          "For a practical-test retest, review the new practical-test recommendation and its preparation requirements; not a knowledge-test retest item.";
      return item(
        "endorsement-" + id,
        "Review " + id + " · " + e.title,
        why ||
          (id === "A.1"
            ? facts.testWindow
            : id === "A.6"
              ? facts.soloWindow
              : id === "A.5"
                ? facts.night
                : "Confirm the required training, applicability, signer authority and logbook entry before use."),
        e.cfr.join("; ") + "; AC 61-65K " + id,
        !!why,
        id,
      );
    });
    return {
      ...p,
      oneOf:
        pathId === "night-solo"
          ? ["A.6", "A.7"]
          : pathId === "flight-review-and-wings"
            ? ["A.69", "A.70"]
            : pathId === "type-rating-practical-test-non-atp"
              ? ["A.79", "A.80"]
              : pathId === "type-rating-practical-test-atp"
                ? ["A.81", "A.82"]
                : [],
      items: [
        ...prerequisites.map((x) => ({ ...x, section: "Prerequisites" })),
        ...endorsements
          .filter((x) => !x.conditional)
          .map((x) => ({ ...x, section: "Required endorsements" })),
        ...endorsements
          .filter((x) => x.conditional)
          .map((x) => ({ ...x, section: "Conditional items" })),
        item(
          "completion",
          "Complete the instructor review",
          "Check that every applicable requirement is satisfied, unresolved conditions are resolved, and actual endorsements are separately issued and recorded by an authorized person. This checklist does not issue an endorsement.",
          "14 CFR § 61.189; AC 61-65K",
        ),
      ],
    };
  }
  const groups = [
    {
      id: "new",
      title: "New student",
      description: "Training intake, TSA review and a clear starting point.",
      ids: ["new-student", "pre-solo"],
    },
    {
      id: "solo",
      title: "Solo",
      description: "First solo, night, renewals and cross-country.",
      ids: paths
        .filter(
          (p) =>
            p.category === "student-pilot" &&
            !["pre-solo", "tsa-citizenship"].includes(p.id),
        )
        .map((p) => p.id),
    },
    {
      id: "knowledge",
      title: "Knowledge test",
      description: "Training, test recommendations and deficiency review.",
      ids: paths.filter((p) => /knowledge/.test(p.id)).map((p) => p.id),
    },
    {
      id: "checkride",
      title: "Checkride",
      description: "The full preparation and endorsement review.",
      ids: paths
        .filter(
          (p) =>
            /checkride|practical-test/.test(p.id) && !/type-rating/.test(p.id),
        )
        .map((p) => p.id)
        .concat(["retest-after-disapproval"]),
    },
    {
      id: "rating",
      title: "Add a rating",
      description: "Additional category, class and instructor ratings.",
      ids: paths
        .filter((p) =>
          /add-on|additional-category|additional-rating/.test(p.id),
        )
        .map((p) => p.id),
    },
    {
      id: "recurrent",
      title: "Recurrent & aircraft",
      description: "Flight reviews, IPCs, aircraft and specialty operations.",
      ids: paths
        .filter((p) =>
          [
            "additional-recurrent",
            "robinson-sfar73",
            "specialty-operations",
            "atp",
          ].includes(p.category),
        )
        .map((p) => p.id),
    },
  ];
  const guidanceModes = [
    ["journey", "Student Journey", "Follow training milestones"],
    ["scenarios", "Scenarios", "Work through common CFI situations"],
    ["reference", "Quick Reference", "Time limits, logbook and source index"],
    ["career", "CFI Career", "Recent experience and instructor qualifications"],
    ["dpe", "DPE Prep", "Review endorsement questions"],
    ["lesson", "Lesson Plan", "Teach endorsements and records"],
  ];
  const guidanceTopics = () => [
    ...window.JOURNEY_STAGES.map((x) => ({
      id: x.id,
      label: x.label,
      description: x.description,
      mode: "journey",
    })),
    ...window.SCENARIO_CARDS.map((x) => ({
      id: x.id,
      label: x.title,
      description: x.steps.join(" "),
      mode: "scenarios",
    })),
    ...GUIDANCE_SECTIONS.map((x) => ({
      id: x.id,
      label: x.title,
      description: x.content.map((b) => b.value).join(" "),
      mode: "lesson",
    })),
  ];
  function search(query) {
    const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    const match = (s) => terms.every((t) => s.toLowerCase().includes(t));
    return [
      ...["new-student", ...paths.map((x) => x.id)]
        .map(task)
        .filter((t) =>
          match(
            t.label +
              " " +
              t.id +
              " " +
              t.description +
              " " +
              t.items.map((i) => i.action + " " + i.why).join(" "),
          ),
        )
        .sort((a, b) => Number(match(b.label)) - Number(match(a.label)))
        .map((t) => ({
          type: "Task",
          id: t.id,
          title: t.label,
          description:
            (categories[t.category]?.[0] || "Instructor") +
            " · Complete workflow with requirements and conditions",
        })),
      ...window.ENDORSEMENTS.filter(
        (e) =>
          match(
            [e.id, e.title, e.cfr, e.aliases, e.tags, e.explanation].join(" "),
          ) ||
          paths
            .filter((p) => match(p.label))
            .some((p) => task(p.id).items.some((i) => i.endorsement === e.id)),
      ).map((e) => ({
        type: "Endorsement",
        id: e.id,
        title: e.title,
        description: e.cfr.join(" · "),
      })),
      ...guidanceTopics()
        .filter((g) => match(g.label + " " + g.description))
        .map((g) => ({
          type: "Guidance",
          id: g.id,
          title: g.label,
          description: g.description,
          mode: g.mode,
        })),
    ];
  }
  window.FLASHCARD_DECK.find((x) => x.id === "fc-01").answer =
    facts.firstSolo + " See § 61.87(b), (c), (n), (o).";
  window.FLASHCARD_DECK.find((x) => x.id === "fc-02").answer = facts.soloWindow;
  window.FLASHCARD_DECK.find((x) => x.id === "fc-07").answer = facts.testWindow;
  window.FLASHCARD_DECK.find((x) => x.id === "fc-12").answer = facts.ipc;
  window.JOURNEY_STAGES.find((x) => x.id === "first-solo").description =
    facts.firstSolo + " " + facts.soloWindow;
  window.JOURNEY_STAGES.find((x) => x.id === "pre-solo-flight").description =
    facts.night;
  window.QUICK_REF_DATA.acFarTable.find((x) => x.acRef === "A.5").expiration =
    "90 calendar days from night training";
  window.QUICK_REF_DATA.timeLimits.splice(1, 0, {
    limit: "90 Calendar Days · Night Solo",
    appliesTo: "A.5 night-solo training and authorization",
    governingFAR: "14 CFR § 61.87(o)",
    resetsWhen: facts.night,
    color: "student-pilot",
  });
  window.SEWorkspace = {
    categories,
    paths,
    task,
    groups,
    guidanceModes,
    guidanceTopics,
    search,
    facts,
    source,
  };
})();
