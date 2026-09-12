# Simply Endorsed educational content audit

Audit date: 2026-09-12. This is a bounded static audit of the 20 pages under `simply-endorsed/blog/`, the generated SEO copy source (`build-seo-content.js`), and the structured endorsement/training data used by the lookup and calculator. It is an inventory of source coverage and claim risk; it is not a claim that every article has been line-by-line validated.

## Authority checked

| Source | Version/date checked | Relevant sections | Direct source |
| --- | --- | --- | --- |
| FAA AC 61-65K | Issued 2025-11-14; current FAA PDF retrieved 2026-09-12 | §§ 14, 20.7, 20.10–20.11; Appendix A A.1–A.16 and A.71 | [FAA AC 61-65K PDF](https://www.faa.gov/documentLibrary/media/Advisory_Circular/AC_61-65K.pdf) |
| 14 CFR part 61 | Current eCFR text retrieved 2026-09-12 | §§ 61.39, 61.57(d), 61.87, 61.93, 61.94, 61.95; relevant certificate/rating sections | [eCFR Part 61](https://www.ecfr.gov/current/title-14/chapter-I/subchapter-D/part-61) |

AC 61-65K is guidance and its own § 1 says it is not legally binding; the eCFR controls when the two are being compared. The AC's 2025 revision cancels AC 61-65J.

## Corrections made in this pass

- `js/endorsements-data.js`: A.8 now has no standalone expiration because § 61.93(b)(1) and AC 61-65K A.8 provide the required training/endorsement without the 90-day expiration language used for first/additional solo in § 61.87. Its card now states that limitation directly.
- `js/endorsements-data.js`: A.15 and A.16 now distinguish the § 61.94 90-day training recency requirement from an endorsement expiration. Their cards identify the specific-area/specific-airport training window.
- `js/endorsements-data.js`: A.12 and A.13 retain the 90-day model value because §§ 61.95(a)(2) and (b)(2) require the endorsement to be dated within the 90-day period before the flight. Their cards now describe that as an endorsement dating requirement.
- `js/endorsements-data.js`: A.71 now says a satisfactory IPC *may satisfy* the § 61.57(d) recent-experience requirement, subject to the applicable rules, rather than implying an unconditional restoration of privileges.
- `js/training-requirements-data.js`: corrected the IPC cross-reference from AC 61-65K A.61 to A.71.

## Corpus inventory

The following status is based on a static scan of page copy and source links. “Cited” means the page exposes at least one governing CFR or AC reference in its visible article content or structured data. “Needs review” identifies material claims that require a source-by-source reading before publication is treated as fully verified.

| Page | Citation status | Claim risk | Verification state / next check |
| --- | --- | --- | --- |
| aircraft-endorsements | Cited | Medium | Spot-check § 61.31, SFAR 73, tailwheel/high-performance/complex wording and each model limitation. |
| cfi-endorsements | Cited | High | Review the complete CFI endorsement sequence against §§ 61.183–61.195 and current AC sections. |
| cfi-initial-checkride-endorsements | Cited | High | Verify A.1/A.2 and CFI-specific test endorsements, including spin-training applicability. |
| commercial-pilot-checkride-endorsements | Cited | High | Reconcile certificate experience and test prerequisites with § 61.129 and the applicable ACS. |
| first-solo-endorsement | Cited | High | Verify § 61.87 timing and the separate § 61.93/61.95 paths; generated page should be rebuilt after data changes. |
| flight-review-endorsement | Cited | High | Verify § 61.56, WINGS substitution, and record language; review AC 61-98 alongside AC 61-65K. |
| instrument-checkride-endorsements | Cited | High | Verify A.42–A.44 and the two-month practical-test window under § 61.39. |
| instrument-checkride-vs-ipc | Cited | High | Keep practical-test readiness distinct from § 61.57(d) IPC recent experience. |
| ipc-endorsement | Cited | High | Verify evaluator eligibility and aircraft authority under § 61.57(d); do not describe A.71 as a rating endorsement. |
| logbook-audit-checklists | Partial | Medium | Static checklist article has limited inline authority; add section-level CFR links after a line review. |
| private-pilot-checkride-endorsements | Cited | High | Verify § 61.103–61.109 experience and practical-test claims against current eCFR/ACS. |
| recreational-pilot-endorsements | Cited | High | Review § 61.98–61.101, § 61.94, and the additional-rating paths. |
| retest-after-failure-endorsement | Cited | High | Verify § 61.39, § 61.43(f), and § 61.49 timing/credit language. |
| solo-cross-country-endorsement | Cited | High | Verify § 61.93(b)–(d), per-flight planning, route limits, and training dates. |
| spin-endorsement | Cited | High | Verify § 61.183(i), § 61.187(b), exceptions, and the current AC model text. |
| sport-pilot-endorsements | Cited | High | Review MOSAIC-era changes and §§ 61.309–61.321 against AC 61-146 and AC 61-65K. |
| tailwheel-endorsement | Cited | Medium | Spot-check § 61.31(i) wording and the limits of a tailwheel endorsement. |
| what-is-simply-endorsed | Cited | Low | Product explainer; retain current-source disclaimer and avoid implying legal advice. |
| blog/index | Partial | Low | Hub copy points to guides; validate link targets and source-date labels after rebuild. |

## Open findings

1. `js/guidance-content.js` still reports A.12 and A.13 as having “None” expiration in the AC/FAR index. That conflicts with the eCFR and AC requirement that the endorsement be dated within 90 days before the specific flight. The structured endorsement cards are corrected above; the index needs a separate edit and test.
2. The generated SEO HTML is a build output. After changing endorsement cards, rerun `node simply-endorsed/build-seo-content.js` and inspect the affected static pages for parity. This audit did not rewrite HTML.
3. The article inventory records citation presence, not full legal or pedagogical validation. High-risk pages remain open until each material claim is checked against the current eCFR, current AC revision, and applicable ACS.
4. Direct FAA interpretation or Chief Counsel opinion links were not added to the Part 61 calculator in this pass. Calculator claims should be reviewed against the current eCFR and FAA guidance before adding a secondary interpretation source.
