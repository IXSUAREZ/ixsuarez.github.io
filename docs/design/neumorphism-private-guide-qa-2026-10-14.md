# Private Flight Lesson Guide neumorphism QA — October 14, 2026

The private source was rebuilt against the reviewed neumorphism website checkout after final shared-asset synchronization. This public QA record contains only verification metadata; no private curriculum, PDFs, publisher material, or private-site asset copies are included.

## Build and preservation evidence

- Source: `/Volumes/VIXIONDRIVE/VIBE CODING PROJECTS/INSTRUCTOR STUDIO/Projects/Flight Lesson Guide/private-site`.
- Website input: `/Volumes/Codex SSD/worktrees/suarez-neumorphism-20261014`, provided through `SUAREZ_SITE_ROOT`.
- External `TMPDIR` and npm cache were explicitly set. Private build output remained in the private source project on the external drive.
- `npm run build`, `npm run typecheck`, and `npm test` passed.
- **17 Worker security tests** passed, including anonymous direct/indirect HTML, course, PDF, script and asset denials; exact-origin mutation checks; real signature verification; one-owner enrollment; expiry/replay/revocation denial; and database-failure denial.
- **33 auth and guide tests** passed with zero skips, including all eight production pathways and every lesson/branch/kind, navigation/history, manual checklist/timer state, and print disclosure preservation.
- **13 protected source files** (app, data, auth/session JavaScript, Worker, and eight PDFs) are unchanged from the task baseline.
- **All eight PDFs** are SHA-256 identical across authored output masters, protected source downloads, and the final private package.
- The final protected app script and course data match their source bytes exactly.
- **Eight shared assets** match the final website checkout exactly; auth appearance/material copies match as well.
- The private package contains no plaintext offline worker; robots/session-concealment checks remain present.

The exact hashes and source patch metadata are in `neumorphism-private-guide-build-receipt-2026-10-14.json`. The private authoring contract now requires an explicit current reviewed website checkout and a rebuild after final shared-asset synchronization.

## Visual QA

**Visual result: passed.** The in-app browser was unavailable to this worker after release, so the documented Chrome fallback was used in a dedicated QA tab. The isolated loopback fixture served only eight synthetic courses and 32 synthetic lessons; production curriculum and PDF downloads were never served. The production Worker and authentication configuration were not changed or bypassed.

Reviewed Day and Night unlock screens on narrow and desktop viewports, the syllabus, lesson preview, Prepare, Fly/session controls, and the More menu. The measured narrow CSS viewport and document scroll width both remained 354px, with no horizontal overflow. Day resolved to #E3E3E3 and Night to #414141. Soft surfaces, inset inputs, gold selected views, and the session/navigation materials matched the approved direction. Both appearance labels now read Day/Night while preserving the original light/dark values; precisely two HTML option labels changed.

Screenshot receipts and images are retained only in `/Volumes/Codex SSD/tmp/suarez-neumorphism-20261014/private-guide-qa/`, alongside the synthetic-fixture receipt and private source patch. No screenshots contain production curriculum. Browser extensions emitted unrelated diagnostics, and Chrome logged a nonblocking view-transition opt-in diagnostic; the tested navigation and UI completed normally.

The temporary Chrome viewport was reset and its QA tab closed. Native-device passkey acceptance and a production owner-session browser check remain distinct from this synthetic visual fixture.

No deployment was performed by this worker.
