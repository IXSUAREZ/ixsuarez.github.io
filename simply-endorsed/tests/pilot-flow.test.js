const assert = require('node:assert/strict');
const {initJSDOM} = require('./test-helpers');
const tests = [];
function test(id,name,fn){tests.push({id,name,pure:true,fn:async()=>{const h=initJSDOM();try{await fn(h.document,h.window,h);}finally{h.window.close();}}});}
test('P_ZERO_PATH','A new pilot can calculate from a single explicit zero-hours choice',async(d,w)=>{
 d.querySelector('[data-zero-experience]').click();
 assert.equal(d.querySelector('[data-experience="totalTime"]').value,'0');
 assert.equal(d.querySelector('.part61-zero-review').hidden,false);
 // The Calculate control is the experience step primary action.
 const build=[...d.querySelectorAll('button')].find(b=>b.textContent.trim()==='Build my plan');build.click();
 assert.match(d.querySelector('#part61AuditDashboard').textContent,/40.0 hr/);
 assert.equal(d.querySelector('#part61Results').hidden,false);
});
test('P_ZERO_PROTECT','Zero shortcut requires explicit replacement and preserves unrelated hours',async(d,w)=>{
 const total=d.querySelector('[data-experience="totalTime"]');total.value='25';
 const other=d.querySelector('[data-experience="helicopterTime"]');other.value='12';
 d.querySelector('[data-zero-experience]').click();assert.equal(total.value,'25');assert.equal(d.querySelector('.part61-zero-confirm').hidden,false);
 d.querySelector('[data-cancel-zero]').click();assert.equal(total.value,'25');
 d.querySelector('[data-zero-experience]').click();d.querySelector('[data-confirm-zero]').click();
 assert.equal(total.value,'0');assert.equal(other.value,'12');
 d.querySelector('[data-common-goal="commercial-asel"]').click();
 assert.equal(d.querySelector('#part61ExperienceFields').hidden,false);assert.equal(other.value,'12');
});
test('P_BACKGROUND','Background catalog is progressive and keeps selected credentials visible',async(d,w)=>{
 assert.equal(d.querySelector('#part61CredentialCatalog').hidden,true);
 d.querySelector('[data-has-certificate]').click();assert.equal(d.querySelector('#part61CredentialCatalog').hidden,false);
 d.querySelector('[data-credential="private-asel"]').click();assert.match(d.querySelector('#part61SelectedCredentials').textContent,/Private/);
 d.querySelector('[data-no-certificate]').click();assert.equal(d.querySelector('#part61CredentialCatalog').hidden,true);
});
test('P_GOAL_GROUPS','Popular goals use the existing engine targets and missing entries remain unknown',async(d,w)=>{
 d.querySelector('[data-common-goal="instrument-airplane"]').click();
 assert.equal(d.querySelector('[data-select-target="instrument-airplane"]').getAttribute('aria-pressed'),'true');
 assert.equal(d.querySelector('.stage-row').hidden,true);
 d.querySelector('#part61AddStageBtn').click();assert.equal(d.querySelectorAll('[data-stage-card]').length,2);assert.equal(d.querySelector('.stage-row').hidden,false);
 d.querySelector('[data-review-missing]').click();assert.equal(d.querySelector('#part61ValidationMessage').hidden,false);
 assert([...d.querySelectorAll('[aria-invalid="true"]')].some(i=>i.value===''));
});
test('P_REFERENCE_PRINT','Instructor detail disclosure and responsive rows retain complete print data',async(d,w)=>{
 d.querySelector('[data-zero-experience]').click();
 [...d.querySelectorAll('button')].find(b=>b.textContent.trim()==='Build my plan').click();
 const details=d.querySelector('.part61-instructor-details');assert.equal(details.open,false);
 assert(d.querySelector('#part61Training').compareDocumentPosition(details)&w.Node.DOCUMENT_POSITION_FOLLOWING);
 assert(d.querySelector('#part61Endorsements .part61-mobile-reference details'));
 w.dispatchEvent(new w.Event('beforeprint'));assert.equal(details.open,true);
 assert([...d.querySelectorAll('.part61-results-tabpanel')].every(p=>!p.hidden));
 w.dispatchEvent(new w.Event('afterprint'));assert.equal(details.open,false);
});
test('P_REFERENCE_PARITY','Reference cards preserve all table records, fields, ledger filters and sources',async(d,w)=>{
 d.querySelector('[data-zero-experience]').click();
 [...d.querySelectorAll('button')].find(b=>b.textContent.trim()==='Build my plan').click();
 const normalized=node=>node.textContent.replace(/\s+/g,' ').trim();
 function references(root){
  const cards=[...root.querySelectorAll('.part61-reference-card')];
  const rows=[...root.querySelectorAll('tbody > tr')];
  assert.equal(cards.length,rows.length);assert(cards.length>0);
  rows.forEach((row,i)=>[...row.cells].forEach(cell=>assert(normalized(cards[i].closest('section')).includes(normalized(cell)),normalized(cell))));
  const screenLinks=[...root.querySelectorAll('.part61-reference-library a')].map(a=>a.href);
  root.querySelectorAll('table a').forEach(a=>assert(screenLinks.includes(a.href)));
 }
 references(d.querySelector('#part61Endorsements'));references(d.querySelector('#part61Gates'));
 for(const filter of ['all','remaining','events']){
  d.querySelector('[data-filter="'+filter+'"]').click();
  const root=d.querySelector('#part61Ledger');
  assert.equal(root.querySelectorAll('.part61-ledger-card,.part61-ledger-total').length,root.querySelectorAll('tbody > tr:not(.detail-row)').length);
  const cards=[...root.querySelectorAll('.part61-ledger-card,.part61-ledger-total')];
  [...root.querySelectorAll('tbody > tr:not(.detail-row)')].forEach((row,i)=>{
   assert(normalized(cards[i]).includes(normalized(row.querySelector('[data-label="CFR"]'))));
   assert(cards[i].querySelectorAll('.part61-ledger-numbers dd').length===4);
  });
 }
 for(const filter of ['endorsements','paperwork']){d.querySelector('[data-filter="'+filter+'"]').click();references(d.querySelector('#part61Ledger'));}
});
module.exports={tests};
