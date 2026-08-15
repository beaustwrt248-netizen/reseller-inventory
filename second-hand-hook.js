/* Direct second-hand pricing hook + name/console market search + per-site averages + Super Retro. */
(function(){
  'use strict';
  const norm=v=>String(v||'').replace(/\D/g,'');
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const money=v=>Number(v)>0?'$'+Number(v).toFixed(2):'—';
  const cleanPlatform=p=>String(p||'').trim();
  const buildQuery=(title,platform)=>[title,cleanPlatform(platform)].filter(Boolean).join(' ').replace(/\s+/g,' ').trim();
  const urls=query=>({
    cash:'https://www.cashconverters.com.au/search-results?query='+encodeURIComponent(query),
    ebay:'https://www.ebay.com.au/sch/i.html?_nkw='+encodeURIComponent(query)+'&LH_Sold=1&LH_Complete=1',
    superRetro:'https://superretro.com.au/search?q='+encodeURIComponent(query)
  });
  const number=v=>{if(typeof v==='number'&&Number.isFinite(v)&&v>0)return v;if(typeof v==='string'){const m=v.replace(/,/g,'').match(/\d+(?:\.\d+)?/);if(m){const n=Number(m[0]);return n>0?n:0}}return 0};
  const sourceName=s=>String(s?.source||s?.store||s?.storeName||s?.retailer||s?.name||'').toLowerCase();
  const siteOf=s=>{const x=sourceName(s);if(/cash\s*converters|cashies/.test(x))return 'Cash Converters';if(/e\s*-?bay/.test(x))return 'eBay';if(/super\s*retro/.test(x))return 'Super Retro';return ''};
  const pricesFor=s=>['secondHandPrice','usedPrice','marketPrice','market_price','used_price','second_hand_price','secondHand','used','priceUsed','preownedPrice','preOwnedPrice','secondHandValue','resalePrice','suggestedResale','retailPrice','price'].flatMap(k=>{const n=number(s?.[k]);return n?[n]:[]});
  function averages(raw,n){
    const buckets={'Cash Converters':[],'eBay':[],'Super Retro':[]};
    const stores=[...(Array.isArray(raw?.stores)?raw.stores:[]),...(Array.isArray(raw?.product?.stores)?raw.product.stores:[])];
    for(const s of stores){const site=siteOf(s);if(site)buckets[site].push(...pricesFor(s));}
    const out={};
    for(const [site,vals] of Object.entries(buckets)){const u=vals.filter(v=>v>0);out[site]=u.length?{average:u.reduce((a,b)=>a+b,0)/u.length,count:u.length,prices:u}:null}
    const present=Object.values(out).filter(Boolean).map(v=>v.average);
    out.overall=present.length?present.reduce((a,b)=>a+b,0)/present.length:0;
    if(!out.overall&&Number(n?.second)>0)out.overall=Number(n.second);
    return out;
  }
  let lastBarcode='';
  async function renderDecision(raw,barcode){
    const host=document.getElementById('scanResult');if(!host)return;
    let panel=document.getElementById('secondHandPricingPanel');
    if(!panel){panel=document.createElement('div');panel.id='secondHandPricingPanel';panel.className='result';host.appendChild(panel)}
    const eng=window.BeauPricingEngine;let n={};try{n=eng&&typeof eng.normalise==='function'?eng.normalise(raw,barcode)||{}:{}}catch(_){}
    const title=String(n.title||'').trim(),platform=cleanPlatform(n.platform||''),query=buildQuery(title,platform),link=urls(query||title||String(barcode||''));
    const sites=averages(raw,n),resale=Number(sites.overall)||Number(n.second)||Number(n.resale)||0;
    const ten=Math.round(resale*.10),twenty=Math.round(resale*.20),twentyFive=Math.round(resale*.25),thirty=Math.round(resale*.30),forty=Math.round(resale*.40);
    const row=(name,data)=>'<div class="list-item"><span>'+name+'</span><b>'+(data?money(data.average)+' ('+data.count+' sample'+(data.count===1?'':'s')+')':'Not available')+'</b></div>';
    panel.innerHTML='<h3>♻️ Second-Hand Pricing</h3>'+
      '<div class="list-item"><span>Game</span><b>'+esc(title||'Unknown game')+'</b></div>'+ 
      '<div class="list-item"><span>Console</span><b>'+esc(platform||'Unknown console')+'</b></div>'+ 
      '<div class="list-item"><span>Search phrase</span><b>'+esc(query||'Game + console')+'</b></div>'+ 
      '<h4>Site Averages</h4>'+row('Cash Converters',sites['Cash Converters'])+row('eBay Sold',sites.eBay)+row('Super Retro',sites['Super Retro'])+
      '<div class="list-item"><span>Overall site-average</span><b>'+money(resale)+'</b></div>'+ 
      '<div class="buygrid"><div class="buy"><span>10% EXCELLENT</span><strong>'+money(ten)+'</strong></div><div class="buy"><span>20% VERY GOOD</span><strong>'+money(twenty)+'</strong></div><div class="buy recommended"><span>25% RECOMMENDED ⭐</span><strong>'+money(twentyFive)+'</strong></div><div class="buy"><span>30% TARGET</span><strong>'+money(thirty)+'</strong></div><div class="buy"><span>40% MAXIMUM</span><strong>'+money(forty)+'</strong></div></div>'+ 
      '<div class="toolbar"><a class="btn primary" href="'+link.cash+'" target="_blank" rel="noopener">🔎 Cash Converters</a><a class="btn" href="'+link.ebay+'" target="_blank" rel="noopener">🔎 eBay AU Sold</a><a class="btn" href="'+link.superRetro+'" target="_blank" rel="noopener">🔎 Super Retro</a></div>'+ 
      '<div class="muted">Each site's returned price samples are averaged first. The overall market figure is the mean of the available site averages, so one source cannot dominate simply because it has more listings. Super Retro listings are generally pre-owned unless stated otherwise.</div>'+ 
      '<div class="row"><label>Seller asking price<input id="secondHandAsking" class="input" type="number" min="0" step="1" placeholder="Enter listing price"></label><button id="secondHandDeal" class="btn primary">⚡ Check Deal</button></div>'+ 
      '<div id="secondHandDecision" class="muted">Enter a seller price to get BUY / MAYBE / PASS.</div>';
    const asking=document.getElementById('secondHandAsking'),btn=document.getElementById('secondHandDeal'),decision=document.getElementById('secondHandDecision');
    if(btn&&asking&&decision)btn.onclick=()=>{const a=Number(asking.value)||0;if(!a){decision.textContent='Enter a seller price to get BUY / MAYBE / PASS.';return}let label='❌ PASS';if(twentyFive>0&&a<=twentyFive)label='✅ BUY';else if(forty>0&&a<=forty)label='🟡 MAYBE';decision.innerHTML='<b>'+label+'</b> · Asking '+money(a)+' · Recommended '+money(twentyFive)+' · Maximum '+money(forty)};
  }
  const install=()=>{
    if(typeof window.lookupProduct!=='function'||typeof window.searchSecondHandPricing!=='function')return false;
    const originalLookup=window.lookupProduct,originalSecondHand=window.searchSecondHandPricing;
    if(originalLookup.__secondHandHook)return true;
    const guardedSecondHand=async barcode=>{const b=norm(barcode);if(!b)return;if(lastBarcode===b&&document.getElementById('secondHandPricingPanel'))return;lastBarcode=b;let raw=null;try{raw=await window.BeauPricingEngine.lookup(b)}catch(_){}try{await originalSecondHand(b)}catch(_){}if(raw)try{await renderDecision(raw.data||raw,b)}catch(_){} };
    window.searchSecondHandPricing=guardedSecondHand;
    const wrapped=async function(code){const b=norm(code),result=await originalLookup.apply(this,arguments);if(b)try{await guardedSecondHand(b)}catch(_){}return result};
    wrapped.__secondHandHook=true;window.lookupProduct=wrapped;return true;
  };
  if(!install())document.addEventListener('DOMContentLoaded',()=>install(),{once:true});
})();
