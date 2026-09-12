# FOI Cards source review

Review date: 2026-09-12. The deck contains 238 cards. This review checks the deck's declared source-page coverage and compares the subject areas represented by those pages with the FAA Aviation Instructor's Handbook (AIH), rather than asserting that every answer has been independently transcribed word-for-word.

## Sources and coverage map

The FAA's current handbook landing page identifies the Aviation Instructor's Handbook as a 2020 publication and provides chapter PDFs. The handbook is instructional guidance, not a regulation. The deck itself identifies its immediate source as **FOI Quick Review v2.14, updated April 5, 2026**, and uses `sourcePage` values 1–8. Those values are source-page labels in the Quick Review deck, not AIH chapter numbers.

| Deck sourcePage | Cards | Primary AIH coverage to verify | Review result |
| ---: | ---: | --- | --- |
| 1 | 29 | Ch. 2 Human Behavior; Ch. 3 The Learning Process | Topic alignment is plausible; exact defense-mechanism and motivation wording still needs page-level comparison. |
| 2 | 48 | Ch. 3 The Learning Process | Strong topic alignment for MUA, G-STEP, RAMP, CAAR, REEPIR, RUAC, memory, transfer, and SBT. Confirm the learning-style taxonomy against the cited edition. |
| 3 | 37 | Ch. 3 The Learning Process; Ch. 4 Effective Communication | Topic alignment is plausible; the short-term-memory duration and repetition claims should be checked against the source passage. |
| 4 | 29 | Ch. 4 Effective Communication; Ch. 5 The Teaching Process; Ch. 6 Assessment | Topic alignment is plausible for SSR, COIL, PAMS, objectives, teaching process, and delivery methods. |
| 5 | 43 | Ch. 6 Assessment; Ch. 7 Planning Instructional Activity | Topic alignment is plausible for FAST COCO, DR COVU, critiques, questions, and scenario planning. |
| 6 | 26 | Ch. 7 Planning Instructional Activity; Ch. 8 Instructor Responsibilities and Professionalism | Topic alignment is plausible for lesson planning, FIRCUPS, and professionalism mnemonics. |
| 7 | 18 | Ch. 8 Instructor Responsibilities and Professionalism; Ch. 9 Techniques of Flight Instruction | Mixed coverage is plausible; regulatory and flight-technique claims need a separate authority check. |
| 8 | 8 | Ch. 9 Techniques of Flight Instruction; Ch. 10 Teaching Practical Risk Management During Flight Instruction | Topic alignment is plausible for integrated instruction and ADM, but quantitative scanning and hazardous-attitude claims need exact source comparison. |

The FAA source page is [Aviation Instructor's Handbook](https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/aviation_instructors_handbook), last updated March 29, 2022. It links the individual chapter PDFs and the current chapter titles used above.

## Specific findings requiring correction or adjudication

These are concrete flags found by inspecting all 238 answers for regulatory, quantitative, or prescriptive claims. They are deliberately limited to claims where the answer extends beyond a plainly identifiable FOI concept.

| Severity | Card prompt | Finding | Evidence boundary |
| --- | --- | --- | --- |
| Resolved | What is the sterile cockpit rule? | Removed the unsupported 2,500-foot/10-minute threshold and now label §121.542 as applying to covered air-carrier operations, with GA adoption described as an instructor technique. | [14 CFR §121.542](https://www.ecfr.gov/current/title-14/chapter-I/subchapter-G/part-121/section-121.542); AIH Ch. 9 discusses maintaining a sterile flight deck during instruction. |
| Resolved | What is required before endorsing a first solo? | Reworded as a conservative summary of §61.87 training, proficiency, and make/model endorsement requirements, with an explicit non-exhaustive caveat. | [14 CFR §61.87](https://www.ecfr.gov/current/title-14/chapter-I/subchapter-D/part-61/section-61.87). |
| Resolved | What are the responsibilities identified for flight instructors? | Replaced the bundled checklist with examples and added §61.189 recordkeeping and §61.195 qualification/authorization references, with an explicit overview caveat. | [14 CFR §61.189](https://www.ecfr.gov/current/title-14/chapter-I/subchapter-D/part-61/section-61.189), [§61.195](https://www.ecfr.gov/current/title-14/chapter-I/subchapter-D/part-61/section-61.195). |
| Resolved | What is the “see and avoid” attention guideline? | Replaced the unsupported percentage with qualitative guidance: maintain outside scanning and appropriate instrument checks. The card now points to official §91.113(b) see-and-avoid authority. | [14 CFR §91.113(b)](https://www.ecfr.gov/current/title-14/chapter-I/subchapter-F/part-91/section-91.113). |
| Resolved | What are the decision-making process steps? | The three-step answer matches AIH Ch. 1’s headings: defining the problem, choosing a course of action, and implementing/evaluating the outcome. | [AIH Ch. 1](https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/aviation_instructors_handbook/03_aih_chapter_1.pdf), pp. 1-20–1-21. |
| Resolved | What is short-term memory? | AIH Ch. 3 states information is stored for roughly 30 seconds; the card is source-consistent. | [AIH Ch. 3](https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/aviation_instructors_handbook/05_aih_chapter_3.pdf), “Short-Term Memory (STM)”. |
| Resolved | Why does meaningful repetition aid recall? | AIH Ch. 3 states that research indicates three or four repetitions can provide maximum effect; retain this as an AIH-reported finding, not a universal law. | [AIH Ch. 3](https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/aviation_instructors_handbook/05_aih_chapter_3.pdf), “Meaningful Repetition Aids Recall”. |
| Resolved | What is denial? | Reworded as a defense mechanism refusing an uncomfortable truth and attributed to the AIH grouping of mechanisms protecting against unpleasant situations. | [AIH Chapter 2](https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/aviation_instructors_handbook/04_aih_chapter_2.pdf). |

## Verdict

The 238-card deck has complete declared coverage for source pages 1–8, unique prompts/IDs, and a structured official-reference map. The numeric claims reviewed in this pass are either supported by the AIH text or have been replaced with qualitative, source-bounded language. The existing `verify-content.mjs` check verifies metadata presence for every card; it does not prove word-for-word fidelity. Do not label the full deck “FAA-verified”; the metadata is a source map and the `sourceVerification` field explicitly preserves that evidence boundary.
