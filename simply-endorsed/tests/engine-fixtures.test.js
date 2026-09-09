const assert = require('assert');
const core = require('../js/part61-calculator-core');
const rules = require('../js/part61-rules-data');
const generator = require('../js/part61-scenario-generator');

// These are deliberately small, deterministic profiles.  The assertions cover
// the public calculator contract (classification, totals, cost, and carry-forward)
// without duplicating the implementation's row-building details.
const emptyExperience = {
  totalTime: 0, poweredTime: 0, airplaneTime: 0, aselTime: 0,
  picTotal: 0, picAirplane: 0, picAsel: 0, xcPicTotal: 0,
  xcPicAirplane: 0, xcPicAsel: 0, instrumentTime: 0,
  instrumentAirplane: 0, instrumentAsel: 0, nightTime: 0,
  dualAsel: 0, soloAsel: 0
};

const rates = { aircraftWet: 200, instructor: 60 };

function audit(profile, target) {
  return core.calculateAudit({
    credentials: profile.credentials || [],
    flags: profile.flags || {},
    rates: profile.rates || rates,
    experience: { ...emptyExperience, ...(profile.experience || {}) },
    proficiencyEstimates: profile.proficiencyEstimates || {},
    events: profile.events || {},
    targets: [target]
  });
}

function last(result) {
  return result.audits[result.audits.length - 1];
}

const tests = [
  {
    id: 'E_ENGINE_INITIAL_PRIVATE',
    pure: true,
    name: 'initial private ASEL baseline preserves exact hours and cost',
    fn: () => {
      const result = audit({}, 'private-asel');
      assert.strictEqual(last(result).path.pathType, 'initial');
      assert.deepStrictEqual(last(result).summary, {
        target: 'Private Pilot - ASEL', rawRequirementSum: 87,
        optimizedCombinedTotal: 40, dualCost: 5200, soloCost: 4000,
        estimatedTotalCost: 9200,
        notes: 'Raw is arithmetic visibility only; optimized drives cost.'
      });
      assert.strictEqual(result.combined.optimizedHours, 40);
      assert.strictEqual(result.combined.estimatedCost, 9200);
    }
  },
  {
    id: 'E_ENGINE_INSTRUMENT',
    pure: true,
    name: 'instrument rating baseline resolves CFII time and costs',
    fn: () => {
      const result = audit({
        credentials: ['private-asel'],
        experience: { airplaneTime: 60, aselTime: 60, picTotal: 50,
          picAirplane: 50, picAsel: 50, instrumentTime: 5,
          instrumentAirplane: 5, cfiiAirplane: 5 }
      }, 'instrument-airplane');
      assert.strictEqual(last(result).path.pathType, 'instrument-rating');
      assert.deepStrictEqual(last(result).summary, {
        target: 'Instrument Rating - Airplane', rawRequirementSum: 108,
        optimizedCombinedTotal: 50, dualCost: 2600, soloCost: 8000,
        estimatedTotalCost: 10600,
        notes: 'Raw is arithmetic visibility only; optimized drives cost.'
      });
      assert.deepStrictEqual(result.combined.rates, { aircraftWet: 200, instructor: 60, dual: 260, solo: 200 });
    }
  },
  {
    id: 'E_ENGINE_COMMERCIAL',
    pure: true,
    name: 'commercial level change baseline preserves training and PDPIC buckets',
    fn: () => {
      const result = audit({
        credentials: ['private-asel'],
        experience: { totalTime: 250, poweredTime: 250, airplaneTime: 250,
          aselTime: 250, picTotal: 150, picAirplane: 150, picAsel: 150,
          xcPicTotal: 50, xcPicAirplane: 50, xcPicAsel: 50,
          instrumentTime: 10, instrumentAirplane: 10, nightTime: 5,
          commercialTrainingAsel: 10, soloPdpicAsel: 5 }
      }, 'commercial-asel');
      assert.strictEqual(last(result).path.pathType, 'level-change');
      assert.strictEqual(last(result).summary.optimizedCombinedTotal, 15);
      assert.strictEqual(last(result).summary.estimatedTotalCost, 3600);
      assert.deepStrictEqual(result.combined.rates, { aircraftWet: 200, instructor: 60, dual: 260, solo: 200 });
    }
  },
  {
    id: 'E_ENGINE_ADDED_CLASS_PROFICIENCY',
    pure: true,
    name: 'added class uses explicit proficiency estimate and marks estimate as proficiency based',
    fn: () => {
      const result = audit({
        credentials: ['commercial-amel'],
        proficiencyEstimates: { 'commercial-asel-add-class': 7 }
      }, 'commercial-asel-add-class');
      assert.strictEqual(last(result).path.pathType, 'class-add');
      assert.strictEqual(last(result).proficiencyBased, true);
      assert.strictEqual(last(result).summary.optimizedCombinedTotal, 7);
      assert.strictEqual(last(result).summary.estimatedTotalCost, 1820);
    }
  },
  {
    id: 'E_ENGINE_MILITARY_MULTISTAGE',
    pure: true,
    name: 'military study scenario adds conversion stage before civilian multistage target',
    fn: () => {
      const scenario = generator.STUDY_SCENARIOS.find(item => item.id === 'military-multiengine-to-commercial-asel');
      assert.ok(scenario, 'military study scenario is missing');
      const result = core.calculateAudit(scenario);
      assert.deepStrictEqual(result.audits.map(item => item.targetId), [
        'military-commercial-amel-conversion', 'commercial-asel-add-class'
      ]);
      assert.strictEqual(result.audits[0].path.pathType, 'military-conversion');
      assert.strictEqual(result.combined.optimizedHours, 5);
      assert.strictEqual(result.combined.estimatedCost, 1350);
      assert.deepStrictEqual(result.combined.rates, { aircraftWet: 205, instructor: 65, dual: 270, solo: 205 });
    }
  },
  {
    id: 'E_ENGINE_FIXTURE_ALIAS_AND_IMMUTABILITY',
    pure: true,
    name: 'study scenarios expose compatibility alias and random generation clones values',
    fn: () => {
      assert.strictEqual(generator.STUDY_SCENARIOS, rules.SAMPLE_SCENARIOS);
      const random = generator.generateRandomScenario();
      const source = generator.STUDY_SCENARIOS.find(item => item.id === random.id);
      assert.ok(source, 'generated scenario does not map to a study fixture');
      const originalName = source.name;
      random.name = 'mutated copy';
      random.experience.totalTime = 9999;
      assert.strictEqual(source.name, originalName);
      assert.notStrictEqual(source.experience.totalTime, 9999);
    }
  }
];

module.exports = { tests };
