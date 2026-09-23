const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {JSDOM}=require('../../simply-endorsed/node_modules/jsdom');
const script=fs.readFileSync('engine-explorer/app/assets/avionics-overlay.js','utf8');
const html='<div id="root"><div class="app collection"><div class="engine-switcher"><button aria-pressed="true"><strong>Rotax 912 ULS</strong></button></div><div class="viewport"><div class="loading-model"><span class="spinner"></span><strong>Preparing engine anatomy</strong></div></div></div></div>';
const tick=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function setup(reduced=false){const dom=new JSDOM(html,{runScripts:'outside-only',pretendToBeVisual:true});dom.window.matchMedia=()=>({matches:reduced});dom.window.eval(script);return dom}

test('blueprint follows native loading, changes names, and hands off to the ready model',async()=>{
 const dom=setup(),d=dom.window.document,panel=d.querySelector('.loading-model');
 assert.equal(panel.querySelectorAll('.cc-blueprint-loader').length,1);
 assert.ok(panel.querySelector('.spinner'),'native loading node stays mounted');
 assert.equal(panel.getAttribute('role'),'status');
 assert.equal(panel.querySelector('.loading-copy strong').textContent,'Opening Rotax 912 ULS');
 d.querySelector('.engine-switcher strong').textContent='Lycoming IO-360-L2A';await tick(45);
 assert.equal(panel.querySelector('.loading-copy strong').textContent,'Opening Lycoming IO-360-L2A');
 assert.equal(panel.querySelectorAll('.cc-blueprint-loader').length,1);
 panel.remove();await tick(45);
 const exit=d.querySelector('.cc-loader-exit');assert.ok(exit,'ready model receives a brief visual handoff');
 assert.equal(exit.getAttribute('aria-hidden'),'true');assert.equal(d.querySelectorAll('.loading-model').length,0);
 await tick(280);assert.equal(d.querySelectorAll('.cc-loader-exit').length,0);
 dom.window.close();
});

test('reduced motion makes the ready model available without an exit animation',async()=>{
 const dom=setup(true),d=dom.window.document;
 d.querySelector('.loading-model').remove();await tick(45);
 assert.equal(d.querySelectorAll('.cc-loader-exit').length,0);dom.window.close();
});
