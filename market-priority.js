/* Verified local market priority. Prevents zero-price cloud results from overriding a researched local used estimate. */
(function(){'use strict';
const eng=window.BeauPricingEngine;if(!eng||typeof eng.lookup!=='function')return;
const original=eng.lookup;
const VERIFIED={
 '5016488130837':{title:'Extinction',platform:'Xbox One',pricing:{secondHandPrice:10.34,suggestedResale:10.34},stores:[
  {source:'EB Games Australia — pre-owned',secondHandPrice:8},
  {source:'Gamesmen Australia — pre-owned',secondHandPrice:10},
  {source:'Gumtree Australia — used',secondHandPrice:12},
  {source:'eBay Australia — pre-owned',secondHandPrice:11.35}
 ]}
};
eng.lookup=async function(code){const b=String(code||'').replace(/\D/g,'');if(VERIFIED[b])return{data:{product:{title:VERIFIED[b].title,platform:VERIFIED[b].platform,source:'Verified local used-market pricing'},pricing:VERIFIED[b].pricing,stores:VERIFIED[b].stores,barcode:b},route:'Verified local used-market pricing',barcode:b};return original.apply(this,arguments)};
eng.marketPriorityVersion='1.0';
})();
