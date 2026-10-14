# Neumorphic app grid

The approved Home Screen launcher replaces the orbit/carousel with the complete public app catalog. `config/tool-catalog.json` supplies app order, names, categories, destinations, artwork identity and compatibility. `scripts/render-tool-catalog.py` generates the same collection on the homepage and Tools page.

Each tile is a native link. Tapping an icon or its label opens the app immediately. All seven public apps appear with JavaScript disabled; purpose filters only appear after enhancement and always start on All tools. Returning with browser Back also restores the complete collection. There are no selection stages, carousel arrows, swipe interception, hidden app directories, or stored app selection preferences.

The icon frame uses shared `--av-neu-*` surfaces and raised/pressed shadows from `assets/avionics.css`. The original app artwork and product colors remain intact. The gold filter selection and keyboard focus use existing Aurum gold tokens. Desktop device requirements remain visible under Aero Lab and Crank & Core, while full descriptions and compatibility are available to assistive technology.

The grid uses four columns at typical phone and desktop widths. Container queries reduce to three columns below 20rem of available collection width and two below 15rem. Because these thresholds are expressed in rem, enlarged root text also reduces the number of columns. Scrolling stays vertical; tile names wrap. Buttons have a minimum 44px touch height. Reduced motion removes transitions, forced colors retain control outlines, and print exposes the complete app list regardless of an on-screen filter.

## Verification

- `node --test scripts/tests/tool-catalog.test.cjs`: catalog order, actual destinations/artwork, static availability, native links, compatibility guidance, independent filters, blocked storage, obsolete preference immunity, browser Back restoration, native key/swipe behavior.
- `python3 -B -m unittest scripts.tests.test_tool_catalog`: home/Tools generation persistence, document preservation, shared destination order, config integrity and safe escaping.
- After central page regeneration: `python3 -B scripts/render-tool-catalog.py --check`, the site theme/cache synchronization, and actual browser review in Day/Night at 320/375/390px and desktop with enlarged text.

Source checks support the generated catalog and filter behavior. Rendered appearance and browser geometry are verified separately in the release evidence.
