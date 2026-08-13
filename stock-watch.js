/* Beau's Reseller Hub — Stock Watch 1.1 */
(function(){'use strict';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const money=v=>'$'+Math.round(Number(v)||0);
function data(){try{const x=JSON.parse(localStorage.getItem('resellerInventory')||'[]');return Array.isArray(x)?x:[]}catch{return[]}}
function num(...vals){for(const v of vals){if(v!==''&&v!==null&&v!==undefined&&Number.isFinite(Number(v)))return Number(v)}return 0}
function market(x){return num(x.market,x.marketPrice,x.rrp,x.resale,x.sell)}
function sell(x){return num(x.sell,x.selling,x.market,x.marketPrice,x.resale)}
function cost(x){return num(x.cost,x.purchasePrice,x.buyPrice)}
function qty(x){return Math.max(1,Math.round(num(x.qty,x.quantity,1)))}
function age(x){const raw=x.dateAdded||x.addedAt||x.createdAt||x.date||Date.now();const t=new Date(raw).getTime();return Number.isFinite(t)?Math.max(0,(Date.now()-t)/86400000):0}
function render(){const d=document.getElementById('dashboard');if(!d)return;let box=document.getElementById('stockWatchBox');if(!box){box=document.createElement('div');box.id='stockWatchBox';box.className='card';d.appendChild(box)}const alerts=[];data().forEach(x=>{const m=market(x),s=sell(x),c=cost(x),q=qty(x),base=m||s,pct=base>0?Math.round(c/base*100):null,days=Math.round(age(x)),profit=(s||base)-c;if(!base)alerts.push({x,reason:'Missing resale price',level:'Pricing',rank:1});else if(c<=0)alerts.push({x,reason:'Purchase price not entered',level:'Cost',rank:2});else if(pct>40)alerts.push({x,reason:`Bought at ${pct}% — above 40% maximum`,level:'Buy price',rank:3});else if(profit<=0)alerts.push({x,reason:`No projected profit at ${money(s||base)}`,level:'Profit',rank:4});else if(days>=60)alerts.push({x,reason:`${days} days in stock`,level:'Age',rank:5});else if(days>=30)alerts.push({x,reason:`${days} days in stock`,level:'Watch',rank:6})});alerts.sort((a,b)=>a.rank-b.rank||String(a.x.name||'').localeCompare(String(b.x.name||'')));
box.innerHTML='<h2>👀 Stock Watch</h2><div class="muted">Pricing, purchase-cost, profit and ageing alerts.</div>'+(alerts.length?alerts.slice(0,8).map(o=>`<div class="list-item"><div><b>${esc(o.x.name||'Unnamed item')}</b><div class="muted">${esc(o.reason)} · ${esc(o.level)}</div></div><button class="btn" onclick="show('inventory');setTimeout(()=>{const q=document.getElementById('invSearch');if(q){q.value=${JSON.stringify(String(o.x.name||''))};q.dispatchEvent(new Event('input'))}},0)">View</button></div>`).join(''):'<div class="empty">✓ No stock needs attention right now.</div>')}
function boot(){render();const old=window.renderDashboard;window.renderDashboard=function(){if(typeof old==='function')old();render()};window.addEventListener('storage',render);document.addEventListener('visibilitychange',()=>{if(!document.hidden)render()})}
window.addEventListener('DOMContentLoaded',boot);
})();
