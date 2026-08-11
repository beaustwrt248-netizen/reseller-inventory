/* Beau's Game Inventory — Smart Buy Calculator */
(function(){
  window.smartBuy=function(market,fees,shipping,targetMargin){
    market=Number(market)||0;fees=Number(fees)||0;shipping=Number(shipping)||0;targetMargin=Number(targetMargin)||30;
    const resale=market>0?market:0;
    const fixed=fees+shipping;
    const maxBuy=Math.max(0,resale-fixed-(resale*targetMargin/100));
    const profit=resale-fixed-maxBuy;
    let rating='🔴 Don\'t Buy',cls='bad';
    if(maxBuy>0 && market>0){rating=profit/resale>=.30?'🟢 Good Buy':'🟠 Consider';cls=profit/resale>=.30?'good':'warning';}
    return {resale,maxBuy,profit,margin:resale?profit/resale*100:0,rating,cls};
  };
})();
