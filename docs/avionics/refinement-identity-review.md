# Refinement identity and route review

## Identity sources and generated files

The canonical artwork is the 47 approved 1024 × 1024 `icon-master.png` files in `assets/identities/<id>/`. Each copied master is byte-identical to its matching source in `ixsuarez.github.io/assets/identities/`. The aggregate SHA-256 over sorted `identity-id + master SHA-256` rows is `62d044fb60759731569ef4dbf8fea73596368bfd00f7257a6a760115ecacbe57`.

`scripts/render-identities.cjs` rendered and validated all **47** identity sets. It regenerates master-backed SVG wrappers and 512 px logos, 1200 px previews, 48/180/192 px icons, mapped standalone app icons, home root PNG/SVG icons, and the root ICO. Its output checks compare every small identity icon byte-for-byte with a fresh resize of that identity's master; the root favicon sizes are likewise checked against the home master. `favicon.ico` contains 16, 32, and 48 px images. Nine configured `previewSource` selections remain the input for their social previews; the identity artwork renderer does not replace those sources with generic marks.

The 47 `site-pages.json` identity source entries now point to their corresponding `icon-master.png`. Standalone app sources for Aero Lab, FlightRisk, and PilotSolve also consume master-backed assets. Manifest icon purposes remain `any`; no full-bleed icon was labeled maskable.

## Canonical route coverage

Static review covered all **523** canonical routes and all **551** HTML files: 523 routes, 15 renderable utility or standalone HTML files, 11 template/partial files, and 2 documented non-release fixtures or fragments. All 523 canonical route files exist. Each has one `<head>`, one canonical link, one title, one description, and at least one favicon resource. Together the routes contain **1,569** icon and touch-icon references; all absolute local favicon targets exist.

Of the 523 routes, **522** link directly to their identity's `icon-192.png`. The homepage is the intentional exception: its ICO, 192 px favicon, and Apple touch icon use the root paths, all generated from the `home` master and checked by the renderer. There are no broken absolute favicon references. The three installed-app manifests inspected reference generated icon files and use `any` purpose.

No canonical route has duplicate head, canonical metadata, or stylesheet inclusion. The `/tools/` duplicate stylesheet inclusion identified earlier was corrected in the page and its generator; the latest generator check reports zero drift.

The **15** renderable utility or standalone files each have one balanced `<head>` and no duplicate stylesheet URLs. Four carry their own canonical tag, three carry favicon links, and one carries an app manifest; the rest are nested app surfaces or PDF preview pages rather than canonical public routes. The **11** template/partial files comprise seven page templates with a single `<head>` and four HTML fragments with no document head; route-specific canonical and favicon metadata is added when pages are generated from those templates. The two excluded non-release files are a manual text-size fixture and a PDF fragment.

## Utility, template, and route audit results

`scripts/audit-site.py` found **526** discoverable HTML pages: 523 canonical routes, two redirect aliases, and one explicit built runtime entry. `/pilotsolve/mobile.html` is classified by a path-specific rule tied to `../sources/pilotsolve/scripts/prepare-suarezcfi.mjs`; it is a shipped installable app shell, not a canonical route or redirect. Local links and JSON-LD passed with **0 broken references**, **0 JSON-LD failures**, and **0 audit failures**. The canonical route inventory remains 523 entries.

`scripts/audit-avionics.py` confirmed all 523 canonical files and classified the 28 remaining HTML files as noted above. Its final run reported three broader findings: the homepage hero subtree differs from its recorded baseline, and protected-source hashes changed for Certificate Generator and Part 61 Calculator. The Part 61 change here is the intentional image-reference update to its generated identity logo; the other findings are separate shared-shell or concurrent work and are not resolved by this identity review.

These checks inspect files and metadata. They do not measure browser cache freshness or establish external social-platform previews.
