# PilotSolve tactile authoring source

The current isolated release authoring copy is kept outside this site repository at:

`/Users/diegosuarez/Projects/suarez-pilotsolve-gold-review-source-20261004`

It was copied from `/Users/diegosuarez/Projects/suarez-aurum-sources/pilotsolve`.
Before editing, its production build reproduced the deployed app CSS, shared app
JavaScript, and mobile entry JavaScript byte-for-byte. Both earlier source copies
remain preserved. `gold-review-20261004.patch` records the refinement against that
Aurum source baseline. The original tactile baseline remains at
`/Users/diegosuarez/Projects/suarez-tactile-sources-20260924/pilotsolve`.

`tactile.patch` records the authored changes against the source baseline. Build
the isolated copy from the PilotSolve source root with:

```sh
npm ci
npm test
npm run check:runtime
npx tsc --noEmit
npx vite build --config production.config.ts
node scripts/prepare-suarezcfi.mjs /path/to/site
PILOTSOLVE_SITE_ROOT=/path/to/site node --test tests/site-offline-worker.test.mjs
```

The patch adds the shared tactile dock contract, direct-entry angle fields with
44px decrement, rotary, and increment controls, tactile keypad treatment, and
offline caching for `/assets/tactile.js`.
It does not change calculation engines, saved-data schemas, or protected mobile
runtime files.

## Gold review — October 4, 2026

App-owned text uses the shared system UI font token. Blank numeric controls say
Enter; unavailable result actions show neutral materials and explain the missing
inputs. Desktop tool inputs retain their sequence and gain a narrower grouped
measure. Calculation, helper, unit, numeric-entry, and result handlers are unchanged.

The package generator follows the mobile entry dependency graph, so it does not
restore protected preview runtime/fonts into the public app. Online documents and
shared theme assets keep their deployed network refresh policy, with offline
fallbacks; content-hashed app bundles remain cache-first. Worker registration uses
`updateViaCache: 'none'`. These reduce stale-theme opportunities; the original
first-visit blue appearance remains an observation with an unconfirmed cause.

Validation: 36 app tests; 5 site offline-worker tests; TypeScript check; production
build; integrity check for all 28 protected runtime files. Chromium views at
1280 x 900 and 390 x 844 verified blank entry, neutral disabled result actions,
shared system font, Day/Night canvases, keypad Next, and a completed crosswind
calculation. Physical installed/offline iPhone and iPad acceptance is separate.
