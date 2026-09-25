const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('../../simply-endorsed/node_modules/jsdom');
const root = path.resolve(__dirname, '../..');

test('FOI section dialog contains keyboard focus and restores background and trigger', () => {
  const dom = new JSDOM(fs.readFileSync(path.join(root, 'foi-cards/index.html'), 'utf8'), {
    url: 'https://suarezcfi.com/foi-cards/', runScripts: 'outside-only', pretendToBeVisual: true,
  });
  const { window } = dom;
  try {
    for (const name of ['cards.js', 'app.js']) window.eval(fs.readFileSync(path.join(root, 'foi-cards', name), 'utf8'));
    const doc = window.document;
    const trigger = doc.getElementById('dockSections');
    const background = doc.querySelector('.foi-cta');
    const originalProgress = window.localStorage.length;
    trigger.click();
    assert.equal(trigger.getAttribute('aria-expanded'), 'true');
    assert.equal(background.inert, true);
    const close = doc.getElementById('closeSheet');
    const last = doc.querySelector('#sectionList button:last-child');
    close.focus();
    close.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true }));
    assert.equal(doc.activeElement, last);
    last.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
    assert.equal(doc.activeElement, close);
    close.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    assert.equal(doc.activeElement, trigger);
    assert.equal(trigger.getAttribute('aria-expanded'), 'false');
    assert(!background.inert);
    assert.equal(window.localStorage.length, originalProgress);
    background.inert = true;
    trigger.click(); close.click();
    assert.equal(background.inert, true, 'preserve an existing inert state');
  } finally { window.close(); }
});

test('FOI reset requires explicit confirmation and preserves unrelated browser preferences', () => {
  const dom = new JSDOM(fs.readFileSync(path.join(root, 'foi-cards/index.html'), 'utf8'), {
    url: 'https://suarezcfi.com/foi-cards/', runScripts: 'outside-only', pretendToBeVisual: true,
  });
  const { window } = dom;
  try {
    const doc = window.document;
    const dialog = doc.getElementById('resetDialog');
    // jsdom has no native top layer; model only open/close events here.
    dialog.showModal = () => dialog.setAttribute('open', '');
    dialog.close = () => { dialog.removeAttribute('open'); dialog.dispatchEvent(new window.Event('close')); };
    const progressKey = 'suarez-cfi-foi-cards-v2';
    const sessionKey = 'suarez-cfi-foi-cards-v3-session';
    window.localStorage.setItem(progressKey, '{"test-card":"review"}');
    window.localStorage.setItem(sessionKey, '{"version":1,"deckIds":[],"index":0}');
    window.localStorage.setItem('theme', 'day');
    for (const name of ['cards.js', 'app.js']) window.eval(fs.readFileSync(path.join(root, 'foi-cards', name), 'utf8'));
    doc.getElementById('resetButton').click();
    assert(dialog.open);
    assert.equal(doc.activeElement.id, 'cancelReset');
    doc.getElementById('cancelReset').click();
    assert(!dialog.open);
    assert.equal(window.localStorage.getItem(progressKey), '{"test-card":"review"}');
    assert(window.localStorage.getItem(sessionKey));
    assert.equal(doc.activeElement.id, 'chipnavMenuToggle');
    doc.getElementById('resetButton').click();
    doc.getElementById('confirmReset').click();
    assert(!dialog.open);
    assert.equal(window.localStorage.getItem(progressKey), null);
    assert.equal(window.localStorage.getItem(sessionKey), null);
    assert.equal(window.localStorage.getItem('theme'), 'day');
    assert.match(doc.getElementById('welcomeSummary').textContent, /0 review later/);
  } finally { window.close(); }
});

test('FOI reset opens one modal after the shared navigation dismisses', async () => {
  const dom = new JSDOM(fs.readFileSync(path.join(root, 'foi-cards/index.html'), 'utf8'), {
    url: 'https://suarezcfi.com/foi-cards/', runScripts: 'outside-only', pretendToBeVisual: true,
  });
  const { window } = dom;
  try {
    const doc = window.document;
    window.matchMedia = query => ({ matches: false, media: query, addEventListener() {}, removeEventListener() {} });
    window.ResizeObserver = class { observe() {} disconnect() {} };
    window.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
    window.HTMLDialogElement.prototype.close = function () { this.open = false; this.dispatchEvent(new window.Event('close')); };
    await new Promise(resolve => setImmediate(resolve));
    for (const name of ['cards.js', 'app.js']) window.eval(fs.readFileSync(path.join(root, 'foi-cards', name), 'utf8'));
    window.eval(fs.readFileSync(path.join(root, 'assets/site-nav.js'), 'utf8'));
    const toggle = doc.getElementById('chipnavMenuToggle');
    toggle.click();
    assert.equal(toggle.getAttribute('aria-expanded'), 'true');
    doc.getElementById('resetButton').click();
    assert.equal(doc.getElementById('resetDialog').open, true);
    assert.equal(doc.querySelector('.liquid-menu').open, false);
    assert.equal(toggle.getAttribute('aria-expanded'), 'false');
    doc.getElementById('cancelReset').click();
    assert.equal(doc.activeElement, toggle);
  } finally { window.close(); }
});
