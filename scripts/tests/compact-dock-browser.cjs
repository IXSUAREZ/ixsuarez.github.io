/* Real-browser contract tests. Run with DOCK_URL to verify a deployed release. */
const {chromium,webkit} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const root = path.resolve(__dirname,'../..');
const base = process.env.DOCK_URL || 'http://127.0.0.1:8970';
const out = path.join(root,'output/playwright/dock-motion',process.env.DOCK_ENGINE||'chromium',process.env.DOCK_GROUP==='matrix'?'tests-matrix':'tests');
const results = [];
(async()=>{
 await fs.mkdir(out,{recursive:true});
 // Use the native Mac graphics backend for the preserved WebGL homepage sky.
 // The default headless renderer stalled during repeated homepage captures.
 const chromiumArgs = process.platform === 'darwin' ? ['--use-angle=metal'] : [];
 const browser = process.env.DOCK_ENGINE === 'webkit' ? await webkit.launch({headless:true}) : await chromium.launch({headless:true,args:chromiumArgs});
 const ctx = await browser.newContext({viewport:{width:390,height:844}});
 await ctx.addInitScript(() => {
  // Wait for native cross-document transitions before measuring a new page.
  addEventListener('pagereveal', event => {
   if(event.viewTransition){ event.viewTransition.ready.catch(()=>{}); window.__dockTransition = event.viewTransition.finished.catch(()=>{}); }
  });
 });
 let page = await ctx.newPage(); const errors=[], navigationAborts=[]; function observeErrors(p) { p.on('pageerror',e=>{
  // Chromium reports native view-transition cancellation on Back. Reproduced
  // against the unchanged pre-dock release; retain it in the report, not as an app failure.
  if(/^(Transition was skipped|Transition was aborted because of invalid state\. ViewTransition opt-in disabled)$/.test(e.message)) navigationAborts.push(e.message);
  else errors.push(e.message);
 }); } observeErrors(page);
 await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());
 await ctx.route('**/plausible.io/**',r=>r.abort());
 async function load(route='/learn/weather-and-safety/how-to-read-a-taf/') {await page.goto(base+route,{waitUntil:'load'});await page.waitForFunction(()=>!!document.querySelector('[data-compact-dock]'));await page.evaluate(async()=>{await document.fonts.ready;await window.__dockTransition;});await page.waitForFunction(()=>{const n=document.querySelector('[data-compact-dock]');return n&&getComputedStyle(n).position==='relative'&&(innerWidth>1024||getComputedStyle(n.querySelector('.liquid-dock-shell')).position==='absolute');});await page.waitForTimeout(250);}
 async function scroll(y) {await page.evaluate(y=>window.scrollTo({top:y,behavior:'instant'}),y);await page.waitForTimeout(100);}
 async function state(expected) {assert.equal(await page.evaluate(()=>document.querySelector('.nav')?.dataset.compactDock),expected);}
 async function check(name,fn) {const matrix=name.startsWith('Day/Night');if(process.env.DOCK_GROUP==='core'&&matrix)return;if(process.env.DOCK_GROUP==='matrix'&&!matrix&&name!=='No unexpected browser errors')return;try{await fn();results.push({name,pass:true});console.log('PASS',name);}catch(e){results.push({name,pass:false,error:e.message});console.log('FAIL',name,e.message);console.log(await page.evaluate(()=>({url:location.href,ready:document.readyState,width:innerWidth,nav:document.querySelector('.nav')?.outerHTML.slice(0,200),css:document.querySelector('.nav')&&getComputedStyle(document.querySelector('.nav')).cssText}))); }}
 async function shot(name){await page.screenshot({path:path.join(out,name+'.png')});}
 await check('Responsive open/circle geometry and no overflow',async()=>{
  for(const width of [320,390,600,768,834,1024]){
   await page.setViewportSize({width,height:width>600?1194:844});await load();await state('expanded');
   const expanded=await page.locator('.nav').boundingBox();
   assert.ok(expanded.width<=width-24,`viewport ${width}, dock ${expanded.width}`); assert.ok(expanded.height>=56);
   await shot(width+'-expanded'); await scroll(500);await state('collapsed');await page.waitForTimeout(300);
   const circle=await page.locator('.nav-menu-toggle').boundingBox();
   assert.ok(Math.abs(circle.width-56)<1);assert.ok(Math.abs(circle.height-56)<1);assert.ok(Math.abs(circle.x+28-width/2)<1);
   const shell=await page.locator('.liquid-dock-shell').boundingBox();assert.ok(Math.abs(shell.width-56)<1);assert.ok(Math.abs(shell.height-56)<1,'Shell height '+shell.height);
   assert.deepEqual(await page.locator('.nav').boundingBox(),expanded);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await shot(width+'-collapsed');
   await scroll(470);await state('expanded');
  }
 });
 await page.setViewportSize({width:390,height:844});
 await check('Thresholds, direction changes, tap and keyboard restoration',async()=>{
  await load();await scroll(100);await state('expanded');await scroll(127);await state('expanded');await scroll(128);await state('collapsed');
  await scroll(118);await state('collapsed');await scroll(112);await state('expanded');
  await scroll(250);await state('collapsed');await page.waitForTimeout(200);await page.locator('.nav-menu-toggle').click();await state('expanded');
  await scroll(270);await state('expanded');await scroll(310);await state('collapsed');
  assert.equal(await page.locator('.av-destinations').evaluate(el=>el.inert),true);assert.equal(await page.locator('.nav-menu-toggle').getAttribute('aria-controls'),'liquid-dock-destinations-0');
  await page.keyboard.press('Tab');await page.locator('.nav-menu-toggle').focus();assert.equal(await page.locator('.nav-menu-toggle').getAttribute('aria-label'),'Show navigation');await page.keyboard.press('Enter');assert.equal(await page.locator('.nav-menu-toggle').getAttribute('aria-label'),'Menu');await state('expanded');
  assert.equal(await page.evaluate(()=>document.activeElement.getAttribute('aria-current')),'page');
  await scroll(500);await state('expanded');
  await page.evaluate(()=>document.activeElement.blur());await scroll(600);await state('collapsed');
  await scroll(575);await scroll(650);await scroll(625);await state('expanded');
 });
 await check('Brief motion, stable glyph, and continuous repeated reversals',async()=>{
  await load();
  const result=await page.evaluate(async()=>{
   const nav=document.querySelector('.nav'),shell=nav.querySelector('.liquid-dock-shell'),icon=nav.querySelector('.liquid-dock-menu-icon');
   const frame=()=>new Promise(resolve=>requestAnimationFrame(resolve));
   const sample=()=>({width:shell.getBoundingClientRect().width,icon:icon.getBoundingClientRect().toJSON()});
   async function move(y,target){
    const frames=[],start=performance.now();window.scrollTo({top:y,behavior:'instant'});
    let now;do{now=await frame();frames.push({...sample(),ms:now-start});}while(now-start<300);
    return {frames,settled:frames.find(f=>Math.abs(f.width-target)<.5)?.ms};
   }
   const width=sample().width,close=await move(500,56),open=await move(470,width);
   window.scrollTo({top:600,behavior:'instant'});await frame();await frame();await frame();
   const reversals=[];
   for(const y of [570,650,620,700,670]){
    const before=sample().width;window.scrollTo({top:y,behavior:'instant'});
    const immediate=sample().width;await frame();await frame();reversals.push({before,immediate,after:sample().width});
   }
   return {width,close,open,reversals,duration:getComputedStyle(shell).transitionDuration};
  });
  assert.ok(result.close.settled<=300,'Collapse settles within 300ms: '+result.close.settled);
  assert.ok(result.open.settled<=300,'Expansion settles within 300ms: '+result.open.settled);
  for(const run of [result.close,result.open]){
   assert.ok(run.frames.some(f=>f.width>57&&f.width<result.width-1),'Motion has intermediate geometry');
   for(const f of run.frames){assert.ok(Math.abs(f.icon.width-21)<.1);assert.ok(Math.abs(f.icon.height-21)<.1);}
  }
  for(const r of result.reversals)assert.ok(Math.abs(r.before-r.immediate)<1,'Reversal does not jump');
  await page.waitForTimeout(300);await state('expanded');
  await fs.writeFile(path.join(out,'motion-samples.json'),JSON.stringify(result,null,2));
 });
 await check('Destinations fade without tiny dots; visible shell and circle reopen reliably',async()=>{
  await load();
  const first=page.locator('.av-destinations .av-key').first(),menu=page.locator('.nav-menu-toggle'),shell=page.locator('.liquid-dock-shell');
  const initial=await first.boundingBox();
  await scroll(500);await page.waitForTimeout(200);
  const final=await first.evaluate(el=>({rect:el.getBoundingClientRect().toJSON(),opacity:getComputedStyle(el).opacity,visibility:getComputedStyle(el).visibility}));
  assert.ok(final.rect.width>=initial.width*.93,'Destinations never shrink to dots');
  assert.equal(final.opacity,'0');assert.equal(final.visibility,'hidden');
  assert.equal(await page.locator('.av-destinations').evaluate(el=>el.inert),true);
  assert.equal(await shell.evaluate(el=>getComputedStyle(el).pointerEvents),'none','Settled circle uses real Menu button');
  assert.equal(await menu.getAttribute('aria-label'),'Show navigation');
  await menu.click();await state('expanded');assert.equal(await page.locator('.liquid-menu').evaluate(el=>el.open),false);
  await page.waitForTimeout(250);
  // Freeze the currently visible shell with a real pointer press while it contracts.
  await page.evaluate(()=>window.scrollTo({top:560,behavior:'instant'}));
  await page.waitForFunction(()=>document.querySelector('.nav').dataset.compactDock==='collapsed');
  const box=await shell.boundingBox();const x=box.x+box.width/2,y=box.y+box.height/2;
  await page.mouse.move(x,y);await page.mouse.down();
  await page.waitForTimeout(35); // A CSS transition pause takes effect at the next frame.
  const held=await shell.boundingBox();await page.waitForTimeout(100);
  assert.ok(Math.abs((await shell.boundingBox()).width-held.width)<1,'Press freezes moving hit area');
  await page.mouse.up();await state('expanded');
  assert.equal(await page.locator('.liquid-menu').evaluate(el=>el.open),false,'Shell tap only expands');
  await page.waitForTimeout(250);await menu.click();assert.ok(await page.locator('.liquid-menu').evaluate(el=>el.open),'Next tap opens Menu');
  await page.keyboard.press('Escape');await page.waitForTimeout(250);
 });
 await check('Menu locking, Escape focus and appearance persistence',async()=>{
  await load();await page.locator('.nav-menu-toggle').click();assert.ok(await page.locator('.liquid-menu').evaluate(el=>el.open));
  await page.getByRole('tab',{name:'Appearance'}).click();await page.locator('[data-appearance="light"]').click();
  await page.locator('.av-solid input').check();await shot('mobile-day-menu');await page.keyboard.press('Escape');await page.waitForTimeout(250);await state('expanded');
  assert.equal(await page.evaluate(()=>document.activeElement.classList.contains('nav-menu-toggle')),true);
  await page.reload({waitUntil:'load'});assert.equal(await page.locator('html').getAttribute('data-suarez-theme'),'light');
  await scroll(500);await page.waitForTimeout(300);await shot('mobile-day-solid-circle');
  assert.equal(await page.locator('.liquid-dock-shell').evaluate(el=>getComputedStyle(el).backdropFilter),'none');
 });
 await check('Reduced motion and saved reader preference',async()=>{
  await page.waitForTimeout(300);await page.emulateMedia({reducedMotion:'reduce'});await load();await scroll(500);await state('collapsed');
  assert.equal(await page.locator('.liquid-dock-shell').evaluate(el=>getComputedStyle(el).transitionDuration),'0s');
  const reducedMenu=await page.locator('.nav-menu-toggle').boundingBox();
  const reducedKey=await page.locator('.av-destinations .av-key').first().evaluate(el=>el.getBoundingClientRect().toJSON());
  assert.ok(Math.abs(reducedMenu.width-56)<1&&Math.abs(reducedMenu.height-56)<1,'Reduced-motion Menu forms the circle');
  assert.ok(Math.abs(reducedMenu.x+reducedMenu.width/2-195)<1,'Reduced-motion Menu remains centered');
  assert.ok(reducedKey.width>=44,'Reduced-motion destinations retain their layout');
  assert.equal(await page.locator('.av-destinations .av-key').first().evaluate(el=>getComputedStyle(el).opacity),'0');
  assert.equal(await page.locator('.liquid-dock-shell').evaluate(el=>getComputedStyle(el).pointerEvents),'none');
  assert.equal(await page.locator('.av-destinations .av-key').first().evaluate(el=>getComputedStyle(el).visibility),'hidden');
  assert.equal(await page.locator('.av-destinations').evaluate(el=>el.inert),true);
  await page.waitForTimeout(300);await page.emulateMedia({reducedMotion:'no-preference'});
  await page.evaluate(()=>localStorage.setItem('suarez-cfi-reader-v1',JSON.stringify({motion:false})));await load('/');
  assert.equal(await page.locator('.nav').getAttribute('data-dock-motion'),'off');
  await page.evaluate(()=>localStorage.removeItem('suarez-cfi-reader-v1'));
 });
 await check('Toolbar resizing preserves scroll intent; canceled motion releases hit testing',async()=>{
  await load();await scroll(100);await state('expanded');
  await page.setViewportSize({width:390,height:790});await page.waitForTimeout(50);
  await scroll(128);await state('collapsed');
  await page.setViewportSize({width:390,height:844});await page.waitForTimeout(50);await state('collapsed');
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(60);
  assert.equal(await page.locator('.liquid-dock-shell').evaluate(el=>getComputedStyle(el).pointerEvents),'none');
  await page.locator('.nav-menu-toggle').click();await state('expanded');
  await page.emulateMedia({reducedMotion:'no-preference'});
  await scroll(0);await state('expanded');
  const bottom=await page.evaluate(()=>document.documentElement.scrollHeight-innerHeight);
  await scroll(bottom);await state('collapsed');
  await scroll(bottom+100);await state('collapsed');
  await scroll(bottom-8);await state('collapsed');
  await scroll(bottom-16);await state('expanded');
  await scroll(-100);await state('expanded');
 });
 await check('Keyboard viewport and rapid Menu activation retain focus and state',async()=>{
  await load('/');await scroll(500);await page.waitForTimeout(300);
  // Synthetic keyboard viewport: engine coverage, not a physical OS keyboard claim.
  await page.evaluate(()=>{
   const input=document.createElement('input');input.id='dock-keyboard-test';input.style.cssText='position:fixed;top:80px;left:12px';
   document.body.append(input);input.focus({preventScroll:true});
   Object.defineProperty(window.visualViewport,'height',{configurable:true,value:innerHeight-300});
   window.visualViewport.dispatchEvent(new Event('resize'));
  });
  await state('expanded');await scroll(600);await state('expanded');
  assert.equal(await page.evaluate(()=>document.activeElement.id),'dock-keyboard-test');
  await page.evaluate(()=>{document.querySelector('#dock-keyboard-test').remove();delete window.visualViewport.height;window.visualViewport.dispatchEvent(new Event('resize'));});
  await scroll(680);await state('collapsed');await page.waitForTimeout(300);
  await page.locator('.nav-menu-toggle').press('Enter');await state('expanded');
  await page.locator('.nav-menu-toggle').press('Enter');assert.ok(await page.locator('.liquid-menu').evaluate(el=>el.open));
  await page.keyboard.press('Escape');await page.waitForTimeout(250);await state('expanded');
  assert.equal(await page.evaluate(()=>document.activeElement.classList.contains('nav-menu-toggle')),true);
 });
 await check('Desktop, rotation, zoom and browser Back',async()=>{
  await page.setViewportSize({width:1440,height:900});await load();await scroll(500);await state('expanded');
  assert.equal(await page.locator('.nav-menu-toggle').getAttribute('aria-label'),'Menu');await shot('desktop');
  await page.setViewportSize({width:1024,height:768});await page.waitForTimeout(250);await scroll(650);await state('collapsed');await page.waitForTimeout(300);await shot('tablet-landscape');
  await page.setViewportSize({width:768,height:1024});await scroll(625);await state('expanded');
  await page.evaluate(()=>document.documentElement.style.fontSize='200%');await shot('zoom-200');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.goto(base+'/blog/');await page.goBack({waitUntil:'load'});await state('expanded');
 });
 await check('Representative routes preserve usable navigation',async()=>{
  await page.setViewportSize({width:390,height:844});
  for(const route of ['/','/learn/','/blog/','/tools/','/blog/private-pilot-cost-louisville-ky/','/simply-endorsed/blog/first-solo-endorsement/']){
   console.log("ROUTE",route);await load(route);assert.equal(await page.locator('.liquid-dock-items a[href="/learn/"]').count(),1);
   await scroll(500);await state('collapsed');await page.waitForTimeout(300);
   const menu=await page.locator('.nav-menu-toggle').boundingBox();
   await page.mouse.click(menu.x+menu.width/2,menu.y+menu.height/2);
   await state('expanded');
  }
 });
 await check('Day/Night responsive route matrix and usable target sizes',async()=>{
  const rows=[];
  await load('/');
  for(const appearance of ['day','dark']){
   await page.evaluate(value=>{localStorage.setItem('suarez-cfi-appearance',value);localStorage.setItem('suarez:solid-controls','false');},appearance);
   for(const width of [320,390,768,1024,1440]){
    for(const [name,route] of [['home','/'],['learn','/learn/weather-and-safety/how-to-read-a-taf/'],['blog','/blog/private-pilot-cost-louisville-ky/'],['tools','/tools/']]){
     console.log('MATRIX',name,width,appearance);
     const originalPage=page;page=await ctx.newPage();observeErrors(page);
     try {
     await page.setViewportSize({width,height:900});
     await load(route);const bounds=()=>page.evaluate(()=>document.querySelector('.nav').getBoundingClientRect().toJSON()),before=await bounds();
     const targets=await page.locator('.liquid-dock-items .av-key,.liquid-dock-items .nav-menu-toggle').evaluateAll(es=>es.filter(e=>getComputedStyle(e).display!=='none').map(e=>e.getBoundingClientRect().toJSON()));
     for(const r of targets)assert.ok(r.width>=44&&r.height>=44,'Visible targets remain at least 44px');
     assert.equal(await page.locator('html').getAttribute('data-gold-mode'),appearance);
     await shot(`${name}-${width}-${appearance}-expanded`);
     await scroll(500);await state(width<=1024?'collapsed':'expanded');await page.waitForTimeout(300);
     assert.deepEqual(await bounds(),before,'Dock keeps expanded document clearance');
     assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
     await shot(`${name}-${width}-${appearance}-scrolled`);
     rows.push({name,width,appearance,pass:true});
     } finally {await page.close();page=originalPage;await page.bringToFront();}
    }
   }
  }
  await fs.writeFile(path.join(out,'responsive-matrix.json'),JSON.stringify(rows,null,2));
  await page.setViewportSize({width:390,height:844});
 });
 await check('Press lock, rapid reversal, live reader motion and viewport contraction',async()=>{
  await page.setViewportSize({width:390,height:844});
  await load();await page.locator('.av-key').first().dispatchEvent('pointerdown');await scroll(500);await state('expanded');
  await page.evaluate(()=>window.dispatchEvent(new PointerEvent('pointercancel')));await scroll(560);await state('collapsed');
  await scroll(540);await state('expanded');await scroll(610);await state('collapsed');await page.waitForTimeout(300);
  await page.setViewportSize({width:390,height:430});await page.waitForTimeout(150);await state('collapsed');
  const rect=await page.locator('.nav').boundingBox();assert.ok(rect.y>=0&&rect.y+rect.height<=430);
  await page.setViewportSize({width:390,height:844});await scroll(0);await page.waitForTimeout(250);
  await page.locator('.journal-settings summary').click();await page.locator('[data-reader-motion][type="checkbox"]').uncheck();
  assert.equal(await page.locator('.nav').getAttribute('data-dock-motion'),'off');
  await page.locator('[data-reader-motion][type="checkbox"]').check();await page.waitForTimeout(50);
  assert.equal(await page.locator('.nav').getAttribute('data-dock-motion'),'on');
  await page.locator('.liquid-dock-items a[href="/learn/"]').click();await page.waitForURL('**/learn/');
  await page.waitForSelector('[data-compact-dock]');await page.goBack({waitUntil:'load'});await page.waitForSelector('[data-compact-dock]');
  await state('expanded');
 });
 await check('No JavaScript retains expanded destinations',async()=>{
  const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});const p=await nojs.newPage();await p.goto(base+'/learn/');
  assert.ok(await p.locator('.av-destinations a[href="/learn/"]').isVisible());assert.ok(await p.locator('.nav-links a[href="/blog/"]').isVisible());await nojs.close();
 });
 await check('No unexpected browser errors',async()=>assert.deepEqual(errors,[]));
 await fs.writeFile(path.join(out,'results.json'),JSON.stringify({base,engine:process.env.DOCK_ENGINE||'chromium',browserVersion:browser.version(),chromiumArgs:process.env.DOCK_ENGINE==='webkit'?[]:chromiumArgs,results,navigationAborts},null,2));await browser.close();
 if(results.some(r=>!r.pass))process.exitCode=1;
})();
