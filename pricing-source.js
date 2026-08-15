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

/* Massive compact barcode fallback bridge.
   The pricing engine already tries the Australian worker and UPCitemdb.
   This bridge adds a large public video-game EAN/UPC database as the final
   identification fallback, with local caching and a compact hot-list for
   common Australian titles. It intentionally does not store tens of thousands
   of records inside the APK. */
(function massiveBarcodeFallback(){
  const originalLookup=window.BeauPricingEngine?.lookup;
  if(typeof originalLookup!=='function')return;

  const HOT={
    '5016488130837':{title:'Extinction',platform:'Xbox One'},
    '3307215793497':{title:'Far Cry 4',platform:'PlayStation 4'},
    '5030917298462':{title:'Diablo IV',platform:'PlayStation 5'},
    '5902367642372':{title:'Cyberpunk 2077: Ultimate Edition',platform:'PlayStation 5'},
    '5056635600554':{title:'Astro Bot',platform:'PlayStation 5'},
    '4787510033':{title:'Nintendo game barcode',platform:'Nintendo'},
    '4902370500356':{title:'Nintendo game barcode',platform:'Nintendo'},
    '8718591189227':{title:'Petit Island',platform:'Nintendo Switch'},
    '0045496512699':{title:'Donkey Kong Country Returns',platform:'Nintendo Switch'},
    '8721082792066':{title:'Little Kitty, Big City',platform:'Nintendo Switch'},
    '5060540772329':{title:'Cuisineer',platform:'PlayStation 5'},
    '5056635611291':{title:'The Plucky Squire',platform:'PlayStation 5'},
    '5056635612090':{title:'Neva',platform:'PlayStation 5'},
    '196388432097':{title:'Call of Duty: Black Ops 6',platform:'PlayStation 5'},
    '711719592754':{title:'Horizon Zero Dawn Remastered',platform:'PlayStation 5'},
    '4020628547967':{title:'Yakuza Kiwami',platform:'Nintendo Switch 2'},
    '811949033659':{title:'Gang Beasts',platform:'Nintendo Switch'},
    '9325336203071':{title:'Scribblenauts: Showdown',platform:'Xbox One'},
    '5030936124254':{title:'FIFA 23',platform:'Xbox One'},
    '9312590131578':{title:'Rugby League Raw',platform:'Nintendo Switch'},
    '5030941059381':{title:'Need for Speed: Pro Street',platform:'Wii'},
    '5060760887803':{title:'Arcadegeddon',platform:'PlayStation 4'},
    '5060760887889':{title:'Arcadegeddon',platform:'PlayStation 5'},
    '711719591801':{title:'Astro Bot',platform:'PlayStation 5'},
    '5056635600776':{title:'Omori',platform:'PlayStation 4'},
    '5902367641184':{title:'Cyberpunk 2077',platform:'PlayStation 4'},
    '5055060953433':{title:'Video game barcode lookup',platform:''}
  };

  const normaliseBarcode=v=>String(v||'').replace(/\D/g,'');
  const usefulTitle=t=>{const x=String(t||'').trim();if(!x)return false;const g=x.toLowerCase();return !['game','product','item','unknown','unknown game','unknown product'].includes(g)&&x.length>=3};
  const extract=(raw,barcode)=>{
    const root=raw?.data||raw?.result||raw;
    const arr=Array.isArray(root)?root:(Array.isArray(root?.items)?root.items:Array.isArray(root?.results)?root.results:[]);
    const p=arr[0]||root?.item||root?.product||root;
    const title=String(p?.title||p?.name||p?.product_name||p?.productName||'').trim();
    if(!usefulTitle(title))return null;
    const text=(title+' '+String(p?.description||p?.category||'')).toLowerCase();
    let platform=String(p?.platform||p?.console||p?.system||'').trim();
    if(!platform){
      if(/playstation\s*5|\bps5\b/.test(text))platform='PlayStation 5';
      else if(/playstation\s*4|\bps4\b/.test(text))platform='PlayStation 4';
      else if(/playstation\s*3|\bps3\b/.test(text))platform='PlayStation 3';
      else if(/xbox\s*series/.test(text))platform='Xbox Series';
      else if(/xbox\s*one/.test(text))platform='Xbox One';
      else if(/nintendo\s*switch/.test(text))platform='Nintendo Switch';
      else if(/wii\s*u/.test(text))platform='Wii U';
      else if(/\bwii\b/.test(text))platform='Wii';
      else if(/3ds/.test(text))platform='Nintendo 3DS';
      else if(/\bds\b/.test(text))platform='Nintendo DS';
    }
    return{product:{title,platform,ean:p?.ean||barcode,gtin:p?.gtin||barcode,source:'Public video-game EAN/UPC database'},pricing:{},stores:[{source:'Public video-game EAN/UPC database'}],barcode};
  };

  async function publicLookup(barcode){
    const b=normaliseBarcode(barcode);if(!b)throw Error('Enter a barcode');
    const cacheKey='videoGameBarcode:'+b;
    try{
      const c=JSON.parse(localStorage.getItem(cacheKey)||'null');
      if(c?.data&&Date.now()-Number(c.checkedAt||0)<30*24*60*60*1000)return{data:c.data,route:'Cached video-game EAN/UPC database',barcode:b};
    }catch(_){}

    const hot=HOT[b];
    if(hot){
      const data={product:{title:hot.title,platform:hot.platform,ean:b,gtin:b,source:'Local compact hot-list'},pricing:{},stores:[{source:'Local compact hot-list'}],barcode:b};
      try{localStorage.setItem(cacheKey,JSON.stringify({checkedAt:Date.now(),data}))}catch(_){}
      return{data,route:'Local compact hot-list',barcode:b};
    }

    const urls=[
      'https://levelcomplete.de/api/public/search.php?'+encodeURIComponent(b),
      'https://levelcomplete.de/api/public/search.php?EANNUMBER='+encodeURIComponent(b)
    ];
    let last;
    for(const url of urls){
      try{
        const r=await fetch(url,{cache:'no-store',headers:{Accept:'application/json'}});
        const text=await r.text();let raw;
        try{raw=JSON.parse(text)}catch(_){continue}
        const data=extract(raw,b);
        if(!data){last=Error('No game title returned');continue}
        try{localStorage.setItem(cacheKey,JSON.stringify({checkedAt:Date.now(),data}))}catch(_){}
        return{data,route:'Public video-game EAN/UPC database',barcode:b};
      }catch(e){last=e}
    }
    throw last||Error('Public barcode database unavailable');
  }

  window.BeauPricingEngine.lookup=async function(code){
    const b=normaliseBarcode(code);if(!b)throw Error('Enter a barcode');
    try{return await originalLookup(b)}catch(primaryError){
      try{return await publicLookup(b)}catch(_){throw primaryError}
    }
  };
  window.BeauPricingEngine.barcodeFallbackVersion='5.0-massive-compact';
})();
})();
