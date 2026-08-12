/* Beau's Game Inventory — multi-source pricing engine v2.1.0 */
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
  function collect(obj, keys){
    const out=[];
    if(!obj||typeof obj!=='object') return out;
    for(const k of keys) if(k in obj) out.push(...nums(obj[k]));
    return out;
  }
  function median(a){
    if(!a.length)return 0; const b=[...a].sort((x,y)=>x-y),m=Math.floor(b.length/2); return b.length%2?b[m]:(b[m-1]+b[m])/2;
  }
  function robust(a){
    const v=a.filter(x=>x>0); if(!v.length)return 0; if(v.length<3)return median(v);
    const m=median(v),dev=v.map(x=>Math.abs(x-m)),mad=median(dev);
    if(!mad)return m;
    const kept=v.filter(x=>Math.abs(x-m)<=3*mad); return median(kept.length?kept:v);
  }
  function normalise(data, barcode){
    const p=data?.product||data?.products?.[0]||data?.data?.products?.[0]||data?.data?.product||data?.result?.products?.[0]||data?.result?.product;
    if(!p) throw Error('No matching game was found for that barcode.');
    const pricing=data?.pricing||{};
    const stores=Array.isArray(data?.stores)?data.stores:(Array.isArray(pricing?.stores)?pricing.stores:[]);
    const all=[p,data,pricing,...stores];
    const retailValues=all.flatMap(o=>collect(o,['retailPrice','newPrice','brandNewPrice','retail_price','rrp','current_price','new_price','newPrice','priceNew']));
    const secondValues=all.flatMap(o=>collect(o,['secondHandPrice','usedPrice','marketPrice','market_price','used_price','second_hand_price','secondHand','used','priceUsed','preownedPrice','preOwnedPrice']));
    const explicitRetail=nums(pricing.retailPrice)[0]||0;
    const explicitSecond=nums(pricing.secondHandPrice)[0]||0;
    const retail=robust(retailValues)||explicitRetail;
    const second=robust(secondValues)||explicitSecond;
    const resale=nums(pricing.suggestedResale)[0]||second||retail*.75;
    const buy=nums(pricing.maximumBuy)[0]||resale*.70;
    const title=p.title||p.name||p.product_name||'Unknown game';
    const image=p.image||p.image_url||p.images?.[0]||'';
    const platform=p.platform||p.console||p.system||'';
    const sourceNames=[...new Set(stores.map(s=>s.source||s.store||s.name).filter(Boolean))];
    const count=Math.max(new Set(retailValues).size,new Set(secondValues).size,sourceNames.length);
    const confidence=count>=4?'High':count>=2?'Medium':'Low';
    return {title,image,platform,retail,second,resale,buy,barcode,sources:stores,sourceNames,confidence,sampleCount:count};
  }
  window.BeauPricingEngine={normalise,median,robust};
})();
