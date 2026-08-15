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

/* OTA compatibility bridge for legacy 9.2.2 shells. The live web assets on
   GitHub Pages are the source of truth for the 9.3.0 feature release. */
(function otaBridge(){
  const WEB_VERSION='9.3.0';
  const compare=(a,b)=>{const x=String(a||'0').replace(/^v/i,'').split('.').map(n=>parseInt(n,10)||0),y=String(b||'0').replace(/^v/i,'').split('.').map(n=>parseInt(n,10)||0);for(let i=0;i<3;i++){if((x[i]||0)!==(y[i]||0))return(x[i]||0)-(y[i]||0)}return 0};
  function installedVersion(){
    const saved=localStorage.getItem('resellerOtaWebVersion');
    if(saved)return saved;
    const el=document.getElementById('appVersion');
    return (el&&el.textContent.trim())||'9.2.2';
  }
  window.RESELLER_WEB_VERSION=WEB_VERSION;
  window.checkUpdate=async function(){
    const box=document.getElementById('updateBox');
    if(!box)return;
    box.innerHTML='Checking for updates…';
    try{
      const r=await fetch('./update.json?ota='+Date.now(),{cache:'no-store'});
      const d=await r.json();
      const available=String(d.version||WEB_VERSION);
      const current=installedVersion();
      const cmp=compare(available,current);
      box.innerHTML='<b>Installed web version:</b> '+esc(current)+'<br><b>Available:</b> '+esc(available)+'<br><span class="muted">'+(cmp>0?(d.message||'A newer stable release is available.'):cmp===0?'You are on the latest stable web version.':'The update service reported an older release, so it has been ignored.')+'</span>'+ (cmp>0?'<div class="toolbar"><button class="btn primary" id="installLatestOta">🔄 Install 9.3.0 OTA Update</button></div>':'<div class="toolbar"><button class="btn success" disabled>✓ Up to date</button></div>');
      const b=document.getElementById('installLatestOta');
      if(b)b.onclick=async()=>{
        b.disabled=true;b.textContent='⏳ Updating…';
        try{
          localStorage.setItem('resellerOtaWebVersion',available);
          if('serviceWorker' in navigator){const regs=await navigator.serviceWorker.getRegistrations();await Promise.all(regs.map(x=>x.unregister()));}
          if(window.caches){const keys=await caches.keys();await Promise.all(keys.map(k=>caches.delete(k)));}
        }catch(_){}
        location.replace('./index.html?ota='+Date.now()+'#dashboard');
      };
    }catch(_){box.textContent='Update service unavailable. The app will continue working normally.';}
  };
  function label(){
    const el=document.getElementById('appVersion');
    if(el)el.textContent=installedVersion();
    document.documentElement.dataset.webVersion=installedVersion();
  }
  document.addEventListener('DOMContentLoaded',()=>{label();if(location.search.includes('ota=')){setTimeout(()=>{window.scrollTo(0,0)},50)}});
})();
})();
