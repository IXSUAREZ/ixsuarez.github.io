const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('../../simply-endorsed/node_modules/jsdom');

const site = path.resolve(__dirname, '../..');
const read = name => fs.readFileSync(path.join(site, 'assets', name), 'utf8');
const scripts = {
  appearance: read('appearance.js'),
  navigation: read('site-nav.js'),
  adapter: read('avionics-tools.js'),
};
const flush = () => new Promise(resolve => setImmediate(resolve));

async function page(body, url = 'https://suarezcfi.com/certificate-generator/') {
  const dom = new JSDOM(`<!doctype html><html><body>${body}</body></html>`, {
    url, runScripts: 'outside-only', pretendToBeVisual: true,
  });
  const errors = [];
  dom.window.addEventListener('error', event => errors.push(event.error || event.message));
  dom.window.matchMedia = query => ({ matches: false, media: query, addEventListener() {}, removeEventListener() {} });
  dom.window.ResizeObserver = class { observe() {} disconnect() {} };
  await flush(); // Let jsdom finish DOMContentLoaded before evaluating deferred site scripts.
  return { dom, window: dom.window, document: dom.window.document, errors,
    run(name) { dom.window.eval(scripts[name]); },
    async settle() { await flush(); await flush(); },
    close() { dom.window.close(); },
  };
}
function nav(extra = '') {
  return `<header class="nav-wrap"><nav class="nav nav--tool" aria-label="Primary">
    <div class="av-destinations"><a href="/">Home</a></div>
    <div class="nav-links" id="primary-nav-links"><a href="/learn/">Learn</a>
      <div class="nav-dropdown"><button class="nav-drop-toggle" aria-expanded="false">Tools</button>
        <div class="nav-drop-panel" role="menu"><a role="menuitem" href="/tools/">All tools</a></div></div></div>
    <div class="nav-tools">${extra}<button class="nav-menu-toggle" type="button" aria-expanded="false">Menu</button></div>
  </nav></header>`;
}

test('certificate dock reflects native disabled steps and delegates each allowed click once', async () => {
  const p = await page(`${nav()}<ol class="cg-stepper">${['Certificate','Names','Photo','Review'].map(label => `<li><button class="cg-step-btn" disabled>${label}</button></li>`).join('')}</ol>`);
  try {
    const native = [...p.document.querySelectorAll('.cg-step-btn')];
    const clicks = [0, 0, 0, 0];
    native.forEach((button, i) => button.addEventListener('click', () => clicks[i]++));
    p.run('adapter');
    p.run('adapter'); // Duplicate script inclusion must not duplicate visible keys or handlers.
    const dock = p.document.querySelector('.av-destinations');
    assert.equal(dock.getAttribute('aria-label'), 'Steps');
    assert.deepEqual([...dock.children].map(button => button.getAttribute('aria-label')), ['Certificate','Names','Photo','Review']);
    assert.deepEqual([...dock.querySelectorAll('.av-label-compact')].map(label => label.textContent), ['Cert','Names','Photo','Review']);
    assert.ok([...dock.children].every(button => button.disabled));
    dock.children[1].click();
    assert.deepEqual(clicks, [0, 0, 0, 0]);
    native[0].disabled = false;
    native[0].classList.add('active');
    await p.settle();
    assert.equal(dock.children[0].disabled, false);
    assert.equal(dock.children[0].getAttribute('aria-current'), 'step');
    dock.children[0].click();
    await p.settle();
    assert.deepEqual(clicks, [1, 0, 0, 0]);
    assert.equal(p.errors.length, 0);
  } finally { p.close(); }
});

test('CertPath dock uses native prerequisite handler instead of advancing itself', async () => {
  const labels = ['Goal','Pilot background','Experience','Your plan'];
  const p = await page(`${nav()}<div id="part61CalculatorView"><nav class="part61-step-rail">${labels.map((label, i) => `<a class="part61-rail-item${i ? '' : ' active'}" href="#step${i}">${label}</a>`).join('')}</nav></div>`, 'https://suarezcfi.com/part-61-calculator/');
  try {
    let attempted = 0;
    let permitted = false;
    const native = p.document.querySelectorAll('.part61-rail-item');
    native[1].addEventListener('click', event => { attempted++; event.preventDefault(); if (permitted) native[1].classList.add('active'); });
    p.run('adapter');
    const dock = p.document.querySelector('.av-destinations');
    assert.deepEqual([...dock.children].map(node => node.getAttribute('aria-label')), ['Goal','Background','Experience','Your plan']);
    assert.deepEqual([...dock.querySelectorAll('.av-label-compact')].map(label => label.textContent), ['Goal','Profile','Hours','Plan']);
    dock.children[1].click();
    await p.settle();
    assert.equal(attempted, 1);
    assert.equal(native[1].classList.contains('active'), false);
    assert.equal(p.window.location.hash, '');
    permitted = true;
    dock.children[1].click();
    await p.settle();
    assert.equal(attempted, 2);
    assert.equal(dock.children[1].getAttribute('aria-current'), 'step');
    assert.equal(p.errors.length, 0);
  } finally { p.close(); }
});

test('Simply Endorsed rerender updates active section and restores dock focus', async () => {
  const workspace = current => `<header class="se-app-header"><nav aria-label="Workspace">${['Endorsements','Checklists','Guidance'].map((label, i) => `<a href="?view=${i}"${i === current ? ' aria-current="page"' : ''}>${label}</a>`).join('')}</nav></header>`;
  const p = await page(`${nav()}<div id="se-workspace">${workspace(0)}</div>`, 'https://suarezcfi.com/simply-endorsed-cfi/');
  try {
    p.run('adapter');
    const dock = p.document.querySelector('.av-destinations');
    assert.equal(dock.children.length, 3);
    assert.equal(dock.children[0].getAttribute('aria-current'), 'page');
    dock.children[2].focus();
    p.document.getElementById('se-workspace').innerHTML = workspace(2);
    await p.settle();
    assert.equal(dock.children.length, 3);
    assert.equal(dock.children[2].getAttribute('aria-current'), 'page');
    assert.equal(p.document.activeElement, dock.children[2]);
    let called = 0;
    p.document.querySelectorAll('.se-app-header nav a')[1].addEventListener('click', event => { called++; event.preventDefault(); });
    dock.children[1].click();
    await p.settle();
    assert.equal(called, 1);
    assert.equal(p.errors.length, 0);
  } finally { p.close(); }
});

test('site menu closes on Escape and outside pointer while keeping one set of controls', async () => {
  const p = await page(nav('<button class="tool-action">Save</button>'));
  try {
    p.run('appearance');
    p.run('navigation');
    p.run('navigation'); // The initializer must be idempotent when a page includes it twice.
    const menu = p.document.querySelector('.nav-menu-toggle');
    const links = p.document.querySelector('.nav-links');
    assert.equal(links.hasAttribute('inert'), true);
    assert.equal(links.querySelectorAll('.av-appearance').length, 1);
    assert.equal(links.querySelectorAll('.tool-action').length, 1);
    assert.equal(links.querySelector('[role="menu"]'), null);
    assert.equal(links.querySelector('[role="menuitem"]'), null);
    menu.click();
    assert.equal(menu.getAttribute('aria-expanded'), 'true');
    assert.equal(links.hasAttribute('inert'), false);
    assert.equal(p.document.activeElement, links.querySelector('a'));
    p.document.dispatchEvent(new p.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    assert.equal(menu.getAttribute('aria-expanded'), 'false');
    assert.equal(links.hasAttribute('inert'), true);
    assert.equal(p.document.activeElement, menu);
    menu.click();
    p.document.body.dispatchEvent(new p.window.MouseEvent('pointerdown', { bubbles: true }));
    assert.equal(menu.getAttribute('aria-expanded'), 'false');
    assert.equal(p.document.activeElement, menu);
    assert.equal(p.errors.length, 0);
  } finally { p.close(); }
});

test('both shared menu variants keep every primary site destination available', () => {
  const required = ['/', '/flight-training-louisville-ky/', '/learn/', '/blog/', '/tools/', '/discovery-flight-louisville-ky/'];
  for (const name of ['nav.html', 'nav-tool.html']) {
    const partial = fs.readFileSync(path.join(site, 'assets', 'partials', name), 'utf8');
    const dom = new JSDOM(partial);
    const links = [...dom.window.document.querySelectorAll('.nav-links a')].map(link => link.getAttribute('href'));
    for (const href of required) assert.ok(links.includes(href), `${name} missing ${href}`);
    dom.window.close();
  }
});

test('embedded appearance follows storage events; collection and child each own one navigation layer', async () => {
  const host = await page(nav(), 'https://suarezcfi.com/engine-explorer/');
  const child = await page('<div id="root"></div>', 'https://suarezcfi.com/engine-explorer/app/');
  try {
    host.run('appearance');
    child.run('appearance');
    const changes = [];
    child.window.addEventListener('suarez:appearance', event => changes.push(event.detail));
    host.window.SuarezAppearance.setPreference('light');
    child.window.dispatchEvent(new child.window.StorageEvent('storage', { key: 'suarez:appearance', newValue: 'light' }));
    assert.equal(child.document.documentElement.dataset.suarezTheme, 'light');
    host.window.SuarezAppearance.setSolid(true);
    child.window.dispatchEvent(new child.window.StorageEvent('storage', { key: 'suarez:solid-controls', newValue: 'true' }));
    assert.equal(child.document.documentElement.dataset.suarezSolid, 'true');
    assert.equal(changes.at(-1).solid, true);
    const wrapper = fs.readFileSync(path.join(site, 'engine-explorer/index.html'), 'utf8');
    const app = fs.readFileSync(path.join(site, 'engine-explorer/app/index.html'), 'utf8');
    assert.equal((wrapper.match(/class="nav-wrap"/g) || []).length, 1);
    assert.equal((app.match(/class="nav-wrap"/g) || []).length, 0);
    assert.equal((app.match(/appearance\.js/g) || []).length, 1);
    assert.equal(host.errors.length + child.errors.length, 0);
  } finally { host.close(); child.close(); }
});
