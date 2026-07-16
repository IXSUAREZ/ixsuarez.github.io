# Design QA — Quick Flight Risk Assessment

## Evidence

- Desktop capture: `/Users/diegosuarez/.codex/visualizations/2026/07/16/019f6a02-70a4-7552-b643-1e237c1085cd/frat-quick-redesign-qa/frat-desktop-1440x1000.png`
- Mobile capture: `/Users/diegosuarez/.codex/visualizations/2026/07/16/019f6a02-70a4-7552-b643-1e237c1085cd/frat-quick-redesign-qa/frat-mobile-390x844-second.png`
- Real-browser checks used the local `/flight-risk-assessment/` route and the `/frat/` alias.
- Automated checks: `npm test` (15 passing tests) and `git diff --check`.

## Every-flight workflow

- A routine VFR assessment presents exactly 12 one-tap PAVE factors.
- Student solo, IFR, and night each add only their applicable factor. The bank contains 12 core plus three conditional factors, while both the UI and direct model normalize student solo to VFR and therefore expose no more than 14 factors.
- Changing certificate, role, rules, or day/night clears per-flight answers. Saved minimums remain available for the next flight.
- A known unacceptable answer immediately produces **Stop — no-go on current plan**, even while other factors are unanswered.
- A fully answered assessment with one concern produces **Review required**. Confirmed answers never offset that concern.
- An all-confirmed assessment produces **Low — continue planning**, alongside the warning that Low never means safe or make the PIC decision.
- Legacy or malformed saved answers are discarded by the app and remain Incomplete at the risk-model boundary; they cannot be mistaken for a completed Low result.

## Personal minimums

- Minimums begin blank and are saved separately from the per-flight assessment.
- The dialog states that FAA guidance supplies an individualized framework, not certificate-tier numeric recommendations.
- Student-solo fields are labeled as instructor limits. Day/night visibility cannot be saved below the § 61.89 floors of 3/5 SM, and IFR-only fields are hidden for the student-solo context.
- The current flight displays only the applicable saved limits: VFR ceiling/visibility for VFR, IFR margins for IFR, and the applicable day/night fuel reserve.

## Responsive and accessibility QA

- At 1440 CSS pixels, the factor list and sticky decision picture form a readable two-column layout with no horizontal overflow.
- At 390 × 844 CSS pixels, context controls stack, answer choices become a two-by-two grid, the decision picture moves ahead of the factors, and document width remains 390 pixels with no horizontal overflow.
- A mobile QA pass identified and corrected a selector collision affecting VFR/IFR and Day/Night alignment. The repeated capture confirmed centered, full-height choices.
- Browser snapshots confirmed semantic headings, landmarks, labeled fieldsets, grouped answer buttons, progressbar state, live status text, a modal dialog, and regulatory/advisory source separation.
- Browser console result: 0 errors and 0 warnings.
- The short `/frat/?qa=1` path preserved the query string and resolved to `/flight-risk-assessment/?qa=1`.

## Result

- P0: none.
- P1: none.
- P2: none.

Final result: passed.
