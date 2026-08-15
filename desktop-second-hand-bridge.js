/* Desktop-safe second-hand bridge. Uses the resolved game lookup and appends the same panel used on mobile. */
(function(){'use strict';
  const norm=v=>String(v||'').replace(/\D/g,'');
  let last='';
  async function run(){
    const host=document.getElementById('scanResult');
    if(!host||document.getElementById('secondHandPricingPanel'))return;
    const text=host.textContent||'';
    const m=text.match(/Barcode\s+(\d{8,14})/i)||text.match(/\b(\d{8,14})\b/);
    const b=m?.[1]||'';
    if(!b||b===last||typeof window.searchSecondHandPricing!=='function')return;
    last=b;
    try{await window.searchSecondHandPricing(b)}catch(e){console.debug('second-hand bridge',e)}
  }
  const start=()=>{
    run();
    const host=document.getElementById('scanResult');
    if(host)new MutationObserver(()=>setTimeout(run,80)).observe(host,{subtree:true,childList:true,characterData:true});
    let tries=0;const timer=setInterval(()=>{run();if(++tries>30)clearInterval(timer)},300);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
