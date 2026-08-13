/* Beau's Reseller Hub — Stock Watch 1.0 */
(function(){'use strict';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const money=v=>'$'+Math.round(Number(v)||0);
function data(){try{const x=JSON.parse(localStorage.getItem('resellerInventory')||'[]');return Array.isArray(x)?x:[]}catch{return[]}}
function age(x){const t=new Date(x.dateAdded||Date.now()).getTime();return Math.max(0,(Date.now()-t)/86400000)}
function render(){const d=document.getElementById('dashboard');if(!d)return;let box=document.getElementById('stockWatchBox');if(!box){box=document.createElement('div');box.id='stockWatchBox';box.className='card';d.appendChild(box)}const all=data();const alerts=[];all.forEach(x=>{const cost=Number(x.cost)||0,sell=Number(x.sell||x.market)||0,pct=sell>0?Math.round(cost/sell*100):null,days=Math.round(age(x));if(!sell)alerts.push({x,reason:'Missing resale price',level:'Pricing'});else if(pct>40)alerts.push({x,reason:`Bought at ${pct}% — above 40% maximum`,level:'Buy price'});else if(days>=60)alerts.push({x,reason:`${days} days in stock`,level:'Age'});else if(days>=30)alerts.push({x,reason:`${days} days in stock`,level:'Watch'})});
box.innerHTML='<h2>👀 Stock Watch</h2><div class="muted">Items that need pricing, buying-price or age attention.</div>'+(alerts.length?alerts.slice(0,6).map(o=>`<div class="list-item"><div><b>${esc(o.x.name||'Unnamed item')}</b><div class="muted">${esc(o.reason)} · ${esc(o.level)}</div></div><button class="btn" onclick="show('inventory');setTimeout(()=>{const q=document.getElementById('invSearch');if(q){q.value=${JSON.stringify(String(o.x.name||''))};q.dispatchEvent(new Event('input'))}},0)">View</button></div>`).join(''):'<div class="empty">✓ No stock needs attention right now.</div>')}
function boot(){render();const old=window.renderDashboard;window.renderDashboard=function(){if(typeof old==='function')old();render()};window.addEventListener('storage',render);document.addEventListener('visibilitychange',()=>{if(!document.hidden)render()})}
window.addEventListener('DOMContentLoaded',boot);
})();
