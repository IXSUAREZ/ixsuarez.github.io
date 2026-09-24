/* Presentation boundary: archived instrument routes cannot reopen a legacy view. */
(function () {
  var url = new URL(window.location.href);
  if (url.searchParams.get('category') === 'flight-instruments') {
    url.searchParams.set('category', 'engines');
    url.searchParams.set('engine', '912-uls-2');
    url.searchParams.delete('item'); url.searchParams.delete('focus'); url.hash = '';
    window.history.replaceState(window.history.state, '', url);
  }
})();
