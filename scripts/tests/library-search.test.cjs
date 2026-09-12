const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../../assets/library-search.js'), 'utf8');

class N {
  constructor(tag, text = '') { this.tagName = tag; this._text = text; this.children = []; this.attrs = {}; this.listeners = {}; this.hidden = false; this.className = ''; }
  get textContent() { return this._text; }
  set textContent(value) { this._text = String(value); if (value === '') this.children = []; }
  appendChild(c) { this.children.push(c); c.parentNode = this; return c; }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  getAttribute(k) { return this.attrs[k] || null; }
  addEventListener(k, fn) { this.listeners[k] = fn; }
  querySelectorAll(sel) { const out = []; const cls = sel[0] === '.' ? sel.slice(1) : null; const walk = n => n.children.forEach(c => { if (cls && c.className.split(/\s+/).includes(cls)) out.push(c); walk(c); }); walk(this); return out; }
  querySelector(sel) { return this.querySelectorAll(sel)[0] || null; }
}
function setup(rows, reject = false) {
  const mount = new N('div'); mount.setAttribute('data-index', '/assets/library-index.json');
  let resolve; const window = { setTimeout: (fn) => { fn(); return 1; }, clearTimeout() {} };
  const fetch = () => reject ? Promise.reject(Error('offline')) : new Promise(r => { resolve = () => r({ ok: true, json: () => Promise.resolve(rows) }); });
  const document = { querySelectorAll: () => [mount], createElement: tag => new N(tag), };
  vm.runInNewContext(source, { document, window, fetch });
  const input = mount.querySelector('.library-search-input'); const selects = mount.querySelectorAll('.library-search-select');
  return { mount, input, topic: selects[0], stage: selects[1], focus: () => input.listeners.focus(), resolve: () => resolve(), type: value => { input.value = value; input.listeners.input(); } };
}
const rows = [
  { title: 'Crosswind landings', description: 'Wind correction basics', path: '/learn/crosswind/', category: 'landings', categoryLabel: 'Landings', stage: 'Student pilot' },
  { title: 'IFR weather briefing', description: 'Decode METARs', path: '/learn/ifr-weather/', category: 'weather', categoryLabel: 'Weather', stage: 'Instrument' },
  { title: 'Commercial maneuvers', description: 'Standards and prep', path: '/learn/commercial/', category: 'checkrides', categoryLabel: 'Checkrides', stage: 'Commercial' },
  { title: 'From student to CFI', description: 'Plan the next ratings', path: '/learn/path/', category: 'planning', categoryLabel: 'Planning', stages: ['Student pilot', 'CFI'] },
  { title: 'Broken external row', description: 'Should never render', path: 'https://example.com/', category: 'other', categoryLabel: 'Other', stage: 'Exploring' },
];

test('lazy loads on focus and filters text and stage safely', async () => {
  const s = setup(rows); assert.equal(s.mount.querySelectorAll('.library-search-result').length, 0); s.focus(); s.resolve(); await new Promise(r => setImmediate(r));
  assert.equal(s.mount.querySelectorAll('.library-search-result').length, 0);
  s.type('weather'); await new Promise(r => setImmediate(r));
  assert.equal(s.mount.querySelectorAll('.library-search-result').length, 1);
  s.stage.value = 'Instrument'; s.stage.listeners.change(); await new Promise(r => setImmediate(r));
  assert.equal(s.mount.querySelectorAll('.library-search-result').length, 1);
  s.input.value = ''; s.stage.value = 'CFI'; s.stage.listeners.change(); await new Promise(r => setImmediate(r));
  assert.equal(s.mount.querySelectorAll('.library-search-result').length, 1);
  assert.match(s.mount.querySelector('.library-search-result-meta').textContent, /Student pilot, CFI/);
});

test('offline index reports browse fallback and does not throw', async () => {
  const s = setup([], true); s.focus(); await new Promise(r => setImmediate(r));
  assert.match(s.mount.querySelector('.library-search-status').textContent, /temporarily unavailable/);
});
