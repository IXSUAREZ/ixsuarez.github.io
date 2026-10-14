/* All apps are ordinary launch links. JavaScript only adds optional purpose filters. */
(function () {
  'use strict';
  document.querySelectorAll('[data-tool-catalog]').forEach(function (catalog) {
    var filters = catalog.querySelector('.catalog-filters');
    var items = Array.from(catalog.querySelectorAll('[data-catalog-app]'));
    var status = catalog.querySelector('[data-catalog-status]');
    if (!filters || !items.length) return;
    var buttons = Array.from(filters.querySelectorAll('[data-catalog-filter]'));

    function show(group, announce) {
      var filter = buttons.find(function (button) { return button.dataset.catalogFilter === group; });
      if (!filter) return;
      var count = 0;
      items.forEach(function (item) {
        item.hidden = group !== 'all' && item.dataset.catalogGroup !== group;
        if (!item.hidden) count += 1;
      });
      buttons.forEach(function (button) {
        button.setAttribute('aria-pressed', String(button === filter));
      });
      if (status) {
        status.textContent = announce ? count + (count === 1 ? ' app' : ' apps') + ' · ' + filter.textContent : '';
      }
    }

    filters.addEventListener('click', function (event) {
      var button = event.target.closest('[data-catalog-filter]');
      if (button && filters.contains(button)) show(button.dataset.catalogFilter, true);
    });
    // Each visit starts with the complete grid, including after a browser Back cache restoration.
    show('all', false);
    filters.hidden = false;
    window.addEventListener('pageshow', function () { show('all', false); });
  });
})();
