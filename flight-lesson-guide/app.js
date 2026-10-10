/* Public entry point: no course content or authentication secrets. */
(() => {
  'use strict';
  const PRIVATE_ORIGIN = 'https://suarez-flight-guide-private.certpath-api.workers.dev';
  async function openPrivateGuide() {
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          const scope = new URL(registration.scope);
          if (scope.origin === location.origin && scope.pathname === '/flight-lesson-guide/') await registration.unregister();
        }
      }
      if ('caches' in window) {
        const names = await caches.keys();
        await Promise.all(names.filter(name => name.startsWith('flight-lesson-guide-')).map(name => caches.delete(name)));
      }
    } catch (_) { /* An online auth gate is authoritative even if local cleanup fails. */ }
    const returnTo = '/flight-lesson-guide/' + location.hash;
    location.replace(PRIVATE_ORIGIN + '/auth?return=' + encodeURIComponent(returnTo));
  }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', openPrivateGuide, {once:true});
    else openPrivateGuide();
  }
})();
