/* Real file decoding, with controlled clipboard MIME variants. */
const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path');
const root=path.resolve(__dirname,'../..'), fixtures=path.join(__dirname,'fixtures/certgen-images');
const engine=process.env.CERTGEN_ENGINE||'chromium',base=process.env.CERTGEN_URL||'http://127.0.0.1:8994';
const results=[], errors=[], network=[];let page;
async function check(name,run){try{await run();results.push({name,pass:true});console.log('PASS '+name);}catch(e){results.push({name,pass:false,error:e.message});console.log('FAIL '+name+': '+e.message);}}
async function file(name,type){return {name,type,bytes:Array.from(await fs.readFile(path.join(fixtures,name)))};}
async function decode(input){return page.evaluate(async input=>{
 const blob=new File([new Uint8Array(input.bytes)],input.name,{type:input.type||''});
 try{
  const result=await CertgenPhoto.prepare(blob).promise;
  const img=new Image();img.src=result.dataURL;await img.decode();const c=document.createElement('canvas');c.width=img.width;c.height=img.height;c.getContext('2d').drawImage(img,0,0);
  const pixel=(x,y)=>Array.from(c.getContext('2d').getImageData(x,y,1,1).data);
  return {ok:true,width:result.width,height:result.height,format:result.format,decoder:result.decoder,first:pixel(10,10),last:pixel(img.width-10,img.height-10)};
 }catch(e){return {ok:false,code:e.code,message:e.message};}
},input);}
async function photoStep(){
 await page.goto(base+'/certificate-generator/',{waitUntil:'load'});
 await page.getByRole('radio',{name:'Private Pilot Certificate',exact:true}).click();await page.locator('#cgNextBtn').click();
 for(const [id,v] of [['cgStudentFirst','Sample'],['cgStudentLast','Student'],['cgInstructorFirst','Sample'],['cgInstructorLast','Instructor']])await page.locator('#'+id).fill(v);
 await page.locator('#cgNextBtn').click();
}
async function mockClipboard(items){await page.evaluate(items=>{
 Object.defineProperty(navigator,'clipboard',{configurable:true,value:{read(){window.__readActivation=navigator.userActivation?.isActive;return Promise.resolve(items.map(item=>({types:[item.type],getType:()=>Promise.resolve(new Blob([item.text||new Uint8Array(item.bytes)],{type:item.type}))})));}}});
},items);}
async function crop(){await page.waitForFunction(()=>document.querySelector('#cgCropper').classList.contains('is-open'));await page.locator('#cgCropCancelBtn').click();}
(async()=>{
 const out=path.join(root,'output/playwright/image-formats',process.env.CERTGEN_RUN||'local',engine);await fs.mkdir(out,{recursive:true});
 const browser=await(engine==='webkit'?webkit:chromium).launch({headless:true,...(engine==='chromium'?{executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}:{})});
 const ctx=await browser.newContext({viewport:{width:393,height:852},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
 await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());await ctx.route('**/plausible.io/**',r=>r.abort());
 page=await ctx.newPage();page.setDefaultTimeout(12000);page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>network.push({url:r.url(),method:r.method()}));await photoStep();
 const support=[];
 for(const name of ['sample.jpg','sample.png','sample.webp','sample.gif','sample.bmp','sample.avif','sample.heic'])await check('Valid '+name+' decodes from signature with generic MIME',async()=>{
  const r=await decode(await file(name,'application/octet-stream'));support.push({name,...r});assert.equal(r.ok,true,JSON.stringify(r));assert.equal(r.width,240);assert.equal(r.height,160);assert.ok(r.first[0]>180&&r.first[1]<80&&r.first[2]<80);assert.ok(r.last[2]>170&&r.last[0]<80);
 });
 await check('TIFF is native-browser-dependent with an actionable fallback',async()=>{
  const r=await decode(await file('sample.tiff','image/tiff'));support.push({name:'sample.tiff',...r});if(r.ok){assert.equal(r.width,240);assert.equal(r.height,160);}else assert.match(r.message,/Photos|JPEG|PNG/);
 });
 await check('JPEG EXIF orientation produces an upright portrait',async()=>{
  const r=await decode(await file('oriented.jpg','image/jpeg'));assert.equal(r.ok,true);assert.equal(r.width,160);assert.equal(r.height,240);assert.ok(r.first[0]>180&&r.last[1]>150,JSON.stringify(r));
 });
 await check('PNG transparency becomes white rather than black in JPEG output',async()=>{
  const r=await decode(await file('transparent.png','image/png'));assert.equal(r.ok,true);assert.ok(r.first.slice(0,3).every(v=>v>245));
 });
 await check('A large valid photo is resized to the bounded crop input',async()=>{
  const r=await decode(await file('large.jpg','image/jpeg'));assert.equal(r.ok,true);assert.equal(r.width,2400);assert.equal(r.height,1600);
 });
 await check('HEIF fallback decodes real still/rotated/alpha/multiple-image fixtures',async()=>{
  await page.evaluate(()=>{
   window.__bitmap=createImageBitmap;window.__Image=Image;window.createImageBitmap=()=>Promise.reject(new Error('force native unsupported'));
   window.Image=function(){const img=new window.__Image();const d=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'src');Object.defineProperty(img,'src',{get(){return d.get.call(this);},set(value){if(value.startsWith('blob:'))queueMicrotask(()=>this.onerror());else d.set.call(this,value);}});return img;};
  });
  for(const name of ['sample.heic','oriented.heic','transparent.heic','multiple.heic','ten-bit.heic']){
   const r=await decode(await file(name,'image/heif'));assert.equal(r.ok,true,JSON.stringify(r));assert.equal(r.decoder,'libheif');
   assert.equal(r.width,name==='oriented.heic'?160:240);assert.equal(r.height,name==='oriented.heic'?240:160);
   if(name==='transparent.heic')assert.ok(r.first.slice(0,3).every(v=>v>240),JSON.stringify(r));
   if(name==='multiple.heic')assert.ok(r.first[0]>180&&r.first[1]<80,'secondary image chosen');
   if(name==='oriented.heic')assert.ok(r.first[0]>180&&r.last[1]>150,JSON.stringify(r));
  }
  await page.evaluate(()=>{window.createImageBitmap=window.__bitmap;window.Image=window.__Image;});
 });
 await check('Truncated/corrupt and spoofed non-image content fail safely',async()=>{
  for(const input of [{name:'fake.png',type:'image/png',bytes:[60,115,99,114,105,112,116,62]},{...(await file('sample.heic','image/heic')),bytes:(await file('sample.heic','image/heic')).bytes.slice(0,200)}]){const r=await decode(input);assert.equal(r.ok,false);assert.match(r.message,/photo|JPEG|Photos|still/);}
 });
 await check('File and pixel limits reject oversized input before decode',async()=>{
  const size=await page.evaluate(async()=>{try{await CertgenPhoto.prepare(new Blob([new Uint8Array(CertgenPhoto.limits.bytes+1)],{type:'image/jpeg'})).promise;return null;}catch(e){return e.code;}});assert.equal(size,'size');
  const input=await file('sample.png','image/png');const bytes=Buffer.from(input.bytes);bytes.writeUInt32BE(13000,16);input.bytes=Array.from(bytes);assert.equal((await decode(input)).code,'dimensions');
 });
 await check('RAW and Live Photo video-only input explain the still-image fallback',async()=>{
  const raw=await file('sample.tiff','image/x-adobe-dng');raw.name='camera.dng';assert.match((await decode(raw)).message,/RAW/);
  const r=await decode({name:'live.mov',type:'video/quicktime',bytes:[0,0,0,20,102,116,121,112,113,116,32,32,0,0,0,0,113,116,32,32]});assert.equal(r.ok,false);assert.match(r.message,/Live Photo/);
 });
 await check('HEIC uploads and octet-stream/Apple HEIC clipboard variants open the cropper',async()=>{
  await page.locator('#cgFileInput').setInputFiles(path.join(fixtures,'sample.heic'));await crop();
  for(const type of ['image/heic','image/heif','image/x-heic','web image/heic','public.heic','public.heif','com.apple.heic','application/octet-stream']){
   const item=await file('sample.heic',type);await mockClipboard([item]);await page.locator('#cgPasteBtn').tap();await crop();assert.ok(await page.evaluate(()=>__readActivation===undefined||__readActivation===true));
  }
 });
 await check('A corrupt preferred representation falls through to valid HEIC',async()=>{
  await mockClipboard([{type:'image/png',bytes:[1,2,3,4]},await file('sample.heic','image/heic')]);await page.locator('#cgPasteBtn').tap();await crop();
 });
 await check('Manual paste accepts a HEIC file with empty MIME',async()=>{
  const input=await file('sample.heic','');await page.evaluate(input=>{const dt=new DataTransfer();dt.items.add(new File([new Uint8Array(input.bytes)],'photo.heic',{type:''}));document.dispatchEvent(new ClipboardEvent('paste',{clipboardData:dt,bubbles:true,cancelable:true}));},input);await crop();
 });
 await check('Inline clipboard image bytes work; remote clipboard HTML is never fetched',async()=>{
  const png=await fs.readFile(path.join(fixtures,'sample.png'));
  await mockClipboard([{type:'text/html',text:'<img src="data:image/png;base64,'+png.toString('base64')+'">'}]);await page.locator('#cgPasteBtn').tap();await crop();
  await mockClipboard([{type:'text/html',text:'<img src="https://example.invalid/private-photo.png" onerror="window.__executed=true">'}]);await page.locator('#cgPasteBtn').tap();await page.waitForFunction(()=>document.querySelector('#cgStatus').textContent.includes('did not provide image data'));
  assert.equal(await page.evaluate(()=>window.__executed),undefined);assert.ok(!network.some(r=>r.url.includes('example.invalid')));
 });
 await check('Cancellation terminates an in-progress decoder worker',async()=>{
  await page.route('**/heif-worker.js*',async route=>{await new Promise(r=>setTimeout(r,350));await route.continue();});
  const r=await page.evaluate(async input=>{
   const original=createImageBitmap,OriginalImage=Image;window.createImageBitmap=()=>Promise.reject(new Error('unsupported'));
   window.Image=function(){const img=new OriginalImage();const d=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'src');Object.defineProperty(img,'src',{get(){return d.get.call(this);},set(value){if(value.startsWith('blob:'))queueMicrotask(()=>this.onerror());else d.set.call(this,value);}});return img;};
   const job=CertgenPhoto.prepare(new Blob([new Uint8Array(input.bytes)],{type:'image/heic'}));setTimeout(job.cancel,50);
   try{await job.promise;return 'wrong';}catch(e){return e.code;}finally{window.createImageBitmap=original;window.Image=OriginalImage;}
  },await file('sample.heic','image/heic'));
  assert.equal(r,'cancelled');
  await page.unroute('**/heif-worker.js*');
 });
 await check('A blocked local decoder gives an actionable fallback',async()=>{
  const r=await page.evaluate(async input=>{
   const original=createImageBitmap,OriginalImage=Image,OriginalWorker=Worker;window.createImageBitmap=()=>Promise.reject(new Error('unsupported'));
   window.Image=function(){const img=new OriginalImage();const d=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'src');Object.defineProperty(img,'src',{get(){return d.get.call(this);},set(value){if(value.startsWith('blob:'))queueMicrotask(()=>this.onerror());else d.set.call(this,value);}});return img;};
   window.Worker=function(){throw new Error('Worker blocked');};
   try{await CertgenPhoto.prepare(new Blob([new Uint8Array(input.bytes)],{type:'image/heic'})).promise;return null;}catch(e){return {code:e.code,message:e.message};}finally{window.createImageBitmap=original;window.Image=OriginalImage;window.Worker=OriginalWorker;}
  },await file('sample.heic','image/heic'));
  assert.equal(r.code,'decoder');assert.match(r.message,/JPEG.*Photos.*upload/i);
 });
 await check('Image intake sends no photo network requests and raises no page errors',async()=>{
  assert.ok(network.every(r=>r.method==='GET'),JSON.stringify(network.filter(r=>r.method!=='GET')));assert.deepEqual(errors,[]);
 });
 await fs.writeFile(path.join(out,'results.json'),JSON.stringify({engine,results,support,errors,network},null,2));await browser.close();if(results.some(r=>!r.pass))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
