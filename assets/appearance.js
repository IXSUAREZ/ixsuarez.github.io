/* Synchronous, storage-failure-safe shared appearance. */
(function(){'use strict';
var key='suarez:appearance',solidKey='suarez:solid-controls';
function valid(v){return ['dark','light','system'].includes(v)}
function read(k){try{return localStorage.getItem(k)}catch(_){return null}}
function save(k,v){try{localStorage.setItem(k,v)}catch(_){}}
var preference=read(key),solid=read(solidKey)==='true';
if(!valid(preference)){try{var p=JSON.parse(read('pilotsolve:app'));preference=p&&p.settings&&p.settings.theme}catch(_){}if(!valid(preference))preference='dark';save(key,preference)}
var os=matchMedia('(prefers-color-scheme: dark)'),transparency=matchMedia('(prefers-reduced-transparency: reduce)');
function updateThemeColor(theme){var meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.setAttribute('content',theme==='light'?'#e8edf0':'#101418')}
function apply(){var theme=preference==='system'?(os.matches?'dark':'light'):preference;var root=document.documentElement;root.dataset.suarezTheme=theme;root.dataset.suarezSolid=String(solid||transparency.matches);root.style.colorScheme=theme;updateThemeColor(theme);window.dispatchEvent(new CustomEvent('suarez:appearance',{detail:{preference:preference,theme:theme,solid:solid}}))}
window.SuarezAppearance={getPreference:function(){return preference},getSolid:function(){return solid},setPreference:function(v){if(valid(v)){preference=v;save(key,v);apply()}},setSolid:function(v){solid=!!v;save(solidKey,String(solid));apply()}};
window.addEventListener('storage',function(e){if(e.key===key){preference=valid(e.newValue)?e.newValue:'dark';apply()}if(e.key===solidKey){solid=e.newValue==='true';apply()}});
[os,transparency].forEach(function(m){if(m.addEventListener)m.addEventListener('change',apply);else m.addListener(apply)});apply();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){updateThemeColor(document.documentElement.dataset.suarezTheme)},{once:true});
var viewport=window.visualViewport;function layout(){var inset=viewport?Math.max(0,window.innerHeight-viewport.height-viewport.offsetTop):0;document.documentElement.style.setProperty('--av-keyboard-inset',inset+'px');document.documentElement.style.setProperty('--av-usable-height',(viewport?viewport.height:window.innerHeight)+'px')}if(viewport){viewport.addEventListener('resize',layout);viewport.addEventListener('scroll',layout)}window.addEventListener('resize',layout);layout();
})();
