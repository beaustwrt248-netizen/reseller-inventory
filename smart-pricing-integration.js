/* Beau's Game Inventory - Smart Pricing Bridge */
(function () {
  "use strict";

  var WORKER = "https://beau-reseller-pricing.beaustwrt248.workers.dev";

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function money(value) {
    var n = Number(value || 0);
    return "$" + n.toFixed(2);
  }

  function number(value) {
    var n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }

  function setValue(id, value) {
    var el = document.getElementById(id);
    if (el && value !== null && value !== undefined) {
      el.value = value;
    }
  }

  function renderResult(data, barcode) {
    var result = document.getElementById("barcodeResult");
    if (!result) return;

    var product = data && data.product ? data.product : {};
    var pricing = data && data.pricing ? data.pricing : {};
    var title = product.title || "Product found";
    var platform = product.platform || "Other";
    var retail = number(pricing.retailPrice);
    var resale = number(pricing.suggestedResale);
    var buy = number(pricing.maximumBuy);
    var profit = resale - buy;

    if (!retail && !resale && !buy) {
      result.innerHTML =
        '<div class="warning">Product found, but no usable Australian price was returned. You can still add it manually.</div>';
      return;
    }

    result.innerHTML =
      '<div class="item">' +
        (product.image ? '<img class="product-image" src="' + esc(product.image) + '" alt="">' : '') +
        '<div class="item-name">' + esc(title) + '</div>' +
        '<span class="badge">' + esc(platform) + '</span>' +
        '<span class="badge">Game</span>' +
        '<p>Barcode: <strong>' + esc(barcode) + '</strong></p>' +
        '<div class="price-box">' +
          '<h3>💰 Smart Reseller Pricing</h3>' +
          '<div class="price-row"><span>Australian Retail</span><strong>' + money(retail) + '</strong></div>' +
          '<div class="price-row"><span>Suggested Second-Hand</span><strong>' + money(resale) + '</strong></div>' +
          '<div class="price-row"><span>Maximum Recommended Buy</span><strong>' + money(buy) + '</strong></div>' +
          '<div class="price-row"><span>Potential Profit at Buy Price</span><strong class="good">' + money(profit) + '</strong></div>' +
          '<div class="price-row"><span>Pricing Status</span><strong>' + esc(pricing.status || "Price found") + '</strong></div>' +
        '</div>' +
        '<div class="actions">' +
          '<button class="success" id="usePricingButton">➕ Use This Product</button>' +
        '</div>' +
      '</div>';

    var use = document.getElementById("usePricingButton");
    if (use) {
      use.addEventListener("click", function () {
        setValue("name", title);
        setValue("barcode", barcode);
        setValue("category", "Game");
        setValue("platform", platform);
        setValue("rrp", retail || "");
        setValue("marketPrice", resale || retail || "");
        setValue("selling", resale || retail || "");

        var cost = document.getElementById("cost");
        if (cost && !cost.value && buy) {
          cost.value = buy.toFixed(2);
        }

        if (typeof window.calculatePricing === "function") {
          window.calculatePricing();
        }

        var form = document.getElementById("name");
        if (form) {
          form.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    }
  }

  if (!window.fetch) return;

  var originalFetch = window.fetch.bind(window);

  window.fetch = function (input, init) {
    var originalUrl = "";

    try {
      originalUrl = String((input && input.url) || input || "");
    } catch (e) {
      originalUrl = "";
    }

    var lookupMatch = originalUrl.match(/\/lookup\?barcode=([^&]+)/i);
    var priceMatch = originalUrl.match(/\/price\?barcode=([^&]+)/i);

    if (!lookupMatch && !priceMatch) {
      return originalFetch(input, init);
    }

    var barcode = decodeURIComponent((lookupMatch || priceMatch)[1]);
    var url = WORKER + "/price?barcode=" + encodeURIComponent(barcode);

    return originalFetch(url, init).then(function (response) {
      return response.clone().json().then(function (data) {
        if (data && data.success) {
          renderResult(data, barcode);
        }

        /* Keep the old lookupBarcode() function compatible with the new Worker. */
        var product = data && data.product ? data.product : null;
        var pricing = data && data.pricing ? data.pricing : {};
        var compatible = {
          data: {
            products: product ? [{
              title: product.title || "Product found",
              price: pricing.retailPrice || null,
              image: product.image || null,
              platform: product.platform || "Other"
            }] : []
          },
          product: product,
          pricing: pricing
        };

        return new Response(JSON.stringify(compatible), {
          status: response.status,
          headers: { "Content-Type": "application/json" }
        });
      });
    }).catch(function (error) {
      throw error;
    });
  };

  /* Keep the smart pricing module available to other app screens. */
  window.ResellerSmartPricing = window.ResellerSmartPricing || {
    analyse: function (prices, cost) {
      prices = (prices || []).map(Number).filter(function (v) {
        return v > 0 && Number.isFinite(v);
      });
      if (!prices.length) return null;

      var avg = prices.reduce(function (a, b) { return a + b; }, 0) / prices.length;
      var resale = Math.round(avg * 0.75 * 100) / 100;
      var maxBuy = Math.round(resale * 0.70 * 100) / 100;
      var actualCost = number(cost);
      var profit = Math.round((resale - actualCost) * 100) / 100;

      return {
        lowest: Math.min.apply(Math, prices),
        highest: Math.max.apply(Math, prices),
        average: avg,
        resale: resale,
        maxBuy: maxBuy,
        profit: profit,
        margin: resale ? (profit / resale) * 100 : 0
      };
    }
  };
})();
