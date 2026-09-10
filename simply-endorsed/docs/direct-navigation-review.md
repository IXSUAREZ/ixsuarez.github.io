# Simply Endorsed: direct navigation

September 10, 2026

## Design strategy

Keep the instructor's next action visible. Category selection should display its endorsements immediately, checklist actions should behave like checkboxes, and Guidance should present a focused answer rather than an expanding collection of panels.

The Ferrari Luce / LoveFrom reference informs clear control purposes, immediate feedback, and careful separation of navigation from reading. The application retains SuarezCFI's warm neutral palette, restrained gold, and category colors. Reference: [Ferrari's interior and interface design description](https://www.ferraribeverlyhills.com/articles/ferrari-luce-revealing-interior-interface-design).

## Changes and evidence

| Requirement | Implementation and verification |
| --- | --- |
| Reduce clutter before the content | Removed the filter panel, repeated introductory captions, and workspace subtitle. The checked 390px initial viewport shows five endorsement rows. |
| Category clicks open content directly | Category rows are navigation links, not expanders. Tests click all 13 categories and verify the heading and available training paths. |
| Full-screen Browse | Native modal dialog covers the viewport edge to edge. Browser geometry at 390 × 844 measured x=0, y=0, width=390, height=844. |
| Intuitive checklists | First checkbox starts the temporary review. Conditional items have explicit Not applicable controls. Details and sources expand beside each item. Completion still requires all applicable items; unrelated navigation preserves progress and reload clears it. Space-key review and conditional controls verified in the browser. |
| Improve all Guidance | Six-section directory, question lists, and 58 focused reading routes. Quick Reference and CFI Career now use the same topic structure. Tests open every question and verify its title, answer content, and return link. |
| Search the complete Guidance collection | Added reference, career, and DPE topics to the existing journey, scenario, and lesson index. Every indexed topic is tested against its reading route. |
| Preserve existing endorsements and paths | Tests retain all 96 detail views and all 71 browsing paths, including full primary and supplemental packages. |
| Responsive navigation and reading | Browser review at 1440px, 834px, 390px and 320px. No horizontal document overflow in the checked flows. Guidance-to-endorsement return restores the originating link's focus. Active checklist and return-link rectangles were checked for overlap. |

Validation: 1,543 workspace assertions and 93 existing integration/calculator tests pass. Existing regulatory facts and model wording remain in their source datasets; this revision changes how they are reached and presented.

## Local review captures

Saved in `../../../output/playwright/simply-endorsed-direct-2026-09-10/`:

- `mobile-library.png`
- `mobile-fullscreen-browse.png`
- `mobile-checklist.png`
- `mobile-guidance-answer.png`
- `tablet-guidance.png`
- `desktop-category.png`

The user-provided before screenshots document the prior excess header/filter area and inset category modal.
