/* Wires Smart Reseller Pricing into the existing app without replacing index.html. */
(function(){
  "use strict";
  if (!window.fetch || !window.ResellerSmartPricing) return;
  var originalFetch = window.fetch;
  window.fetch = function(){
    return originalFetch.apply(this, arguments).then(function(response){
      try {
        var url = String((arguments[0] && arguments[0].url) || arguments[0] || "");
        if (!/\/price\?barcode=/i.test(url)) return response;
        response.clone().json().then(function(data){
          var products = (data && data.data && data.data.products) || data.products || [];
          var prices = [];
          products.forEach(function(p){
            if (p && Number(p.price) > 0) prices.push(Number(p.price));
            (p && p.offers || []).forEach(function(o){ if (Number(o.price) > 0) prices.push(Number(o.price)); });
          });
          if (!prices.length) return;
          var costEl = document.getElementById("cost");
          var resultEl = document.getElementById("barcodeResult");
          if (!resultEl) return;
          var analysis = window.ResellerSmartPricing.analyse(prices, costEl ? costEl.value : 0);
          if (!analysis) return;
          var old = document.getElementById("smartPricingResult");
          if (old) old.remove();
          var box = document.createElement("div");
          box.id = "smartPricingResult";
          resultEl.appendChild(box);
          window.ResellerSmartPricing.render(box, analysis);
          var action = document.createElement("div");
          action.className = "actions";
          var add = document.createElement("button");
          add.className = "success";
          add.textContent = "➕ Use Smart Price in Inventory";
          add.addEventListener("click", function(){
            var barcodeMatch = url.match(/[?&]barcode=([^&]+)/i);
            var barcode = barcodeMatch ? decodeURIComponent(barcodeMatch[1]) : "";
            var title = products[0] && products[0].title ? products[0].title : "Scanned Product";
            if (typeof window.useBarcodeForNewItem === "function") window.useBarcodeForNewItem(barcode);
            var name = document.getElementById("name");
            var market = document.getElementById("marketPrice");
            var selling = document.getElementById("selling");
            if (name && (!name.value || name.value === "Scanned Product")) name.value = title;
            if (market) market.value = analysis.average.toFixed(2);
            if (selling) selling.value = analysis.resale.toFixed(2);
            if (typeof window.calculatePricing === "function") window.calculatePricing();
          });
          action.appendChild(add);
          box.appendChild(action);
        }).catch(function(){});
      } catch(e) {}
      return response;
    });
  };
})();
