/* Run against a threaded preview with CERTGEN_URL. Uses fresh profiles.
   NODE_PATH must resolve Playwright; CERTGEN_ENGINE=webkit selects WebKit. */
const {chromium, webkit} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const engine = process.env.CERTGEN_ENGINE || 'chromium';
const base = process.env.CERTGEN_URL || 'http://127.0.0.1:8994';
const out = path.join(root, 'output/playwright/paste-buttons', engine);
const results = [], errors = [];
let page, ctx;

async function check(name, fn) {
  try { await fn(); results.push({name, pass:true}); console.log('PASS '+name); }
  catch (e) { results.push({name, pass:false, error:e.message}); console.log('FAIL '+name+': '+e.message); }
}
async function photoStep() {
  await page.goto(base+'/certificate-generator/', {waitUntil:'load'});
  await page.getByRole('radio', {name:'Private Pilot Certificate', exact:true}).click();
  await page.locator('#cgNextBtn').click();
  for (const [id, name] of [['cgStudentFirst','Sample'],['cgStudentLast','Student'],['cgInstructorFirst','Sample'],['cgInstructorLast','Instructor']]) await page.locator('#'+id).fill(name);
  await page.locator('#cgNextBtn').click();
  await page.locator('#cgUploadBtn').scrollIntoViewIfNeeded();
  await page.evaluate(()=>document.fonts.ready);
}
async function resetPhoto() {
  if (await page.locator('#cgCropper').evaluate(el=>el.classList.contains('is-open'))) await page.locator('#cgCropCancelBtn').click();
  await photoStep();
}
async function clipboard(mode) {
  await page.evaluate(mode=>{
    const canvas = document.createElement('canvas'); canvas.width=160; canvas.height=120;
    const c=canvas.getContext('2d'); c.fillStyle='#cba244'; c.fillRect(0,0,160,120);
    const bytes=Uint8Array.from(atob(canvas.toDataURL('image/png').split(',')[1]), ch=>ch.charCodeAt(0));
    window.__photoBlob=new Blob([bytes],{type:'image/png'});
    window.__reads=0; window.__activation=[];
    const item={types:['image/png'],getType:()=>Promise.resolve(window.__photoBlob)};
    Object.defineProperty(navigator,'clipboard',{configurable:true,value:mode==='unavailable'?{}:{read(){
      window.__reads++; window.__activation.push(navigator.userActivation?.isActive);
      if(mode==='throws') throw new DOMException('Denied','NotAllowedError');
      if(mode==='denied') return Promise.reject(new DOMException('Denied','NotAllowedError'));
      if(mode==='empty') return Promise.resolve([{types:['text/plain']}]);
      if(mode==='pending') return new Promise(resolve=>{window.__resolveRead=()=>resolve([item]);});
      if(mode==='decoding') return Promise.resolve([{types:['image/png'],getType:()=>new Promise(resolve=>{window.__resolveType=()=>resolve(window.__photoBlob);})}]);
      return Promise.resolve([item]);
    }}});
  },mode);
}
async function cropOpen() { await page.waitForFunction(()=>document.querySelector('#cgCropper').classList.contains('is-open')); }
async function pasteFile() {
  await page.evaluate(()=>{
    const dt=new DataTransfer(); dt.items.add(new File([window.__photoBlob],'sample.png',{type:'image/png'}));
    document.querySelector('#cgPasteCatcher').dispatchEvent(new ClipboardEvent('paste',{bubbles:true,cancelable:true,clipboardData:dt}));
  });
}
async function noFallback() {
  assert.equal(await page.locator('#cgPasteCatcher').evaluate(el=>el.classList.contains('is-paste-armed')),false);
  assert.equal(await page.locator('#cgPasteHint').evaluate(el=>el.hidden),true);
}
async function noCrop() { assert.equal(await page.locator('#cgCropper').evaluate(el=>el.classList.contains('is-open')),false); }

(async()=>{
  await fs.mkdir(out,{recursive:true});
  const browser=await (engine==='webkit'?webkit:chromium).launch({headless:true,...(engine==='chromium'?{executablePath:process.env.CERTGEN_CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}:{})});
  ctx=await browser.newContext({viewport:{width:393,height:852},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
  await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());
  await ctx.route('**/plausible.io/**',r=>r.abort());
  page=await ctx.newPage(); page.setDefaultTimeout(8000); page.on('pageerror',e=>errors.push(e.message));
  await photoStep();

  await check('Day/Night photo-row geometry, text and tap targets at 320–1440px and enlarged text',async()=>{
    const metrics=[];
    for(const colorScheme of ['light','dark']) for(const [width,font] of [[320,16],[353,16],[393,16],[480,16],[481,16],[768,16],[1440,16],[320,32],[393,32]]) {
      await page.setViewportSize({width,height:1000}); await page.emulateMedia({colorScheme});
      await page.evaluate(font=>{document.documentElement.style.fontSize=font+'px';},font);
      await page.locator('#cgUploadBtn').scrollIntoViewIfNeeded(); await page.mouse.move(0,0);
      const data=await page.evaluate(()=>{
        const rect=el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};
        return {width:innerWidth,documentWidth:document.documentElement.scrollWidth,buttons:[...document.querySelectorAll('.cg-photo-drop-btn')].map(b=>({id:b.id,rect:rect(b),icon:rect(b.querySelector('.cg-photo-drop-icon')),parts:[...b.querySelectorAll('.cg-photo-drop-text,.cg-photo-drop-text strong,.cg-photo-drop-text span')].map(rect),hit:[.2,.5,.8].map(p=>{const r=b.getBoundingClientRect();return document.elementFromPoint(r.x+r.width*p,r.y+r.height/2)?.closest('button')?.id;})}))};
      });
      assert.ok(data.documentWidth<=width+1,`page overflow at ${width}/${font}`);
      for(const b of data.buttons) {
        assert.ok(b.rect.height>=44 && b.rect.width>=44);
        assert.ok(Math.abs(b.icon.width-(width<=480?44:58))<1,'icon shrank');
        for(const p of b.parts) assert.ok(p.x>=b.rect.x-1 && p.right<=b.rect.right+1 && p.y>=b.rect.y-1 && p.bottom<=b.rect.bottom+1,`text outside ${b.id} at ${width}/${font}`);
      }
      const [a,b]=data.buttons;
      assert.ok(width<=480?a.rect.bottom<=b.rect.y:a.rect.right<=b.rect.x,'actions overlap');
      metrics.push({colorScheme,font,...data});
      if(font===16 && (width===393||width===1440)) await page.screenshot({path:path.join(out,`${width}-${colorScheme}.png`)});
      for(const b of data.buttons) {
        await page.locator('#'+b.id).scrollIntoViewIfNeeded();
        const hits=await page.locator('#'+b.id).evaluate(b=>[.2,.5,.8].map(p=>{const r=b.getBoundingClientRect();return document.elementFromPoint(r.x+r.width*p,r.y+r.height/2)?.closest('button')?.id;}));
        assert.ok(hits.every(id=>id===b.id),`wrong tap target for ${b.id} at ${width}/${font}: ${hits}`);
      }
    }
    await fs.writeFile(path.join(out,'geometry.json'),JSON.stringify(metrics,null,2));
  });
  await page.setViewportSize({width:393,height:852}); await page.evaluate(()=>{document.documentElement.style.fontSize='16px';});
  await page.emulateMedia({colorScheme:'light'});

  await check('Upload tap opens the image picker and loads a photo',async()=>{
    await resetPhoto(); await clipboard('success');
    const file=Buffer.from(await page.evaluate(async()=>Array.from(new Uint8Array(await window.__photoBlob.arrayBuffer()))));
    const chooser=page.waitForEvent('filechooser'); await page.locator('#cgUploadBtn').tap();
    await (await chooser).setFiles({name:'sample.png',mimeType:'image/png',buffer:file});
    await cropOpen(); await page.locator('#cgCropConfirmBtn').click();
    await page.locator('#cgPhotoReady').waitFor({state:'visible'});
  });
  await check('Paste reads inside the tap gesture, crops, confirms and enables download',async()=>{
    await resetPhoto(); await clipboard('success'); await page.locator('#cgPasteBtn').tap();
    await cropOpen(); assert.equal(await page.evaluate(()=>window.__reads),1);
    assert.ok(await page.evaluate(()=>window.__activation.every(v=>v===undefined||v===true)),'clipboard read lost activation');
    await page.locator('#cgCropConfirmBtn').click(); await page.locator('#cgPhotoReady').waitFor({state:'visible'}); await noFallback();
    assert.equal(await page.locator('#cgDownloadBtn').isEnabled(),true);
    const download=page.waitForEvent('download'); await page.locator('#cgDownloadBtn').click();
    const result=await download; assert.match(result.suggestedFilename(),/PrivatePilot_Sample_Student\.jpg$/);
  });
  await check('Ready-state Paste image replaces the photo and cancel preserves it',async()=>{
    await clipboard('success'); await page.locator('#cgPasteReplaceBtn').tap(); await cropOpen();
    await page.locator('#cgCropCancelBtn').click(); await page.locator('#cgPhotoReady').waitFor({state:'visible'});
  });
  await check('Empty clipboard reports a useful status without opening a crop dialog',async()=>{
    await resetPhoto(); await clipboard('empty'); await page.locator('#cgPasteBtn').tap();
    await page.waitForFunction(()=>document.querySelector('#cgStatus').textContent.includes('No image on your clipboard'));
    await noCrop(); await noFallback();
  });
  for(const mode of ['unavailable','denied','throws']) await check(mode+' clipboard shows a reachable manual image-paste fallback',async()=>{
    await resetPhoto(); await clipboard(mode); await page.locator('#cgPasteBtn').tap();
    await page.waitForFunction(()=>document.querySelector('#cgPasteCatcher').classList.contains('is-paste-armed'));
    const target=await page.locator('#cgPasteCatcher').evaluate(el=>{
      const r=el.getBoundingClientRect(); return {focused:document.activeElement===el,width:r.width,height:r.height,hit:document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('#cgPasteCatcher')===el};
    });
    await page.screenshot({path:path.join(out,mode+'-fallback.png')});
    assert.ok(target.focused&&target.hit&&target.width>=44&&target.height>=44,JSON.stringify(target));
    await pasteFile(); await cropOpen(); await noFallback(); await page.locator('#cgCropCancelBtn').click();
  });
  await check('Repeated denied taps keep a single fallback; Escape dismisses it',async()=>{
    await clipboard('denied'); for(let i=0;i<3;i++) await page.locator('#cgPasteBtn').tap();
    await page.waitForFunction(()=>document.querySelector('#cgPasteCatcher').classList.contains('is-paste-armed'));
    assert.equal(await page.locator('#cgPasteCatcher.is-paste-armed').count(),1);
    await page.keyboard.press('Escape'); await noFallback(); await noCrop();
  });
  await check('Leaving the Photo step dismisses the manual fallback on touch navigation and Back',async()=>{
    await clipboard('denied'); await page.locator('#cgPasteBtn').tap();
    await page.waitForFunction(()=>document.querySelector('#cgPasteCatcher').classList.contains('is-paste-armed'));
    await page.getByRole('button',{name:'Review',exact:true}).tap(); await noFallback();
    await page.goBack(); await page.locator('#cgPasteBtn').waitFor({state:'visible'});
    await page.locator('#cgPasteBtn').tap(); await page.waitForFunction(()=>document.querySelector('#cgPasteCatcher').classList.contains('is-paste-armed'));
    await page.goBack(); await noFallback();
  });
  await check('Repeated taps during a pending read produce one crop dialog',async()=>{
    await resetPhoto(); await clipboard('pending'); await page.locator('#cgPasteBtn').tap(); await page.locator('#cgPasteBtn').tap();
    assert.equal(await page.evaluate(()=>window.__reads),1,'duplicate clipboard reads');
    await page.evaluate(()=>window.__resolveRead()); await cropOpen(); await page.locator('#cgCropCancelBtn').click();
  });
  await check('A clipboard read completing after step navigation stays dismissed',async()=>{
    await resetPhoto(); await clipboard('pending'); await page.locator('#cgPasteBtn').tap();
    await page.getByRole('button',{name:'Review',exact:true}).tap();
    await page.evaluate(()=>window.__resolveRead()); await page.waitForTimeout(300); await noCrop(); await noFallback();
  });
  await check('An image representation completing after navigation stays dismissed',async()=>{
    await resetPhoto(); await clipboard('decoding'); await page.locator('#cgPasteBtn').tap();
    await page.waitForFunction(()=>typeof window.__resolveType==='function');
    await page.getByRole('button',{name:'Review',exact:true}).tap();
    await page.evaluate(()=>window.__resolveType()); await page.waitForTimeout(300); await noCrop(); await noFallback();
  });
  await check('Manual paste decoding after navigation stays dismissed',async()=>{
    await resetPhoto(); await clipboard('unavailable');
    await page.evaluate(()=>{
      window.__originalBitmap=window.createImageBitmap;
      window.createImageBitmap=(...args)=>new Promise(resolve=>{window.__resolveBitmap=async()=>resolve(await window.__originalBitmap(...args));});
    });
    await page.locator('#cgPasteBtn').tap(); await pasteFile();
    await page.waitForFunction(()=>typeof window.__resolveBitmap==='function');
    await page.getByRole('button',{name:'Review',exact:true}).tap();
    await page.evaluate(()=>window.__resolveBitmap()); await page.waitForTimeout(300); await noCrop(); await noFallback();
    await page.evaluate(()=>{window.createImageBitmap=window.__originalBitmap;});
  });
  await check('Escape cancels a pending clipboard read',async()=>{
    await resetPhoto(); await clipboard('pending'); await page.locator('#cgPasteBtn').tap();
    await page.keyboard.press('Escape'); await page.evaluate(()=>window.__resolveRead());
    await page.waitForTimeout(300); await noCrop(); await noFallback();
  });
  await check('Switching to Upload cancels a pending clipboard read',async()=>{
    await resetPhoto(); await clipboard('pending'); await page.locator('#cgPasteBtn').tap();
    const chooser=page.waitForEvent('filechooser'); await page.locator('#cgUploadBtn').tap(); await (await chooser).setFiles([]);
    await page.evaluate(()=>window.__resolveRead()); await page.waitForTimeout(300); await noCrop(); await noFallback();
  });
  await check('Desktop keyboard paste, file picker, crop and image export remain usable',async()=>{
    ctx=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
    await ctx.route('**/fonts.googleapis.com/**',r=>r.abort()); await ctx.route('**/plausible.io/**',r=>r.abort());
    page=await ctx.newPage(); page.setDefaultTimeout(8000); page.on('pageerror',e=>errors.push(e.message));
    await photoStep(); await clipboard('success'); await page.locator('#cgPasteBtn').focus(); await page.keyboard.press('Enter');
    await cropOpen(); await page.locator('#cgCropCancelBtn').click();
    const chooser=page.waitForEvent('filechooser'); await page.locator('#cgUploadBtn').click();
    const file=Buffer.from(await page.evaluate(async()=>Array.from(new Uint8Array(await window.__photoBlob.arrayBuffer()))));
    await (await chooser).setFiles({name:'sample.png',mimeType:'image/png',buffer:file});
    await cropOpen(); await page.locator('#cgCropConfirmBtn').click();
    const download=page.waitForEvent('download'); await page.locator('#cgDownloadBtn').click();
    const result=await download; assert.match(result.suggestedFilename(),/\.jpg$/);
    await fs.writeFile(path.join(out,'desktop-export.jpg'),await fs.readFile(await result.path()));
    await page.screenshot({path:path.join(out,'desktop-photo-ready.png')});
  });
  await check('No unexpected browser errors',async()=>assert.deepEqual(errors,[]));
  await fs.writeFile(path.join(out,'results.json'),JSON.stringify({engine,results,errors},null,2));
  await browser.close();
  if(results.some(r=>!r.pass)) process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
