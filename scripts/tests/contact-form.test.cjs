const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../../assets/contact-form.js'), 'utf8');

class Node {
  constructor(tag, text = '') { this.tagName = tag.toUpperCase(); this.textContent = text; this.children = []; this.attributes = {}; this.hidden = false; this.className = ''; this.listeners = {}; this.style = {}; }
  appendChild(child) { this.children.push(child); child.parentNode = this; return child; }
  remove() { if (this.parentNode) this.parentNode.children = this.parentNode.children.filter(child => child !== this); }
  insertBefore(child, before) { const at = this.children.indexOf(before); if (at < 0) return this.appendChild(child); this.children.splice(at, 0, child); child.parentNode = this; return child; }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  getAttribute(name) { return this.attributes[name] ?? null; }
  addEventListener(type, fn) { this.listeners[type] = fn; }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  querySelectorAll(selector) {
    const matches = [];
    const className = selector.startsWith('.') ? selector.slice(1) : null;
    const walk = node => { for (const child of node.children) { if (className && child.className.split(/\s+/).includes(className)) matches.push(child); walk(child); } };
    walk(this); return matches;
  }
  get elements() {
    const result = {};
    const walk = node => { for (const child of node.children) { if (child.name) result[child.name] = child; walk(child); } };
    walk(this); return result;
  }
  classList = { add: (...names) => names.forEach(name => { this.className += ` ${name}`; }), remove: (...names) => { this.className = this.className.split(' ').filter(name => !names.includes(name)).join(' '); } };
}

function setup({ endpoint, response, responseStatus = 200, contextName = 'home' } = {}) {
  const mount = new Node('div');
  mount.setAttribute('data-form-context', contextName);
  mount.appendChild(new Node('p', 'Email Diego or call 502-510-0508.'));
  let fetchCalls = 0;
  let resolveFetch;
  const window = {
    location: { href: 'https://suarezcfi.com/' },
    fetch: endpoint && endpoint !== 'placeholder' ? (...args) => { fetchCalls += 1; return new Promise(resolve => { resolveFetch = () => resolve(response || { ok: true, status: responseStatus }); }); } : undefined,
    trackCtaClick: (...args) => { window.analytics = args; },
  };
  const document = {
    readyState: 'complete',
    createElement: tag => new Node(tag),
    createTextNode: text => new Node('#text', text),
    querySelectorAll: () => [mount],
  };
  const context = { window, document, URL, FormData: class { constructor(form) { this.form = form; } } };
  if (endpoint && endpoint !== 'discovery' && endpoint !== 'placeholder') window.SUAREZ_CFI_FORM_ENDPOINT = endpoint;
  vm.runInNewContext(source, context);
  const form = mount.querySelector('.cf-form');
  form.elements.name.value = 'Diego';
  form.elements.contact.value = 'student@example.com';
  form.elements.message.value = 'Hello';
  return { mount, form, window, submit: () => form.listeners.submit({ preventDefault() {} }), resolveFetch: () => resolveFetch && resolveFetch(), get fetchCalls() { return fetchCalls; } };
}

test('configured endpoint sends once and only accepted 2xx responses produce success analytics', async () => {
  const s = setup({ endpoint: 'https://formspree.io/f/public-test', responseStatus: 202 });
  s.submit(); s.submit();
  assert.equal(s.fetchCalls, 1);
  assert.equal(s.form.elements.name.value, 'Diego');
  s.resolveFetch();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(s.mount.querySelector('.cf-form'), null);
  assert.deepEqual(s.window.analytics, ['contact-form-success-home', null]);
});

test('configured discovery form uses its inquiry label', () => {
  const s = setup({ endpoint: 'https://formspree.io/f/public-test', contextName: 'discovery-flight-louisville-ky' });
  assert.equal(s.mount.querySelector('.cf-submit').textContent, 'Send discovery inquiry');
});

test('failed endpoint response restores fallback and keeps entered values', async () => {
  const s = setup({ endpoint: 'https://formspree.io/f/public-test', responseStatus: 400 });
  s.submit(); s.resolveFetch();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(s.form.elements.name.value, 'Diego');
  assert.equal(s.form.querySelector('.cf-error').hidden, false);
  assert.equal(s.mount.querySelector('.cf-fallback').hidden, false);
  assert.equal(s.window.analytics, undefined);
});

test('placeholder uses an explicit email handoff and never claims the message was sent', () => {
  const s = setup({ endpoint: 'placeholder' });
  s.submit();
  s.submit();
  assert.match(s.window.location.href, /^mailto:SuarezCFI@gmail.com\?/);
  assert.match(s.mount.querySelector('.cf-handoff').children[0].textContent, /Your email app should open/);
  assert.equal(s.mount.querySelector('.cf-success'), null);
  assert.equal(s.mount.querySelector('.cf-submit').textContent, 'Open email draft');
  assert.equal(s.mount.querySelector('.cf-note').textContent, 'Opens an email draft for you to review and send.');
  assert.equal(s.mount.querySelectorAll('.cf-handoff').length, 1);
  assert.equal(s.mount.querySelector('.cf-fallback').hidden, false);
  assert.equal(s.window.analytics, undefined);
});
