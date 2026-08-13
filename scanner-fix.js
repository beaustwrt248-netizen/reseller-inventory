/* Beau's Game Inventory — scanner lookup hotfix v2.0.6 */
(function(){
  'use strict';
  const WORKER='https://beau-reseller-pricing.beaustwrt248.workers.dev';
  const money=v=>Number(v)>0?'$'+Number(v).toFixed(2):'Not available';
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  function nums(v){
    if(Array.isArray(v))return v.flatMap(nums);
    if(typeof v==='number'&&Number.isFinite(v)&&v>0)return[v];
    if(typeof v==='string'){const n=Number(v.replace(/[^0-9.]/g,''));return Number.isFinite(n)&&n>0?[n]:[]}
    return[];
  }
  function first(obj,keys){for(const k of keys){if(obj&&k in obj){const n=nums(obj[k])[0];if(n)return n}}return 0}
  function normalise(d,barcode){
    const p=d?.product||d?.products?.[0]||d?.data?.product||d?.data?.products?.[0]||d?.result?.product||d?.result?.products?.[0]||d;
    if(!p||typeof p!=='object')throw Error('No product data returned.');
    const pricing=d?.pricing||p?.pricing||{};
    const title=p.title||p.name||p.product_name||p.productName||'Game';
    const image=p.image||p.image_url||p.imageUrl||p.thumbnail||p.thumbnail_url||(Array.isArray(p.images)?p.images[0]:'')||'';
    const platform=p.platform||p.console||p.system||p.consoleName||'';
    const retail=first(pricing,['retailPrice','newPrice','brandNewPrice','rrp','retail'])||first(p,['retailPrice','newPrice','brandNewPrice','rrp','retail','priceNew','newPrice']);
    const second=first(pricing,['secondHandPrice','usedPrice','marketPrice','secondHandValue','preownedPrice','used'])||first(p,['secondHandPrice','usedPrice','marketPrice','secondHandValue','preownedPrice','used','priceUsed']);
    const resale=first(pricing,['suggestedResale','resalePrice','recommendedResale'])||second||(retail?retail*.75:0);
    const buy=first(pricing,['maximumBuy','suggestedBuy','recommendedBuy'])||(resale?resale*.70:0);
    const sourceNames=[];
    const stores=[...(Array.isArray(d?.stores)?d.stores:[]),...(Array.isArray(p?.stores)?p.stores:[])];
    stores.forEach(s=>{const n=s?.source||s?.store||s?.storeName||s?.retailer||s?.name;if(n&&!sourceNames.includes(String(n)))sourceNames.push(String(n))});
    return{title,image,platform,retail,second,resale,buy,barcode,secondEstimated:!second&&!!retail,confidence:sourceNames.length>=3?'High':sourceNames.length>=1?'Medium':'Low',sourceNames};
  }
  async function request(url,options){
    const r=await fetch(url,{...options,cache:'no-store',headers:{Accept:'application/json',...(options?.headers||{})}});
    if(!r.ok)throw Error('HTTP '+r.status);
    const text=await r.text();
    let d;try{d=JSON.parse(text)}catch(e){throw Error('Pricing service returned invalid data')}
    if(d?.success===false)throw Error(d.error||d.message||'Pricing lookup failed');
    return d;
  }
  async function lookupBarcode(code){
    code=String(code||'').replace(/\D/g,'');
    if(!code)return;
    const result=document.getElementById('barcodeResult');
    if(result)result.innerHTML='<div class="loading">🔎 Looking up barcode '+esc(code)+'…</div>';
    const urls=[WORKER+'?barcode='+encodeURIComponent(code),WORKER+'/lookup?barcode='+encodeURIComponent(code),WORKER+'/api/lookup?barcode='+encodeURIComponent(code)];
    let data=null,lastErr=null;
    for(const u of urls){try{data=await request(u);break}catch(e){lastErr=e}}
    if(!data){
      try{data=await request(WORKER,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({barcode:code})})}catch(e){lastErr=e}
    }
    if(!data){
      if(result)result.innerHTML='<div class="warning"><strong>Pricing lookup is temporarily unavailable.</strong><br>The barcode was read correctly, but the online pricing service did not return a result. You can try again or enter the barcode manually.<br><small>Service detail: '+esc(lastErr?.message||'Unknown error')+'</small></div>';
      return null;
    }
    let g;try{g=normalise(data,code)}catch(e){if(result)result.innerHTML='<div class="warning">The pricing service responded, but no matching game was found for barcode <strong>'+esc(code)+'</strong>.</div>';return null}
    const checkedAt=new Date().toISOString();
    if(result){
      result.innerHTML='<div class="item"><div class="item-name">'+esc(g.title)+'</div>'+(g.image?'<img class="product-image" src="'+esc(g.image)+'" alt="Game thumbnail">':'')+'<span class="badge">'+esc(g.platform||'Game')+'</span><div class="price-box"><div class="price-row"><span>🆕 Brand New</span><strong>'+money(g.retail)+'</strong></div><div class="price-row"><span>♻️ '+(g.secondEstimated?'Estimated Second-hand':'Second-hand Value')+'</span><strong>'+money(g.resale)+'</strong></div><div class="price-row"><span>💰 Estimated Buy</span><strong class="good">'+money(g.buy)+'</strong></div><div class="price-row"><span>📊 Confidence</span><strong>'+esc(g.confidence)+'</strong></div></div><div class="actions"><button class="primary" id="saveScanToLibrary">📚 Save to Library</button></div></div>';
      const save=document.getElementById('saveScanToLibrary');
      if(save)save.onclick=()=>saveLibrary(g,checkedAt);
    }
    window.lastBarcodePricing=g;
    return g;
  }
  function saveLibrary(g,checkedAt){
    let a=[];try{a=JSON.parse(localStorage.getItem('beauGameLibrary')||'[]')}catch(e){a=[]}if(!Array.isArray(a))a=[];
    const item={title:g.title,image:g.image,platform:g.platform,barcode:g.barcode,retail:g.retail,resale:g.resale,buy:g.buy,secondEstimated:g.secondEstimated,confidence:g.confidence,sourceNames:g.sourceNames,checkedAt};
    const i=a.findIndex(x=>String(x.barcode||'')===String(g.barcode||''));if(i>=0)a[i]={...a[i],...item};else a.unshift(item);localStorage.setItem('beauGameLibrary',JSON.stringify(a));
    const b=document.getElementById('saveScanToLibrary');if(b){b.textContent='✅ Saved to Library';b.disabled=true}
  }
  window.lookupBarcode=lookupBarcode;
  window.BeauSmartScan={lookup:lookupBarcode,version:'2.0.6'};
  function wire(){
    const btn=document.getElementById('lookupButton'),input=document.getElementById('barcodeSearch');
    if(btn){btn.onclick=e=>{e.preventDefault();lookupBarcode(input?.value||'')}}
    if(input)input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();lookupBarcode(input.value)}});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wire);else wire();
})();
