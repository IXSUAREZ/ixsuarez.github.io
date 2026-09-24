# PilotSolve tactile authoring source

The authoritative editable copy is kept outside this site repository at:

`/Users/diegosuarez/Projects/suarez-tactile-sources-20260924/pilotsolve`

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
