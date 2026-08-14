/* Scanner Deal Analyser 1.0 — bundle-aware buying intelligence */
(function(){
'use strict';
const money=v=>'$'+Number(v||0).toFixed(0);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const pct=(a,b)=>b>0?(a/b*100):0;
function analyse(){
 const rows=[...document.querySelectorAll('#dealRows .deal-row')];
 let resale=0,asking=0,count=0;
 rows.forEach(r=>{const q=Math.max(1,Number(r.querySelector('.dq')?.value||1));const rv=Number(r.querySelector('.dr')?.value||0);const av=Number(r.querySelector('.da')?.value||0);resale+=rv*q;asking+=av*q;count+=q});
 const target=resale*.25,max=resale*.30,gross=resale-asking,p=pct(asking,resale);
 let label='ENTER ASKING PRICE',cls='';
 if(resale&&asking){if(p<=25){label='🔥 GREAT DEAL';cls='deal-good'}else if(p<=30){label='✅ GOOD DEAL';cls='deal-good'}else if(p<=40){label='⚠️ CAUTION';cls='deal-warn'}else{label='❌ PASS';cls='deal-bad'}}
 document.getElementById('dealSummary').innerHTML=`<div class="deal-grid"><div><span>Total resale</span><strong>${money(resale)}</strong></div><div><span>Target buy (25%)</span><strong>${money(target)}</strong></div><div><span>Maximum buy (30%)</span><strong>${money(max)}</strong></div><div><span>Asking total</span><strong>${money(asking)}</strong></div></div><div class="deal-line"><span>Items</span><b>${count}</b></div><div class="deal-line"><span>Asking as % of resale</span><b>${resale?p.toFixed(0)+'%':'—'}</b></div><div class="deal-line"><span>Potential gross profit</span><b>${money(gross)}</b></div><div class="deal-verdict ${cls}">${label}</div>`;
}
function addRow(title='',resale='',asking='',qty=1){
 const row=document.createElement('div');row.className='deal-row';row.innerHTML=`<input class="dn" value="${esc(title)}" placeholder="Item"><input class="dr" type="number" min="0" step="1" value="${resale}" placeholder="Resale"><input class="da" type="number" min="0" step="1" value="${asking}" placeholder="Asking"><input class="dq" type="number" min="1" step="1" value="${qty}"><button type="button" class="deal-remove">×</button>`;
 row.querySelectorAll('input').forEach(i=>i.addEventListener('input',analyse));row.querySelector('.deal-remove').onclick=()=>{row.remove();analyse()};document.getElementById('dealRows').appendChild(row);analyse();
}
function scanToDeal(){
 const p=document.getElementById('productPanel');if(!p)return;
 const title=p.querySelector('h2')?.textContent?.replace(/^🎮\s*/,'')||'Scanned game';
 let resale=0;p.querySelectorAll('.row').forEach(r=>{if(/Expected resale/i.test(r.firstElementChild?.textContent||''))resale=Number((r.lastElementChild?.textContent||'').replace(/[^0-9.]/g,''))||0});
 if(resale){addRow(title,resale,'',1);document.getElementById('dealPanel').scrollIntoView({behavior:'smooth',block:'start'})}
}
function mount(){if(document.getElementById('dealPanel')||!document.getElementById('productPanel'))return;const s=document.createElement('section');s.id='dealPanel';s.className='panel';s.innerHTML=`<h2>🧠 Deal Analyser</h2><p class="deal-help">Build a bundle, enter the seller's asking prices and instantly see what you should pay.</p><div class="deal-head"><span>Item</span><span>Resale</span><span>Asking</span><span>Qty</span><span></span></div><div id="dealRows"></div><div class="actions"><button id="dealAdd" class="secondary">＋ Add Item</button><button id="dealScan" class="primary">📷 Add Scanned Game</button></div><div id="dealSummary" class="deal-summary"></div>`;document.getElementById('addPanel').before(s);document.getElementById('dealAdd').onclick=()=>addRow();document.getElementById('dealScan').onclick=scanToDeal;addRow();}
function style(){const st=document.createElement('style');st.textContent=`#dealPanel{scroll-margin-top:12px}.deal-help{color:#6b7280;margin-top:-6px}.deal-head,.deal-row{display:grid;grid-template-columns:2fr 1fr 1fr .7fr 36px;gap:7px;align-items:center}.deal-head{font-size:11px;font-weight:800;color:#6b7280;margin-bottom:5px}.deal-row{margin-bottom:7px}.deal-row input{margin-top:0;padding:10px;font-size:14px;min-width:0}.deal-remove{padding:9px;background:#fff0f2;color:#a62b3e}.deal-summary{margin-top:14px;padding:13px;border:1px solid #e7e9f0;border-radius:14px}.deal-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}.deal-grid>div{padding:10px;background:#fbfbfe;border-radius:10px}.deal-grid span{display:block;font-size:11px;color:#6b7280;font-weight:800}.deal-grid strong{font-size:20px}.deal-line{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee}.deal-verdict{text-align:center;font-size:18px;font-weight:900;padding:12px;margin-top:10px;border-radius:12px;background:#f1f3f8}.deal-good{background:#e8fbf2;color:#147b59}.deal-warn{background:#fff7df;color:#8a6200}.deal-bad{background:#fff0f2;color:#a62b3e}@media(max-width:480px){.deal-head,.deal-row{grid-template-columns:1.7fr 1fr 1fr .65fr 32px}.deal-row input{font-size:12px;padding:9px}}`;document.head.appendChild(st)}
function boot(){style();mount();const p=document.getElementById('productPanel');if(p)new MutationObserver(()=>{const b=document.getElementById('dealScan');if(b)b.disabled=!p.querySelector('h2')}).observe(p,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
