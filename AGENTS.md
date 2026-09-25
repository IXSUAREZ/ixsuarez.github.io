# SuarezCFI active interface direction

Polished Aurum is the selected site-wide material system. Read `docs/design/POLISHED_AURUM.md` before interface work. The reference uses reflective metallic yellow gold, gray glass, Day #E3E3E3 and Night #414141, with System appearance by default.

Use `assets/avionics.css` as the shared material authority and `assets/appearance.js` for appearance. Its historical filename does not authorize the superseded cyan/blue or near-black palette. Do not restore Champagne Precision, Gold Inlay, flat yellow, or earlier decorative palettes. Original style sources are archived outside the deployable site as documented in the design authority.

Preserve application navigation, geometry, data/calculation logic, direct links, meaningful category/risk colors, scientific diagrams, and exported artwork. Integrate app-owned styles explicitly; do not change layouts while replacing material declarations.

After page generation or standalone app packaging, run `python3 scripts/sync-avionics.py`, `python3 scripts/refresh-tactile-caches.py`, and `python3 scripts/audit-aurum.py`. The audit proves asset wiring only. Verify rendered templates and actual affected interactions separately. Check `docs/design/IMPLEMENTATION_STATUS.md` for incomplete migration and acceptance work before calling the site-wide migration complete.
