/* Progressive enhancement: the static All apps directory always contains every launch link. */
(function () {
  'use strict';
  var source = document.getElementById('tool-catalog-data');
  var root = document.querySelector('.orbit-catalog');
  if (!source || !root) return;
  root.querySelectorAll('button').forEach(function (b) { b.setAttribute('data-native-control', ''); b.classList.remove('av-control'); });
  var data;
  try { data = JSON.parse(source.textContent); } catch (_) { return; }
  if (!data.tools || !data.tools.length) return;
  var tools = data.tools, group = 'all', selected = tools[0].id;
  var key = 'suarez:tool-orbit:v1';
  try {
    var saved = JSON.parse(sessionStorage.getItem(key));
    if (saved && tools.some(function (t) { return t.id === saved.selected; })) {
      selected = saved.selected;
      group = data.groups.some(function (g) { return g.id === saved.group; }) ? saved.group : 'all';
    }
  } catch (_) {}
  var rail = root.querySelector('.orbit-rail'), stage = root.querySelector('.app-stage');
  var buttons = Array.from(rail.querySelectorAll('[data-orbit-app]'));
  var filters = root.querySelector('.catalog-filters');
  var narrow = matchMedia('(max-width: 700px)');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)');
  var filtered = [];
  function save() {
    try { sessionStorage.setItem(key, JSON.stringify({ selected: selected, group: group })); } catch (_) {}
  }
  function current() { return tools.find(function (t) { return t.id === selected; }); }
  function layout() {
    var index = filtered.findIndex(function (t) { return t.id === selected; }), count = filtered.length;
    var width = rail.clientWidth || 900;
    var largeText = parseFloat(getComputedStyle(document.documentElement).fontSize) >= 24;
    root.classList.toggle('orbit-large-text', largeText);
    var compact = narrow.matches || largeText;
    var step = compact ? Math.min(110, width / 3) : Math.min(138, (width - 110) / Math.max(count - 1, 1));
    buttons.forEach(function (b) {
      var i = filtered.findIndex(function (t) { return t.id === b.dataset.orbitApp; });
      var offset = i - index;
      if (offset > count / 2) offset -= count;
      if (offset < -count / 2) offset += count;
      var visible = i >= 0 && (!compact || Math.abs(offset) <= 1);
      b.hidden = !visible;
      b.tabIndex = b.dataset.orbitApp === selected ? 0 : -1;
      b.setAttribute('aria-pressed', String(b.dataset.orbitApp === selected));
      b.style.setProperty('--orbit-x', (offset * step) + 'px');
      b.style.setProperty('--orbit-y', (Math.abs(offset) * (compact ? 17 : 12)) + 'px');
      b.style.setProperty('--orbit-scale', offset === 0 ? '1' : '.84');
      b.style.zIndex = String(10 - Math.abs(offset));
    });
    root.querySelector('#orbit-position').textContent = (index + 1) + ' of ' + count + ' · ' + current().name;
    root.querySelectorAll('[data-orbit-step]').forEach(function (b) { b.disabled = count < 2; });
  }
  function render(animate) {
    filtered = tools.filter(function (t) { return group === 'all' || t.group === group; });
    if (!filtered.some(function (t) { return t.id === selected; })) { selected = filtered[0].id; }
    var t = current(), g = data.groups.find(function (g) { return g.id === t.group; });
    root.style.setProperty('--app-accent', t.accent || '#7ea9ff');
    root.querySelector('#stage-icon').src = '/assets/identities/' + t.id + '/logo.png';
    root.querySelector('#stage-title').textContent = t.name;
    root.querySelector('#stage-group').textContent = g ? g.name : 'Pilot tools';
    root.querySelector('#stage-purpose').textContent = t.short;
    root.querySelector('#stage-description').textContent = t.description;
    root.querySelector('#stage-compatibility').textContent = t.compatibility;
    var launch = root.querySelector('#stage-open');
    launch.href = t.path; launch.textContent = 'Open ' + t.name + ' ↗';
    launch.dataset.ctaId = 'directory-' + t.id;
    filters.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.catalogFilter === group)); });
    layout(); save();
    if (animate && !reduce.matches && stage.animate) {
      stage.getAnimations().forEach(function (a) { a.cancel(); });
      stage.animate([{ opacity: .65, transform: 'translateY(5px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 190, easing: 'ease-out' });
    }
  }
  function choose(id, focus) {
    if (selected !== id) { selected = id; render(true); }
    if (focus) buttons.find(function (b) { return b.dataset.orbitApp === selected; }).focus({ preventScroll: true });
  }
  function step(delta, focus) {
    var i = filtered.findIndex(function (t) { return t.id === selected; });
    choose(filtered[(i + delta + filtered.length) % filtered.length].id, focus);
  }
  buttons.forEach(function (b) { b.addEventListener('click', function () { choose(b.dataset.orbitApp, true); }); });
  root.querySelectorAll('[data-orbit-step]').forEach(function (b) { b.addEventListener('click', function () { step(Number(b.dataset.orbitStep), false); }); });
  rail.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); step(e.key === 'ArrowRight' ? 1 : -1, true); }
    if (e.key === 'Home' || e.key === 'End') { e.preventDefault(); choose(filtered[e.key === 'Home' ? 0 : filtered.length - 1].id, true); }
  });
  filters.addEventListener('click', function (e) { var b = e.target.closest('[data-catalog-filter]'); if (b) { group = b.dataset.catalogFilter; render(true); } });
  var start = null, dragged = false, suppressClick = false;
  rail.addEventListener('pointerdown', function (e) { if (e.button !== 0) return; start = { x: e.clientX, y: e.clientY, id: e.pointerId }; dragged = false; });
  rail.addEventListener('pointermove', function (e) {
    if (!start) return;
    var dx = e.clientX - start.x, dy = e.clientY - start.y;
    if (!dragged && Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) { start = null; return; }
    if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      dragged = true;
      if (rail.setPointerCapture) rail.setPointerCapture(e.pointerId);
      if (!reduce.matches) rail.style.setProperty('--drag-x', Math.max(-65, Math.min(65, dx * .35)) + 'px');
    }
  });
  function finish(e) {
    if (!start) return;
    var dx = e.clientX - start.x;
    var turn = dragged && Math.abs(dx) > 40;
    start = null; rail.style.removeProperty('--drag-x');
    if (turn) { step(dx < 0 ? 1 : -1, true); suppressClick = true; setTimeout(function () { suppressClick = false; }, 0); }
  }
  rail.addEventListener('pointerup', finish);
  rail.addEventListener('pointercancel', function () { start = null; rail.style.removeProperty('--drag-x'); });
  rail.addEventListener('click', function (e) { if (suppressClick) { e.preventDefault(); e.stopImmediatePropagation(); } }, true);
  if (window.ResizeObserver) new ResizeObserver(layout).observe(rail);
  if (narrow.addEventListener) narrow.addEventListener('change', layout);
  window.addEventListener('pageshow', function () { layout(); });
  root.classList.add('orbit-initializing');
  filters.hidden = false; root.querySelector('.orbit-experience').hidden = false; root.querySelector('.all-apps').open = false;
  document.body.classList.add('has-orbit');
  render(false);
  // Commit the initial positions without travel; animate only later selections.
  rail.getBoundingClientRect();
  requestAnimationFrame(function () { root.classList.remove('orbit-initializing'); });
})();
