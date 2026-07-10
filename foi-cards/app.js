(function () {
  const cards = window.FOI_CARDS;
  const key = 'suarez-cfi-foi-cards-v1';
  const byId = id => document.getElementById(id);
  const state = { mode: 'all', deck: [], index: 0, touch: null };
  let progress = loadProgress();

  function loadProgress() { try { return JSON.parse(localStorage.getItem(key)) || {}; } catch { return {}; } }
  function saveProgress() { localStorage.setItem(key, JSON.stringify(progress)); }
  function statusOf(card) { return progress[card.prompt] || 'new'; }
  function setStatus(card, status) { progress[card.prompt] = status; saveProgress(); }
  function visible(id) { byId(id).classList.remove('hidden'); }
  function hidden(id) { byId(id).classList.add('hidden'); }
  function show(screen) { ['welcomeScreen','studyScreen','completionScreen'].forEach(id => hidden(id)); visible(screen); }
  function syncStudyControls(flipped) { byId('actions').setAttribute('aria-hidden', String(!flipped)); byId('flipButton').classList.toggle('hidden', flipped); }
  function progressStats() { const mastered = cards.filter(c => statusOf(c) === 'mastered').length; const review = cards.filter(c => statusOf(c) === 'review').length; return { mastered, review, total: cards.length }; }
  function renderWelcome() { const { mastered, review, total } = progressStats(); byId('welcomeSummary').innerHTML = `<strong>${total} source-faithful cards</strong> across ${sections().length} FOI topics.<br>${mastered} memorized · ${review} in your review queue`; show('welcomeScreen'); }
  function sections() { return [...new Set(cards.map(c => c.section))]; }
  function buildDeck(mode = 'all', section = null) {
    state.mode = mode; state.section = section;
    let selected = section ? cards.filter(c => c.section === section) : cards.slice();
    if (mode === 'weak') selected = selected.filter(c => statusOf(c) !== 'mastered');
    // New and review cards are prioritized; within each state, atomic cards precede recap cards.
    selected.sort((a,b) => {
      const stateOrder = ({new:0,review:1,mastered:2}[statusOf(a)] - {new:0,review:1,mastered:2}[statusOf(b)]);
      if (stateOrder) return stateOrder;
      const sourceOrder = a.sourcePage - b.sourcePage;
      if (sourceOrder) return sourceOrder;
      return (a.kind === 'recap' ? 1 : 0) - (b.kind === 'recap' ? 1 : 0);
    });
    state.deck = selected; state.index = 0;
    if (!selected.length) return complete();
    show('studyScreen'); renderCard();
  }
  function renderCard() {
    const card = state.deck[state.index]; if (!card) return complete();
    const el = byId('flashcard'); el.classList.remove('flipped','dismiss-left','dismiss-right');
    byId('cardSection').textContent = card.kind === 'recap' ? `${card.section} · recap` : card.section;
    byId('sectionButton').textContent = card.section;
    byId('cardPrompt').textContent = card.prompt;
    byId('cardAnswer').textContent = card.answer;
    const { review } = progressStats();
    byId('cardProgress').textContent = `${state.index + 1} of ${state.deck.length}${review ? ` · ${review} review${review === 1 ? '' : 's'}` : ''}`;
    byId('progressFill').style.width = `${((state.index) / state.deck.length) * 100}%`;
    byId('swipeStatus').textContent = statusOf(card) === 'mastered' ? 'Already memorized — change it if you need to.' : 'Flip the card, then rate it.';
    syncStudyControls(false);
  }
  function flip() { const el = byId('flashcard'); el.classList.toggle('flipped'); syncStudyControls(el.classList.contains('flipped')); byId('swipeStatus').textContent = el.classList.contains('flipped') ? 'Swipe left to review or right if memorized.' : 'Flip the card, then rate it.'; }
  function rate(status) {
    const card = state.deck[state.index];
    setStatus(card, status);
    const el = byId('flashcard'); el.classList.add(status === 'mastered' ? 'dismiss-right' : 'dismiss-left');
    if (status === 'review') { state.deck.splice(state.index, 1); state.deck.push(card); } else state.index += 1;
    setTimeout(() => { if (state.index >= state.deck.length || !state.deck.length) complete(); else renderCard(); }, 180);
  }
  function complete() { const { mastered, review } = progressStats(); byId('completionText').textContent = review ? `${mastered} cards are marked memorized. ${review} card${review === 1 ? '' : 's'} remain in your review queue.` : `All ${mastered} cards are marked memorized on this phone.`; byId('reviewWeakButton').classList.toggle('hidden', review === 0); show('completionScreen'); }
  function openSections() { const list = byId('sectionList'); list.innerHTML = ''; const stats = progressStats(); const all = [['All FOI cards', cards.length], ...sections().map(s => [s, cards.filter(c => c.section === s).length])]; all.forEach(([name,count]) => { const button = document.createElement('button'); button.className='section-row'; button.type='button'; button.innerHTML = `${name}<span>${count} cards</span>`; button.onclick=()=>{ hidden('sectionSheet'); buildDeck('all', name === 'All FOI cards' ? null : name); }; list.append(button); }); visible('sectionSheet'); }
  function reset() { if (window.confirm('Reset all FOI Cards progress on this phone?')) { progress={}; saveProgress(); renderWelcome(); } }
  byId('startButton').onclick=()=>buildDeck('all'); byId('reviewWeakButton').onclick=()=>buildDeck('weak'); byId('studyAllButton').onclick=()=>buildDeck('all'); byId('homeButton').onclick=renderWelcome; byId('resetButton').onclick=reset; byId('sectionButton').onclick=openSections; byId('closeSheet').onclick=()=>hidden('sectionSheet'); byId('flashcard').onclick=flip; byId('flipButton').onclick=flip;
  byId('flashcard').onkeydown=e=>{ if (e.key==='Enter'||e.key===' ') { e.preventDefault(); flip(); } if (e.key==='ArrowLeft'&&byId('flashcard').classList.contains('flipped')) rate('review'); if (e.key==='ArrowRight'&&byId('flashcard').classList.contains('flipped')) rate('mastered'); };
  byId('reviewButton').onclick=()=>rate('review'); byId('masteredButton').onclick=()=>rate('mastered');
  byId('flashcard').addEventListener('pointerdown', e=> { state.touch={x:e.clientX,y:e.clientY}; });
  byId('flashcard').addEventListener('pointerup', e=> { if (!state.touch || !byId('flashcard').classList.contains('flipped')) return; const dx=e.clientX-state.touch.x, dy=e.clientY-state.touch.y; state.touch=null; if (Math.abs(dx)>70 && Math.abs(dx)>Math.abs(dy)*1.25) rate(dx>0?'mastered':'review'); });
  renderWelcome();
})();
