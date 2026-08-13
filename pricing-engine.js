/* Beau's Game Inventory — multi-source pricing engine v2.2.1 */
(function(){
  'use strict';
  function nums(value){
    if(Array.isArray(value)) return value.flatMap(nums);
    if(typeof value==='number' && Number.isFinite(value) && value>0) return [value];
    if(typeof value==='string'){
      const n=Number(value.replace(/[^0-9.]/g,''));
      return Number.isFinite(n)&&n>0?[n]:[];
    }
    return [];
  }
  function collect(obj,keys){
    const out=[];
    if(!obj||typeof obj!=='object') return out;
    for(const k of keys) if(k in obj) out.push(...nums(obj[k]));
    return out;
  }
  function median(a){
    if(!a.length)return 0;
    const b=[...a].sort((x,y)=>x-y),m=Math.floor(b.length/2);
    return b.length%2?b[m]:(b[m-1]+b[m])/2;
  }
  function robust(a){
    const v=a.filter(x=>x>0);
    if(!v.length)return 0;
    if(v.length<3)return median(v);
    const m=median(v),dev=v.map(x=>Math.abs(x-m)),mad=median(dev);
    if(!mad)return m;
    const kept=v.filter(x=>Math.abs(x-m)<=3*mad);
    return median(kept.length?kept:v);
  }
  function sourceName(s){return s?.source||s?.store||s?.storeName||s?.retailer||s?.name||'';}
  function normalise(data,barcode){
    const p=data?.product||data?.products?.[0]||data?.data?.products?.[0]||data?.data?.product||data?.result?.products?.[0]||data?.result?.product;
    if(!p) throw Error('No matching game was found for that barcode.');
    const pricing=data?.pricing||{};
    const stores=Array.isArray(data?.stores)?data.stores:(Array.isArray(pricing?.stores)?pricing.stores:[]);
    const productStores=Array.isArray(p?.stores)?p.stores:[];
    const all=[p,data,pricing,...stores,...productStores];
    const retailKeys=['retailPrice','newPrice','brandNewPrice','retail_price','rrp','current_price','new_price','priceNew','new'];
    const secondKeys=['secondHandPrice','usedPrice','marketPrice','market_price','used_price','second_hand_price','secondHand','used','priceUsed','preownedPrice','preOwnedPrice','secondHandValue'];
    const retailValues=all.flatMap(o=>collect(o,retailKeys));
    const secondValues=all.flatMap(o=>collect(o,secondKeys));
    const explicitRetail=nums(pricing.retailPrice)[0]||nums(pricing.newPrice)[0]||0;
    const explicitSecond=nums(pricing.secondHandPrice)[0]||nums(pricing.usedPrice)[0]||0;
    const retail=robust(retailValues)||explicitRetail;
    const second=robust(secondValues)||explicitSecond;
    const secondEstimated=!second&&retail>0;
    const resale=nums(pricing.suggestedResale)[0]||second||(retail>0?retail*.75:0);
    const buy=nums(pricing.maximumBuy)[0]||nums(pricing.suggestedBuy)[0]||(resale>0?resale*.70:0);
    const title=p.title||p.name||p.product_name||'Unknown game';
    const image=p.image||p.image_url||p.thumbnail||p.images?.[0]||'';
    const platform=p.platform||p.console||p.system||'';
    const sourcePool=[...stores,...productStores];
    const sourceNames=[...new Set(sourcePool.map(sourceName).filter(Boolean))];
    if(!sourceNames.length&&p.source) sourceNames.push(String(p.source));
    const count=Math.max(new Set(retailValues).size,new Set(secondValues).size,sourceNames.length);
    const confidence=count>=4?'High':count>=2?'Medium':'Low';
    return {title,image,platform,retail,second,resale,buy,barcode,sources:sourcePool,sourceNames,confidence,sampleCount:count,secondEstimated};
  }

  // Compatibility bridge: the current scanner page historically called /price.
  // Redirect that legacy request through the working lookup routes without changing the UI.
  const nativeFetch=window.fetch.bind(window);
  async function bridgedFetch(input,init){
    try{
      const url=typeof input==='string'?input:(input&&input.url)||'';
      if(url.includes('/beau-reseller-pricing.beaustwrt248.workers.dev/price?barcode=')){
        const barcode=new URL(url).searchParams.get('barcode')||'';
        const urls=[
          `https://beau-reseller-pricing.beaustwrt248.workers.dev/lookup?barcode=${encodeURIComponent(barcode)}`,
          `https://beau-reseller-pricing.beaustwrt248.workers.dev/api/lookup?barcode=${encodeURIComponent(barcode)}`,
          `https://beau-reseller-pricing.beaustwrt248.workers.dev/?barcode=${encodeURIComponent(barcode)}`
        ];
        let lastErr=null;
        for(const u of urls){
          try{
            const r=await nativeFetch(u,{cache:'no-store',headers:{Accept:'application/json',...(init?.headers||{})}});
            if(!r.ok){lastErr=Error('HTTP '+r.status);continue;}
            const text=await r.text();
            let data;try{data=JSON.parse(text)}catch(_){lastErr=Error('Invalid JSON from pricing service');continue;}
            if(data?.success===false){lastErr=Error(data.error||data.message||'Barcode lookup failed');continue;}
            return new Response(JSON.stringify(data),{status:200,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
          }catch(e){lastErr=e}
        }
        return new Response(JSON.stringify({success:false,error:lastErr?.message||'Barcode lookup failed'}),{status:502,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
      }
    }catch(e){
      return new Response(JSON.stringify({success:false,error:e?.message||'Barcode lookup failed'}),{status:500,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
    }
    return nativeFetch(input,init);
  }
  window.fetch=bridgedFetch;
  window.BeauPricingEngine={normalise,median,robust};
})();
