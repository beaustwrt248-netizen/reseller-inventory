/* Beau's Game Inventory — network-first HTML service worker */
const CACHE='beau-game-inventory-v1.9.2';
const ASSETS=['./','./index.html','./mobile-theme.css','./app-nav.js','./app-update.js','./nav-safe-area.js','./navigation-layout-fix.css','./manifest.json'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==location.origin)return;
  const isHtml=event.request.mode==='navigate'||event.request.destination==='document'||/\.html?$/.test(url.pathname);
  if(isHtml){
    event.respondWith(fetch(event.request,{cache:'no-store'}).then(response=>{
      const copy=response.clone();caches.open(CACHE).then(c=>c.put(event.request,copy));return response;
    }).catch(()=>caches.match(event.request).then(r=>r||caches.match('./index.html'))));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{
    const copy=response.clone();caches.open(CACHE).then(c=>c.put(event.request,copy));return response;
  })));
});
