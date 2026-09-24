/* Progressive reading tools. No dependencies; no editorial text rewriting. */
(function () {
  'use strict';
  var body = document.body;
  if (!body.matches('.journal-article,.journal-library')) return;
  var key = 'suarez-cfi-reader-v1';
  var sizes = ['standard', 'large', 'larger'];
  var preferences = { size: 'standard', motion: true };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var wide = window.matchMedia('(min-width: 1051px)');
  var article = document.querySelector('.journal-layout > article');
  var chapters = document.querySelector('.journal-chapters');
  var settings = document.querySelector('.journal-settings');
  var position = document.querySelector('.journal-position');
  var motionInput = document.querySelector('[data-reader-motion][type="checkbox"]');
  var sizeButtons = Array.from(document.querySelectorAll('[data-reader-size]'));
  var animationObserver;
  var entered = new WeakSet();
  var pendingFrame = false;
  var links = Array.from(document.querySelectorAll('.journal-chapters a'));
  var sections = links.map(function (link) {
    return document.getElementById(decodeURIComponent(link.hash.slice(1)));
  });

  function read() {
    try {
      var saved = JSON.parse(localStorage.getItem(key) || '{}');
      preferences.size = saved && sizes.includes(saved.size) ? saved.size : 'standard';
      preferences.motion = !saved || saved.motion !== false;
    } catch (_) { /* Storage may be unavailable; the page still works. */ }
  }
  function save() {
    try { localStorage.setItem(key, JSON.stringify(preferences)); } catch (_) { /* Session-only preference. */ }
  }
  function motionAllowed() { return preferences.motion && !reduced.matches; }
  function applyPreferences() {
    body.dataset.readerSize = preferences.size;
    body.dataset.readerMotion = motionAllowed() ? 'on' : 'off';
    sizeButtons.forEach(function (button) {
      button.setAttribute('aria-pressed', String(button.dataset.readerSize === preferences.size));
    });
    if (motionInput) {
      motionInput.checked = preferences.motion && !reduced.matches;
      motionInput.disabled = reduced.matches;
    }
    if (!motionAllowed()) document.querySelectorAll('.journal-arriving').forEach(function (el) { el.classList.remove('journal-arriving'); });
    schedule();
  }

  function update() {
    pendingFrame = false;
    if (!article) return;
    var rect = article.getBoundingClientRect();
    var viewport = window.innerHeight;
    var travel = rect.height - viewport;
    var progress = travel > 0 ? Math.max(0, Math.min(1, -rect.top / travel)) : (rect.top <= 0 ? 1 : 0);
    body.style.setProperty('--journal-progress', progress.toFixed(4));
    if (position) position.querySelector('span').textContent = Math.round(progress * 100) + '%';
    var active = -1;
    sections.forEach(function (section, index) {
      if (section && section.getBoundingClientRect().top <= Math.min(180, viewport * .3)) active = index;
    });
    links.forEach(function (link, index) {
      if (index === active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  function schedule() {
    if (!pendingFrame) { pendingFrame = true; requestAnimationFrame(update); }
  }
  function syncChapters() { if (chapters) chapters.open = wide.matches; }

  function stopAnimations() {
    document.querySelectorAll('.journal-arriving').forEach(function (el) { el.classList.remove('journal-arriving'); });
  }
  function setupMotion() {
    if (!('IntersectionObserver' in window)) return;
    var targets = article
      ? article.querySelectorAll('.article-header,.prose > p,.prose > h2,.prose > h3,.prose > ul,.prose > ol,.prose > blockquote,.table-wrap,.seo-guide-section > h2,.seo-guide-item')
      : document.querySelectorAll('main .page-hero, main .post-card, main .hub-card, main .blog-story');
    animationObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || entered.has(entry.target)) return;
        entered.add(entry.target);
        animationObserver.unobserve(entry.target);
        // A jump to a chapter or fast scroll must never animate text already in
        // the reading zone. Only entrances near the viewport edge are animated.
        if (motionAllowed() && entry.boundingClientRect.top > window.innerHeight * .62) {
          entry.target.classList.add('journal-arriving');
        }
      });
    }, { rootMargin: '0px 0px -24px 0px', threshold: 0 });
    targets.forEach(function (target) { animationObserver.observe(target); });
    var header = document.querySelector('.article-header') || document.querySelector('main .page-hero');
    if (header && motionAllowed() && !location.hash) {
      entered.add(header);
      header.classList.add('journal-arriving');
    }
    document.addEventListener('animationend', function (event) {
      if (event.animationName === 'journal-arrive') event.target.classList.remove('journal-arriving');
    });
  }

  read();
  if (settings) settings.hidden = false;
  if (position) position.hidden = false;
  syncChapters();
  applyPreferences();
  sizeButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      preferences.size = button.dataset.readerSize;
      applyPreferences(); save();
    });
  });
  if (motionInput) motionInput.addEventListener('change', function () {
    preferences.motion = motionInput.checked; applyPreferences(); save();
  });
  links.forEach(function (link) {
    link.addEventListener('click', function () {
      stopAnimations();
      if (!wide.matches) chapters.open = false;
      var target = document.getElementById(decodeURIComponent(link.hash.slice(1)));
      if (target) {
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
      // Native anchor navigation supplies history and the actual scroll.
    });
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && settings && settings.open && settings.contains(document.activeElement)) {
      settings.open = false; settings.querySelector('summary').focus();
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'f') stopAnimations();
  });
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('hashchange', function () { stopAnimations(); schedule(); });
  window.addEventListener('pageshow', schedule);
  window.addEventListener('beforeprint', stopAnimations);
  window.addEventListener('storage', function (event) { if (event.key === key) { read(); applyPreferences(); } });
  reduced.addEventListener('change', applyPreferences);
  wide.addEventListener('change', syncChapters);
  if (article && 'ResizeObserver' in window) new ResizeObserver(schedule).observe(article);
  setupMotion();
}());
