(function () {
  const cards = window.FOI_CARDS;
  const progressKey = 'suarez-cfi-foi-cards-v2';
  const sessionKey = 'suarez-cfi-foi-cards-v3-session';
  const byId = id => document.getElementById(id);
  const cardNumber = new Map(cards.map((card, index) => [card.id, index + 1]));
  const state = { mode: 'remaining', section: null, deck: [], index: 0, touch: null };
  let progress = loadProgress();

  function loadProgress() { try { return JSON.parse(localStorage.getItem(progressKey)) || {}; } catch { return {}; } }
  function saveProgress() { localStorage.setItem(progressKey, JSON.stringify(progress)); }
  function loadSession() { try { return JSON.parse(localStorage.getItem(sessionKey)) || null; } catch { return null; } }
  function saveSession() {
    localStorage.setItem(sessionKey, JSON.stringify({
      version: 1,
      mode: state.mode,
      section: state.section,
      deckIds: state.deck.map(card => card.id),
      index: state.index
    }));
  }
  function clearSession() { localStorage.removeItem(sessionKey); }
  function statusOf(card) { return progress[card.id] || 'new'; }
  function setStatus(card, status) { progress[card.id] = status; saveProgress(); }
  function visible(id) { byId(id).classList.remove('hidden'); }
  function hidden(id) { byId(id).classList.add('hidden'); }
  function show(screen) { ['welcomeScreen','studyScreen','completionScreen'].forEach(id => hidden(id)); visible(screen); }
  function sections() { return [...new Set(cards.map(card => card.section))]; }
  function progressStats() {
    const mastered = cards.filter(card => statusOf(card) === 'mastered').length;
    const review = cards.filter(card => statusOf(card) === 'review').length;
    return { mastered, review, left: cards.length - mastered, total: cards.length };
  }
  function pendingSession() {
    const saved = loadSession();
    if (!saved || !Array.isArray(saved.deckIds) || !saved.deckIds.length || !Number.isInteger(saved.index)) return null;
    const deck = saved.deckIds.map(id => cards.find(card => card.id === id)).filter(Boolean);
    if (deck.length !== saved.deckIds.length || saved.index < 0 || saved.index >= deck.length) return null;
    return { mode: saved.mode === 'review' ? 'review' : 'remaining', section: typeof saved.section === 'string' ? saved.section : null, deck, index: saved.index };
  }
  function renderWelcome() {
    const { left, review, total } = progressStats();
    const saved = pendingSession();
    byId('welcomeSummary').innerHTML = `<strong>${total} source-faithful cards</strong> across ${sections().length} FOI topics.<br>${left} left to memorize · ${review} review later`;
    byId('startButton').innerHTML = saved
      ? `Resume pass <span aria-hidden="true">→</span>`
      : `Start remaining cards <span aria-hidden="true">→</span>`;
    byId('startHint').textContent = saved
      ? `Resume at Card ${cardNumber.get(saved.deck[saved.index].id)} of ${cards.length} · This pass: ${saved.index + 1} of ${saved.deck.length}`
      : 'A pass advances once through each card you have not marked Memorized.';
    byId('startFreshButton').classList.toggle('hidden', !saved);
    show('welcomeScreen');
  }
  function cardsForPass(mode = 'remaining', section = null) {
    return cards.filter(card => {
      if (section && card.section !== section) return false;
      return mode === 'review' ? statusOf(card) === 'review' : statusOf(card) !== 'mastered';
    });
  }
  function startPass(mode = 'remaining', section = null) {
    state.mode = mode;
    state.section = section;
    state.deck = cardsForPass(mode, section);
    state.index = 0;
    if (!state.deck.length) return complete();
    saveSession();
    show('studyScreen');
    renderCard();
  }
  function resumePass() {
    const saved = pendingSession();
    if (!saved) return startPass('remaining');
    Object.assign(state, saved);
    show('studyScreen');
    renderCard();
  }
  function renderCard() {
    const card = state.deck[state.index];
    if (!card) return complete();
    const el = byId('flashcard');
    el.classList.remove('flipped','dismiss-left','dismiss-right');
    byId('cardSection').textContent = card.section;
    byId('sectionButton').textContent = card.section;
    byId('cardPrompt').textContent = card.prompt;
    byId('cardAnswer').textContent = card.answer;
    const { left, review, total } = progressStats();
    byId('cardProgress').textContent = `Card ${cardNumber.get(card.id)} of ${total}`;
    byId('passProgress').textContent = `This pass: ${state.index + 1} of ${state.deck.length}`;
    byId('remainingProgress').textContent = `${left} left to memorize · ${review} review later`;
    byId('progressFill').style.width = `${(state.index / state.deck.length) * 100}%`;
    byId('swipeStatus').textContent = 'Flip the card, then choose Review, Next, or Memorized.';
    syncStudyControls(false);
  }
  function syncStudyControls(flipped) {
    const actions = byId('actions');
    const flipButton = byId('flipButton');
    if (actions) actions.setAttribute('aria-hidden', String(!flipped));
    if (flipButton) flipButton.classList.toggle('hidden', flipped);
  }
  function flip() {
    const el = byId('flashcard');
    el.classList.toggle('flipped');
    const flipped = el.classList.contains('flipped');
    syncStudyControls(flipped);
    byId('swipeStatus').textContent = flipped
      ? 'Swipe left to review, right if memorized, or use Next to continue without rating.'
      : 'Flip the card, then choose Review, Next, or Memorized.';
  }
  function advance(status = null) {
    const card = state.deck[state.index];
    if (!card) return complete();
    if (status) setStatus(card, status);
    const el = byId('flashcard');
    if (status) el.classList.add(status === 'mastered' ? 'dismiss-right' : 'dismiss-left');
    state.index += 1;
    if (state.index >= state.deck.length) {
      clearSession();
    } else {
      saveSession();
    }
    setTimeout(() => { if (state.index >= state.deck.length) complete(); else renderCard(); }, status ? 180 : 0);
  }
  function complete() {
    clearSession();
    const { mastered, left, review, total } = progressStats();
    byId('completionText').textContent = left
      ? `${mastered} of ${total} cards are memorized. ${left} remain to memorize; ${review} are marked Review later.`
      : `All ${total} cards are marked Memorized on this phone.`;
    byId('reviewWeakButton').classList.toggle('hidden', review === 0);
    byId('studyAllButton').classList.toggle('hidden', left === 0);
    show('completionScreen');
  }
  function openSections() {
    const list = byId('sectionList');
    list.innerHTML = '';
    const all = [['All remaining cards', null, cardsForPass('remaining').length], ...sections().map(section => [section, section, cardsForPass('remaining', section).length])];
    all.forEach(([name, section, count]) => {
      const button = document.createElement('button');
      button.className = 'section-row';
      button.type = 'button';
      button.innerHTML = `${name}<span>${count} remaining card${count === 1 ? '' : 's'}</span>`;
      button.onclick = () => { hidden('sectionSheet'); startPass('remaining', section); };
      list.append(button);
    });
    visible('sectionSheet');
  }
  function reset() {
    if (window.confirm('Reset all FOI Cards progress and the saved pass on this phone?')) {
      progress = {};
      localStorage.removeItem(progressKey);
      clearSession();
      state.deck = [];
      state.index = 0;
      renderWelcome();
    }
  }
  function bindClick(id, handler) { const element = byId(id); if (element) element.addEventListener('click', handler); }
  bindClick('startButton', resumePass);
  bindClick('startFreshButton', () => startPass('remaining'));
  bindClick('reviewWeakButton', () => startPass('review'));
  bindClick('studyAllButton', () => startPass('remaining'));
  bindClick('homeButton', renderWelcome);
  bindClick('resetButton', reset);
  bindClick('sectionButton', openSections);
  bindClick('closeSheet', () => hidden('sectionSheet'));
  bindClick('flashcard', flip);
  bindClick('flipButton', flip);
  bindClick('reviewButton', () => advance('review'));
  bindClick('nextButton', () => advance());
  bindClick('masteredButton', () => advance('mastered'));
  const flashcard = byId('flashcard');
  if (flashcard) {
    flashcard.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); flip(); }
      if (event.key === 'ArrowLeft' && flashcard.classList.contains('flipped')) advance('review');
      if (event.key === 'ArrowRight' && flashcard.classList.contains('flipped')) advance('mastered');
    });
    flashcard.addEventListener('pointerdown', event => { state.touch = { x: event.clientX, y: event.clientY }; });
    flashcard.addEventListener('pointerup', event => {
      if (!state.touch || !flashcard.classList.contains('flipped')) return;
      const dx = event.clientX - state.touch.x;
      const dy = event.clientY - state.touch.y;
      state.touch = null;
      if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.25) advance(dx > 0 ? 'mastered' : 'review');
    });
  }
  renderWelcome();
})();
