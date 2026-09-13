# Website follow-up review — 2026-09-13

## Implemented

- Fixed the Engine Explorer source panel taking width beside the simulator. The simulator now uses the full width; sources are in a collapsed strip below. Desktop and 390px mobile geometry and the Explore control were checked in the browser.
- Verified Aero Lab renders, its lesson selection responds, and mobile devices see the intended desktop guidance. Added the missing Crank & Core link to its app menu. Independently built app menus now get missing entries from the shared registry, and their directory links lead to `/tools/`.
- Updated outdated BasicMed and Sport Pilot/MOSAIC claims in the comparison blog articles. Removed generic aircraft specifications and unsupported local rates from the aircraft comparison.
- Corrected the Learn BasicMed guide's exclusion of student pilots: eligible student pilots may use BasicMed under §61.89(d). Corrected its altitude/speed bounds and clarified the student certificate guide. An erroneous draft blanket prohibition proposed during review was rejected before publication.
- Updated FAA handbook references and replaced two removed IACRA help-page links with the official application portal.
- Clarified Diego's Kentucky Flight Training Center affiliation, qualified the AGI scope, removed unsupported drive-time claims and blanket discovery-flight eligibility wording, and made the Louisville training page's first message about flight lessons.
- Synchronized visible FAQ answers with FAQ structured data on the four revised local service pages and both comparison blogs.

## Coverage and evidence

The two article screening inventories together cover all 473 article routes in the registry, plus five category/index pages. Their evidence levels are deliberately different: the technical inventory records screening without claiming factual verification; the regulatory report records its specific checked claims; the separate blog review records actual main-body review of all 14 blog articles. These are not a word-for-word FAA certification of the whole corpus.

See [regulatory review](content-review-regulatory.md), [technical screening](content-review-technical.md), [blog claim review](blog-claim-review.md), and [official source link audit](official-source-link-audit.md). The link audit covers 390 unique official URLs across 447 pages. Most external 403/429/timeouts were inconclusive, not confirmed missing sources. Both confirmed IACRA 404 references were repaired.

## Account dependencies

The existing Formspree URL opened a login page, so no real submission endpoint could be retrieved. The Google Business Profile manager opened but returned a blank, uninspectable page in the current browser session. The user has been asked for the public Formspree endpoint and Maps/Business Profile link. No account was created, message sent, or business listing changed. Direct submissions remain disabled; the existing email draft and phone options work without pretending a message was sent.

Search Console baseline remains private in ignored output files. Neither a rank increase nor complete Google indexing is claimed. New preview dimensions, canonical metadata and sitemap consistency are tested independently of Google's eventual search appearance.
