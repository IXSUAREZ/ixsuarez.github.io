const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '../..');
const model = require(path.join(root, 'flight-lesson-guide/app.js'));
let JSDOM;
try { ({ JSDOM } = require('../../simply-endorsed/node_modules/jsdom')); }
catch (_) { try { ({ JSDOM } = require('jsdom')); } catch (_) {} }
const step = (id, phase, n, airborne = true) => ({ id, phase, title: id, minutes: n, airborne, required: true, instructor: 'Demonstrate', student: 'Practice', repetitions: 'Two attempts', success: 'Meets criteria', errors: ['Detect and correct'], stop: 'Reassess before continuing', reference: 'FAA handbook' });
const flight = { id: '2', title: 'Training flight', stage: 'I', branch: '', kind: 'dual', flightMinutes: 50, steps: [step('taxi', 'taxi', 4, false), step('depart', 'departure', 6), step('short', 'review', 2), { ...step('long', 'practice', 18), instrumentMinutes: 16 }, step('assess', 'evaluate', 12), step('return', 'return', 5), step('in', 'taxi-in', 3, false)] };
test('unmodified lesson allocation remains exactly authored, with distinct flight and airborne clocks', () => {
  const plan = model.timingPlan(flight);
  assert.deepEqual(plan.rows.map(s => s.plannedMinutes), flight.steps.map(s => s.minutes));
  assert.equal(plan.total, 50); assert.equal(plan.airborne, 43); assert.equal(plan.changed, false);
  assert.equal(plan.rows[0].airStart, null); assert.equal(plan.rows[1].airStart, 0); assert.equal(plan.rows.at(-1).groundPosition, 'After landing');
});
test('taxi/transit edits reconcile an integer budget and retain every required exercise', () => {
  const plan = model.timingPlan(flight, { taxi: 10, depart: 12 }, 60);
  assert.equal(plan.total, 60); assert.equal(plan.rows.length, flight.steps.length);
  assert.equal(plan.rows[0].plannedMinutes, 10); assert.equal(plan.rows[1].plannedMinutes, 12);
  assert.ok(plan.rows.every(s => Number.isInteger(s.plannedMinutes) && s.plannedMinutes > 0));
});
test('unworkable budget becomes an explicit overrun, never deleted tasks or automatic success', () => {
  const plan = model.timingPlan(flight, { taxi: 40 }, 15);
  assert.ok(plan.overbooked > 0); assert.equal(plan.rows.length, flight.steps.length);
  assert.ok(plan.rows.every(s => s.plannedMinutes >= 1)); assert.equal(plan.compressed, true);
  assert.ok(plan.rows.every(s => !Object.hasOwn(s, 'completed')));
});
test('instrument subset never adds time; device exercises do not manufacture an airborne clock', () => {
  assert.equal(model.timingPlan({ ...flight, sourceTime: { flight: 50, instrument: 45 } }).total, 50);
  const device = { ...flight, kind: 'device', steps: flight.steps.map(s => ({ ...s, phase: 'device', airborne: false })) };
  assert.equal(model.timingPlan(device).airborne, 0);
});
test('share links retain path, branch, lesson and view without temporary checklist data', () => {
  const route = { course: 'commercial', lesson: '38-B-G', branch: 'B', mode: 'cockpit' };
  assert.deepEqual(model.parseHash(model.hashFor(route)), route);
  assert.equal(model.parseHash('#course=cfi&lesson=II.A&mode=unknown').mode, 'teach');
  assert.ok(!/covered|elapsed|student/.test(model.hashFor(route)));
});
test('branch filters include shared lessons and exclude the alternative; task search works', () => {
  const c = { lessons: [flight, { ...flight, id: 'A', branch: 'A' }, { ...flight, id: 'B', branch: 'B', steps: [{ ...flight.steps[0], title: 'Engine failure diagnosis' }] }] };
  assert.deepEqual(model.filterLessons(c, { branch: 'B' }).map(l => l.id), ['2', 'B']);
  assert.deepEqual(model.filterLessons(c, { branch: 'B', search: 'engine failure' }).map(l => l.id), ['B']);
  assert.equal(model.filterLessons(c, { stage: 'III', branch: 'B' }).length, 0);
});
test('data failures are surfaced; ground records cannot acquire timed flight steps', () => {
  assert.throws(() => model.validatePayload({ schemaVersion: 2, courses: [] }));
  assert.throws(() => model.validatePayload({ schemaVersion: 1, courses: [{ id: 'private', title: 'Private', lessons: [{ ...flight, kind: 'ground' }] }] }));
  assert.equal(model.validatePayload({ schemaVersion: 1, courses: [{ id: 'private', title: 'Private', lessons: [flight] }] }).courses.length, 1);
});
test('worker cannot cache external sources, unrelated routes or non-GET requests; deletion is prefix bounded', async () => {
  const handlers = {}, deleted = [], requests = [];
  let activeCacheName;
  const sandbox = { URL, Set, Response, console, fetch: async request => { requests.push(request); return new Response('{}', { headers: { 'Content-Type': 'application/json' } }); }, self: { location: { origin: 'https://suarezcfi.com' }, addEventListener: (name, handler) => { handlers[name] = handler; }, clients: { claim: async () => {} } }, caches: { keys: async () => ['pilotsolve-site-1', 'simply-endorsed-1', 'flight-lesson-guide-old', activeCacheName], delete: async key => deleted.push(key), open: async () => ({ match: async () => null, put: async () => {} }) } };
  const context = vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(root, 'flight-lesson-guide/sw.js'), 'utf8'), context);
  activeCacheName = vm.runInContext('CACHE_NAME', context);
  let activation; handlers.activate({ waitUntil: promise => { activation = promise; } }); await activation;
  assert.deepEqual(deleted, ['flight-lesson-guide-old']);
  for (const url of ['https://www.faa.gov/handbook.pdf', 'https://suarezcfi.com/pilotsolve/index.html', 'https://suarezcfi.com/api/student', 'https://suarezcfi.com/flight-lesson-guide/downloads/private-extract.pdf']) handlers.fetch({ request: { method: 'GET', url }, respondWith: () => assert.fail('Unowned request intercepted') });
  handlers.fetch({ request: { method: 'POST', url: 'https://suarezcfi.com/flight-lesson-guide/app.js' }, respondWith: () => assert.fail('POST intercepted') });
  let response; handlers.fetch({ request: { method: 'GET', url: 'https://suarezcfi.com/flight-lesson-guide/app.js' }, respondWith: promise => { response = promise; } });
  assert.equal((await response).status, 200); assert.equal(requests.length, 1);
});
const lessonFields = { summary: 'Training summary', optional: false, objectives: ['Control the aircraft'], prerequisites: ['Brief the aircraft'], preparation: [], sourceRefs: [], sourceTime: { flight: 50, discussion: 12, instrument: 30 }, timingLabel: 'Original pacing', briefingMinutes: 8, briefing: ['Agree on intervention gates.'], debriefMinutes: 4, preflightMinutes: 10, preflightGuide: ['Verify the dispatch and aircraft inspection before engine start.'], completion: ['Meets lesson standard'], debrief: ['What would you change?'], carryForward: ['Repeat as needed'], applicability: 'Use approved aircraft procedures.', sourceNote: 'The heading stage differs from the surrounding course section.', timingNote: 'Use the individual lesson target when its allocation-table total differs.' };
const payload = { schemaVersion: 1, courses: [{ id: 'commercial', title: 'Commercial', alignment: 'Current edition', sourceStatus: 'verified-current', overview: 'A training course.', stages: [{ id: 'I', title: 'Foundation' }], sources: [], entryRequirements: [], lessons: [{ ...flight, ...lessonFields, id: 'ground', kind: 'ground', flightMinutes: 0, title: 'Ground prerequisite', steps: [] }, { ...flight, ...lessonFields, id: 'A', branch: 'A' }, { ...flight, ...lessonFields, id: 'B', branch: 'B', steps: flight.steps.map(s => ({ ...s, instructor: 'Display <script> as literal text.' })) }, { ...flight, ...lessonFields, id: 'device', kind: 'device', steps: flight.steps.map(s => ({ ...s, phase: 'device', airborne: false })) }] }] };
async function domSetup({ fail = false } = {}) {
  const dom = new JSDOM(fs.readFileSync(path.join(root, 'flight-lesson-guide/index.html'), 'utf8'), { url: 'https://suarezcfi.com/flight-lesson-guide/#course=commercial&lesson=B&branch=B&mode=cockpit', runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window;
  w.matchMedia = () => ({ matches: false }); w.HTMLElement.prototype.scrollIntoView = () => {};
  let now = 1000000, tick;
  w.Date.now = () => now;
  w.setInterval = callback => { tick = callback; return 1; };
  dom.advanceClock = amount => { now += amount; if (tick) tick(); };
  w.fetch = async () => ({ ok: !fail, json: async () => payload });
  w.eval(fs.readFileSync(path.join(root, 'flight-lesson-guide/app.js'), 'utf8'));
  await new Promise(resolve => setTimeout(resolve, 20)); return dom;
}
test('actual DOM retains branch links, escapes source text, and distinguishes ground preparation', { skip: !JSDOM && 'Install the existing jsdom test dependency' }, async () => {
  const dom = await domSetup(), d = dom.window.document;
  try {
    assert.equal(d.getElementById('branch-select').value, 'B'); assert.equal(d.querySelector('[data-lesson="A"]'), null);
    assert.equal(d.querySelector('.flg-preparation').open, false); assert.equal(d.querySelector('#active-step-content script'), null);
    assert.match(d.getElementById('preparation-content').textContent, /Source clarification/);
    assert.match(d.getElementById('preparation-content').textContent, /Agree on intervention gates/);
    assert.match(d.getElementById('preparation-content').textContent, /Parked preflight · 10 min/);
    assert.match(d.getElementById('preparation-content').textContent, /aircraft inspection before engine start/);
    assert.match(d.getElementById('timing-source').textContent, /allocation-table total differs/);
    d.querySelector('[data-lesson="ground"]').click();
    assert.equal(d.getElementById('flight-workspace').hidden, true); assert.equal(d.getElementById('mode-controls').hidden, true); assert.equal(d.getElementById('ground-message').hidden, false);
  } finally { dom.window.close(); }
});
test('manual checklist/repeat/reset operates without stored records; a fresh page has fresh state', { skip: !JSDOM && 'Install the existing jsdom test dependency' }, async () => {
  let dom = await domSetup(), d = dom.window.document;
  try {
    d.querySelector('#active-step-check input').click(); assert.match(d.getElementById('coverage-status').textContent, /^1 of 7/);
    d.getElementById('timer-toggle').click(); assert.equal(d.getElementById('timer-toggle').textContent, 'Pause timer');
    d.getElementById('timer-repeat').click(); assert.match(d.getElementById('timer-attempt').textContent, /Attempt 2/); assert.match(d.getElementById('coverage-status').textContent, /^0 of 7/);
    d.getElementById('next-step').click(); assert.match(d.getElementById('step-position').textContent, /Block 2/);
    d.getElementById('reset-lesson').click(); assert.match(d.getElementById('step-position').textContent, /Block 1/); assert.equal(d.getElementById('timer-value').textContent, '00:00');
    assert.equal(dom.window.localStorage.length, 0); assert.equal(dom.window.sessionStorage.length, 0);
  } finally { dom.window.close(); }
  dom = await domSetup();
  try { assert.equal(dom.window.document.getElementById('timer-value').textContent, '00:00'); assert.match(dom.window.document.getElementById('coverage-status').textContent, /^0 of 7/); }
  finally { dom.window.close(); }
});
test('elapsed timer cannot complete or advance a task, and pause excludes subsequent elapsed time', { skip: !JSDOM && 'Install the existing jsdom test dependency' }, async () => {
  const dom = await domSetup(), d = dom.window.document;
  try {
    d.getElementById('timer-toggle').click(); dom.advanceClock(300000);
    assert.equal(d.getElementById('timer-value').textContent, '05:00');
    assert.match(d.getElementById('timer-state').textContent, /Planned time reached/);
    assert.match(d.getElementById('step-position').textContent, /Block 1/);
    assert.match(d.getElementById('coverage-status').textContent, /^0 of 7/);
    d.getElementById('timer-toggle').click(); dom.advanceClock(60000);
    assert.equal(d.getElementById('timer-value').textContent, '05:00');
    d.getElementById('timer-toggle').click(); dom.advanceClock(15000);
    assert.equal(d.getElementById('timer-value').textContent, '05:15');
    d.getElementById('timer-reset').click();
    assert.equal(d.getElementById('timer-value').textContent, '00:00');
  } finally { dom.window.close(); }
});
test('device presentation uses exercise time rather than taxi or takeoff', { skip: !JSDOM && 'Install the existing jsdom test dependency' }, async () => {
  const dom = await domSetup(), d = dom.window.document;
  try {
    d.querySelector('[data-lesson="device"]').click();
    assert.match(d.getElementById('timeline-clock-note').textContent, /Device clock/);
    assert.doesNotMatch(d.getElementById('timeline-clock-note').textContent, /taxi|Takeoff/);
    assert.match(d.getElementById('pacing-description').textContent, /Device session time/);
    assert.doesNotMatch(d.getElementById('lesson-metrics').textContent, /Airborne from takeoff/);
    assert.match(d.getElementById('active-step-time').textContent, /^Device /);
  } finally { dom.window.close(); }
});
test('longer taxi exposes an infeasible instrument subset and reset restores the authored plan', { skip: !JSDOM && 'Install the existing jsdom test dependency' }, async () => {
  const dom = await domSetup(), d = dom.window.document;
  try {
    const taxi = d.querySelector('[data-pacing="taxi"]'); taxi.value = '40';
    taxi.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
    assert.match(d.getElementById('pacing-note').textContent, /over your budget/);
    assert.match(d.getElementById('pacing-note').textContent, /publisher instrument target/);
    assert.match(d.getElementById('pacing-note').textContent, /taxi is not instrument time/);
    assert.equal(d.querySelectorAll('#flight-timeline [data-step]').length, 7);
    d.getElementById('reset-lesson').click();
    assert.equal(d.querySelector('[data-pacing="taxi"]').value, '4');
    assert.equal(d.getElementById('flight-budget').value, '50');
    assert.doesNotMatch(d.getElementById('pacing-note').textContent, /publisher instrument target/);
  } finally { dom.window.close(); }
});
test('a shortened instrument block is flagged even while the whole-flight instrument subset can fit', { skip: !JSDOM && 'Install the existing jsdom test dependency' }, async () => {
  const dom = await domSetup(), d = dom.window.document;
  try {
    const taxi = d.querySelector('[data-pacing="taxi"]'); taxi.value = '10';
    taxi.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
    assert.match(d.getElementById('pacing-note').textContent, /instrument blocks are shorter/);
    assert.doesNotMatch(d.getElementById('pacing-note').textContent, /publisher instrument target is/);
    assert.equal(d.querySelectorAll('#flight-timeline [data-step]').length, 7);
    d.getElementById('restore-pacing').click();
    assert.doesNotMatch(d.getElementById('pacing-note').textContent, /instrument blocks are shorter/);
  } finally { dom.window.close(); }
});
test('unavailable data shows a usable retry action instead of invented lessons', { skip: !JSDOM && 'Install the existing jsdom test dependency' }, async () => {
  const dom = await domSetup({ fail: true }), d = dom.window.document;
  try {
    assert.equal(d.getElementById('guide-workbench').hidden, true); assert.equal(d.getElementById('load-retry').hidden, false); assert.match(d.getElementById('load-state-title').textContent, /unavailable/);
    dom.window.fetch = async () => ({ ok: true, json: async () => payload });
    d.getElementById('load-retry').click(); await new Promise(resolve => setTimeout(resolve, 20));
    assert.equal(d.getElementById('guide-workbench').hidden, false);
  } finally { dom.window.close(); }
});
