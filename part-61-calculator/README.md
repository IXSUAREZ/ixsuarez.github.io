# CertPath saved plans

The existing `/part-61-calculator/` route hosts the introduction, calculator, contact-save gate, private-plan viewer, and instructor submissions inbox. `storage-config.js` switches persistence on only after the API has been verified. Localhost uses `http://localhost:8787` for development.

The backend lives in `../certpath-api`, with its own Worker deployment, D1 migrations, and server secrets. Deploy backend changes first, then publish this GitHub Pages frontend. Never place PINs, Worker secrets, contacts, or private tokens in source/configuration, Git, analytics, or logs.

## Behavior

- Ordinary visits start fresh. Existing legacy scenario-share links still hydrate calculator inputs; browser drafts are not automatically restored in persistence mode.
- Save requires first name, last name, email, and phone. The backend validates the scenario and computes the saved result with the shared Part 61 core.
- Private plan links use a random bearer token in the URL fragment. Anyone holding the link can view/update that plan; there are no student accounts or automatic emails.
- Only the latest plan is stored. Updates need the current revision and an idempotency key. Uncertain requests may be retried for 24 hours; stale edits require reopening the saved link.
- Public Submissions displays placeholders. Owner PIN verification, attempt limits, sessions, search, details, and deletion are server-side. Client owner tokens stay in memory. Reload relocks the UI; server sessions expire after 15 minutes without API activity, with an eight-hour maximum.
- Records remain until deleted in the owner inbox. Deleted private links stop working. Owner deletion requires an explicit confirmation in the UI.

## Verification

From `../simply-endorsed`: `npm test` and `npm run test:certpath`.
From `../certpath-api`: `npm test`, `npm run typecheck`, and the documented local D1 integration harness.

Browser acceptance: ordinary intro → goal → background → 38 hours → contact → save → private link in independent browser → update to 39 hours → reject an older tab's stale update → PIN unlock → full-name search → open saved plan → lock and confirm no contact/plan data remains in the owner DOM → delete the synthetic test and verify its link stops working. Also inspect 390px mobile and desktop layouts.

The calculator UI exposes a narrow `CertPathCalculator` adapter for reset, step selection, and rendering the persisted result; the storage controller owns contact/auth/network state. Calculation rules are shared with the Worker. Source link rendering accepts HTTPS FAA/eCFR links only.
