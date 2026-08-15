/* Direct second-hand pricing hook. Runs after every successful barcode lookup so the panel is rendered by the lookup flow itself, not by a DOM observer. */
(function(){
  'use strict';
  const norm=v=>String(v||'').replace(/\D/g,'');
  let lastBarcode='';
  const install=()=>{
    if(typeof window.lookupProduct!=='function' || typeof window.searchSecondHandPricing!=='function')return false;
    const originalLookup=window.lookupProduct;
    const originalSecondHand=window.searchSecondHandPricing;
    if(originalLookup.__secondHandHook)return true;
    const guardedSecondHand=async barcode=>{
      const b=norm(barcode);
      if(!b)return;
      if(lastBarcode===b && document.getElementById('secondHandPricingPanel'))return;
      lastBarcode=b;
      return originalSecondHand(b);
    };
    window.searchSecondHandPricing=guardedSecondHand;
    const wrapped=async function(code){
      const b=norm(code);
      const result=await originalLookup.apply(this,arguments);
      if(b && typeof window.searchSecondHandPricing==='function'){
        try{await window.searchSecondHandPricing(b)}catch(_){}
      }
      return result;
    };
    wrapped.__secondHandHook=true;
    window.lookupProduct=wrapped;
    return true;
  };
  if(!install())document.addEventListener('DOMContentLoaded',()=>install(),{once:true});
})();
