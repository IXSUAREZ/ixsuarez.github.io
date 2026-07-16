# Suarez CFI Flight Risk Assessment — Implementation Plan

## Product outcome

Create a responsive, classroom-friendly preflight hazard-identification tool at `/flight-risk-assessment/`, with `/frat/` as a short alias. The experience combines a low-clutter, step-by-step assessment with a continuously visible likelihood-by-severity risk picture.

## Experience architecture

1. **Profile** — Select VFR or IFR, certificate, ratings or instructor role, and recent experience.
2. **Pilot** — Review IMSAFE, proficiency, currency, and operation eligibility.
3. **Aircraft** — Confirm status, performance margins, fuel, loading, equipment, and known discrepancies.
4. **Environment** — Compare forecast and airport conditions with written personal minimums and aircraft limitations.
5. **External pressures** — Identify schedule, passenger, continuation, and get-there-there pressure.
6. **Review** — Show the risk vector, highest hazards, actionable mitigations, and a printable summary.

## Safety model

- Organize questions under FAA PAVE, with IMSAFE nested under Pilot and 5P concepts used as a cross-check.
- Evaluate each applicable hazard with likelihood × severity.
- Use the highest unresolved hazard as the overall result. Low-risk factors never subtract from High or Stop hazards.
- Treat unanswered safety-critical questions as **Incomplete**, rather than implying a numeric result is meaningful.
- Separate certificate level from ratings and instructor roles. Credentials control question applicability; they never automatically raise personal minimums.
- A mitigation earns credit only when it changes a real assessment input or removes the underlying condition.
- Keep all drafts on the user's device; do not request names or medical diagnoses.

## Responsive implementation

- **Desktop:** two-column workspace with the assessment at left and persistent risk matrix at right.
- **Tablet:** a full-width assessment followed by the risk picture, with all context controls wrapping cleanly.
- **Mobile:** touch-friendly cards, sticky step navigation, and a compact risk bar that jumps to the full risk picture.

## Verification and launch

- Unit-test the matrix, applicability rules, missing-critical behavior, no-offset rule, hard stops, and input-changing mitigations.
- Exercise representative student VFR and instrument IFR paths in a real browser.
- Validate keyboard access, focus states, reduced motion, dialogs, local draft storage, printing, and no horizontal overflow.
- Compare desktop, tablet, and mobile captures against the approved visual target and record the design QA result.
- Publish only the scoped route, alias, tests, documentation, and sitemap entry; then verify GitHub Pages and the live URLs.
