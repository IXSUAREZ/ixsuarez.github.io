# Neumorphism with gold highlights

User-approved direction, October 14, 2026. This is the current material authority and supersedes the older glass finish. The existing gold brand and Day/Night/System preference contract remain.

## Implementation plan

1. Start from current public source in an isolated external worktree. Baseline: `ae18e574145380cab4540f48cc1c5ec1482a494f`, 524 manifest routes and seven public tools. Preserve the unrelated dirty primary checkout.
2. Establish one soft surface/light/shadow/inset contract in `assets/avionics.css`, retained `--g-*`/`--av-*` aliases, and first-paint appearance. Use readable dark text in Day and light text in Night. Keep meaningful category/risk/scientific colors.
3. Apply it to the complete navigation system: expanded dock, collapsed mobile shell, selected/pressed keys, menus, appearance controls, internal app tabs and private-guide navigation. Preserve compaction transforms, focus recovery and browser link semantics.
4. Replace the carousel generator with the complete shared native-link icon grid on Home and Tools. All seven apps are visible by default; four columns on typical phones, narrower reflow for small widths/enlarged text, vertical scrolling, no selection stage/arrows/swipe/pagination/folders.
5. Adapt service/content templates, reader controls, forms, all source-owned tool interiors, and standalone/embedded apps. Maintain original JS/model payloads when an unrelated source branch is ahead of the deployed runtime; stable source-owned material assets must persist through subsequent exports.
6. Package the private Flight Lesson Guide from current shared assets, retaining its Worker authentication, private data boundary, eight PDF bytes and existing task/timer behavior.
7. Regenerate metadata/chrome/theme links, register new theme assets, refresh standalone precaches, and run route/source regression checks. Inspect rendered desktop/phone Day/Night screens, navigation, representative real app tasks, larger text and reduced effects. Compare against the approved visual sheets; correct substantive issues before release.
8. Publish the coordinated website/private-app update after checks pass. Verify deployed routes/assets against the release, anonymous private-content denial and cache upgrade behavior. Keep the baseline recoverable.

## Design contract

- Canvas and soft raised surface: Day `#E3E3E3`; Night `#414141`. Slightly raised/well variations support hierarchy without changing the material family.
- Consistent upper-left illumination, paired light/dark soft shadows, inset fields/pressed controls, rounded geometry matched to content and touch targets.
- Gold for primary actions and selected controls; readable charcoal foreground on gold. Keep risk, category and teaching colors semantic. App artwork remains the original source artwork, not approximate generated marks.
- Navigation is an opaque soft raised surface. Its former historical `liquid-*` class names remain for behavioral compatibility; they do not mandate glass.
- Long-form prose remains on an open readable canvas. Raised grouping is used for actual panels, callouts, controls and task collections, not every paragraph.
- Preserve the animated homepage sky and all current copy, CTA/tracking IDs, URLs, calculations, authentication and storage formats. Certificate/print artwork and simulation/model colors retain their approved fidelity.
- Native links, fields and controls retain keyboard/assistive semantics, visible focus, clear labels, comfortable touch targets and adaptive reflow. Shadow decoration is not the only control or state cue.
- Print removes ornamental shadows; forced colors uses system colors. Reduced motion retains interruptible or instantaneous state changes.

## Shared semantic material tokens

`--av-neu-canvas`, `--av-neu-surface`, `--av-neu-raised`, `--av-neu-well`, `--av-neu-shadow`, `--av-neu-shadow-sm`, `--av-neu-inset`, `--av-neu-gold-shadow`.

Existing `--g-*` foreground/gold roles and appearance storage keys remain compatible. Standalone app-owned styles and private builds consume this same material contract. Add authored material assets to `config/theme-assets.json` and the relevant source exporter/precache process.

## Selected references

Approved visual sheets are retained with the project at `docs/design/neumorphism-previews-2026-10-14/` outside the deployable repository: website pages, app launcher (desktop and phone Day/Night), and CertPath/Simply Endorsed/PilotSolve/FlightRisk workspaces. Treat their generated content/artwork as visual guidance; real source content and original app assets remain authoritative.

The user explicitly added the entire navigation bar to this approved migration. Local implementation, rendered acceptance and production publication are separate evidence claims. Current results belong in `neumorphism-implementation-status.md` and `design-qa.md`.
