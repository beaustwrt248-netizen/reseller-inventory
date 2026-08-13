/* Beau's Game Inventory — multi-source pricing engine v2.2.2 */
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

  function findProduct(data){
    if(!data||typeof data!=='object') return null;
    const direct=[data.product,data.products?.[0],data.result?.product,data.result?.products?.[0],data.data?.product,data.data?.products?.[0],data.data?.result?.product,data.data?.result?.products?.[0]];
    for(const p of direct) if(p&&typeof p==='object'&&!Array.isArray(p)) return p;
    return null;
  }

  function normalise(data,barcode){
    const p=findProduct(data);
    if(!p) {
      const message=data?.error||data?.message||data?.data?.error||data?.data?.message||'No matching game was found for that barcode.';
      throw Error(String(message));
    }
    const pricing=data?.pricing||data?.data?.pricing||p?.pricing||{};
    const stores=Array.isArray(data?.stores)?data.stores:(Array.isArray(pricing?.stores)?pricing.stores:[]);
    const productStores=Array.isArray(p?.stores)?p.stores:[];
    const all=[p,data,data?.data,pricing,...stores,...productStores].filter(Boolean);
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
    const title=p.title||p.name||p.product_name||p.productName||'Unknown game';
    const image=p.image||p.image_url||p.imageUrl||p.thumbnail||p.thumbnail_url||(Array.isArray(p.images)?p.images[0]:'')||'';
    const platform=p.platform||p.console||p.system||p.consoleName||'';
    const sourcePool=[...stores,...productStores];
    const sourceNames=[...new Set(sourcePool.map(sourceName).filter(Boolean))];
    if(!sourceNames.length&&p.source) sourceNames.push(String(p.source));
    const count=Math.max(new Set(retailValues).size,new Set(secondValues).size,sourceNames.length);
    const confidence=count>=4?'High':count>=2?'Medium':'Low';
    return {title,image,platform,retail,second,resale,buy,barcode,sources:sourcePool,sourceNames,confidence,sampleCount:count,secondEstimated};
  }

  const nativeFetch=window.fetch.bind(window);
  async function getJson(url,init){
    const r=await nativeFetch(url,{...init,cache:'no-store',headers:{Accept:'application/json',...(init?.headers||{})}});
    const text=await r.text();
    let data;try{data=JSON.parse(text)}catch(_){throw Error('Pricing service returned invalid JSON (HTTP '+r.status+').')}
    if(!r.ok||data?.success===false) throw Error(data?.error||data?.message||'Pricing service returned HTTP '+r.status);
    return {data,status:r.status};
  }
  async function bridgedFetch(input,init){
    try{
      const url=typeof input==='string'?input:(input&&input.url)||'';
      if(url.includes('/beau-reseller-pricing.beaustwrt248.workers.dev/price?barcode=')){
        const barcode=new URL(url).searchParams.get('barcode')||'';
        const base='https://beau-reseller-pricing.beaustwrt248.workers.dev';
        const attempts=[
          {url:base+'/lookup?barcode='+encodeURIComponent(barcode)},
          {url:base+'/api/lookup?barcode='+encodeURIComponent(barcode)},
          {url:base+'/?barcode='+encodeURIComponent(barcode)},
          {url:base+'/price?barcode='+encodeURIComponent(barcode)}
        ];
        let lastErr=null;
        for(const a of attempts){
          try{
            const result=await getJson(a.url);
            return new Response(JSON.stringify(result.data),{status:200,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
          }catch(e){lastErr=e}
        }
        try{
          const result=await getJson(base,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({barcode})});
          return new Response(JSON.stringify(result.data),{status:200,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
        }catch(e){lastErr=e}
        return new Response(JSON.stringify({success:false,error:lastErr?.message||'Barcode lookup failed'}),{status:502,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
      }
    }catch(e){
      return new Response(JSON.stringify({success:false,error:e?.message||'Barcode lookup failed'}),{status:500,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
    }
    return nativeFetch(input,init);
  }
  window.fetch=bridgedFetch;
  window.BeauPricingEngine={normalise,median,robust,version:'2.2.2'};
})();
