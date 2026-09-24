const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../../assets/cta-tracking.js'), 'utf8');
function setup({ broken = false, absent = false } = {}) {
  const events = [], ga = [], listeners = {};
  const window = { location: { pathname: '/discovery-flight-louisville-ky/' } };
  if (!absent) {
    window.plausible = (name, data) => { if (broken) throw Error('offline'); events.push({ name, ...data }); };
    window.gtag = (...args) => ga.push(args);
  }
  const document = { readyState: 'loading', addEventListener: (type, fn) => listeners[type] = fn };
  vm.runInNewContext(source, { window, document });
  return { window, events, ga, listeners };
}
test('contact clicks transmit identifiers but never address, subject, message, or text', () => {
  const s = setup();
  s.window.trackCtaClick('discovery-email', { textContent: 'Private student name', getAttribute: () => 'mailto:private@example.com?subject=medical&body=secret' });
  assert.deepEqual(s.events.map(e => e.name), ['cta_click', 'contact_email_click']);
  assert.doesNotMatch(JSON.stringify([s.events, s.ga]), /private|medical|secret|subject|body|cta_href|cta_text/i);
});
test('accepted form success is not recorded as a click or booking', () => {
  const s = setup(); s.window.trackCtaClick('contact-form-success-home', null);
  assert.deepEqual(s.events.map(e => e.name), ['contact_submit_success']);
});
test('email handoff and submission error remain distinct from successful submission', () => {
  const s = setup();
  s.window.trackContactEvent('contact_email_handoff', 'home');
  s.window.trackContactEvent('contact_submit_error', 'home');
  s.window.trackContactEvent('booked_lesson', 'home');
  assert.deepEqual(s.events.map(e => e.name), ['contact_email_handoff', 'contact_submit_error']);
});
test('phone and SMS actions are separate and provider failure does not stop another provider', () => {
  const s = setup({ broken: true });
  for (const href of ['tel:+15025100508','sms:+15025100508']) s.window.trackCtaClick('contact', { getAttribute: () => href });
  assert.deepEqual(s.ga.map(e => e[1]), ['cta_click','contact_phone_click','cta_click','contact_sms_click']);
});
test('tracking is safe without providers and for non-element click targets', () => {
  const s = setup({ absent: true });
  assert.doesNotThrow(() => s.window.trackCtaClick('home', null));
  assert.doesNotThrow(() => s.listeners.click({ target: {} }));
});
