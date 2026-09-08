/* A quiet, user-controlled sky. No motion work while offscreen or hidden. */
(() => {
  'use strict';
  const hero = document.querySelector('.horizon-hero');
  const control = document.getElementById('sky-motion');
  if (!hero || !control) return;
  const state = document.querySelector('.sky-state');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = true;
  let enabled = !reduced.matches;
  try {
    const saved = localStorage.getItem('suarezcfi.sky-motion');
    if (saved !== null) enabled = saved === 'on' && !reduced.matches;
  } catch { /* The switch also works when storage is unavailable. */ }
  function render() {
    if (reduced.matches) enabled = false;
    control.checked = enabled;
    control.disabled = reduced.matches;
    control.title = reduced.matches ? 'Motion is off to match your reduced-motion preference.' : 'Turn sky motion on or off';
    state.textContent = enabled ? 'On' : 'Off';
    hero.dataset.motion = enabled && visible && !document.hidden ? 'on' : 'off';
  }
  control.addEventListener('change', () => {
    enabled = control.checked;
    try { localStorage.setItem('suarezcfi.sky-motion', enabled ? 'on' : 'off'); } catch {}
    render();
  });
  reduced.addEventListener('change', event => { if (event.matches) enabled = false; render(); });
  document.addEventListener('visibilitychange', render);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; render(); }).observe(hero);
  }
  render();
})();
