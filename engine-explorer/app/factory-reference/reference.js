/* Displays the provider-hosted model through Sketchfab's documented Viewer API.
 * No geometry buffers or CAD files are read, copied, or included in this app. */
(() => {
  const model = 'b321e554c3aa4736ba823cb5f11339a8';
  const loading = document.getElementById('loading');
  const status = document.getElementById('status');
  const controls = [...document.querySelectorAll('button, input')];
  const cameras = {
    whole: {position:[90,-76,41],target:[4,7,-7],title:'See the assembled engine',description:'Compare the cylinder heads, castings, carburetors and external connections with the animated teaching model.'},
    ignition: {position:[22,37,20],target:[-1,17,14],title:'Two independent ignition circuits',description:'Orbit the ignition hardware to inspect the module cases, connector housings, brackets and leads. The modules control discharge into four double ignition coils. The sealed circuit boards are not visible. Turn off “Ignition hardware only” to restore the surrounding engine.'},
    exhaust: {position:[49,-24,12],target:[25,-5,0],title:'Where exhaust leaves the head',description:'Follow the curved primary pipe into the head connection. Notice the formed retaining flange, two studs and nuts, and the neighboring angled spark-plug connector.'},
    rear: {position:[48,65,48],target:[0,12,11],title:'The rear of the engine',description:'Find the electric starter, flywheel cover, carburetors and ignition wiring. The flywheel generator supplies the CDI ignition circuits independently of the aircraft battery.'}
  };
  let api, ready = false, failed = false;
  const call = (name, ...args) => new Promise((resolve,reject) => api[name](...args,(error,value)=>error?reject(error):resolve(value)));
  const visibility = (id, visible) => call(visible?'show':'hide',id);
  function unavailable() {
    if (ready || failed) return;
    failed = true;
    clearTimeout(timeout);
    loading.replaceChildren();
    const title = document.createElement('strong'); title.textContent = 'The hosted reference could not be loaded.';
    const detail = document.createElement('span'); detail.textContent = 'Check your internet connection, reload, or open Rotax’s configurator.';
    const link = document.createElement('a'); link.href = 'https://configurator.flyrotax.com/view/912%20ULS/2'; link.target='_blank';link.rel='noopener';link.textContent='Open the Rotax configurator ↗';
    loading.append(title,detail,link); status.textContent='Hosted reference unavailable';
  }
  async function equipment() {
    const isolated = document.getElementById('ignition-only').checked;
    for(const id of [4,951,1071,1228,1609,1717])await visibility(id,!isolated);
    const hoses = document.getElementById('hoses').checked;
    await visibility(1352,hoses&&!isolated); await visibility(1508,hoses&&!isolated);
    await visibility(889,document.getElementById('exhaust').checked&&!isolated);
    const airbox = document.getElementById('airbox').checked;
    await visibility(797,airbox&&!isolated); await visibility(871,!airbox&&!isolated);
  }
  async function view(name) {
    const camera=cameras[name];
    document.getElementById('ignition-only').checked=name==='ignition';
    if (name==='ignition') {document.getElementById('hoses').checked=false; document.getElementById('airbox').checked=false;}
    if (name==='exhaust') document.getElementById('exhaust').checked=true;
    if (name==='whole') {document.getElementById('hoses').checked=true; document.getElementById('airbox').checked=false; document.getElementById('exhaust').checked=true;}
    await equipment();
    const narrowIgnition=name==='ignition'&&document.getElementById('factory').clientWidth<650;
    const target=narrowIgnition?[-4,19,15]:camera.target;
    const position=narrowIgnition?target.map((v,i)=>v+(camera.position[i]-camera.target[i])*1.4):camera.position;
    await call('setCameraLookAt',position,target,matchMedia('(prefers-reduced-motion: reduce)').matches?0:.5);
    for(const button of document.querySelectorAll('[data-view]'))button.setAttribute('aria-pressed',String(button.dataset.view===name));
    document.getElementById('view-title').textContent=camera.title;
    document.getElementById('view-description').textContent=camera.description;
    status.textContent='912 ULS · '+(name==='whole'?'Whole engine':document.querySelector(`[data-view="${name}"]`).textContent);
    if(ready && matchMedia('(max-width:650px)').matches)document.querySelector('.stage').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  }
  async function update(action) {
    for(const control of controls)control.disabled=true;
    try {await action();} catch {status.textContent='View controls unavailable. Reload the reference.';}
    finally {enableControls();}
  }
  function enableControls() {
    for(const control of controls)control.disabled=false;
    if(document.getElementById('ignition-only').checked)for(const id of ['hoses','exhaust','airbox'])document.getElementById(id).disabled=true;
  }
  for(const button of document.querySelectorAll('[data-view]'))button.addEventListener('click',()=>update(()=>view(button.dataset.view)));
  for(const input of document.querySelectorAll('input'))input.addEventListener('change',()=>update(()=>input.id==='ignition-only'&&input.checked?view('ignition'):equipment()));
  const timeout=setTimeout(unavailable,45000);
  const sdk=document.createElement('script');sdk.src='https://static.sketchfab.com/api/sketchfab-viewer-1.12.1.js';sdk.onerror=unavailable;
  sdk.onload=()=>{
    if(typeof Sketchfab!=='function'){unavailable();return;}
    new Sketchfab('1.12.1',document.getElementById('factory')).init(model,{
      autostart:1,camera:0,dnt:1,
      success(viewer){
        api=viewer;
        api.addEventListener('viewerready',async()=>{
          try {
            // Observed option-group IDs in this specific published reference.
            // Explicitly select ULS, gearbox 2, 0.9 kW starter and metric fittings.
            for(const id of [557,607,735,1001,1154,1314,1432,1482,1582,1636,1663,1690,1774])await visibility(id,false);
            for(const id of [4,621,951,1071,1228,1609,1717])await visibility(id,true);
            await call('setEnableCameraConstraints',false,{preventCameraConstraintsFocus:true});
            await view('whole');
            ready=true;failed=false;clearTimeout(timeout);loading.hidden=true;
            enableControls();
          } catch {unavailable();}
        });
        api.start();
      },error:unavailable
    });
  };
  document.head.append(sdk);
})();
