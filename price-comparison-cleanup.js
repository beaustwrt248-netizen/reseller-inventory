/* Price comparison cleanup — remove Cash Converters */
(function(){
  'use strict';
  function apply(){
    const input=document.getElementById('priceCashConverters');
    if(input){
      const field=input.closest('div');
      if(field) field.remove(); else input.remove();
      input.value='0';
    }
    // Make sure any legacy Cash Converters values cannot enter calculations.
    const calc=document.getElementById('calculateMarketButton');
    if(calc && !calc.dataset.cashConvertersRemoved){
      calc.dataset.cashConvertersRemoved='1';
      calc.addEventListener('click',function(){
        const legacy=document.getElementById('priceCashConverters');
        if(legacy) legacy.value='0';
      },true);
    }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',apply); else apply();
  window.addEventListener('beau:update-ready',apply);
  setTimeout(apply,300);
})();
