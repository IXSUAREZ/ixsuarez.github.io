/* Shared liquid navigation. Native application actions retain their own handlers. */
(function () {
  'use strict';
  function init(nav, index) {
    if (nav.dataset.navReady) return;
    var toggle = nav.querySelector('.nav-menu-toggle');
    var links = nav.querySelector('.nav-links');
    if (!toggle || !links) return;
    nav.dataset.navReady = 'true';
    if (typeof HTMLDialogElement === 'undefined' || !HTMLDialogElement.prototype.showModal) {
      toggle.addEventListener('click', function () {
        var open = nav.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(open));
      });
      return;
    }
    nav.classList.add('liquid-dock');
    var dialog = document.createElement('dialog');
    dialog.className = 'liquid-menu';
    dialog.id = 'liquid-menu-' + index;
    dialog.setAttribute('aria-labelledby', dialog.id + '-title');
    dialog.innerHTML = '<div class="liquid-menu-surface" aria-hidden="true"></div><div class="liquid-menu-content"><header class="liquid-menu-heading"><div><p class="liquid-eyebrow">SUAREZ.CFI</p><h2 id="' + dialog.id + '-title">Where to next?</h2></div><button class="liquid-close" type="button" aria-label="Close menu">Close <span aria-hidden="true">×</span></button></header><div class="liquid-sections" role="tablist" aria-label="Menu sections"></div></div>';
    nav.appendChild(dialog);
    var content = dialog.querySelector('.liquid-menu-content');
    var tabs = dialog.querySelector('.liquid-sections');
    var panels = {};
    ['Explore', 'Connect', 'Appearance'].forEach(function (name, i) {
      var key = name.toLowerCase();
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'liquid-section'; b.textContent = name;
      b.id = dialog.id + '-tab-' + key;
      b.setAttribute('role', 'tab'); b.setAttribute('aria-controls', dialog.id + '-panel-' + key);
      b.dataset.section = key;
      tabs.appendChild(b);
      var panel = document.createElement('div');
      panel.className = 'liquid-panel'; panel.id = dialog.id + '-panel-' + key;
      panel.setAttribute('role', 'tabpanel'); panel.setAttribute('aria-labelledby', b.id);
      panels[key] = panel;
      b.addEventListener('click', function () { select(i, true); });
    });
    // Move existing nodes, retaining listeners, tracking and contextual destinations.
    var group = 'explore';
    Array.from(links.children).forEach(function (node) {
      if (node.classList.contains('av-menu-heading')) {
        group = /connect/i.test(node.textContent) ? 'connect' : 'explore'; node.remove();
      } else if (node.classList.contains('av-menu-actions')) {
        panels.explore.appendChild(node);
      } else if (node.classList.contains('av-appearance')) {
        panels.appearance.appendChild(node);
      } else {
        if (node.matches('a') && (/^\/#/.test(node.getAttribute('href')) || node.classList.contains('nav-cta'))) group = 'connect';
        panels[group].appendChild(node);
      }
    });
    links.replaceChildren(panels.explore, panels.connect, panels.appearance);
    links.classList.add('liquid-menu-panels');
    content.appendChild(links);
    links.removeAttribute('inert');
    links.querySelectorAll('[role="menu"],[role="menuitem"]').forEach(function (el) { el.removeAttribute('role'); });
    nav.querySelectorAll('a[href]').forEach(function (a) {
      var u = new URL(a.href, location.href), here = location.pathname;
      if (u.hash) return;
      if (u.pathname === here || (u.pathname === '/learn/' && here.indexOf('/learn/') === 0) || (u.pathname === '/blog/' && here.indexOf('/blog/') === 0) || (u.pathname === '/tools/' && document.body.classList.contains('tool-page'))) a.setAttribute('aria-current', 'page');
    });
    var appearance = panels.appearance.querySelector('.av-appearance');
    if (!appearance) {
      appearance = document.createElement('fieldset');
      appearance.className = 'av-appearance';
      appearance.innerHTML = '<legend>Choose your appearance</legend><div class="av-appearance-options"><button type="button" data-appearance="dark">Dark</button><button type="button" data-appearance="light">Day</button><button type="button" data-appearance="system">System</button></div><label class="av-solid"><input type="checkbox"><span>Solid controls<small>Use opaque surfaces for more contrast.</small></span></label>';
      panels.appearance.appendChild(appearance);
    }
    function syncAppearance() {
      var api = window.SuarezAppearance; if (!api) return;
      appearance.querySelectorAll('[data-appearance]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.appearance === api.getPreference())); });
      appearance.querySelector('input').checked = api.getSolid();
    }
    appearance.addEventListener('click', function (e) { var b = e.target.closest('[data-appearance]'); if (b && window.SuarezAppearance) window.SuarezAppearance.setPreference(b.dataset.appearance); });
    appearance.querySelector('input').addEventListener('change', function (e) { if (window.SuarezAppearance) window.SuarezAppearance.setSolid(e.target.checked); });
    window.addEventListener('suarez:appearance', syncAppearance); syncAppearance();
    var tools = nav.querySelector('.nav-tools');
    if (tools) {
      var extras = Array.from(tools.children).filter(function (el) { return el !== toggle && el !== dialog && el !== links && !el.contains(links); });
      if (extras.length) {
        var actions = document.createElement('section'); actions.className = 'av-menu-actions'; actions.setAttribute('aria-label', 'Tool actions');
        var heading = document.createElement('h3'); heading.textContent = 'Tool actions'; actions.appendChild(heading);
        extras.forEach(function (el) {
          if (!el.textContent.trim() && el.getAttribute('aria-label')) {
            var label = document.createElement('span'); label.textContent = el.getAttribute('aria-label'); el.appendChild(label);
          }
          actions.appendChild(el);
        }); panels.explore.appendChild(actions);
      }
    }
    links.querySelectorAll('.nav-drop-toggle').forEach(function (b) { b.addEventListener('click', function () { var d = b.closest('.nav-dropdown'); b.setAttribute('aria-expanded', String(d.classList.toggle('is-open'))); }); });
    var selected = 0;
    function select(n, focus) {
      selected = (n + 3) % 3;
      Array.from(tabs.children).forEach(function (b, i) {
        var active = i === selected;
        b.setAttribute('aria-selected', String(active)); b.tabIndex = active ? 0 : -1;
        var offset = (i - selected + 3) % 3; if (offset === 2) offset = -1;
        b.style.setProperty('--section-offset', String(offset));
        panels[b.dataset.section].hidden = !active;
        if (active && focus) b.focus();
      });
    }
    tabs.addEventListener('keydown', function (e) {
      var n = selected;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n++;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n--;
      else if (e.key === 'Home') n = 0;
      else if (e.key === 'End') n = 2;
      else return;
      e.preventDefault(); select(n, true);
    });
    var start = null, suppressClick = false;
    tabs.addEventListener('pointerdown', function (e) { if (e.button === 0) start = { x: e.clientX, y: e.clientY }; });
    tabs.addEventListener('pointerup', function (e) {
      if (!start) return;
      var dx = e.clientX - start.x, dy = e.clientY - start.y; start = null;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) { select(selected + (dx < 0 ? 1 : -1), true); suppressClick = true; setTimeout(function () { suppressClick = false; }, 0); }
    });
    tabs.addEventListener('pointercancel', function () { start = null; });
    tabs.addEventListener('click', function (e) { if (suppressClick) { e.preventDefault(); e.stopImmediatePropagation(); } }, true);
    select(0);
    dialog.querySelectorAll('button').forEach(function (b) { b.setAttribute('data-native-control', ''); b.classList.remove('av-control'); });
    toggle.setAttribute('aria-controls', dialog.id); toggle.setAttribute('aria-haspopup', 'dialog');
    var scrollY = 0, oldOverflow = '', oldPadding = '', closing = false, closeToken = 0;
    var surface = dialog.querySelector('.liquid-menu-surface');
    function position() {
      var largeText = parseFloat(getComputedStyle(document.documentElement).fontSize) >= 24;
      dialog.classList.toggle('liquid-large-text', largeText);
      tabs.setAttribute('aria-orientation', largeText ? 'vertical' : 'horizontal');
      var dock = nav.getBoundingClientRect(), button = toggle.getBoundingClientRect();
      var width = Math.min(440, window.innerWidth - 24);
      var left = Math.max(12, Math.min(dock.right - width, window.innerWidth - width - 12));
      dialog.style.setProperty('--menu-left', left + 'px');
      dialog.style.setProperty('--menu-bottom', Math.max(12, window.innerHeight - dock.top + 8) + 'px');
      dialog.style.setProperty('--bloom-x', (button.left + button.width / 2 - left) + 'px');
      dialog.style.setProperty('--bloom-width', Math.min(button.width, width) + 'px');
    }
    function open() {
      if (dialog.open) {
        if (closing) {
          closeToken++; closing = false;
          surface.getAnimations().forEach(function (a) { a.cancel(); });
          content.getAnimations().forEach(function (a) { a.cancel(); });
        }
        return;
      }
      select(0); position(); scrollY = window.scrollY;
      oldOverflow = document.documentElement.style.overflow; oldPadding = document.documentElement.style.paddingRight;
      var scrollbar = window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.overflow = 'hidden';
      if (scrollbar > 0) document.documentElement.style.paddingRight = scrollbar + 'px';
      dialog.showModal(); nav.classList.add('is-open'); toggle.setAttribute('aria-expanded', 'true');
      tabs.children[0].focus({ preventScroll: true });
    }
    function close() {
      if (!dialog.open || closing) return;
      if (!surface.animate || matchMedia('(prefers-reduced-motion: reduce)').matches) { dialog.close(); return; }
      closing = true; var token = ++closeToken;
      var from = getComputedStyle(surface).transform;
      surface.getAnimations().forEach(function (a) { a.cancel(); });
      var animation = surface.animate([{ transform: from, opacity: 1 }, { transform: 'translateY(24px) scale(.22,.12)', opacity: 0 }], { duration: 140, easing: 'ease-in', fill: 'forwards' });
      content.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 90, fill: 'forwards' });
      animation.finished.then(function () { if (token === closeToken && closing) dialog.close(); }).catch(function () {});
    }
    toggle.addEventListener('click', function () { if (closing || !dialog.open) open(); else close(); });
    dialog.querySelector('.liquid-close').addEventListener('click', close);
    dialog.addEventListener('cancel', function (e) { e.preventDefault(); close(); });
    dialog.addEventListener('close', function () {
      closing = false; closeToken++;
      if (surface.getAnimations) surface.getAnimations().forEach(function (a) { a.cancel(); });
      if (content.getAnimations) content.getAnimations().forEach(function (a) { a.cancel(); });
      nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false');
      document.documentElement.style.overflow = oldOverflow; document.documentElement.style.paddingRight = oldPadding;
      if (!document.querySelector('dialog[open]')) toggle.focus({ preventScroll: true });
      if (window.scrollY !== scrollY) window.scrollTo({ top: scrollY, behavior: 'instant' });
    });
    var backdropDown = false;
    dialog.addEventListener('pointerdown', function (e) { backdropDown = e.target === dialog; });
    dialog.addEventListener('click', function (e) { if (e.target === dialog && backdropDown) close(); });
    // Release the modal before an app action opens its own dialog.
    links.addEventListener('click', function (e) {
      if (e.target.closest('.av-menu-actions button')) dialog.close();
      else if (e.target.closest('a[href]')) close();
    }, true);
    dialog.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key !== 'Tab') return;
      var items = Array.from(dialog.querySelectorAll('a[href],button,input,summary,[tabindex="0"]')).filter(function (el) { return !el.disabled && el.tabIndex >= 0 && !el.closest('[hidden]'); });
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    var expandedHeight = 0;
    function resize() {
      if (!nav.classList.contains('av-dock-collapsed')) {
        expandedHeight = Math.max(expandedHeight, nav.getBoundingClientRect().height);
        document.documentElement.style.setProperty('--dock-clearance', (expandedHeight + 36) + 'px');
      }
      if (dialog.open) position();
    }
    if (window.ResizeObserver) new ResizeObserver(resize).observe(nav);
    window.addEventListener('resize', resize); if (window.visualViewport) window.visualViewport.addEventListener('resize', resize);
    resize();
  }
  function ready() { document.querySelectorAll('.nav').forEach(init); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready); else ready();
})();
