/* Static HTML remains expanded without JavaScript. Only compact layouts disclose. */
(() => {
  const footer = document.querySelector('.site-footer-v2');
  if (!footer) return;
  const groups = [...footer.querySelectorAll('.site-footer-group')];
  const compact = window.matchMedia('(max-width: 599px)');
  const choices = new Map(groups.map(group => [group, false]));
  const apply = () => {
    for (const group of groups) {
      const summary = group.querySelector('summary');
      const focusedInside = group.contains(document.activeElement) && document.activeElement !== summary;
      group.open = !compact.matches || choices.get(group) || focusedInside;
      // Desktop headings aren't interactive disclosure controls.
      summary.tabIndex = compact.matches ? 0 : -1;
      const heading=group.querySelector(".site-footer-group-title");
      if (!compact.matches && document.activeElement===summary) heading.focus({preventScroll:true});
      else if (compact.matches && document.activeElement===heading) summary.focus({preventScroll:true});
    }
  };
  for (const group of groups) {
    group.querySelector('summary').addEventListener('click', event => {
      if (!compact.matches) { event.preventDefault(); return; }
      choices.set(group, !group.open);
    });
  }
  compact.addEventListener('change', apply);
  const year = footer.querySelector('#yr');
  if (year) year.textContent = new Date().getFullYear();
  apply();
})();
