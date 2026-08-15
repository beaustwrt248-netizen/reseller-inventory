/* Direct second-hand pricing hook + name/console market search + reseller deal decision. */
(function(){
  'use strict';
  const norm=v=>String(v||'').replace(/\D/g,'');
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const money=v=>Number(v)>0?'$'+Math.round(Number(v)):'—';
  const cleanPlatform=p=>String(p||'').trim();
  const buildQuery=(title,platform)=>[title,cleanPlatform(platform)].filter(Boolean).join(' ').replace(/\s+/g,' ').trim();
  const urls=query=>({cash:'https://www.cashconverters.com.au/search-results?query='+encodeURIComponent(query),ebay:'https://www.ebay.com.au/sch/i.html?_nkw='+encodeURIComponent(query)+'&LH_Sold=1&LH_Complete=1'});
  let lastBarcode='';
  async function renderDecision(raw,barcode){
    const host=document.getElementById('scanResult'); if(!host)return;
    let panel=document.getElementById('secondHandPricingPanel');
    if(!panel){panel=document.createElement('div');panel.id='secondHandPricingPanel';panel.className='result';host.appendChild(panel)}
    const eng=window.BeauPricingEngine;
    let n={}; try{n=eng&&typeof eng.normalise==='function'?eng.normalise(raw,barcode)||{}:{}}catch(_){}
    const title=String(n.title||'').trim(), platform=cleanPlatform(n.platform||''), query=buildQuery(title,platform), link=urls(query||title||String(barcode||'')), resale=Number(n.second)||Number(n.resale)||0;
    const ten=Math.round(resale*.10),twenty=Math.round(resale*.20),twentyFive=Math.round(resale*.25),thirty=Math.round(resale*.30),forty=Math.round(resale*.40);
    panel.innerHTML='<h3>♻️ Second-Hand Pricing</h3><div class="list-item"><span>Game</span><b>'+esc(title||'Unknown game')+'</b></div><div class="list-item"><span>Console</span><b>'+esc(platform||'Unknown console')+'</b></div><div class="list-item"><span>Search phrase</span><b>'+esc(query||'Game + console')+'</b></div><div class="list-item"><span>Used-market estimate</span><b>'+money(resale)+'</b></div><div class="buygrid"><div class="buy"><span>10% EXCELLENT</span><strong>'+money(ten)+'</strong></div><div class="buy"><span>20% VERY GOOD</span><strong>'+money(twenty)+'</strong></div><div class="buy recommended"><span>25% RECOMMENDED ⭐</span><strong>'+money(twentyFive)+'</strong></div><div class="buy"><span>30% TARGET</span><strong>'+money(thirty)+'</strong></div><div class="buy"><span>40% MAXIMUM</span><strong>'+money(forty)+'</strong></div></div><div class="toolbar"><a class="btn primary" href="'+link.cash+'" target="_blank" rel="noopener">🔎 Cash Converters</a><a class="btn" href="'+link.ebay+'" target="_blank" rel="noopener">🔎 eBay AU Sold</a></div><div class="muted">Both searches use the resolved game name + console. eBay is filtered to completed/sold listings where supported.</div><div class="row"><label>Seller asking price<input id="secondHandAsking" class="input" type="number" min="0" step="1" placeholder="Enter listing price"></label><button id="secondHandDeal" class="btn primary">⚡ Check Deal</button></div><div id="secondHandDecision" class="muted">Enter a seller price to get BUY / MAYBE / PASS.</div>';
    const asking=document.getElementById('secondHandAsking'),btn=document.getElementById('secondHandDeal'),decision=document.getElementById('secondHandDecision');
    if(btn&&asking&&decision)btn.onclick=()=>{const a=Number(asking.value)||0;if(!a){decision.textContent='Enter a seller price to get BUY / MAYBE / PASS.';return}let label='❌ PASS';if(twentyFive>0&&a<=twentyFive)label='✅ BUY';else if(forty>0&&a<=forty)label='🟡 MAYBE';decision.innerHTML='<b>'+label+'</b> · Asking '+money(a)+' · Recommended '+money(twentyFive)+' · Maximum '+money(forty)};
  }
  const install=()=>{
    if(typeof window.lookupProduct!=='function'||typeof window.searchSecondHandPricing!=='function')return false;
    const originalLookup=window.lookupProduct,originalSecondHand=window.searchSecondHandPricing;
    if(originalLookup.__secondHandHook)return true;
    const guardedSecondHand=async barcode=>{const b=norm(barcode);if(!b)return;if(lastBarcode===b&&document.getElementById('secondHandPricingPanel'))return;lastBarcode=b;let raw=null;try{raw=await window.BeauPricingEngine.lookup(b);await renderDecision(raw.data||raw,b)}catch(_){}try{return await originalSecondHand(b)}catch(_){} };
    window.searchSecondHandPricing=guardedSecondHand;
    const wrapped=async function(code){const b=norm(code),result=await originalLookup.apply(this,arguments);if(b)try{await guardedSecondHand(b)}catch(_){}return result};
    wrapped.__secondHandHook=true;window.lookupProduct=wrapped;return true;
  };
  if(!install())document.addEventListener('DOMContentLoaded',()=>install(),{once:true});
})();
