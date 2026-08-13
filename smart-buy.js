/* Beau's Reseller Hub — Smart Buy v1.0 */
(function(){'use strict';
function whole(v){return Math.round(Number(v)||0)}
function evaluate(resale,asking){const r=Number(resale)||0,a=Number(asking);const b21=whole(r*.21),b25=whole(r*.25),b30=whole(r*.30);if(!Number.isFinite(a)||a<0)return{status:'ENTER PRICE',className:'neutral',message:'Enter the seller’s asking price.',b21,b25,b30};if(a<=b25)return{status:'BUY',className:'buy',message:'Strong buy — at or below your recommended 25% target.',b21,b25,b30};if(a<=b30)return{status:'NEGOTIATE',className:'negotiate',message:'Potential buy — negotiate toward your 25% target.',b21,b25,b30};return{status:'PASS',className:'pass',message:'Above your 30% maximum — pass unless there is a special reason.',b21,b25,b30}}
window.BeauSmartBuy={evaluate,version:'1.0.0'};
})();
