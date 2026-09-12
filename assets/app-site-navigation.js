/* Shared-site adapter for independently built application navigation.
 * Only touches navigation links, never model state, inputs, or app controls.
 */
(function () {
  function sync() {
    document.querySelectorAll('nav a[href]').forEach(function (a) {
      if (/\/blog\/$/.test(a.getAttribute('href')) && a.textContent.trim() === 'Journal') a.textContent = 'Blog';
    });
    document.querySelectorAll('.site-navigation__drop-panel, .nav-drop-panel').forEach(function (menu) {
      if (menu.querySelector('[data-site-directory]')) return;
      var existing = Array.from(menu.querySelectorAll('a')).some(function (a) {return /\/tools\/$/.test(a.getAttribute('href'));});
      if (existing) return;
      var a=document.createElement('a');a.href='/tools/';a.setAttribute('role','menuitem');a.setAttribute('data-site-directory','');
      var title=document.createElement('strong');title.textContent='All pilot tools';a.appendChild(title);
      var detail=document.createElement('span');detail.textContent='Explore the full collection';a.appendChild(detail);menu.appendChild(a);
    });
  }
  sync();
  var root=document.getElementById('root');
  if (root) {
    var observer;
    function attach() {
      var nav=root.querySelector('nav');
      if (!nav) return false;
      if (observer) observer.disconnect();
      sync();
      new MutationObserver(sync).observe(nav,{childList:true,subtree:true});
      return true;
    }
    if (!attach()) {observer=new MutationObserver(attach);observer.observe(root,{childList:true,subtree:true});}
  }
})();
