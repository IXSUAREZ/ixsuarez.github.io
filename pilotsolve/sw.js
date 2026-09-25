const CACHE="pilotsolve-site-63ca9cea6a53";const FILES=["./", "./index.html", "./mobile.html", "./manifest.webmanifest", "./icon.svg", "./icon-48.png", "./apple-touch-icon.png", "./icon-192.png", "./icon-512.png", "./assets/inter-latin-wght-normal-Dx4kXJAl.woff2", "./assets/manrope-latin-wght-normal-DHIcAJRg.woff2", "./assets/mobile-CzLIGwDK.js", "./assets/prototype-BTCi2k1e.js", "./assets/prototype-DjmZwi7j.css", "/assets/appearance.js", "/assets/avionics.css", "/assets/tactile.js"];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('pilotsolve-site-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
// Refresh document/theme responses online; immutable app bundles remain cache-first.
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 const shared=['/assets/appearance.js','/assets/avionics.css','/assets/tactile.js'].includes(url.pathname);
 if(request.method!=='GET'||url.origin!==self.location.origin||(!url.pathname.startsWith('/pilotsolve/')&&!shared))return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  const cached=async()=>await cache.match(request,{ignoreVary:true})||(shared?await cache.match(request,{ignoreVary:true,ignoreSearch:true}):null);
  const fresh=async()=>{
   const response=await fetch(request);
   if(response.ok){try{await cache.put(request,response.clone());}catch{/* A full cache must not hide a usable network response. */}}
   return response;
  };
  if(request.mode==='navigate'||shared){
   try{const response=await fresh();if(response.ok)return response;const fallback=await cached();return fallback||response;}
   catch{return await cached()||(request.mode==='navigate'?await cache.match('./index.html'):null)||Response.error();}
  }
  return await cached()||await fresh().catch(()=>Response.error());
 })());
});
