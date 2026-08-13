/* Deal Scanner bridge — connects the existing barcode lookup to Deal Scanner 2.0 without replacing app.js */
(function(){'use strict';
function attach(){
  if(typeof window.lookupProduct!=='function'||typeof window.showDealAnalysis!=='function'||window.lookupProduct.__dealBridge)return;
  const original=window.lookupProduct;
  async function wrapped(code){
    const result=await original(code);
    setTimeout(()=>{
      const host=document.getElementById('scanResult');
      if(!host||host.querySelector('#dealAnalysis'))return;
      const text=host.textContent||'';
      const match=text.match(/Expected resale\s*\$([\d,]+)/i);
      if(match)window.showDealAnalysis(Number(match[1].replace(/,/g,'')));
    },0);
    return result;
  }
  wrapped.__dealBridge=true;
  window.lookupProduct=wrapped;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',attach);else attach();
setTimeout(attach,250);
})();
