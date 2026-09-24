# Modern Aviation Journal

Presentation redesign for 500 existing reading routes: 441 Learn articles, 14 Blog articles, 18 Simply Endorsed guides, three library indexes, and 24 topic/training collections. Existing wording, order, references, heading IDs, destinations, CTA tracking, metadata, and structured data are preserved.

## Release source

Integrated in a clean worktree based on `dfd653cf9573153a6a5e34935fd493282ae2914a`, the current shared navigation release. `baseline.json` is a fresh pre-transformation snapshot of that release, not the older design workspace. `preservation.json` records all 500 before/after file hashes and comparison results. No unrelated workspace edits or incomplete factual audit work are included.

## Reader

`assets/journal.css` scopes editorial typography, openings, libraries, references, tables, and print layout to journal pages. `assets/journal.js` adds complete h2–h6 chapter navigation, active section tracking, progress, three text sizes, and a persisted motion preference. Device reduced motion overrides the saved motion preference. Text remains readable without JavaScript or storage. Nested endorsement cards stay within one outer reader. Shared appearance settings, navigation, and footer interactions remain intact.

The current Blog category filter/show-more interface and Learn search/history behavior are retained. New authoring templates and generation hooks reuse this system.

## Local preview and authoring

```sh
python3 scripts/preview-journal.py --port 8966
python3 scripts/journal.py apply
```

Open `http://127.0.0.1:8966/learn/`. For the private Learn source generator, use:

```sh
python3 scripts/build-learn-journal.py --generator /absolute/path/to/build_learn_library.py
```

Private input/evidence stays outside the site; only public output targets this checkout. The wrapper refreshes chrome, theme, and reader presentation. It was not run during this presentation-only release because doing so could import changed instructional drafts.

## Verification

```sh
python3 scripts/journal.py check
python3 -m unittest scripts/tests/test_journal.py scripts/tests/test_footer_sync.py scripts/tests/test_site_audit.py
python3 scripts/sync-site-metadata.py --check
python3 scripts/sync-chrome.py --check
python3 scripts/sync-avionics.py --check
python3 scripts/audit-site.py
node --test scripts/tests/library-search.test.cjs scripts/tests/contact-form.test.cjs scripts/tests/footer.test.cjs scripts/tests/appearance.test.cjs scripts/tests/avionics-navigation.test.cjs
JOURNAL_URL=http://127.0.0.1:8966 node scripts/tests/journal-browser.cjs
```

The browser runner requires Chrome and Playwright. `NODE_PATH` can point to an installed Playwright package. It uses disposable profiles, serves same-site avatar assets locally, and blocks remote fonts because the reader uses platform fonts.

The original design workspace completed desktop/mobile screenshot coverage of every route. Release integration additionally recaptures all current libraries, all endorsement guides, and representative technical/table-heavy articles. Browser checks exercise themes, contrast, chapters/history, dock clearance, search/filter states, keyboard settings, 320px, enlarged text, reduced motion, fast scrolling, printing, no JavaScript, and blocked storage. GPT-6 Luna independently reviews the reader and release integration; final review/deployment evidence is saved alongside the local release outputs.

This is presentation and preservation verification, not a factual aviation-content audit or formal accessibility certification. Publication is authorized separately by the user. Live release verification checks GitHub Pages completion and published bytes against the committed source.
