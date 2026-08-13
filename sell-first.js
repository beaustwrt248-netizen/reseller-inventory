/* Beau's Reseller Hub — Sell First Intelligence 1.3 */
(function(){'use strict';
const $=id=>document.getElementById(id);
const money=v=>'$'+Math.round(Number(v)||0);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
function getInventory(){try{const x=JSON.parse(localStorage.getItem('resellerInventory')||'[]');return Array.isArray(x)?x:[]}catch{return[]}}
function rank(x){const cost=Number(x.cost)||0,sell=Number(x.sell||x.market)||0,qty=Math.max(1,Number(x.qty)||1),profit=Math.max(0,sell-cost)*qty,pct=sell>0?(cost/sell)*100:999,age=Date.now()-new Date(x.dateAdded||Date.now()).getTime(),days=Math.max(0,age/86400000);return {cost,sell,qty,profit,pct,days,score:profit*2+Math.min(days,180)*2+(pct<=25?50:pct<=30?25:0)}}
function render(){const d=document.getElementById('dashboard');if(!d)return;let box=document.getElementById('sellFirstBox');if(!box){box=document.createElement('div');box.id='sellFirstBox';box.className='card';d.appendChild(box)}const items=getInventory().map(x=>({x,m:rank(x)})).filter(o=>o.m.sell>0).sort((a,b)=>b.m.score-a.m.score).slice(0,5);if(!items.length){box.innerHTML='<h2>💸 What Should I Sell First?</h2><div class="empty">Add stock with a selling or market price and this section will rank your best opportunities.</div>';return}box.innerHTML='<h2>💸 What Should I Sell First?</h2><div class="muted">Ranked by profit opportunity, money tied up, deal quality and stock age.</div>'+items.map((o,i)=>`<div class="list-item"><div><b>#${i+1} ${esc(o.x.name||'Unnamed item')}</b><div class="muted">${Math.round(o.m.pct)}% of resale · ${Math.round(o.m.days)} days in stock · ${esc(o.x.platform||'')}</div></div><div><b>${money(o.m.profit)}</b><div class="muted">profit</div></div></div>`).join('')}
function boot(){render();const original=window.renderDashboard;window.renderDashboard=function(){if(typeof original==='function')original();render()};window.addEventListener('storage',render);document.addEventListener('visibilitychange',()=>{if(!document.hidden)render()})}
window.addEventListener('DOMContentLoaded',boot);
})();
