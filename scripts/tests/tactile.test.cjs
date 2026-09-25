const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {JSDOM} = require('../../simply-endorsed/node_modules/jsdom');
const code = fs.readFileSync(require('node:path').join(__dirname,'../../assets/tactile.js'),'utf8');
const pause = () => new Promise(r=>setTimeout(r,30));
async function fixture(markup){
 const d=new JSDOM(`<body>${markup}</body>`,{url:'https://suarezcfi.com/',runScripts:'outside-only',pretendToBeVisual:true});
 const w=d.window;Object.defineProperty(w.document,'scrollingElement',{value:w.document.documentElement});
 w.ResizeObserver=class{observe(){} disconnect(){}};
 w.HTMLElement.prototype.setPointerCapture=function(){};
 const errors=[];w.addEventListener('error',e=>errors.push(e.error));w.eval(code);await pause();
 return {d,w,doc:w.document,errors,scroll(y,target=w.document){w.document.documentElement.scrollTop=y;target.dispatchEvent(new w.Event('scroll'));},close(){w.SuarezTactile.destroy();d.window.close();}};
}
const nav='<nav class="nav"><a class="av-key" href="/"><svg></svg><span>Home</span></a><button class="nav-menu-toggle" aria-expanded="false"><svg></svg><span>Menu</span></button><div class="nav-links"><a href="/tools/">Tools</a></div></nav>';
test('dock collapses by direction, ignores menu scrolling and keeps accessible names',async()=>{
 const p=await fixture(nav);try{const n=p.doc.querySelector('nav');p.scroll(90);assert(!n.classList.contains('av-dock-collapsed'));p.scroll(128);assert(n.classList.contains('av-dock-collapsed'));assert.equal(n.querySelector('a').getAttribute('aria-label'),'Home');
 p.scroll(123);assert(n.classList.contains('av-dock-collapsed'));p.scroll(107);assert(!n.classList.contains('av-dock-collapsed'));
 p.scroll(150,p.doc.querySelector('.nav-links'));assert(!n.classList.contains('av-dock-collapsed'));
 p.scroll(180);assert(n.classList.contains('av-dock-collapsed'));n.querySelector('button').focus();assert(!n.classList.contains('av-dock-collapsed'));assert.deepEqual(p.errors,[]);
 }finally{p.close();}
});
test('dock freezes during press and retains native activation',async()=>{
 const p=await fixture(nav);try{const n=p.doc.querySelector('nav'),b=n.querySelector('button');p.scroll(150);let clicks=0;b.addEventListener('click',()=>clicks++);b.dispatchEvent(new p.w.Event('pointerdown',{bubbles:true}));b.focus();assert(n.classList.contains('av-dock-collapsed'));b.click();p.w.dispatchEvent(new p.w.Event('pointerup'));await pause();assert.equal(clicks,1);assert(!n.classList.contains('av-dock-collapsed'));
 b.setAttribute('aria-expanded','true');await pause();b.blur();p.scroll(250);assert(!n.classList.contains('av-dock-collapsed'));assert.deepEqual(p.errors,[]);
 }finally{p.close();}
});
test('nested content scroller is the only collapse source and detached docks clean up',async()=>{
 const p=await fixture('<div id="content"></div>'+nav.replace('class="nav"','class="nav" data-dock-scroll="#content"'));try{const n=p.doc.querySelector('nav'),c=p.doc.querySelector('#content');p.scroll(250);assert(!n.classList.contains('av-dock-collapsed'));c.scrollTop=130;c.dispatchEvent(new p.w.Event('scroll'));assert(n.classList.contains('av-dock-collapsed'));n.remove();await pause();p.scroll(500);assert.deepEqual(p.errors,[]);}finally{p.close();}
});
test('rotary preserves bounds, step, keyboard and direct entry; disabled states synchronize',async()=>{
 const p=await fixture('<label>Angle<input data-av-rotary type="range" min="-10" max="20" step="0.5" value="0"></label>');try{
 const input=p.doc.querySelector('input'),dial=p.doc.querySelector('[role=slider]'),entry=p.doc.querySelector('.av-value-entry');await pause();assert.equal(p.doc.querySelectorAll('.av-input-tools').length,1);let calls=0;input.addEventListener('input',()=>calls++);
 dial.dispatchEvent(new p.w.KeyboardEvent('keydown',{key:'ArrowUp',bubbles:true}));assert.equal(input.value,'0.5');
 dial.dispatchEvent(new p.w.KeyboardEvent('keydown',{key:'End',bubbles:true}));assert.equal(input.value,'20');
 p.doc.querySelectorAll('.av-step-key')[1].click();assert.equal(input.value,'20');
 entry.value='12.5';entry.dispatchEvent(new p.w.Event('change'));assert.equal(input.value,'12.5');assert.equal(dial.getAttribute('aria-valuenow'),'12.5');
 input.disabled=true;await pause();assert.equal(dial.tabIndex,-1);assert(entry.disabled);assert.equal(calls,3);assert.deepEqual(p.errors,[]);
 }finally{p.close();}
});
test('rotary drag cancels cleanly and ordinary wheel leaves value alone',async()=>{
 const p=await fixture('<input aria-label="Crank angle" data-av-rotary type="range" min="0" max="720" step="1" value="50">');try{
 const input=p.doc.querySelector('input'),dial=p.doc.querySelector('[role=slider]');const pointer=(type,y)=>{const e=new p.w.Event(type,{bubbles:true,cancelable:true});Object.assign(e,{button:0,pointerId:1,clientY:y});dial.dispatchEvent(e);};
 pointer('pointerdown',100);pointer('pointermove',98);assert.equal(input.value,'50');pointer('pointermove',80);assert.equal(input.value,'55');pointer('pointercancel',80);pointer('pointermove',40);assert.equal(input.value,'55');dial.dispatchEvent(new p.w.WheelEvent('wheel',{deltaY:-100}));assert.equal(input.value,'55');
 input.remove();await pause();assert.equal(p.doc.querySelector('.av-input-tools'),null);assert.deepEqual(p.errors,[]);
 }finally{p.close();}
});
test('numeric steppers retain precision and initializer is idempotent',async()=>{
 const p=await fixture('<input aria-label="Hours" data-av-stepper type="number" min="0" step="0.1" value="0.2">');try{p.w.eval(code);p.w.SuarezTactile.refresh();await pause();assert.equal(p.doc.querySelectorAll('.av-input-tools').length,1);p.doc.querySelectorAll('button')[1].click();assert.equal(p.doc.querySelector('input').value,'0.3');assert.deepEqual(p.errors,[]);}finally{p.close();}
});
test('existing steppers are not duplicated and implicit labels remain isolated',async()=>{
 const p=await fixture('<input data-native-controls aria-label="Native hours" type="number" step="1"><label>New hours<input type="number" step="0.1" value="2"></label>');try{
 assert.equal(p.doc.querySelectorAll('.av-input-tools').length,1);assert.equal(p.doc.querySelector('label .av-input-tools'),null);assert.equal(p.doc.querySelector('label input').getAttribute('aria-label'),'New hours');
 for(let i=0;i<10;i++)p.doc.querySelectorAll('.av-step-key')[1].click();assert.equal(p.doc.querySelector('label input').value,'3');assert.deepEqual(p.errors,[]);
 }finally{p.close();}
});
test('dynamic class replacement restores tactile controls without touching native buttons',async()=>{
 const p=await fixture('<button id="dynamic" class="overlay-toggle selected" aria-pressed="true">Particle trails</button><button id="native" data-native-control class="native-key">Native</button>');try{
  const button=p.doc.querySelector('#dynamic'),native=p.doc.querySelector('#native');
  assert(button.classList.contains('av-control'));
  button.className='overlay-toggle';await pause();
  assert(button.classList.contains('av-control'));
  button.className='overlay-toggle selected';await pause();
  assert(button.classList.contains('av-control'));
  native.className='native-key active';await pause();
  assert(!native.classList.contains('av-control'));
  assert.deepEqual(p.errors,[]);
 }finally{p.close();}
});
