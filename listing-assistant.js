(()=>{'use strict';
const money=v=>new Intl.NumberFormat('en-AU',{style:'currency',currency:'AUD'}).format(Number(v)||0);
function open(){
  if(document.getElementById('laPanel'))return;
  const p=document.createElement('div');p.id='laPanel';
  p.innerHTML='<div class="la-head"><b>🏷️ Listing Assistant</b><button id="laClose">×</button></div><div class="la-wrap"><div class="la-card"><div class="la-grid"><input id="laTitle" placeholder="Game / item title"><input id="laPlatform" placeholder="Platform"><select id="laCondition"><option>Used - Good</option><option>Used - Very Good</option><option>Used - Acceptable</option><option>New</option><option>For parts / repair</option></select><input id="laPrice" type="number" placeholder="Selling price"><input id="laCost" type="number" placeholder="Purchase cost"><input id="laBarcode" placeholder="Barcode"></div><textarea id="laNotes" placeholder="Condition notes, included items, scratches, missing manuals, etc."></textarea><button id="laGenerate">Generate Listing</button></div><div class="la-card"><h3>Ready to copy</h3><textarea id="laOutput" readonly></textarea><button id="laCopy">📋 Copy Listing</button><span id="laCopied"></span></div></div>';
  document.body.appendChild(p);
  document.getElementById('laClose').onclick=()=>p.remove();
  document.getElementById('laGenerate').onclick=generate;
  document.getElementById('laCopy').onclick=copy;
}
function generate(){
  const t=document.getElementById('laTitle').value.trim()||'Item';
  const pl=document.getElementById('laPlatform').value.trim();
  const c=document.getElementById('laCondition').value;
  const n=Number(document.getElementById('laPrice').value)||0;
  const cost=Number(document.getElementById('laCost').value)||0;
  const b=document.getElementById('laBarcode').value.trim();
  const notes=document.getElementById('laNotes').value.trim();
  const net=n-n*0.13-9-1.5-cost;
  const lines=[t+(pl?' - '+pl:''),'','Condition: '+c,'Price: '+money(n)];
  if(b)lines.push('Barcode: '+b);
  lines.push('',notes||'Item is in good used condition. Please see photos for overall condition.','','Includes: item shown in photos.','Fast dispatch from Australia.','','Estimated net profit after 13% fee, $9 postage and $1.50 packaging: '+money(net));
  document.getElementById('laOutput').value=lines.join('\n');
}
function copy(){
  const x=document.getElementById('laOutput');
  const done=()=>document.getElementById('laCopied').textContent=' Copied!';
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(x.value).then(done).catch(()=>{x.select();document.execCommand('copy');done()});
  else{x.select();document.execCommand('copy');done()}
}
function init(){
  if(document.getElementById('laOpen'))return;
  const b=document.createElement('button');b.id='laOpen';b.className='action';b.innerHTML='<strong>🏷️ Listing Assistant</strong><span>Generate marketplace listings</span>';b.onclick=open;
  const a=document.querySelector('.hero .actions');if(a)a.appendChild(b);
  const s=document.createElement('style');s.textContent='#laPanel{position:fixed;inset:0;z-index:10001;background:#f6f7f9;overflow:auto}.la-head{position:sticky;top:0;background:#fff;padding:14px 16px;border-bottom:1px solid #ddd;display:flex;justify-content:space-between}.la-head button{border:0;background:none;font-size:24px}.la-wrap{max-width:900px;margin:auto;padding:14px}.la-card{background:#fff;border:1px solid #ddd;border-radius:14px;padding:14px;margin-bottom:12px}.la-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}.la-grid input,.la-grid select,.la-card textarea{width:100%;padding:11px;border:1px solid #bbb;border-radius:9px;font:inherit}.la-card textarea{min-height:180px;margin-top:8px}.la-card button{margin-top:8px;padding:11px 14px;border-radius:9px;border:1px solid #999;background:#fff}.la-card button:first-of-type{background:#111;color:#fff}@media(max-width:650px){.la-grid{grid-template-columns:1fr}}';document.head.appendChild(s);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();