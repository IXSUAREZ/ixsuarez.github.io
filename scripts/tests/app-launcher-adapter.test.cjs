const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('../../simply-endorsed/node_modules/jsdom');
const source=fs.readFileSync(path.join(__dirname,'../../assets/app-site-navigation.js'),'utf8');
const tools=JSON.parse(fs.readFileSync(path.join(__dirname,'../../config/site-pages.json'),'utf8')).tools;
test('standalone app picker retains native links and listeners with one complete icon grid',()=>{
 const dom=new JSDOM('<div class="site-navigation__drop-panel"><a href="/learn/">Learn</a><a id="retained" href="/pilotsolve/">PilotSolve</a></div>',{url:'https://suarezcfi.com/engine-explorer/',runScripts:'outside-only'});
 const kept=dom.window.document.getElementById('retained');let clicks=0;
 kept.addEventListener('click',e=>{e.preventDefault();clicks++});
 dom.window.eval(source);dom.window.eval(source);
 const doc=dom.window.document,grid=doc.querySelector('.av-app-launcher');
 assert.ok(grid);assert.equal(doc.querySelectorAll('.av-app-launcher').length,1);
 assert.equal(grid.querySelectorAll('a.av-app-tile').length,tools.length);
 for(const tool of tools){const a=[...grid.querySelectorAll('a')].find(a=>a.getAttribute('href')===tool.path);assert.ok(a,tool.path);assert.equal(a.querySelector('strong').textContent,tool.label);assert.ok(a.querySelector('img').getAttribute('src').startsWith('/assets/identities/'));assert.equal(a.querySelector('img').alt,'')}
 assert.equal(doc.getElementById('retained'),kept);kept.click();assert.equal(clicks,1);
 assert.ok(doc.querySelector('a[href="/learn/"]'));assert.ok(doc.querySelector('a[href="/tools/"]'));
 dom.window.close();
});
