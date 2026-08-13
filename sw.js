/* Beau's Game Inventory — network-first service worker v2.0.6 */
const CACHE='beau-game-inventory-v2.0.6';
const ASSETS=['./','./index.html','./scanner.html','./library.html','./pricing.html','./settings.html','./dashboard.html','./mobile-theme.css','./app-nav.js','./app-update.js','./scanner-fix.js','./pricing-engine.js','./nav-safe-area.js','./navigation-layout-fix.css','./nav-icons.css','./manifest.json'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==location.origin)return;
  const isHtml=event.request.mode==='navigate'||event.request.destination==='document'||/\.html?$/.test(url.pathname);
  const isCode=/\.(js|css|json)$/.test(url.pathname);
  if(isHtml||isCode){
    event.respondWith(fetch(event.request,{cache:'no-store'}).then(response=>{
      if(response&&response.ok){const copy=response.clone();caches.open(CACHE).then(c=>c.put(event.request,copy)).catch(()=>{});}return response;
    }).catch(()=>caches.match(event.request).then(r=>r||caches.match('./index.html'))));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{
    const copy=response.clone();caches.open(CACHE).then(c=>c.put(event.request,copy)).catch(()=>{});return response;
  })));
});
