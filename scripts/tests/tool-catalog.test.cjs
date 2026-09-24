const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('../../simply-endorsed/node_modules/jsdom');
const html = fs.readFileSync('tools/index.html','utf8');
const script = fs.readFileSync('assets/tool-catalog.js','utf8');
const catalog = JSON.parse(fs.readFileSync('config/tool-catalog.json','utf8'));
function setup({mobile=false,saved=null,storageFailure=false,largeText=false}={}) {
  const dom = new JSDOM(html,{url:'https://suarezcfi.com/tools/',runScripts:'outside-only',pretendToBeVisual:true});
  const w=dom.window,d=w.document;
  w.matchMedia=q=>({matches:q.includes('max-width')?mobile:true,addEventListener(){}});
  if(saved)w.sessionStorage.setItem('suarez:tool-orbit:v1',JSON.stringify(saved));
  if(storageFailure) Object.defineProperty(w,'sessionStorage',{get(){throw new Error('blocked')}});
  if(largeText)d.documentElement.style.fontSize='32px';
  w.eval(script);
  return {dom,w,d,close:()=>dom.window.close()};
}
test('static directory launches every tool with no JavaScript; enhancement shows descriptions without screenshot dependencies',()=>{
 const plain=new JSDOM(html),d=plain.window.document;
 assert.equal(d.querySelector('.all-apps').open,true);
 assert.equal(d.querySelectorAll('.all-apps-list a').length,7);
 assert.equal(d.querySelector('.orbit-experience').hidden,true);
 assert.equal(d.querySelector('.tool-preview-dialog'),null);
 plain.window.close();
 const p=setup();
 try {
  for(const t of catalog.tools) {
   p.d.querySelector('[data-orbit-app="'+t.id+'"]').click();
   assert.equal(p.d.querySelector('#stage-title').textContent,t.name);
   assert.equal(p.d.querySelector('#stage-open').getAttribute('href'),t.path);
   assert.equal(p.d.querySelector('#stage-open').dataset.ctaId,'directory-'+t.id);
   assert.equal(p.d.querySelector('#stage-description').textContent,t.description);
   assert.equal(p.d.querySelector('#stage-screenshot'),null);
   assert.equal(p.d.querySelector('#stage-compatibility').textContent,t.compatibility);
  }
 } finally {p.close()}
});
test('filters preserve eligible selection and choose first matching app otherwise',()=>{
 const p=setup();
 try {
  p.d.querySelector('[data-orbit-app="foi-cards"]').click();
  p.d.querySelector('[data-catalog-filter="training"]').click();
  assert.equal(p.d.querySelector('#stage-title').textContent,'FOI Cards');
  assert.equal([...p.d.querySelectorAll('.orbit-app')].filter(b=>!b.hidden).length,3);
  p.d.querySelector('[data-catalog-filter="flight"]').click();
  assert.equal(p.d.querySelector('#stage-title').textContent,'PilotSolve');
  assert.match(p.d.querySelector('#orbit-position').textContent,/1 of 2/);
  p.d.querySelector('[data-orbit-step="-1"]').click();
  assert.equal(p.d.querySelector('#stage-title').textContent,'FlightRisk');
 } finally {p.close()}
});
test('keyboard and mobile navigation expose neighbors and all direct links',()=>{
 const p=setup({mobile:true});
 try {
  const rail=p.d.querySelector('.orbit-rail');
  assert.equal([...rail.children].filter(b=>!b.hidden).length,3);
  rail.dispatchEvent(new p.w.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true,cancelable:true}));
  assert.equal(p.d.querySelector('#stage-title').textContent,'FlightRisk');
  assert.equal(p.d.activeElement.dataset.orbitApp,'flight-risk-assessment');
  rail.dispatchEvent(new p.w.KeyboardEvent('keydown',{key:'End',bubbles:true,cancelable:true}));
  assert.equal(p.d.querySelector('#stage-title').textContent,'Crank & Core');
  rail.dispatchEvent(new p.w.KeyboardEvent('keydown',{key:'Home',bubbles:true,cancelable:true}));
  assert.equal(p.d.querySelector('#stage-title').textContent,'PilotSolve');
  assert.equal(p.d.querySelectorAll('.all-apps-list a').length,7);
 } finally {p.close()}
});
test('selection and description survive a session return without screenshot state',()=>{
 const p=setup();let saved;
 try {
  p.d.querySelector('[data-orbit-app="engine-explorer"]').click();
  saved=JSON.parse(p.w.sessionStorage.getItem('suarez:tool-orbit:v1'));
  assert.equal('shot' in saved,false);
  assert.equal(p.d.querySelector('.stage-image-controls'),null);
 } finally {p.close()}
 const restored=setup({saved});
 try {assert.equal(restored.d.querySelector('#stage-title').textContent,'Crank & Core');assert.match(restored.d.querySelector('#stage-description').textContent,/teaching reconstructions/)} finally {restored.close()}
});
test('blocked storage and invalid saved filters do not break catalog',()=>{
 for(const options of [{storageFailure:true},{saved:{selected:'foi-cards',group:'deleted',shot:999}},{saved:{selected:'foi-cards',group:'all',shot:.5}}]) {
  const p=setup(options);
  try {assert.equal(p.d.querySelector('.orbit-experience').hidden,false); assert.ok(p.d.querySelector('#stage-open').getAttribute('href'))} finally {p.close()}
 }
});
test('horizontal swipe changes selection; vertical travel remains ordinary scrolling',()=>{
 const p=setup({mobile:true});
 try {
  const rail=p.d.querySelector('.orbit-rail');
  const event=(type,x,y)=>rail.dispatchEvent(new p.w.MouseEvent(type,{clientX:x,clientY:y,button:0,bubbles:true}));
  event('pointerdown',220,40); event('pointermove',120,45); event('pointerup',120,45);
  assert.equal(p.d.querySelector('#stage-title').textContent,'FlightRisk');
  event('pointerdown',220,40); event('pointermove',215,120); event('pointerup',210,160);
  assert.equal(p.d.querySelector('#stage-title').textContent,'FlightRisk');
 } finally {p.close()}
});

test('enlarged text uses a readable three-app rail and keeps direct links',()=>{
 const p=setup({largeText:true});
 try {assert.ok(p.d.querySelector('.orbit-large-text'));assert.equal([...p.d.querySelectorAll('.orbit-app')].filter(b=>!b.hidden).length,3);assert.equal(p.d.querySelectorAll('.all-apps-list a').length,7)} finally {p.close()}
});

test('reduced motion selects apps without starting stage animation',()=>{
 const p=setup();
 try {
  p.d.querySelector('.app-stage').animate=()=>{throw new Error('Motion must be suppressed')};
  p.d.querySelector('[data-orbit-step="1"]').click();
  assert.equal(p.d.querySelector('#stage-title').textContent,'FlightRisk');
 } finally {p.close()}
});
