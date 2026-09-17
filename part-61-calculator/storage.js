/* CertPath persistence UI. Private tokens stay in the URL fragment/in memory. */
(function () {
  'use strict';
  const config = window.CertPathConfig;
  const bridge = window.CertPathCalculator;
  if (!config?.enabled || !config.apiBase || !bridge) return;
  const root = document.getElementById('part61CalculatorView');
  history.scrollRestoration = 'manual';
  const esc = window.SimplyEndorsedUtils.escapeHtml;
  let record = null, privateToken = '', pending = null, ownerToken = '', ownerMode = false;
  let idempotency = crypto.randomUUID(), busy = false, idleTimer, nextCursor = null, searchGeneration = 0, pendingFingerprint = '';
  const shell = document.createElement('div');
  shell.id = 'cp-shell';
  shell.innerHTML = `
    <nav class="cp-nav" aria-label="CertPath navigation"><button type="button" data-cp="home">CertPath</button><div><button type="button" data-cp="view" hidden>View my plan</button><button type="button" data-cp="inbox">Submissions</button><button type="button" data-cp="lock" hidden>Lock submissions</button></div></nav>
    <p id="cp-message" role="status" hidden></p>
    <section id="cp-intro" class="cp-card cp-intro">
      <img src="/part-61-calculator/logo.svg" alt="CertPath" width="104" height="104">
      <p class="cp-eyebrow">YOUR NEXT CHAPTER IN FLIGHT</p>
      <h1>A clearer path to your next rating.</h1>
      <p>Start with where you are. See what comes next.</p>
      <p class="cp-muted">Choose your goal, tell us about your flight experience, and save a personalized training plan to review with Diego.</p>
      <button type="button" class="cp-primary" data-cp="start">Start your path</button>
      <p class="cp-fine">A planning aid, not a logbook or an instructor’s eligibility determination.</p>
    </section>
    <section id="cp-contact" class="cp-card" hidden>
      <p class="cp-eyebrow">ONE LAST STEP</p><h2>Save your path.</h2>
      <p>Tell Diego who the plan is for, so you can work out your next steps together.</p>
      <form id="cp-contact-form">
        <div class="cp-fields"><label>First name<input name="firstName" autocomplete="given-name" maxlength="80" required></label><label>Last name<input name="lastName" autocomplete="family-name" maxlength="80" required></label></div>
        <label>Email<input name="email" type="email" autocomplete="email" maxlength="254" required></label>
        <label>Phone number<input name="phone" type="tel" autocomplete="tel" maxlength="40" required></label>
        <p class="cp-fine">Saving sends your contact details, experience, and plan to Diego Suarez for training planning. Your details are private. Anyone with your private plan link can view and update this plan. Records are kept until Diego deletes them.</p>
        <div class="cp-actions"><button type="button" data-cp="back">Back to experience</button><button type="submit" class="cp-primary">Save &amp; view my plan</button></div>
      </form>
    </section>
    <section id="cp-inbox" class="cp-card cp-inbox" hidden>
      <p class="cp-eyebrow">INSTRUCTOR WORKSPACE</p><h2>Submissions</h2>
      <div id="cp-locked"><p>Student plans are private. Unlock to view submissions.</p>
        <div class="cp-placeholders" aria-hidden="true"><span></span><span></span><span></span></div>
        <button type="button" class="cp-primary" data-cp="unlock">🔒 Unlock submissions</button>
        <form id="cp-unlock-form" hidden><label>Six-digit PIN<input name="pin" type="password" inputmode="numeric" pattern="[0-9]{6}" minlength="6" maxlength="6" autocomplete="off" required></label><button type="submit" class="cp-primary">Unlock</button></form>
      </div>
      <div id="cp-unlocked" hidden><label>Search by name<input id="cp-search" type="search" placeholder="First or last name" maxlength="160"></label><div id="cp-list" aria-live="polite"></div><button type="button" data-cp="more" hidden>Load more</button></div>
    </section>
    <section id="cp-saved" class="cp-saved" hidden><div><strong id="cp-saved-name"></strong><p id="cp-saved-date"></p><p id="cp-private-note" class="cp-fine">Keep your private link somewhere safe. Anyone with it can view and update this plan.</p></div><div class="cp-actions"><button type="button" data-cp="copy">Copy private plan link</button><button type="button" data-cp="edit">Update my experience</button><button type="button" data-cp="inbox" id="cp-return" hidden>Back to submissions</button><button type="button" data-cp="delete" hidden>Delete submission</button></div><p id="cp-owner-contact"></p></section>
    <dialog id="cp-delete-dialog"><h2>Delete this submission?</h2><p>This removes the saved plan and disables its private link.</p><div class="cp-actions"><button type="button" data-cp="cancel-delete">Cancel</button><button type="button" data-cp="confirm-delete">Delete submission</button></div></dialog>`;
  root.prepend(shell);
  const $ = id => document.getElementById('cp-' + id);
  const action = key => shell.querySelector(`[data-cp="${key}"]`);
  const form = $('contact-form');
  function message(text, error = false) { $('message').textContent = text; $('message').hidden = !text; $('message').classList.toggle('cp-error', error); }
  function view(name) {
    root.dataset.cpView = name;
    if (name !== 'calculator') window.scrollTo({top:0,behavior:'instant'});
    ['intro', 'contact', 'inbox'].forEach(key => { $(key).hidden = key !== name; });
    $('saved').hidden = name !== 'calculator' || !record;
    action('view').hidden = !record || ownerMode;
    action('lock').hidden = !ownerToken;
    const heading = $(name)?.querySelector('h1,h2');
    if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
  }
  function privateLink() { return `${location.origin}${location.pathname}#plan=${encodeURIComponent(record.id)}&key=${encodeURIComponent(privateToken)}`; }
  function clearHash() { history.replaceState(null, '', location.pathname); }
  function touch() { clearTimeout(idleTimer); if (ownerToken) idleTimer = setTimeout(() => lock(), 15 * 60 * 1000); }
  async function api(path, { method = 'GET', body, token, key } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = 'Bearer ' + token;
    if (key) headers['Idempotency-Key'] = key;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    let response;
    try {
      response = await fetch(config.apiBase.replace(/\/$/, '') + path, { method, headers, body: body ? JSON.stringify(body) : undefined, cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer', signal: controller.signal });
    } catch { throw new Error('Unable to connect. Your entries are preserved; check your connection and try again.'); }
    finally { clearTimeout(timeout); }
    if (response.status === 204) return null;
    let data; try { data = await response.json(); } catch { throw new Error('Saving is temporarily unavailable. Please try again.'); }
    if (!response.ok) {
      if (token && token === ownerToken && response.status === 401) lock(false);
      throw new Error(response.status === 409 ? 'This plan changed in another tab. Reopen your private link to load the latest version before saving.' : response.status === 429 ? 'Too many attempts. Please wait 15 minutes and try again.' : data.error?.message || (typeof data.error === 'string' ? data.error : 'The request could not be completed. Please try again.'));
    }
    if (ownerToken && token === ownerToken) touch();
    return data;
  }
  function fillContact(contact) { for (const key of ['firstName', 'lastName', 'email', 'phone']) form.elements[key].value = contact?.[key] || ''; }
  function present(saved, asOwner = false) {
    record = saved; ownerMode = asOwner;
    bridge.present(saved);
    $('saved-name').textContent = `${saved.contact.firstName} ${saved.contact.lastName} · Your plan`;
    $('saved-date').textContent = 'Saved ' + new Date(saved.updatedAt).toLocaleString();
    $('owner-contact').textContent = asOwner ? `${saved.contact.email} · ${saved.contact.phone}` : '';
    $('private-note').hidden = asOwner;
    action('copy').hidden = asOwner;
    action('edit').hidden = asOwner;
    action('delete').hidden = !asOwner;
    $('return').hidden = !asOwner;
    fillContact(saved.contact);
    view('calculator');
    root.classList.toggle('cp-owner-view', asOwner);
  }
  function reset() {
    record = null; privateToken = ''; pending = null; ownerMode = false; idempotency = crypto.randomUUID();
    fillContact(null); clearHash(); root.classList.remove('cp-owner-view');
    $('saved-name').textContent = ''; $('saved-date').textContent = ''; $('owner-contact').textContent = '';
    view('intro'); message('');
  }
  function edit() {
    if (ownerMode) { message('Open the student’s private link to update their experience.', true); return; }
    view('calculator'); bridge.step(3); message('Update your experience, then build and save your plan.');
  }
  async function lock(send = true) {
    const oldToken = ownerToken; ownerToken = ''; searchGeneration++; clearTimeout(idleTimer);
    $('list').replaceChildren(); $('search').value = ''; $('unlock-form').reset(); $('unlock-form').hidden = true;
    $('locked').hidden = false; $('unlocked').hidden = true;
    $('delete-dialog').close();
    if (ownerMode) bridge.reset();
    view('inbox'); message('Submissions locked.');
    if (send && oldToken) { try { await api('/owner/logout', {method:'POST',token:oldToken}); } catch {} }
  }
  async function inbox() {
    view('inbox'); message('');
    $('locked').hidden = !!ownerToken; $('unlocked').hidden = !ownerToken;
    if (ownerToken) await list(false);
  }
  async function list(append) {
    const generation = ++searchGeneration;
    const params = new URLSearchParams({q:$('search').value.trim()});
    if (append && nextCursor) params.set('cursor',nextCursor);
    const data = await api('/owner/plans?' + params, {token:ownerToken});
    if (generation !== searchGeneration || !ownerToken) return;
    if (!append) $('list').replaceChildren();
    if (!data.items.length && !append) $('list').textContent = 'No submissions found.';
    for (const item of data.items) {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'cp-record'; button.dataset.record = item.id;
      button.innerHTML = `<strong>${esc(item.contact.firstName)} ${esc(item.contact.lastName)}</strong><span>${esc(item.contact.email)} · ${esc(item.contact.phone)}</span><span>${esc((item.scenario?.targets || []).map(id => window.Part61RulesData.TARGET_OPTIONS.find(t => t.id === id)?.label || id).join(' → '))}</span><small>Updated ${esc(new Date(item.updatedAt).toLocaleString())}</small>`;
      $('list').append(button);
    }
    nextCursor = data.nextCursor; action('more').hidden = !nextCursor;
  }
  window.CertPathStorage = {
    requestSave(scenario, plan) { if (ownerMode) return; pending = {scenario,plan}; view('contact'); message(''); },
    onReset: reset, edit
  };
  form.addEventListener('submit', async event => {
    event.preventDefault(); if (busy || !pending || !form.reportValidity()) return;
    const contact = Object.fromEntries(['firstName','lastName','email','phone'].map(key => [key,form.elements[key].value.trim()]));
    if (Object.values(contact).some(v => !v) || contact.phone.replace(/\D/g,'').length < 7) { message('Please enter your name, email, and a valid phone number.',true); return; }
    busy = true; const submit = form.querySelector('[type=submit]'); submit.disabled = true; submit.textContent = 'Saving…'; message('');
    try {
      const body = {...pending,contact,calculatorVersion:'part61-core-v4-2026-09-17'};
      if (record) body.revision = record.revision;
      const fingerprint = JSON.stringify(body);
      if (pendingFingerprint && pendingFingerprint !== fingerprint) idempotency = crypto.randomUUID();
      pendingFingerprint = fingerprint;
      const saved = await api(record ? '/plans/' + encodeURIComponent(record.id) : '/plans', {method:record?'PUT':'POST',body,token:privateToken,key:idempotency});
      privateToken = saved.token || privateToken;
      present(saved); history.replaceState(null,'',privateLink()); pending = null;
      message('Your plan is saved. Copy your private link to reopen it later.');
    } catch (error) { message(error.message || 'Unable to save. Your entries are still here; please retry.',true); }
    finally { busy = false; submit.disabled = false; submit.textContent = 'Save & view my plan'; }
  });
  $('unlock-form').addEventListener('submit', async event => {
    event.preventDefault(); if (busy || !$('unlock-form').reportValidity()) return;
    busy = true; const button = $('unlock-form').querySelector('button'); button.disabled = true;
    const pin = $('unlock-form').elements.pin.value; $('unlock-form').reset();
    try { const data = await api('/owner/unlock',{method:'POST',body:{pin}}); ownerToken = data.token; touch(); await inbox(); }
    catch(error) {message(error.message,true);} finally {busy = false; button.disabled = false;}
  });
  let debounce;
  $('search').addEventListener('input', () => { clearTimeout(debounce); searchGeneration++; debounce = setTimeout(() => list(false).catch(e => message(e.message,true)),250); });
  shell.addEventListener('click', async event => {
    const button = event.target.closest('button'); if (!button || busy) return;
    try {
      if (button.dataset.record) {
        const token = ownerToken;
        const data = await api('/owner/plans/' + encodeURIComponent(button.dataset.record),{token});
        if (ownerToken === token && token) { clearHash(); privateToken = ''; present(data,true); }
        return;
      }
      switch(button.dataset.cp) {
        case 'start': bridge.reset(); view('calculator'); bridge.step(1); break;
        case 'home': view('intro'); message(''); break;
        case 'view': if(record && !ownerMode) present(record); break;
        case 'inbox': await inbox(); break;
        case 'unlock': $('unlock-form').hidden = false; $('unlock-form').elements.pin.focus(); break;
        case 'lock': await lock(); break;
        case 'more': await list(true); break;
        case 'back': view('calculator'); bridge.step(3); break;
        case 'edit': edit(); break;
        case 'copy': await navigator.clipboard.writeText(privateLink()); message('Private plan link copied.'); break;
        case 'delete': $('delete-dialog').showModal(); break;
        case 'cancel-delete': $('delete-dialog').close(); break;
        case 'confirm-delete': {
          if (!ownerMode || !ownerToken || !record) return;
          await api('/owner/plans/' + encodeURIComponent(record.id),{method:'DELETE',token:ownerToken});
          $('delete-dialog').close(); bridge.reset(); await inbox(); message('Submission deleted.'); break;
        }
      }
    } catch(error) {message(error.message,true);}
  });
  ['pointerdown','keydown'].forEach(type => document.addEventListener(type,touch,{passive:true}));
  window.addEventListener('pagehide', () => { ownerToken=''; clearTimeout(idleTimer); });
  window.addEventListener('pageshow', event => { if(event.persisted) lock(false); });
  view('intro');
  const params = new URLSearchParams(location.hash.slice(1));
  const id = params.get('plan'), key = params.get('key');
  if(id && key) {
    message('Opening your saved plan…');
    api('/plans/' + encodeURIComponent(id),{token:key}).then(saved => {privateToken=key;present(saved);message('');}).catch(error => {message('This private plan could not be opened. '+error.message,true);});
  }
})();
