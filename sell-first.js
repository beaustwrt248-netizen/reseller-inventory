/* Beau's Reseller Hub — Sell First Intelligence 1.4 */
(function(){'use strict';
const $=id=>document.getElementById(id);
const money=v=>'$'+Math.round(Number(v)||0);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
function getInventory(){try{const x=JSON.parse(localStorage.getItem('resellerInventory')||'[]');return Array.isArray(x)?x:[]}catch{return[]}}
function rank(x){
  const cost=Number(x.cost)||0,sell=Number(x.sell||x.market)||0,qty=Math.max(1,Number(x.qty)||1);
  const profit=Math.max(0,sell-cost)*qty;
  const pct=sell>0?(cost/sell)*100:999;
  const idTime=Number(x.id);
  const added=new Date(x.dateAdded||(!Number.isNaN(idTime)&&idTime>100000000000? idTime:Date.now())).getTime();
  const age=Date.now()-added,days=Math.max(0,age/86400000);
  const dealBonus=pct<=25?60:pct<=30?35:pct<=40?10:-40;
  const ageBonus=Math.min(days,180)*2;
  const capitalPenalty=Math.min(cost*0.15,100);
  const score=profit*2+ageBonus+dealBonus-capitalPenalty;
  return {cost,sell,qty,profit,pct,days,score};
}
function render(){
  const d=document.getElementById('dashboard');if(!d)return;
  let box=document.getElementById('sellFirstBox');
  if(!box){box=document.createElement('div');box.id='sellFirstBox';box.className='card';d.appendChild(box)}
  const items=getInventory().map(x=>({x,m:rank(x)})).filter(o=>o.m.sell>0).sort((a,b)=>b.m.score-a.m.score).slice(0,5);
  if(!items.length){box.innerHTML='<h2>💸 What Should I Sell First?</h2><div class="empty">Add stock with a selling or market price and this section will rank your best opportunities.</div>';return}
  box.innerHTML='<h2>💸 What Should I Sell First?</h2><div class="muted">Prioritised by potential profit, deal quality, money tied up and stock age.</div>'+items.map((o,i)=>{
    const label=o.m.pct<=25?'GREAT DEAL':o.m.pct<=30?'GOOD DEAL':o.m.pct<=40?'CAUTION':'OVER 40%';
    const id=esc(o.x.id||'');
    return `<div class="list-item"><div><b>#${i+1} ${esc(o.x.name||'Unnamed item')}</b><div class="muted">${Math.round(o.m.pct)}% of resale · ${Math.round(o.m.days)} days · ${esc(o.x.platform||'')}</div><div class="muted">${label} · ${money(o.m.cost*o.m.qty)} tied up</div></div><div><b>${money(o.m.profit)}</b><div class="muted">potential profit</div><button class="btn" onclick="window.SellFirst.open('${id}')">View</button></div></div>`;
  }).join('');
}
window.SellFirst={open:function(id){const inv=getInventory();const item=inv.find(x=>String(x.id)===String(id));if(!item)return;const search=$( 'invSearch');if(search)search.value=item.name||item.barcode||'';if(typeof window.show==='function')window.show('inventory');else window.location.hash='#inventory';}};
function boot(){render();const original=window.renderDashboard;window.renderDashboard=function(){if(typeof original==='function')original();render()};window.addEventListener('storage',render);document.addEventListener('visibilitychange',()=>{if(!document.hidden)render()})}
window.addEventListener('DOMContentLoaded',boot);
})();
