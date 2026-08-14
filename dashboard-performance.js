/* Beau's Reseller Hub — Dashboard & Performance Upgrade v1.0.0 */
(function () {
  'use strict';

  const SALES_KEY = 'beauSalesHistory';
  let cacheKey = '';
  let cached = null;

  const money = v => '$' + Math.round(Number(v) || 0);
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[c]));

  function readArray(key) {
    try {
      const v = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(v) ? v : [];
    } catch {
      return [];
    }
  }

  function getData() {
    const invRaw = localStorage.getItem('resellerInventory') || '[]';
    const salesRaw = localStorage.getItem(SALES_KEY) || '[]';
    const key = invRaw.length + ':' + salesRaw.length + ':' +
      invRaw.slice(-80) + ':' + salesRaw.slice(-80);

    if (key === cacheKey && cached) return cached;

    const inventory = readArray('resellerInventory');
    const sales = readArray(SALES_KEY);

    const stockUnits = inventory.reduce((s, x) => s + (Number(x.qty) || 1), 0);
    const stockCost = inventory.reduce((s, x) =>
      s + (Number(x.cost) || 0) * (Number(x.qty) || 1), 0);
    const potentialSales = inventory.reduce((s, x) =>
      s + (Number(x.sell || x.market) || 0) * (Number(x.qty) || 1), 0);
    const potentialProfit = potentialSales - stockCost;

    const todayKey = new Date().toLocaleDateString('en-AU');
    const todaySales = sales.filter(s => {
      if (!s.date) return false;
      return new Date(s.date).toLocaleDateString('en-AU') === todayKey;
    });

    const revenue = sales.reduce((s, x) => s + (Number(x.revenue) || 0), 0);
    const netProfit = sales.reduce((s, x) =>
      s + (Number(x.netProfit ?? x.profit) || 0), 0);
    const unitsSold = sales.reduce((s, x) =>
      s + (Number(x.quantity) || 0), 0);

    const todayRevenue = todaySales.reduce((s, x) =>
      s + (Number(x.revenue) || 0), 0);
    const todayProfit = todaySales.reduce((s, x) =>
      s + (Number(x.netProfit ?? x.profit) || 0), 0);
    const todayUnits = todaySales.reduce((s, x) =>
      s + (Number(x.quantity) || 0), 0);

    cached = {
      inventory, sales, stockUnits, stockCost, potentialSales, potentialProfit,
      revenue, netProfit, unitsSold, todayRevenue, todayProfit, todayUnits
    };
    cacheKey = key;
    return cached;
  }

  function ensureCard() {
    const dashboard = document.getElementById('dashboard');
    if (!dashboard) return null;

    let card = document.getElementById('businessDashboard');
    if (card) return card;

    card = document.createElement('section');
    card.id = 'businessDashboard';
    card.className = 'business-dashboard';
    card.innerHTML = `
      <div class="biz-header">
        <div>
          <h2>📊 Business Dashboard</h2>
          <p>Sales, profit and inventory at a glance.</p>
        </div>
        <span class="biz-badge">LIVE</span>
      </div>
      <div class="biz-grid">
        <div class="biz-card"><span>💰 SALES TODAY</span><strong id="bizTodayRevenue">$0</strong><small id="bizTodayUnits">0 items sold</small></div>
        <div class="biz-card"><span>📈 PROFIT TODAY</span><strong id="bizTodayProfit">$0</strong><small>Net profit</small></div>
        <div class="biz-card"><span>💵 ALL-TIME REVENUE</span><strong id="bizRevenue">$0</strong><small id="bizUnits">0 units sold</small></div>
        <div class="biz-card"><span>💎 ALL-TIME NET PROFIT</span><strong id="bizProfit">$0</strong><small>After recorded costs</small></div>
      </div>
      <div class="biz-two">
        <div class="biz-panel">
          <h3>📦 Inventory Position</h3>
          <div class="biz-row"><span>Stock units</span><b id="bizStockUnits">0</b></div>
          <div class="biz-row"><span>Money invested</span><b id="bizStockCost">$0</b></div>
          <div class="biz-row"><span>Estimated resale</span><b id="bizPotentialSales">$0</b></div>
          <div class="biz-row profit-row"><span>Potential profit</span><b id="bizPotentialProfit">$0</b></div>
        </div>
        <div class="biz-panel">
          <h3>⚡ Recent Sales</h3>
          <div id="bizRecentSales" class="biz-recent"></div>
        </div>
      </div>`;

    const snapshot = document.getElementById('snapshot')?.closest('.card');
    if (snapshot) snapshot.insertAdjacentElement('afterend', card);
    else dashboard.appendChild(card);
    return card;
  }

  function render() {
    if (!ensureCard()) return;
    const d = getData();
    const set = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
    set('bizTodayRevenue', money(d.todayRevenue));
    set('bizTodayProfit', money(d.todayProfit));
    set('bizTodayUnits', `${d.todayUnits} item${d.todayUnits === 1 ? '' : 's'} sold`);
    set('bizRevenue', money(d.revenue));
    set('bizProfit', money(d.netProfit));
    set('bizUnits', `${d.unitsSold} unit${d.unitsSold === 1 ? '' : 's'} sold`);
    set('bizStockUnits', d.stockUnits);
    set('bizStockCost', money(d.stockCost));
    set('bizPotentialSales', money(d.potentialSales));
    set('bizPotentialProfit', money(d.potentialProfit));

    const recent = document.getElementById('bizRecentSales');
    if (!recent) return;
    const rows = d.sales.slice().reverse().slice(0, 5);
    recent.innerHTML = rows.length ? rows.map(s => `
      <div class="biz-sale">
        <div><b>${esc(s.name || 'Unnamed game')}</b><small>${Number(s.quantity || 1)} unit${Number(s.quantity || 1) === 1 ? '' : 's'}</small></div>
        <div class="biz-sale-money"><b>${money(s.netProfit ?? s.profit)}</b><small>profit</small></div>
      </div>`).join('') : `<div class="biz-empty">No sales recorded yet.<br><span>Use 💵 Sell from Stock.</span></div>`;
  }

  function install() {
    if (typeof window.renderDashboard === 'function' && !window.__bizWrapped) {
      const original = window.renderDashboard;
      window.renderDashboard = function () {
        original();
        window.requestAnimationFrame(render);
      };
      window.__bizWrapped = true;
    }
    render();
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) { cacheKey = ''; render(); }
    });
    window.addEventListener('storage', () => { cacheKey = ''; render(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
  else install();
  window.BeauBusinessDashboard = { refresh: () => { cacheKey = ''; render(); } };
})();
