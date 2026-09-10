# Simply Endorsed — implementation review

Local preview: **http://127.0.0.1:8765/simply-endorsed-cfi/**

Implemented for local review on September 10, 2026. Nothing has been published.

## What changed

- Tasks is the default destination, with New student, Solo, Knowledge test, Checkride, Add a rating, and Recurrent & aircraft workflows. Library and all six Guidance modes remain accessible.
- The 71 existing browsing paths and 96 public endorsement IDs are preserved. Every path has an addressable task review. Legacy category, subcategory, bundle, expanded endorsement, and calculator redirect links remain supported.
- One temporary checklist stays available during in-app navigation. It supports To do, Done, and conditional Not applicable. Reloading or starting a new checklist clears the review. Answers and pilot context are held only in JavaScript memory.
- Complete packages are visible without “Show full bundle.” Search ranks matching workflows first; “first solo” also finds A.4 through its task association. Article task links lead directly into the relevant workflow.
- Prerequisites, required endorsements, conditional items, and completion review are separated. Completion is blocked while earlier items or required alternatives remain unresolved. For example, flight review and WINGS cannot both be dismissed as not applicable and still complete that task.
- Current certificate and aircraft context remain visible for instructor review. The selected task supplies the goal. Context does not silently hide requirements or automatically determine legal eligibility; applicability remains an explicit instructor decision.
- One detail renderer serves desktop and mobile. FAA explanatory notes are separated from model wording; copying has one purpose. A.40/A.41 provider instructions are not presented as reusable CFI signoffs.
- At 1024px and above, a selected endorsement appears alongside the task or library. Below 1024px it opens as a dedicated view with a return button. Mobile guidance uses one section selector and labeled reference entries. Text sizes use rem units for enlargement.

## Verification

- `npm run test:workspace`: **1,200 assertions passed**. Includes all 71 path routes, all 96 detail routes, six guidance modes, valid endorsement references, unique checklist items, first-solo and checkride packages, alternative applicability, state preservation, reset/reload, no browser-storage writes, empty states, copy-note separation, and content regressions.
- `npm test`: **93 tests passed**, including the existing calculator and routing suite. Four legacy browse tests were updated for native links, the shared detail view, and return-focus behavior.
- Browser checks: 1440 × 1000 desktop; 834 × 1194 tablet portrait; 1024 × 768 tablet landscape; 390 × 844 mobile; and 320 × 844 narrow mobile.
- No horizontal page overflow or clipped operational reading text in the inspected states. The site header now scrolls away instead of covering the sticky checklist controls.
- Verified keyboard Enter/Space disclosure, keyboard return from details, restored opener focus, native select labels, hidden detail/list semantics, and accessible progress/status output. These were browser/AX checks, not a full assistive-technology certification.
- A reproducible `tests/text-size-preview.html` fixture tests 200% root text sizing. At 320px, body text is 32px and reading content reflows without horizontal page scrolling.

To restart the preview from the repository root:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

## Content reconciliation

The implementation retains the FAA model text dataset and references it rather than generating new endorsement language. Targeted corrections reconcile first solo (A.3/A.4/A.6, plus A.5 for night), night-training timing, TSA references and training order, A.1 preparation recency, knowledge-test retesting, initial-CFI trainer qualifications, and recent-experience reinstatement. Shared solo and timing facts feed the new task, journey, reference, and flashcard presentations.

Primary sources used:

- [FAA AC 61-65K](https://www.faa.gov/documentLibrary/media/Advisory_Circular/AC_61-65K.pdf), issued November 14, 2025: model wording, issuer notes, training/test documentation, and Appendix A references.
- [14 CFR 61.87](https://www.ecfr.gov/current/title-14/chapter-I/subchapter-D/part-61/subpart-C/section-61.87): solo requirements.
- [14 CFR 61.195](https://www.ecfr.gov/current/title-14/chapter-I/subchapter-D/part-61/subpart-H/section-61.195): instructor limitations and initial-instructor trainers.
- [14 CFR 61.197](https://www.ecfr.gov/current/title-14/chapter-I/subchapter-D/part-61/subpart-H/section-61.197) and [61.199](https://www.ecfr.gov/current/title-14/chapter-I/subchapter-D/part-61/subpart-H/section-61.199): recent experience and reinstatement.
- [14 CFR 61.57](https://www.ecfr.gov/current/title-14/chapter-I/subchapter-D/part-61/subpart-A/section-61.57): IPC authority.

All path/data references were checked structurally. The content work is targeted reconciliation against these sources, not a claim of independent regulatory certification of every possible aircraft, applicant, exception, or specialty operation. The workspace records instructor review; actual endorsements are separately issued and recorded by the authorized person.

## Before and after

Desktop, before:

![Previous desktop library](</Users/diegosuarez/Desktop/VIBE CODING PROJECTS/SUAREZ.CFI/output/playwright/simply-endorsed-audit-2026-09-10/01-desktop-library.png>)

Desktop, after:

![Task-first desktop workspace](</Users/diegosuarez/Desktop/VIBE CODING PROJECTS/SUAREZ.CFI/output/playwright/simply-endorsed-workspace-2026-09-10/10-desktop-task-workspace.png>)

Tablet, before:

![Previous tablet bundle](</Users/diegosuarez/Desktop/VIBE CODING PROJECTS/SUAREZ.CFI/output/playwright/simply-endorsed-audit-2026-09-10/19-tablet-private-bundle.png>)

Tablet, after:

![All four bundle entries visible on tablet](</Users/diegosuarez/Desktop/VIBE CODING PROJECTS/SUAREZ.CFI/output/playwright/simply-endorsed-workspace-2026-09-10/04-tablet-full-private-bundle.png>)

Mobile, before:

![Previous mobile reference](</Users/diegosuarez/Desktop/VIBE CODING PROJECTS/SUAREZ.CFI/output/playwright/simply-endorsed-audit-2026-09-10/13-mobile-quick-reference.png>)

Mobile, after:

![Labeled mobile reference entries](</Users/diegosuarez/Desktop/VIBE CODING PROJECTS/SUAREZ.CFI/output/playwright/simply-endorsed-workspace-2026-09-10/09-mobile-reference-final.png>)

[Additional verification screenshots](</Users/diegosuarez/Desktop/VIBE CODING PROJECTS/SUAREZ.CFI/output/playwright/simply-endorsed-workspace-2026-09-10>) include the active checklist, shared detail, landscape breakpoint, 320px reference, and enlarged-text fixture.
