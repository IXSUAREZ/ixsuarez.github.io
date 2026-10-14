# Neumorphic app surface migration — 2026-10-14

The approved gray-and-gold tool preview is implemented in the active Simply Endorsed, CertPath, Certificate Generator, FOI Cards and FlightRisk workspaces. Shared navigation is owned by the canonical site material layer; these adapters style app-owned controls and content.

## Material coverage

| Application | Implemented surfaces and states | Preserved behavior |
| --- | --- | --- |
| Simply Endorsed CFI | App header/search, Tasks/Library/Guidance navigation, neutral raised task/category cards, workflow checklists, endorsement detail, wording well, guidance articles/search/empty states, appearance dialog, mobile dock | All 71 paths, 96 endorsements, category identities, temporary checklist lifecycle, source text and direct links |
| CertPath | Raised step rail and goal/background controls, inset fields, experience groups, result/reference/ledger cards, edit/discard dialogs, entry/contact/PIN/inbox/saved-plan screens | Calculations, privacy/contact gate, saved links, owner lock, validation, source and printed data |
| Certificate Generator | Milestone/rating selections, editor panels, inset text fields, photo/cropper chrome, preview well, action bar and caption editor | Generator JavaScript and template files are byte-unchanged; original colorful certificate artwork remains visible in the preview |
| FOI Cards | Raised card faces, inset progress, gold Flip/start actions, review/mastered semantic treatments, section sheet, reset dialog, completion/CTA surfaces | Flip/Next, pass resume, review/mastery state, keyboard dialog behavior and saved progress |
| FlightRisk | Assessment/profile selections, saved setup, experience fields, PAVE rows, guide/methodology cards/tables, results sheet, confirmation dialogs | Existing scoring, risk red/amber/green, gauges/tapes, local data, reset confirmation and printed summary |

The phone FOI card minimum was reduced by 24 CSS px after rendered inspection found its action shadows touching the floating dock. At 390×844, the final action bottom is 757.4 px and dock top is 777.6 px, leaving 20.2 px of clearance.

## Verified source and build

The original external FlightRisk Git checkout contained only file-mode noise but was older than the current deployment. The documented current source was copied onto the external SSD at `/Volumes/Codex SSD/worktrees/suarez-neumorphism-flight-risk-source-20261014`. Its untouched baseline rebuilt to all 10 byte-identical assets in site commit `ae18e574` before any material changes.

Only `src/index.css` and `tailwind.config.js` changed in that verified source. The final source patch is `source-patches/flightrisk-neumorphism.patch`; `neumorphism-flightrisk-build.json` records baseline/final hashes and removed intermediate build assets. The exporter preserves the site's existing assessment, methodology and guide HTML shells and updates their Vite entry references. No global theme mutation or deployment occurs inside the exporter.

Reproduce packaging after a source build:

```sh
python3 scripts/build-flightrisk.py --source '/Volumes/Codex SSD/worktrees/suarez-neumorphism-flight-risk-source-20261014' --skip-build
```

Then run the site's documented shared material/cache synchronization. Baseline tracked assets remain available for rollback; obsolete intermediate assets produced only by this task were removed.

## Validation evidence

- Simply Endorsed workspace: 1,678 assertions passed across 71 paths, 96 details, guidance modes, checklist lifecycle and content regressions.
- Part 61 wizard/calculation/editor/source suite: 98/98 passed.
- CertPath storage: fresh start, contact gate, failure preservation, retry key, save/private reopen/latest-plan update and locked inbox all passed.
- FOI dialogs: 3/3 passed, including focus trapping/restoration and reset confirmation.
- FlightRisk: TypeScript/production build passed; 27/27 tests passed across scoring and persistence/reset behavior.
- Certificate Generator JavaScript/template tree: no diff from the current site baseline.
- Local in-app browser: Day/Night desktop Simply Endorsed and FlightRisk; phone Simply Endorsed task/detail/menu, CertPath entry/goal/background/experience/contact, FOI card/answer/Next/resume, Certificate selection/names/original artwork and FlightRisk profile/confirmation/results sheet. Measured phone entries had no page-width overflow at 390 px.
- Actual screenshot evidence is saved in `output/neumorphism/apps/`. Final FOI corrected views are `foi-night-card-phone.png`, `foi-night-answer-phone.png` and `foi-day-answer-phone.png`; earlier screenshots retain their capture state.

The browser exercised the local contact gate without submitting personal details to the production service. Native printer/download dialogs, physical touch-device acceptance and exhaustive advanced states were outside this app-surface check. Site-wide route coverage, final cache synchronization and release evidence belong to the parent integration record.

## Source-to-decision record

Apple materials/color guidance was consulted live on 2026-10-14: https://developer.apple.com/design/human-interface-guidelines/materials and https://developer.apple.com/design/human-interface-guidelines/color. The opaque paired-shadow material is the user's selected web design, not a native Apple material claim. Raised surfaces group tasks, inset fields communicate entry/pressed state, and shared gold marks actions/selections. Category/risk identities remain distinct; Day category text uses the shared contrast correction. Native web links, inputs, keyboard focus and responsive content remain active.

Final result: passed for the app-surface scope and browser states above; production and whole-site acceptance are tracked separately.
