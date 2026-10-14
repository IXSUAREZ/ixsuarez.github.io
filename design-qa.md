# Neumorphism visual acceptance — 2026-10-14

final result: passed

The approved sheets are material and hierarchy references, not replacements for source text, workflow, original artwork or the existing sky/hero geometry. No actionable P0/P1/P2 finding remains after the fixes and fresh captures below. Independent review reached the same conclusion.

## Source and capture truth

Source visual truth: `/Volumes/VIXIONDRIVE/VIBE CODING PROJECTS/SUAREZ.CFI/docs/design/neumorphism-previews-2026-10-14/`: website-pages.png (1816×866), app-launcher.png (1627×967), tool-workspaces.png (1513×1039). Original user reference: IMG_8619.PNG.

Implementation: threaded loopback preview at http://127.0.0.1:8912/, current baseline ae18e574 plus this branch. Browser-rendered screenshots: `output/neumorphism/site/`, `output/neumorphism/apps/`; standalone/private details are in the linked design records. Root used Codex IAB; private visual tests used an isolated Chrome fallback when IAB was unavailable to the subagent.

Requested CSS viewports: 1440×1000 desktop, 768×1024 tablet, 390×844 phone, 320×568 narrow phone. Day/Night, source content, live menu state and real app controls were reviewed. The source sheets have no authored CSS viewport or density contract. Observed implementation image pixel dimensions are recorded in `output/neumorphism/comparisons/capture-dimensions.json`; scrollbar/native viewport cropping varies. Comparisons preserve image aspect ratios and normalize display width with contain fitting; no pixel/font-size equivalence or pixel-difference score is claimed.

## Combined comparison evidence

Source and implementation appear together in each input, opened and visually reviewed:

- `output/neumorphism/comparisons/homepage-full.png`: original sky, clear headline, gold primary/soft secondary action and soft persistent dock. Existing hero height is preserved; the concept compresses it to display more sections on its presentation board.
- `output/neumorphism/comparisons/reader-full.png`: readable open prose and raised reader controls. Actual discovery-flight copy, 18 chapters and user-selected Larger reading size replace the concept's illustrative copy and shorter chapter list.
- `output/neumorphism/comparisons/launcher-full.png`: all seven original app artworks and direct native links, four-column desktop/phone structure, gold filter and neutral icon wells. Desktop-required notes and website footer are real product information absent from the concept.
- `output/neumorphism/comparisons/workspace-full.png`: neutral raised task workspace, inset search, gold selection and retained semantic category icons. Actual full category/content inventory takes precedence over generated abbreviated text.
- `output/neumorphism/comparisons/navigation-focused.png`: readable labels, original navigation icons, paired surface shadows and satin gold selected state at a readable focused scale.

## Five fidelity surfaces

| Surface | Result and evidence |
| --- | --- |
| Fonts/typography | Existing system typography retained; headline, body and compact navigation hierarchy remain clear. Original app labels wrap naturally. 320px Appearance label fixed. Reader Larger control and phone reflow verified. Generated font pixels are illustrative; exact source strings and existing reader-size settings are authoritative. |
| Spacing/layout rhythm | Complete Home/Tools grid, vertical scrolling and native links replace the stage/carousel. 390px four columns, 320px three columns; no observed page-width overflow. Existing app geometry is retained except the FOI clearance fix. Shared surface radii/shadows and inset fields align. |
| Colors/tokens | Day #E3E3E3, Night #414141, satin gold primary/selected states, readable foregrounds. All111 audited text/control/category pairs pass; minimum checked text ratio4.95:1. Real category/risk/scientific colors remain semantic. |
| Image quality/assets | Original seven app logos, author image, animated sky, certificate artwork, wind/flow diagrams and engine model assets retained. No generated approximate logo or UI raster is used as implementation.81 protected runtime/model/data files remain byte-identical; FlightRisk style build is source-verified separately. |
| Copy/content | All actual tool labels and instructional/source text retained.522 editorial/metadata route signatures unchanged; Home/Tools intentional grid changes only. No generated mock text becomes product content. Day/Night labeling standardized in private guide without changing preference values. |

## Finding and fix history

1. P2: narrow menu split Appearance mid-word. Reduced tab padding/type at320px without shrinking44px touch height. Fresh `site/nav-night-phone320-final.jpg` keeps the whole label; independent review confirms resolution.
2. P2: Day category labels fell below4.5:1 against the new gray. Added a text-only90% category/10% black presentation; palette, icons and edges remain unchanged. All111 contrast checks now pass.
3. P2: FlightRisk Night unselected profile icons used dark bronze. Source accent token now uses readable shared gold; rebuilt normally. Fresh `apps/flightrisk-night-profile-final.jpg` shows pale gold on graphite; computed foreground rgb(236,211,155) against rgb(65,65,65), independent review confirms resolution.
4. P2: FOI phone actions touched the dock. Reduced card minimum24px; at390×844 final gap20.2px. Fresh app evidence and3 FOI tests pass.
5. P2 material gap: article rail and hero secondary action retained flat/shallow material. Added scoped raised material and captured revised homepage/article shown in combined inputs above; long prose remains open.
6. Capture mismatch: older Certificate Generator shot caught dock compaction. Fresh `apps/certgen-day-names-final.jpg` shows the intentional clean collapsed gold Menu circle; no faded/duplicated labels remain. Expanded and collapsed states retain their original behavior.
7. Integration gap: shared app-menu adapter was not loaded in Aero Lab. Sync now injects the byte-versioned adapter into its actual menu. Seven links and close/reopen verified in IAB. Crank's current released runtime has engine-control rails, no website menu; its existing Explore/Parts controls remain intact and receive the same material. No new menu is invented there.

## Interaction and evidence boundary

Home/Tools purpose filters and All reset, direct grid links, desktop/phone menus, Day/Night persistence, actual Escape dismissal/focus recovery, reader settings/Larger, Aero app-picker close/reopen, and Crank engine loading/Explore/Parts checked in IAB. Owned app tasks, results, dialogs and appearance states are recorded in `docs/design/neumorphism-app-surfaces.md` and `neumorphism-standalone-apps-qa-2026-10-14.md`. Browser logs showed no application error; localhost analytics warnings are expected and excluded from runtime failure claims.

Private guide source build/typecheck/50 tests and synthetic visual checks passed. Its Worker, authentication, curriculum and PDFs are unchanged. Synthetic screenshots prove visual/material adaptation, not a live authenticated owner session. Native passkey/device, VoiceOver and print/export dialog acceptance are outside automated/browser evidence. No perfect HIG compliance claim is made.

## Implementation checklist

- Shared tokens, every registered/supporting page, app-owned surfaces and nav verified.
- Full seven-app direct-link grid generated, keyboard/no-JS semantics tested.
- Route/content/runtime preservation, cache freshness/idempotence and contrast pass.
- P0/P1/P2 visual findings fixed and post-fix captures reviewed.
- Production publication/asset parity and anonymous private denial recorded separately in the external release receipt.
