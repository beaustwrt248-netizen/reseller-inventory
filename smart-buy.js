/* Beau's Reseller Hub — Smart Pricing v2.0 */
(function(){
'use strict';

const whole=v=>Math.round(Number(v)||0);
const num=v=>{const n=Number(v);return Number.isFinite(n)&&n>=0?n:0};
const money=v=>'$'+whole(v);

const rates={
  'New':.30,
  'Like New':.28,
  'Used - Good':.25,
  'Used - Fair':.23,
  'For Parts':.21
};

function getRate(condition){return rates[condition]??.25}

function calculate(resale,asking,condition='Used - Good',fees=0,postage=0,other=0){
  const r=num(resale);
  const a=Number(asking);
  const rate=getRate(condition);
  const buy25=whole(r*.25);
  const recommendedBuy=whole(r*rate);
  const maxBuy=whole(r*.40);
  const excellentBuy=whole(r*.10);
  const veryGoodBuy=whole(r*.20);
  const targetBuy=whole(r*.30);
  const sellingCosts=num(fees)+num(postage)+num(other);
  const targetSale=r;
  const targetNetProfit=targetSale-recommendedBuy-sellingCosts;
  const targetROI=(recommendedBuy+sellingCosts)>0?(targetNetProfit/(recommendedBuy+sellingCosts))*100:0;
  const askingNetProfit=Number.isFinite(a)?targetSale-a-sellingCosts:0;
  const askingROI=(Number.isFinite(a)&&a+sellingCosts>0)?(askingNetProfit/(a+sellingCosts))*100:0;
  const breakEven=whole(targetSale-sellingCosts);
  let status='ENTER PRICE',className='neutral',message='Enter the seller’s asking price.';
  if(Number.isFinite(a)&&a>=0){
    if(a<=recommendedBuy){status='BUY';className='buy';message=`Strong buy — at or below the ${Math.round(rate*100)}% condition target.`}
    else if(a<=buy25){status='BUY';className='buy';message='Buy — within your recommended 25% buying zone.'}
    else if(a<=targetBuy){status='NEGOTIATE';className='negotiate';message='Potential buy — negotiate toward your recommended buy price.'}
    else if(a<=maxBuy){status='CAUTION';className='caution';message='Possible buy — above target but still inside your 40% maximum.'}
    else{status='PASS';className='pass';message='Above your 40% maximum — pass unless there is a special reason.'}
  }
  return {status,className,message,r,a,rate,excellentBuy,veryGoodBuy,buy25,recommendedBuy,targetBuy,maxBuy,targetSale,sellingCosts,targetNetProfit,targetROI,askingNetProfit,askingROI,breakEven};
}

function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}

function ensureInputs(){
  const card=document.querySelector('#smartBuyBtn')?.closest('.card');
  if(!card)return;
  const row=card.querySelector('.row');
  if(!row)return;
  if(document.getElementById('smartFees'))return;
  row.insertAdjacentHTML('beforeend',`
    <label>Selling fees<input id="smartFees" class="input" type="number" min="0" step="1" value="0" placeholder="0"></label>
    <label>Postage<input id="smartPostage" class="input" type="number" min="0" step="1" value="0" placeholder="0"></label>
    <label>Other costs<input id="smartOther" class="input" type="number" min="0" step="1" value="0" placeholder="0"></label>
  `);
  ['smartFees','smartPostage','smartOther'].forEach(id=>document.getElementById(id)?.addEventListener('input',render));
}

function render(){
  ensureInputs();
  const resale=document.getElementById('resale');
  const asking=document.getElementById('askingPrice');
  const condition=document.getElementById('condition');
  const out=document.getElementById('smartResult');
  if(!resale||!asking||!out)return;

  const r=num(resale.value);
  const a=Number(asking.value);
  const c=condition?.value||'Used - Good';
  const fees=num(document.getElementById('smartFees')?.value);
  const postage=num(document.getElementById('smartPostage')?.value);
  const other=num(document.getElementById('smartOther')?.value);

  if(!r){
    out.innerHTML='<div class="muted">Enter an expected resale value to generate your smart buying plan.</div>';
    return;
  }

  const d=calculate(r,a,c,fees,postage,other);

  out.innerHTML=`
    <div class="list-item"><span>Decision</span><b>${d.status}</b></div>
    <div class="list-item"><span>Target sale price</span><b>${money(d.targetSale)}</b></div>
    <div class="list-item"><span>Condition</span><b>${esc(c)} · ${Math.round(d.rate*100)}%</b></div>
    <div class="list-item"><span>⭐ Recommended buy</span><b>${money(d.recommendedBuy)}</b></div>
    <div class="list-item"><span>Excellent buy · 10%</span><b>${money(d.excellentBuy)}</b></div>
    <div class="list-item"><span>Very good · 20%</span><b>${money(d.veryGoodBuy)}</b></div>
    <div class="list-item"><span>25% recommended zone</span><b>${money(d.buy25)}</b></div>
    <div class="list-item"><span>30% target</span><b>${money(d.targetBuy)}</b></div>
    <div class="list-item"><span>🚨 Absolute maximum · 40%</span><b>${money(d.maxBuy)}</b></div>
    <div class="list-item"><span>Break-even purchase ceiling</span><b>${money(d.breakEven)}</b></div>
    <div class="list-item"><span>Seller asking</span><b>${Number.isFinite(a)?money(a):'—'}</b></div>
    <div class="list-item"><span>Expected net profit at recommended buy</span><b>${money(d.targetNetProfit)}</b></div>
    <div class="list-item"><span>Expected ROI at recommended buy</span><b>${whole(d.targetROI)}%</b></div>
    ${Number.isFinite(a)&&a>=0?`<div class="list-item"><span>Net profit at asking price</span><b>${money(d.askingNetProfit)}</b></div><div class="list-item"><span>ROI at asking price</span><b>${whole(d.askingROI)}%</b></div>`:''}
    <p class="muted">${d.message}</p>
  `;
}

function readInventory(){try{const x=JSON.parse(localStorage.getItem('resellerInventory')||'[]');return Array.isArray(x)?x:[]}catch{return[]}}
function pct(x){const market=num(x.market||x.sell),cost=num(x.cost);return market>0?Math.round(cost/market*100):null}
function deal(p){if(p===null)return'NO MARKET PRICE';if(p<=25)return'GREAT DEAL';if(p<=30)return'GOOD DEAL';if(p<=40)return'CAUTION';return'OVER 40%'}
function ageDays(x){const d=x.dateAdded||x.datePurchased||x.createdAt;if(!d)return null;const t=Date.parse(d);return Number.isFinite(t)?Math.max(0,Math.floor((Date.now()-t)/86400000)):null}
function attention(x,p){const a=[];if(!String(x.barcode||'').trim())a.push('Missing barcode');if(String(x.cost??'').trim()==='')a.push('Missing purchase price');if(p===null)a.push('Missing market price');if(p!==null&&p>40)a.push('Over 40%');if(p!==null&&num(x.sell||x.market)<=num(x.cost))a.push('No projected profit');return a}
function intelligence(){
  const inv=readInventory();
  const rows=inv.map(x=>{const q=Math.max(1,num(x.qty)||1),cost=num(x.cost),market=num(x.market||x.sell),p=pct(x),age=ageDays(x);return{item:x,name:x.name||'Unnamed Game',cost:cost*q,sales:market*q,profit:(market-cost)*q,p,age,issues:attention(x,p)}});
  const capital=rows.reduce((s,x)=>s+x.cost,0),sales=rows.reduce((s,x)=>s+x.sales,0),profit=sales-capital,over=rows.filter(x=>x.p!==null&&x.p>40).length,great=rows.filter(x=>x.p!==null&&x.p<=25).length,needs=rows.filter(x=>x.issues.length),best=rows.filter(x=>x.p!==null).sort((a,b)=>a.p-b.p).slice(0,5),sellFirst=rows.filter(x=>x.sales>0).sort((a,b)=>{const scoreA=a.profit*2+(a.age??0)*3-(a.cost*.1),scoreB=b.profit*2+(b.age??0)*3-(b.cost*.1);return scoreB-scoreA}).slice(0,5),dash=document.getElementById('dashboard');
  if(!dash)return;
  let card=document.getElementById('stockIntelCard');
  if(!card){card=document.createElement('div');card.id='stockIntelCard';card.className='card';dash.appendChild(card)}
  card.innerHTML=`<h2>📊 Stock Intelligence</h2><div class="stats"><div class="stat"><span>CAPITAL</span><strong>${money(capital)}</strong></div><div class="stat"><span>POTENTIAL PROFIT</span><strong>${money(profit)}</strong></div><div class="stat"><span>GREAT DEALS</span><strong>${great}</strong></div><div class="stat"><span>OVER 40%</span><strong>${over}</strong></div></div><div class="result"><div class="list-item"><span>Potential sales value</span><b>${money(sales)}</b></div><div class="list-item"><span>Stock needing attention</span><b>${needs.length}</b></div></div><h3>🚨 Needs Attention</h3>${needs.length?needs.slice(0,6).map(x=>`<div class="list-item"><div><b>${esc(x.name)}</b><div class="muted">${x.issues.join(' · ')}</div></div><b>${x.p===null?'—':x.p+'%'}</b></div>`).join(''):'<div class="empty">🎉 Nothing needs attention right now.</div>'}<h3>🏆 Best Buys</h3>${best.length?best.map(x=>`<div class="list-item"><div><b>${esc(x.name)}</b><div class="muted">${x.p}% of market · ${deal(x.p)}</div></div><b>${money(x.profit)}</b></div>`).join(''):'<div class="empty">Add stock to see your best buys.</div>'}<h3>💸 What Should I Sell First?</h3>${sellFirst.length?sellFirst.map((x,i)=>`<div class="list-item"><div><b>${i+1}. ${esc(x.name)}</b><div class="muted">${x.age===null?'Age not recorded':x.age+' days old'} · ${x.p===null?'No market %':x.p+'% of market'}</div></div><b>${money(x.profit)} profit</b></div>`).join(''):'<div class="empty">Add priced stock to get a sell-first ranking.</div>'}`;
}

window.BeauSmartBuy={evaluate:calculate,render,version:'2.0.0',buyRange:{min:10,max:40}};
window.BeauStockIntelligence={render:intelligence,version:'1.3.0'};
window.addEventListener('DOMContentLoaded',()=>{
  ensureInputs();
  const b=document.getElementById('smartBuyBtn');if(b)b.addEventListener('click',render);
  ['resale','askingPrice','condition'].forEach(id=>document.getElementById(id)?.addEventListener('input',render));
  ['resale','askingPrice','condition'].forEach(id=>document.getElementById(id)?.addEventListener('change',render));
  intelligence();
  document.querySelectorAll('.bottom button').forEach(b=>b.addEventListener('click',()=>setTimeout(intelligence,0)));
  window.addEventListener('storage',intelligence);
});
})();
