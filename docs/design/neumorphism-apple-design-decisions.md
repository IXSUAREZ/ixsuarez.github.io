# Apple-inspired web design decisions — 2026-10-14

This is a responsive website and web-app collection, not a native iOS interface. Neumorphic gray/gold material and a Home Screen-style launcher are explicit user/product choices. Native Liquid Glass, system icon masking and native appearance policy are not claimed. This record screens the complete skill scope and connects relevant guidance to actual web evidence.

## Sources, decision and evidence

| Area / official source | Recommendation applied | Implementation and evidence | Status |
| --- | --- | --- | --- |
| [App icons](https://developer.apple.com/design/human-interface-guidelines/app-icons), Branding, Images | Keep recognizable original artwork and visible names at small size. | Original7 app identities, soft icon wells, native text labels; Home/Tools desktop,390/320phone screenshots and renderer/no-JS tests. Existing assets retained. | Verified web adaptation; no native icon export/masking claim. |
| [Dark Mode](https://developer.apple.com/design/human-interface-guidelines/dark-mode), Color, Materials | Adaptive foreground/surface roles and purposeful layering; review actual controls and semantic content. | Shared CSS authority and Day/Night screenshots across tools;111 checked contrast pairs, category text-only darkening, readable Night icons. | Verified within sampled states; explicit Day/Night/System picker is a product choice. |
| [Focus and selection](https://developer.apple.com/design/human-interface-guidelines/focus-and-selection), Accessibility | Focus remains distinct from selected state; preserve labels and operation. | Native links/buttons/fields, gold selection, visible focus, Escape/menu recovery; native-link adapter test and actual root browser dismissal. | Verified web semantics and sampled keyboard operation; no VoiceOver certification. |
| [Tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars), Layout | Persistent destinations with recognizable labels; do not make selected state change the order. | Existing dock/step/engine-control navigation preserved and restyled, with responsive/compaction behavior retained.7appgrid exposes the full set by default. | Web adaptation; opaque neumorphism is the user's material choice. |
| [Typography](https://developer.apple.com/design/human-interface-guidelines/typography), Writing | Clear hierarchy and labels, content adaptation instead of shrinking to a picture. | Existing system fonts and source copy; reader Larger reflow;320px label wrap corrected without reducing touch height. | Verified rendered samples; exact native type tables do not define CSS sizes. |
| [Motion](https://developer.apple.com/design/human-interface-guidelines/motion) | Input remains interruptible; reduced-motion alternatives preserve state. | Existing dock motion logic retained, shared reduced effects now clearly labeled, motion/appearance regression tests and expanded/collapsed captures. | Verified source/browser samples, no physical touch timing claim. |
| [Privacy](https://developer.apple.com/design/human-interface-guidelines/privacy) | Preserve real system authentication and keep private content out of previews/publication. | Worker/auth/curriculum bytes unchanged;50 private tests,8PDF hash preservation, synthetic-only guide screenshots. No private assets copied to publicrepo. | Verified source/security tests; live owner passkey requires native owner action. |

The substantive live source consultation in this task covered the relevant appearance/icon/accessibility/navigation/focus guidance; the local Apple skill guides and topic index were used to screen the rest. Retrieval is not a claim that every illustration, video, specification table or Apple topic was visually inspected.

## All18 foundations screened

- Applicable and addressed above: Accessibility, App icons, Branding, Color, Dark Mode, Icons, Images, Layout, Materials, Motion, Privacy, Typography, Writing.
- Inclusion: preserve clear device-neutral labels and existing content; no new identity assumptions or enrollment data added. Not a new localization/content rewrite.
- Right to left: retain semantic DOM/native text and logical spacing where authored. This release adds no RTL locale; complete RTL translation/acceptance remains outside scope.
- SF Symbols: preserve the existing licensed/source icon set; no Apple symbol assets or new native availability dependency introduced.
- Immersive experiences and Spatial layout: no native immersive/spatial UI added. Existing3D engine and wind-tunnel content/controls remain unchanged; this is a2D web material update around those models.

## All six categories screened

Getting started: web/platform adaptation and user brand direction. Foundations: the18topics above. Patterns: existing search, navigation, onboarding/wizards, validation, loading/error/empty/saved states retained and sampled. Components: native links, buttons, fields, dialogs, tabs, menus, cards and input controls styled through shared roles. Inputs: keyboard, pointer and touch-friendly CSS targets; no Pencil/remote/gaze dependency introduced. Technologies: existing PWA/cache/private passkey integration explicitly packaged and tested; no unrelated Apple APIs, payments, health or permissions added.

Source/style record and visual comparisons: project-root `design-qa.md`. Test and preservation receipts: `output/neumorphism/verification/README.md`. Native device, assistive technology, owner passkey and print dialog acceptance remain separate evidence boundaries.
