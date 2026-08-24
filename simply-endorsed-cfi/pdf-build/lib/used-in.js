"use strict";

/**
 * used-in.js — reverse usage map: endorsement id → where the book uses it.
 *
 * Cards link laterally (Related chips) and outbound (eCFR, AC PDF), but
 * nothing pointed back to the pages that consume an endorsement. For every
 * endorsement id this module collects:
 *
 *   flows      bundles that get a Part II flow page (anchor #wf-<bundle.id>)
 *              where the id is primary or supplemental, in BROWSE_STRUCTURE
 *              order. Flow-page rule is the same one sections/20,
 *              make-nav-data.js, and qa-check.js use:
 *              bundle.featured || contentRenderer === "pre-solo".
 *   journey    true when any JOURNEY_STAGES entry references the id — in its
 *              endorsements list, or in a note's id (e.g. A.14 TSA is only
 *              cited from a pre-solo note) → one chip to #journey.
 *   scenarios  true when any SCENARIO_CARDS entry references the id → one
 *              chip to #scenarios.
 *
 * The map is built lazily from the cached data object (lib/load-data
 * getData()), so section call sites don't change: renderEndorsementCard
 * renders the row unless opts.showUsedIn === false.
 */

const { getData } = require("./load-data");
const { CATEGORY_LABELS } = require("./theme");

/**
 * Max chips in a card's "Used in" row. Priority order: flow chips first,
 * then the single journey chip, then the single scenarios chip.
 */
const MAX_USED_IN_CHIPS = 5;

let _usageMap = null;

/** id → { flows: [{ bundleId, label, categorySlug }], journey, scenarios } */
function buildUsageMap(data) {
  const map = new Map();
  const entry = (id) => {
    let u = map.get(id);
    if (!u) {
      u = { flows: [], journey: false, scenarios: false };
      map.set(id, u);
    }
    return u;
  };

  // (a) flow-page bundles (featured or pre-solo) — primary or supplemental.
  for (const cat of data.BROWSE_STRUCTURE || []) {
    for (const b of cat.subcategories || []) {
      if (!b.featured && b.contentRenderer !== "pre-solo") continue;
      const ids = [...(b.primaryIds || []), ...(b.supplementalIds || [])];
      for (const id of ids) {
        entry(id).flows.push({
          bundleId: b.id,
          label: b.label,
          categorySlug: cat.categoryId,
        });
      }
    }
  }

  // (b) Student Journey stages — endorsements list plus note ids.
  for (const s of data.JOURNEY_STAGES || []) {
    for (const x of s.endorsements || []) entry(x.id).journey = true;
    for (const n of s.notes || []) {
      if (n && n.id) entry(n.id).journey = true;
    }
  }

  // (c) DPE scenario cards.
  for (const c of data.SCENARIO_CARDS || []) {
    for (const x of c.endorsements || []) entry(x.id).scenarios = true;
  }

  return map;
}

/** Lazily built, process-cached usage map (data is static per run). */
function usageMap() {
  if (!_usageMap) _usageMap = buildUsageMap(getData());
  return _usageMap;
}

/**
 * usedInChips(id) → up to MAX_USED_IN_CHIPS chip descriptors
 * [{ href, label, title }] for the card's "Used in" row, or [] when nothing
 * in the book consumes the endorsement (the row is then omitted entirely).
 *
 * When two flows share one label (the private/commercial "ASEL Initial
 * Checkride Bundle" pair), both are prefixed with their category label so
 * the chips stay distinguishable.
 */
function usedInChips(id) {
  const u = usageMap().get(id);
  if (!u) return [];

  const chips = [];
  const labelCount = new Map();
  for (const f of u.flows) {
    labelCount.set(f.label, (labelCount.get(f.label) || 0) + 1);
  }
  for (const f of u.flows) {
    const label =
      labelCount.get(f.label) > 1
        ? `${CATEGORY_LABELS[f.categorySlug] || f.categorySlug} · ${f.label}`
        : f.label;
    chips.push({
      href: `#wf-${f.bundleId}`,
      label,
      title: `Workflow: ${label} (Part II)`,
    });
  }
  if (u.journey) {
    chips.push({
      href: "#journey",
      label: "Student Journey",
      title: "Student Journey (Part III)",
    });
  }
  if (u.scenarios) {
    chips.push({
      href: "#scenarios",
      label: "DPE Scenarios",
      title: "DPE Scenarios (Part III)",
    });
  }
  return chips.slice(0, MAX_USED_IN_CHIPS);
}

module.exports = {
  MAX_USED_IN_CHIPS,
  buildUsageMap,
  usedInChips,
};
