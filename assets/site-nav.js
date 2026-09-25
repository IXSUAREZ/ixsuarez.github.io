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
      appearance.innerHTML = '<legend>Choose your appearance</legend><div class="av-appearance-options"><button type="button" data-appearance="dark">Night</button><button type="button" data-appearance="light">Day</button><button type="button" data-appearance="system">System</button></div><label class="av-solid"><input type="checkbox"><span>Solid controls<small>Use opaque surfaces for more contrast.</small></span></label>';
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
    compactDock(nav, dialog, toggle, index);
  }
  // A single owner for the shared dock; tactile.js deliberately excludes liquid-dock.
  function compactDock(nav, dialog, menu, index) {
    var media = matchMedia('(max-width: 1024px)');
    var reduced = matchMedia('(prefers-reduced-motion: reduce)');
    var items = document.createElement('div');
    items.className = 'liquid-dock-items'; items.id = 'liquid-dock-items-' + index;
    Array.from(nav.children).forEach(function (el) {
      if (el !== dialog && el.tagName !== 'NOSCRIPT') items.appendChild(el);
    });
    var shell = document.createElement('div');
    shell.className = 'liquid-dock-shell'; shell.setAttribute('aria-hidden', 'true');
    nav.prepend(shell, items);
    var destinations = items.querySelector('.av-destinations'), menuIcon = menu.querySelector('.av-icon');
    if (!destinations || !menuIcon) return;
    // Render the glyph separately from the changing button hit area. Inverse
    // scale transitions distort a nested icon between their two endpoints.
    var glyph = menuIcon.cloneNode(true);
    glyph.classList.add('liquid-dock-menu-icon');
    glyph.setAttribute('aria-hidden', 'true'); glyph.setAttribute('focusable', 'false');
    nav.appendChild(glyph);
    destinations.id = destinations.id || 'liquid-dock-destinations-' + index;
    var menuLabel = menu.getAttribute('aria-label');
    nav.dataset.compactDock = 'expanded';
    var collapsed = false, pressed = false, last = y(), travel = 0, direction = 0, queued = false;
    var paused = [], measuredWidth = 0, measuredHeight = 0, viewportWidth = window.innerWidth, keyboardOpen = false;
    function y() {
      var root = document.scrollingElement || document.documentElement;
      return Math.max(0, Math.min(window.scrollY, Math.max(0, root.scrollHeight - root.clientHeight)));
    }
    function reset() { last = y(); travel = 0; direction = 0; }
    function locked() {
      var focus = document.activeElement;
      return pressed || keyboardOpen || dialog.open || (items.contains(focus) && (focus !== menu || !collapsed) && focus.matches(':focus-visible'));
    }
    function settleShell() {
      // Read actual transition state: no duplicated duration or stale timeout
      // after a reversal, cancellation, resize, or live Reduce Motion change.
      var moving = shell.getAnimations().some(function (animation) {
        return animation.transitionProperty === 'transform' && animation.playState !== 'finished';
      });
      shell.style.pointerEvents = collapsed && moving ? 'auto' : 'none';
    }
    function scheduleSettle() { requestAnimationFrame(settleShell); }
    shell.addEventListener('transitionend', scheduleSettle);
    shell.addEventListener('transitioncancel', scheduleSettle);
    function render(next) {
      next = !!next && media.matches && !locked();
      if (collapsed === next) return;
      collapsed = next;
      nav.dataset.compactDock = next ? 'collapsed' : 'expanded';
      destinations.inert = next;
      destinations.setAttribute('aria-hidden', String(next));
      shell.style.pointerEvents = next ? 'auto' : 'none';
      scheduleSettle();
      if (next) {
        menu.setAttribute('aria-label', 'Show navigation');
        menu.setAttribute('aria-controls', destinations.id);
        menu.removeAttribute('aria-haspopup');
        menu.setAttribute('aria-expanded', 'false');
      } else {
        if (menuLabel === null) menu.removeAttribute('aria-label');
        else menu.setAttribute('aria-label', menuLabel);
        menu.setAttribute('aria-controls', dialog.id);
        menu.setAttribute('aria-haspopup', 'dialog');
        menu.setAttribute('aria-expanded', String(dialog.open));
      }
    }
    function motion() {
      var enabled = !reduced.matches && document.body.dataset.readerMotion !== 'off';
      try { if (JSON.parse(localStorage.getItem('suarez-cfi-reader-v1') || '{}').motion === false) enabled = false; } catch (_) {}
      nav.dataset.dockMotion = enabled ? 'on' : 'off';
      scheduleSettle();
    }
    function measure() {
      var rect = nav.getBoundingClientRect();
      if (Math.abs(rect.width - measuredWidth) < .5 && Math.abs(rect.height - measuredHeight) < .5) return;
      measuredWidth = rect.width; measuredHeight = rect.height;
      nav.style.setProperty('--dock-circle-scale', String(56 / rect.width));
      nav.style.setProperty('--dock-circle-height', String(56 / rect.height));
      function center(el) {
        var x = el.offsetWidth / 2, y = el.offsetHeight / 2, current = el;
        while (current && current !== nav) {
          x += current.offsetLeft; y += current.offsetTop;
          current = current.offsetParent;
        }
        return { x: x, y: y };
      }
      items.querySelectorAll('.av-key,.nav-menu-toggle').forEach(function (key) {
        var point = center(key);
        key.style.setProperty('--merge-x', (rect.width / 2 - point.x) + 'px');
        key.style.setProperty('--merge-y', (rect.height / 2 - point.y) + 'px');
        key.style.setProperty('--recede-x', (Math.sign(rect.width / 2 - point.x) * 12) + 'px');
      });
      var menuPoint = center(menu), menuRect = menu.getBoundingClientRect(), iconRect = menuIcon.getBoundingClientRect();
      var sx = menuRect.width / menu.offsetWidth || 1, sy = menuRect.height / menu.offsetHeight || 1;
      var iconPoint = { x: menuPoint.x + (iconRect.x + iconRect.width / 2 - menuRect.x - menuRect.width / 2) / sx,
        y: menuPoint.y + (iconRect.y + iconRect.height / 2 - menuRect.y - menuRect.height / 2) / sy };
      glyph.style.left = (iconPoint.x - iconRect.width / sx / 2) + 'px';
      glyph.style.top = (iconPoint.y - iconRect.height / sy / 2) + 'px';
      glyph.style.setProperty('--merge-x', (rect.width / 2 - iconPoint.x) + 'px');
      glyph.style.setProperty('--merge-y', (rect.height / 2 - iconPoint.y) + 'px');
      var menuStyle = getComputedStyle(menu);
      var menuWidth = parseFloat(menuStyle.width) || menu.offsetWidth;
      var menuHeight = parseFloat(menuStyle.height) || menu.offsetHeight;
      if (menuWidth && menuHeight) {
        menu.style.setProperty('--merge-menu-x', String(56 / menuWidth));
        menu.style.setProperty('--merge-menu-y', String(56 / menuHeight));
      }
      if (!media.matches) render(false);
      reset();
    }
    function scroll() {
      queued = false;
      var current = y(), delta = current - last;
      if (delta > 0) delta = current - Math.max(80, last);
      last = current;
      if (current <= 80) { travel = 0; render(false); return; }
      if (!media.matches || locked()) { travel = 0; return; }
      if (!delta) return;
      var sign = Math.sign(delta);
      travel = sign === direction ? travel + Math.abs(delta) : Math.abs(delta);
      direction = sign;
      if (sign > 0 && travel >= 48) render(true);
      if (sign < 0 && travel >= 16) render(false);
    }
    window.addEventListener('scroll', function () {
      if (!queued) { queued = true; requestAnimationFrame(scroll); }
    }, { passive: true });
    menu.addEventListener('click', function (event) {
      if (!collapsed) return;
      event.preventDefault(); event.stopImmediatePropagation();
      render(false); reset();
      if (event.detail === 0) (destinations.querySelector('[aria-current]') || menu).focus({ preventScroll: true });
    }, true);
    shell.addEventListener('click', function () {
      if (collapsed) { render(false); reset(); }
    });
    var shellPressId = null;
    shell.addEventListener('pointerdown', function (event) {
      if (collapsed) shellPressId = event.pointerId;
    });
    window.addEventListener('pointerup', function (event) {
      if (shellPressId !== event.pointerId) return;
      shellPressId = null;
      var rect = shell.getBoundingClientRect();
      if (event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom && collapsed) {
        // A contracting shell can move away before click is dispatched. Its
        // pointer-up still counts as a tap; the settled Menu key uses click.
        render(false); reset();
      }
    });
    window.addEventListener('pointercancel', function () { shellPressId = null; });
    items.addEventListener('focusin', function (event) { if (collapsed && event.target === menu) return; render(false); reset(); });
    var pressToken = 0;
    nav.addEventListener('pointerdown', function () {
      pressToken++;
      pressed = true;
      paused = nav.getAnimations({ subtree: true }).filter(function (animation) { return animation.playState === 'running'; });
      paused.forEach(function (animation) { animation.pause(); });
    });
    function finishPress() {
      paused.forEach(function (animation) { if (animation.playState === 'paused') animation.play(); });
      paused = []; pressed = false; reset(); scheduleSettle();
    }
    window.addEventListener('pointerup', function () {
      if (!pressed) return;
      // Keep the hit area stationary until the pointerup/click pair completes.
      var token = pressToken;
      requestAnimationFrame(function () { if (pressed && token === pressToken) finishPress(); });
    });
    window.addEventListener('pointercancel', function () {
      // Cancellation has no click to protect. Release before the next scroll
      // event, even when a busy page delays its next animation frame.
      pressToken++;
      if (pressed) finishPress();
    });
    new MutationObserver(function () { if (!nav.isConnected) return; if (dialog.open) render(false); reset(); }).observe(dialog, { attributes: true, attributeFilter: ['open'] });
    new MutationObserver(motion).observe(document.body, { attributes: true, attributeFilter: ['data-reader-motion'] });
    window.addEventListener('storage', motion); if (reduced.addEventListener) reduced.addEventListener('change', motion);
    function viewportResize() {
      var focus = document.activeElement;
      var editable = focus && focus.matches('input:not([type="checkbox"]):not([type="radio"]),textarea,[contenteditable="true"]');
      var nextKeyboard = !!(editable && window.visualViewport && window.innerHeight - window.visualViewport.height > 120);
      if (nextKeyboard !== keyboardOpen) { keyboardOpen = nextKeyboard; if (keyboardOpen) render(false); reset(); }
      // Browser toolbars change height during a swipe. They must not reopen
      // the dock or discard the directional distance accumulated so far.
      if (window.innerWidth !== viewportWidth) { viewportWidth = window.innerWidth; render(false); measure(); reset(); }
    }
    window.addEventListener('resize', viewportResize); if (media.addEventListener) media.addEventListener('change', function () { render(false); measure(); });
    document.addEventListener('focusout', function () { requestAnimationFrame(viewportResize); });
    window.addEventListener('pageshow', function () { render(false); reset(); });
    if (window.ResizeObserver) new ResizeObserver(measure).observe(nav);
    new MutationObserver(function () { measuredWidth = 0; if (nav.isConnected) requestAnimationFrame(measure); }).observe(destinations, { childList: true, subtree: true });
    if (window.visualViewport) window.visualViewport.addEventListener('resize', viewportResize);
    if (document.fonts) document.fonts.ready.then(function () { measuredWidth = 0; measure(); });
    measure(); motion();
  }
  function ready() { document.querySelectorAll('.nav').forEach(init); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready); else ready();
})();
