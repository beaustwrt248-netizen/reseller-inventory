/* Beau's Game Inventory — pricing engine v2.3.0 */
(function(){
  'use strict';
  const WORKER='https://beau-reseller-pricing.beaustwrt248.workers.dev';
  const nativeFetch=window.fetch.bind(window);
  const nums=v=>{if(Array.isArray(v))return v.flatMap(nums);if(typeof v==='number'&&Number.isFinite(v)&&v>0)return[v];if(typeof v==='string'){const n=Number(v.replace(/[^0-9.]/g,''));return Number.isFinite(n)&&n>0?[n]:[]}return[]};
  const first=(o,keys)=>{for(const k of keys){const n=nums(o?.[k])[0];if(n)return n}return 0};
  const median=a=>{if(!a.length)return 0;const b=[...a].sort((x,y)=>x-y),m=Math.floor(b.length/2);return b.length%2?b[m]:(b[m-1]+b[m])/2};
  const robust=a=>{const v=a.filter(x=>x>0);if(!v.length)return 0;if(v.length<3)return median(v);const m=median(v),d=v.map(x=>Math.abs(x-m)),mad=median(d);if(!mad)return m;const k=v.filter(x=>Math.abs(x-m)<=3*mad);return median(k.length?k:v)};
  function findProduct(d){if(!d||typeof d!=='object')return null;const a=[d.product,d.products?.[0],d.result?.product,d.result?.products?.[0],d.data?.product,d.data?.products?.[0],d.data?.result?.product,d.data?.result?.products?.[0]];return a.find(x=>x&&typeof x==='object'&&!Array.isArray(x))||null}
  function normalise(data,barcode){
    const p=findProduct(data);if(!p)throw Error(String(data?.error||data?.message||'No matching game was found for that barcode.'));
    const pricing=data?.pricing||data?.data?.pricing||p?.pricing||{};
    const all=[p,data,data?.data,pricing,...(Array.isArray(data?.stores)?data.stores:[]),...(Array.isArray(p?.stores)?p.stores:[])].filter(Boolean);
    const retailKeys=['retailPrice','newPrice','brandNewPrice','retail_price','rrp','current_price','new_price','priceNew','new'];
    const secondKeys=['secondHandPrice','usedPrice','marketPrice','market_price','used_price','second_hand_price','secondHand','used','priceUsed','preownedPrice','preOwnedPrice','secondHandValue'];
    const collect=(keys)=>all.flatMap(o=>keys.flatMap(k=>nums(o?.[k])));
    const rv=collect(retailKeys),sv=collect(secondKeys),retail=robust(rv),second=robust(sv),secondEstimated=!second&&!!retail;
    const resale=first(pricing,['suggestedResale','resalePrice','recommendedResale'])||second||(retail?retail*.75:0),buy=first(pricing,['maximumBuy','suggestedBuy','recommendedBuy'])||(resale?resale*.70:0);
    const title=p.title||p.name||p.product_name||p.productName||'Unknown game',image=p.image||p.image_url||p.imageUrl||p.thumbnail||p.thumbnail_url||(Array.isArray(p.images)?p.images[0]:'')||'',platform=p.platform||p.console||p.system||p.consoleName||'';
    const stores=[...(Array.isArray(data?.stores)?data.stores:[]),...(Array.isArray(p?.stores)?p.stores:[])],sourceNames=[...new Set(stores.map(s=>s?.source||s?.store||s?.storeName||s?.retailer||s?.name).filter(Boolean).map(String))];
    if(!sourceNames.length&&p.source)sourceNames.push(String(p.source));
    const count=Math.max(new Set(rv).size,new Set(sv).size,sourceNames.length);
    return{title,image,platform,retail,second,resale,buy,barcode,sources:stores,sourceNames,confidence:count>=4?'High':count>=2?'Medium':'Low',sampleCount:count,secondEstimated};
  }
  async function json(url,init){const r=await nativeFetch(url,{...init,cache:'no-store',headers:{Accept:'application/json',...(init?.headers||{})}}),t=await r.text();let d;try{d=JSON.parse(t)}catch(_){throw Error('Invalid JSON (HTTP '+r.status+')')};if(!r.ok||d?.success===false)throw Error(d?.error||d?.message||('HTTP '+r.status));return d}
  function barcodeVariants(code){const c=String(code||'').replace(/\D/g,'');const a=[c];if(c.length===13&&c.startsWith('0'))a.push(c.slice(1));if(c.length>=12)a.push(c.slice(-12));return[...new Set(a)].filter(Boolean)}
  async function workerLookup(code){
    let last;
    for(const b of barcodeVariants(code)){
      for(const path of ['/lookup','/api/lookup','']){try{return await json(WORKER+path+'?barcode='+encodeURIComponent(b))}catch(e){last=e}}
      try{return await json(WORKER+'/price?barcode='+encodeURIComponent(b))}catch(e){last=e}
      try{return await json(WORKER,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({barcode:b})})}catch(e){last=e}
    }
    throw last||Error('Pricing service unavailable');
  }
  async function publicProductLookup(code){
    let last;
    for(const b of barcodeVariants(code)){
      try{
        const d=await json('https://api.upcitemdb.com/prod/trial/lookup?upc='+encodeURIComponent(b));
        const item=d?.items?.[0];
        if(!item)throw Error('No product match');
        const offers=Array.isArray(item.offers)?item.offers.map(o=>Number(o.price)).filter(x=>x>0):[];
        const retail=offers.length?median(offers):0;
        return {product:{title:item.title||'Game',image:item.images?.[0]||'',brand:item.brand||'',model:item.model||''},pricing:{retailPrice:retail},stores:offers.map(price=>({source:'Online product listing',retailPrice:price}))};
      }catch(e){last=e}
    }
    throw last||Error('No public product match');
  }
  async function bridgedFetch(input,init){
    const url=typeof input==='string'?input:(input&&input.url)||'';
    if(!url.includes(WORKER))return nativeFetch(input,init);
    const match=url.match(/[?&]barcode=([^&]+)/);const code=match?decodeURIComponent(match[1]):'';
    if(!code)return nativeFetch(input,init);
    try{return new Response(JSON.stringify(await workerLookup(code)),{status:200,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}})}
    catch(workerErr){try{return new Response(JSON.stringify(await publicProductLookup(code)),{status:200,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}})}catch(publicErr){return new Response(JSON.stringify({success:false,error:'No matching game was found for barcode '+code+'. Online pricing service: '+(workerErr?.message||'unavailable')+'; public product lookup: '+(publicErr?.message||'unavailable')}),{status:404,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}})}}
  }
  window.fetch=bridgedFetch;
  window.BeauPricingEngine={normalise,version:'2.3.0'};
})();
