# Neumorphism standalone application integration — October 14, 2026

This is a material-only release of PilotSolve, Aero Lab, and Crank & Core. The approved gray/gold tool preview is the visual reference. Existing public application JavaScript, WASM, and engine/model assets are preserved byte-for-byte; source UI builds validate durable inclusion without exporting unrelated source logic.

## Source ownership and exported assets

- **PilotSolve**: `/Volumes/VIXIONDRIVE/VIBE CODING PROJECTS/INSTRUCTOR STUDIO/Projects/Flight Tools/PilotSolve/public/neumorphism.css` → `pilotsolve/neumorphism.css`; SHA-256 `0538ed4894e7791121208eac107342ca54d01269921607c86a08b7f46d799d8d`.
- **Aero Lab**: `/Volumes/VIXIONDRIVE/VIBE CODING PROJECTS/INSTRUCTOR STUDIO/Projects/Aero Lab/web/public/neumorphism.css` → `aero-lab/neumorphism.css`; SHA-256 `2902afa234c55b8e17b4865df9d27f3982b12f604c14a5f58c7a94aee1f231f4`.
- **Crank & Core**: `/Volumes/VIXIONDRIVE/VIBE CODING PROJECTS/INSTRUCTOR STUDIO/Projects/Flight Tools/Crank & Core/public/neumorphism.css` → `engine-explorer/app/neumorphism.css`; SHA-256 `238fa487f1dc0447dcde10ddde19a7b455969994ad352b5dc972c1075dc59840`.

Both PilotSolve site entries, the source mobile entry, its app offline exporter, and its site exporter include `neumorphism.css`. `scripts/package-pilotsolve.py` preserves that source-owned asset in subsequent builds. The published `BUILD.json` and service-worker precache allowlist include it; root integration refreshes the final cache name after shared appearance assets settle.

Aero Lab source `index.html` and `gallery.html` include the stable public asset. Its Vite asset-copy plugin now honors the configured output directory, including external scratch builds. Crank & Core source `index.html` includes its stable public asset. The live integration entries include the same assets after shared semantic CSS.

## Material coverage

- Matching matte gray Day / graphite Night canvas, compact and broad paired raised shadows, inset entry surfaces, gold actions/selected states, and clear focus outlines.
- PilotSolve header, bottom tabs, choice sheets, fields, unit split actions, numeric keypad, result panels, favorite tiles, secondary actions, settings, and app menus.
- Aero Lab lesson rail, teaching-view controls, cockpit/condition panels, lesson/reference cards, dialogs, desktop gate, geometry modal, gallery surfaces, and app-owned navigation.
- Crank & Core engine selection, contextual engine header, floating navigation/action rails, parts browser, view controls, search, study panels, inspector, menus, and dialogs.
- Existing diagram colors, teaching legends, engine geometry/materials, instruments, phase colors, calculations, state, input semantics, and route behavior remain owned by their existing runtime.

## Verification completed

- External SSD mounts verified before work. Source builds and scratch outputs remained on external storage.
- PilotSolve protected-runtime integrity: **28 protected files passed**.
- PilotSolve TypeScript and Vite production UI build passed; **34 calculator, planning, persistence, helper, and numeric engine tests passed**.
- Aero Lab TypeScript and Vite UI build passed; **16 flow bridge, worker, and lesson-loader tests passed** with Vitest. An initial Node test-runner invocation was corrected to the project's Vitest runner.
- Crank & Core TypeScript and Vite UI build passed without invoking model-generation or packaging scripts. Current public geometry/model files are preserved.
- Existing public JS/WASM/model inventory: **50 of 50 SHA-256 identities unchanged** (snapshot and comparison in external scratch).
- In-app browser PilotSolve: desktop and 390×844 / 320×568 reviewed. Day/Night settings worked; 320px page width matched viewport. Numeric keypad fixture with wind 20kt, from 30°, runway 0° produced **10kt crosswind and 17.3205kt headwind**. Native unit cycle/choice actions remained distinct, and the original blue wind diagram remained visible.
- In-app browser Aero Lab: original colorful live particle flow rendered; Day/Night appearance changed; “Find the stall” lesson updated the angle/forces and teaching copy. No browser warnings/errors observed in these checks.
- In-app browser Crank & Core: original Rotax engine loaded, Explore opened the engine workspace, and Parts opened the populated component browser. Original 3D colors and geometry were visible; no browser warnings/errors observed in these checks.

## Integration boundary

The Crank & Core source repository contains extensive pre-existing model and runtime work, including source ahead of the released bundles; PilotSolve and Aero Lab source directories have no Git ancestor on the current physical source mount. These changes deliberately export only the new source-owned stylesheet and entry/packaging references. No ahead calculator, simulation, or engine code was published. No source commits or deployment were performed by this worker.

Final shared stylesheet/cache sync, coordinated route coverage, outer navigation acceptance, screenshot packaging, and deployment verification belong to root integration.
