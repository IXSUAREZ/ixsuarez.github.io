const assert = require('node:assert/strict');
const fs = require('fs');
const vm = require('vm');

function endorsements() {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(require.resolve('../js/endorsements-data.js'), 'utf8'), context);
  return context.window.ENDORSEMENTS;
}

const tests = [{
  id: 'S_SOURCE_TIMING',
  pure: true,
  name: 'Solo timing distinguishes endorsement expiration from training recency',
  fn: async () => {
    const data = endorsements();
    const byId = id => data.find(item => item.id === id);
    assert.equal(byId('A.8').expiration, 'none');
    assert.equal(byId('A.12').expiration, '90-calendar-days');
    assert.equal(byId('A.13').expiration, '90-calendar-days');
    assert.equal(byId('A.15').expiration, 'none');
    assert.equal(byId('A.16').expiration, 'none');
    assert.match(byId('A.15').cardExplanation, /within 90 days before the flight/);
    assert.match(byId('A.16').cardExplanation, /within 90 days before the flight/);
  }
}, {
  id: 'S_SOURCE_IPC',
  pure: true,
  name: 'IPC copy preserves the conditional recent-experience meaning',
  fn: async () => {
    const item = endorsements().find(entry => entry.id === 'A.71');
    assert.match(item.cardExplanation, /may satisfy/);
    assert.match(item.cardExplanation, /61\.57\(d\)/);
    assert.match(item.explanation, /subject to the applicable aircraft, evaluator, and operating rules/);
  }
}];

module.exports = { tests };
