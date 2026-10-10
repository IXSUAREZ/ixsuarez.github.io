/* Only authored guide assets and explicitly named shared chrome are cached.
   Public source links, other tools, APIs and session state never enter this cache. */
const CACHE_PREFIX = 'flight-lesson-guide-';
const CACHE_NAME = CACHE_PREFIX + 'fe32551c5cb6';
const BASE = '/flight-lesson-guide/';
const CORE = [BASE, BASE + 'index.html', BASE + 'app.js', BASE + 'styles.css', BASE + 'manifest.webmanifest', BASE + 'data/courses.json', '/assets/appearance.js', '/assets/avionics.css', '/assets/design-system.css', '/assets/site-nav.js', '/assets/tactile.js', '/assets/site-footer.css', '/assets/site-footer.js', '/assets/avionics-icons.svg'];
const ICONS = ['logo.png', 'icon-48.png', 'icon-192.png', 'icon-180.png'].map(file => '/assets/identities/flight-lesson-guide/' + file);
const COURSES = ['private', 'sport', 'instrument', 'commercial', 'cfi', 'cfii', 'mei', 'mei-addon'];
const PDFS = COURSES.map(id => BASE + 'downloads/' + id + '.pdf');
const ALLOWED = new Set([...CORE, ...ICONS, ...PDFS]);
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(async cache => {
    await cache.addAll(CORE);
    await Promise.all(ICONS.map(async path => { try { const response = await fetch(path); if (response.ok) await cache.put(path, response); } catch (_) {} }));
  }).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request, url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || !ALLOWED.has(url.pathname)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const fallback = async () => await cache.match(request) || await cache.match(url.pathname);
    // Keep authored sequences and shared chrome fresh online, usable offline.
    try {
      const response = await fetch(request);
      if (response.ok) { try { await cache.put(request, response.clone()); } catch (_) {} return response; }
      return await fallback() || response;
    } catch (_) { return await fallback() || Response.error(); }
  })());
});
self.addEventListener('message', event => {
  const reply = data => { if (event.ports && event.ports[0]) event.ports[0].postMessage(data); };
  if (!event.data || !['STATUS', 'CACHE_PDF'].includes(event.data.type)) return;
  event.waitUntil((async () => {
    try {
      const cache = await caches.open(CACHE_NAME);
      if (event.data.type === 'STATUS') {
        const ready = Boolean(await cache.match(BASE + 'data/courses.json')) && Boolean(await cache.match(BASE + 'app.js'));
        reply({ ok: true, ready }); return;
      }
      const id = event.data.course;
      if (!COURSES.includes(id)) throw new Error('Unknown course PDF.');
      const path = BASE + 'downloads/' + id + '.pdf';
      let response;
      try { response = await fetch(path); } catch (_) { response = await cache.match(path); }
      if (!response || !response.ok || !String(response.headers.get('Content-Type')).includes('application/pdf')) throw new Error('The PDF is not available. Connect to the internet and try again.');
      await cache.put(path, response.clone()); reply({ ok: true, course: id });
    } catch (error) { reply({ ok: false, error: error.message || 'Offline storage could not finish.' }); }
  })());
});
