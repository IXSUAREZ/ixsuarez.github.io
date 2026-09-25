/* Polished Aurum: synchronous shared appearance; System on first visit. */
(function () {
  'use strict';
  var key = 'suarez-cfi-appearance', legacyKey = 'suarez:appearance', solidKey = 'suarez:solid-controls';
  var root = document.documentElement;
  function valid(v) { return ['day', 'dark', 'system'].includes(v); }
  function normalize(v) { return v === 'light' ? 'day' : v; }
  function read(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }
  function save(k, v) { try { localStorage.setItem(k, v); } catch (_) {} }
  var stored = read(key), preference = stored;
  // Migrate only when the canonical key is absent. An invalid canonical value
  // deliberately resolves to System instead of resurrecting a stale override.
  if (stored === null) {
    preference = normalize(read(legacyKey));
    if (!valid(preference)) {
      try { var prior = JSON.parse(read('pilotsolve:app')); preference = normalize(prior && prior.settings && prior.settings.theme); } catch (_) {}
    }
    if (valid(preference)) save(key, preference);
  }
  if (!valid(preference)) preference = 'system';
  var solid = read(solidKey) === 'true';
  var os = matchMedia('(prefers-color-scheme: dark)');
  var transparency = matchMedia('(prefers-reduced-transparency: reduce)');
  function themeColor(theme) {
    document.querySelectorAll('meta[name="theme-color"]').forEach(function (meta) {
      meta.setAttribute('content', theme === 'dark' ? '#414141' : '#E3E3E3');
    });
  }
  function apply() {
    var dark = preference === 'system' ? os.matches : preference === 'dark';
    var theme = dark ? 'dark' : 'light';
    root.dataset.theme = preference;
    root.dataset.goldMode = dark ? 'dark' : 'day';
    root.dataset.goldFinish = 'aurum';
    root.dataset.goldEffects = solid || transparency.matches ? 'quiet' : 'normal';
    root.dataset.suarezTheme = theme;
    root.dataset.suarezPreference = preference === 'day' ? 'light' : preference;
    root.dataset.suarezSolid = String(solid || transparency.matches);
    root.style.colorScheme = theme;
    themeColor(theme);
    document.querySelectorAll('[data-appearance]').forEach(function (button) {
      button.setAttribute('aria-pressed', String(normalize(button.dataset.appearance) === preference));
      if (button.dataset.appearance === 'dark' && button.textContent.trim() === 'Dark') button.textContent = 'Night';
    });
    window.dispatchEvent(new CustomEvent('suarez:appearance', {detail: {preference: preference === 'day' ? 'light' : preference, theme: theme, solid: solid}}));
  }
  window.SuarezAppearance = {
    getPreference: function () { return preference === 'day' ? 'light' : preference; },
    getTheme: function () { return root.dataset.suarezTheme; },
    getSolid: function () { return solid; },
    setPreference: function (value) {
      value = normalize(value);
      if (!valid(value)) return;
      preference = value; save(key, value);
      // Compatibility for existing app settings consumers; canonical storage
      // continues to use only dark/day/system.
      save(legacyKey, value === 'day' ? 'light' : value); apply();
    },
    setSolid: function (value) { solid = !!value; save(solidKey, String(solid)); apply(); }
  };
  window.addEventListener('storage', function (event) {
    if (event.key === key || event.key === null) {
      var next = event.key === null ? read(key) : event.newValue;
      preference = valid(next) ? next : 'system';
      if (event.key === null) solid = read(solidKey) === 'true';
      apply();
    } else if (event.key === legacyKey) {
      var migrated = normalize(event.newValue);
      preference = valid(migrated) ? migrated : 'system'; save(key, preference); apply();
    } else if (event.key === solidKey) { solid = event.newValue === 'true'; apply(); }
  });
  [os, transparency].forEach(function (media) {
    if (media.addEventListener) media.addEventListener('change', apply); else media.addListener(apply);
  });
  apply();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply, {once: true});
  var viewport = window.visualViewport;
  function layout() {
    var inset = viewport ? Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop) : 0;
    root.style.setProperty('--av-keyboard-inset', inset + 'px');
    root.style.setProperty('--av-usable-height', (viewport ? viewport.height : window.innerHeight) + 'px');
  }
  if (viewport) { viewport.addEventListener('resize', layout); viewport.addEventListener('scroll', layout); }
  window.addEventListener('resize', layout); layout();
})();
