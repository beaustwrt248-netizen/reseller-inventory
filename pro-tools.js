/* Beau's Game Inventory — current reseller tools */
(function(){
'use strict';
const INV='resellerInventory';
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const get=()=>{try{const x=JSON.parse(localStorage.getItem(INV)||'[]');return Array.isArray(x)?x:[]}catch(e){return[]}};
function page(id){return document.getElementById('page-'+id)}
function style(){if(document.getElementById('proStyle'))return;const s=document.createElement('style');s.id='proStyle';s.textContent='.pro-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.pro-card{padding:14px;border:1px solid #e5e7eb;border-radius:12px;background:#fff;margin-top:10px}.pro-card h3{margin:0 0 8px}.pro-age{font-size:12px;color:#6b7280}.pro-low{border-left:5px solid #dc2626}.pro-good{border-left:5px solid #16a34a}@media(max-width:700px){.pro-grid{grid-template-columns:1fr}}body.dark-mode .pro-card{background:#1f2937;border-color:#374151;color:#f9fafb}';document.head.appendChild(s)}
function stockHealth(){const p=page('dashboard');if(!p||document.getElementById('proStockHealth'))return;const b=document.createElement('section');b.className='panel';b.id='proStockHealth';b.innerHTML='<h2>📦 Stock Health</h2><div id="proStockHealthBody"></div>';p.appendChild(b);renderHealth()}
function renderHealth(){const box=document.getElementById('proStockHealthBody');if(!box)return;const items=get(),now=Date.now();const low=items.filter(i=>Number(i.quantity||0)<=1),aged=items.filter(i=>i.dateAdded&&(now-new Date(i.dateAdded).getTime())>=30*86400000);box.innerHTML=`<div class="pro-grid"><div class="pro-card ${low.length?'pro-low':'pro-good'}"><h3>Low Stock</h3><strong>${low.length}</strong><p>Items with 1 unit or less.</p></div><div class="pro-card ${aged.length?'pro-low':'pro-good'}"><h3>30+ Day Stock</h3><strong>${aged.length}</strong><p>Items held for 30 days or more.</p></div></div>`+(aged.length?'<div class="pro-card"><h3>Oldest Stock</h3>'+aged.sort((a,b)=>new Date(a.dateAdded)-new Date(b.dateAdded)).slice(0,8).map(i=>`<p><strong>${esc(i.name)}</strong> <span class="pro-age">${Math.floor((now-new Date(i.dateAdded).getTime())/86400000)} days</span></p>`).join('')+'</div>':'')}
function loadAdmin(){if(document.getElementById('beauAdminPanelLoader'))return;const s=document.createElement('script');s.id='beauAdminPanelLoader';s.src='./admin-panel.js?v=2.0.2';document.head.appendChild(s)}
function init(){style();setTimeout(()=>{stockHealth();renderHealth();loadAdmin()},300)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();window.addEventListener('beau:update-ready',init);window.addEventListener('hashchange',()=>setTimeout(init,100));
})();
