/* Stock & Games + Sales & Profit Tracking
   Version 2.0
*/
(function () {
  'use strict';

  let filter = 'all';

  const SALES_KEY = 'beauSalesHistory';

  const money = value =>
    '$' + Math.round(Number(value) || 0);

  const esc = value =>
    String(value ?? '').replace(/[&<>"']/g, c => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[c]));

  function getInventory() {
    try {
      const data = JSON.parse(
        localStorage.getItem('resellerInventory') || '[]'
      );
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  function getLibrary() {
    try {
      const data = JSON.parse(
        localStorage.getItem('beauGameLibrary') || '[]'
      );
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  function getSales() {
    try {
      const data = JSON.parse(
        localStorage.getItem(SALES_KEY) || '[]'
      );
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  function saveInventory(data) {
    localStorage.setItem(
      'resellerInventory',
      JSON.stringify(data)
    );
  }

  function saveSales(data) {
    localStorage.setItem(
      SALES_KEY,
      JSON.stringify(data)
    );
  }

  function getUnifiedGames() {
    const inventory = getInventory();
    const library = getLibrary();

    const owned = new Set(
      inventory
        .map(x => String(x.barcode || ''))
        .filter(Boolean)
    );

    const saved = library
      .filter(x =>
        !owned.has(String(x.barcode || ''))
      )
      .map(x => ({
        id: 'lib:' + String(x.barcode || x.title),
        name: x.title || 'Unnamed Game',
        barcode: x.barcode || '',
        platform: x.platform || 'Other',
        condition: 'Saved Game',
        qty: 0,
        cost: 0,
        market: Number(x.resale) || 0,
        sell: Number(x.resale) || 0,
        saved: true,
        library: x
      }));

    return inventory
      .map(x => ({
        ...x,
        saved: false
      }))
      .concat(saved);
  }

  function calculateProfit(cost, salePrice, fees, postage, other) {
    const purchaseCost = Number(cost) || 0;
    const revenue = Number(salePrice) || 0;
    const sellingFees = Number(fees) || 0;
    const shipping = Number(postage) || 0;
    const extra = Number(other) || 0;

    const totalCosts =
      purchaseCost +
      sellingFees +
      shipping +
      extra;

    return {
      revenue,
      purchaseCost,
      fees: sellingFees,
      postage: shipping,
      other: extra,
      totalCosts,
      grossProfit: revenue - purchaseCost,
      netProfit: revenue - totalCosts
    };
  }

  function render() {
    const box = document.getElementById('invList');
    const search = document.getElementById('invSearch');

    if (!box) return;

    const query =
      String(search?.value || '')
        .toLowerCase()
        .trim();

    const rows = getUnifiedGames()
      .filter(item => {
        if (filter === 'owned' && item.saved) return false;
        if (filter === 'saved' && !item.saved) return false;

        return `${item.name} ${item.barcode} ${item.platform}`
          .toLowerCase()
          .includes(query);
      });

    if (!rows.length) {
      box.innerHTML =
        '<div class="empty">No games match your search.</div>';

      updateFilters();
      return;
    }

    box.innerHTML = rows.map(item => {
      const cost = Number(item.cost) || 0;
      const market = Number(item.market) || 0;
      const sell = Number(item.sell) || 0;

      const percentage =
        market > 0 && cost > 0
          ? Math.round(cost / market * 100)
          : null;

      let deal = 'NO MARKET PRICE';

      if (percentage !== null) {
        if (percentage <= 25) deal = 'GREAT DEAL';
        else if (percentage <= 30) deal = 'GOOD DEAL';
        else if (percentage <= 40) deal = 'CAUTION';
        else deal = 'OVER 40%';
      }

      if (item.saved) {
        return `
          <div class="list-item">
            <div>
              <b>${esc(item.name)}</b>

              <div>
                <span class="pill">
                  ${esc(item.platform)}
                </span>

                <span class="pill">
                  SAVED
                </span>
              </div>

              <div class="muted">
                Barcode ${esc(item.barcode || '—')}
                · Resale ${money(market)}
              </div>

              <div class="muted">
                Saved from Game Library
              </div>
            </div>

            <div class="toolbar">
              <button
                class="btn success"
                onclick='stockSavedGame(${JSON.stringify(item.library)})'>
                ＋ Add to Stock
              </button>
            </div>
          </div>
        `;
      }

      return `
        <div class="list-item">
          <div>
            <b>${esc(item.name)}</b>

            <div>
              <span class="pill">
                ${esc(item.platform || 'Other')}
              </span>

              <span class="pill">
                IN STOCK
              </span>

              <span class="pill">
                Qty ${Number(item.qty) || 1}
              </span>
            </div>

            <div class="muted">
              Barcode ${esc(item.barcode || '—')}
            </div>

            <div class="muted">
              Cost ${money(cost)}
              · Sell ${money(sell)}
            </div>

            <div class="muted">
              ${deal}
            </div>
          </div>

          <div class="toolbar">
            <button
              class="btn success"
              onclick="recordStockSale('${esc(item.id)}')">
              💵 Sell
            </button>

            <button
              class="btn"
              onclick="editInventory('${esc(item.id)}')">
              Edit
            </button>

            <button
              class="btn danger"
              onclick="deleteInventory('${esc(item.id)}')">
              Delete
            </button>
          </div>
        </div>
      `;
    }).join('');

    updateFilters();
  }

  function updateFilters() {
    document
      .getElementById('stockFilterAll')
      ?.classList.toggle(
        'primary',
        filter === 'all'
      );

    document
      .getElementById('stockFilterOwned')
      ?.classList.toggle(
        'primary',
        filter === 'owned'
      );

    document
      .getElementById('stockFilterSaved')
      ?.classList.toggle(
        'primary',
        filter === 'saved'
      );
  }

  window.stockSavedGame = function (game) {
    if (!game) return;

    if (typeof openInventoryEdit === 'function') {
      openInventoryEdit({
        name: game.title || '',
        barcode: game.barcode || '',
        platform: game.platform || 'Other',
        condition: 'Used - Good',
        qty: 1,
        cost: '',
        market: Math.round(
          Number(game.resale) || 0
        ),
        sell: Math.round(
          Number(game.resale) || 0
        )
      });

      if (typeof toast === 'function') {
        toast(
          'Enter your purchase price before saving'
        );
      }
    }
  };

  window.recordStockSale = function (id) {
    const inventory = getInventory();

    const item = inventory.find(
      x => String(x.id) === String(id)
    );

    if (!item) {
      if (typeof toast === 'function') {
        toast('Stock item not found');
      }
      return;
    }

    const available =
      Math.max(1, Number(item.qty) || 1);

    const quantityInput = prompt(
      `How many units are you selling?\n\nAvailable: ${available}`,
      '1'
    );

    if (quantityInput === null) return;

    const quantity =
      Math.floor(Number(quantityInput));

    if (
      !Number.isFinite(quantity) ||
      quantity < 1 ||
      quantity > available
    ) {
      alert(
        'Please enter a valid quantity.'
      );
      return;
    }

    const suggestedPrice =
      Math.round(
        Number(item.sell || item.market) || 0
      );

    const salePriceInput = prompt(
      'Actual sale price PER UNIT ($):',
      String(suggestedPrice)
    );

    if (salePriceInput === null) return;

    const salePrice =
      Number(salePriceInput);

    if (
      !Number.isFinite(salePrice) ||
      salePrice < 0
    ) {
      alert(
        'Please enter a valid sale price.'
      );
      return;
    }

    const feesInput = prompt(
      'Selling/payment/platform fees PER UNIT ($):',
      '0'
    );

    if (feesInput === null) return;

    const fees =
      Number(feesInput);

    if (
      !Number.isFinite(fees) ||
      fees < 0
    ) {
      alert(
        'Please enter a valid fee amount.'
      );
      return;
    }

    const postageInput = prompt(
      'Postage/shipping PER UNIT ($):',
      '0'
    );

    if (postageInput === null) return;

    const postage =
      Number(postageInput);

    if (
      !Number.isFinite(postage) ||
      postage < 0
    ) {
      alert(
        'Please enter a valid postage amount.'
      );
      return;
    }

    const otherInput = prompt(
      'Other selling costs PER UNIT ($):',
      '0'
    );

    if (otherInput === null) return;

    const other =
      Number(otherInput);

    if (
      !Number.isFinite(other) ||
      other < 0
    ) {
      alert(
        'Please enter a valid cost amount.'
      );
      return;
    }

    const unitCost =
      Number(item.cost) || 0;

    const result =
      calculateProfit(
        unitCost,
        salePrice,
        fees,
        postage,
        other
      );

    const totalRevenue =
      result.revenue * quantity;

    const totalPurchaseCost =
      result.purchaseCost * quantity;

    const totalFees =
      result.fees * quantity;

    const totalPostage =
      result.postage * quantity;

    const totalOther =
      result.other * quantity;

    const totalGrossProfit =
      result.grossProfit * quantity;

    const totalNetProfit =
      result.netProfit * quantity;

    const sale = {
      id: String(Date.now()),

      stockId: String(item.id),

      name:
        item.name ||
        'Unnamed Game',

      barcode:
        item.barcode || '',

      platform:
        item.platform || '',

      quantity,

      salePricePerUnit:
        salePrice,

      costPerUnit:
        unitCost,

      feesPerUnit:
        fees,

      postagePerUnit:
        postage,

      otherPerUnit:
        other,

      revenue:
        totalRevenue,

      purchaseCost:
        totalPurchaseCost,

      fees:
        totalFees,

      postage:
        totalPostage,

      other:
        totalOther,

      grossProfit:
        totalGrossProfit,

      profit:
        totalNetProfit,

      netProfit:
        totalNetProfit,

      date:
        new Date().toISOString()
    };

    const sales = getSales();

    sales.push(sale);

    saveSales(sales);

    const remaining =
      available - quantity;

    if (remaining <= 0) {
      saveInventory(
        inventory.filter(
          x =>
            String(x.id) !==
            String(item.id)
        )
      );
    } else {
      saveInventory(
        inventory.map(x =>
          String(x.id) ===
          String(item.id)
            ? {
                ...x,
                qty: remaining
              }
            : x
        )
      );
    }

    if (typeof loadData === 'function') {
      loadData();
    }

    if (typeof renderAll === 'function') {
      renderAll();
    }

    render();
    renderSalesDashboard();

    if (typeof toast === 'function') {
      toast(
        `Sale recorded — NET PROFIT ${money(totalNetProfit)}`
      );
    }

    showSaleConfirmation(sale);
  };

  function showSaleConfirmation(sale) {
    const existing =
      document.getElementById(
        'saleConfirmation'
      );

    if (existing) {
      existing.remove();
    }

    const box =
      document.createElement('div');

    box.id =
      'saleConfirmation';

    box.className =
      'card';

    box.innerHTML = `
      <h2>✅ Sale Recorded</h2>

      <div class="list-item">
        <span>Item</span>
        <b>${esc(sale.name)}</b>
      </div>

      <div class="list-item">
        <span>Revenue</span>
        <b>${money(sale.revenue)}</b>
      </div>

      <div class="list-item">
        <span>Purchase cost</span>
        <b>${money(sale.purchaseCost)}</b>
      </div>

      <div class="list-item">
        <span>Fees</span>
        <b>${money(sale.fees)}</b>
      </div>

      <div class="list-item">
        <span>Postage</span>
        <b>${money(sale.postage)}</b>
      </div>

      <div class="list-item">
        <span>Other costs</span>
        <b>${money(sale.other)}</b>
      </div>

      <div class="list-item">
        <span>Gross profit</span>
        <b>${money(sale.grossProfit)}</b>
      </div>

      <div class="list-item">
        <span>NET PROFIT</span>
        <b>${money(sale.netProfit)}</b>
      </div>

      <div class="toolbar">
        <button
          class="btn primary"
          onclick="document.getElementById('saleConfirmation')?.remove()">
          Done
        </button>
      </div>
    `;

    const dashboard =
      document.getElementById(
        'dashboard'
      );

    if (dashboard) {
      dashboard.prepend(box);
    }
  }

  function renderSalesDashboard() {
    const dashboard =
      document.getElementById(
        'dashboard'
      );

    if (!dashboard) return;

    let box =
      document.getElementById(
        'salesTrackerBox'
      );

    if (!box) {
      box =
        document.createElement('div');

      box.id =
        'salesTrackerBox';

      box.className =
        'card';

      dashboard.appendChild(box);
    }

    const sales =
      getSales();

    const units =
      sales.reduce(
        (sum, sale) =>
          sum +
          (Number(sale.quantity) || 0),
        0
      );

    const revenue =
      sales.reduce(
        (sum, sale) =>
          sum +
          (Number(sale.revenue) || 0),
        0
      );

    const purchaseCost =
      sales.reduce(
        (sum, sale) =>
          sum +
          (Number(sale.purchaseCost ?? sale.cost) || 0),
        0
      );

    const fees =
      sales.reduce(
        (sum, sale) =>
          sum +
          (Number(sale.fees) || 0),
        0
      );

    const postage =
      sales.reduce(
        (sum, sale) =>
          sum +
          (Number(sale.postage) || 0),
        0
      );

    const other =
      sales.reduce(
        (sum, sale) =>
          sum +
          (Number(sale.other) || 0),
        0
      );

    const grossProfit =
      sales.reduce(
        (sum, sale) =>
          sum +
          (Number(
            sale.grossProfit
          ) || 0),
        0
      );

    const netProfit =
      sales.reduce(
        (sum, sale) =>
          sum +
          (Number(
            sale.netProfit ??
            sale.profit
          ) || 0),
        0
      );

    const averageProfit =
      units
        ? netProfit / units
        : 0;

    box.innerHTML = `
      <h2>💵 Sales & Profit</h2>

      <div class="muted">
        Your completed sales and actual profit.
      </div>

      <div class="stats">

        <div class="stat">
          <span>UNITS SOLD</span>
          <strong>${units}</strong>
        </div>

        <div class="stat">
          <span>REVENUE</span>
          <strong>${money(revenue)}</strong>
        </div>

        <div class="stat">
          <span>GROSS PROFIT</span>
          <strong>${money(grossProfit)}</strong>
        </div>

        <div class="stat">
          <span>NET PROFIT</span>
          <strong>${money(netProfit)}</strong>
        </div>

      </div>

      <div class="result">

        <div class="list-item">
          <span>Purchase costs</span>
          <b>${money(purchaseCost)}</b>
        </div>

        <div class="list-item">
          <span>Fees</span>
          <b>${money(fees)}</b>
        </div>

        <div class="list-item">
          <span>Postage</span>
          <b>${money(postage)}</b>
        </div>

        <div class="list-item">
          <span>Other costs</span>
          <b>${money(other)}</b>
        </div>

        <div class="list-item">
          <span>Average net profit / unit</span>
          <b>${money(averageProfit)}</b>
        </div>

      </div>

      <h3>Recent Sales</h3>

      ${
        sales.length
          ? sales
              .slice()
              .reverse()
              .slice(0, 10)
              .map(sale => `
                <div class="list-item">

                  <div>
                    <b>
                      ${esc(
                        sale.name ||
                        'Unnamed Game'
                      )}
                    </b>

                    <div class="muted">
                      ${Number(
                        sale.quantity || 1
                      )}
                      unit${Number(
                        sale.quantity || 1
                      ) === 1 ? '' : 's'}

                      ·

                      ${
                        sale.date
                          ? new Date(
                              sale.date
                            ).toLocaleDateString(
                              'en-AU'
                            )
                          : ''
                      }
                    </div>
                  </div>

                  <div>
                    <b>
                      ${money(
                        sale.revenue
                      )}
                    </b>

                    <div class="muted">
                      Net profit
                      ${money(
                        sale.netProfit ??
                        sale.profit
                      )}
                    </div>
                  </div>

                </div>
              `)
              .join('')
          : `
            <div class="empty">
              No completed sales yet.
              Use 💵 Sell from Stock & Games.
            </div>
          `
      }

      ${
        sales.length
          ? `
            <div class="toolbar">
              <button
                class="btn"
                onclick="showSalesHistory()">
                📊 View All Sales
              </button>
            </div>
          `
          : ''
      }
    `;
  }

  window.showSalesHistory =
    function () {
      const sales =
        getSales();

      if (!sales.length) {
        alert(
          'No completed sales yet.'
        );
        return;
      }

      const lines =
        sales
          .slice()
          .reverse()
          .map(sale => {
            const date =
              sale.date
                ? new Date(
                    sale.date
                  ).toLocaleDateString(
                    'en-AU'
                  )
                : '';

            return [
              `${date} — ${sale.name}`,
              `Revenue: ${money(
                sale.revenue
              )}`,
              `Purchase: ${money(
                sale.purchaseCost ??
                sale.cost
              )}`,
              `Fees: ${money(
                sale.fees
              )}`,
              `Postage: ${money(
                sale.postage
              )}`,
              `Other: ${money(
                sale.other
              )}`,
              `NET PROFIT: ${money(
                sale.netProfit ??
                sale.profit
              )}`,
              '----------------'
            ].join('\n');
          })
          .join('\n');

      alert(
        'SALES HISTORY\n\n' +
        lines
      );
    };

  window.renderInventory =
    render;

  function init() {
    document
      .getElementById(
        'stockFilterAll'
      )
      ?.addEventListener(
        'click',
        () => {
          filter = 'all';
          render();
        }
      );

    document
      .getElementById(
        'stockFilterOwned'
      )
      ?.addEventListener(
        'click',
        () => {
          filter = 'owned';
          render();
        }
      );

    document
      .getElementById(
        'stockFilterSaved'
      )
      ?.addEventListener(
        'click',
        () => {
          filter = 'saved';
          render();
        }
      );

    document
      .getElementById(
        'invSearch'
      )
      ?.addEventListener(
        'input',
        render
      );

    render();
    renderSalesDashboard();
  }

  window.addEventListener(
    'DOMContentLoaded',
    init
  );

})();