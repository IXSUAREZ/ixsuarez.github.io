/* Flight Lesson Guide. Authored course data; temporary in-memory flight checklist. */
(function (global) {
  'use strict';
  const kinds = { dual: 'Dual instruction', solo: 'Solo practice', pic: 'PIC practice', device: 'Training device', check: 'Stage / course check', ground: 'Ground prerequisite' };
  const editablePhases = new Set(['taxi', 'departure', 'return', 'taxi-in']);
  const cleanMinutes = value => Number.isFinite(Number(value)) ? Math.max(0, Math.round(Number(value))) : 0;
  const escape = value => String(value == null ? '' : value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const minutes = value => value == null ? 'Not specified' : `${cleanMinutes(value)} min`;
  const clock = value => {
    const seconds = Math.floor(Math.max(0, value) / 1000);
    return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  };
  const range = (start, end) => `${String(start).padStart(2, '0')}–${String(end).padStart(2, '0')} min`;
  function hashFor(route) {
    return '#' + new URLSearchParams({ course: route.course, lesson: route.lesson, branch: route.branch || '', mode: route.mode === 'cockpit' ? 'cockpit' : 'teach' }).toString();
  }
  function parseHash(hash) {
    const p = new URLSearchParams(String(hash || '').replace(/^#/, ''));
    return { course: p.get('course') || '', lesson: p.get('lesson') || '', branch: p.get('branch') || '', mode: p.get('mode') === 'cockpit' ? 'cockpit' : 'teach' };
  }
  function eligible(lesson, branch) { return !lesson.branch || !branch || lesson.branch === branch; }
  function filterLessons(course, filters) {
    const query = String(filters.search || '').toLocaleLowerCase().trim();
    return course.lessons.filter(l => eligible(l, filters.branch) && (!filters.stage || l.stage === filters.stage) && (!filters.kind || l.kind === filters.kind) && (!query || [l.id, l.title, l.summary, ...(l.objectives || []), ...(l.steps || []).map(s => s.title)].join(' ').toLocaleLowerCase().includes(query)));
  }
  /* Reconcile one whole-flight budget. Instrument minutes are never added here.
     Transit edits cannot remove tasks: every original step remains in the plan. */
  function timingPlan(lesson, overrides = {}, requestedBudget) {
    const steps = lesson.steps || [];
    const budget = requestedBudget == null ? cleanMinutes(lesson.flightMinutes) : cleanMinutes(requestedBudget);
    const fixed = steps.filter(s => editablePhases.has(s.phase));
    const flex = steps.filter(s => !editablePhases.has(s.phase));
    const amounts = {};
    for (const s of fixed) amounts[s.id] = Math.max(s.required ? 1 : 0, cleanMinutes(Object.hasOwn(overrides, s.id) ? overrides[s.id] : s.minutes));
    const fixedTotal = fixed.reduce((sum, s) => sum + amounts[s.id], 0);
    const minimums = flex.map(s => Math.max(s.required ? 1 : 0, cleanMinutes(s.minutes) > 0 ? 1 : 0));
    const minimum = minimums.reduce((sum, n) => sum + n, 0);
    const available = Math.max(minimum, budget - fixedTotal);
    const weightTotal = flex.reduce((sum, s) => sum + cleanMinutes(s.minutes), 0);
    const distributable = available - minimum;
    const exact = flex.map((s, i) => available === weightTotal ? cleanMinutes(s.minutes) : minimums[i] + distributable * (weightTotal ? cleanMinutes(s.minutes) / weightTotal : 1 / Math.max(1, flex.length)));
    const allocation = exact.map(Math.floor);
    let residual = available - allocation.reduce((sum, n) => sum + n, 0);
    const order = exact.map((n, i) => ({ i, fraction: n - Math.floor(n) })).sort((a, b) => b.fraction - a.fraction || a.i - b.i);
    for (const o of order) { if (residual <= 0) break; allocation[o.i]++; residual--; }
    flex.forEach((s, i) => { amounts[s.id] = allocation[i]; });
    let flight = 0, air = 0, airborneSeen = false;
    const rows = steps.map(s => {
      const n = amounts[s.id], row = { ...s, plannedMinutes: n, flightStart: flight, flightEnd: flight + n, airStart: s.airborne ? air : null, airEnd: s.airborne ? air + n : null, groundPosition: airborneSeen ? 'After landing' : 'Before takeoff' };
      flight += n;
      if (s.airborne) { air += n; airborneSeen = true; }
      return row;
    });
    return { rows, total: flight, airborne: air, budget, overbooked: Math.max(0, flight - budget), compressed: flex.some(s => amounts[s.id] < cleanMinutes(s.minutes) * 0.7), changed: rows.some(s => s.plannedMinutes !== cleanMinutes(s.minutes)) || budget !== cleanMinutes(lesson.flightMinutes) };
  }
  function validatePayload(data) {
    if (!data || data.schemaVersion !== 1 || !Array.isArray(data.courses) || !data.courses.length) throw new Error('The course library is unavailable or uses an unsupported format.');
    const ids = new Set();
    for (const course of data.courses) {
      if (!course.id || ids.has(course.id) || !course.title || !Array.isArray(course.lessons) || !course.lessons.length) throw new Error('The course library contains an incomplete pathway.');
      ids.add(course.id);
      const lessonIds = new Set();
      for (const lesson of course.lessons) {
        if (!lesson.id || lessonIds.has(lesson.id) || !kinds[lesson.kind] || !Array.isArray(lesson.steps)) throw new Error('The course library contains an incomplete lesson.');
        lessonIds.add(lesson.id);
        if (lesson.kind === 'ground' && lesson.steps.length) throw new Error('A ground prerequisite contains flight steps.');
        if (lesson.steps.some(s => !s.id || !Number.isInteger(s.minutes) || s.minutes < 0)) throw new Error('A lesson contains an invalid timing block.');
      }
    }
    return data;
  }
  const model = { kinds, editablePhases, hashFor, parseHash, filterLessons, timingPlan, validatePayload, clock };
  if (typeof module !== 'undefined' && module.exports) module.exports = model;
  global.FlightLessonGuideModel = model;
  if (!global.document) return;
  const document = global.document, app = document.getElementById('flight-guide-app');
  if (!app) return;
  const state = { data: null, course: '', lesson: '', branch: '', mode: 'teach', stage: '', kind: '', search: '', active: '', sessions: new Map(), offline: '', pdfBusy: false, loadAttempt: 0 };
  const $ = id => document.getElementById(id);
  const course = () => state.data.courses.find(c => c.id === state.course);
  const lesson = () => course().lessons.find(l => l.id === state.lesson);
  const sessionKey = () => `${state.course}/${state.lesson}`;
  function session() {
    if (!state.sessions.has(sessionKey())) state.sessions.set(sessionKey(), { covered: new Set(), overrides: {}, budget: null, timers: new Map() });
    return state.sessions.get(sessionKey());
  }
  function timer(id = state.active) {
    const s = session();
    if (!s.timers.has(id)) s.timers.set(id, { elapsed: 0, started: null, attempt: 1 });
    return s.timers.get(id);
  }
  function elapsed(t) { return t.elapsed + (t.started == null ? 0 : Date.now() - t.started); }
  function pauseAll() {
    for (const s of state.sessions.values()) for (const t of s.timers.values()) if (t.started != null) { t.elapsed = elapsed(t); t.started = null; }
  }
  function announce(message) { $('guide-status').textContent = message; }
  function urlLink(ref) {
    if (!ref || !ref.url) return escape(ref && ref.title);
    let valid;
    try { valid = new URL(ref.url); } catch (_) { return escape(ref.title); }
    if (!['https:', 'http:'].includes(valid.protocol)) return escape(ref.title);
    return `<a href="${escape(valid.href)}" target="_blank" rel="noopener noreferrer">${escape(ref.title)} <span aria-hidden="true">↗</span></a>`;
  }
  function list(values, className = '') { return values && values.length ? `<ul class="${className}">${values.map(v => `<li>${escape(v)}</li>`).join('')}</ul>` : ''; }
  function stageName(id) { const stage = (course().stages || []).find(s => s.id === id); return stage ? `${id} · ${stage.title}` : id; }
  function branchName(value) { return /^[AB]$/.test(value) ? `Path ${value}` : value; }
  function sourceStatus(c) {
    return c.sourceStatus === 'verified-current' ? 'Current edition aligned' : c.sourceStatus === 'authored-faa' ? 'Original FAA-based instructor path' : 'Publisher alignment pending';
  }
  function updateHash() {
    const hash = hashFor({ course: state.course, lesson: state.lesson, branch: state.branch, mode: state.mode });
    if (global.location.hash !== hash) global.history.pushState(null, '', hash);
  }
  function selectRoute(route, writeHash = false) {
    pauseAll();
    const requested = state.data.courses.find(c => c.id === route.course), c = requested || state.data.courses[0];
    const branches = [...new Set(c.lessons.map(l => l.branch).filter(Boolean))];
    let branch = branches.includes(route.branch) ? route.branch : branches[0] || '';
    let l = c.lessons.find(l => l.id === route.lesson);
    if (l && l.branch) branch = l.branch;
    if (!l) l = c.lessons.find(l => eligible(l, branch)) || c.lessons[0];
    const newCourse = state.course !== c.id;
    state.course = c.id; state.lesson = l.id; state.branch = branch; state.mode = route.mode === 'cockpit' ? 'cockpit' : 'teach';
    if (newCourse) { state.stage = ''; state.kind = ''; state.search = ''; }
    state.active = (l.steps[0] || {}).id || '';
    render();
    if (writeHash) updateHash();
    if (route.lesson && route.lesson !== l.id) announce('That lesson link was not found. The first available lesson is shown.');
  }
  function renderPicker() {
    const c = course();
    $('course-select').innerHTML = state.data.courses.map(c => `<option value="${escape(c.id)}" ${c.id === state.course ? 'selected' : ''}>${escape(c.title)}</option>`).join('');
    const branches = [...new Set(c.lessons.map(l => l.branch).filter(Boolean))];
    $('branch-field').hidden = branches.length === 0;
    $('branch-select').innerHTML = branches.map(b => `<option value="${escape(b)}" ${b === state.branch ? 'selected' : ''}>${escape(branchName(b))}</option>`).join('');
    const stages = [...new Set(c.lessons.filter(l => eligible(l, state.branch)).map(l => l.stage))];
    if (!stages.includes(state.stage)) state.stage = '';
    $('stage-select').innerHTML = '<option value="">All stages</option>' + stages.map(s => `<option value="${escape(s)}" ${state.stage === s ? 'selected' : ''}>${escape(stageName(s))}</option>`).join('');
    $('kind-select').value = state.kind;
    if ($('lesson-search').value !== state.search) $('lesson-search').value = state.search;
    const filtered = filterLessons(c, state);
    $('lesson-count').textContent = `${filtered.length} lessons`;
    $('picker-current').textContent = `${c.title} · ${lesson().id}`;
    $('lesson-list').innerHTML = filtered.length ? filtered.map(l => `<a class="flg-lesson-link ${l.id === state.lesson ? 'is-selected' : ''}" href="${escape(hashFor({ course: c.id, lesson: l.id, branch: l.branch || state.branch, mode: state.mode }))}" data-lesson="${escape(l.id)}" ${l.id === state.lesson ? 'aria-current="true"' : ''}><span class="flg-lesson-meta">${escape(l.stage)} · ${escape(kinds[l.kind])}${l.optional ? ' · Optional' : ''}</span><span><span class="flg-lesson-number">${escape(l.id)}</span> ${escape(l.title)}</span></a>`).join('') : '<p class="flg-empty">No lessons match these filters.</p><button type="button" data-action="clear-filters">Clear filters</button>';
  }
  function sourcesHTML(refs) {
    return (refs || []).map(ref => `<li>${urlLink(ref)}${ref.edition ? `<small>${escape(ref.edition)}</small>` : ''}${ref.pages ? `<small>Source pages ${escape(ref.pages)}</small>` : ''}</li>`).join('');
  }
  function renderOverview(plan) {
    const c = course(), l = lesson();
    $('guide-path').textContent = c.title;
    $('guide-lesson-title').textContent = `${l.id} · ${l.title}`;
    $('lesson-context').innerHTML = `<span class="flg-kind">${escape(kinds[l.kind])}</span><span>${escape(stageName(l.stage))}</span>${l.branch ? `<span>${escape(branchName(l.branch))}</span>` : ''}${l.optional ? '<span>Optional lesson</span>' : ''}`;
    $('lesson-summary').textContent = l.summary;
    $('course-alignment').innerHTML = `<span class="flg-source-status">${escape(sourceStatus(c))}</span><p>${escape(c.alignment)}</p>`;
    $('course-context').innerHTML = `<p>${escape(c.overview)}</p>${list(c.entryRequirements)}<ul class="flg-source-list">${sourcesHTML(c.sources)}</ul>`;
    $('lesson-applicability').textContent = l.applicability || '';
    const isGround = l.kind === 'ground', isDevice = l.kind === 'device';
    $('lesson-metrics').innerHTML = isGround ? `<div><dt>Discussion target</dt><dd>${minutes((l.sourceTime || {}).discussion)}</dd></div><div><dt>Before flight</dt><dd>Ground preparation</dd></div>` : `<div><dt>${isDevice ? 'Recommended device plan' : 'Recommended flight plan'}</dt><dd>${plan.total} <small>min</small></dd></div>${!isDevice ? `<div><dt>Airborne from takeoff</dt><dd>${plan.airborne} <small>min</small></dd></div>` : ''}<div><dt>Brief / debrief</dt><dd>${cleanMinutes(l.briefingMinutes)} / ${cleanMinutes(l.debriefMinutes)} <small>min</small></dd></div><div><dt>Parked preflight</dt><dd>${cleanMinutes(l.preflightMinutes)} <small>min</small></dd></div>`;
    const clarification = [l.sourceNote, l.timingNote].filter(Boolean).map(note => `<p>${escape(note)}</p>`).join('');
    $('preparation-content').innerHTML = `<div><h3>What you are teaching</h3>${list(l.objectives)}${l.briefing && l.briefing.length ? `<h3>Brief together · ${cleanMinutes(l.briefingMinutes)} min</h3>${list(l.briefing)}` : ''}</div><div><h3>Ready before this lesson</h3>${list(l.prerequisites)}${l.preparation && l.preparation.length ? `<ul class="flg-source-list">${l.preparation.map(p => `<li>${urlLink(p)}</li>`).join('')}</ul>` : ''}</div>${l.preflightGuide && l.preflightGuide.length ? `<div class="flg-preflight-guide"><h3>Parked preflight · ${cleanMinutes(l.preflightMinutes)} min</h3>${list(l.preflightGuide)}</div>` : ''}${clarification ? `<aside class="flg-source-clarification"><h3>Source clarification</h3>${clarification}</aside>` : ''}`;
    const sourceTime = l.sourceTime || {};
    const fields = [['flight', 'Flight / device target'], ['discussion', 'Discussion (separate)'], ['dual', 'Dual'], ['solo', 'Solo'], ['pic', 'PIC'], ['device', 'Device'], ['instrument', 'Instrument (overlaps flight)']];
    const targets = fields.filter(([key]) => sourceTime[key] != null);
    $('timing-source').innerHTML = `<p>${escape(l.timingLabel)}</p>${targets.length ? `<dl class="flg-source-times">${targets.map(([key, title]) => `<div><dt>${title}</dt><dd>${minutes(sourceTime[key])}</dd></div>`).join('')}</dl>` : '<p>These teaching allocations are authored recommendations; the publisher supplies no lesson flight-time target.</p>'}${clarification ? `<aside class="flg-source-clarification"><h3>Source clarification</h3>${clarification}</aside>` : ''}<p class="flg-fine">Briefing, parked preflight and debrief are outside the flight plan. Instrument time overlaps flight; it is not added to it.</p><ul class="flg-source-list">${sourcesHTML(l.sourceRefs)}</ul>`;
    $('completion-content').innerHTML = `<h3>Lesson completion</h3>${list(l.completion)}${l.debrief && l.debrief.length ? `<h3>Debrief prompts · ${cleanMinutes(l.debriefMinutes)} min</h3>${list(l.debrief)}` : ''}${l.carryForward && l.carryForward.length ? `<h3>Carry forward when needed</h3>${list(l.carryForward)}` : ''}${!isGround ? '<p class="flg-fine">A checkmark records a covered block in this session. Proficiency and lesson completion require instructor judgment against these criteria.</p>' : ''}`;
    $('ground-message').hidden = !isGround;
    $('flight-workspace').hidden = isGround;
    $('mode-controls').hidden = isGround;
    $('course-pdf').href = `./downloads/${encodeURIComponent(c.id)}.pdf`;
    $('course-pdf').textContent = `${c.title} PDF`;
    $('course-pdf').setAttribute('aria-label', `Download ${c.title} US Letter teaching guide PDF`);
    $('offline-pdf').textContent = state.pdfBusy ? 'Saving PDF…' : 'Keep this PDF offline';
    $('offline-pdf').disabled = state.pdfBusy || !('serviceWorker' in global.navigator);
    $('teach-mode').setAttribute('aria-pressed', String(state.mode === 'teach'));
    $('cockpit-mode').setAttribute('aria-pressed', String(state.mode === 'cockpit'));
    if (app.dataset.mode !== state.mode) app.querySelector('.flg-preparation').open = state.mode === 'teach';
    app.dataset.mode = state.mode;
    $('data-date').textContent = state.data.generatedAt ? `Library generated ${String(state.data.generatedAt).slice(0, 10)}` : '';
  }
  function timingCaption(row, kind) {
    if (kind === 'device') return `Device ${range(row.flightStart, row.flightEnd)}`;
    return `Flight ${range(row.flightStart, row.flightEnd)} · ${row.airborne ? 'Takeoff +' + range(row.airStart, row.airEnd) : row.groundPosition}`;
  }
  function renderStepText(row, kind) {
    return `<div class="flg-step-cues"><section><h4>${kind === 'solo' || kind === 'pic' ? 'Instructor supervision / preparation' : kind === 'check' ? 'Examiner / check instructor' : 'Instructor cue'}</h4><p>${escape(row.instructor)}</p></section><section><h4>${kind === 'check' ? 'Candidate task' : 'Student action'}</h4><p>${escape(row.student)}</p></section></div><div class="flg-step-observe"><p><strong>Practice:</strong> ${escape(row.repetitions)}</p><p><strong>Look for:</strong> ${escape(row.success)}</p></div><details class="flg-errors"><summary>Errors and corrections</summary>${list(row.errors)}</details><p class="flg-stop"><strong>Stop / transition:</strong> ${escape(row.stop)}</p><p class="flg-reference">${escape(row.reference)}</p>`;
  }
  function coverLabel(row, suffix) {
    return `<label class="flg-cover"><input type="checkbox" data-cover="${escape(row.id)}" id="covered-${escape(row.id)}-${suffix}" ${session().covered.has(row.id) ? 'checked' : ''}><span>Covered this block <small>${row.required ? 'Required task' : 'Optional task'}</small></span></label>`;
  }
  function renderTimingEditor(plan) {
    const l = lesson();
    $('pacing-editor').hidden = l.kind === 'ground';
    $('pacing-description').textContent = l.kind === 'device' ? 'Device session time covers the complete exercise sequence. Edit today’s session budget without removing lesson tasks. Briefing and debrief are separate.' : 'Flight time includes taxi, departure, practice, return and taxi in. Edit expected ground movement / transit without removing lesson tasks.';
    const editable = plan.rows.filter(s => editablePhases.has(s.phase));
    $('pacing-fields').innerHTML = `<label class="flg-budget-field">${l.kind === 'device' ? 'Device session budget' : 'Whole-flight budget'} <span>minutes</span><input type="number" inputmode="numeric" min="1" max="1440" step="1" id="flight-budget" value="${plan.budget}"></label>${editable.map(s => `<label>${escape(s.title)} <span>minutes</span><input type="number" inputmode="numeric" min="${s.required ? 1 : 0}" max="1440" step="1" value="${s.plannedMinutes}" data-pacing="${escape(s.id)}"></label>`).join('')}`;
    const instrumentTarget = (l.sourceTime || {}).instrument, instrumentNeedsMore = l.kind !== 'device' && instrumentTarget != null && instrumentTarget > plan.airborne;
    const instrumentBlockShort = plan.rows.some(row => Number.isInteger(row.instrumentMinutes) && row.instrumentMinutes > row.plannedMinutes);
    const pacingMessage = plan.overbooked ? `The complete sequence needs ${plan.total} min: ${plan.overbooked} min over your budget. No task has been removed. Increase the budget or plan another flight.` : plan.compressed ? 'Practice is shorter than the recommended allocation. Keep all tasks; plan additional practice rather than rushing to finish.' : plan.changed ? 'Session pacing adjusted. The task sequence and completion criteria are unchanged.' : 'Edit today’s taxi or transit estimate and whole-flight budget. Remaining practice time is redistributed; required tasks stay in the sequence.';
    $('pacing-note').textContent = pacingMessage + (instrumentNeedsMore ? ` The publisher instrument target is ${instrumentTarget} min, but today’s airborne plan is ${plan.airborne} min. Extend the flight or plan additional eligible instrument work; taxi is not instrument time.` : '') + (instrumentBlockShort ? ' One or more instrument blocks are shorter than their authored instrument-work allocation. Extend those blocks or plan additional eligible instrument work before using the published target.' : '');
    $('pacing-note').classList.toggle('is-warning', plan.overbooked > 0 || plan.compressed || instrumentNeedsMore || instrumentBlockShort);
  }
  function renderFlight(plan) {
    const l = lesson();
    if (!plan.rows.length) return;
    if (!plan.rows.some(s => s.id === state.active)) state.active = plan.rows[0].id;
    const current = plan.rows.find(s => s.id === state.active), index = plan.rows.indexOf(current);
    $('timeline-clock-note').innerHTML = l.kind === 'device' ? 'Device clock counts exercise minutes.<br>No airborne time is created.' : 'Flight clock includes taxi.<br>Takeoff + counts airborne minutes.';
    $('flight-timeline').innerHTML = plan.rows.map((s, i) => `<button type="button" data-step="${escape(s.id)}" ${s.id === state.active ? 'aria-current="step"' : ''} class="flg-timeline-step ${session().covered.has(s.id) ? 'is-covered' : ''}"><span class="flg-step-index">${i + 1}</span><span><strong>${escape(s.title)}</strong><small>${escape(timingCaption(s, l.kind))}</small><small data-covered-state="${escape(s.id)}">${s.required ? 'Required' : 'Optional'}${session().covered.has(s.id) ? ' · Covered' : ''}</small></span><span class="flg-step-duration">${s.plannedMinutes}<small>min</small></span></button>`).join('');
    $('step-position').textContent = `Block ${index + 1} of ${plan.rows.length} · ${current.phase.replace('-', ' ')}`;
    $('active-step-title').textContent = current.title;
    $('active-step-time').textContent = timingCaption(current, l.kind);
    $('active-step-content').innerHTML = renderStepText(current, l.kind);
    $('active-step-check').innerHTML = coverLabel(current, 'active');
    $('previous-step').disabled = index === 0;
    $('next-step').disabled = index === plan.rows.length - 1;
    $('next-step').textContent = index === plan.rows.length - 1 ? 'Last block' : 'Next block →';
    $('teach-step-list').innerHTML = plan.rows.map((s, i) => `<details class="flg-teach-step" open><summary><span class="flg-step-index">${i + 1}</span><span>${escape(s.title)}<small>${escape(timingCaption(s, l.kind))}</small></span><span>${s.plannedMinutes} min</span></summary><div class="flg-teach-step-body">${renderStepText(s, l.kind)}<div class="flg-step-footer">${coverLabel(s, 'teach')}<button type="button" class="flg-quiet" data-step="${escape(s.id)}">Focus this block</button></div></div></details>`).join('');
    renderTimingEditor(plan);
    updateCoverage(); updateTimer();
  }
  function updateCoverage() {
    const l = lesson(), covered = session().covered;
    $('coverage-status').textContent = `${l.steps.filter(s => covered.has(s.id)).length} of ${l.steps.length} blocks covered · temporary checklist`;
    app.querySelectorAll('[data-cover]').forEach(input => { input.checked = covered.has(input.dataset.cover); });
    app.querySelectorAll('[data-step]').forEach(button => { button.classList.toggle('is-covered', covered.has(button.dataset.step)); });
    app.querySelectorAll('[data-covered-state]').forEach(label => { const step = l.steps.find(s => s.id === label.dataset.coveredState); if (step) label.textContent = `${step.required ? 'Required' : 'Optional'}${covered.has(step.id) ? ' · Covered' : ''}`; });
  }
  function updateTimer() {
    if (!state.data || !state.active || lesson().kind === 'ground') return;
    const t = timer(), amount = elapsed(t), plan = timingPlan(lesson(), session().overrides, session().budget), current = plan.rows.find(s => s.id === state.active);
    if (!current) return;
    $('timer-value').textContent = clock(amount);
    $('timer-toggle').textContent = t.started != null ? 'Pause timer' : amount > 0 ? 'Resume timer' : 'Start timer';
    $('timer-toggle').setAttribute('aria-pressed', String(t.started != null));
    $('timer-attempt').textContent = `Attempt ${t.attempt} · planned ${current.plannedMinutes} min`;
    $('timer-state').textContent = amount >= current.plannedMinutes * 60000 ? 'Planned time reached. Assess proficiency; continue or repeat as needed.' : t.started != null ? 'Running · you decide when to move on.' : amount > 0 ? 'Paused' : 'Ready when you are.';
  }
  function render() {
    if (!state.data) return;
    const plan = timingPlan(lesson(), session().overrides, session().budget);
    renderPicker(); renderOverview(plan); renderFlight(plan);
    $('load-state').hidden = true; $('guide-workbench').hidden = false;
  }
  function focusBlock(id) {
    pauseAll(); state.active = id;
    renderFlight(timingPlan(lesson(), session().overrides, session().budget));
    if (state.mode === 'cockpit') { $('active-step-title').focus({ preventScroll: true }); $('active-step-panel').scrollIntoView({ behavior: 'auto', block: 'start' }); }
    announce(`Block selected: ${$('active-step-title').textContent}. Timer paused.`);
  }
  app.addEventListener('click', async event => {
    const target = event.target.closest('button, a[data-lesson]');
    if (!target) return;
    if (target.dataset.lesson) {
      event.preventDefault();
      const l = course().lessons.find(l => l.id === target.dataset.lesson);
      selectRoute({ course: state.course, lesson: l.id, branch: l.branch || state.branch, mode: state.mode }, true);
      if (global.matchMedia('(max-width: 900px)').matches) $('lesson-browser').open = false;
      $('guide-lesson-title').focus({ preventScroll: true }); $('lesson-reader').scrollIntoView({ behavior: 'auto', block: 'start' });
      return;
    }
    if (target.dataset.step) { focusBlock(target.dataset.step); return; }
    switch (target.id || target.dataset.action) {
      case 'load-retry': await loadData(); break;
      case 'clear-filters': state.stage = ''; state.kind = ''; state.search = ''; renderPicker(); $('lesson-search').focus(); break;
      case 'teach-mode': case 'cockpit-mode':
        state.mode = target.id === 'teach-mode' ? 'teach' : 'cockpit'; render(); updateHash(); $(target.id).focus(); break;
      case 'timer-toggle': {
        const t = timer();
        if (t.started != null) { t.elapsed = elapsed(t); t.started = null; }
        else { pauseAll(); t.started = Date.now(); }
        updateTimer(); break;
      }
      case 'timer-reset': { const t = timer(); t.started = null; t.elapsed = 0; updateTimer(); announce('Current block timer reset. Checklist unchanged.'); break; }
      case 'timer-repeat': { const t = timer(); t.started = null; t.elapsed = 0; t.attempt++; session().covered.delete(state.active); updateTimer(); updateCoverage(); announce('Repeat attempt ready. Start the timer when ready; this block is no longer marked covered.'); break; }
      case 'previous-step': case 'next-step': {
        const steps = lesson().steps, index = steps.findIndex(s => s.id === state.active), next = index + (target.id === 'previous-step' ? -1 : 1);
        if (steps[next]) focusBlock(steps[next].id); break;
      }
      case 'reset-lesson': pauseAll(); state.sessions.delete(sessionKey()); state.active = (lesson().steps[0] || {}).id || ''; render(); announce('Temporary checklist, timers and timing edits reset for this lesson.'); $('reset-lesson').focus(); break;
      case 'restore-pacing': session().overrides = {}; session().budget = null; render(); announce('Recommended timing restored. Checklist unchanged.'); $('restore-pacing').focus(); break;
      case 'print-lesson': global.print(); break;
      case 'share-lesson': {
        updateHash();
        try { await global.navigator.clipboard.writeText(global.location.href); announce('Lesson link copied. It includes the pathway, branch and view, with no checklist or timer state.'); }
        catch (_) { announce('The address bar contains this lesson’s shareable link. Copy it to share.'); }
        break;
      }
      case 'offline-pdf': await cachePDF(); break;
    }
  });
  app.addEventListener('change', event => {
    const target = event.target;
    if (target.dataset.cover) {
      if (target.checked) session().covered.add(target.dataset.cover); else session().covered.delete(target.dataset.cover);
      updateCoverage(); return;
    }
    if (target.id === 'course-select') { selectRoute({ course: target.value, mode: state.mode }, true); return; }
    if (target.id === 'branch-select') {
      pauseAll(); state.branch = target.value; state.stage = '';
      if (!eligible(lesson(), state.branch)) { state.lesson = course().lessons.find(l => eligible(l, state.branch)).id; state.active = (lesson().steps[0] || {}).id || ''; }
      render(); updateHash(); announce(`${branchName(state.branch)} selected. Common lessons and this branch are shown.`); return;
    }
    if (target.id === 'stage-select' || target.id === 'kind-select') { state[target.id === 'stage-select' ? 'stage' : 'kind'] = target.value; renderPicker(); return; }
    if (target.dataset.pacing || target.id === 'flight-budget') {
      const value = Number(target.value), selectedId = target.dataset.pacing;
      if (!Number.isInteger(value) || value < Number(target.min) || value > 1440 || target.value === '') { announce('Enter a whole number of minutes within the field limits.'); target.setAttribute('aria-invalid', 'true'); return; }
      target.removeAttribute('aria-invalid');
      if (selectedId) session().overrides[selectedId] = value; else session().budget = value;
      const panel = $('pacing-editor'), wasOpen = panel.open;
      render(); panel.open = wasOpen;
      const updated = selectedId ? app.querySelector(`[data-pacing="${global.CSS && global.CSS.escape ? global.CSS.escape(selectedId) : selectedId.replace(/["\\]/g, '\\$&')}"]`) : $('flight-budget');
      if (updated) updated.focus();
      announce($('pacing-note').textContent);
    }
  });
  $('lesson-search').addEventListener('input', event => { state.search = event.target.value; renderPicker(); });
  global.addEventListener('hashchange', () => { if (state.data) selectRoute(parseHash(global.location.hash)); });
  global.addEventListener('popstate', () => { if (state.data) selectRoute(parseHash(global.location.hash)); });
  let printDetails = [];
  global.addEventListener('beforeprint', () => { printDetails = [...app.querySelectorAll('.flg-reader details')].map(element => [element, element.open]); printDetails.forEach(([element]) => { element.open = true; }); });
  global.addEventListener('afterprint', () => { printDetails.forEach(([element, open]) => { element.open = open; }); printDetails = []; });
  global.setInterval(updateTimer, 1000);
  async function workerMessage(message) {
    if (!('serviceWorker' in global.navigator)) throw new Error('Offline storage is not available in this browser.');
    const registration = await global.navigator.serviceWorker.getRegistration('/flight-lesson-guide/');
    const worker = registration && registration.active;
    if (!worker) throw new Error('Offline preparation is not ready. Keep this page open and try again.');
    return new Promise((resolve, reject) => {
      const channel = new MessageChannel();
      const timeout = global.setTimeout(() => reject(new Error('Offline storage did not respond. Try again while online.')), 30000);
      channel.port1.onmessage = event => { global.clearTimeout(timeout); channel.port1.close(); if (event.data && event.data.ok) resolve(event.data); else reject(new Error(event.data && event.data.error || 'Offline storage could not finish.')); };
      worker.postMessage(message, [channel.port2]);
    });
  }
  async function prepareOffline() {
    if (!('serviceWorker' in global.navigator)) { $('offline-status').textContent = 'Offline storage unavailable in this browser.'; return; }
    try {
      $('offline-status').textContent = 'Preparing the offline guide…';
      await global.navigator.serviceWorker.register('./sw.js', { scope: './' });
      await global.navigator.serviceWorker.ready;
      const result = await workerMessage({ type: 'STATUS' });
      $('offline-status').textContent = result.ready ? 'Guide available offline on this device.' : 'Keep the guide open online to prepare offline access.';
    } catch (_) { $('offline-status').textContent = 'Offline preparation unavailable. The online guide is usable.'; }
  }
  async function cachePDF() {
    if (state.pdfBusy) return;
    const c = course(); state.pdfBusy = true; $('offline-pdf').disabled = true; $('offline-pdf').textContent = 'Saving PDF…';
    try { await workerMessage({ type: 'CACHE_PDF', course: c.id }); announce(`${c.title} PDF saved for offline use on this device.`); }
    catch (error) { announce(error.message); }
    finally { state.pdfBusy = false; $('offline-pdf').disabled = false; $('offline-pdf').textContent = 'Keep this PDF offline'; }
  }
  async function loadData() {
    const attempt = ++state.loadAttempt;
    $('load-state').hidden = false; $('load-state-title').textContent = 'Loading the lesson library…'; $('load-state-text').textContent = 'Preparing the authored course sequences and source references.'; $('load-retry').hidden = true;
    try {
      const response = await global.fetch('./data/courses.json', { cache: 'no-cache' });
      if (!response.ok) throw new Error('The lesson library could not be downloaded.');
      const data = validatePayload(await response.json());
      if (attempt !== state.loadAttempt) return;
      state.data = data; selectRoute(parseHash(global.location.hash));
      if (global.matchMedia('(max-width: 900px)').matches) $('lesson-browser').open = false;
      prepareOffline();
    } catch (error) {
      if (attempt !== state.loadAttempt) return;
      $('guide-workbench').hidden = true; $('load-state-title').textContent = 'Lesson library unavailable'; $('load-state-text').textContent = `${error.message} Reconnect and retry. An offline copy is available only after a successful online visit.`; $('load-retry').hidden = false;
    }
  }
  loadData();
})(typeof window !== 'undefined' ? window : globalThis);
