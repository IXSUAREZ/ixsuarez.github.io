/* Retire only this guide's previously public offline storage. */
const CACHE_PREFIX = 'flight-lesson-guide-';
self.addEventListener('install', event => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', event => event.waitUntil((async () => {
  const keys = await caches.keys();
  await Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX)).map(key => caches.delete(key)));
  await self.clients.claim();
  const tabs = await self.clients.matchAll({type:'window',includeUncontrolled:true});
  await self.registration.unregister();
  for (const tab of tabs) {
    const url = new URL(tab.url);
    if (url.origin === self.location.origin && url.pathname.startsWith('/flight-lesson-guide/')) await tab.navigate('/flight-lesson-guide/' + url.hash);
  }
})()));
