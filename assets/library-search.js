(function () {
  'use strict';
  const mount = document.getElementById('library-search');
  if (!mount) return;
  const browse = document.getElementById('library-browse');
  const pageSize = 20;
  let rows = [], loaded = false, failed = false, shown = pageSize, timer;
  const panel = document.createElement('section');
  panel.className = 'library-search-panel';
  panel.setAttribute('aria-labelledby', 'library-search-title');
  panel.innerHTML = '<h2 id="library-search-title">Find a lesson</h2><p class="library-search-intro">Search lessons and endorsement references by question, topic, or training stage.</p><div class="library-search-controls"><label class="library-search-label">Search lessons<input class="library-search-input" type="search" autocomplete="off" placeholder="Try weather, checkride, or radio" aria-controls="library-search-results"></label><label class="library-search-label">Topic<select class="library-search-select" id="library-search-topic" aria-controls="library-search-results"><option value="">All topics</option></select></label><label class="library-search-label">Training stage<select class="library-search-select" id="library-search-stage" aria-controls="library-search-results"><option value="">All stages</option><option>Exploring</option><option>Student pilot</option><option>Instrument</option><option>Commercial</option><option>CFI</option></select></label><button class="library-search-clear" type="button" hidden>Clear filters</button></div><p class="library-search-status" role="status" aria-live="polite"></p><div class="library-search-results" id="library-search-results"></div><button class="library-search-more" type="button" hidden>Show more lessons</button>';
  mount.appendChild(panel);
  const input = panel.querySelector('.library-search-input');
  const topic = panel.querySelector('#library-search-topic');
  const stage = panel.querySelector('#library-search-stage');
  const clear = panel.querySelector('.library-search-clear');
  const status = panel.querySelector('.library-search-status');
  const results = panel.querySelector('.library-search-results');
  const more = panel.querySelector('.library-search-more');
  const safePath = value => typeof value === 'string' && /^\/(?!\/)[^<>"'\\]*$/.test(value);
  const stages = row => Array.isArray(row.stages) ? row.stages : row.stage ? [row.stage] : [];
  const active = () => !!(input.value.trim() || topic.value || stage.value);
  function setView(view) {
    const paths = document.getElementById('library-paths'), topics = document.getElementById('library-topics');
    if (!paths || !topics) return;
    paths.hidden = view !== 'paths'; topics.hidden = view !== 'topics';
    document.querySelectorAll('[data-library-view]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.libraryView === view)));
  }
  document.querySelectorAll('[data-library-view]').forEach(button => button.addEventListener('click', () => setView(button.dataset.libraryView)));
  function fromURL() {
    const params = new URLSearchParams(window.location.search);
    input.value = params.get('q') || ''; topic.value = params.get('topic') || ''; stage.value = params.get('stage') || '';
    shown = pageSize; render();
  }
  function toURL() {
    const url = new URL(window.location.href);
    [['q', input.value.trim()], ['topic', topic.value], ['stage', stage.value]].forEach(([key, value]) => value ? url.searchParams.set(key, value) : url.searchParams.delete(key));
    if (url.href !== window.location.href) window.history.pushState(null, '', url.href);
  }
  function filtered() {
    const needle = input.value.trim().toLocaleLowerCase();
    return rows.filter(row => {
      const words = [row.title, row.description, row.category, row.categoryLabel, ...stages(row)].join(' ').toLocaleLowerCase();
      return (!needle || words.includes(needle)) && (!topic.value || row.category === topic.value) && (!stage.value || stages(row).includes(stage.value));
    });
  }
  function resultNode(row) {
    const article = document.createElement('article'); article.className = 'library-search-result';
    const link = document.createElement('a'); link.className = 'library-search-result-title'; link.href = row.path; link.textContent = row.title; article.appendChild(link);
    if (row.description) { const desc = document.createElement('p'); desc.className = 'library-search-result-description'; desc.textContent = row.description; article.appendChild(desc); }
    const meta = document.createElement('p'); meta.className = 'library-search-result-meta'; meta.textContent = [row.categoryLabel || row.category, stages(row).join(', ')].filter(Boolean).join(' · '); article.appendChild(meta);
    return article;
  }
  function render() {
    const exploring = active();
    if (browse) browse.hidden = exploring && !failed;
    clear.hidden = !exploring; results.replaceChildren(); more.hidden = true;
    if (failed) { status.textContent = 'The lesson search is temporarily unavailable. Browse the collections below.'; if (browse) browse.hidden = false; return; }
    if (!loaded) { status.textContent = 'Loading lessons…'; return; }
    if (!exploring) { status.textContent = rows.length + ' lessons and endorsement references available. Choose a training path or topic below.'; return; }
    const found = filtered(); status.textContent = found.length + ' result' + (found.length === 1 ? '' : 's') + ' found';
    found.slice(0, shown).forEach(row => results.appendChild(resultNode(row)));
    if (!found.length) { const empty = document.createElement('p'); empty.className = 'library-search-empty'; empty.textContent = 'No lessons match those filters. Clear filters or try a broader term.'; results.appendChild(empty); }
    more.hidden = found.length <= shown;
  }
  function changed() { shown = pageSize; window.clearTimeout(timer); timer = window.setTimeout(() => { toURL(); render(); }, 180); }
  input.addEventListener('input', changed); topic.addEventListener('change', changed); stage.addEventListener('change', changed);
  clear.addEventListener('click', () => { input.value = ''; topic.value = ''; stage.value = ''; changed(); input.focus(); });
  more.addEventListener('click', () => { shown += pageSize; render(); });
  window.addEventListener('popstate', fromURL);
  fromURL();
  fetch(mount.dataset.index || '/assets/library-index.json', { headers: { Accept: 'application/json' } }).then(response => { if (!response.ok) throw Error('index unavailable'); return response.json(); }).then(data => {
    if (!Array.isArray(data)) throw Error('invalid index');
    rows = data.filter(row => row && typeof row.title === 'string' && safePath(row.path));
    const categories = {}; rows.forEach(row => { if (row.category) categories[row.category] = row.categoryLabel || row.category; });
    Object.keys(categories).sort((a,b) => categories[a].localeCompare(categories[b])).forEach(key => { const option = document.createElement('option'); option.value = key; option.textContent = categories[key]; topic.appendChild(option); });
    loaded = true; fromURL();
  }).catch(() => { failed = true; render(); });
})();
