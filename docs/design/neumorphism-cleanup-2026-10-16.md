# Neumorphism layout cleanup — October 16, 2026

Local implementation and rendered review passed. This record covers checks before publication; deployment evidence is kept separately at `/Volumes/Codex SSD/tmp/release-layout-20261016/`.

The subsequent [text/control overlap audit](layout-overlap-audit-2026-10-16.md) repairs the reported Home status collision and additional Learn, Blog, service, Certificate Generator, FlightRisk and Engine collection reflow issues. It includes a 523-route narrow census, 204 family cases, 84 app-ready cases and open-state review. Its final receipts supersede this first pass's shared-asset digests.

Baseline: `8a67aa5bfbc6446ebaa73a14e0558a6be117647a`, branch `codex/neumorphism-cleanup-20261016`. Current catalog: six public apps; Aero Lab remains removed. The unrelated dirty primary checkout is preserved.

## Result

- The homepage contact area has one raised outer surface. Its sheet and form are transparent layout wrappers, so the action note no longer appears inside a second floating card. Removed the obsolete yellow mat/pseudo background at its source.
- Shared disclosures are integrated into their parent panels. Static service rows, facts, table wrappers and helper notes no longer receive the generic large raised-card treatment. Controls retain gold selection, inset fields, visible focus and soft shadows.
- Button labels and form grid columns can shrink/wrap without fixed-height clipping. Website and normal document-flow tool pages correct keyboard focus hidden beneath the fixed navigation dock; canvas and independently managed app views are excluded.
- CertPath, saved-plan controls, Simply Endorsed checklists and Certificate Generator have fewer nested frames and safer action/label wrapping. Certificate artwork is unchanged.
- PilotSolve removes duplicate shelf/header/keypad frames. Crank & Core uses one explorer sheet and removes inner header/metadata frames; model captions reserve their actual height. Stable CSS exports match their authoring sources; runtime/model bundles are preserved.
- FlightRisk's rating buttons now measure 44px high instead of 36px. The scoped deployed adapter and durable source patch carry the same geometry fix; selected, disabled and semantic colors remain intact.
- Private Guide journey/list, lesson, sign-in and session CSS are simplified. Its final package includes the current shared stylesheet and navigation. Authentication, curriculum, runtime and all eight PDFs remain byte-identical.

## Verification

- Asset wiring: 523/523 registered routes, 6/6 supporting documents and 3/3 installable app manifests. Synchronization reports zero stale HTML sources.
- Contrast audit: 111/111 checked material/category pairs pass; minimum checked text ratio 4.95:1.
- Regression checks: 21 Python, 15 catalog/cache/footer Node, 4 contact-form and 24 appearance/navigation/home-sky Node tests pass. Site audit reports zero broken references and zero JSON-LD failures. Private Guide build/typecheck and 50 security/auth/guide tests pass.
- All 545 generated HTML changes are managed asset-version updates except the intentional homepage contact CSS removal. Cache changes are refreshed IDs/asset URLs. Teaching copy, links, calculations, original artwork and scientific payloads are unchanged.
- Fresh CUA visual review: Home/contact, service/contact/expanded FAQ, Tools grid, Learn library, article reader/settings/Larger text; all six public app families; Certificate Generator synthetic Steps 1–4; private Guide sign-in and synthetic journey/list/Prepare/Fly views. Checked 390px phone, selected 320px narrow states and 1280px desktop, with Day and Night samples. No horizontal overflow in the measured states. The focused contact action and certificate download action remain above the dock after settling.
- PilotSolve's actual keypad path with wind 20kt from 000° and runway 090° returned crosswind −20kt and headwind 0kt. No saved calculation was created. Certificate review used synthetic names and the optional placeholder image; no image was shared or downloaded. No inquiry, text, call, email or passkey request was sent.

This is template/source propagation plus representative rendered states, not a claim that every route's every dynamic state or physical device was exercised. The factory reference's third-party model remained loading during the narrow layout check; its iframe/caption geometry was inspected, and its model/runtime bytes were preserved. Private Guide visual review used an isolated loopback fixture with synthetic lessons, not owner passkey acceptance or production curriculum review.

## Evidence and handoff

Screenshots, computed measurements and app/source/package receipts are on the external SSD:

`/Volumes/Codex SSD/tmp/neumorphism-cleanup-20261016/`

Notable captures: `contact-before-phone.png`, `contact-after-desktop-day.png`, `contact-after-phone-night.png`, `certpath-background-after-320-night.png`, `simply-endorsed-checklist-after-phone-night.png`, `certgen-actions-after-320-night.png`, `pilotsolve-keypad-after-phone-night.png`, `crank-ignition-after-phone-night.png`, `flightrisk-rating-final-phone-day.png`, `reader-larger-after-320-day.png`, `service-faq-after-320-day.png`, and the explicitly synthetic `guide-*-synthetic.png` captures. `standalone/private-package-validation.json` records the exact 38-file private package and protected-byte checks.

Review preview: `http://127.0.0.1:8912/`. The private package was built and reviewed locally. Public and private deployment evidence is recorded separately from these pre-release checks.

Text-first is the user's preferred new-student contact direction. This visual cleanup preserves the current contact handoff; the separate contact conversion plan is not implemented here.
