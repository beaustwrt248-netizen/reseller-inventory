/* Pricing source details — adds an audit trail to scan results. */
(function(){'use strict';
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
window.renderPricingSourceDetails=function(info){
  const host=document.getElementById('scanResult');
  if(!host)return;
  let box=document.getElementById('pricingSourceDetails');
  if(!box){
    box=document.createElement('div');
    box.id='pricingSourceDetails';
    box.className='result pricing-source-details';
    host.appendChild(box);
  }
  const checked=new Date(info.checkedAt||Date.now());
  box.innerHTML='<h3>🔎 Pricing Source Details</h3><div class="list-item"><span>Source</span><b>'+esc(info.source||'Lookup')+'</b></div><div class="list-item"><span>Barcode checked</span><b>'+esc(info.barcode||'—')+'</b></div><div class="list-item"><span>Price checked</span><b>'+esc(checked.toLocaleString('en-AU'))+'</b></div><div class="list-item"><span>Resale estimate</span><b>$'+Math.round(Number(info.resale)||0)+'</b></div><div class="muted">This figure is the returned market/resale estimate used by the app for the buying guide. It is not a guaranteed sale price.</div>';
};

/* OTA compatibility bridge: the legacy app shell reports 9.2.2 internally.
   The web manifest is authoritative for the OTA release, so expose 9.3.0 and
   make the Settings updater report that version on installed legacy shells. */
(function otaBridge(){
  const WEB_VERSION='9.3.0';
  window.RESELLER_WEB_VERSION=WEB_VERSION;
  const compare=(a,b)=>{const x=String(a||'0').replace(/^v/i,'').split('.').map(n=>parseInt(n,10)||0),y=String(b||'0').replace(/^v/i,'').split('.').map(n=>parseInt(n,10)||0);for(let i=0;i<3;i++){if((x[i]||0)!==(y[i]||0))return(x[i]||0)-(y[i]||0)}return 0};
  function label(){const el=document.getElementById('appVersion');if(el)el.textContent=WEB_VERSION;document.documentElement.dataset.webVersion=WEB_VERSION;}
  window.checkUpdate=async function(){
    const box=document.getElementById('updateBox');
    if(!box)return;
    box.innerHTML='Checking for updates…';
    try{
      const r=await fetch('./update.json?ota='+Date.now(),{cache:'no-store'});
      const d=await r.json();
      const available=String(d.version||WEB_VERSION);
      const cmp=compare(available,WEB_VERSION);
      box.innerHTML='<b>Current web version:</b> '+WEB_VERSION+'<br><b>Available:</b> '+available+'<br><span class="muted">'+(cmp>0?(d.message||'A newer stable release is available.'):cmp===0?'You are on the latest stable web version.':'The update service reported an older release, so it has been ignored.')+'</span>'+ (cmp>0?'<div class="toolbar"><button class="btn primary" id="installLatestOta">Install latest update</button></div>':'<div class="toolbar"><button class="btn success" disabled>✓ Up to date</button></div>');
      const b=document.getElementById('installLatestOta');
      if(b)b.onclick=async()=>{try{const regs=await navigator.serviceWorker?.getRegistrations?.()||[];await Promise.all(regs.map(x=>x.unregister()));if(window.caches){const ks=await caches.keys();await Promise.all(ks.map(k=>caches.delete(k)))}}catch(_){} location.href='./index.html?ota='+Date.now()+'#dashboard';};
    }catch(_){box.textContent='Update service unavailable. The app will continue working normally.';}
  };
  label();
})();
})();
