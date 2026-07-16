# Suarez CFI Flight Risk Assessment — Implementation Plan

## Product outcome

Create a responsive, every-flight hazard-identification tool at `/flight-risk-assessment/`, with `/frat/` as a short alias. A routine VFR assessment takes 12 one-tap answers; student-solo, night, and IFR context add only the checks that actually apply.

## Experience architecture

1. **Set context** — Select certificate, flight role, VFR/IFR, and day/night before answering. Changing context clears stale factor answers.
2. **Answer PAVE** — Review 12 core Pilot, Aircraft, enVironment, and External-pressure factors on one page.
3. **Add only relevant gates** — Student solo, night, and IFR each add one conditional factor. Because student solo is VFR-only, no reachable path exceeds 14 factors.
4. **Review the decision picture** — Show completion, Stop/Review/Verify counts, the highest concerns, and concrete mitigation guidance.
5. **Keep minimums out of the rush** — Save personal or instructor-set limits separately so a new flight clears answers but preserves the deliberate setup.

## Safety model

- Organize questions under FAA PAVE, with IMSAFE nested under Pilot and 5P concepts used as a cross-check.
- Classify each factor as Confirmed, Concern, Not acceptable, or Verify.
- Use the highest unresolved hazard as the overall result. Confirmed factors never subtract from Review or Stop factors.
- Treat unanswered safety-critical questions as **Incomplete**, rather than implying a numeric result is meaningful.
- Treat certificate level as context only. It never lowers risk or supplies a numeric personal-minimum preset.
- Treat student-solo visibility floors, endorsements, and instructor logbook limitations as regulatory constraints rather than recommended minimums.
- A mitigation earns credit only when it changes a real assessment input or removes the underlying condition.
- Keep all drafts on the user's device; do not request names or medical diagnoses.

## Responsive implementation

- **Desktop:** single-page factor list with a sticky decision panel.
- **Tablet:** stacked assessment and decision picture with two-column context controls.
- **Mobile:** one-column context, two-by-two answer controls, touch-safe targets, and no horizontal overflow.

## Verification and launch

- Unit-test the 12-plus-3 factor bank, 14-factor reachable maximum, applicability, blank minimums, malformed saved data, missing-critical behavior, no-offset rule, and Stop conditions.
- Exercise representative student VFR and instrument IFR paths in a real browser.
- Validate keyboard access, focus states, reduced motion, dialogs, local draft storage, printing, and no horizontal overflow.
- Compare desktop, tablet, and mobile captures against the approved visual target and record the design QA result.
- Publish only the scoped route, alias, tests, documentation, and sitemap entry; then verify GitHub Pages and the live URLs.
