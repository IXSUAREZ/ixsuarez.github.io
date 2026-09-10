const assert = require('node:assert/strict');
const { initJSDOM } = require('./test-helpers');
const rules = require('../js/part61-rules-data');
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
function fixture() {
  const draft = {version:1,credentials:['student'],targets:['private-asel','commercial-asel'],flags:{priorFaa:true},rates:{aircraftWet:'200',instructor:'50'},experience:Object.fromEntries(rules.FIELD_GROUPS.flatMap(g=>g.fields.map(([key])=>[key,'0']))),events:{},proficiencyEstimates:{'commercial-amel-add-class':7}};
  const h = initJSDOM({domOptions:{beforeParse(w){
    w.localStorage.setItem('simply-endorsed:part61-scenario',JSON.stringify(draft));
    w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
    w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'));};
  }}});
  return h;
}
const tests = [
 {id:'E_EDITOR_CANCEL',pure:true,name:'Cancel restores full scenario and does not persist pending edits',fn:async()=>{
  const h=fixture(),d=h.document,w=h.window;try {
   const before=w.localStorage.getItem('simply-endorsed:part61-scenario');
   const total=d.querySelector('#part61AuditDashboard').textContent;
   d.querySelector('[data-edit-section="rates"]').click();
   const rate=d.querySelector('#part61AircraftWetRate');rate.value='310';rate.dispatchEvent(new w.Event('input',{bubbles:true}));
   await wait(450);assert.equal(w.localStorage.getItem('simply-endorsed:part61-scenario'),before);
   d.querySelector('[data-dialog-cancel]').click();assert.equal(rate.value,'200');assert.equal(d.querySelector('#part61AuditDashboard').textContent,total);
   assert.equal(d.querySelectorAll('[data-stage-card]').length,2);assert.equal(d.querySelector('#part61PriorFaa').checked,true);
  }finally{h.dom.window.close();}
 }},
 {id:'E_EDITOR_APPLY',pure:true,name:'Apply recalculates cost and preserves ordered goals and unrelated data',fn:async()=>{
  const h=fixture(),d=h.document,w=h.window;try {
   const before=d.querySelector('#part61AuditDashboard').textContent;
   d.querySelector('[data-edit-section="rates"]').click();d.querySelector('#part61AircraftWetRate').value='250';
   d.querySelector('[data-dialog-apply]').click();assert.equal(d.querySelector('#part61EditDialog').open,false);
   assert.notEqual(d.querySelector('#part61AuditDashboard').textContent,before);
   await wait(450);const saved=JSON.parse(w.localStorage.getItem('simply-endorsed:part61-scenario'));
   assert.deepEqual(saved.targets,['private-asel','commercial-asel']);assert.equal(saved.rates.aircraftWet,'250');assert.equal(saved.proficiencyEstimates['commercial-amel-add-class'],7);
  }finally{h.dom.window.close();}
 }},
 {id:'E_EDITOR_NEGATIVE',pure:true,name:'Negative hour edit stays open and cannot replace the computed result',fn:async()=>{
  const h=fixture(),d=h.document;try {
   const before=d.querySelector('#part61AuditDashboard').textContent;
   d.querySelector('[data-edit-section="experience"]').click();const input=d.querySelector('[data-experience="totalTime"]');input.value='-1';
   d.querySelector('[data-dialog-apply]').click();assert.equal(d.querySelector('#part61EditDialog').open,true);assert.equal(input.getAttribute('aria-invalid'),'true');assert.equal(d.querySelector('#part61AuditDashboard').textContent,before);
   d.querySelector('[data-dialog-cancel]').click();assert.equal(input.value,'0');
  }finally{h.dom.window.close();}
 }}
];
module.exports={tests};
