/* Appearance-only dock for the pinned baseline Crank & Core runtime. */
(function(){'use strict';
var root=document.getElementById('root');if(!root)return;
var keys=['Study','Parts','Learn','Details','View','Fit','Play'];
var extras=['Assembly','Animation','Resources','Tools'];
var dock=document.createElement('nav');dock.className='explorer-dock';dock.dataset.tactileDock='';dock.setAttribute('aria-label','Explore controls');dock.hidden=true;
var destinations=document.createElement('div');destinations.className='dock-destinations';
var quick=document.createElement('div');quick.className='dock-quick';
var menu=document.createElement('details');menu.className='explorer-menu';
menu.innerHTML='<summary data-dock-key><svg class="av-icon" aria-hidden="true"><use href="/assets/avionics-icons.svg#Menu"></use></svg><span data-dock-label>Menu</span></summary><div class="explorer-menu-panel"><p class="explorer-menu-heading">Explore controls</p><div class="explorer-menu-actions" role="group" aria-label="Explore controls"></div><div class="explorer-appearance"><p>Appearance</p><div role="group" aria-label="Appearance"><button type="button" data-preference="dark">Dark</button><button type="button" data-preference="light">Day</button><button type="button" data-preference="system">System</button></div><label><input type="checkbox"> Solid controls</label></div></div>';
var actions=menu.querySelector('.explorer-menu-actions');
var mirrors=new Map();
function create(label,where){var b=document.createElement('button');b.type='button';b.className='rail-button';b.setAttribute('aria-label',label);b.dataset.action=label;b.dataset.dockKey='';where.appendChild(b);mirrors.set(label,b);b.addEventListener('click',function(){var original=find(label);if(!original||original.disabled)return;original.click();menu.open=false;requestAnimationFrame(sync)})}
keys.forEach(function(label){create(label,['Fit','Play'].includes(label)?quick:destinations)});
extras.concat(['Fit model','Playback']).forEach(function(label){var b=document.createElement('button');b.type='button';b.dataset.action=label;b.textContent=label;actions.appendChild(b);b.addEventListener('click',function(){var original=find(label==='Fit model'?'Fit':label==='Playback'?'Play':label);if(!original||original.disabled)return;original.click();menu.open=false;requestAnimationFrame(sync)})});
dock.append(destinations,quick,menu);document.body.appendChild(dock);
function find(label){var source=label==='Play'?root.querySelector('.edge-controls .action-rail button[aria-label="Play"],.edge-controls .action-rail button[aria-label="Pause"]'):root.querySelector('.edge-controls button[aria-label="'+label+'"]');return source}
// Keep React's loader lifecycle. This adapter supplies a short schematic
// transition while the pinned model runtime prepares the selected engine.
var priorLoading=null;
function syncLoading(){
 var panels=root.querySelectorAll('.loading-model');
 if(panels.length)root.querySelectorAll('.cc-loader-exit').forEach(function(ghost){ghost.remove()});
 if(!panels.length&&priorLoading){
  var previous=priorLoading;priorLoading=null;
  if(previous.parent.isConnected&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
   var ghost=document.createElement('div');ghost.className='cc-loader-exit';ghost.setAttribute('aria-hidden','true');
   ghost.innerHTML=previous.panel.querySelector('.cc-blueprint-loader')?.innerHTML||'';
   Object.assign(ghost.style,{top:previous.top+'px',left:previous.left+'px',width:previous.width+'px',height:previous.height+'px'});
   previous.parent.appendChild(ghost);
   ghost.getBoundingClientRect();ghost.classList.add('is-fading');
   window.setTimeout(function(){ghost.remove()},260);
  }
 }
 panels.forEach(function(panel){
  var loader=panel.querySelector('.cc-blueprint-loader');
  if(!loader){loader=document.createElement('div');loader.className='cc-blueprint-loader';loader.innerHTML=`<div class="engine-blueprint" aria-hidden="true"><svg viewBox="0 0 420 240" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path class="blueprint-grid" d="M30 40H390M30 80H390M30 120H390M30 160H390M30 200H390M50 20V220M90 20V220M130 20V220M170 20V220M210 20V220M250 20V220M290 20V220M330 20V220M370 20V220"/>
    <circle class="blueprint-orbit" cx="210" cy="120" r="94"/>
    <path class="blueprint-trace" d="M45 77H80L97 93H151L168 104H252L269 93H323L340 77H375M45 163H80L97 147H151L168 136H252L269 147H323L340 163H375M153 93V147M267 93V147M192 72H228L247 92V148L228 168H192L173 148V92L192 72Z"/>
    <g class="blueprint-part blueprint-part-a"><path d="M61 97H144V143H61L49 131V109L61 97Z"/><path d="M82 105V135M126 105V135M144 120H184"/></g>
    <g class="blueprint-part blueprint-part-b"><path d="M359 97H276V143H359L371 131V109L359 97Z"/><path d="M338 105V135M294 105V135M276 120H236"/></g>
    <g class="blueprint-part blueprint-part-c"><circle cx="210" cy="120" r="30"/><circle cx="210" cy="120" r="12"/><path d="M210 68V90M210 150V172M165 120H180M240 120H255"/></g>
    <path class="blueprint-accent" d="M88 120H184L210 96L236 120H332"/>
    <path class="blueprint-tick" d="M210 13V25M210 215V227M3 120H15M405 120H417"/>
   </svg><span class="blueprint-scan"></span></div><div class="loading-copy"><span class="loading-eyebrow">ENGINE COLLECTION</span><strong></strong><span>Assembling your engine study model</span><span class="loading-activity" aria-hidden="true"></span></div>`;panel.appendChild(loader);panel.setAttribute('role','status');panel.setAttribute('aria-live','polite');panel.setAttribute('aria-atomic','true')}
  var selected=root.querySelector('.engine-switcher [aria-pressed="true"] strong');
  var name=selected?.textContent?.trim()||root.querySelector('.engine-context strong')?.textContent?.trim()||'engine';
  var title='Opening '+name;if(loader.querySelector('strong').textContent!==title)loader.querySelector('strong').textContent=title;
  var bounds=panel.getBoundingClientRect(),parentBounds=panel.parentElement.getBoundingClientRect();
  priorLoading={panel:panel,parent:panel.parentElement,top:bounds.top-parentBounds.top,left:bounds.left-parentBounds.left,width:bounds.width,height:bounds.height};
 });
}
function sync(){syncLoading();root.querySelectorAll('input[type="range"][aria-label="Crank angle"]:not([data-av-rotary])').forEach(function(input){input.dataset.avRotary="";input.dataset.avUnit="°";window.SuarezTactile?.refresh()});var exploring=!!root.querySelector('.app.explorer .edge-controls');dock.hidden=!exploring;document.body.classList.toggle('cc-exploring',exploring);if(!exploring){menu.open=false;return}
 var back=root.querySelector('.engine-back');if(back&&back.getAttribute('aria-label')==='Flight Instruments')dock.setAttribute('aria-label','Explore flight instruments');else dock.setAttribute('aria-label','Explore engine');
 mirrors.forEach(function(b,label){var original=find(label);b.hidden=!original;b.disabled=!original||original.disabled;if(!original)return;b.innerHTML=original.innerHTML;b.querySelectorAll('span').forEach(function(span){span.dataset.dockLabel=''});b.setAttribute('aria-label',original.getAttribute('aria-label')||label);var expanded=original.getAttribute('aria-expanded');if(expanded!==null)b.setAttribute('aria-expanded',expanded);else b.removeAttribute('aria-expanded')});
 actions.querySelectorAll('button').forEach(function(b){var action=b.dataset.action;var original=find(action==='Fit model'?'Fit':action==='Playback'?'Play':action);b.disabled=!original||original.disabled;if(action==='Playback')b.textContent=original?.getAttribute('aria-label')||'Play'});
}
function syncAppearance(){var api=window.SuarezAppearance;if(!api)return;menu.querySelectorAll('[data-preference]').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.preference===api.getPreference()))});menu.querySelector('input').checked=api.getSolid()}
menu.querySelectorAll('[data-preference]').forEach(function(b){b.addEventListener('click',function(){window.SuarezAppearance?.setPreference(b.dataset.preference)})});menu.querySelector('input').addEventListener('change',function(e){window.SuarezAppearance?.setSolid(e.target.checked)});window.addEventListener('suarez:appearance',syncAppearance);syncAppearance();
menu.addEventListener('keydown',function(e){if(e.key==='Escape'){e.preventDefault();menu.open=false;menu.querySelector('summary').focus()}});
document.addEventListener('pointerdown',function(e){if(menu.open&&!menu.contains(e.target))menu.open=false});
var scheduled=false;function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(function(){scheduled=false;sync()})}
new MutationObserver(schedule).observe(root,{subtree:true,childList:true,attributes:true,attributeFilter:['aria-expanded','aria-label','disabled','class']});sync();
})();
