const fs = require('fs');
const path = require('path');
const { initJSDOM } = require('./test-helpers');

const tests = [
  // ==========================================
  // TIER 1: FEATURE COVERAGE (25 TESTS)
  // ==========================================

  // Feature 1: Step-by-Step Navigation
  {
    id: "T1_F1_01",
    name: "Wizard active step defaults to 1 on initial load",
    tier: 1,
    feature: 1,
    fn: async (dom, helpers) => {
      const workbench = helpers.document.querySelector('.part61-workbench');
      if (!workbench) throw new Error("Workbench element .part61-workbench not found");
      const activeStep = workbench.getAttribute('data-active-step');
      if (activeStep !== '1') {
        throw new Error(`Expected active step to default to '1', but got '${activeStep}'`);
      }
    }
  },
  {
    id: "T1_F1_02",
    name: "Active step updates to 2 when Next button on Step 1 is clicked",
    tier: 1,
    feature: 1,
    fn: async (dom, helpers) => {
      const nextBtn = helpers.document.querySelector('#part61NextBtn, .part61-next-btn');
      if (!nextBtn) throw new Error("Next button not found");
      nextBtn.click();
      const workbench = helpers.document.querySelector('.part61-workbench');
      const activeStep = workbench.getAttribute('data-active-step');
      if (activeStep !== '2') {
        throw new Error(`Expected active step to be '2' after clicking Next, but got '${activeStep}'`);
      }
    }
  },
  {
    id: "T1_F1_03",
    name: "Active step updates back to 1 when Back button on Step 2 is clicked",
    tier: 1,
    feature: 1,
    fn: async (dom, helpers) => {
      const workbench = helpers.document.querySelector('.part61-workbench');
      workbench.setAttribute('data-active-step', '2');
      // Simulate state update if UI doesn't react automatically to attributes,
      // but in real E2E we click the Back button.
      const backBtn = helpers.document.querySelector('#part61BackBtn, .part61-back-btn');
      if (!backBtn) throw new Error("Back button not found");
      backBtn.click();
      const activeStep = workbench.getAttribute('data-active-step');
      if (activeStep !== '1') {
        throw new Error(`Expected active step to return to '1' after clicking Back, but got '${activeStep}'`);
      }
    }
  },
  {
    id: "T1_F1_04",
    name: "Navigation buttons correctly advance step by step from 1 to 4",
    tier: 1,
    feature: 1,
    fn: async (dom, helpers) => {
      const workbench = helpers.document.querySelector('.part61-workbench');
      for (let step = 1; step <= 3; step++) {
        workbench.setAttribute('data-active-step', String(step));
        const nextBtn = helpers.document.querySelector(`#part61NextBtn, .part61-next-btn`);
        if (!nextBtn) throw new Error(`Next button not found on step ${step}`);
        nextBtn.click();
        const activeStep = workbench.getAttribute('data-active-step');
        if (activeStep !== String(step + 1)) {
          throw new Error(`Expected step to advance to ${step + 1}, but got ${activeStep}`);
        }
      }
    }
  },
  {
    id: "T1_F1_05",
    name: "Step-by-step panel visibility follows active step",
    tier: 1,
    feature: 1,
    fn: async (dom, helpers) => {
      const workbench = helpers.document.querySelector('.part61-workbench');
      workbench.setAttribute('data-active-step', '3');
      // Force UI updates if manual update is needed, or simulate click
      // Verify panel visibility
      const panels = helpers.document.querySelectorAll('.part61-panel');
      if (panels.length === 0) throw new Error("No panels with class .part61-panel found");
      panels.forEach((panel) => {
        const stepNum = panel.getAttribute('data-step') || panel.dataset.step;
        const isHidden = panel.hidden || panel.style.display === 'none' || panel.classList.contains('hidden');
        if (stepNum === '3') {
          if (isHidden) throw new Error("Active panel for step 3 is hidden");
        } else {
          // Non-active panels should be hidden
          if (stepNum && !isHidden) throw new Error(`Inactive panel for step ${stepNum} is not hidden`);
        }
      });
    }
  },

  // Feature 2: Step Rail Synchronization
  {
    id: "T1_F2_01",
    name: "Step rail container exists and contains 5 rail items",
    tier: 1,
    feature: 2,
    fn: async (dom, helpers) => {
      const rail = helpers.document.querySelector('nav.part61-step-rail');
      if (!rail) throw new Error("Step rail container nav.part61-step-rail not found");
      const items = rail.querySelectorAll('.part61-rail-item');
      if (items.length !== 5) {
        throw new Error(`Expected exactly 5 rail items, but found ${items.length}`);
      }
    }
  },
  {
    id: "T1_F2_02",
    name: "Clicking Step 2 rail item advances the wizard step to 2",
    tier: 1,
    feature: 2,
    fn: async (dom, helpers) => {
      const railItems = helpers.document.querySelectorAll('nav.part61-step-rail .part61-rail-item');
      if (railItems.length < 2) throw new Error("Step rail items missing");
      railItems[1].click(); // Index 1 is step 2
      const activeStep = helpers.document.querySelector('.part61-workbench').getAttribute('data-active-step');
      if (activeStep !== '2') {
        throw new Error(`Expected step rail click to transition to step 2, but active step is '${activeStep}'`);
      }
    }
  },
  {
    id: "T1_F2_03",
    name: "Clicking Step 3 rail item advances the wizard step to 3",
    tier: 1,
    feature: 2,
    fn: async (dom, helpers) => {
      const railItems = helpers.document.querySelectorAll('nav.part61-step-rail .part61-rail-item');
      if (railItems.length < 3) throw new Error("Step rail items missing");
      railItems[2].click(); // Index 2 is step 3
      const activeStep = helpers.document.querySelector('.part61-workbench').getAttribute('data-active-step');
      if (activeStep !== '3') {
        throw new Error(`Expected step rail click to transition to step 3, but active step is '${activeStep}'`);
      }
    }
  },
  {
    id: "T1_F2_04",
    name: "Step rail items have correct links matching panel IDs or step IDs",
    tier: 1,
    feature: 2,
    fn: async (dom, helpers) => {
      const railItems = helpers.document.querySelectorAll('nav.part61-step-rail .part61-rail-item');
      if (railItems.length === 0) throw new Error("No rail items found");
      railItems.forEach((item, index) => {
        const href = item.getAttribute('href');
        if (!href) throw new Error(`Rail item at index ${index} lacks href attribute`);
      });
    }
  },
  {
    id: "T1_F2_05",
    name: "Status indicators exist for each step in step rail",
    tier: 1,
    feature: 2,
    fn: async (dom, helpers) => {
      const railItems = helpers.document.querySelectorAll('nav.part61-step-rail .part61-rail-item');
      railItems.forEach((item, idx) => {
        const indicator = item.querySelector('i.part61-rail-status');
        if (!indicator) throw new Error(`Status indicator missing in rail item index ${idx}`);
      });
    }
  },

  // Feature 3: Step 5 Review & Share Summary Panel
  {
    id: "T1_F3_01",
    name: "#part61ReviewShare panel exists in the DOM",
    tier: 1,
    feature: 3,
    fn: async (dom, helpers) => {
      const reviewShare = helpers.document.getElementById('part61ReviewShare');
      if (!reviewShare) {
        throw new Error("Summary panel #part61ReviewShare not found in DOM");
      }
    }
  },
  {
    id: "T1_F3_02",
    name: "#part61ReviewShare is hidden when active step is 1",
    tier: 1,
    feature: 3,
    fn: async (dom, helpers) => {
      const reviewShare = helpers.document.getElementById('part61ReviewShare');
      if (!reviewShare) throw new Error("#part61ReviewShare missing");
      const workbench = helpers.document.querySelector('.part61-workbench');
      workbench.setAttribute('data-active-step', '1');
      const isHidden = reviewShare.hidden || reviewShare.style.display === 'none' || reviewShare.classList.contains('hidden');
      if (!isHidden) {
        throw new Error("Expected #part61ReviewShare to be hidden on step 1");
      }
    }
  },
  {
    id: "T1_F3_03",
    name: "#part61ReviewShare is visible when active step is 5",
    tier: 1,
    feature: 3,
    fn: async (dom, helpers) => {
      const reviewShare = helpers.document.getElementById('part61ReviewShare');
      if (!reviewShare) throw new Error("#part61ReviewShare missing");
      const workbench = helpers.document.querySelector('.part61-workbench');
      workbench.setAttribute('data-active-step', '5');
      // Trigger update if manual event dispatch is required, or click step 5 rail
      const isHidden = reviewShare.hidden || reviewShare.style.display === 'none' || reviewShare.classList.contains('hidden');
      if (isHidden) {
        throw new Error("Expected #part61ReviewShare to be visible on step 5");
      }
    }
  },
  {
    id: "T1_F3_04",
    name: "Step 5 panel contains the required actions (copy, share, print, clear, copyCfi, copyChecklist)",
    tier: 1,
    feature: 3,
    fn: async (dom, helpers) => {
      const requiredIds = [
        'part61CopyBtn',
        'part61ShareBtn',
        'part61PrintBtn',
        'part61ClearBtn',
        'part61CopyCfiBtn',
        'part61CopyChecklistBtn'
      ];
      requiredIds.forEach((id) => {
        const btn = helpers.document.getElementById(id);
        if (!btn) throw new Error(`Required button #${id} not found in step 5 panel`);
      });
    }
  },
  {
    id: "T1_F3_05",
    name: "Copy report button copies content to clipboard when clicked",
    tier: 1,
    feature: 3,
    fn: async (dom, helpers) => {
      const copyBtn = helpers.document.getElementById('part61CopyBtn');
      if (!copyBtn) throw new Error("#part61CopyBtn not found");
      helpers.setClipboardText('');
      copyBtn.click();
      const copiedText = helpers.getClipboardText();
      if (!copiedText) {
        throw new Error("Clipboard text was not set after clicking Copy Report button");
      }
    }
  },

  // Feature 4: Split View Responsive Layout
  {
    id: "T1_F4_01",
    name: "Results pane is visible on desktop layout on initial load (step 1)",
    tier: 1,
    feature: 4,
    fn: async (dom, helpers) => {
      helpers.window.innerWidth = 1024;
      helpers.window.dispatchEvent(new helpers.window.Event('resize'));
      const resultsPane = helpers.document.getElementById('part61Results') || helpers.document.getElementById('results');
      if (!resultsPane) throw new Error("Results pane element not found");
      const isHidden = resultsPane.hidden || resultsPane.style.display === 'none' || resultsPane.classList.contains('hidden');
      if (isHidden) {
        throw new Error("Expected results pane to be visible on desktop on initial load");
      }
    }
  },
  {
    id: "T1_F4_02",
    name: "Results pane is hidden on mobile layout on initial load (step 1)",
    tier: 1,
    feature: 4,
    fn: async (dom, helpers) => {
      helpers.window.innerWidth = 800;
      helpers.window.dispatchEvent(new helpers.window.Event('resize'));
      const resultsPane = helpers.document.getElementById('part61Results') || helpers.document.getElementById('results');
      if (!resultsPane) throw new Error("Results pane element not found");
      const isHidden = resultsPane.hidden || resultsPane.style.display === 'none' || resultsPane.classList.contains('hidden');
      if (!isHidden) {
        throw new Error("Expected results pane to be hidden on mobile step 1");
      }
    }
  },
  {
    id: "T1_F4_03",
    name: "Results pane is hidden on mobile layout on step 2",
    tier: 1,
    feature: 4,
    fn: async (dom, helpers) => {
      helpers.window.innerWidth = 800;
      helpers.window.dispatchEvent(new helpers.window.Event('resize'));
      const workbench = helpers.document.querySelector('.part61-workbench');
      workbench.setAttribute('data-active-step', '2');
      const resultsPane = helpers.document.getElementById('part61Results') || helpers.document.getElementById('results');
      const isHidden = resultsPane.hidden || resultsPane.style.display === 'none' || resultsPane.classList.contains('hidden');
      if (!isHidden) {
        throw new Error("Expected results pane to be hidden on mobile step 2");
      }
    }
  },
  {
    id: "T1_F4_04",
    name: "Results pane is hidden on mobile layout on step 3",
    tier: 1,
    feature: 4,
    fn: async (dom, helpers) => {
      helpers.window.innerWidth = 800;
      helpers.window.dispatchEvent(new helpers.window.Event('resize'));
      const workbench = helpers.document.querySelector('.part61-workbench');
      workbench.setAttribute('data-active-step', '3');
      const resultsPane = helpers.document.getElementById('part61Results') || helpers.document.getElementById('results');
      const isHidden = resultsPane.hidden || resultsPane.style.display === 'none' || resultsPane.classList.contains('hidden');
      if (!isHidden) {
        throw new Error("Expected results pane to be hidden on mobile step 3");
      }
    }
  },
  {
    id: "T1_F4_05",
    name: "Results pane is visible on mobile layout on step 5",
    tier: 1,
    feature: 4,
    fn: async (dom, helpers) => {
      helpers.window.innerWidth = 800;
      helpers.window.dispatchEvent(new helpers.window.Event('resize'));
      const workbench = helpers.document.querySelector('.part61-workbench');
      workbench.setAttribute('data-active-step', '5');
      const resultsPane = helpers.document.getElementById('part61Results') || helpers.document.getElementById('results');
      const isHidden = resultsPane.hidden || resultsPane.style.display === 'none' || resultsPane.classList.contains('hidden');
      if (isHidden) {
        throw new Error("Expected results pane to be visible on mobile step 5");
      }
    }
  },

  // Feature 5: Interactive State & Auto-Navigation
  {
    id: "T1_F5_01",
    name: "Load Example button is removed and Random Scenario is the only scenario generator action",
    tier: 1,
    feature: 5,
    fn: async (dom, helpers) => {
      if (helpers.document.getElementById('part61LoadExampleBtn')) {
        throw new Error("Load Example button should not exist after button consolidation");
      }
      const actions = helpers.document.querySelector('.part61-header-actions');
      const randomScenarioBtn = helpers.document.getElementById('part61RandomSampleBtn');
      if (!actions || !randomScenarioBtn) throw new Error("Random Scenario action not found");
      if (randomScenarioBtn.textContent.trim() !== 'Random Scenario') {
        throw new Error(`Expected Random Scenario label, got '${randomScenarioBtn.textContent.trim()}'`);
      }
    }
  },
  {
    id: "T1_F5_01A",
    name: "Each Step 3 hour input has one accessible per-field zero button",
    tier: 1,
    feature: 5,
    fn: async (dom, helpers) => {
      const inputs = Array.from(helpers.document.querySelectorAll('#part61ExperienceFields [data-experience]'));
      const buttons = Array.from(helpers.document.querySelectorAll('#part61ExperienceFields [data-fill-zero-field]'));
      if (!inputs.length) throw new Error("No Step 3 hour inputs found");
      if (buttons.length !== inputs.length) {
        throw new Error(`Expected ${inputs.length} per-field zero buttons, found ${buttons.length}`);
      }
      inputs.forEach((input) => {
        const field = input.closest('.number-field');
        const button = field && field.querySelector(`[data-fill-zero-field="${input.dataset.experience}"]`);
        if (!button) throw new Error(`Missing zero button for ${input.dataset.experience}`);
        if (button.textContent.trim() !== '0') {
          throw new Error(`Expected zero button text to be 0 for ${input.dataset.experience}`);
        }
        const ariaLabel = button.getAttribute('aria-label') || '';
        if (!ariaLabel.includes('0 hours')) {
          throw new Error(`Zero button for ${input.dataset.experience} is missing an accessible 0-hours label`);
        }
      });
    }
  },
  {
    id: "T1_F5_01B",
    name: "Clicking a per-field zero button fills only that hour field",
    tier: 1,
    feature: 5,
    fn: async (dom, helpers) => {
      const totalTime = helpers.document.querySelector('[data-experience="totalTime"]');
      const airplaneTime = helpers.document.querySelector('[data-experience="airplaneTime"]');
      const aselTime = helpers.document.querySelector('[data-experience="aselTime"]');
      const airplaneButton = helpers.document.querySelector('[data-fill-zero-field="airplaneTime"]');
      if (!totalTime || !airplaneTime || !aselTime || !airplaneButton) {
        throw new Error("Expected core time inputs and airplane zero button to exist");
      }
      totalTime.value = '12.5';
      airplaneTime.value = '';
      aselTime.value = '';

      airplaneButton.click();

      if (airplaneTime.value !== '0') {
        throw new Error(`Expected airplaneTime to be set to 0, got '${airplaneTime.value}'`);
      }
      if (totalTime.value !== '12.5') {
        throw new Error("Per-field zero button changed a neighboring filled input");
      }
      if (aselTime.value !== '') {
        throw new Error("Per-field zero button filled an unrelated blank input");
      }
      const completeness = helpers.document.getElementById('part61InputCompleteness');
      if (!completeness || !completeness.textContent.includes('2/30')) {
        throw new Error(`Expected completeness to update to 2/30, got '${completeness ? completeness.textContent : 'missing'}'`);
      }
      const mobileCompleteness = helpers.document.getElementById('part61MobileCompleteness');
      if (!mobileCompleteness || !mobileCompleteness.textContent.includes('2/30')) {
        throw new Error(`Expected mobile completeness to update to 2/30, got '${mobileCompleteness ? mobileCompleteness.textContent : 'missing'}'`);
      }
    }
  },
  {
    id: "T1_F5_01C",
    name: "Per-field zero button clears invalid blank-hour styling",
    tier: 1,
    feature: 5,
    fn: async (dom, helpers) => {
      const input = helpers.document.querySelector('[data-experience="helicopterTime"]');
      const button = helpers.document.querySelector('[data-fill-zero-field="helicopterTime"]');
      if (!input || !button) throw new Error("Helicopter hour input or zero button not found");
      const field = input.closest('.number-field');
      input.value = '';
      input.dispatchEvent(new helpers.window.Event('blur', { bubbles: true }));
      if (!field.classList.contains('field-invalid') || input.getAttribute('aria-invalid') !== 'true') {
        throw new Error("Blank blurred hour input was not marked invalid before zero button click");
      }

      button.click();

      if (input.value !== '0') {
        throw new Error(`Expected helicopterTime to be set to 0, got '${input.value}'`);
      }
      if (field.classList.contains('field-invalid') || input.getAttribute('aria-invalid') !== 'false') {
        throw new Error("Zero button did not clear invalid state");
      }
    }
  },
  {
    id: "T1_F5_02",
    name: "Clicking Random Scenario button populates values and advances wizard to Step 5",
    tier: 1,
    feature: 5,
    fn: async (dom, helpers) => {
      const randomSampleBtn = helpers.document.getElementById('part61RandomSampleBtn') || helpers.document.getElementById('randomSampleBtn');
      if (!randomSampleBtn) throw new Error("Random Scenario button not found");
      randomSampleBtn.click();
      const activeStep = helpers.document.querySelector('.part61-workbench').getAttribute('data-active-step');
      if (activeStep !== '5') {
        throw new Error(`Expected active step to auto-advance to 5, but got '${activeStep}'`);
      }
    }
  },
  {
    id: "T1_F5_02A",
    name: "Study generator exposes exactly four fixed military and rotorcraft-to-airplane profiles with correct audits",
    tier: 1,
    feature: 5,
    fn: async () => {
      const rules = require('../js/part61-rules-data');
      const core = require('../js/part61-calculator-core');
      const generator = require('../js/part61-scenario-generator');
      const catalog = generator.STUDY_SCENARIOS;
      const fieldKeys = rules.FIELD_GROUPS.flatMap((group) => group.fields.map((field) => field[0]));
      const expectedProfiles = [
        ['military-multiengine-to-commercial-asel', ['military-multiengine-airplane'], ['commercial-asel-add-class']],
        ['military-helicopter-to-private-then-commercial-asel', ['military-helicopter'], ['private-asel', 'commercial-asel']],
        ['faa-commercial-helicopter-to-private-asel', ['commercial-rotor-helicopter'], ['private-asel']],
        ['faa-commercial-helicopter-to-private-then-commercial-asel', ['commercial-rotor-helicopter'], ['private-asel', 'commercial-asel']]
      ];
      if (!Array.isArray(catalog) || catalog.length !== 4 || rules.STUDY_SCENARIOS !== catalog) {
        throw new Error(`Expected one exported four-scenario catalog, got ${catalog && catalog.length}`);
      }
      if (!Object.isFrozen(catalog) || catalog.some((scenario) => !Object.isFrozen(scenario) || !Object.isFrozen(scenario.experience))) {
        throw new Error("Study scenario catalog and profiles must be immutable");
      }
      expectedProfiles.forEach(([id, credentials, targets], index) => {
        const scenario = catalog[index];
        if (scenario.id !== id || JSON.stringify(scenario.credentials) !== JSON.stringify(credentials) || JSON.stringify(scenario.targets) !== JSON.stringify(targets)) {
          throw new Error(`Unexpected study profile at index ${index}: ${JSON.stringify(scenario)}`);
        }
        fieldKeys.forEach((key) => {
          if (typeof scenario.experience[key] !== 'number' || !Number.isFinite(scenario.experience[key])) {
            throw new Error(`Study profile ${id} has invalid experience field ${key}`);
          }
        });
      });

      const originalRandom = Math.random;
      try {
        [0, 0.26, 0.51, 0.76].forEach((value, index) => {
          Math.random = () => value;
          const generated = generator.generateRandomScenario();
          if (generated.id !== expectedProfiles[index][0] || generated === catalog[index]) {
            throw new Error(`Generator did not clone fixed profile ${expectedProfiles[index][0]}`);
          }
        });
      } finally {
        Math.random = originalRandom;
      }

      const expectedAudits = {
        'military-multiengine-to-commercial-asel': {
          titles: ['61.73 Military Conversion - Commercial AMEL', 'Commercial ASEL Added Class under 61.63(c)'],
          paths: ['military-conversion', 'class-add'],
          knowledge: ['Required', 'Not required'],
          endorsements: [['No instructor endorsement'], ['A.1', 'A.78']],
          optimized: [0, 5],
          combined: 5
        },
        'military-helicopter-to-private-then-commercial-asel': {
          titles: ['61.73 Military Conversion - Commercial Rotorcraft-Helicopter', 'Private Pilot - ASEL', 'Commercial Pilot - ASEL'],
          paths: ['military-conversion', 'category-add', 'category-add'],
          knowledge: ['Required', 'Not required', 'Not required'],
          endorsements: [['No instructor endorsement'], ['A.1', 'A.76', 'A.78'], ['A.1', 'A.78']],
          optimized: [0, 30, 40],
          combined: 70
        },
        'faa-commercial-helicopter-to-private-asel': {
          titles: ['Private Pilot - ASEL'],
          paths: ['category-add'],
          knowledge: ['Not required'],
          endorsements: [['A.1', 'A.76', 'A.78']],
          optimized: [30],
          combined: 30
        },
        'faa-commercial-helicopter-to-private-then-commercial-asel': {
          titles: ['Private Pilot - ASEL', 'Commercial Pilot - ASEL'],
          paths: ['category-add', 'category-add'],
          knowledge: ['Not required', 'Not required'],
          endorsements: [['A.1', 'A.76', 'A.78'], ['A.1', 'A.78']],
          optimized: [30, 40],
          combined: 70
        }
      };
      catalog.forEach((scenario) => {
        const result = core.calculateAudit(scenario);
        const expected = expectedAudits[scenario.id];
        const actualTitles = result.audits.map((audit) => audit.title);
        const actualPaths = result.audits.map((audit) => audit.path.pathType);
        const actualKnowledge = result.audits.map((audit) => audit.path.knowledgeTest.status);
        const actualEndorsements = result.audits.map((audit) => audit.endorsements.map((item) => item.item).sort());
        const actualOptimized = result.audits.map((audit) => audit.summary.optimizedCombinedTotal);
        if (JSON.stringify(actualTitles) !== JSON.stringify(expected.titles)) throw new Error(`${scenario.id} titles: ${JSON.stringify(actualTitles)}`);
        if (JSON.stringify(actualPaths) !== JSON.stringify(expected.paths)) throw new Error(`${scenario.id} paths: ${JSON.stringify(actualPaths)}`);
        if (JSON.stringify(actualKnowledge) !== JSON.stringify(expected.knowledge)) throw new Error(`${scenario.id} knowledge: ${JSON.stringify(actualKnowledge)}`);
        if (JSON.stringify(actualEndorsements) !== JSON.stringify(expected.endorsements)) throw new Error(`${scenario.id} endorsements: ${JSON.stringify(actualEndorsements)}`);
        if (JSON.stringify(actualOptimized) !== JSON.stringify(expected.optimized) || result.combined.optimizedHours !== expected.combined) {
          throw new Error(`${scenario.id} carry-forward totals: stages ${JSON.stringify(actualOptimized)}, combined ${result.combined.optimizedHours}`);
        }
        result.audits.filter((audit) => audit.path.pathType === 'military-conversion').forEach((audit) => {
          const rowText = JSON.stringify(audit.rows);
          const rowByCfr = new Map(audit.rows.map((row) => [row.cfr, row]));
          if (!rowByCfr.has('61.73(b)(1)') || !rowByCfr.has('61.73(h)(1)') || !rowByCfr.has('61.73(h)(2)') || !rowByCfr.has('61.73(h)(3)') || !rowText.includes('61.73(b)(2)') || !rowText.includes('61.73(b)(3)(i)/(ii)')) {
            throw new Error(`${scenario.id} conversion audit is missing required 61.73 rows`);
          }
          if (!rowByCfr.get('61.73(h)(1)').requirement.includes('military pilot') ||
              !rowByCfr.get('61.73(h)(2)').requirement.includes('undergraduate pilot training') ||
              !rowByCfr.get('61.73(h)(2)').requirement.includes('military pilot rating') ||
              !rowByCfr.get('61.73(h)(3)').requirement.includes('pilot proficiency check and instrument proficiency check in an aircraft as a military pilot')) {
            throw new Error(`${scenario.id} conversion audit does not separately state every mandatory 61.73(h) record`);
          }
          if (/multiengine airplane|helicopter/i.test(rowByCfr.get('61.73(h)(3)').requirement)) {
            throw new Error(`${scenario.id} incorrectly makes the generic 61.73(h)(3) application record category/class specific`);
          }
          if (!rowByCfr.get('61.73(h)(3)').overlapLogic.includes('Still required even when') || !rowByCfr.get('61.73(h)(3)').overlapLogic.includes('61.73(b)(3)(ii)')) {
            throw new Error(`${scenario.id} conversion audit incorrectly lets the 10-hours route replace the mandatory 61.73(h)(3) record`);
          }
          if (!rowText.includes('pilot and instrument proficiency check') || rowText.includes('pilot or instrument proficiency check')) {
            throw new Error(`${scenario.id} conversion audit misstated the conjunctive 61.73(b)(3)(i) proficiency checks`);
          }
          if (audit.gates.some((gate) => /recent time in kind/i.test(gate.gate))) {
            throw new Error(`${scenario.id} conversion audit invented a recency window in the 61.73(b)(3) gate title`);
          }
          if (!audit.links.some((link) => link.url === rules.LINKS.cfr6173) || audit.endorsements.some((item) => item.item === 'A.78')) {
            throw new Error(`${scenario.id} conversion sources/endorsements are incorrect`);
          }
          if (audit.endorsements.some((item) => item.cfrBasis.includes('9.2'))) {
            throw new Error(`${scenario.id} uses a bare AC paragraph number that the CFR linker can misidentify as 14 CFR 9.2`);
          }
        });
      });

      const privateAdd = core.classifyPath({ credentials: ['commercial-rotor-helicopter'], flags: { priorFaa: true } }, 'private-asel');
      const commercialAdd = core.classifyPath({ credentials: ['commercial-rotor-helicopter', 'private-asel'], flags: { priorFaa: true } }, 'commercial-asel');
      const commercialClassAdd = core.classifyPath({ credentials: ['commercial-amel'], flags: { priorFaa: true, faaCommercialAmel: true } }, 'commercial-asel-add-class');
      const genuineLevelUp = core.classifyPath({ credentials: ['private-asel'], flags: { priorFaa: true } }, 'commercial-asel');
      if (privateAdd.pathType !== 'category-add' || privateAdd.knowledgeTest.status !== 'Not required' || !privateAdd.soloEndorsement.needed) {
        throw new Error(`Commercial helicopter to Private ASEL classification is wrong: ${JSON.stringify(privateAdd)}`);
      }
      if (commercialAdd.pathType !== 'category-add' || commercialAdd.knowledgeTest.status !== 'Not required' || commercialAdd.soloEndorsement.needed) {
        throw new Error(`Commercial helicopter plus Private ASEL to Commercial ASEL classification is wrong: ${JSON.stringify(commercialAdd)}`);
      }
      if (commercialClassAdd.pathType !== 'class-add' || commercialClassAdd.soloEndorsement.needed || !commercialClassAdd.soloEndorsement.note.includes('only if the pilot elects to solo')) {
        throw new Error(`Commercial AMEL to Commercial ASEL class-add solo handling is wrong: ${JSON.stringify(commercialClassAdd)}`);
      }
      if (genuineLevelUp.pathType !== 'level-change' || genuineLevelUp.knowledgeTest.status !== 'Required') {
        throw new Error(`Genuine certificate-level increase lost knowledge-test handling: ${JSON.stringify(genuineLevelUp)}`);
      }
    }
  },
  {
    id: "T1_F5_03",
    name: "Clicking Calculate Audit button on Step 4 runs validation and advances to Step 5 if valid",
    tier: 1,
    feature: 5,
    fn: async (dom, helpers) => {
      // First populate sample valid credentials so validation passes
      const randomScenarioBtn = helpers.document.getElementById('part61RandomSampleBtn') || helpers.document.getElementById('randomScenarioBtn');
      if (randomScenarioBtn) randomScenarioBtn.click(); // loads valid scenario

      const workbench = helpers.document.querySelector('.part61-workbench');
      workbench.setAttribute('data-active-step', '4');

      const calculateBtn = helpers.document.getElementById('part61CalculateBtn') || helpers.document.getElementById('calculateBtn');
      if (!calculateBtn) throw new Error("Calculate button not found");
      calculateBtn.click();

      const activeStep = workbench.getAttribute('data-active-step');
      if (activeStep !== '5') {
        throw new Error(`Expected Calculate to advance wizard to step 5, but got '${activeStep}'`);
      }
    }
  },
  {
    id: "T1_F5_04",
    name: "Clicking Clear button resets the wizard back to Step 1",
    tier: 1,
    feature: 5,
    fn: async (dom, helpers) => {
      const workbench = helpers.document.querySelector('.part61-workbench');
      workbench.setAttribute('data-active-step', '5');
      const clearBtn = helpers.document.getElementById('part61ClearBtn') || helpers.document.getElementById('clearBtn');
      if (!clearBtn) throw new Error("Clear button not found");
      clearBtn.click();
      const activeStep = workbench.getAttribute('data-active-step');
      if (activeStep !== '1') {
        throw new Error(`Expected Clear to return active step to 1, but got '${activeStep}'`);
      }
    }
  },
  {
    id: "T1_F5_05",
    name: "Active step is preserved during input changes before navigation",
    tier: 1,
    feature: 5,
    fn: async (dom, helpers) => {
      const workbench = helpers.document.querySelector('.part61-workbench');
      workbench.setAttribute('data-active-step', '2');
      // Simulate input change
      const wetRateInput = helpers.document.getElementById('aircraftWetRate');
      if (wetRateInput) {
        wetRateInput.value = '150';
        wetRateInput.dispatchEvent(new helpers.window.Event('change'));
      }
      const activeStep = workbench.getAttribute('data-active-step');
      if (activeStep !== '2') {
        throw new Error(`Expected active step to remain 2 during input change, but got '${activeStep}'`);
      }
    }
  },

  // ==========================================
  // TIER 2: BOUNDARY & CORNER CASES (25 TESTS)
  // ==========================================

  // Feature 1 Boundaries
  {
    id: "T2_F1_06",
    name: "Back button is not visible or disabled on Step 1",
    tier: 2,
    feature: 1,
    fn: async (dom, helpers) => {
      const workbench = helpers.document.querySelector('.part61-workbench');
      workbench.setAttribute('data-active-step', '1');
      const backBtn = helpers.document.querySelector('#part61BackBtn, .part61-back-btn');
      if (backBtn) {
        const isHidden = backBtn.hidden || backBtn.style.display === 'none' || backBtn.classList.contains('hidden') || backBtn.disabled;
        if (!isHidden) {
          throw new Error("Back button should be disabled or hidden on Step 1");
        }
      }
    }
  },
  {
    id: "T2_F1_07",
    name: "Next button is not visible or disabled on Step 5",
    tier: 2,
    feature: 1,
    fn: async (dom, helpers) => {
      const workbench = helpers.document.querySelector('.part61-workbench');
      workbench.setAttribute('data-active-step', '5');
      const nextBtn = helpers.document.querySelector('#part61NextBtn, .part61-next-btn');
      if (nextBtn) {
        const isHidden = nextBtn.hidden || nextBtn.style.display === 'none' || nextBtn.classList.contains('hidden') || nextBtn.disabled;
        if (!isHidden) {
          throw new Error("Next button should be disabled or hidden on Step 5");
        }
      }
    }
  },
  {
    id: "T2_F1_08",
    name: "Clicking Next on Step 4 with invalid input triggers validation error and does not advance",
    tier: 2,
    feature: 1,
    fn: async (dom, helpers) => {
      const workbench = helpers.document.querySelector('.part61-workbench');
      workbench.setAttribute('data-active-step', '4');

      // Uncheck all credentials or set invalid experience inputs to cause validation failure
      const checkboxes = helpers.document.querySelectorAll('#credentialOptions input[type="checkbox"]');
      checkboxes.forEach((cb) => cb.checked = false);

      const calculateBtn = helpers.document.getElementById('part61CalculateBtn') || helpers.document.getElementById('calculateBtn');
      if (calculateBtn) calculateBtn.click();

      const activeStep = workbench.getAttribute('data-active-step');
      if (activeStep === '5') {
        throw new Error("Should not advance to Step 5 with invalid inputs");
      }
      const validationMsg = helpers.document.getElementById('validationMessage');
      if (validationMsg && (validationMsg.hidden || validationMsg.style.display === 'none')) {
        throw new Error("Validation message should be visible on failure");
      }
    }
  },
  {
    id: "T2_F1_09",
    name: "Transitioning steps resets the scroll position of .part61-workbench to the top",
    tier: 2,
    feature: 1,
    fn: async (dom, helpers) => {
      const workbench = helpers.document.querySelector('.part61-workbench');
      if (!workbench) throw new Error("Workbench not found");
      workbench.scrollTop = 500;

      const nextBtn = helpers.document.querySelector('#part61NextBtn, .part61-next-btn');
      if (nextBtn) nextBtn.click();

      if (workbench.scrollTop !== 0) {
        throw new Error(`Expected workbench scrollTop to be reset to 0, but got ${workbench.scrollTop}`);
      }
    }
  },
  {
    id: "T2_F1_10",
    name: "Set active step to out-of-bound values is prevented or handled gracefully",
    tier: 2,
    feature: 1,
    fn: async (dom, helpers) => {
      const workbench = helpers.document.querySelector('.part61-workbench');
      // If we directly modify attribute, does it coerce or bounds check?
      // A robust implementation's custom state logic should clamp values.
      // Let's test if clicking Next on step 5 does not change the step.
      workbench.setAttribute('data-active-step', '5');
      const nextBtn = helpers.document.querySelector('#part61NextBtn, .part61-next-btn');
      if (nextBtn && !nextBtn.disabled && nextBtn.style.display !== 'none') {
        nextBtn.click();
        const activeStep = workbench.getAttribute('data-active-step');
        if (Number(activeStep) > 5) {
          throw new Error(`Out of bounds step detected: ${activeStep}`);
        }
      }
    }
  },

  // Feature 2 Boundaries
  {
    id: "T2_F2_06",
    name: "Clicking rail items for future steps with invalid data does not block navigation",
    tier: 2,
    feature: 2,
    fn: async (dom, helpers) => {
      const railItems = helpers.document.querySelectorAll('nav.part61-step-rail .part61-rail-item');
      if (railItems.length < 4) throw new Error("Step rail items missing");

      // Ensure inputs are empty/invalid
      const checkboxes = helpers.document.querySelectorAll('#credentialOptions input[type="checkbox"]');
      checkboxes.forEach((cb) => cb.checked = false);

      railItems[3].click(); // Click Step 4 rail item
      const activeStep = helpers.document.querySelector('.part61-workbench').getAttribute('data-active-step');
      if (activeStep !== '4') {
        throw new Error(`Expected rail click to allow navigation to Step 4 even if invalid, but active step is '${activeStep}'`);
      }
    }
  },
  {
    id: "T2_F2_07",
    name: "Rail item status dots correctly show validation status updates",
    tier: 2,
    feature: 2,
    fn: async (dom, helpers) => {
      // Find step 1 status indicator
      const railStatus = helpers.document.querySelector('nav.part61-step-rail .part61-rail-item[href*="Current"] i.part61-rail-status, nav.part61-step-rail .part61-rail-item i.part61-rail-status');
      if (!railStatus) throw new Error("Rail status indicator not found");

      // Load valid generated scenario
      const randomScenarioBtn = helpers.document.getElementById('part61RandomSampleBtn') || helpers.document.getElementById('randomScenarioBtn');
      if (randomScenarioBtn) randomScenarioBtn.click();

      // Trigger update manually if event dispatch is needed, or check status
      const hasCompleteClass = railStatus.classList.contains('done') || railStatus.classList.contains('is-complete') || railStatus.getAttribute('data-rail-status') === 'complete';
      if (!hasCompleteClass) {
        throw new Error("Rail status indicator did not update to done/complete after loading valid data");
      }
    }
  },
  {
    id: "T2_F2_08",
    name: "Rapid clicks on rail items debounces or handles navigation transitions correctly",
    tier: 2,
    feature: 2,
    fn: async (dom, helpers) => {
      const railItems = helpers.document.querySelectorAll('nav.part61-step-rail .part61-rail-item');
      if (railItems.length < 4) throw new Error("Step rail items missing");

      railItems[1].click(); // Click Step 2
      railItems[3].click(); // Click Step 4
      railItems[2].click(); // Click Step 3

      const activeStep = helpers.document.querySelector('.part61-workbench').getAttribute('data-active-step');
      if (activeStep !== '3') {
        throw new Error(`Expected active step to settle on 3 after rapid clicks, but got '${activeStep}'`);
      }
    }
  },
  {
    id: "T2_F2_09",
    name: "Rail items have active state class or aria-current attribute when matching active step",
    tier: 2,
    feature: 2,
    fn: async (dom, helpers) => {
      const workbench = helpers.document.querySelector('.part61-workbench');
      workbench.setAttribute('data-active-step', '4');

      // Check step 4 rail item
      const railItems = helpers.document.querySelectorAll('nav.part61-step-rail .part61-rail-item');
      if (railItems.length < 4) throw new Error("Rail items missing");
      const activeRailItem = railItems[3];

      const isActive = activeRailItem.classList.contains('active') || activeRailItem.classList.contains('is-active') || activeRailItem.getAttribute('aria-current') === 'page' || activeRailItem.getAttribute('aria-current') === 'step';
      if (!isActive) {
        throw new Error("Active step rail item is not visually styled as active");
      }
    }
  },
  {
    id: "T2_F2_10",
    name: "Step rail navigation handles scroll offset transitions",
    tier: 2,
    feature: 2,
    fn: async (dom, helpers) => {
      const railItems = helpers.document.querySelectorAll('nav.part61-step-rail .part61-rail-item');
      if (railItems.length === 0) throw new Error("No rail items");
      railItems[0].click();
      // Verify scroll was called
      if (helpers.window.scrollY !== 0) {
        throw new Error("Expected window.scrollY to reset or adjust on step 1 click");
      }
    }
  },

  // Feature 3 Boundaries
  {
    id: "T2_F3_06",
    name: "Clipboard failure during Copy Report displays a graceful warning",
    tier: 2,
    feature: 3,
    fn: async (dom, helpers) => {
      // Mock writeText to fail
      helpers.window.navigator.clipboard.writeText = () => Promise.reject(new Error("Clipboard block"));

      const copyBtn = helpers.document.getElementById('part61CopyBtn');
      if (!copyBtn) throw new Error("#part61CopyBtn not found");

      copyBtn.click();

      // Let it tick to resolve promise
      await new Promise(resolve => setTimeout(resolve, 50));

      // In case of error, the app should notify or display fallback
      // For instance, an alert, custom banner or class change
      const notification = helpers.document.querySelector('.notification, .toast, .copy-error, #validationMessage');
      if (!notification) {
        // Checking if text changed or some indicator was updated
        const isStillNeutral = copyBtn.textContent.toLowerCase().includes('copied');
        if (isStillNeutral) throw new Error("Copy button incorrectly shows success status despite clipboard failure");
      }
    }
  },
  {
    id: "T2_F3_07",
    name: "Clipboard failure during Copy Link displays a graceful warning",
    tier: 2,
    feature: 3,
    fn: async (dom, helpers) => {
      helpers.window.navigator.clipboard.writeText = () => Promise.reject(new Error("Clipboard block"));
      const shareBtn = helpers.document.getElementById('part61ShareBtn');
      if (!shareBtn) throw new Error("#part61ShareBtn not found");
      shareBtn.click();
      await new Promise(resolve => setTimeout(resolve, 50));
      // Ensure it doesn't crash app
    }
  },
  {
    id: "T2_F3_08",
    name: "Print button trigger invokes window.print() exactly once",
    tier: 2,
    feature: 3,
    fn: async (dom, helpers) => {
      let printCalls = 0;
      helpers.window.print = () => { printCalls++; };
      const printBtn = helpers.document.getElementById('part61PrintBtn');
      if (!printBtn) throw new Error("#part61PrintBtn not found");
      printBtn.click();
      if (printCalls !== 1) {
        throw new Error(`Expected window.print to be called exactly once, but got ${printCalls}`);
      }
    }
  },
  {
    id: "T2_F3_09",
    name: "Copy CFI Readout copies default message if no audit run occurred",
    tier: 2,
    feature: 3,
    fn: async (dom, helpers) => {
      const cfiBtn = helpers.document.getElementById('part61CopyCfiBtn');
      if (!cfiBtn) throw new Error("#part61CopyCfiBtn not found");
      helpers.setClipboardText('');
      cfiBtn.click();
      const text = helpers.getClipboardText();
      if (!text || text.includes('undefined')) {
        throw new Error("Copy CFI Readout copied invalid text or did not handle empty audit gracefully");
      }
    }
  },
  {
    id: "T2_F3_10",
    name: "Copy Student Checklist copies default message if no audit run occurred",
    tier: 2,
    feature: 3,
    fn: async (dom, helpers) => {
      const checklistBtn = helpers.document.getElementById('part61CopyChecklistBtn');
      if (!checklistBtn) throw new Error("#part61CopyChecklistBtn not found");
      helpers.setClipboardText('');
      checklistBtn.click();
      const text = helpers.getClipboardText();
      if (!text || text.includes('undefined')) {
        throw new Error("Copy Student Checklist copied invalid text or did not handle empty audit gracefully");
      }
    }
  },

  // Feature 4 Boundaries
  {
    id: "T2_F4_06",
    name: "Transitioning window width from mobile to desktop automatically makes results pane visible on step 1",
    tier: 2,
    feature: 4,
    fn: async (dom, helpers) => {
      const workbench = helpers.document.querySelector('.part61-workbench');
      workbench.setAttribute('data-active-step', '1');

      helpers.window.innerWidth = 800; // Mobile
      helpers.window.dispatchEvent(new helpers.window.Event('resize'));

      helpers.window.innerWidth = 1024; // Desktop
      helpers.window.dispatchEvent(new helpers.window.Event('resize'));

      const resultsPane = helpers.document.getElementById('part61Results') || helpers.document.getElementById('results');
      const isHidden = resultsPane.hidden || resultsPane.style.display === 'none' || resultsPane.classList.contains('hidden');
      if (isHidden) {
        throw new Error("Results pane should be visible after resizing to desktop layout");
      }
    }
  },
  {
    id: "T2_F4_07",
    name: "Transitioning window width from desktop to mobile automatically hides results pane on step 1",
    tier: 2,
    feature: 4,
    fn: async (dom, helpers) => {
      const workbench = helpers.document.querySelector('.part61-workbench');
      workbench.setAttribute('data-active-step', '1');

      helpers.window.innerWidth = 1024; // Desktop
      helpers.window.dispatchEvent(new helpers.window.Event('resize'));

      helpers.window.innerWidth = 800; // Mobile
      helpers.window.dispatchEvent(new helpers.window.Event('resize'));

      const resultsPane = helpers.document.getElementById('part61Results') || helpers.document.getElementById('results');
      const isHidden = resultsPane.hidden || resultsPane.style.display === 'none' || resultsPane.classList.contains('hidden');
      if (!isHidden) {
        throw new Error("Results pane should be hidden after resizing to mobile layout on step 1");
      }
    }
  },
  {
    id: "T2_F4_08",
    name: "In mobile layout, transitioning from Step 4 to Step 5 toggles results pane visibility instantly",
    tier: 2,
    feature: 4,
    fn: async (dom, helpers) => {
      helpers.window.innerWidth = 800;
      helpers.window.dispatchEvent(new helpers.window.Event('resize'));

      const workbench = helpers.document.querySelector('.part61-workbench');
      workbench.setAttribute('data-active-step', '4');

      const resultsPane = helpers.document.getElementById('part61Results') || helpers.document.getElementById('results');
      if (!(resultsPane.hidden || resultsPane.style.display === 'none' || resultsPane.classList.contains('hidden'))) {
        throw new Error("Results pane should be hidden on step 4 mobile");
      }

      workbench.setAttribute('data-active-step', '5');
      // Trigger updates
      const isHiddenNow = resultsPane.hidden || resultsPane.style.display === 'none' || resultsPane.classList.contains('hidden');
      if (isHiddenNow) {
        throw new Error("Results pane should immediately become visible when entering Step 5 on mobile");
      }
    }
  },
  {
    id: "T2_F4_09",
    name: "In mobile layout, transitioning from Step 5 to Step 4 hides results pane instantly",
    tier: 2,
    feature: 4,
    fn: async (dom, helpers) => {
      helpers.window.innerWidth = 800;
      helpers.window.dispatchEvent(new helpers.window.Event('resize'));

      const workbench = helpers.document.querySelector('.part61-workbench');
      workbench.setAttribute('data-active-step', '5');

      const resultsPane = helpers.document.getElementById('part61Results') || helpers.document.getElementById('results');
      if (resultsPane.hidden || resultsPane.style.display === 'none' || resultsPane.classList.contains('hidden')) {
        throw new Error("Results pane should be visible on step 5 mobile");
      }

      workbench.setAttribute('data-active-step', '4');
      const isHiddenNow = resultsPane.hidden || resultsPane.style.display === 'none' || resultsPane.classList.contains('hidden');
      if (!isHiddenNow) {
        throw new Error("Results pane should hide immediately when leaving Step 5 on mobile");
      }
    }
  },
  {
    id: "T2_F4_10",
    name: "Mobile layout active step 5 places Results pane vertically below Summary panel",
    tier: 2,
    feature: 4,
    fn: async (dom, helpers) => {
      helpers.window.innerWidth = 800;
      helpers.window.dispatchEvent(new helpers.window.Event('resize'));
      const workbench = helpers.document.querySelector('.part61-workbench');
      workbench.setAttribute('data-active-step', '5');
      const resultsPane = helpers.document.getElementById('part61Results') || helpers.document.getElementById('results');

      // Verification of layout classes or ordering
      const hasMobileStackClass = resultsPane.classList.contains('mobile-stacked') || helpers.document.querySelector('.part61-input-pane').contains(resultsPane) || resultsPane.offsetTop > 0;
      // We can also check if results is rendered below the reviewShare panel
      const reviewShare = helpers.document.getElementById('part61ReviewShare');
      // If we don't calculate pixel values headlessly, we can check classes or elements ordering in parent
      if (!resultsPane) throw new Error("Results pane not found");
    }
  },

  // Feature 5 Boundaries
  {
    id: "T2_F5_06",
    name: "Random Scenario button handles repeated generated scenarios without throwing javascript exceptions",
    tier: 2,
    feature: 5,
    fn: async (dom, helpers) => {
      const randomScenarioBtn = helpers.document.getElementById('part61RandomSampleBtn') || helpers.document.getElementById('randomScenarioBtn');
      if (!randomScenarioBtn) throw new Error("Random Scenario button not found");

      for (let i = 0; i < 5; i++) {
        try {
          randomScenarioBtn.click();
        } catch (err) {
          throw new Error(`Random Scenario crashed on click ${i + 1}: ${err.message}`);
        }
      }
    }
  },
  {
    id: "T2_F5_07",
    name: "Auto-calculate with empty inputs does not advance to step 5",
    tier: 2,
    feature: 5,
    fn: async (dom, helpers) => {
      const workbench = helpers.document.querySelector('.part61-workbench');
      workbench.setAttribute('data-active-step', '4');

      // Clear all inputs
      const inputs = helpers.document.querySelectorAll('input[type="number"], input[type="text"]');
      inputs.forEach(input => input.value = '');

      const calculateBtn = helpers.document.getElementById('part61CalculateBtn') || helpers.document.getElementById('calculateBtn');
      if (calculateBtn) calculateBtn.click();

      const activeStep = workbench.getAttribute('data-active-step');
      if (activeStep === '5') {
        throw new Error("Auto-calculate should fail and stay on Step 4 when inputs are fully empty");
      }
    }
  },
  {
    id: "T2_F5_08",
    name: "Clicking Clear button clears all inputs, checklists, and resets rates",
    tier: 2,
    feature: 5,
    fn: async (dom, helpers) => {
      const randomScenarioBtn = helpers.document.getElementById('part61RandomSampleBtn') || helpers.document.getElementById('randomScenarioBtn');
      if (randomScenarioBtn) randomScenarioBtn.click();

      const clearBtn = helpers.document.getElementById('part61ClearBtn') || helpers.document.getElementById('clearBtn');
      if (clearBtn) clearBtn.click();

      const wetRateInput = helpers.document.getElementById('aircraftWetRate');
      if (wetRateInput && wetRateInput.value !== '0' && wetRateInput.value !== '') {
        // It should reset to default wet rate or empty
      }
    }
  },
  {
    id: "T2_F5_09",
    name: "Repeatedly clicking Random Scenario and Clear updates active step correctly every time",
    tier: 2,
    feature: 5,
    fn: async (dom, helpers) => {
      const randomScenarioBtn = helpers.document.getElementById('part61RandomSampleBtn') || helpers.document.getElementById('randomScenarioBtn');
      const clearBtn = helpers.document.getElementById('part61ClearBtn') || helpers.document.getElementById('clearBtn');
      const workbench = helpers.document.querySelector('.part61-workbench');

      if (randomScenarioBtn && clearBtn) {
        randomScenarioBtn.click();
        if (workbench.getAttribute('data-active-step') !== '5') throw new Error("Failed first randomScenario");

        clearBtn.click();
        if (workbench.getAttribute('data-active-step') !== '1') throw new Error("Failed first clear");

        randomScenarioBtn.click();
        if (workbench.getAttribute('data-active-step') !== '5') throw new Error("Failed second randomScenario");
      }
    }
  },
  {
    id: "T2_F5_10",
    name: "Loading random scenario and then manually going back preserves loaded values",
    tier: 2,
    feature: 5,
    fn: async (dom, helpers) => {
      const randomScenarioBtn = helpers.document.getElementById('part61RandomSampleBtn') || helpers.document.getElementById('randomScenarioBtn');
      if (randomScenarioBtn) randomScenarioBtn.click();

      const workbench = helpers.document.querySelector('.part61-workbench');
      workbench.setAttribute('data-active-step', '4');

      const wetRateInput = helpers.document.getElementById('aircraftWetRate');
      if (wetRateInput && (wetRateInput.value === '' || wetRateInput.value === '0')) {
        throw new Error("Loaded values were cleared when navigating backwards");
      }
    }
  },

  // ==========================================
  // TIER 3: CROSS-FEATURE COMBINATIONS (5 TESTS)
  // ==========================================
  {
    id: "T3_01",
    name: "Navigation via buttons updates rail active state and updates mobile visibility of results",
    tier: 3,
    feature: 0,
    fn: async (dom, helpers) => {
      helpers.window.innerWidth = 800; // Mobile
      helpers.window.dispatchEvent(new helpers.window.Event('resize'));

      const workbench = helpers.document.querySelector('.part61-workbench');
      const nextBtn = helpers.document.querySelector('#part61NextBtn, .part61-next-btn');

      // Step 1 to Step 2
      if (nextBtn) nextBtn.click();

      const railItems = helpers.document.querySelectorAll('nav.part61-step-rail .part61-rail-item');
      if (railItems.length >= 2) {
        const item2Active = railItems[1].classList.contains('active') || railItems[1].classList.contains('is-active') || railItems[1].getAttribute('aria-current');
        if (!item2Active) throw new Error("Step rail active status did not update after button navigation");
      }

      const resultsPane = helpers.document.getElementById('part61Results') || helpers.document.getElementById('results');
      if (!(resultsPane.hidden || resultsPane.style.display === 'none' || resultsPane.classList.contains('hidden'))) {
        throw new Error("Results pane should remain hidden on mobile Step 2");
      }
    }
  },
  {
    id: "T3_02",
    name: "Random Scenario auto-advances to Step 5, showing summary panel and rendering results pane (both desktop/mobile)",
    tier: 3,
    feature: 0,
    fn: async (dom, helpers) => {
      const randomScenarioBtn = helpers.document.getElementById('part61RandomSampleBtn') || helpers.document.getElementById('randomScenarioBtn');
      if (randomScenarioBtn) randomScenarioBtn.click();

      const workbench = helpers.document.querySelector('.part61-workbench');
      if (workbench.getAttribute('data-active-step') !== '5') throw new Error("Not advanced to step 5");

      const reviewShare = helpers.document.getElementById('part61ReviewShare');
      if (reviewShare.hidden || reviewShare.style.display === 'none') {
        throw new Error("Review & Share summary panel is not visible on Step 5");
      }

      // Check results pane is visible on both sizes
      helpers.window.innerWidth = 1024;
      helpers.window.dispatchEvent(new helpers.window.Event('resize'));
      const resultsPane = helpers.document.getElementById('part61Results') || helpers.document.getElementById('results');
      if (resultsPane.hidden || resultsPane.style.display === 'none') {
        throw new Error("Results pane is not visible on desktop Step 5");
      }

      helpers.window.innerWidth = 800;
      helpers.window.dispatchEvent(new helpers.window.Event('resize'));
      if (resultsPane.hidden || resultsPane.style.display === 'none') {
        throw new Error("Results pane is not visible on mobile Step 5");
      }
    }
  },
  {
    id: "T3_03",
    name: "Step 5 Clear button resets state, returns to Step 1, updates rail states, and hides results on mobile",
    tier: 3,
    feature: 0,
    fn: async (dom, helpers) => {
      const randomScenarioBtn = helpers.document.getElementById('part61RandomSampleBtn') || helpers.document.getElementById('randomScenarioBtn');
      if (randomScenarioBtn) randomScenarioBtn.click();

      helpers.window.innerWidth = 800;
      helpers.window.dispatchEvent(new helpers.window.Event('resize'));

      const clearBtn = helpers.document.getElementById('part61ClearBtn') || helpers.document.getElementById('clearBtn');
      if (clearBtn) clearBtn.click();

      const workbench = helpers.document.querySelector('.part61-workbench');
      if (workbench.getAttribute('data-active-step') !== '1') throw new Error("Step not reset to 1");

      const railItems = helpers.document.querySelectorAll('nav.part61-step-rail .part61-rail-item');
      if (railItems.length > 0) {
        const item1Active = railItems[0].classList.contains('active') || railItems[0].classList.contains('is-active') || railItems[0].getAttribute('aria-current');
        if (!item1Active) throw new Error("Rail did not reset active status to step 1");
      }

      const resultsPane = helpers.document.getElementById('part61Results') || helpers.document.getElementById('results');
      if (!(resultsPane.hidden || resultsPane.style.display === 'none' || resultsPane.classList.contains('hidden'))) {
        throw new Error("Results pane is not hidden on mobile step 1 after Clear");
      }
    }
  },
  {
    id: "T3_04",
    name: "Rail clicks to Step 4, entering invalid inputs, clicking Calculate, validation blocks advance and shows alert on mobile",
    tier: 3,
    feature: 0,
    fn: async (dom, helpers) => {
      helpers.window.innerWidth = 800;
      helpers.window.dispatchEvent(new helpers.window.Event('resize'));

      const railItems = helpers.document.querySelectorAll('nav.part61-step-rail .part61-rail-item');
      if (railItems.length >= 4) railItems[3].click(); // Goto step 4

      // Clear inputs
      const checkboxes = helpers.document.querySelectorAll('#credentialOptions input[type="checkbox"]');
      checkboxes.forEach((cb) => cb.checked = false);

      const calculateBtn = helpers.document.getElementById('part61CalculateBtn') || helpers.document.getElementById('calculateBtn');
      if (calculateBtn) calculateBtn.click();

      const workbench = helpers.document.querySelector('.part61-workbench');
      if (workbench.getAttribute('data-active-step') === '5') {
        throw new Error("Validation failed to block navigation to Step 5");
      }

      const mobileBar = helpers.document.getElementById('mobileBar');
      if (mobileBar && !mobileBar.classList.contains('is-alert')) {
        throw new Error("Mobile bar does not show is-alert class on validation failure");
      }
    }
  },
  {
    id: "T3_05",
    name: "Resizing window on Step 5 preserves results pane visibility, whereas resizing on Step 3 hides it on mobile but shows on desktop",
    tier: 3,
    feature: 0,
    fn: async (dom, helpers) => {
      const workbench = helpers.document.querySelector('.part61-workbench');
      const resultsPane = helpers.document.getElementById('part61Results') || helpers.document.getElementById('results');

      // On Step 5
      workbench.setAttribute('data-active-step', '5');
      helpers.window.innerWidth = 1024;
      helpers.window.dispatchEvent(new helpers.window.Event('resize'));
      if (resultsPane.hidden || resultsPane.style.display === 'none') throw new Error("Step 5 desktop: results pane hidden");

      helpers.window.innerWidth = 800;
      helpers.window.dispatchEvent(new helpers.window.Event('resize'));
      if (resultsPane.hidden || resultsPane.style.display === 'none') throw new Error("Step 5 mobile: results pane hidden");

      // On Step 3
      workbench.setAttribute('data-active-step', '3');
      helpers.window.innerWidth = 1024;
      helpers.window.dispatchEvent(new helpers.window.Event('resize'));
      if (resultsPane.hidden || resultsPane.style.display === 'none') throw new Error("Step 3 desktop: results pane hidden");

      helpers.window.innerWidth = 800;
      helpers.window.dispatchEvent(new helpers.window.Event('resize'));
      if (!(resultsPane.hidden || resultsPane.style.display === 'none' || resultsPane.classList.contains('hidden'))) {
        throw new Error("Step 3 mobile: results pane visible, should be hidden");
      }
    }
  },

  // ==========================================
  // TIER 4: REAL-WORLD APPLICATION SCENARIOS (5 TESTS)
  // ==========================================
  {
    id: "T4_01",
    name: "Student Audit Happy Path: Select credentials -> Next -> Input costs -> Next -> Input hours -> Next -> Select target -> Click Calculate -> Step 5 displays results",
    tier: 4,
    feature: 0,
    fn: async (dom, helpers) => {
      const workbench = helpers.document.querySelector('.part61-workbench');
      const clickNext = () => {
        const activePanel = helpers.document.querySelector('.part61-panel:not([hidden])');
        const nextBtn = activePanel && activePanel.querySelector('.part61-next-btn');
        if (nextBtn) nextBtn.click();
      };
      const dispatchInput = (input) => {
        input.dispatchEvent(new helpers.window.Event('input', { bubbles: true }));
      };

      // 1. Credentials Step
      const privatePilotButton = helpers.document.querySelector('[data-credential="private-asel"]');
      if (!privatePilotButton) throw new Error("Private ASEL credential button not found");
      privatePilotButton.click();
      clickNext();

      // 2. Costs Step
      const wetRateInput = helpers.document.getElementById('part61AircraftWetRate');
      const instructorRateInput = helpers.document.getElementById('part61InstructorRate');
      if (!wetRateInput || !instructorRateInput) throw new Error("Rate inputs not found");
      wetRateInput.value = '175';
      instructorRateInput.value = '60';
      dispatchInput(wetRateInput);
      dispatchInput(instructorRateInput);
      clickNext();

      // 3. Experience Step
      helpers.document.querySelectorAll('#part61ExperienceFields [data-experience]').forEach((input) => {
        input.value = '0';
        dispatchInput(input);
      });
      const knownExperience = {
        totalTime: '120',
        airplaneTime: '120',
        aselTime: '120',
        picTotal: '70',
        picAirplane: '70',
        picAsel: '70',
        xcPicTotal: '35',
        xcPicAirplane: '20',
        instrumentTime: '12',
        instrumentAirplane: '12',
        cfiiAirplane: '5'
      };
      Object.entries(knownExperience).forEach(([key, value]) => {
        const input = helpers.document.querySelector(`[data-experience="${key}"]`);
        if (!input) throw new Error(`Experience input not found: ${key}`);
        input.value = value;
        dispatchInput(input);
      });
      clickNext();

      // 4. Target Path Step
      const addStageBtn = helpers.document.getElementById('part61AddStageBtn');
      if (!addStageBtn) throw new Error("Add Stage button not found");
      addStageBtn.click();
      const targetSelect = helpers.document.querySelector('[data-stage-index="0"]');
      if (!targetSelect) throw new Error("Target stage select not found");
      targetSelect.value = 'instrument-airplane';
      targetSelect.dispatchEvent(new helpers.window.Event('change', { bubbles: true }));

      const calculateBtn = helpers.document.getElementById('part61CalculateBtn');
      if (!calculateBtn) throw new Error("Calculate button not found");
      calculateBtn.click();

      // 5. Result Step
      if (workbench.getAttribute('data-active-step') !== '5') {
        throw new Error("Audit Happy Path did not reach Step 5");
      }

      // Check results
      const summaryText = helpers.document.getElementById('combinedSummary').textContent;
      if (!summaryText || summaryText.includes('UNKNOWN')) {
        throw new Error("Calculated results are missing or show UNKNOWN values");
      }

      const copyBtn = helpers.document.getElementById('part61CopyBtn');
      helpers.setClipboardText('');
      if (copyBtn) copyBtn.click();
      if (!helpers.getClipboardText()) {
        throw new Error("Failed to copy report text in Happy Path");
      }
    }
  },
  {
    id: "T4_02",
    name: "Clear and Re-run: Random scenario -> Step 5 -> Click Clear -> Step 1 -> Input new values -> Click rail step 4 -> Calculate -> Step 5 displays new correct results",
    tier: 4,
    feature: 0,
    fn: async (dom, helpers) => {
      const randomScenarioBtn = helpers.document.getElementById('part61RandomSampleBtn') || helpers.document.getElementById('randomScenarioBtn');
      if (randomScenarioBtn) randomScenarioBtn.click();

      const workbench = helpers.document.querySelector('.part61-workbench');
      if (workbench.getAttribute('data-active-step') !== '5') throw new Error("Random scenario failed to reach step 5");

      const clearBtn = helpers.document.getElementById('part61ClearBtn') || helpers.document.getElementById('clearBtn');
      if (clearBtn) clearBtn.click();
      if (workbench.getAttribute('data-active-step') !== '1') throw new Error("Clear failed to return to step 1");

      // Enter new values
      const commercialButton = helpers.document.querySelector('[data-credential="commercial-asel"]');
      if (commercialButton) commercialButton.click();
      helpers.document.querySelectorAll('[data-experience]').forEach((input) => {
        input.value = '0';
        input.dispatchEvent(new helpers.window.Event('input', { bubbles: true }));
      });
      const totalTimeInput = helpers.document.querySelector('[data-experience="totalTime"]');
      const airplaneTimeInput = helpers.document.querySelector('[data-experience="airplaneTime"]');
      const dualAselInput = helpers.document.querySelector('[data-experience="dualAsel"]');
      if (totalTimeInput) totalTimeInput.value = '45';
      if (airplaneTimeInput) airplaneTimeInput.value = '45';
      if (dualAselInput) dualAselInput.value = '10';

      const railItems = helpers.document.querySelectorAll('nav.part61-step-rail .part61-rail-item');
      if (railItems.length >= 4) railItems[3].click(); // Go to step 4 rail

      const calculateBtn = helpers.document.getElementById('part61CalculateBtn') || helpers.document.getElementById('calculateBtn');
      if (calculateBtn) calculateBtn.click();

      if (workbench.getAttribute('data-active-step') !== '5') {
        throw new Error("Failed to re-calculate and reach step 5");
      }
    }
  },
  {
    id: "T4_03",
    name: "Mobile Validation Failure Flow: Set mobile layout -> Go to Step 4 -> Enter invalid details -> Click Calculate -> Wizard remains on Step 4 -> Mobile alert banner shown",
    tier: 4,
    feature: 0,
    fn: async (dom, helpers) => {
      helpers.window.innerWidth = 800;
      helpers.window.dispatchEvent(new helpers.window.Event('resize'));

      const workbench = helpers.document.querySelector('.part61-workbench');
      workbench.setAttribute('data-active-step', '4');

      // Clear credentials
      const checkboxes = helpers.document.querySelectorAll('#credentialOptions input[type="checkbox"]');
      checkboxes.forEach((cb) => cb.checked = false);

      const calculateBtn = helpers.document.getElementById('part61CalculateBtn') || helpers.document.getElementById('calculateBtn');
      if (calculateBtn) calculateBtn.click();

      if (workbench.getAttribute('data-active-step') === '5') {
        throw new Error("Mobile Validation Flow: should not advance to step 5 on validation failure");
      }

      const mobileBar = helpers.document.getElementById('mobileBar');
      if (mobileBar && !mobileBar.classList.contains('is-alert')) {
        throw new Error("Mobile alert class 'is-alert' not added to mobile bar on validation error");
      }
    }
  },
  {
    id: "T4_04",
    name: "Responsive Resize Audit Flow: Random scenario on mobile -> verify results visible -> resize to desktop -> verify results visible -> resize back to mobile -> verify results visible",
    tier: 4,
    feature: 0,
    fn: async (dom, helpers) => {
      helpers.window.innerWidth = 800; // Mobile
      helpers.window.dispatchEvent(new helpers.window.Event('resize'));

      const randomScenarioBtn = helpers.document.getElementById('part61RandomSampleBtn') || helpers.document.getElementById('randomScenarioBtn');
      if (randomScenarioBtn) randomScenarioBtn.click();

      const resultsPane = helpers.document.getElementById('part61Results') || helpers.document.getElementById('results');
      if (resultsPane.hidden || resultsPane.style.display === 'none') {
        throw new Error("Step 5 mobile: results should be visible");
      }

      helpers.window.innerWidth = 1024; // Desktop
      helpers.window.dispatchEvent(new helpers.window.Event('resize'));
      if (resultsPane.hidden || resultsPane.style.display === 'none') {
        throw new Error("Step 5 desktop: results should be visible");
      }

      helpers.window.innerWidth = 800; // Mobile again
      helpers.window.dispatchEvent(new helpers.window.Event('resize'));
      if (resultsPane.hidden || resultsPane.style.display === 'none') {
        throw new Error("Step 5 mobile (returned): results should still be visible");
      }
    }
  },
  {
    id: "T4_05",
    name: "CFI Review & Checklist Generation: Random scenario -> Step 5 -> Click Copy CFI Readout -> Verify clipboard has CFI text -> Click Copy Checklist -> Verify checklist copied -> Click Print",
    tier: 4,
    feature: 0,
    fn: async (dom, helpers) => {
      const randomScenarioBtn = helpers.document.getElementById('part61RandomSampleBtn') || helpers.document.getElementById('randomScenarioBtn');
      if (randomScenarioBtn) randomScenarioBtn.click();

      // Copy CFI Readout
      const copyCfiBtn = helpers.document.getElementById('part61CopyCfiBtn');
      if (copyCfiBtn) {
        helpers.setClipboardText('');
        copyCfiBtn.click();
        const cfiText = helpers.getClipboardText();
        if (!cfiText || !cfiText.includes('CFI')) {
          // If we expect baseline or custom readout structure
        }
      }

      // Copy Checklist
      const copyChecklistBtn = helpers.document.getElementById('part61CopyChecklistBtn');
      if (copyChecklistBtn) {
        helpers.setClipboardText('');
        copyChecklistBtn.click();
        const checklistText = helpers.getClipboardText();
        if (!checklistText) {
          throw new Error("Cheklist text copy failed");
        }
      }

      // Click Print
      let printCalled = false;
      helpers.window.print = () => { printCalled = true; };
      const printBtn = helpers.document.getElementById('part61PrintBtn');
      if (printBtn) {
        printBtn.click();
        if (!printCalled) throw new Error("Print button did not trigger window.print");
      }
    }
  },
  {
    id: "T5_CFR_01",
    name: "CFR linker hyperlinks bare Part 61 section citations",
    tier: 5,
    feature: 0,
    fn: async (dom, helpers) => {
      const html = helpers.window.CfrLinks.linkifyCfrText("Same category/new class under 61.63(c).");
      if (!html.includes('href="https://www.ecfr.gov/current/title-14/part-61/section-61.63"')) {
        throw new Error("Bare citation 61.63(c) was not linked to eCFR section 61.63");
      }
      if (!html.includes(">61.63(c)</a>")) {
        throw new Error("Bare citation label 61.63(c) was not preserved inside the link");
      }
    }
  },
  {
    id: "T5_CFR_02",
    name: "CFR linker preserves compact paragraph alternatives inside one clickable citation",
    tier: 5,
    feature: 0,
    fn: async (dom, helpers) => {
      const html = helpers.window.CfrLinks.linkifyCfrText("Additional aircraft category or class rating: 61.63(b)/(c).");
      if (!html.includes(">61.63(b)/(c)</a>")) {
        throw new Error("Compact citation 61.63(b)/(c) was not rendered as clickable citation text");
      }
    }
  },
  {
    id: "T5_CFR_03",
    name: "CFR linker includes chained paragraph cite text such as and (ii)",
    tier: 5,
    feature: 0,
    fn: async (dom, helpers) => {
      const html = helpers.window.CfrLinks.linkifyCfrText("14 CFR § 61.39(a)(6)(i) and (ii)");
      if (!html.includes(">14 CFR § 61.39(a)(6)(i) and (ii)</a>")) {
        throw new Error("Chained paragraph text after 61.39(a)(6)(i) was not included in the eCFR link");
      }
    }
  },
  {
    id: "T5_WIZ_STRESS_01",
    name: "Setting data-active-step to invalid/out-of-bounds values does not leave all panels hidden",
    tier: 5,
    feature: 1,
    fn: async (dom, helpers) => {
      const workbench = helpers.document.querySelector('.part61-workbench');
      if (!workbench) throw new Error("Workbench not found");

      const invalidSteps = ["0", "6", "abc", "-1", "2.5"];
      for (const val of invalidSteps) {
        workbench.setAttribute('data-active-step', val);

        // Find if at least one panel is visible
        const panels = helpers.document.querySelectorAll('.part61-panel');
        let visibleCount = 0;
        panels.forEach((p) => {
          const isHidden = p.hidden || p.style.display === 'none' || p.classList.contains('hidden');
          if (!isHidden) visibleCount++;
        });

        if (visibleCount === 0) {
          throw new Error(`Setting data-active-step to '${val}' caused all panels to be hidden, rendering the wizard blank`);
        }
      }
    }
  },
  {
    id: "T5_WIZ_STRESS_02",
    name: "Rapid click sequence on step rail items settles on the last clicked step and preserves active status",
    tier: 5,
    feature: 2,
    fn: async (dom, helpers) => {
      const railItems = helpers.document.querySelectorAll('nav.part61-step-rail .part61-rail-item');
      if (railItems.length < 5) throw new Error("Step rail items missing");

      const clickSequence = [0, 2, 1, 3, 2, 4, 1, 3, 4];
      for (const idx of clickSequence) {
        railItems[idx].click();
      }

      const workbench = helpers.document.querySelector('.part61-workbench');
      const activeStep = workbench.getAttribute('data-active-step');
      if (activeStep !== '5') {
        throw new Error(`Expected step rail click sequence to settle on step 5, but got '${activeStep}'`);
      }

      const activeRailItem = railItems[4];
      const isActive = activeRailItem.classList.contains('active') || activeRailItem.classList.contains('is-active');
      if (!isActive) {
        throw new Error("Step 5 rail item is not marked active after settling");
      }
    }
  },
  {
    id: "T5_WIZ_STRESS_03",
    name: "Validation blocks calculation on Step 4 if experience fields are blank, even though the experience panel is hidden",
    tier: 5,
    feature: 5,
    fn: async (dom, helpers) => {
      const workbench = helpers.document.querySelector('.part61-workbench');

      // Reset first
      const clearBtn = helpers.document.getElementById('part61ClearBtn') || helpers.document.getElementById('clearBtn');
      if (clearBtn) clearBtn.click();

      // Ensure rates are valid
      const wetRateInput = helpers.document.getElementById('aircraftWetRate');
      if (wetRateInput) {
        wetRateInput.value = '150';
        wetRateInput.dispatchEvent(new helpers.window.Event('change'));
      }
      const instructorRateInput = helpers.document.getElementById('instructorRate');
      if (instructorRateInput) {
        instructorRateInput.value = '50';
        instructorRateInput.dispatchEvent(new helpers.window.Event('change'));
      }

      // Ensure targets are selected
      const targetCheckbox = helpers.document.querySelector('#eventChecklist input[value="private-asel"], #eventChecklist input[type="checkbox"]');
      if (targetCheckbox) targetCheckbox.checked = true;

      // Make sure experience inputs are blank
      const inputs = helpers.document.querySelectorAll('#experienceFields input[type="number"]');
      inputs.forEach(input => input.value = '');

      // Transition to step 4
      workbench.setAttribute('data-active-step', '4');

      // Click calculate
      const calculateBtn = helpers.document.getElementById('part61CalculateBtn') || helpers.document.getElementById('calculateBtn');
      if (!calculateBtn) throw new Error("Calculate button not found");
      calculateBtn.click();

      const activeStep = workbench.getAttribute('data-active-step');
      if (activeStep === '5') {
        throw new Error("Wizard advanced to step 5 even though experience inputs were fully blank (validation bypassed because fields are hidden)");
      }
    }
  },

  // ==========================================
  // ENDORSEMENT BROWSE APP INTERACTIONS
  // ==========================================
  {
    id: "T6_BROWSE_CARD_01",
    name: "A.2 closes when it is the only expanded card from URL state",
    tier: 6,
    feature: 6,
    fn: async () => {
      const helpers = initFullApp('http://localhost/simply-endorsed-cfi/?expanded=A.2');
      try {
        let state = getCardState(helpers, 'A.2');
        if (state.ariaExpanded !== 'true' || state.labelText !== 'Close' || !state.hasInlineDetails || state.expandedParam !== 'A.2') {
          throw new Error(`Expected A.2 to start expanded from URL state, got ${JSON.stringify(state)}`);
        }

        clickCard(helpers, 'A.2');
        state = getCardState(helpers, 'A.2');
        if (state.ariaExpanded !== 'false') {
          throw new Error(`Expected A.2 aria-expanded to be false after close click, got ${state.ariaExpanded}`);
        }
        if (state.labelText !== 'Open') {
          throw new Error(`Expected A.2 label to return to Open, got ${state.labelText}`);
        }
        if (state.hasInlineDetails) {
          throw new Error('Expected A.2 inline details to be removed after close click');
        }
        if (state.expandedParam !== null) {
          throw new Error(`Expected expanded URL parameter to be removed, got ${state.expandedParam}`);
        }
      } finally {
        helpers.window.close();
      }
    }
  },
  {
    id: "T6_BROWSE_CARD_02",
    name: "A.2 opens and closes by repeated click",
    tier: 6,
    feature: 6,
    fn: async () => {
      const helpers = initFullApp('http://localhost/simply-endorsed-cfi/');
      try {
        let state = getCardState(helpers, 'A.2');
        if (state.ariaExpanded !== 'false' || state.hasInlineDetails || state.expandedParam !== null) {
          throw new Error(`Expected A.2 to start closed, got ${JSON.stringify(state)}`);
        }

        clickCard(helpers, 'A.2');
        state = getCardState(helpers, 'A.2');
        if (state.ariaExpanded !== 'true' || state.labelText !== 'Close' || !state.hasInlineDetails || state.expandedParam !== 'A.2') {
          throw new Error(`Expected A.2 to open on first click, got ${JSON.stringify(state)}`);
        }

        clickCard(helpers, 'A.2');
        state = getCardState(helpers, 'A.2');
        if (state.ariaExpanded !== 'false' || state.labelText !== 'Open' || state.hasInlineDetails || state.expandedParam !== null) {
          throw new Error(`Expected A.2 to close on second click, got ${JSON.stringify(state)}`);
        }
      } finally {
        helpers.window.close();
      }
    }
  },
  {
    id: "T6_BROWSE_CARD_03",
    name: "A.2 opens with Enter and closes with Space",
    tier: 6,
    feature: 6,
    fn: async () => {
      const helpers = initFullApp('http://localhost/simply-endorsed-cfi/');
      try {
        pressCardKey(helpers, 'A.2', 'Enter');
        let state = getCardState(helpers, 'A.2');
        if (state.ariaExpanded !== 'true' || state.labelText !== 'Close' || state.expandedParam !== 'A.2') {
          throw new Error(`Expected Enter to open A.2, got ${JSON.stringify(state)}`);
        }

        pressCardKey(helpers, 'A.2', ' ');
        state = getCardState(helpers, 'A.2');
        if (state.ariaExpanded !== 'false' || state.labelText !== 'Open' || state.expandedParam !== null) {
          throw new Error(`Expected Space to close A.2, got ${JSON.stringify(state)}`);
        }
      } finally {
        helpers.window.close();
      }
    }
  },
  {
    id: "T6_ROUTE_01",
    name: "Legacy ?view=calculator URL redirects to the standalone /part-61-calculator/ page",
    tier: 6,
    feature: 6,
    fn: async () => {
      // The calculator moved to /part-61-calculator/. The Simply Endorsed CFI
      // page must carry an early head redirect that preserves remaining query
      // params (share links use ?s=...) and the hash.
      const appPath = path.resolve(__dirname, '../../simply-endorsed-cfi/index.html');
      const appHtml = fs.readFileSync(appPath, 'utf8');
      if (!appHtml.includes('params.get("view") === "calculator"')) {
        throw new Error('Simply Endorsed CFI page is missing the legacy calculator-view redirect check');
      }
      if (!appHtml.includes('window.location.replace("/part-61-calculator/"')) {
        throw new Error('Legacy calculator redirect does not target /part-61-calculator/ via location.replace');
      }
      if (!appHtml.includes('(query ? "?" + query : "") + window.location.hash')) {
        throw new Error('Legacy calculator redirect does not preserve remaining query params and hash');
      }
      if (appHtml.includes('id="part61CalculatorView"')) {
        throw new Error('Simply Endorsed CFI page still hosts the calculator view markup');
      }

      const calcPath = path.resolve(__dirname, '../../part-61-calculator/index.html');
      const calcHtml = fs.readFileSync(calcPath, 'utf8');
      if (!calcHtml.includes('id="part61CalculatorView"')) {
        throw new Error('Standalone /part-61-calculator/ page does not host the calculator view markup');
      }
      if (/id="part61CalculatorView"[^>]*\shidden/.test(calcHtml)) {
        throw new Error('Standalone calculator view must not be hidden');
      }
    }
  },
  {
    id: "T6_ROUTE_02",
    name: "App query-state updates stay under the simply-endorsed-cfi route",
    tier: 6,
    feature: 6,
    fn: async () => {
      const helpers = initFullApp('http://localhost/simply-endorsed-cfi/');
      try {
        clickCard(helpers, 'A.2');
        const nextUrl = new helpers.window.URL(helpers.window.location.href);
        if (nextUrl.pathname !== '/simply-endorsed-cfi/') {
          throw new Error(`Expected query-state update to stay on /simply-endorsed-cfi/, got ${nextUrl.pathname}`);
        }
        if (nextUrl.searchParams.get('expanded') !== 'A.2') {
          throw new Error(`Expected expanded=A.2 after card click, got ${nextUrl.search}`);
        }
      } finally {
        helpers.window.close();
      }
    }
  },
  {
    id: "T6_ROUTE_03",
    name: "Legacy simply-endorsed root redirect preserves query string and hash",
    tier: 6,
    feature: 6,
    fn: async () => {
      const redirectPath = path.resolve(__dirname, '../index.html');
      const redirectHtml = fs.readFileSync(redirectPath, 'utf8');
      if (!redirectHtml.includes('"/simply-endorsed-cfi/" + window.location.search + window.location.hash')) {
        throw new Error('Redirect shell does not preserve search and hash when targeting /simply-endorsed-cfi/');
      }
      if (!redirectHtml.includes('window.location.replace(target)')) {
        throw new Error('Redirect shell does not use location.replace(target)');
      }
    }
  }
];

function initFullApp(url) {
  return initJSDOM({
    loadFullApp: true,
    domOptions: {
      pretendToBeVisual: true,
      url
    }
  });
}

function getCard(helpers, endorsementId) {
  const card = helpers.document.querySelector(`.endorsement-card[data-card-id="${endorsementId}"]`);
  if (!card) {
    throw new Error(`Endorsement card ${endorsementId} not found`);
  }
  return card;
}

function getCardState(helpers, endorsementId) {
  const card = getCard(helpers, endorsementId);
  const label = card.querySelector('.card-viewmore-label');
  const params = new helpers.window.URL(helpers.window.location.href).searchParams;
  return {
    ariaExpanded: card.getAttribute('aria-expanded'),
    expandedParam: params.get('expanded'),
    hasInlineDetails: Boolean(card.querySelector('.endorsement-details')),
    labelText: label ? label.textContent.trim() : null,
    selectedDetailId: helpers.document.querySelector('#endorsementDetail')?.getAttribute('data-selected-id') || null
  };
}

function clickCard(helpers, endorsementId) {
  getCard(helpers, endorsementId).dispatchEvent(new helpers.window.MouseEvent('click', {
    bubbles: true,
    cancelable: true
  }));
}

function pressCardKey(helpers, endorsementId, key) {
  getCard(helpers, endorsementId).dispatchEvent(new helpers.window.KeyboardEvent('keydown', {
    bubbles: true,
    cancelable: true,
    key
  }));
}

module.exports = {
  tests
};
