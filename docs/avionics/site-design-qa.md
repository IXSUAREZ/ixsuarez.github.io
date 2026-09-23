# Avionics redesign — local design QA

Status: implemented preview reviewed; desktop/browser checks pass within the evidence below. Physical-device and assistive-technology release checks remain open.

## Targets and comparison

The approved desktop, tablet and phone concepts are compared in one artifact with implemented screens: [reference and implementation](docs/avionics/screenshots/reference-implementation.jpg). The concept image paths are recorded in `docs/avionics/visual-evidence.md`. This is a design-language adaptation: existing content, calculation layouts, certificate output and the homepage sky take precedence over invented concept content. The implementation keeps existing footer content, native numeric helpers and result diagrams. It does not invent the concept's extra progress summary.

Tactile rectangular keys, shallow highlights, cyan selection, matte working surfaces and compact bottom panels carry through the implemented examples. Dark and Day use separate readable accents. The homepage hero retains its original geometry and sky rather than reproducing an illustrative reference sky.

## Browser evidence

Codex in-app Chromium, 1× screenshot density. Viewports exercised: 1440×1000/1024 desktop; 1024×600 short landscape; 834×1194 tablet; 390×844 and 320×640 phones. Screenshot files live in `docs/avionics/screenshots/`.

- Homepage: Dark/Day desktop and phone, original sky. Controlled baseline/current sky renders at fixed solar time and a stable reduced-motion frame: desktop hero/canvas 1440×824, tablet 834×900, phone 390×844. A sky-only desktop crop (900,180)-(1400,700) has exact identical RGB pixels. Five source/assets and hero markup are hash/byte verified by the static audit. The comparison server injects controls only in QA; production sky source is untouched.
- Article: Dark/Day desktop; 320px synthetic 200% computed-font enlargement fixture. Dock grows and labels wrap. Final article document width equals 320px. This fixture is not a claim about physical Safari text scaling or operating-system text preferences.
- Menu: opening focuses the first item; Escape returns focus to Menu. At 1024×600 the panel stays within the viewport and scrolls. Expanded 200% text menu stays bounded above the dock. Appearance has one control group.
- Simply Endorsed: 320px reflow, four dock controls remain at least 44px in both dimensions; Checklists opens its native workspace and heading. Category meanings and card actions remain in the workspace.
- CertPath: 834px Goal in both modes; native Background navigation and appearance/saved-plan menu. Native prerequisite/save/retry behavior also has regression coverage.
- Certificate Generator: 320px four-step dock; locked steps remain disabled. A fictional Sample Student/Sample Instructor run reached Photo and Review, preserving names and the native preview. Photo is optional. No export geometry code changed.
- PilotSolve: 390px native keypad with 20kt wind from270°, runway240° produces crosswind10kt and headwind17.3205kt. Dark/Day controls and Settings work. Shared preference persists on navigation to the homepage. Offline integration evidence is recorded separately by the implementation agent.
- Crank & Core: Day collection renders the engine and parent dock. Explore hides parent navigation and shows one native contextual toolbar. Source/storage-event tests cover appearance propagation.
- Aero Lab: 320px desktop guidance and 1440px interactive wind tunnel. Desktop requirement retained. Simulator controls and native visualization remain functional.
- FlightRisk: Dark/Day 390px, cyan primary/selected controls and one appearance group. Risk meanings remain unchanged.
- FOI: bottom study navigation, appearance and card actions reviewed after the route-specific cascade corrections; final screenshots are linked from visual evidence.

Representative family captures cover home, service, discovery, learning library, category hub, article, blog, tools directory and all eight tools. Static auditing covers every canonical route; this is not a claim that every article was individually visually inspected.

## Iterations and checks

Browser review found and corrected: legacy article label specificity; pale form controls; initial top-positioned tool docks; narrow certificate labels; sticky certificate action strip; FOI welcome surface; FlightRisk gold selection; Aero sidebar labels; Crank inactive tabs; duplicate appearance controls; an adapter menu moving into itself; enlarged article CTA/footer overflow. Final route and source checks are in coverage.json. Native controls remain the source of wizard progression and calculation behavior.

## Release boundary

No public deployment. Physical iPhone Safari, installed PilotSolve PWA, VoiceOver, true browser text zoom and a complete WCAG2.2AA audit remain release gates. Full Crank provenance tests requiring excluded reference fixtures are not claimed. Existing focused regression tests and build checks passed; this does not certify every calculation, print/export or screen-reader flow.
