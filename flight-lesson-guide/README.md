# Flight Lesson Guide

Original, aircraft-neutral Part 61 flight teaching plans for Private, Sport, Instrument, Commercial, CFI, CFII, initial MEI and MEI add-on. The static app offers a full teaching view and a compact cockpit sequence, plus US Letter PDF guides with navigable lesson indexes.

The student routes follow the current publisher sources reviewed on October 10, 2026:

| Route | Source | Edition |
| --- | --- | --- |
| Private | Sporty's Academy Part 141 TCO | Version 20, June 17, 2026 |
| Sport | Learn to Fly course portal TCO | October 2025, linked by the current 2026 Sport track |
| Instrument | Sporty's Academy Part 141 TCO | Version 18, June 17, 2026 |
| Commercial | Sporty's Academy Part 141 TCO | Version 17, June 17, 2026 |
| Instructor routes | Original FAA-grounded curriculum | Current linked ACS/PTS; authored 90/120-minute plans |

Publisher flight/device and discussion targets are facts from the individual lesson pages. The authored exercise allocation and any longer briefing/debrief are recommendations. Where publisher tables disagree with lesson pages, the individual page target is used and the discrepancy is shown. A Part 141 source sequence does not establish Part 61 eligibility or minimum hours. Aircraft values and permitted maneuvers come from the applicable POH/AFM, approved procedures and current regulations/standards.

The detailed teaching layer, timing allocations and checklists are original prose. Publisher PDFs, full extractions and private source-task accountability ledgers are not shipped. Source references link to their owners. More source tasks than can reasonably be taught in a target are explicitly carried forward; time and checkmarks do not prove proficiency.

Checklists, exercise timers and pacing edits live in memory only. Reload and Reset session create fresh state. There are no student records, accounts or stored progress. Shared site appearance preferences remain controlled by the site appearance system.

The service worker is scoped to `/flight-lesson-guide/`. It caches only authored guide assets, an explicit shared-asset allowlist and user-selected authored PDFs. It does not cache publisher sources or APIs, and removes only caches with its own prefix. Online use is required to prepare the guide and selected PDFs for offline use.

Release validation includes curriculum target/step reconciliation, source-ID coverage, distinct flight/device/airborne clocks, current source corrections, responsive Day/Night interactions, checklist/timer resets, offline reload, PDF layout/navigation and live byte comparison. `BUILD.json` records the deployed authored payload and PDF hashes. Final release evidence is retained in the private project QA folder.
