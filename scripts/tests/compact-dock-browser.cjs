/* Real-browser contract tests. Run with DOCK_URL to verify a deployed release. */
const {chromium,webkit} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const root = path.resolve(__dirname,'../..');
const base = process.env.DOCK_URL || 'http://127.0.0.1:8970';
const out = path.join(root,'output/compact-dock'+(process.env.DOCK_ENGINE==='webkit'?'-webkit':''));
const results = [];
(async()=>{
 await fs.mkdir(out,{recursive:true});
 const browser = process.env.DOCK_ENGINE === 'webkit' ? await webkit.launch({headless:true}) : await chromium.launch({headless:true});
 const ctx = await browser.newContext({viewport:{width:390,height:844}});
 await ctx.addInitScript(() => {
  // Wait for native cross-document transitions before measuring a new page.
  addEventListener('pagereveal', event => {
   if(event.viewTransition){ event.viewTransition.ready.catch(()=>{}); window.__dockTransition = event.viewTransition.finished.catch(()=>{}); }
  });
 });
 const page = await ctx.newPage(); const errors=[], navigationAborts=[]; page.on('pageerror',e=>{
  // Chromium reports native view-transition cancellation on Back. Reproduced
  // against the unchanged pre-dock release; retain it in the report, not as an app failure.
  if(e.name==='AbortError' && /^(Transition was skipped|Transition was aborted because of invalid state\. ViewTransition opt-in disabled)$/.test(e.message)) navigationAborts.push(e.message);
  else errors.push(e.message);
 });
 await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());
 await ctx.route('**/plausible.io/**',r=>r.abort());
 async function load(route='/learn/weather-and-safety/how-to-read-a-taf/') {await page.goto(base+route,{waitUntil:'load'});await page.waitForSelector('[data-compact-dock]',{state:'attached'});await page.evaluate(async()=>{await document.fonts.ready;await window.__dockTransition;});await page.waitForFunction(()=>{const n=document.querySelector('[data-compact-dock]');return n&&getComputedStyle(n).position==='relative'&&(innerWidth>1024||getComputedStyle(n.querySelector('.liquid-dock-shell')).position==='absolute');});await page.waitForTimeout(250);}
 async function scroll(y) {await page.evaluate(y=>window.scrollTo({top:y,behavior:'instant'}),y);await page.waitForTimeout(100);}
 async function state(expected) {assert.equal(await page.locator('.nav').getAttribute('data-compact-dock'),expected);}
 async function check(name,fn) {try{await fn();results.push({name,pass:true});console.log('PASS',name);}catch(e){results.push({name,pass:false,error:e.message});console.log('FAIL',name,e.message);console.log(await page.evaluate(()=>({url:location.href,ready:document.readyState,width:innerWidth,nav:document.querySelector('.nav')?.outerHTML.slice(0,200),css:document.querySelector('.nav')&&getComputedStyle(document.querySelector('.nav')).cssText}))); }}
 async function shot(name){await page.screenshot({path:path.join(out,name+'.png')});}
 await check('Responsive open/circle geometry and no overflow',async()=>{
  for(const width of [320,390,600,768,834,1024]){
   await page.setViewportSize({width,height:width>600?1194:844});await load();await state('expanded');
   const expanded=await page.locator('.nav').boundingBox();
   assert.ok(expanded.width<=width-24,`viewport ${width}, dock ${expanded.width}`); assert.ok(expanded.height>=56);
   await shot(width+'-expanded'); await scroll(500);await state('collapsed');await page.waitForTimeout(550);
   const circle=await page.locator('.liquid-dock-show').boundingBox();
   assert.equal(circle.width,56);assert.equal(circle.height,56);assert.ok(Math.abs(circle.x+28-width/2)<1);
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
  await scroll(250);await state('collapsed');await page.waitForTimeout(200);await page.locator('.liquid-dock-show').click();await state('expanded');
  await scroll(270);await state('expanded');await scroll(310);await state('collapsed');
  assert.equal(await page.locator('.liquid-dock-items').evaluate(el=>el.inert),true);
  await page.keyboard.press('Tab');await page.locator('.liquid-dock-show').focus();await page.keyboard.press('Enter');await state('expanded');
  assert.equal(await page.evaluate(()=>document.activeElement.getAttribute('aria-current')),'page');
  await scroll(500);await state('expanded');
  await page.evaluate(()=>document.activeElement.blur());await scroll(600);await state('collapsed');
  await scroll(575);await scroll(650);await scroll(625);await state('expanded');
 });
 await check('Menu locking, Escape focus and appearance persistence',async()=>{
  await load();await page.locator('.nav-menu-toggle').click();assert.ok(await page.locator('.liquid-menu').evaluate(el=>el.open));
  await page.getByRole('tab',{name:'Appearance'}).click();await page.locator('[data-appearance="light"]').click();
  await page.locator('.av-solid input').check();await shot('mobile-day-menu');await page.keyboard.press('Escape');await page.waitForTimeout(250);await state('expanded');
  assert.equal(await page.evaluate(()=>document.activeElement.classList.contains('nav-menu-toggle')),true);
  await page.reload({waitUntil:'load'});assert.equal(await page.locator('html').getAttribute('data-suarez-theme'),'light');
  await scroll(500);await page.waitForTimeout(550);await shot('mobile-day-solid-circle');
  assert.equal(await page.locator('.liquid-dock-shell').evaluate(el=>getComputedStyle(el).backdropFilter),'none');
 });
 await check('Reduced motion and saved reader preference',async()=>{
  await page.waitForTimeout(300);await page.emulateMedia({reducedMotion:'reduce'});await load();await scroll(500);await state('collapsed');
  assert.equal(await page.locator('.liquid-dock-shell').evaluate(el=>getComputedStyle(el).transitionDuration),'0s');
  await page.waitForTimeout(300);await page.emulateMedia({reducedMotion:'no-preference'});
  await page.evaluate(()=>localStorage.setItem('suarez-cfi-reader-v1',JSON.stringify({motion:false})));await load('/');
  assert.equal(await page.locator('.nav').getAttribute('data-dock-motion'),'off');
  await page.evaluate(()=>localStorage.removeItem('suarez-cfi-reader-v1'));
 });
 await check('Desktop, rotation, zoom and browser Back',async()=>{
  await page.setViewportSize({width:1440,height:900});await load();await scroll(500);await state('expanded');
  assert.equal(await page.locator('.liquid-dock-show').isVisible(),false);await shot('desktop');
  await page.setViewportSize({width:1024,height:768});await page.waitForTimeout(250);await scroll(650);await state('collapsed');await shot('tablet-landscape');
  await page.setViewportSize({width:768,height:1024});await scroll(625);await state('expanded');
  await page.evaluate(()=>document.documentElement.style.fontSize='200%');await shot('zoom-200');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.goto(base+'/blog/');await page.goBack({waitUntil:'load'});await state('expanded');
 });
 await check('Representative routes preserve usable navigation',async()=>{
  await page.setViewportSize({width:390,height:844});
  for(const route of ['/','/learn/','/blog/','/tools/','/blog/private-pilot-cost-louisville-ky/','/simply-endorsed/blog/first-solo-endorsement/']){
   console.log("ROUTE",route);await load(route);assert.equal(await page.locator('.liquid-dock-items a[href="/learn/"]').count(),1);
   await scroll(500);await state('collapsed');await page.waitForTimeout(550);await page.locator('.liquid-dock-show').click();await state('expanded');
  }
 });
 await check('Press lock, rapid reversal, live reader motion and viewport contraction',async()=>{
  await load();await page.locator('.av-key').first().dispatchEvent('pointerdown');await scroll(500);await state('expanded');
  await page.evaluate(()=>window.dispatchEvent(new PointerEvent('pointercancel')));await scroll(560);await state('collapsed');
  await scroll(540);await state('expanded');await scroll(610);await state('collapsed');await page.waitForTimeout(550);
  await page.setViewportSize({width:390,height:430});await page.waitForTimeout(150);await state('expanded');
  const rect=await page.locator('.nav').boundingBox();assert.ok(rect.y>=0&&rect.y+rect.height<=430);
  await page.setViewportSize({width:390,height:844});await scroll(0);
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
 await fs.writeFile(path.join(out,'results.json'),JSON.stringify({base,engine:process.env.DOCK_ENGINE||'chromium',results,navigationAborts},null,2));await browser.close();
 if(results.some(r=>!r.pass))process.exitCode=1;
})();
