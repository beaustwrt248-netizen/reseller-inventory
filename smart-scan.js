/* Beau's Game Inventory v1.8.6 — Smart Scan */
(function(){'use strict';
const WORKER='https://beau-reseller-pricing.beaustwrt248.workers.dev';
const INV='resellerInventory';
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const money=v=>Number(v)>0?'$'+Number(v).toFixed(2):'Not available';
const getInv=()=>{try{const x=JSON.parse(localStorage.getItem(INV)||'[]');return Array.isArray(x)?x:[]}catch(e){return[]}};
const saveInv=x=>localStorage.setItem(INV,JSON.stringify(x));
const buyPct=()=>{try{return Math.min(100,Math.max(1,Number(JSON.parse(localStorage.getItem('beauAdminSettings')||'{}').buyPct)||70))}catch(e){return 70}};
function normalise(data,barcode){
  const p=data?.product||data?.products?.[0]||data?.data?.products?.[0]||data?.data?.product||data?.result?.products?.[0]||data?.result?.product;
  if(!p)throw Error('No matching product found');
  const title=p.title||p.name||p.product_name||'Unknown game';
  const platform=p.platform||p.console||p.system||'';
  const image=p.image||p.image_url||p.images?.[0]||'';
  const pricing=data?.pricing||{};
  const retail=Number(pricing.retailPrice||p.retail_price||p.rrp||p.current_price||p.price||0);
  const market=Number(pricing.secondHandPrice||p.market_price||p.used_price||p.second_hand_price||p.used||0);
  const rawSources=Array.isArray(data?.stores)?data.stores:(Array.isArray(data?.prices)?data.prices:(Array.isArray(p.stores)?p.stores:(Array.isArray(p.prices)?p.prices:[])));
  const valid=rawSources.filter(x=>String(x.source||x.store||x.name||'').toLowerCase()!=='cash converters'&&!String(x.source||x.store||x.name||'').toLowerCase().includes('cashconverters')&&Number(x.price||x.sale_price)>0);
  const sources=valid.map(x=>({source:x.source||x.store||x.name||'Source',price:Number(x.price||x.sale_price)}));
  const retailCandidates=sources.map(x=>x.price).filter(Number.isFinite);
  const r=retail||Math.max(0,...retailCandidates);
  const m=market||0;
  const resale=Number(pricing.suggestedResale)>0?Number(pricing.suggestedResale):(m||r*.75);
  const maxBuy=Number(pricing.maximumBuy)>0?Number(pricing.maximumBuy):resale*(buyPct()/100);
  const existing=getInv().find(i=>String(i.barcode||'').replace(/\D/g,'')===String(barcode).replace(/\D/g,''));
  return{title,platform,image,barcode,retail:r,market:m,resale,maxBuy,existing,sources};
}
async function lookup(barcode){
  const r=await fetch(WORKER+'/price?barcode='+encodeURIComponent(barcode),{cache:'no-store'});
  if(!r.ok){let msg='Pricing service unavailable';try{const e=await r.json();msg=e?.message||e?.error||msg}catch(_){}throw Error(msg)}
  return r.json();
}
function decision(x){if(!x.maxBuy)return['gray','⚪ PRICE DATA NEEDED'];const ratio=x.market&&x.retail?x.market/x.retail:0;if(ratio>=.75)return['good','🟢 STRONG BUY'];if(ratio>=.5)return['maybe','🟡 CHECK PRICE'];return['pass','🔴 LOW VALUE / PASS']}
function show(x){document.getElementById('smartScanModal')?.remove();const [cls,label]=decision(x),o=document.createElement('div');o.id='smartScanModal';const src=x.sources.length?x.sources.map(s=>`<div class="price-row"><span>${esc(s.source)}</span><strong>${money(s.price)}</strong></div>`).join(''):'<p class="smart-muted">No live store prices returned.</p>';o.innerHTML=`<div class="smart-scan-card"><h2>🎮 Confirm Game</h2><p class="smart-muted">Barcode: ${esc(x.barcode)}</p>${x.image?`<img src="${esc(x.image)}" alt="" style="max-width:120px;max-height:120px;border-radius:12px;float:right;margin:0 0 10px 10px;object-fit:contain">`:''}<div class="smart-product"><strong>${esc(x.title)}</strong><span>${esc(x.platform||'Platform not confirmed')} • Game</span></div><div class="smart-prices"><div><span>Retail</span><b>${money(x.retail)}</b></div><div><span>Second-hand</span><b>${money(x.market)}</b></div><div><span>Suggested resale</span><b>${money(x.resale)}</b></div><div><span>Maximum buy</span><b>${money(x.maxBuy)}</b></div></div><div class="smart-card"><strong>Pricing sources</strong>${src}<p class="smart-muted">Cash Converters is excluded.</p></div><div class="smart-decision ${cls}"><span>Recommendation</span><strong>${label}</strong></div>${x.existing?`<div class="smart-card"><strong>📦 Already in inventory</strong><p>${esc(x.existing.name||x.title)} — ${Number(x.existing.quantity||0)} unit(s)</p></div>`:''}<label>Condition<select id="smartCondition"><option>Used - Good</option><option>Like New</option><option>Used - Fair</option><option>New</option><option>For Parts</option></select></label><label style="margin-top:12px">Actual purchase price ($)<input id="smartActualCost" type="number" min="0" step="0.01" placeholder="Enter what you actually pay"></label><p class="smart-muted">The suggested maximum buy is only a guide. It will never be saved as your actual cost unless you enter that amount.</p><div class="actions"><button class="secondary" id="smartCancel">Cancel</button><button class="primary" id="smartConfirm">${x.existing?'Add to Existing Stock':'Confirm Purchase & Add'}</button></div></div>`;document.body.appendChild(o);o.querySelector('#smartCancel').onclick=()=>o.remove();o.querySelector('#smartConfirm').onclick=()=>{const cost=Number(o.querySelector('#smartActualCost').value);if(!Number.isFinite(cost)||cost<0){alert('Enter the actual amount you paid first.');return}const a=getInv(),condition=o.querySelector('#smartCondition').value;if(x.existing){x.existing.quantity=Number(x.existing.quantity||0)+1;x.existing.cost=cost;x.existing.condition=condition;x.existing.priceChecked=new Date().toISOString()}else a.push({id:Date.now(),name:x.title,barcode:x.barcode,category:'Game',platform:x.platform||'Other',condition,quantity:1,cost,rrp:x.retail,marketPrice:x.market,selling:x.resale,priceSource:x.sources.map(s=>s.source).join(', ')||'Barcode Lookup',priceChecked:new Date().toISOString(),sales:[],dateAdded:new Date().toISOString()});saveInv(a);o.remove();alert('Purchase confirmed and added to inventory.');window.dispatchEvent(new Event('inventory-updated'));window.BeauNavigation?.activate('inventory',true)}}
async function run(code){code=String(code||'').trim();if(!code)return;try{const x=normalise(await lookup(code),code);show(x)}catch(e){alert(e?.message||'The barcode could not be identified or priced right now. You can add the game manually instead.')}}
function init(){const input=document.getElementById('barcodeSearch'),btn=document.getElementById('lookupButton');if(btn&&!btn.dataset.smartWired){btn.dataset.smartWired='1';btn.onclick=()=>run(input?.value)}if(input&&!input.dataset.smartWired){input.dataset.smartWired='1';input.addEventListener('keydown',e=>{if(e.key==='Enter')run(input.value)})}window.BeauSmartScan={lookup:run};}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,350));else setTimeout(init,350);window.addEventListener('beau:update-ready',init);window.addEventListener('inventory-updated',init);
})();
