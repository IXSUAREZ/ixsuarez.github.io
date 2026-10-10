const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '../..');
const guide = path.join(root, 'flight-lesson-guide');

test('public gateway publishes no curriculum, PDFs or teaching runtime', () => {
  for (const item of ['data', 'downloads', 'BUILD.json', 'manifest.webmanifest']) assert.equal(fs.existsSync(path.join(guide,item)),false);
  const html=fs.readFileSync(path.join(guide,'index.html'),'utf8');
  const app=fs.readFileSync(path.join(guide,'app.js'),'utf8');
  assert.match(html,/This guide is private/);
  assert.doesNotMatch(html,/id="flight-guide-app"|data\/courses\.json|downloads\/.*\.pdf/);
  assert.doesNotMatch(app,/FlightLessonGuideModel|validatePayload|timingPlan|BOOTSTRAP_HASH|setup=/);
  const config=JSON.parse(fs.readFileSync(path.join(root,'config/site-pages.json'),'utf8'));
  assert.equal(config.pages.find(p=>p.path==='/flight-lesson-guide/').indexable,false);
  const catalog=JSON.parse(fs.readFileSync(path.join(root,'config/tool-catalog.json'),'utf8'));
  assert.equal(catalog.tools.some(t=>t.id==='flight-lesson-guide'),false);
});

test('retirement worker clears only guide caches and navigates only its own pages',async()=>{
  const handlers={},deleted=[],navigated=[];let unregistered=0,skipped=0;
  const sandbox={URL,Promise,self:{location:{origin:'https://suarezcfi.com'},skipWaiting:async()=>{skipped++},addEventListener:(name,fn)=>{handlers[name]=fn},registration:{unregister:async()=>{unregistered++}},clients:{claim:async()=>{},matchAll:async()=>[
    {url:'https://suarezcfi.com/flight-lesson-guide/#course=sport',navigate:async v=>navigated.push(v)},
    {url:'https://suarezcfi.com/pilotsolve/',navigate:async()=>assert.fail('unrelated app navigated')},
    {url:'https://other.test/flight-lesson-guide/',navigate:async()=>assert.fail('other origin navigated')}
  ]}},caches:{keys:async()=>['flight-lesson-guide-old','pilotsolve-1','simply-endorsed-1','flight-lesson-guide-pdf'],delete:async v=>deleted.push(v),open:()=>assert.fail('retired worker created a cache')}};
  vm.runInNewContext(fs.readFileSync(path.join(guide,'sw.js'),'utf8'),sandbox);
  let install;handlers.install({waitUntil:p=>{install=p}});await install;
  let activation;handlers.activate({waitUntil:p=>{activation=p}});await activation;
  assert.equal(skipped,1);assert.equal(unregistered,1);
  assert.deepEqual(deleted,['flight-lesson-guide-old','flight-lesson-guide-pdf']);
  assert.deepEqual(navigated,['/flight-lesson-guide/#course=sport']);
  assert.equal(handlers.fetch,undefined);
});
