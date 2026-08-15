/* Beau's Reseller Hub — Fast Lookup Layer v1.0.0
   Speeds up repeat barcode scans and races the pricing worker endpoints in parallel.
*/
(function(){
  'use strict';
  const WORKER='https://beau-reseller-pricing.beaustwrt248.workers.dev';
  const CACHE_PREFIX='beauFastLookup:';
  const TTL=30*24*60*60*1000;
  const nativeFetch=window.fetch.bind(window);
  const clean=v=>String(v||'').replace(/\D/g,'');
  const useful=d=>{try{const n=window.BeauPricingEngine.normalise(d.data||d,d.barcode||'');return n&&n.title&&n.title.length>=3&&!/^(game|product|item|unknown)/i.test(n.title)}catch(_){return false}};
  const readCache=b=>{try{const x=JSON.parse(localStorage.getItem(CACHE_PREFIX+b)||'null');if(x&&x.savedAt&&Date.now()-x.savedAt<TTL&&x.data)return x}catch(_){}return null};
  const writeCache=(b,value)=>{try{localStorage.setItem(CACHE_PREFIX+b,JSON.stringify({savedAt:Date.now(),data:value}))}catch(_){} };
  const json=async(url,init={})=>{const r=await nativeFetch(url,{...init,cache:'no-store',headers:{Accept:'application/json',...(init.headers||{})}});if(!r.ok)throw Error('HTTP '+r.status);const t=await r.text();let d;try{d=JSON.parse(t)}catch(_){throw Error('Invalid JSON')};if(d?.success===false)throw Error(d.error||d.message||'Lookup failed');return d};
  async function raceWorker(b){
    const urls=[
      WORKER+'?barcode='+encodeURIComponent(b),
      WORKER+'/lookup?barcode='+encodeURIComponent(b),
      WORKER+'/api/lookup?barcode='+encodeURIComponent(b),
      WORKER+'/price?barcode='+encodeURIComponent(b)
    ];
    const tasks=urls.map(u=>json(u).then(d=>({data:d,route:'fast-worker'})));
    tasks.push(json(WORKER,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({barcode:b})}).then(d=>({data:d,route:'fast-worker-post'})));
    return new Promise((resolve,reject)=>{
      let pending=tasks.length, last;
      tasks.forEach(p=>p.then(v=>{if(useful(v)){resolve(v);for(const t of tasks)t.catch(()=>{})}}).catch(e=>{last=e;if(--pending===0)reject(last||Error('No fast result'))}));
    });
  }
  function install(){
    const eng=window.BeauPricingEngine;
    if(!eng||typeof eng.lookup!=='function'||typeof eng.normalise!=='function')return false;
    if(eng.__fastLookup)return true;
    const original=eng.lookup;
    eng.lookup=async function(code){
      const b=clean(code);if(!b)throw Error('Enter a barcode');
      const cached=readCache(b);if(cached)return{...cached.data,route:'Fast local cache',barcode:b};
      const localPromise=original.call(this,b);
      const fastPromise=raceWorker(b);
      try{
        const winner=await Promise.race([
          localPromise.then(v=>({kind:'engine',value:v})),
          fastPromise.then(v=>({kind:'fast',value:v}))
        ]);
        const normalized=eng.normalise(winner.value.data||winner.value,b);
        if(normalized&&normalized.title&&normalized.title.length>=3){writeCache(b,winner.value);return {...winner.value,route:winner.kind==='fast'?'Fast worker lookup':winner.value.route,barcode:b};}
      }catch(_){ }
      try{const fallback=await localPromise;writeCache(b,fallback);return fallback}catch(_){}
      const fast=await fastPromise;writeCache(b,fast);return fast;
    };
    eng.__fastLookup=true;
    eng.fastLookupVersion='1.0.0';
    return true;
  }
  if(!install()){
    let tries=0;const t=setInterval(()=>{tries++;if(install()||tries>60)clearInterval(t)},100);
  }
})();
