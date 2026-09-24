const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');
const root=path.resolve(__dirname,'../..');
test('endorsement cache precaches final shared assets and retires only its own versions',async()=>{
 const events={},removed=[],added=[];let work;
 const context={URL,Promise,self:{location:{origin:'https://suarezcfi.com'},addEventListener:(name,fn)=>events[name]=fn,skipWaiting:async()=>{},clients:{claim:async()=>{}}},caches:{open:async()=>({addAll:async urls=>added.push(...urls)}),keys:async()=>['simply-endorsed-v40','pilotsolve-site-other'],delete:async key=>removed.push(key)}};
 vm.runInNewContext(fs.readFileSync(path.join(root,'simply-endorsed/sw.js'),'utf8'),context);
 events.install({waitUntil:p=>work=p});await work;
 for(const name of ['appearance.js','avionics.css','site-nav.js','tactile.js'])assert(added.some(url=>url.startsWith('/assets/'+name+'?v=')));
 for(const url of added){const p=url.startsWith('/')?path.join(root,url):path.join(root,'simply-endorsed',url);assert(fs.existsSync(p.split('?')[0]),url);}
 events.activate({waitUntil:p=>work=p});await work;assert.deepEqual(removed,['simply-endorsed-v40']);
});
test('archived engine deep links return to the engine collection without changing runtime bytes',()=>{
 const location={href:'https://suarezcfi.com/engine-explorer/app/?category=flight-instruments&item=six-pack#explore'};let replaced;
 vm.runInNewContext(fs.readFileSync(path.join(root,'engine-explorer/app/assets/avionics-boundary.js'),'utf8'),{URL,window:{location,history:{state:{},replaceState:(_a,_b,url)=>replaced=url}}});
 assert.equal(replaced.searchParams.get('category'),'engines');assert.equal(replaced.searchParams.get('item'),null);assert.equal(replaced.hash,'');
});
