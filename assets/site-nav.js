/* Shared bottom navigation. App adapters retain native prerequisite handlers. */
(function(){'use strict';
function init(nav){
 if(nav.dataset.navReady)return;nav.dataset.navReady='true';
 var toggle=nav.querySelector('.nav-menu-toggle'),links=nav.querySelector('.nav-links');if(!toggle||!links)return;
 links.setAttribute('inert','');
 function close(focus){nav.classList.remove('is-open');links.setAttribute('inert','');toggle.setAttribute('aria-expanded','false');if(focus)toggle.focus()}
 toggle.addEventListener('click',function(){var open=!nav.classList.contains('is-open');nav.classList.toggle('is-open',open);toggle.setAttribute('aria-expanded',String(open));if(open){links.removeAttribute('inert');var first=links.querySelector('a,button,input');if(first)first.focus()}else links.setAttribute('inert','')});
 document.addEventListener('keydown',function(e){if(e.key==='Escape'&&nav.classList.contains('is-open')){e.preventDefault();close(true)}});
 document.addEventListener('pointerdown',function(e){if(!nav.contains(e.target))close(links.contains(document.activeElement))});
 nav.addEventListener('focusout',function(e){if(e.relatedTarget&&!nav.contains(e.relatedTarget))close(false)});
 links.addEventListener('click',function(e){if(e.target.closest('a'))close(false)});
 nav.querySelectorAll('.nav-drop-toggle').forEach(function(t){t.addEventListener('click',function(){var d=t.closest('.nav-dropdown'),open=!d.classList.contains('is-open');d.classList.toggle('is-open',open);t.setAttribute('aria-expanded',String(open))})});
 // These are ordinary disclosure links, not an application menu requiring arrow navigation.
 links.querySelectorAll('[role="menu"],[role="menuitem"]').forEach(function(el){el.removeAttribute('role')});
 nav.querySelectorAll('a[href]').forEach(function(a){var u=new URL(a.href,location.href);if(u.hash)return;var path=u.pathname,here=location.pathname;var match=path===here||(path==='/learn/'&&here.indexOf('/learn/')===0)||(path==='/blog/'&&here.indexOf('/blog/')===0)||(path==='/tools/'&&document.body.classList.contains('tool-page'));if(match)a.setAttribute('aria-current','page')});
 var section=document.createElement('fieldset');section.className='av-appearance';section.innerHTML='<legend>Appearance</legend><div class="av-appearance-options"><button type="button" data-appearance="dark">Dark</button><button type="button" data-appearance="light">Day</button><button type="button" data-appearance="system">System</button></div><label class="av-solid"><input type="checkbox"> Solid controls</label>';links.appendChild(section);
 function sync(){var api=window.SuarezAppearance;if(!api)return;section.querySelectorAll('[data-appearance]').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.appearance===api.getPreference()))});section.querySelector('input').checked=api.getSolid()}
 section.addEventListener('click',function(e){var b=e.target.closest('[data-appearance]');if(b&&window.SuarezAppearance)window.SuarezAppearance.setPreference(b.dataset.appearance)});section.querySelector('input').addEventListener('change',function(e){if(window.SuarezAppearance)window.SuarezAppearance.setSolid(e.target.checked)});window.addEventListener('suarez:appearance',sync);sync();
 // Existing extra tool actions live in Menu, leaving one stable control row.
 var tools=nav.querySelector('.nav-tools');if(tools){var extras=Array.from(tools.children).filter(function(el){return el!==toggle&&el!==links&&!el.contains(links)});if(extras.length){var actions=document.createElement('section');actions.className='av-menu-actions';actions.setAttribute('aria-label','Tool actions');extras.forEach(function(el){actions.appendChild(el)});links.insertBefore(actions,section)}}
 var expandedHeight=0;var resize=function(){if(nav.classList.contains('av-dock-collapsed'))return;expandedHeight=Math.max(expandedHeight,nav.getBoundingClientRect().height);document.documentElement.style.setProperty('--dock-clearance',(expandedHeight+36)+'px')};if(window.ResizeObserver)new ResizeObserver(resize).observe(nav);resize();
}
function ready(){document.querySelectorAll('.nav').forEach(init)}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready);else ready();
})();
