const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../../assets/premium-home.js'), 'utf8');

function setup({ now = '2026-09-08T16:00:00Z', saved = {}, reduced = false, webgl = true, brokenStorage = false } = {}) {
  const events = new Map();
  const makeElement = (extra = {}) => ({ ...extra, addEventListener(type, fn) { events.set([this.id, type].join(':'), fn); } });
  const uniforms = {};
  const draws = [];
  const pending = new Map();
  let frameId = 0;
  let time = new Date(now).getTime();
  const gl = new Proxy({}, { get(_, key) {
    if (['getShaderParameter', 'getProgramParameter'].includes(key)) return () => true;
    if (key === 'getAttribLocation') return () => 0;
    if (key === 'getUniformLocation') return (_, name) => name;
    if (String(key).startsWith('create')) return () => ({});
    if (String(key).startsWith('uniform')) return (name, ...value) => { uniforms[name] = value; };
    if (key === 'drawArrays') return () => draws.push(JSON.parse(JSON.stringify(uniforms)));
    return () => {};
  }});
  const canvas = makeElement({ id: 'horizon-clouds', clientWidth: 1422, clientHeight: 824, width: 300, height: 150, getContext: () => webgl ? gl : null });
  const control = makeElement({ id: 'sky-motion', checked: false });
  const stateLabel = {};
  const modes = ['day', 'auto', 'night'].map(value => makeElement({ id: value, value, checked: false }));
  const classes = new Set();
  const properties = {};
  const hero = { dataset: {}, style: { setProperty: (k, v) => { properties[k] = v; } }, classList: { toggle: (c, v) => v ? classes.add(c) : classes.delete(c) }, querySelector: () => stateLabel, querySelectorAll: () => modes };
  const media = makeElement({ id: 'media', matches: reduced });
  const document = makeElement({ id: 'document', hidden: false, querySelector: () => hero, getElementById: id => id === control.id ? control : canvas });
  const storage = new Map(Object.entries(saved));
  const window = makeElement({ id: 'window', devicePixelRatio: 2, matchMedia: () => media,
    localStorage: { getItem(k) { if (brokenStorage) throw Error(); return storage.get(k) ?? null; }, setItem(k, v) { if (brokenStorage) throw Error(); storage.set(k, v); } },
    requestAnimationFrame(fn) { const id = ++frameId; pending.set(id, fn); return id; }, cancelAnimationFrame: id => pending.delete(id),
    setInterval(fn) { events.set('minute', fn); },
    IntersectionObserver: class {}, ResizeObserver: class {},
  });
  class IntersectionObserver { constructor(fn) { events.set('intersection', fn); } observe() {} }
  class ResizeObserver { constructor(fn) { events.set('resize', fn); } observe() {} }
  class Clock extends Date { constructor(...args) { super(...(args.length ? args : [time])); } }
  vm.runInNewContext(source, { window, document, IntersectionObserver, ResizeObserver, Date: Clock, Float32Array });
  return { hero, canvas, control, stateLabel, modes, properties, uniforms, draws, pending, media, document, storage,
    emit(id, type, event = {}) { events.get(`${id}:${type}`)(event); },
    select(value) { modes.forEach(m => m.checked = m.value === value); events.get(`${value}:change`)(); },
    toggle(value) { control.checked = value; events.get('sky-motion:change')(); },
    tick(timestamp) { const callbacks = [...pending.values()]; pending.clear(); callbacks.forEach(fn => fn(timestamp)); },
    at(date) { time = new Date(date).getTime(); events.get('minute')(); },
    viewport(isIntersecting) { events.get('intersection')([{ isIntersecting }]); },
  };
}


test('automatic daylight renders immediately and ignores old controls or saved Off preferences', () => {
  const s = setup({ saved: { 'suarezcfi.sky-mode': 'night', 'suarezcfi.sky-motion': 'off' } });
  assert.equal(s.hero.dataset.skyMode, 'auto');
  assert.equal(s.hero.dataset.skyPhase, 'day');
  assert.equal(s.hero.dataset.motion, 'on');
  assert.equal(s.uniforms.starIntensity[0], 0);
  assert.equal(s.draws.length, 1);
  assert.deepEqual(s.uniforms.skyColorTop, [.3, .5, .9]);
  assert.equal(s.canvas.width, 2133);
  assert.equal(s.uniforms.cloudDensity[0], 1);
  assert.equal(s.uniforms.cloudSpeed[0], 1.3);
  assert.equal(s.uniforms.sunIntensity[0], 1);
});
test('automatic sunrise and sunset crossfades reach the complete night palette and stars', () => {
  const s = setup();
  s.at('2026-09-09T04:00:00Z');
  assert.equal(s.uniforms.starIntensity[0], 1);
  assert.equal(s.hero.dataset.skyPhase, 'night');
  assert.ok(Math.abs(s.uniforms.skyColorTop[0] - .02) < 1e-12);
  s.at('2026-09-08T11:15:00Z');
  const morning = s.uniforms.starIntensity[0];
  assert.ok(morning > 0 && morning < 1);
  s.at('2026-09-08T11:25:00Z');
  assert.ok(s.uniforms.starIntensity[0] < morning);
  s.at('2026-09-08T23:45:00Z');
  const evening = s.uniforms.starIntensity[0];
  assert.ok(evening > 0 && evening < 1);
  s.at('2026-09-08T23:55:00Z');
  assert.ok(s.uniforms.starIntensity[0] > evening);
});
test('summer sky stays light across UTC midnight; winter evening is night', () => {
  const s = setup({ now: '2026-06-21T23:59:59Z' });
  assert.equal(s.uniforms.starIntensity[0], 0);
  s.at('2026-06-22T00:00:01Z');
  assert.equal(s.uniforms.starIntensity[0], 0);
  s.at('2026-06-22T01:00:00Z');
  assert.ok(s.uniforms.starIntensity[0] > 0 && s.uniforms.starIntensity[0] < 1);
  s.at('2026-12-22T00:00:01Z');
  assert.equal(s.uniforms.starIntensity[0], 1);
});
test('animation runs at 30fps, pauses offscreen, and resumes without jumping', () => {
  const s = setup();
  s.tick(0); s.tick(10);
  assert.equal(s.draws.length, 2);
  s.tick(34);
  assert.equal(s.draws.length, 3);
  const elapsed = s.uniforms.time[0];
  s.viewport(false); assert.equal(s.pending.size, 0);
  s.viewport(true); s.tick(10000);
  assert.equal(s.uniforms.time[0], elapsed);
  s.tick(10034);
  assert.ok(Math.abs(s.uniforms.time[0] - elapsed - .034) < 1e-12);
  s.document.hidden = true; s.emit('document', 'visibilitychange'); assert.equal(s.pending.size, 0);
  s.document.hidden = false; s.emit('document', 'visibilitychange'); assert.equal(s.pending.size, 1);
});
test('reduced motion retains the complete sky and still follows time of day', () => {
  const s = setup({ reduced: true });
  assert.equal(s.pending.size, 0);
  assert.equal(s.draws.length, 1);
  s.at('2026-09-09T04:00:00Z');
  assert.equal(s.draws.length, 2);
  assert.equal(s.uniforms.starIntensity[0], 1);
  s.media.matches = false; s.emit('media', 'change'); assert.equal(s.pending.size, 1);
  s.media.matches = true; s.emit('media', 'change'); assert.equal(s.pending.size, 0);
});
test('graphics failure keeps the matching still sky, and context restoration resumes animation', () => {
  const fallback = setup({ webgl: false, brokenStorage: true, now: '2026-09-09T04:00:00Z' });
  assert.equal(fallback.properties['--sky-night'], '1');
  assert.equal(fallback.hero.dataset.motion, 'off');
  const s = setup();
  s.emit('horizon-clouds', 'webglcontextlost', { preventDefault() {} });
  assert.equal(s.pending.size, 0);
  s.at('2026-09-09T04:00:00Z');
  assert.equal(s.properties['--sky-night'], '1');
  s.emit('horizon-clouds', 'webglcontextrestored');
  assert.equal(s.uniforms.starIntensity[0], 1);
  assert.equal(s.pending.size, 1);
});
