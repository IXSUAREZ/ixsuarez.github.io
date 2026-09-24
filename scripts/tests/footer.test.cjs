const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('../../simply-endorsed/node_modules/jsdom');
const root=path.resolve(__dirname,'../..');
const html=fs.readFileSync(path.join(root,'assets/partials/footer.html'),'utf8');
const code=fs.readFileSync(path.join(root,'assets/site-footer.js'),'utf8');
function app(compact=true,run=true){
 const dom=new JSDOM(html,{runScripts:'outside-only'}); const w=dom.window;
 const media={matches:compact,addEventListener:(_,fn)=>media.change=fn};
 w.matchMedia=()=>media;if(run)w.eval(code);
 return {dom,w,groups:[...w.document.querySelectorAll('details')],resize(value){media.matches=value;media.change();}};
}
test('no JS preserves all links and expanded directory',()=>{const a=app(true,false);assert.equal(a.w.document.querySelectorAll('a').length,20);assert(a.groups.every(g=>g.open));a.dom.window.close();});
test('compact disclosure choice survives desktop and return',()=>{const a=app();assert(a.groups.every(g=>!g.open));a.groups[0].querySelector('summary').click();assert(a.groups[0].open);a.resize(false);assert(a.groups.every(g=>g.open));a.resize(true);assert(a.groups[0].open);assert(!a.groups[1].open);a.dom.window.close();});
test('desktop headings cannot collapse links',()=>{const a=app(false);a.groups[0].querySelector('summary').click();assert(a.groups[0].open);assert.equal(a.groups[0].querySelector('summary').tabIndex,-1);a.dom.window.close();});
test('resize keeps focused link exposed',()=>{const a=app(false);const link=a.groups[1].querySelector('a');link.focus();a.resize(true);assert(a.groups[1].open);assert.equal(a.w.document.activeElement,link);a.dom.window.close();});
test('copyright uses current year and creates no storage',()=>{const a=app();assert.equal(a.w.document.querySelector('#yr').textContent,String(new Date().getFullYear()));assert(!/localStorage|sessionStorage/.test(code));a.dom.window.close();});

test('resize transfers focus between mobile summary and desktop heading',()=>{const a=app();const summary=a.groups[0].querySelector('summary');const heading=a.groups[0].querySelector('h2');summary.focus();a.resize(false);assert.equal(a.w.document.activeElement,heading);a.resize(true);assert.equal(a.w.document.activeElement,summary);a.dom.window.close();});
