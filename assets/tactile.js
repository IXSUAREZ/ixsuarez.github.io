/* Shared web controls. Native controls continue to own values and application state. */
(function () {
  'use strict';
  if (window.SuarezTactile) return;
  var docks = new Map(), inputs = new Map(), scheduled = false, active = true, observer, frame;
  var keySelector = '.av-key,.nav-menu-toggle,[data-dock-key]';
  function labelOf(el) { return el.getAttribute('aria-label') || (el.labels && el.labels[0] && el.labels[0].textContent.trim()) || el.name || 'Value'; }
  function attachDock(nav) {
    if (docks.has(nav)) return;
    var state = { last: 0, travel: 0, direction: 0, pressed: false, hover: false, compact: false, clearance: 0 };
    docks.set(nav, state);
    nav.dataset.tactileDock = '';
    function source() { return nav.dataset.dockScroll ? document.querySelector(nav.dataset.dockScroll) : document.scrollingElement; }
    function position() { var s = source(); return s ? s.scrollTop : window.scrollY || 0; }
    function locked() {
      var external = nav.dataset.dockMenu && document.querySelector(nav.dataset.dockMenu);
      return nav.classList.contains('liquid-dock') || state.pressed || state.hover || nav.contains(document.activeElement) || !!nav.querySelector('[aria-expanded="true"],details[open]') || (external && external.getAttribute('aria-expanded') === 'true');
    }
    function render(compact) {
      if (state.pressed) return;
      state.compact = compact && !locked();
      nav.classList.toggle('av-dock-collapsed', state.compact);
    }
    state.last = position();
    state.refresh = function () {
      nav.querySelectorAll(keySelector).forEach(function (key) {
        if (!key.getAttribute('aria-label')) key.setAttribute('aria-label', key.textContent.trim());
        if (!key.title) key.title = key.getAttribute('aria-label');
      });
      if (locked()) render(false);
      if (!state.compact) {
        var height = nav.getBoundingClientRect().height;
        if (height > state.clearance) {
          state.clearance = height;
          nav.style.setProperty('--av-expanded-height', height + 'px');
          if (nav.matches('.nav')) document.documentElement.style.setProperty('--dock-clearance', (height + 36) + 'px');
        }
      }
    };
    state.scroll = function (event) {
      var s = source(), target = event.target;
      if (target !== document && target !== s && target !== window) return;
      var y = Math.max(0, position()), delta = y - state.last;
      if (delta > 0) delta = y - Math.max(80, state.last);
      state.last = y;
      if (y <= 80) { state.travel = 0; render(false); return; }
      if (locked() || !delta) { state.travel = 0; return; }
      var direction = Math.sign(delta);
      state.travel = direction === state.direction ? state.travel + Math.abs(delta) : Math.abs(delta);
      state.direction = direction;
      if (direction > 0 && state.travel >= 48) render(true);
      if (direction < 0 && state.travel >= 16) render(false);
    };
    document.addEventListener('scroll', state.scroll, true);
    nav.addEventListener('pointerenter', function (e) { if (e.pointerType !== 'touch') { state.hover = true; render(false); } });
    nav.addEventListener('pointerleave', function () { state.hover = false; });
    nav.addEventListener('pointerdown', function () { state.pressed = true; });
    state.release = function () { requestAnimationFrame(function () { state.pressed = false; if(nav.isConnected) state.refresh(); }); };
    window.addEventListener('pointerup', state.release);
    window.addEventListener('pointercancel', state.release);
    nav.addEventListener('focusin', function () { if (!state.pressed) render(false); });
    state.observer = new MutationObserver(state.refresh);
    state.observer.observe(nav, {childList:true, subtree:true, attributes:true, attributeFilter:['aria-expanded','open']});
    if (window.ResizeObserver) { state.resize = new ResizeObserver(state.refresh); state.resize.observe(nav); }
    state.refresh();
  }
  function setValue(input, value) {
    if (input.disabled || input.readOnly || !Number.isFinite(value)) return;
    var min = input.min === '' ? -Infinity : Number(input.min), max = input.max === '' ? Infinity : Number(input.max);
    var step = input.step === 'any' ? 0 : Number(input.step || 1), base = Number.isFinite(min) ? min : 0;
    value = Math.max(min, Math.min(max, value));
    if (step > 0) value = Number((base + Math.round((value - base) / step) * step).toFixed(10));
    value = Math.max(min, Math.min(max, value));
    var setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(input, String(value));
    input.dispatchEvent(new Event('input', {bubbles:true}));
    input.dispatchEvent(new Event('change', {bubbles:true}));
    schedule();
  }
  function enhanceInput(input) {
    if (inputs.has(input) || input.closest('[data-native-controls],.av-input-tools')) return;
    var rotary = input.hasAttribute('data-av-rotary');
    if (!rotary && (input.type !== 'number' || input.step === 'any')) return;
    var name = labelOf(input).replace(/\s+/g, ' ').slice(0,100), shell = document.createElement('span');
    shell.className = 'av-input-tools' + (rotary ? ' av-rotary-tools' : '');
    shell.setAttribute('role','group'); shell.setAttribute('aria-label',name + ' adjustment');
    var minus = document.createElement('button'), plus = document.createElement('button');
    minus.type = plus.type = 'button'; minus.className = plus.className = 'av-step-key av-control';
    minus.textContent = '−'; plus.textContent = '+';
    minus.setAttribute('aria-label','Decrease ' + name); plus.setAttribute('aria-label','Increase ' + name);
    var state = { shell:shell, refresh:refresh }, dial, entry, drag;
    function step() { return input.step === 'any' ? .1 : Number(input.step || 1); }
    function current() { return input.value === '' ? Number(input.min || 0) : Number(input.value); }
    minus.addEventListener('click', function () { setValue(input,current()-step()); refresh(); });
    plus.addEventListener('click', function () { setValue(input,current()+step()); refresh(); });
    shell.appendChild(minus);
    if (rotary) {
      dial = document.createElement('span'); dial.className = 'av-rotary'; dial.tabIndex = 0;
      dial.setAttribute('role','slider'); dial.setAttribute('aria-label',name); dial.setAttribute('aria-orientation','vertical');
      var marker = document.createElement('span'); marker.className='av-rotary-marker'; dial.appendChild(marker);
      dial.addEventListener('keydown', function (e) {
        if (input.disabled || input.readOnly) return;
        var value = current();
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') value += step();
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') value -= step();
        else if (e.key === 'Home' && input.min !== '') value = Number(input.min);
        else if (e.key === 'End' && input.max !== '') value = Number(input.max);
        else return;
        e.preventDefault(); setValue(input,value); refresh();
      });
      dial.addEventListener('pointerdown', function (e) {
        if (e.button !== 0 || input.disabled || input.readOnly) return;
        drag = {id:e.pointerId,y:e.clientY,value:current()};
        dial.setPointerCapture(e.pointerId); dial.focus({preventScroll:true}); dial.classList.add('is-turning');
        e.preventDefault();
      });
      dial.addEventListener('pointermove', function (e) {
        if (!drag || e.pointerId !== drag.id) return;
        var delta = drag.y - e.clientY;
        if (Math.abs(delta) < 4) return;
        setValue(input,drag.value+Math.round(delta/4)*step()); refresh();
      });
      function stop() { drag=null; dial.classList.remove('is-turning'); }
      dial.addEventListener('pointerup',stop); dial.addEventListener('pointercancel',stop); dial.addEventListener('lostpointercapture',stop);
      dial.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();});
      shell.appendChild(dial);
      if (input.type === 'range') {
        entry = document.createElement('input'); entry.type='number'; entry.className='av-value-entry';
        entry.setAttribute('aria-label',name+' exact value');
        entry.addEventListener('change',function(){if(entry.value!==''&&entry.checkValidity())setValue(input,Number(entry.value));refresh();});
        entry.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();entry.blur();}});
        shell.appendChild(entry);
      }
    }
    shell.appendChild(plus);
    var label = input.closest('label');
    if (label && !input.getAttribute('aria-label')) input.setAttribute('aria-label', name);
    (label || input).insertAdjacentElement('afterend',shell);
    inputs.set(input,state);
    function refresh() {
      var disabled = input.disabled || input.readOnly, value=current();
      minus.disabled = disabled || (input.min!=='' && value<=Number(input.min));
      plus.disabled = disabled || (input.max!=='' && value>=Number(input.max));
      if (dial) {
        dial.tabIndex=disabled?-1:0; dial.setAttribute('aria-disabled',String(disabled));
        dial.setAttribute('aria-valuenow',String(value)); dial.setAttribute('aria-valuetext',String(value)+(input.dataset.avUnit||'°'));
        if(input.min!=='')dial.setAttribute('aria-valuemin',input.min);
        if(input.max!=='')dial.setAttribute('aria-valuemax',input.max);
        dial.style.setProperty('--av-angle',value+'deg');
      }
      if(entry){entry.min=input.min;entry.max=input.max;entry.step=input.step||'1';entry.disabled=disabled;if(document.activeElement!==entry)entry.value=input.value;}
    }
    input.addEventListener('input',refresh); input.addEventListener('change',refresh);
    state.observer=new MutationObserver(refresh);
    state.observer.observe(input,{attributes:true,attributeFilter:['value','disabled','readonly','min','max','step']});
    refresh();
  }
  function scan() {
    scheduled=false;
    if(!active)return;
    document.querySelectorAll('.nav,[data-tactile-dock]').forEach(attachDock);
    document.querySelectorAll('button:not([data-native-control]),.btn').forEach(function(b){if(!b.classList.contains('av-control'))b.classList.add('av-control');});
    document.querySelectorAll('input[data-av-rotary],input[data-av-stepper],input[type="number"][step]:not([step="any"])').forEach(enhanceInput);
    inputs.forEach(function(s,input){if(!input.isConnected){s.observer.disconnect();s.shell.remove();inputs.delete(input);}else s.refresh();});
    docks.forEach(function(s,nav){if(!nav.isConnected){document.removeEventListener('scroll',s.scroll,true);window.removeEventListener('pointerup',s.release);window.removeEventListener('pointercancel',s.release);s.observer.disconnect();if(s.resize)s.resize.disconnect();docks.delete(nav);}else s.refresh();});
  }
  function schedule(){if(active&&!scheduled){scheduled=true;frame=requestAnimationFrame(scan);}}
  function destroy(){active=false;cancelAnimationFrame(frame);if(observer)observer.disconnect();inputs.forEach(function(s){s.observer.disconnect();});docks.forEach(function(s){document.removeEventListener('scroll',s.scroll,true);window.removeEventListener('pointerup',s.release);window.removeEventListener('pointercancel',s.release);s.observer.disconnect();if(s.resize)s.resize.disconnect();});}
  window.SuarezTactile={refresh:schedule,attachDock:attachDock,setValue:setValue,destroy:destroy};
  function ready(){
    scan();
    observer=new MutationObserver(function(records){
      if(records.some(function(r){
        if(r.type==='attributes'){
          var target=r.target;
          return target.matches('button:not([data-native-control]),.btn') && !target.classList.contains('av-control');
        }
        return Array.from(r.addedNodes).concat(Array.from(r.removedNodes)).some(function(n){return n.nodeType===1;});
      }))schedule();
    });
    /* React can rewrite an existing button's class without replacing its node. */
    observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
})();
