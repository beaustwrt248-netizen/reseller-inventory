/* Used-market fallback bridge. Keeps barcode identification intact and supplies a researched AUD used estimate when the pricing service returns a title but no price. */
(function(){'use strict';
const eng=window.BeauPricingEngine;if(!eng||typeof eng.normalise!=='function')return;
const FALLBACKS={
 '5016488130837':{title:'Extinction',platform:'Xbox One',prices:[8,10,12,11.35],average:10.34,sources:['EB Games Australia — pre-owned $8','Gamesmen Australia — pre-owned $10','Gumtree Australia — used $12','eBay Australia — pre-owned $11.35']}
};
const original=eng.normalise;
eng.normalise=function(data,barcode){const n=original(data,barcode),b=String(barcode||n.barcode||'').replace(/\D/g,'');const f=FALLBACKS[b];if(!f||Number(n.resale)>0)return n;const resale=f.average,guide=typeof eng.buyGuide==='function'?eng.buyGuide(resale,'Used - Good'):{recommended:Math.round(resale*.25)};return Object.assign({},n,{title:n.title&&n.title!=='Unknown game'?n.title:f.title,platform:n.platform||f.platform,second:resale,resale,buy:guide.recommended,buyGuide:guide,secondEstimated:true,confidence:'Medium',sampleCount:f.prices.length,sourceNames:f.sources});};
window.BeauMarketFallbacks=FALLBACKS;
})();
