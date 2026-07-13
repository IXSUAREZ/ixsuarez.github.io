const fs = require('fs');
const path = require('path');
const { initJSDOM } = require('./test-helpers');
const data = require('../js/regulatory-definitions-data.js');
const curation = require('../js/regulatory-definitions-curation.js');
const definitionsUi = require('../js/regulatory-definitions-ui.js');

const indexPath = path.resolve(__dirname, '../../simply-endorsed-cfi/index.html');
const swPath = path.resolve(__dirname, '../../simply-endorsed-cfi/sw.js');
const syncPath = path.resolve(__dirname, '../scripts/sync-ecfr-definitions.js');

function initFullApp(url) {
  return initJSDOM({
    loadFullApp: true,
    domOptions: { pretendToBeVisual: true, url }
  });
}

const tests = [
  {
    id: 'T7_DEF_DATA_01',
    name: 'Official data contains §61.1 applicability and exactly 23 direct §61.1 definitions',
    tier: 7,
    feature: 7,
    fn: async () => {
      if (!data.applicability.officialText.startsWith('(a) Except as provided in parts 107 and 194')) {
        throw new Error('§61.1(a) applicability text is missing');
      }
      if (data.part61Definitions.length !== 23) {
        throw new Error(`Expected 23 §61.1 definitions, got ${data.part61Definitions.length}`);
      }
      const ids = new Set(data.part61Definitions.map((entry) => entry.id));
      if (ids.size !== 23) throw new Error('§61.1 definition IDs are not unique');
    }
  },
  {
    id: 'T7_DEF_DATA_02',
    name: 'Instructor-critical §1.1 terms are present',
    tier: 7,
    feature: 7,
    fn: async () => {
      const required = ['flight-time', 'pilot-in-command', 'second-in-command', 'night', 'full-flight-simulator-ffs', 'flight-training-device-ftd', 'aircraft', 'category', 'class', 'crewmember'];
      const ids = new Set(data.part1Definitions.map((entry) => entry.id));
      const missing = required.filter((id) => !ids.has(id));
      if (missing.length) throw new Error(`Missing §1.1 terms: ${missing.join(', ')}`);
    }
  },
  {
    id: 'T7_DEF_DATA_03',
    name: 'Official text remains separate from aliases and editorial explanations',
    tier: 7,
    feature: 7,
    fn: async () => {
      data.definitions.forEach((entry) => {
        if (Object.prototype.hasOwnProperty.call(entry, 'aliases') || Object.prototype.hasOwnProperty.call(entry, 'explanation')) {
          throw new Error(`Official entry ${entry.id} contains editorial fields`);
        }
        if (!entry.officialText || !entry.citation || !entry.sourcePart) {
          throw new Error(`Official entry ${entry.id} is incomplete`);
        }
      });
      if (!curation.terms['pilot-in-command'].explanation) throw new Error('Separate PIC curation is missing');
    }
  },
  {
    id: 'T7_DEF_META_01',
    name: 'Source metadata exposes reviewed snapshot dates, current and dated links, and hashes',
    tier: 7,
    feature: 7,
    fn: async () => {
      if (data.meta.currentThrough !== '2026-07-10' || data.meta.reviewedAt !== '2026-07-13') {
        throw new Error('Definitions snapshot dates changed unexpectedly');
      }
      if (!/authoritative but unofficial/i.test(data.meta.disclosure)) throw new Error('Required eCFR disclosure is missing');
      ['part61', 'part1'].forEach((key) => {
        const source = data.meta.sources[key];
        if (!source.currentUrl.includes('/current/') || !source.datedUrl.includes('/on/2026-07-10/')) throw new Error(`${key} source URLs are incomplete`);
        if (!/^[a-f0-9]{64}$/.test(source.sha256)) throw new Error(`${key} source hash is invalid`);
      });
    }
  },
  {
    id: 'T7_DEF_META_02',
    name: 'eCFR checker monitors completed Title 14 imports before comparing definitions',
    tier: 7,
    feature: 7,
    fn: async () => {
      const syncSource = fs.readFileSync(syncPath, 'utf8');
      ['api/versioner/v1/titles.json', 'import_in_progress', 'up_to_date_as_of', 'latest_amended_on', 'latest_issue_date'].forEach((token) => {
        if (!syncSource.includes(token)) throw new Error(`eCFR status guard is missing ${token}`);
      });
    }
  },
  {
    id: 'T7_DEF_SEARCH_01',
    name: 'Definition search covers exact terms, aliases, official text, keywords, and explanations',
    tier: 7,
    feature: 7,
    fn: async () => {
      const entries = definitionsUi.buildEntries(data, curation);
      const cases = [
        ['Pilot time', 'pilot-time'],
        ['PIC', 'pilot-in-command'],
        ['more than 15 nautical miles', 'cross-country-time'],
        ['FADEC', 'complex-airplane'],
        ['complex endorsement', 'complex-airplane'],
        ['commercial TAA', 'technically-advanced-airplane-taa'],
        ['61.129(j)', 'technically-advanced-airplane-taa'],
        ['meter reading', 'flight-time']
      ];
      cases.forEach(([query, expected]) => {
        const found = definitionsUi.searchEntries(entries, query, { topic: 'all', letter: 'all' });
        if (!found.some((entry) => entry.id === expected)) throw new Error(`Search ${query} did not find ${expected}`);
      });
    }
  },
  {
    id: 'T7_DEF_DECISIONS_01',
    name: 'High-risk instructor decision guides are complete and labeled editorial',
    tier: 7,
    feature: 7,
    fn: async () => {
      const required = ['time-relationships', 'acting-vs-logging-pic', 'cross-country-purpose', 'instrument-time-vs-training', 'authorized-instructor-scope', 'complex-vs-taa'];
      const ids = new Set(curation.decisions.map((decision) => decision.id));
      const missing = required.filter((id) => !ids.has(id));
      if (missing.length) throw new Error(`Missing decisions: ${missing.join(', ')}`);
      if (!/not CFR text/i.test(curation.conclusionLabel)) throw new Error('Decision conclusions are not clearly labeled editorial');
      const xc = curation.decisions.find((decision) => decision.id === 'cross-country-purpose');
      ['more than 50 nautical miles', 'more than 25 nautical miles', 'more than 15 nautical miles'].forEach((operator) => {
        if (!xc.branches.some((branch) => branch.operator.includes(operator))) throw new Error(`Cross-country operator missing: ${operator}`);
      });
      const complexTaa = curation.decisions.find((decision) => decision.id === 'complex-vs-taa');
      ['61.31(e)', '61.129(a)(3)(ii)', '61.129(j)'].forEach((citation) => {
        if (!complexTaa.sources.some((source) => source.includes(citation))) throw new Error(`Complex/TAA source missing: ${citation}`);
      });
      if (!complexTaa.branches.some((branch) => /one-time logbook-endorsement rule/.test(branch.conclusion))) throw new Error('Complex endorsement instructor cue is missing');
      if (!complexTaa.branches.some((branch) => /two-axis autopilot/.test(branch.conclusion))) throw new Error('Commercial TAA equipment cue is missing');
      if (!complexTaa.branches.some((branch) => /continuously visible/.test(branch.conclusion))) throw new Error('Commercial TAA continuous-display cue is missing');
    }
  },
  {
    id: 'T7_DEF_ROUTE_01',
    name: 'Definitions route loads dq and term state without showing browse or calculator content',
    tier: 7,
    feature: 7,
    fn: async () => {
      const helpers = initFullApp('http://localhost/simply-endorsed-cfi/?view=definitions&dq=PIC&term=pilot-in-command');
      try {
        const root = helpers.document.getElementById('regulatoryDefinitionsView');
        const input = helpers.document.getElementById('definitionsSearchInput');
        const detail = helpers.document.querySelector('[data-definition-detail="pilot-in-command"]');
        const provenance = helpers.document.querySelector('.definitions-provenance');
        if (!helpers.document.body.classList.contains('is-definitions-view') || !root || root.hidden) throw new Error('Definitions view did not activate');
        if (!input || input.value !== 'PIC' || !detail) throw new Error('Definitions dq/term state did not hydrate');
        if (!provenance || !provenance.textContent.includes(data.meta.version) || !provenance.textContent.includes(data.meta.sources.part61.sha256) || !provenance.textContent.includes(data.meta.sources.part1.sha256)) {
          throw new Error('Definitions provenance metadata is not displayed');
        }
        if (!helpers.document.getElementById('part61CalculatorView').hidden) throw new Error('Calculator remained visible');
      } finally {
        helpers.window.close();
      }
    }
  },
  {
    id: 'T7_DEF_ROUTE_02',
    name: 'Definitions search updates dq and selected term updates the shareable URL',
    tier: 7,
    feature: 7,
    fn: async () => {
      const helpers = initFullApp('http://localhost/simply-endorsed-cfi/?view=definitions');
      try {
        const input = helpers.document.getElementById('definitionsSearchInput');
        input.value = 'night';
        input.dispatchEvent(new helpers.window.Event('input', { bubbles: true }));
        let url = new helpers.window.URL(helpers.window.location.href);
        if (url.searchParams.get('dq') !== 'night') throw new Error(`Expected dq=night, got ${url.search}`);
        const card = helpers.document.querySelector('[data-definition-open="night"]');
        card.click();
        url = new helpers.window.URL(helpers.window.location.href);
        if (url.searchParams.get('term') !== 'night' || url.hash !== '#definition-night') throw new Error(`Term deep link was not serialized: ${url.href}`);
      } finally {
        helpers.window.close();
      }
    }
  },
  {
    id: 'T7_DEF_ROUTE_03',
    name: 'Popstate restores definitions route state',
    tier: 7,
    feature: 7,
    fn: async () => {
      const helpers = initFullApp('http://localhost/simply-endorsed-cfi/');
      try {
        helpers.window.history.pushState(null, '', '/simply-endorsed-cfi/?view=definitions&dq=simulator&term=full-flight-simulator-ffs');
        helpers.window.dispatchEvent(new helpers.window.PopStateEvent('popstate'));
        const input = helpers.document.getElementById('definitionsSearchInput');
        if (!helpers.document.body.classList.contains('is-definitions-view') || input.value !== 'simulator') throw new Error('Popstate did not restore definitions query');
        if (!helpers.document.querySelector('[data-definition-detail="full-flight-simulator-ffs"]')) throw new Error('Popstate did not restore definition detail');
      } finally {
        helpers.window.close();
      }
    }
  },
  {
    id: 'T7_DEF_STATE_01',
    name: 'Dedicated definitions search preserves endorsement query state',
    tier: 7,
    feature: 7,
    fn: async () => {
      const helpers = initFullApp('http://localhost/simply-endorsed-cfi/?q=tailwheel');
      try {
        helpers.document.getElementById('topbarDefinitionsBtn').click();
        const input = helpers.document.getElementById('definitionsSearchInput');
        input.value = 'PIC';
        input.dispatchEvent(new helpers.window.Event('input', { bubbles: true }));
        helpers.document.getElementById('topbarBrowseBtn').click();
        const url = new helpers.window.URL(helpers.window.location.href);
        if (url.searchParams.get('q') !== 'tailwheel') throw new Error(`Endorsement search was destroyed: ${url.search}`);
        if (url.hash.startsWith('#definition-')) throw new Error(`Definition hash leaked into browse state: ${url.hash}`);
        if (helpers.document.getElementById('searchInput').value !== 'tailwheel') throw new Error('Browse search input was not restored');
      } finally {
        helpers.window.close();
      }
    }
  },
  {
    id: 'T7_DEF_A11Y_01',
    name: 'Definitions UI exposes labeled search, filter groups, live count, and keyboard-focusable detail',
    tier: 7,
    feature: 7,
    fn: async () => {
      const helpers = initFullApp('http://localhost/simply-endorsed-cfi/?view=definitions&term=pilot-time');
      try {
        const input = helpers.document.getElementById('definitionsSearchInput');
        const label = helpers.document.querySelector('label[for="definitionsSearchInput"]');
        const live = helpers.document.querySelector('.definitions-result-count[aria-live="polite"]');
        const topics = helpers.document.querySelector('[role="group"][aria-label*="topic"]');
        const detail = helpers.document.querySelector('[data-definition-detail="pilot-time"]');
        if (!input || !label || !live || !topics || !detail || detail.getAttribute('tabindex') !== '-1') throw new Error('Definitions accessibility hooks are incomplete');
      } finally {
        helpers.window.close();
      }
    }
  },
  {
    id: 'T7_DEF_A11Y_02',
    name: 'CFR autolinking is disabled inside definition buttons and decision summaries',
    tier: 7,
    feature: 7,
    fn: async () => {
      const helpers = initFullApp('http://localhost/simply-endorsed-cfi/?view=definitions&dq=PIC&term=pilot-in-command');
      try {
        const interactiveContainers = helpers.document.querySelectorAll('.definition-card, .definition-decision > summary, .definitions-applicability summary');
        if (!interactiveContainers.length) throw new Error('Definitions interactive containers are missing');
        interactiveContainers.forEach((container) => {
          if (!container.classList.contains('no-cfr-autolink')) {
            throw new Error('Interactive definition container is not protected from CFR autolinking');
          }
          if (container.querySelector('a')) {
            throw new Error('Definition button or decision summary contains a nested link');
          }
        });
      } finally {
        helpers.window.close();
      }
    }
  },
  {
    id: 'T7_DEF_SEO_01',
    name: 'Generated SEO contains one static entry for every official definition',
    tier: 7,
    feature: 7,
    fn: async () => {
      const html = fs.readFileSync(indexPath, 'utf8');
      const ids = [...html.matchAll(/data-definition-id="([^"]+)"/g)].map((match) => match[1]);
      if (ids.length !== data.definitions.length || new Set(ids).size !== data.definitions.length) {
        throw new Error(`SEO definitions parity failed: HTML=${ids.length}, data=${data.definitions.length}`);
      }
      if (!html.includes(`data-definition-count="${data.definitions.length}"`)) throw new Error('SEO definition count marker is missing');
      curation.decisions.forEach((decision) => {
        const marker = `data-decision-id="${decision.id}" data-decision-source-count="${decision.sources.length}"`;
        if (!html.includes(marker)) throw new Error(`SEO decision/source parity failed for ${decision.id}`);
      });
      if ((html.match(/class="seo-instructor-decision-source"/g) || []).length !== curation.decisions.length) throw new Error('SEO decision source references are missing');
      if (!html.includes('href="https://www.ecfr.gov/current/title-14/part-61/section-61.31') || !html.includes('href="https://www.ecfr.gov/current/title-14/part-61/section-61.129')) {
        throw new Error('SEO Complex/TAA review sources are not linkified');
      }
    }
  },
  {
    id: 'T7_DEF_SW_01',
    name: 'Service worker precaches current HTML asset versions and definitions modules',
    tier: 7,
    feature: 7,
    fn: async () => {
      const html = fs.readFileSync(indexPath, 'utf8');
      const sw = fs.readFileSync(swPath, 'utf8');
      const required = [
        '/simply-endorsed/css/app.css?v=45',
        '/simply-endorsed/js/app.js?v=24',
        '/simply-endorsed/js/part61-calculator-ui.js?v=10',
        '/simply-endorsed/js/part61-scenario-generator.js?v=2',
        '/simply-endorsed/js/regulatory-definitions-data.js?v=1',
        '/simply-endorsed/js/regulatory-definitions-curation.js?v=2',
        '/simply-endorsed/js/regulatory-definitions-ui.js?v=2'
      ];
      required.forEach((asset) => {
        if (!html.includes(asset) || !sw.includes(asset)) throw new Error(`Asset/version parity missing for ${asset}`);
      });
    }
  },
  {
    id: 'T7_DEF_CALC_01',
    name: 'Calculator Rules and Sources includes an internal Definitions resource while retaining eCFR links',
    tier: 7,
    feature: 7,
    fn: async () => {
      const html = fs.readFileSync(indexPath, 'utf8');
      if (!html.includes('class="part61-definitions-resource"') || !html.includes('href="?view=definitions"')) throw new Error('Internal Definitions calculator resource is missing');
      if (!html.includes('https://www.ecfr.gov/current/title-14/part-61/section-61.109')) throw new Error('Existing external eCFR links were removed');
    }
  },
  {
    id: 'T7_DEF_REGRESSION_01',
    name: 'Existing browse, guidance, and calculator routes remain available',
    tier: 7,
    feature: 7,
    fn: async () => {
      const cases = [
        ['http://localhost/simply-endorsed-cfi/', 'browse'],
        ['http://localhost/simply-endorsed-cfi/?view=guidance', 'guidance'],
        ['http://localhost/simply-endorsed-cfi/?view=calculator', 'calculator']
      ];
      for (const [url, view] of cases) {
        const helpers = initFullApp(url);
        try {
          if (view === 'browse' && helpers.document.getElementById('endorsementList').hidden) throw new Error('Browse view hidden');
          if (view === 'guidance' && helpers.document.getElementById('guidanceView').hidden) throw new Error('Guidance view hidden');
          if (view === 'calculator' && helpers.document.getElementById('part61CalculatorView').hidden) throw new Error('Calculator view hidden');
        } finally {
          helpers.window.close();
        }
      }
    }
  }
];

module.exports = { tests };
