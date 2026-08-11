/* Smart Reseller Pricing module
   Safe additive module: does not replace index.html.
   It adds a reusable pricing engine and can enhance the existing pricing result area.
*/
(function(){
  "use strict";

  window.ResellerSmartPricing = {
    analyse: function(prices, cost) {
      prices = (prices || []).map(Number).filter(function(v){ return v > 0 && isFinite(v); });
      cost = Number(cost || 0);
      if (!prices.length) return null;

      var low = Math.min.apply(Math, prices);
      var high = Math.max.apply(Math, prices);
      var avg = prices.reduce(function(a,b){ return a+b; }, 0) / prices.length;
      var resale = Math.round(avg * 0.90 * 100) / 100;
      var maxBuy = Math.round(resale * 0.70 * 100) / 100;
      var profit = Math.round((resale - cost) * 100) / 100;
      var margin = resale > 0 ? Math.round((profit / resale) * 1000) / 10 : 0;

      var deal = "Avoid";
      if (cost > 0) {
        var ratio = cost / resale;
        if (ratio <= 0.55) deal = "Great Deal";
        else if (ratio <= 0.65) deal = "Good Deal";
        else if (ratio <= 0.75) deal = "Fair Deal";
      }

      return { lowest: low, highest: high, average: avg, resale: resale,
               maxBuy: maxBuy, profit: profit, margin: margin, deal: deal };
    },

    render: function(container, result) {
      if (!container || !result) return;
      container.innerHTML =
        '<div class="price-box" style="margin-top:15px">' +
        '<h3>🧠 Smart Reseller Pricing</h3>' +
        '<div class="price-row"><span>Deal Rating</span><strong>' + result.deal + '</strong></div>' +
        '<div class="price-row"><span>Lowest Market</span><strong>$' + result.lowest.toFixed(2) + '</strong></div>' +
        '<div class="price-row"><span>Average Market</span><strong>$' + result.average.toFixed(2) + '</strong></div>' +
        '<div class="price-row"><span>Highest Market</span><strong>$' + result.highest.toFixed(2) + '</strong></div>' +
        '<div class="price-row"><span>Maximum Buy</span><strong>$' + result.maxBuy.toFixed(2) + '</strong></div>' +
        '<div class="price-row"><span>Suggested Resale</span><strong>$' + result.resale.toFixed(2) + '</strong></div>' +
        '<div class="price-row"><span>Estimated Profit</span><strong>$' + result.profit.toFixed(2) + '</strong></div>' +
        '<div class="price-row"><span>Profit Margin</span><strong>' + result.margin.toFixed(1) + '%</strong></div>' +
        '</div>';
    }
  };
})();
