window.addEventListener('DOMContentLoaded',()=>{
 const cloud=window.CloudLibrary;if(!cloud)return;
 const originalSave=window.saveLibrary;
 if(originalSave)window.saveLibrary=function(p){originalSave(p);cloud.learn(p).catch(()=>{})};
 const originalLookup=window.lookupProduct;
 if(!originalLookup)return;
 window.lookupProduct=async function(code){
  const found=await cloud.find(code);
  if(!found)return originalLookup(code);
  const p={title:found.title,barcode:String(found.barcode),platform:found.platform||'',region:found.region||'',resale:Number(found.resale)||0,retail:Number(found.retail)||0,source:'Cloud Game Library'};
  if(window.saveLibrary)window.saveLibrary(p);
  const box=document.getElementById('scanResult');
  const status=document.getElementById('scanStatus');
  const money=v=>'$'+Math.round(Number(v)||0);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const r=p.resale||p.retail*.75;
  if(status){status.textContent='Found in cloud library';status.className='status ok'}
  if(box)box.innerHTML=`<div><h3>🎮 ${esc(p.title)}</h3><div class="muted">${esc(p.platform||'Unknown platform')} · ${esc(p.region||'')} · Barcode ${esc(p.barcode)}</div><div class="buygrid"><div class="buy"><span>10% EXCELLENT</span><strong>${money(r*.10)}</strong></div><div class="buy"><span>20% VERY GOOD</span><strong>${money(r*.20)}</strong></div><div class="buy recommended"><span>25% RECOMMENDED ⭐</span><strong>${money(r*.25)}</strong></div><div class="buy"><span>30% TARGET</span><strong>${money(r*.30)}</strong></div><div class="buy"><span>40% MAXIMUM</span><strong>${money(r*.40)}</strong></div></div><div class="result"><div class="list-item"><span>Expected resale</span><b>${money(r)}</b></div><div class="list-item"><span>Pricing source</span><b>☁️ Cloud Game Library</b></div></div><div class="toolbar"><button class="btn success" onclick="addScannedToStock(${JSON.stringify(p).replace(/"/g,'&quot;')})">＋ Add to Stock</button><button class="btn" onclick="show('inventory')">📚 View Library</button></div></div>`;
  if(window.toast)window.toast('Found in cloud library');
 };
 cloud.syncLocal().catch(()=>{});
});
