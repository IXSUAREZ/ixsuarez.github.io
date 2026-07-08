const CACHE_NAME = "simply-endorsed-cfi-v3";

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./site.webmanifest?v=1",
  "/simply-endorsed/css/app.css?v=42",
  "/simply-endorsed/js/shared-utils.js?v=1",
  "/simply-endorsed/js/cfr-links.js?v=3",
  "/simply-endorsed/js/endorsements-data.js?v=3",
  "/simply-endorsed/js/browse-structure.js?v=3",
  "/simply-endorsed/js/guidance-content.js?v=3",
  "/simply-endorsed/js/training-requirements-data.js?v=1",
  "/simply-endorsed/js/privileges-limitations-data.js?v=2",
  "/simply-endorsed/js/part61-rules-data.js?v=5",
  "/simply-endorsed/js/part61-calculator-core.js?v=3",
  "/simply-endorsed/js/part61-calculator-ui.js?v=7",
  "/simply-endorsed/js/app.js?v=23",
  "/simply-endorsed/APP-ICONs/favicon-192.png?v=4",
  "/simply-endorsed/APP-ICONs/favicon-512.png?v=4",
  "/simply-endorsed/APP-ICONs/apple-touch-icon.png?v=4",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys
        .filter((key) => key !== CACHE_NAME && key.startsWith("simply-endorsed-cfi-"))
        .map((key) => caches.delete(key)),
    )).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  const isDocumentRequest = event.request.mode === "navigate";

  if (isDocumentRequest) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match("./index.html"))),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(event.request).then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        return response;
      });
    }),
  );
});
