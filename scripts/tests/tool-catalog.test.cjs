const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { JSDOM } = require('../../simply-endorsed/node_modules/jsdom');
const root = path.resolve(__dirname, '../..');
const script = fs.readFileSync(path.join(root, 'assets/tool-catalog.js'), 'utf8');
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'config/tool-catalog.json'), 'utf8'));
// Exercise the authored generator without rewriting shared pages during parallel work.
const rendered = JSON.parse(execFileSync('python3', ['-B', '-c', `
import importlib.util,json
spec=importlib.util.spec_from_file_location('catalog', 'scripts/render-tool-catalog.py')
module=importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
print(json.dumps({'tools':module.tools_main(),'home':module.home_cards()}))
`], { cwd: root, encoding: 'utf8' }));

function setup({enhance = true, both = false, blockedStorage = false} = {}) {
  const dom = new JSDOM('<!doctype html><html><body>' + rendered.tools + (both ? rendered.home : '') + '</body></html>', {
    url: 'https://suarezcfi.com/tools/', runScripts: 'outside-only', pretendToBeVisual: true,
  });
  const w = dom.window, d = w.document;
  if (blockedStorage) {
    for (const property of ['localStorage', 'sessionStorage']) {
      Object.defineProperty(w, property, { get() { throw new Error('Storage is blocked'); } });
    }
  }
  if (enhance) w.eval(script);
  return {w, d, close() { w.close(); }};
}

function visible(root) {
  return [...root.querySelectorAll('[data-catalog-app]')].filter(item => !item.hidden);
}

test('both static catalogs expose every real app link, name and artwork in catalog order', () => {
  for (const [context, html] of [['directory', rendered.tools], ['home-tools', rendered.home]]) {
    const dom = new JSDOM(html), d = dom.window.document;
    try {
      const entries = [...d.querySelectorAll('[data-catalog-app]')];
      assert.equal(entries.length, catalog.tools.length);
      assert.equal(d.querySelector('.catalog-filters').hidden, true);
      catalog.tools.forEach((tool, index) => {
        const entry = entries[index], link = entry.querySelector('a');
        assert.equal(entry.hidden, false);
        assert.equal(entry.dataset.catalogApp, tool.id);
        assert.equal(link.getAttribute('href'), tool.path);
        assert.equal(link.dataset.ctaId, context + '-' + tool.id);
        assert.equal(link.querySelector('.tool-app-name').textContent, tool.name);
        assert.equal(link.querySelector('img').getAttribute('src'), '/assets/identities/' + tool.id + '/logo.png');
        assert.ok(fs.existsSync(path.join(root, tool.path, 'index.html')));
        assert.ok(fs.existsSync(path.join(root, 'assets/identities', tool.id, 'logo.png')));
      });
      assert.equal(d.querySelector('.orbit-rail,.app-stage,.orbit-controls,details'), null);
    } finally { dom.window.close(); }
  }
});

test('names are native links and device guidance is accessible before enhancement', () => {
  const p = setup({enhance: false});
  try {
    for (const tool of catalog.tools) {
      const link = p.d.querySelector('[data-catalog-app="' + tool.id + '"] a');
      assert.equal(link.tagName, 'A');
      assert.equal(link.hasAttribute('tabindex'), false);
      assert.equal(link.hasAttribute('aria-pressed'), false);
      const description = p.d.getElementById(link.getAttribute('aria-describedby'));
      assert.ok(description.textContent.includes(tool.description));
      assert.ok(description.textContent.includes(tool.compatibility));
    }
    assert.equal(p.d.querySelector('[data-catalog-app="engine-explorer"] .tool-app-device').textContent, 'Desktop recommended');
  } finally { p.close(); }
});

test('enhancement defaults to all apps and each purpose filter exposes only matching direct links', () => {
  const p = setup();
  try {
    const root = p.d.querySelector('[data-tool-catalog]');
    assert.equal(root.querySelector('.catalog-filters').hidden, false);
    assert.equal(visible(root).length, catalog.tools.length);
    for (const group of catalog.groups) {
      root.querySelector('[data-catalog-filter="' + group.id + '"]').click();
      const expected = catalog.tools.filter(tool => tool.group === group.id);
      assert.deepEqual(visible(root).map(item => item.dataset.catalogApp), expected.map(tool => tool.id));
      assert.equal(root.querySelectorAll('[aria-pressed="true"]').length, 1);
      assert.equal(root.querySelector('[aria-pressed="true"]').dataset.catalogFilter, group.id);
      assert.equal(root.querySelector('[data-catalog-status]').textContent, expected.length + (expected.length === 1 ? ' app' : ' apps') + ' · ' + group.name);
      assert.equal(root.querySelectorAll('.tool-app').length, catalog.tools.length);
    }
    root.querySelector('[data-catalog-filter="all"]').click();
    assert.equal(visible(root).length, catalog.tools.length);
  } finally { p.close(); }
});

test('homepage and Tools instances filter independently with unique accessible descriptions', () => {
  const p = setup({both: true});
  try {
    const [tools, home] = [...p.d.querySelectorAll('[data-tool-catalog]')];
    tools.querySelector('[data-catalog-filter="flight"]').click();
    assert.equal(visible(tools).length, 2);
    assert.equal(visible(home).length, catalog.tools.length);
    home.querySelector('[data-catalog-filter="systems"]').click();
    assert.equal(visible(home).length, catalog.tools.filter(tool => tool.group === 'systems').length);
    assert.equal(visible(tools).length, 2);
    const ids = [...p.d.querySelectorAll('[id]')].map(element => element.id);
    assert.equal(new Set(ids).size, ids.length);
  } finally { p.close(); }
});

test('old carousel preferences and blocked storage cannot hide apps on arrival', () => {
  const p = setup({blockedStorage: true});
  try {
    assert.equal(visible(p.d).length, catalog.tools.length);
    assert.equal(p.d.querySelector('[data-catalog-filter="all"]').getAttribute('aria-pressed'), 'true');
  } finally { p.close(); }
  const restored = setup({enhance: false});
  try {
    restored.w.sessionStorage.setItem('suarez:tool-orbit:v1', JSON.stringify({group: 'training', selected: 'foi-cards'}));
    restored.w.eval(script);
    assert.equal(visible(restored.d).length, catalog.tools.length);
  } finally { restored.close(); }
});

test('browser Back restoration returns to the complete grid without stale filter announcements', () => {
  const p = setup();
  try {
    p.d.querySelector('[data-catalog-filter="systems"]').click();
    assert.equal(visible(p.d).length, catalog.tools.filter(tool => tool.group === 'systems').length);
    p.w.dispatchEvent(new p.w.PageTransitionEvent('pageshow', {persisted: true}));
    assert.equal(visible(p.d).length, catalog.tools.length);
    assert.equal(p.d.querySelector('[data-catalog-status]').textContent, '');
    assert.equal(p.d.querySelector('[data-catalog-filter="all"]').getAttribute('aria-pressed'), 'true');
  } finally { p.close(); }
});

test('grid leaves arrow keys and swipe travel available for native scrolling', () => {
  const p = setup();
  try {
    const grid = p.d.querySelector('.tool-app-grid');
    const key = new p.w.KeyboardEvent('keydown', {key: 'ArrowRight', bubbles: true, cancelable: true});
    grid.dispatchEvent(key);
    assert.equal(key.defaultPrevented, false);
    for (const type of ['pointerdown', 'pointermove', 'pointerup']) {
      const event = new p.w.MouseEvent(type, {clientX: 50, clientY: 100, bubbles: true, cancelable: true});
      grid.dispatchEvent(event);
      assert.equal(event.defaultPrevented, false);
    }
    assert.equal(visible(p.d).length, catalog.tools.length);
    const names = [...p.d.querySelectorAll('.tool-app-name')].map(element => element.textContent);
    assert.deepEqual(names, catalog.tools.map(tool => tool.name));
  } finally { p.close(); }
});
