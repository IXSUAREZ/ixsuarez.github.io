const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../../pilotsolve/sw.js'),'utf8');
function harness(network){
 const events={},saved=new Map(),calls=[];
 const key=r=>typeof r==='string'?r:r.url;
 const cache={
  match:async(r,options={})=>{const url=key(r);if(saved.has(url))return saved.get(url);if(options.ignoreSearch)return [...saved].find(([k])=>k.split('?')[0]===url.split('?')[0])?.[1];},
  put:async(r,response)=>saved.set(key(r),response)
 };
 vm.runInNewContext(source,{URL,Response,Promise,self:{location:{origin:'https://suarezcfi.com'},addEventListener:(name,fn)=>events[name]=fn},caches:{open:async()=>cache},fetch:async r=>{calls.push(r.url);return network(r);}});
 return {saved,calls,request:async(url,mode='cors',method='GET')=>{let result;events.fetch({request:{url,mode,method},respondWith:p=>result=p});return result;}};
}
test('online navigation and versioned theme refresh stale responses',async()=>{
 const h=harness(async()=>new Response('current'));
 for(const [url,mode] of [['https://suarezcfi.com/pilotsolve/','navigate'],['https://suarezcfi.com/assets/avionics.css?v=new','cors']]){
  h.saved.set(url,new Response('old'));
  assert.equal(await(await h.request(url,mode)).text(),'current');
  assert.equal(await h.saved.get(url).clone().text(),'current');
 }
 assert.equal(h.calls.length,2);
});
test('offline theme uses exact version before query-independent fallback',async()=>{
 const h=harness(async()=>{throw Error('offline');});
 h.saved.set('https://suarezcfi.com/assets/avionics.css',new Response('precache'));
 h.saved.set('https://suarezcfi.com/assets/avionics.css?v=new',new Response('exact'));
 assert.equal(await(await h.request('https://suarezcfi.com/assets/avionics.css?v=new')).text(),'exact');
 assert.equal(await(await h.request('https://suarezcfi.com/assets/avionics.css?v=other')).text(),'precache');
 h.saved.set('./index.html',new Response('offline shell'));
 assert.equal(await(await h.request('https://suarezcfi.com/pilotsolve/?tool=wind','navigate')).text(),'offline shell');
});
test('hashed bundles stay cache-first and new bundles are retained offline',async()=>{
 const h=harness(async()=>new Response('new bundle'));
 const old='https://suarezcfi.com/pilotsolve/assets/existing.js';h.saved.set(old,new Response('cached'));
 assert.equal(await(await h.request(old)).text(),'cached');assert.equal(h.calls.length,0);
 const fresh='https://suarezcfi.com/pilotsolve/assets/new.js';assert.equal(await(await h.request(fresh)).text(),'new bundle');assert(h.saved.has(fresh));
});
test('worker leaves other apps, origins and non-GET requests untouched',async()=>{
 const h=harness(async()=>{throw Error('must not fetch');});
 assert.equal(await h.request('https://suarezcfi.com/aero-lab/'),undefined);
 assert.equal(await h.request('https://example.com/pilotsolve/'),undefined);
 assert.equal(await h.request('https://suarezcfi.com/pilotsolve/','cors','POST'),undefined);
});
