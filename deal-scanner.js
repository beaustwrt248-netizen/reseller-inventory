/* Deal Scanner 2.0 — automatic barcode deal intelligence */
(function(){'use strict';
const money=v=>'$'+Math.round(Number(v)||0);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
function analyse(resale,asking){resale=Number(resale)||0;asking=Number(asking)||0;const pct=resale?asking/resale*100:0,profit=resale-asking;let status='NO PRICE',cls='';if(!resale)status='NO RESALE PRICE';else if(!asking)status='ENTER ASKING PRICE';else if(pct<=25){status='BUY',cls='success'}else if(pct<=40)status='CAUTION';else{status='PASS',cls='danger'}return{resale,asking,pct,profit,status,cls,buy10:resale*.10,buy20:resale*.20,buy25:resale*.25,buy30:resale*.30,buy40:resale*.40}}
function attach(){
  if(typeof window.lookupProduct!=='function'||window.lookupProduct.__dealBridge)return;
  const original=window.lookupProduct;
  async function wrapped(code){
    const result=await original(code);
    setTimeout(()=>{
      const host=document.getElementById('scanResult');
      if(!host||host.querySelector('#dealAnalysis'))return;
      const match=(host.textContent||'').match(/Expected resale\s*\$([\d,]+)/i);
      if(match)window.showDealAnalysis(Number(match[1].replace(/,/g,'')));
    },0);
    return result;
  }
  wrapped.__dealBridge=true;
  window.lookupProduct=wrapped;
}
window.showDealAnalysis=function(resale){const existing=document.getElementById('dealAnalysis');if(existing)existing.remove();const host=document.getElementById('scanResult');if(!host)return;const box=document.createElement('div');box.id='dealAnalysis';box.className='result';box.innerHTML='<h3>🧠 Deal Decision</h3><div class="row"><label>Actual asking price<input id="dealAsking" class="input" type="number" min="0" step="1" placeholder="Enter price"></label></div><div id="dealDecision" class="muted">Enter the seller\'s asking price.</div>';host.appendChild(box);document.getElementById('dealAsking').addEventListener('input',function(){const x=analyse(resale,this.value);document.getElementById('dealDecision').innerHTML=`<div class="buygrid"><div class="buy"><span>10% MAX BUY</span><strong>${money(x.buy10)}</strong></div><div class="buy"><span>20% MAX BUY</span><strong>${money(x.buy20)}</strong></div><div class="buy recommended"><span>25% TARGET</span><strong>${money(x.buy25)}</strong></div><div class="buy"><span>30% TARGET</span><strong>${money(x.buy30)}</strong></div><div class="buy"><span>40% MAXIMUM</span><strong>${money(x.buy40)}</strong></div></div><div class="list-item"><span>Asking price</span><b>${money(x.asking)}</b></div><div class="list-item"><span>Buy percentage</span><b>${x.pct.toFixed(0)}%</b></div><div class="list-item"><span>Potential gross profit</span><b>${money(x.profit)}</b></div><div class="toolbar"><button class="btn ${x.cls}" disabled>${esc(x.status)}</button></div>`})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',attach);else attach();
setTimeout(attach,250);
})();
