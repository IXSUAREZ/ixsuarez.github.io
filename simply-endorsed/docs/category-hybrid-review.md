# Category navigation restoration — September 10, 2026

Following feedback on the task-first redesign, category browsing is the default again. The colored category rail exposes every existing training path. Mobile uses a dark native dialog with the same categories and paths. Checklists and Guidance remain primary tabs; each bundle links directly to its complete checklist.

The revision retains all 96 endorsements, 71 browsing paths, complete bundles, shared detail rendering, responsive reference entries, and temporary checklist state.

Fixed regressions:
- The shared mobile menu's Browse categories shortcut opens the restored category dialog instead of targeting the removed sidebar.
- Unknown endorsement IDs no longer hide the main content on narrow screens.
- Selecting a category path clears stale signer and timing filters.
- Closing an endorsement restores its originating search or category list and opener focus.
- Clearing search removes the query from the URL.
- Checklist status updates preserve open disclosures; starting a review moves focus into its progress region.
- Guidance navigation focuses the requested topic instead of scrolling back to the page heading.
- Related guidance links no longer emit nonexistent journey topic IDs.

Validation: 1,211 workspace assertions and 93 existing integration/calculator tests pass. Browser checks cover desktop 1440px, tablet 834px, and mobile 390px/320px, including category expansion, complete private bundles, mobile detail return, and checklist progress through category navigation. No horizontal document overflow was observed in the checked 320px, 834px, or 1440px flows. This is targeted interaction and layout verification, not a claim that every possible workflow has been manually audited.

Screenshots: `../../../output/playwright/simply-endorsed-hybrid-2026-09-10/` in the local project workspace.
