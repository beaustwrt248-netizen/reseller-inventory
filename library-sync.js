/* Beau's Game Inventory — automatic scanned-game library sync */
(function(){
  'use strict';
  const KEY='beauGameLibrary';
  const WORKER='https://beau-reseller-pricing.beaustwrt248.workers.dev';
  const escNum=v=>Number(v)||0;
  function read(){try{const x=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(x)?x:[]}catch(e){return[]}}
  function write(x){try{localStorage.setItem(KEY,JSON.stringify(x));window.dispatchEvent(new Event('library-updated'))}catch(e){}}
  function save(barcode,data){
    const p=data?.product||data?.products?.[0]||data?.data?.products?.[0]||data?.data?.product||data?.result?.products?.[0]||data?.result?.product;
    if(!p)return;
    const pricing=data?.pricing||{};
    const title=p.title||p.name||p.product_name||'Unknown game';
    const platform=p.platform||p.console||p.system||'';
    const image=p.image||p.image_url||p.images?.[0]||'';
    const retail=escNum(pricing.retailPrice||p.retail_price||p.rrp||p.current_price||p.price);
    const market=escNum(pricing.secondHandPrice||p.market_price||p.used_price||p.second_hand_price||p.used);
    const resale=escNum(pricing.suggestedResale)||market||(retail*.75);
    const buy=escNum(pricing.maximumBuy)||resale*.70;
    const games=read();
    const clean=String(barcode).replace(/\D/g,'');
    const existing=games.find(g=>String(g.barcode||'').replace(/\D/g,'')===clean);
    const item={title,barcode:String(barcode),platform,image,retail,market,resale,buy,lastChecked:new Date().toISOString()};
    if(existing)Object.assign(existing,item);else games.unshift(item);
    write(games);
  }
  const originalFetch=window.fetch.bind(window);
  window.fetch=function(input,init){
    const url=typeof input==='string'?input:(input&&input.url)||'';
    const isPrice=String(url).startsWith(WORKER+'/price?barcode=');
    const result=originalFetch(input,init);
    if(isPrice)result.then(response=>{try{if(response.ok){const copy=response.clone();copy.json().then(data=>{try{const u=new URL(url);save(u.searchParams.get('barcode')||'',data)}catch(e){}}).catch(()=>{})}}catch(e){}}).catch(()=>{});
    return result;
  };
})();
